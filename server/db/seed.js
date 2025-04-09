
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { initDB, users, posts } = require('./index');

// URLs d'images aléatoires pour les avatars et les publications
const AVATAR_URLS = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
];

const POST_IMAGE_URLS = [
  'https://picsum.photos/seed/post1/800/600',
  'https://picsum.photos/seed/post2/800/600',
  'https://picsum.photos/seed/post3/800/600',
  'https://picsum.photos/seed/post4/800/600',
  'https://picsum.photos/seed/post5/800/600',
  'https://picsum.photos/seed/post6/800/600',
  'https://picsum.photos/seed/post7/800/600',
  'https://picsum.photos/seed/post8/800/600',
];

// Données pour les utilisateurs
const userData = [
  { firstName: 'Jean', lastName: 'Dupont', gender: 'male', birthYear: 1985 },
  { firstName: 'Marie', lastName: 'Martin', gender: 'female', birthYear: 1990 },
  { firstName: 'Pierre', lastName: 'Bernard', gender: 'male', birthYear: 1978 },
  { firstName: 'Sophie', lastName: 'Petit', gender: 'female', birthYear: 1992 },
  { firstName: 'Thomas', lastName: 'Robert', gender: 'male', birthYear: 1982 },
  { firstName: 'Julie', lastName: 'Richard', gender: 'female', birthYear: 1989 },
  { firstName: 'Nicolas', lastName: 'Moreau', gender: 'male', birthYear: 1975 },
  { firstName: 'Émilie', lastName: 'Simon', gender: 'female', birthYear: 1995 },
  { firstName: 'Antoine', lastName: 'Laurent', gender: 'male', birthYear: 1980 },
  { firstName: 'Camille', lastName: 'Michel', gender: 'female', birthYear: 1993 },
  { firstName: 'Alexandre', lastName: 'Leroy', gender: 'male', birthYear: 1977 },
  { firstName: 'Chloé', lastName: 'Roux', gender: 'female', birthYear: 1991 },
  { firstName: 'François', lastName: 'David', gender: 'male', birthYear: 1983 },
  { firstName: 'Lucie', lastName: 'Bertrand', gender: 'female', birthYear: 1988 },
  { firstName: 'Maxime', lastName: 'Vincent', gender: 'male', birthYear: 1979 },
  { firstName: 'Manon', lastName: 'Fournier', gender: 'female', birthYear: 1994 },
  { firstName: 'Philippe', lastName: 'Morel', gender: 'male', birthYear: 1981 },
  { firstName: 'Clara', lastName: 'Girard', gender: 'female', birthYear: 1987 },
  { firstName: 'Julien', lastName: 'Bonnet', gender: 'male', birthYear: 1976 },
  { firstName: 'Aurélie', lastName: 'Lambert', gender: 'female', birthYear: 1996 },
  { firstName: 'Mathieu', lastName: 'Fontaine', gender: 'male', birthYear: 1984 },
  { firstName: 'Céline', lastName: 'Rousseau', gender: 'female', birthYear: 1990 },
  { firstName: 'Sébastien', lastName: 'Mercier', gender: 'male', birthYear: 1978 },
  { firstName: 'Sarah', lastName: 'Blanc', gender: 'female', birthYear: 1992 },
  { firstName: 'Olivier', lastName: 'Guerin', gender: 'male', birthYear: 1982 },
  { firstName: 'Pauline', lastName: 'Perrin', gender: 'female', birthYear: 1989 },
  { firstName: 'Guillaume', lastName: 'Faure', gender: 'male', birthYear: 1975 },
  { firstName: 'Audrey', lastName: 'Roussel', gender: 'female', birthYear: 1995 },
  { firstName: 'Romain', lastName: 'Henry', gender: 'male', birthYear: 1980 },
  { firstName: 'Caroline', lastName: 'Gautier', gender: 'female', birthYear: 1993 },
  { firstName: 'Loïc', lastName: 'Durand', gender: 'male', birthYear: 1977 },
  { firstName: 'Marion', lastName: 'Andre', gender: 'female', birthYear: 1991 },
  { firstName: 'David', lastName: 'Lefebvre', gender: 'male', birthYear: 1983 },
  { firstName: 'Mathilde', lastName: 'Garcia', gender: 'female', birthYear: 1988 },
  { firstName: 'Florian', lastName: 'Masson', gender: 'male', birthYear: 1979 },
  { firstName: 'Mélanie', lastName: 'Colin', gender: 'female', birthYear: 1994 },
  { firstName: 'Benoît', lastName: 'Brun', gender: 'male', birthYear: 1981 },
  { firstName: 'Laurence', lastName: 'Chevalier', gender: 'female', birthYear: 1987 },
  { firstName: 'Michel', lastName: 'Leroux', gender: 'male', birthYear: 1976 },
  { firstName: 'Nathalie', lastName: 'Renaud', gender: 'female', birthYear: 1986 }
];

