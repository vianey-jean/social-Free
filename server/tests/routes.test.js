
const request = require('supertest');
const app = require('../server');
const { users, posts, chats, initDB } = require('../db');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour générer un token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-fallback-secret-key-for-development', {
    expiresIn: '7d'
  });
};

// Configuration des tests
let testUser, testUser2, testPost, testToken, testToken2;

beforeAll(async () => {
  // Initialiser la base de données
  await initDB();
  
  // Créer des utilisateurs de test
  testUser = await users.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male'
  });
  
  testUser2 = await users.create({
    firstName: 'Another',
    lastName: 'User',
    email: 'another@example.com',
    password: 'password123',
    dateOfBirth: new Date('1995-05-05'),
    gender: 'female'
  });
  
  // Générer des tokens
  testToken = generateToken(testUser._id);
  testToken2 = generateToken(testUser2._id);
  
  // Créer un post de test
  testPost = await posts.create({
    user: testUser._id,
    content: 'Test post content',
    isPrivate: false
  });
});

describe('Tests des routes d\'authentification', () => {
  it('devrait inscrire un nouvel utilisateur', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'password123',
        dateOfBirth: '2000-01-01',
        gender: 'male'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('new@example.com');
  });
  
  it('devrait connecter un utilisateur existant', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.isOnline).toBe(true);
  });
  
  it('devrait récupérer le profil de l\'utilisateur actuel', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user._id).toBe(testUser._id);
  });
  
  it('devrait déconnecter un utilisateur', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Déconnexion réussie');
    
    // Vérifier que l'utilisateur est maintenant hors ligne
    const updatedUser = await users.getById(testUser._id);
    expect(updatedUser.isOnline).toBe(false);
  });
});

describe('Tests des routes des publications', () => {
  it('devrait créer une nouvelle publication', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`])
      .send({
        content: 'This is a test post',
        isPrivate: 'false'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.content).toBe('This is a test post');
    expect(response.body.user._id).toBe(testUser._id);
  });
  
  it('devrait récupérer toutes les publications', async () => {
    const response = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.posts).toBeDefined();
    expect(response.body.posts.length).toBeGreaterThan(0);
    expect(response.body.hasMore).toBeDefined();
  });
  
  it('devrait aimer une publication', async () => {
    const response = await request(app)
      .post(`/api/posts/${testPost._id}/like`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(1);
    expect(response.body.liked).toBe(true);
    
    // Vérifier que le like a été ajouté dans la base de données
    const updatedPost = await posts.getById(testPost._id);
    expect(updatedPost.likes).toContain(testUser._id);
  });
  
  it('devrait ajouter un commentaire à une publication', async () => {
    const response = await request(app)
      .post(`/api/posts/${testPost._id}/comment`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`])
      .send({
        content: 'This is a test comment'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.content).toBe('This is a test comment');
    expect(response.body.user._id).toBe(testUser._id);
    
    // Vérifier que le commentaire a été ajouté dans la base de données
    const updatedPost = await posts.getById(testPost._id);
    expect(updatedPost.comments.length).toBe(1);
    expect(updatedPost.comments[0].content).toBe('This is a test comment');
  });
});

describe('Tests des routes d\'amitié', () => {
  it('devrait envoyer une demande d\'amitié', async () => {
    const response = await request(app)
      .post(`/api/friends/request/${testUser2._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Demande d\'amitié envoyée');
    
    // Vérifier que la demande a été ajoutée dans la base de données
    const updatedUser = await users.getById(testUser._id);
    const updatedUser2 = await users.getById(testUser2._id);
    
    expect(updatedUser.friendRequests.sent).toContain(testUser2._id);
    expect(updatedUser2.friendRequests.received).toContain(testUser._id);
  });
  
  it('devrait accepter une demande d\'amitié', async () => {
    const response = await request(app)
      .post(`/api/friends/accept/${testUser._id}`)
      .set('Authorization', `Bearer ${testToken2}`)
      .set('Cookie', [`jwt=${testToken2}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Demande d\'amitié acceptée');
    
    // Vérifier que les utilisateurs sont maintenant amis
    const updatedUser = await users.getById(testUser._id);
    const updatedUser2 = await users.getById(testUser2._id);
    
    expect(updatedUser.friends).toContain(testUser2._id);
    expect(updatedUser2.friends).toContain(testUser._id);
  });
  
  it('devrait récupérer les amis de l\'utilisateur', async () => {
    const response = await request(app)
      .get('/api/friends')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(testUser2._id);
  });
});

describe('Tests des routes de chat', () => {
  let chatId;
  
  it('devrait créer/récupérer un chat entre deux utilisateurs', async () => {
    const response = await request(app)
      .get(`/api/chat/user/${testUser2._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body._id).toBeDefined();
    expect(response.body.participants).toBeDefined();
    expect(response.body.participants.length).toBe(2);
    
    chatId = response.body._id;
  });
  
  it('devrait envoyer un message dans un chat', async () => {
    const response = await request(app)
      .post(`/api/chat/${chatId}/messages`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`])
      .send({
        content: 'Hello, this is a test message'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.content).toBe('Hello, this is a test message');
    expect(response.body.sender._id).toBe(testUser._id);
    expect(response.body.read).toBe(false);
    
    // Vérifier que le message a été ajouté dans la base de données
    const chat = await chats.getById(chatId);
    expect(chat.messages.length).toBe(1);
    expect(chat.messages[0].content).toBe('Hello, this is a test message');
  });
  
  it('devrait marquer les messages comme lus', async () => {
    // D'abord, l'utilisateur 2 envoie un message
    await request(app)
      .post(`/api/chat/${chatId}/messages`)
      .set('Authorization', `Bearer ${testToken2}`)
      .set('Cookie', [`jwt=${testToken2}`])
      .send({
        content: 'Reply from user 2'
      });
    
    // Ensuite, l'utilisateur 1 marque les messages comme lus
    const response = await request(app)
      .patch(`/api/chat/${chatId}/read`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Messages marqués comme lus');
    
    // Vérifier que les messages ont été marqués comme lus
    const chat = await chats.getById(chatId);
    const message = chat.messages.find(m => m.sender === testUser2._id);
    expect(message.read).toBe(true);
  });
  
  it('devrait récupérer tous les chats de l\'utilisateur', async () => {
    const response = await request(app)
      .get('/api/chat')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(chatId);
    expect(response.body[0].otherParticipants).toBeDefined();
    expect(response.body[0].otherParticipants.length).toBe(1);
    expect(response.body[0].otherParticipants[0]._id).toBe(testUser2._id);
  });
});
