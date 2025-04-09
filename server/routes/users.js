const express = require('express');
const { users } = require('../db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Obtenir les utilisateurs en ligne et hors ligne
router.get('/online', auth, async (req, res) => {
  try {
    const allUsers = await users.getAll();
    
    // Update current user's online status
    await users.update(req.user._id, { isOnline: true, lastActive: new Date() });
    
    // Consider users active if they were active in the last 5 minutes
    const activeTimeThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    const usersWithStatus = allUsers.map(user => {
      const isRecentlyActive = user.lastActive && 
        (new Date() - new Date(user.lastActive) < activeTimeThreshold);
      
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isOnline: user.isOnline || isRecentlyActive
      };
    });
    
    res.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rechercher des utilisateurs
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({ message: 'La requête de recherche doit comporter au moins 3 caractères' });
    }
    
    const allUsers = await users.getAll();
    const queryLower = query.toLowerCase();
    
    const searchResults = allUsers.filter(user => {
      return (
        user.firstName.toLowerCase().includes(queryLower) ||
        user.lastName.toLowerCase().includes(queryLower) ||
        user.email.toLowerCase().includes(queryLower)
      );
    }).map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar
    }));
    
    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir le profil d'un utilisateur
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await users.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier le statut d'amitié
    let friendshipStatus = 'none';
    
    if (req.user.friends && req.user.friends.includes(user._id)) {
      friendshipStatus = 'friends';
    } else if (req.user.friendRequests && req.user.friendRequests.sent && req.user.friendRequests.sent.includes(user._id)) {
      friendshipStatus = 'pending_sent';
    } else if (req.user.friendRequests && req.user.friendRequests.received && req.user.friendRequests.received.includes(user._id)) {
      friendshipStatus = 'pending_received';
    }
    
    // Ne pas envoyer le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      friendshipStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour le profil utilisateur
router.patch('/profile', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'gender'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Mises à jour invalides' });
    }
    
    const updatedUser = await users.update(req.user._id, req.body);
    
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Télécharger un avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Veuillez télécharger une image' });
    }
    
    const avatarPath = `/uploads/${req.file.filename}`;
    const updatedUser = await users.update(req.user._id, { avatar: avatarPath });
    
    res.json({
      message: 'Avatar téléchargé avec succès',
      avatar: updatedUser.avatar
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set user status (online/offline)
router.post('/status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    const updatedUser = await users.update(req.user._id, { 
      isOnline: !!isOnline, 
      lastActive: new Date() 
    });
    
    res.json({
      message: `Statut mis à jour: ${isOnline ? 'en ligne' : 'hors ligne'}`,
      isOnline: updatedUser.isOnline
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