// Contenus de publication
const postContents = [
  "J'ai passé un super weekend à la montagne ! Les paysages étaient magnifiques. #montagne #nature",
  "Nouveau projet en cours, très excité de vous montrer les résultats bientôt ! #travail #innovation",
  "Recette du jour : lasagnes maison. Simple mais délicieux ! #cuisine #recette",
  "Concert incroyable hier soir, quelle ambiance ! #musique #concert",
  "Première journée au nouveau travail. Équipe super accueillante ! #travail #nouveaudépart",
  "Road trip en préparation pour cet été. Des suggestions d'itinéraires ? #voyage #roadtrip",
  "Journée sportive : 10km de course à pied ce matin. Fatigué mais heureux ! #sport #running",
  "Lecture du moment : 'Sapiens' de Yuval Noah Harari. Fascinant ! #lecture #livre",
  "Séance cinéma en famille aujourd'hui. Film génial ! #cinema #famille",
  "Visite du musée d'art moderne hier. Exposition incroyable. #art #culture",
  "Nouveau gadget tech : tellement pratique au quotidien ! #technologie #innovation",
  "Randonnée dans le parc national : paysages à couper le souffle ! #nature #randonnée",
  "Cuisine expérimentale ce weekend : test d'une recette asiatique. #cuisine #asiatique",
  "Moment détente : méditation au lever du soleil. Parfait pour commencer la journée. #bienêtre #méditation",
  "Anniversaire surprise pour mon meilleur ami. Sa réaction était géniale ! #amitié #fête",
  "Nouveau café découvert dans le quartier. Le meilleur espresso ! #café #découverte",
  "Rénovation de la maison : la cuisine est enfin terminée ! #déco #bricolage",
  "Sortie en mer aujourd'hui : dauphins aperçus ! Moment magique. #mer #animaux",
  "Formation professionnelle cette semaine. Tant de choses à apprendre ! #formation #carrière",
  "Soirée jeux de société entre amis. Fou rire garanti ! #jeuxdesociété #amis"
];

// Commentaires
const comments = [
  "Superbe photo ! J'adore 😍",
  "Félicitations ! C'est une super nouvelle !",
  "Ça a l'air délicieux, tu pourrais partager la recette ?",
  "Trop cool ! J'aimerais y aller aussi !",
  "Merci pour ce partage, c'est très inspirant.",
  "Je suis totalement d'accord avec toi !",
  "C'est vraiment impressionnant !",
  "Tu as bien raison, profite bien !",
  "Ça me donne envie d'essayer aussi !",
  "Génial ! Continue comme ça !",
  "J'ai eu la même expérience récemment.",
  "C'est exactement ce dont j'avais besoin aujourd'hui.",
  "Quelle chance ! Profite bien de ce moment.",
  "Je te suis dans cette aventure !",
  "C'est toujours un plaisir de voir tes publications.",
  "Tu as beaucoup de talent !",
  "Très belle perspective, merci pour ce partage.",
  "Ça me rappelle de bons souvenirs.",
  "J'aimerais avoir ton avis sur ce sujet.",
  "Tu m'as donné une super idée !"
];

// Fonction pour télécharger les images
async function downloadImage(url, localPath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });
    
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(response.data));
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du téléchargement de l'image ${url}:`, error.message);
    return false;
  }
}

