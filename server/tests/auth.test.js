
const request = require('supertest');
const app = require('../server');
const { users, initDB } = require('../db');
const { setupTestEnvironment, cleanupTestEnvironment } = require('./setup');

describe('Tests des routes d\'authentification', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
    await initDB();
  });
  
  afterAll(async () => {
    await cleanupTestEnvironment();
  });
  
  it('devrait inscrire un nouvel utilisateur', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.isOnline).toBe(true);
    
    // Vérifier que l'utilisateur est bien dans la base de données
    const user = await users.getByEmail('test@example.com');
    expect(user).toBeDefined();
    expect(user.firstName).toBe('Test');
  });
  
  it('devrait empêcher l\'inscription avec un email déjà utilisé', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('existe déjà');
  });
  
  it('devrait permettre la connexion avec des identifiants valides', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.isOnline).toBe(true);
    
    // Sauvegarder le token pour les tests suivants
    global.testToken = response.body.token;
  });
  
  it('devrait refuser la connexion avec un mot de passe incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('invalide');
  });
  
  it('devrait obtenir le profil de l\'utilisateur connecté', async () => {
    if (!global.testToken) {
      throw new Error('Test token non disponible. Le test de connexion a échoué?');
    }
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${global.testToken}`)
      .set('Cookie', [`jwt=${global.testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  it('devrait déconnecter l\'utilisateur', async () => {
    if (!global.testToken) {
      throw new Error('Test token non disponible. Le test de connexion a échoué?');
    }
    
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${global.testToken}`)
      .set('Cookie', [`jwt=${global.testToken}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Déconnexion réussie');
    
    // Vérifier que l'utilisateur est maintenant hors ligne
    const user = await users.getByEmail('test@example.com');
    expect(user.isOnline).toBe(false);
  });
});
