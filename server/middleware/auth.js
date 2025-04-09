
const jwt = require('jsonwebtoken');
const { users } = require('../db');

const auth = async (req, res, next) => {
  try {
    // Get token from cookie, Authorization header, or request body
    let token = req.cookies.jwt || req.header('Authorization')?.replace('Bearer ', '');
    
    // Check for token in request body (useful for testing)
    if (!token && req.body && req.body.token) {
      token = req.body.token;
    }
    
    if (!token) {
      console.log('No authentication token provided');
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    try {
      // Verify token
      const secretKey = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';
      
      const decoded = jwt.verify(token, secretKey);
      console.log('Decoded token:', decoded);
      
      // Find user
      const user = await users.getById(decoded.id);
      
      if (!user) {
        console.log('User not found with id:', decoded.id);
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Set user and token on request object
      req.user = user;
      req.token = token;
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.message);
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    res.status(500).json({ message: 'Erreur d\'authentification' });
  }
};

module.exports = auth;
