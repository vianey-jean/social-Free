
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const friendRoutes = require('./routes/friends');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Définir les origines autorisées
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
];

// Configuration CORS améliorée
app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origine (comme les applications mobiles ou les requêtes curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS bloqué pour l\'origine:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Appliquer les middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialiser la base de données locale
(async () => {
  try {
    await initDB();
    console.log('Base de données initialisée');
  } catch (error) {
    console.error('Erreur d\'initialisation de la base de données:', error);
    process.exit(1);
  }
})();

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);

// Tests pour vérifier l'activité du serveur
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Le serveur fonctionne correctement' });
});

// Middleware de journalisation des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur s\'est produite sur le serveur' });
});

// Démarrer le serveur uniquement si ce n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  });
}

// Exporter pour les tests
module.exports = app;
