
const { users, posts, initDB } = require('./index');
const bcrypt = require('bcryptjs');
const faker = require('faker');
faker.locale = 'fr';

const USERS_COUNT = 40;
const PUBLIC_POSTS_PER_USER = 10;
const PRIVATE_POSTS_PER_USER = 10;
const COMMENTS_PER_POST = 5;
const LIKES_PROBABILITY = 0.7; // 70% chance for a user to like a post

async function seedDatabase() {
  console.log('Initialisation de la base de données...');
  await initDB();
  
  console.log('Suppression des données existantes...');
  await users.deleteAll();
  await posts.deleteAll();
  
  console.log(`Création de ${USERS_COUNT} utilisateurs...`);
  const userIds = [];
  
  // Créer les utilisateurs
  for (let i = 0; i < USERS_COUNT; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    
    const user = await users.create({
      firstName,
      lastName,
      email: faker.internet.email(firstName, lastName).toLowerCase(),
      password: await bcrypt.hash('password123', 10),
      dateOfBirth: faker.date.between('1970-01-01', '2000-12-31').toISOString().split('T')[0],
      gender,
      avatar: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${i % 100}.jpg`,
    });
    
    userIds.push(user._id);
    console.log(`Utilisateur créé: ${firstName} ${lastName} (${user._id})`);
  }
  
  console.log('Création des publications...');
  const postIds = [];
  
  // Créer les publications publiques et privées pour chaque utilisateur
  for (const userId of userIds) {
    // Publications publiques
    for (let i = 0; i < PUBLIC_POSTS_PER_USER; i++) {
      const post = await posts.create({
        user: userId,
        content: faker.lorem.paragraph(),
        images: Math.random() > 0.7 ? [
          faker.image.imageUrl(640, 480, 'nature', true),
          Math.random() > 0.5 ? faker.image.imageUrl(640, 480, 'city', true) : null
        ].filter(Boolean) : [],
        isPrivate: false,
        createdAt: faker.date.between('2023-01-01', new Date()).toISOString()
      });
      
      postIds.push(post._id);
    }
    
    // Publications privées
    for (let i = 0; i < PRIVATE_POSTS_PER_USER; i++) {
      const post = await posts.create({
        user: userId,
        content: faker.lorem.paragraph(),
        images: Math.random() > 0.7 ? [
          faker.image.imageUrl(640, 480, 'people', true)
        ] : [],
        isPrivate: true,
        createdAt: faker.date.between('2023-01-01', new Date()).toISOString()
      });
      
      postIds.push(post._id);
    }
  }
  
  console.log(`${postIds.length} publications créées. Ajout des commentaires et des likes...`);
  
  // Ajouter des commentaires et des likes aux publications
  for (const postId of postIds) {
    // Ajouter des commentaires
    const commentCount = Math.floor(Math.random() * COMMENTS_PER_POST);
    for (let i = 0; i < commentCount; i++) {
      const randomUserIndex = Math.floor(Math.random() * userIds.length);
      const commentUserId = userIds[randomUserIndex];
      
      await posts.addComment(postId, {
        user: commentUserId,
        content: faker.lorem.sentence()
      });
    }
    
    // Ajouter des likes
    for (const userId of userIds) {
      if (Math.random() < LIKES_PROBABILITY) {
        await posts.toggleLike(postId, userId);
      }
    }
  }
  
  // Créer des relations d'amitié entre les utilisateurs
  console.log('Création des relations d\'amitié...');
  for (const userId of userIds) {
    // Chaque utilisateur envoie des demandes d'amitié à ~30% des autres utilisateurs
    for (const potentialFriendId of userIds) {
      if (userId !== potentialFriendId && Math.random() < 0.3) {
        await users.sendFriendRequest(userId, potentialFriendId);
        
        // 80% des demandes sont acceptées
        if (Math.random() < 0.8) {
          await users.acceptFriendRequest(potentialFriendId, userId);
        }
      }
    }
  }
  
  console.log('Base de données remplie avec succès !');
}

// Exécuter la fonction de remplissage
seedDatabase()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors du remplissage de la base de données:', error);
    process.exit(1);
  });
