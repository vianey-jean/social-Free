
const express = require('express');
const jwt = require('jsonwebtoken');
const { users } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Fonction auxiliaire pour générer un token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';
  console.log(`Génération d'un token pour l'utilisateur ${userId} avec la clé secrète "${secret.substr(0, 3)}..."`);
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d'
  });
};

// Enregistrer un nouvel utilisateur
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, gender } = req.body;
    
    console.log('Tentative d\'inscription pour:', email);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await users.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }
    
    // Créer un nouvel utilisateur
    const newUser = await users.create({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender
    });
    
    // Générer un token
    const token = generateToken(newUser._id);
    
    // Définir le cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log('Utilisateur inscrit avec succès:', newUser._id);
    
    res.status(201).json({
      message: 'Utilisateur inscrit avec succès',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(400).json({ message: error.message });
  }
});

// Connecter un utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Tentative de connexion pour:', email);
    
    // Trouver l'utilisateur
    const user = await users.getByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await users.comparePassword(user._id, password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }
    
    // Mettre à jour le statut en ligne
    await users.update(user._id, {
      isOnline: true,
      lastActive: new Date()
    });
    
    // Générer un token
    const token = generateToken(user._id);
    
    // Définir le cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log('Utilisateur connecté avec succès:', user._id);
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await users.getById(user._id);
    
    res.json({
      message: 'Connexion réussie',
      user: updatedUser,
      token
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(400).json({ message: error.message });
  }
});

// Déconnecter un utilisateur
router.post('/logout', auth, async (req, res) => {
  try {
    // Mettre à jour le statut en ligne
    await users.update(req.user._id, {
      isOnline: false,
      lastActive: new Date()
    });
    
    // Effacer le cookie
    res.clearCookie('jwt');
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtenir l'utilisateur actuel
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Demande de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Demande de réinitialisation de mot de passe pour:', email);
    
    const user = await users.getByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Générer un token de réinitialisation (dans une vraie application, l'envoyer par email)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-fallback-secret-key-for-development', { expiresIn: '1h' });
    
    // Dans une vraie application, envoyer un email avec le lien de réinitialisation
    // Pour la démonstration, renvoyer simplement le token
    res.json({
      message: 'Email de réinitialisation de mot de passe envoyé',
      resetToken // Dans un environnement de production, supprimer ceci et envoyer via email
    });
  } catch (error) {
    console.error('Erreur de demande de réinitialisation de mot de passe:', error);
    res.status(500).json({ message: error.message });
  }
});

// Réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key-for-development');
    
    const user = await users.getById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour le mot de passe
    await users.update(user._id, { password });
    
    console.log('Réinitialisation du mot de passe réussie pour l\'utilisateur:', user._id);
    
    res.json({ message: 'Réinitialisation du mot de passe réussie' });
  } catch (error) {
    console.error('Erreur de réinitialisation de mot de passe:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
