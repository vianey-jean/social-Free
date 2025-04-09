// Importation du module 'concurrently' qui permet d'exécuter plusieurs commandes en parallèle dans le terminal
const concurrently = require('concurrently');

// Appel de la fonction concurrently avec un tableau de processus et des options de configuration
concurrently([
  { 
    // Premier processus : exécute une série de commandes pour le backend
    // 1. Se déplacer dans le dossier 'server'
    // 2. Installer les dépendances backend avec npm install
    // 3. Démarrer le serveur backend avec npm run dev
    command: 'cd server && npm install && npm run dev',

    // Nom du processus (affiché dans les logs)
    name: 'BACKEND',

    // Couleur bleue pour les logs de ce processus
    prefixColor: 'blue'
  },
  { 
    // Deuxième processus : lance le frontend (React ou autre) via npm run dev
    command: 'npm run dev',

    // Nom du processus (affiché dans les logs)
    name: 'FRONTEND',

    // Couleur verte pour les logs de ce processus
    prefixColor: 'green'
  }
], {
  // Affiche le nom du processus (défini par 'name') en préfixe de chaque ligne de log
  prefix: 'name',

  // Si un processus échoue ou se termine avec succès, les autres sont automatiquement arrêtés
  killOthers: ['failure', 'success'],

  // Nombre maximum de tentatives de redémarrage pour un processus qui échoue
  restartTries: 3,

  // Délai (en millisecondes) entre chaque tentative de redémarrage
  restartDelay: 1000,
})
// Si tous les processus se terminent correctement, ce callback est exécuté
.then(
  () => console.log('All processes exited with success'),

  // Si un ou plusieurs processus échouent, ce callback est exécuté avec l'objet erreur
  (error) => console.error('One or more processes failed', error)
);
