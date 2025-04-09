
const fs = require('fs').promises;
const path = require('path');

// Créer des répertoires de test temporaires
async function setupTestEnvironment() {
  const testDir = path.join(__dirname, '../db/test-data');
  
  try {
    await fs.access(testDir);
    // Si le répertoire existe, le nettoyer
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Le répertoire n'existe pas, c'est OK
  }
  
  // Créer un nouveau répertoire propre
  await fs.mkdir(testDir, { recursive: true });
  
  // Initialiser les fichiers de test
  await fs.writeFile(path.join(testDir, 'users.json'), '[]');
  await fs.writeFile(path.join(testDir, 'posts.json'), '[]');
  await fs.writeFile(path.join(testDir, 'chats.json'), '[]');
  
  console.log('Environnement de test initialisé');
}

// Nettoyer après les tests
async function cleanupTestEnvironment() {
  const testDir = path.join(__dirname, '../db/test-data');
  
  try {
    await fs.rm(testDir, { recursive: true, force: true });
    console.log('Environnement de test nettoyé');
  } catch (error) {
    console.error('Erreur lors du nettoyage des fichiers de test:', error);
  }
}

module.exports = {
  setupTestEnvironment,
  cleanupTestEnvironment
};
