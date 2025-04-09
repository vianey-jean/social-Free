
const request = require('supertest');
const app = require('../server');

describe('Tests du serveur', () => {
  it('devrait retourner 200 pour la vérification de santé', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message');
  });
  
  it('devrait supporter les requêtes CORS', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:8080');
    
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8080');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
  
  it('devrait bloquer les origines non autorisées', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://malicious-site.com');
    
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
