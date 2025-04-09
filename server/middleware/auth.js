
const jwt = require('jsonwebtoken');
const { users } = require('../db');

const auth = async (req, res, next) => {
  try {
    // Récupérer le token depuis le cookie ou l'en-tête Authorization
    const token = req.cookies.jwt || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Aucun token d\'authentification fourni');
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key-for-development');
      
      // Trouver l'utilisateur
      const user = await users.getById(decoded.id);
      
      if (!user) {
        console.log('Utilisateur non trouvé avec l\'id:', decoded.id);
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Définir l'utilisateur et le token sur l'objet de requête
      req.user = user;
      req.token = token;
      next();
    } catch (tokenError) {
      console.error('Erreur de vérification du token:', tokenError.message);
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Erreur du middleware d\'authentification:', error.message);
    res.status(500).json({ message: 'Erreur d\'authentification' });
  }
};

module.exports = auth;
