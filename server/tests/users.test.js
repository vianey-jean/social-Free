
const request = require('supertest');
const app = require('../server');
const { users, initDB } = require('../db');
const jwt = require('jsonwebtoken');
const { setupTestEnvironment, cleanupTestEnvironment } = require('./setup');

describe('Tests des routes utilisateur', () => {
  let testUser, testToken;
  
  beforeAll(async () => {
    await setupTestEnvironment();
    await initDB();
    
    // Créer un utilisateur de test pour les routes qui nécessitent une authentification
    testUser = await users.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@example.com',
      password: 'password123',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male'
    });
    
    // Générer un token pour l'utilisateur
    testToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'your-fallback-secret-key-for-development');
  });
  
  afterAll(async () => {
    await cleanupTestEnvironment();
  });
  
  it('devrait récupérer les utilisateurs en ligne', async () => {
    // Mettre à jour l'utilisateur pour qu'il soit en ligne
    await users.update(testUser._id, { isOnline: true });
    
    const response = await request(app)
      .get('/api/users/online')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(testUser._id);
    expect(response.body[0].isOnline).toBe(true);
  });
  
  it('devrait permettre la recherche d\'utilisateurs', async () => {
    // Créer un autre utilisateur pour tester la recherche
    await users.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      dateOfBirth: new Date('1992-02-02'),
      gender: 'male'
    });
    
    const response = await request(app)
      .get('/api/users/search?query=John')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].firstName).toBe('John');
  });
  
  it('devrait requérir une requête de recherche de plus de 3 caractères', async () => {
    const response = await request(app)
      .get('/api/users/search?query=Jo')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('au moins 3 caractères');
  });
  
  it('devrait mettre à jour le profil utilisateur', async () => {
    const response = await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`])
      .send({
        firstName: 'Updated',
        lastName: 'Name'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.firstName).toBe('Updated');
    expect(response.body.user.lastName).toBe('Name');
    
    // Vérifier que les changements ont été persistés
    const updatedUser = await users.getById(testUser._id);
    expect(updatedUser.firstName).toBe('Updated');
    expect(updatedUser.lastName).toBe('Name');
  });
  
  it('devrait rejeter les mises à jour non autorisées', async () => {
    const response = await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`])
      .send({
        email: 'hacked@example.com' // L'email ne devrait pas être modifiable via cette route
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('invalides');
    
    // Vérifier que l'email n'a pas été modifié
    const updatedUser = await users.getById(testUser._id);
    expect(updatedUser.email).toBe('user@example.com');
  });
  
  it('devrait récupérer le profil d\'un autre utilisateur', async () => {
    // Créer un troisième utilisateur
    const anotherUser = await users.create({
      firstName: 'Another',
      lastName: 'User',
      email: 'another@example.com',
      password: 'password123',
      dateOfBirth: new Date('1995-05-05'),
      gender: 'female'
    });
    
    const response = await request(app)
      .get(`/api/users/${anotherUser._id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .set('Cookie', [`jwt=${testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user._id).toBe(anotherUser._id);
    expect(response.body.user.firstName).toBe('Another');
    expect(response.body.friendshipStatus).toBe('none');
  });
});
