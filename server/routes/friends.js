
const express = require('express');
const { users } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtenir les amis de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const allUsers = await users.getAll();
    const friends = allUsers
      .filter(user => req.user.friends.includes(user._id))
      .map(friend => ({
        _id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        avatar: friend.avatar,
        isOnline: friend.isOnline,
        lastActive: friend.lastActive
      }));
    
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir les demandes d'amitié
router.get('/requests', auth, async (req, res) => {
  try {
    const allUsers = await users.getAll();
    const requests = allUsers
      .filter(user => req.user.friendRequests.received.includes(user._id))
      .map(requester => ({
        _id: requester._id,
        firstName: requester.firstName,
        lastName: requester.lastName,
        avatar: requester.avatar
      }));
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Envoyer une demande d'amitié
router.post('/request/:id', auth, async (req, res) => {
  try {
    const recipient = await users.getById(req.params.id);
    
    if (!recipient) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si déjà amis
    if (req.user.friends.includes(recipient._id)) {
      return res.status(400).json({ message: 'Vous êtes déjà amis avec cet utilisateur' });
    }
    
    // Vérifier si la demande a déjà été envoyée
    if (req.user.friendRequests.sent.includes(recipient._id)) {
      return res.status(400).json({ message: 'Demande d\'amitié déjà envoyée' });
    }
    
    // Vérifier si le destinataire a déjà envoyé une demande
    if (req.user.friendRequests.received.includes(recipient._id)) {
      return res.status(400).json({ message: 'Cet utilisateur vous a déjà envoyé une demande d\'amitié' });
    }
    
    // Mettre à jour l'expéditeur
    const sentRequests = [...req.user.friendRequests.sent, recipient._id];
    await users.update(req.user._id, {
      friendRequests: {
        ...req.user.friendRequests,
        sent: sentRequests
      }
    });
    
    // Mettre à jour le destinataire
    const receivedRequests = [...recipient.friendRequests.received, req.user._id];
    await users.update(recipient._id, {
      friendRequests: {
        ...recipient.friendRequests,
        received: receivedRequests
      }
    });
    
    res.json({ message: 'Demande d\'amitié envoyée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accepter une demande d'amitié
router.post('/accept/:id', auth, async (req, res) => {
  try {
    const sender = await users.getById(req.params.id);
    
    if (!sender) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si la demande existe
    if (!req.user.friendRequests.received.includes(sender._id)) {
      return res.status(400).json({ message: 'Aucune demande d\'amitié de cet utilisateur' });
    }
    
    // Mettre à jour les deux utilisateurs
    
    // Pour le destinataire (l'utilisateur actuel)
    const updatedReceived = req.user.friendRequests.received.filter(id => id !== sender._id);
    const updatedUserFriends = [...req.user.friends, sender._id];
    
    await users.update(req.user._id, {
      friends: updatedUserFriends,
      friendRequests: {
        ...req.user.friendRequests,
        received: updatedReceived
      }
    });
    
    // Pour l'expéditeur
    const updatedSent = sender.friendRequests.sent.filter(id => id !== req.user._id);
    const updatedSenderFriends = [...sender.friends, req.user._id];
    
    await users.update(sender._id, {
      friends: updatedSenderFriends,
      friendRequests: {
        ...sender.friendRequests,
        sent: updatedSent
      }
    });
    
    res.json({ message: 'Demande d\'amitié acceptée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rejeter une demande d'amitié
router.post('/reject/:id', auth, async (req, res) => {
  try {
    const sender = await users.getById(req.params.id);
    
    if (!sender) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si la demande existe
    if (!req.user.friendRequests.received.includes(sender._id)) {
      return res.status(400).json({ message: 'Aucune demande d\'amitié de cet utilisateur' });
    }
    
    // Mettre à jour les deux utilisateurs
    
    // Pour le destinataire (l'utilisateur actuel)
    const updatedReceived = req.user.friendRequests.received.filter(id => id !== sender._id);
    
    await users.update(req.user._id, {
      friendRequests: {
        ...req.user.friendRequests,
        received: updatedReceived
      }
    });
    
    // Pour l'expéditeur
    const updatedSent = sender.friendRequests.sent.filter(id => id !== req.user._id);
    
    await users.update(sender._id, {
      friendRequests: {
        ...sender.friendRequests,
        sent: updatedSent
      }
    });
    
    res.json({ message: 'Demande d\'amitié rejetée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un ami
router.post('/remove/:id', auth, async (req, res) => {
  try {
    const friend = await users.getById(req.params.id);
    
    if (!friend) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si effectivement amis
    if (!req.user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Vous n\'êtes pas amis avec cet utilisateur' });
    }
    
    // Mettre à jour les deux utilisateurs
    
    // Pour l'utilisateur actuel
    const updatedUserFriends = req.user.friends.filter(id => id !== friend._id);
    
    await users.update(req.user._id, {
      friends: updatedUserFriends
    });
    
    // Pour l'ami
    const updatedFriendFriends = friend.friends.filter(id => id !== req.user._id);
    
    await users.update(friend._id, {
      friends: updatedFriendFriends
    });
    
    res.json({ message: 'Ami supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
