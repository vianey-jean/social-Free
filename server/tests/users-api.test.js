
const request = require('supertest');
const app = require('../server');

describe('API Users', () => {
  it('devrait renvoyer une liste d\'utilisateurs', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
