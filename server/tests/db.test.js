
const { users, posts, chats, initDB } = require('../db');
const fs = require('fs').promises;
const path = require('path');

// Chemins de test
const testDir = path.join(__dirname, '../db/test-data');
const testUsersPath = path.join(testDir, 'users.json');
const testPostsPath = path.join(testDir, 'posts.json');
const testChatsPath = path.join(testDir, 'chats.json');

// Configuration des tests
beforeAll(async () => {
  // Créer le répertoire de test s'il n'existe pas
  try {
    await fs.access(testDir);
  } catch (error) {
    await fs.mkdir(testDir, { recursive: true });
  }
  
  // Initialiser les fichiers de test
  await fs.writeFile(testUsersPath, '[]');
  await fs.writeFile(testPostsPath, '[]');
  await fs.writeFile(testChatsPath, '[]');
  
  // Initialiser la base de données
  await initDB();
});

// Nettoyer après les tests
afterAll(async () => {
  try {
    await fs.rm(testDir, { recursive: true });
  } catch (error) {
    console.error('Erreur lors du nettoyage des fichiers de test:', error);
  }
});

describe('Base de données locale', () => {
  // Tests pour les utilisateurs
  describe('Utilisateurs', () => {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male'
    };

    it('devrait créer un nouvel utilisateur', async () => {
      const user = await users.create(testUser);
      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.firstName).toBe(testUser.firstName);
      expect(user.email).toBe(testUser.email);
      expect(user.password).toBeUndefined(); // Le mot de passe ne doit pas être renvoyé
    });

    it('devrait récupérer un utilisateur par email', async () => {
      const user = await users.getByEmail(testUser.email);
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it('devrait mettre à jour un utilisateur', async () => {
      const allUsers = await users.getAll();
      const userId = allUsers[0]._id;
      
      const updatedUser = await users.update(userId, { firstName: 'Updated' });
      expect(updatedUser).toBeDefined();
      expect(updatedUser.firstName).toBe('Updated');
    });

    it('devrait vérifier correctement le mot de passe', async () => {
      const allUsers = await users.getAll();
      const userId = allUsers[0]._id;
      
      const isMatch = await users.comparePassword(userId, 'password123');
      expect(isMatch).toBe(true);
      
      const isWrong = await users.comparePassword(userId, 'wrongpassword');
      expect(isWrong).toBe(false);
    });
  });

  // Tests pour les posts
  describe('Posts', () => {
    let userId;
    
    beforeAll(async () => {
      const allUsers = await users.getAll();
      userId = allUsers[0]._id;
    });

    it('devrait créer un nouveau post', async () => {
      const postData = {
        user: userId,
        content: 'Test post content',
        images: [],
        isPrivate: false
      };
      
      const post = await posts.create(postData);
      expect(post).toBeDefined();
      expect(post._id).toBeDefined();
      expect(post.content).toBe(postData.content);
      expect(post.user).toBe(userId);
    });

    it('devrait récupérer les posts d\'un utilisateur', async () => {
      const userPosts = await posts.getByUser(userId);
      expect(userPosts).toBeDefined();
      expect(userPosts.length).toBeGreaterThan(0);
      expect(userPosts[0].user).toBe(userId);
    });

    it('devrait ajouter un commentaire à un post', async () => {
      const allPosts = await posts.getAll();
      const postId = allPosts[0]._id;
      
      const comment = {
        user: userId,
        content: 'Test comment'
      };
      
      const newComment = await posts.addComment(postId, comment);
      expect(newComment).toBeDefined();
      expect(newComment._id).toBeDefined();
      expect(newComment.content).toBe(comment.content);
      
      // Vérifier que le commentaire a été ajouté au post
      const updatedPost = await posts.getById(postId);
      expect(updatedPost.comments.length).toBe(1);
      expect(updatedPost.comments[0].content).toBe(comment.content);
    });

    it('devrait ajouter/retirer un like', async () => {
      const allPosts = await posts.getAll();
      const postId = allPosts[0]._id;
      
      // Ajouter un like
      const likeResult = await posts.toggleLike(postId, userId);
      expect(likeResult).toBeDefined();
      expect(likeResult.likes).toBe(1);
      expect(likeResult.liked).toBe(true);
      
      // Vérifier le post
      const updatedPost = await posts.getById(postId);
      expect(updatedPost.likes).toContain(userId);
      
      // Retirer le like
      const unlikeResult = await posts.toggleLike(postId, userId);
      expect(unlikeResult.likes).toBe(0);
      expect(unlikeResult.liked).toBe(false);
    });
  });

  // Tests pour les chats
  describe('Chats', () => {
    let userId1, userId2;
    
    beforeAll(async () => {
      // Créer un deuxième utilisateur pour les tests de chat
      const testUser2 = {
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        password: 'password123',
        dateOfBirth: new Date('1995-05-05'),
        gender: 'female'
      };
      
      await users.create(testUser2);
      
      const allUsers = await users.getAll();
      userId1 = allUsers[0]._id;
      userId2 = allUsers[1]._id;
    });

    it('devrait créer un nouveau chat', async () => {
      const chatData = {
        participants: [userId1, userId2]
      };
      
      const chat = await chats.create(chatData);
      expect(chat).toBeDefined();
      expect(chat._id).toBeDefined();
      expect(chat.participants).toContain(userId1);
      expect(chat.participants).toContain(userId2);
      expect(chat.messages.length).toBe(0);
    });

    it('devrait récupérer un chat par participants', async () => {
      const chat = await chats.getByParticipants(userId1, userId2);
      expect(chat).toBeDefined();
      expect(chat.participants).toContain(userId1);
      expect(chat.participants).toContain(userId2);
    });

    it('devrait ajouter un message à un chat', async () => {
      const allChats = await chats.getAll();
      const chatId = allChats[0]._id;
      
      const message = {
        sender: userId1,
        content: 'Hello there!'
      };
      
      const newMessage = await chats.addMessage(chatId, message);
      expect(newMessage).toBeDefined();
      expect(newMessage._id).toBeDefined();
      expect(newMessage.content).toBe(message.content);
      expect(newMessage.read).toBe(false);
      
      // Vérifier que le message a été ajouté au chat
      const updatedChat = await chats.getById(chatId);
      expect(updatedChat.messages.length).toBe(1);
      expect(updatedChat.messages[0].content).toBe(message.content);
    });

    it('devrait marquer les messages comme lus', async () => {
      const allChats = await chats.getAll();
      const chatId = allChats[0]._id;
      
      // Ajouter un message de l'utilisateur 2
      await chats.addMessage(chatId, {
        sender: userId2,
        content: 'Hi back!'
      });
      
      // Marquer comme lu par l'utilisateur 1
      const result = await chats.markAsRead(chatId, userId1);
      expect(result).toBe(true);
      
      // Vérifier que le message est marqué comme lu
      const updatedChat = await chats.getById(chatId);
      const message = updatedChat.messages.find(m => m.sender === userId2);
      expect(message.read).toBe(true);
    });
  });
});
