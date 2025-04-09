const express = require('express');
const router = express.Router();
const { users } = require('../db');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt with:", email);
    console.log("Password provided:", password ? "Yes" : "No");
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    const user = await users.getByEmail(email);
    
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }
    
    console.log("User found:", user._id);
    console.log("Stored password:", user.password);
    console.log("Provided password:", password);
    
    // Simple password comparison - no hashing
    if (password !== user.password) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }
    
    // Update online status
    await users.update(user._id, { isOnline: true });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-fallback-secret-key-for-development',
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax' 
    });
    
    // Send response without password
    const userResponse = { ...user };
    delete userResponse.password;
    
    console.log("Login successful for:", email);
    
    res.json({ 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Registration
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, email, password } = req.body;
    
    console.log("Registration attempt with:", email);
    
    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    // Check if email already exists
    const existingUser = await users.getByEmail(email);
    
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }
    
    // Create new user without hashing password
    const newUser = await users.create({
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      email,
      password: password, // Store plain text password
      isOnline: true
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'your-fallback-secret-key-for-development',
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Send response without password
    const userResponse = { ...newUser };
    delete userResponse.password;
    
    console.log("Registration successful for:", email);
    
    res.status(201).json({ 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Update online status
    await users.update(req.user._id, { isOnline: false, lastActive: new Date() });
    
    // Clear cookie
    res.clearCookie('jwt');
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // User is already verified and retrieved by the auth middleware
    // and is available in req.user
    console.log("Authenticated user:", req.user._id);
    res.json({ user: req.user });
  } catch (error) {
    console.error('Profile retrieval error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }
    
    const user = await users.getByEmail(email);
    
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password directly (without token)
router.post('/reset-password-direct', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email et nouveau mot de passe requis' });
    }
    
    const user = await users.getByEmail(email);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Update password without hashing
    await users.update(user._id, { password: newPassword });
    
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
