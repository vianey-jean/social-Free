
const jwt = require('jsonwebtoken');
const { users } = require('../db');
const auth = require('../middleware/auth');

// Mock des modules
jest.mock('../db', () => ({
  users: {
    getById: jest.fn()
  }
}));

describe('Tests du middleware d\'authentification', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      cookies: {},
      header: jest.fn()
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('devrait rejeter une requête sans token', async () => {
    await auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Authentification requise'
    }));
    expect(next).not.toHaveBeenCalled();
  });
  
  it('devrait autoriser avec un token valide dans les cookies', async () => {
    const userId = 'testid123';
    const token = jwt.sign({ id: userId }, 'your-fallback-secret-key-for-development');
    const mockUser = { _id: userId, firstName: 'Test', lastName: 'User' };
    
    req.cookies.jwt = token;
    users.getById.mockResolvedValue(mockUser);
    
    await auth(req, res, next);
    
    expect(users.getById).toHaveBeenCalledWith(userId);
    expect(req.user).toEqual(mockUser);
    expect(req.token).toBe(token);
    expect(next).toHaveBeenCalled();
  });
  
  it('devrait autoriser avec un token valide dans l\'en-tête Authorization', async () => {
    const userId = 'testid123';
    const token = jwt.sign({ id: userId }, 'your-fallback-secret-key-for-development');
    const mockUser = { _id: userId, firstName: 'Test', lastName: 'User' };
    
    req.header.mockReturnValue(`Bearer ${token}`);
    users.getById.mockResolvedValue(mockUser);
    
    await auth(req, res, next);
    
    expect(users.getById).toHaveBeenCalledWith(userId);
    expect(req.user).toEqual(mockUser);
    expect(req.token).toBe(token);
    expect(next).toHaveBeenCalled();
  });
  
  it('devrait rejeter avec un token invalide', async () => {
    req.cookies.jwt = 'invalid-token';
    
    await auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token invalide ou expiré'
    }));
    expect(next).not.toHaveBeenCalled();
  });
  
  it('devrait rejeter si l\'utilisateur n\'existe pas', async () => {
    const userId = 'testid123';
    const token = jwt.sign({ id: userId }, 'your-fallback-secret-key-for-development');
    
    req.cookies.jwt = token;
    users.getById.mockResolvedValue(null);
    
    await auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Utilisateur non trouvé'
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
