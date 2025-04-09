
const express = require('express');
const { chats, users } = require('../db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Ensure chat uploads directory exists
const chatUploadsDir = path.join(__dirname, '../uploads/chat');
fs.mkdir(chatUploadsDir, { recursive: true }).catch(err => {
  console.error('Failed to create chat uploads directory:', err);
});

// Obtenir tous les chats de l'utilisateur actuel
router.get('/', auth, async (req, res) => {
  try {
    const userChats = await chats.getUserChats(req.user._id);
    
    // Obtenir les informations détaillées des utilisateurs
    const allUsers = await users.getAll();
    const usersMap = {};
    allUsers.forEach(user => {
      usersMap[user._id] = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isOnline: user.isOnline
      };
    });
    
    // Formater les chats pour le frontend
    const formattedChats = userChats.map(chat => {
      const otherParticipants = chat.participants
        .filter(p => p !== req.user._id)
        .map(p => usersMap[p] || { _id: p });
      
      // Obtenir le nombre de messages non lus
      const unreadCount = chat.messages.filter(
        msg => !msg.read && msg.sender !== req.user._id
      ).length;
      
      // Obtenir le dernier message
      let lastMessage = null;
      if (chat.messages.length > 0) {
        const message = chat.messages[chat.messages.length - 1];
        lastMessage = {
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
          read: message.read,
          attachment: message.attachment
        };
      }
      
      return {
        id: chat._id,
        participants: chat.participants.map(p => usersMap[p] || { _id: p }),
        otherParticipants,
        unreadCount,
        lastMessage,
        updatedAt: chat.updatedAt
      };
    });
    
    // Trier par date de mise à jour (du plus récent au plus ancien)
    formattedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json(formattedChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir ou créer un chat avec un utilisateur
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Vérifier si l'utilisateur existe
    const user = await users.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Trouver un chat existant
    let chat = await chats.getByParticipants(req.user._id, userId);
    
    // Si aucun chat n'existe, en créer un
    if (!chat) {
      chat = await chats.create({
        participants: [req.user._id, userId]
      });
    }
    
    // Obtenir les informations détaillées des utilisateurs
    const allUsers = await users.getAll();
    const usersMap = {};
    allUsers.forEach(user => {
      usersMap[user._id] = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isOnline: user.isOnline
      };
    });
    
    // Formatter le chat avec les informations des utilisateurs
    const formattedChat = {
      ...chat,
      participants: chat.participants.map(p => usersMap[p] || { _id: p }),
      messages: chat.messages.map(msg => ({
        ...msg,
        sender: usersMap[msg.sender] || { _id: msg.sender }
      }))
    };
    
    res.json(formattedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADDED: New route to send a message directly to a user (creates chat if needed)
router.post('/user/:userId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.params.userId;
    
    if (!content) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await users.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Trouver ou créer un chat
    let chat = await chats.getByParticipants(req.user._id, userId);
    
    if (!chat) {
      chat = await chats.create({
        participants: [req.user._id, userId]
      });
    }
    
    // Ajouter le message
    const message = {
      sender: req.user._id,
      content
    };
    
    const newMessage = await chats.addMessage(chat._id, message);
    
    // Ajouter les informations d'utilisateur au message pour la réponse
    const messageWithUser = {
      ...newMessage,
      sender: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar
      }
    };
    
    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
});

// Envoyer un message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }
    
    const chat = await chats.getById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Non autorisé à envoyer des messages dans ce chat' });
    }
    
    const message = {
      sender: req.user._id,
      content
    };
    
    const newMessage = await chats.addMessage(req.params.chatId, message);
    
    // Ajouter les informations d'utilisateur au message pour la réponse
    const messageWithUser = {
      ...newMessage,
      sender: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar
      }
    };
    
    res.status(201).json(messageWithUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload file to chat
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }
    
    const chatId = req.body.chatId;
    
    // Get chat
    const chat = await chats.getById(chatId);
    if (!chat) {
      // If the chatId is a user ID, try to create/get a chat with that user
      const user = await users.getById(chatId);
      if (!user) {
        return res.status(404).json({ message: 'Chat ou utilisateur non trouvé' });
      }
      
      let existingChat = await chats.getByParticipants(req.user._id, chatId);
      
      if (!existingChat) {
        existingChat = await chats.create({
          participants: [req.user._id, chatId]
        });
      }
      
      chat = existingChat;
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Non autorisé à envoyer des messages dans ce chat' });
    }
    
    // Determine file type
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'file';
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
      fileType = 'image';
    } else if (['.mp4', '.webm', '.ogg', '.mov'].includes(fileExt)) {
      fileType = 'video';
    } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExt)) {
      fileType = 'audio';
    }
    
    const filePath = `/uploads/${req.file.filename}`;
    
    // Create message with attachment
    const message = {
      sender: req.user._id,
      content: fileType === 'image' ? '📷 Image' : 
               fileType === 'video' ? '🎥 Vidéo' : 
               fileType === 'audio' ? '🎵 Audio' : '📎 Fichier',
      attachment: {
        type: fileType,
        url: filePath,
        name: req.file.originalname
      }
    };
    
    const newMessage = await chats.addMessage(chat._id, message);
    
    res.status(201).json({
      ...newMessage,
      sender: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar
      }
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Marquer les messages comme lus
router.patch('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await chats.getById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Non autorisé à accéder à ce chat' });
    }
    
    // Marquer les messages des autres participants comme lus
    await chats.markAsRead(req.params.chatId, req.user._id);
    
    res.json({ message: 'Messages marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
