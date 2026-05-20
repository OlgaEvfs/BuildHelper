const { registerUser, authUser } = require('../controllers/authController');
const User = require('../models/User');
const generateToken = require('../config/utils');

jest.mock('../models/User');
jest.mock('../config/utils');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should return 400 if fields are missing', async () => {
      req.body = { username: 'test' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пожалуйста заполните все поля' });
    });

    it('should return 400 if password is weak', async () => {
      req.body = { username: 'test', email: 'test@ex.com', password: '123' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should register user successfully', async () => {
      req.body = { username: 'test', email: 'test@ex.com', password: 'Password1' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: '1', username: 'test', email: 'test@ex.com', role: 'user' });
      generateToken.mockReturnValue('token');

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token' }));
    });
  });

  describe('authUser', () => {
    it('should return 401 if credentials are invalid', async () => {
      req.body = { email: 'test@ex.com', password: 'wrong' };
      User.findOne.mockResolvedValue(null);
      await authUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 if user is banned', async () => {
      req.body = { email: 'banned@ex.com', password: 'Password1' };
      const mockUser = {
        _id: '1',
        status: 'banned',
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);
      await authUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