// Fonction principale pour initialiser la base de données avec des données fictives
async function seedDatabase() {
  console.log("Initialisation de la base de données...");
  
  // Initialiser la base de données
  await initDB();
  
  // Créer le dossier pour les images téléchargées
  const uploadsDir = path.join(__dirname, '../public/uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  
  console.log("Téléchargement des avatars...");
  // Télécharger les avatars
  const avatarPaths = [];
  for (let i = 0; i < AVATAR_URLS.length; i++) {
    const localPath = path.join(uploadsDir, `avatar-${i + 1}.jpg`);
    const success = await downloadImage(AVATAR_URLS[i], localPath);
    if (success) {
      avatarPaths.push(`/uploads/avatar-${i + 1}.jpg`);
    }
  }
  
  console.log("Téléchargement des images pour les publications...");
  // Télécharger les images pour les publications
  const postImagePaths = [];
  for (let i = 0; i < POST_IMAGE_URLS.length; i++) {
    const localPath = path.join(uploadsDir, `post-image-${i + 1}.jpg`);
    const success = await downloadImage(POST_IMAGE_URLS[i], localPath);
    if (success) {
      postImagePaths.push(`/uploads/post-image-${i + 1}.jpg`);
    }
  }
  
  console.log("Création des utilisateurs...");
  // Créer les utilisateurs
  const createdUsers = [];
  for (let i = 0; i < userData.length; i++) {
    const user = userData[i];
    const avatarIndex = i % avatarPaths.length;
    
    try {
      const newUser = await users.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@example.com`,
        password: 'password123',
        dateOfBirth: new Date(user.birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: user.gender,
        avatar: avatarPaths[avatarIndex]
      });
      
      createdUsers.push(newUser);
      console.log(`Utilisateur créé: ${newUser.firstName} ${newUser.lastName}`);
    } catch (error) {
      console.error(`Erreur lors de la création de l'utilisateur ${user.firstName} ${user.lastName}:`, error.message);
    }
  }
  
  // Ajouter des amis aléatoires
  console.log("Ajout d'amis entre utilisateurs...");
  for (const user of createdUsers) {
    // Choisir un nombre aléatoire d'amis pour chaque utilisateur
    const friendCount = Math.floor(Math.random() * 15) + 5; // Entre 5 et 20 amis
    const potentialFriends = createdUsers.filter(u => u._id !== user._id);
    
    const shuffled = [...potentialFriends].sort(() => 0.5 - Math.random());
    const selectedFriends = shuffled.slice(0, friendCount);
    
    for (const friend of selectedFriends) {
      try {
        // Vérifier si l'amitié existe déjà
        if (!user.friends.includes(friend._id)) {
          await users.update(user._id, {
            friends: [...user.friends, friend._id]
          });
          
          // Ajouter l'amitié dans l'autre sens également
          if (!friend.friends.includes(user._id)) {
            await users.update(friend._id, {
              friends: [...friend.friends, user._id]
            });
          }
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout d'ami entre ${user.firstName} et ${friend.firstName}:`, error.message);
      }
    }
  }
  
  console.log("Création des publications...");
  // Créer les publications (10 publiques et 10 privées)
  const createdPosts = [];
  
  // Créer 10 publications publiques
  for (let i = 0; i < 10; i++) {
    const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
    const user = createdUsers[randomUserIndex];
    const contentIndex = i % postContents.length;
    const useImage = Math.random() > 0.3; // 70% de chance d'avoir une image
    
    const images = [];
    if (useImage) {
      const randomImageIndex = Math.floor(Math.random() * postImagePaths.length);
      images.push(postImagePaths[randomImageIndex]);
    }
    
    try {
      const newPost = await posts.create({
        user: user._id,
        content: postContents[contentIndex],
        images,
        isPrivate: false
      });
      
      createdPosts.push(newPost);
      console.log(`Publication publique créée par ${user.firstName}`);
    } catch (error) {
      console.error(`Erreur lors de la création d'une publication publique:`, error.message);
    }
  }
  
  // Créer 10 publications privées
  for (let i = 0; i < 10; i++) {
    const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
    const user = createdUsers[randomUserIndex];
    const contentIndex = (i + 10) % postContents.length;
    const useImage = Math.random() > 0.3; // 70% de chance d'avoir une image
    
    const images = [];
    if (useImage) {
      const randomImageIndex = Math.floor(Math.random() * postImagePaths.length);
      images.push(postImagePaths[randomImageIndex]);
    }
    
    try {
      const newPost = await posts.create({
        user: user._id,
        content: postContents[contentIndex],
        images,
        isPrivate: true
      });
      
      createdPosts.push(newPost);
      console.log(`Publication privée créée par ${user.firstName}`);
    } catch (error) {
      console.error(`Erreur lors de la création d'une publication privée:`, error.message);
    }
  }
  
  console.log("Ajout de j'aimes et commentaires aux publications...");
  // Ajouter des j'aimes et des commentaires aléatoires aux publications
  for (const post of createdPosts) {
    // Ajouter des j'aimes
    const likeCount = Math.floor(Math.random() * 20) + 1; // Entre 1 et 20 j'aimes
    const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
    const likingUsers = shuffledUsers.slice(0, likeCount);
    
    const likes = likingUsers.map(u => u._id);
    
    // Ajouter des commentaires
    const commentCount = Math.floor(Math.random() * 5) + 1; // Entre 1 et 5 commentaires
    const commentingUsers = shuffledUsers.slice(0, commentCount);
    
    const postComments = [];
    for (let i = 0; i < commentCount; i++) {
      const user = commentingUsers[i];
      const commentIndex = Math.floor(Math.random() * comments.length);
      
      postComments.push({
        user: user._id,
        content: comments[commentIndex]
      });
    }
    
    try {
      await posts.update(post._id, {
        likes,
        comments: postComments
      });
      
      console.log(`Ajouté ${likes.length} j'aimes et ${postComments.length} commentaires à une publication`);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de j'aimes et commentaires:`, error.message);
    }
  }
  
  console.log("Initialisation de la base de données terminée avec succès !");
  console.log(`${createdUsers.length} utilisateurs créés`);
  console.log(`${createdPosts.length} publications créées`);
  console.log("Vous pouvez maintenant vous connecter avec n'importe quel utilisateur créé.");
  console.log("Email: prenom.nom@example.com | Mot de passe: password123");
}

// Exécuter la fonction d'initialisation
seedDatabase().catch(error => {
  console.error("Erreur lors de l'initialisation de la base de données:", error);
});
