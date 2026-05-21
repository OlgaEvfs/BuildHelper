const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: null
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'supersecret_key_jktv24';
  });

  it('should return 401 if no authorization header', () => {
    req.headers.authorization = null;

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Неверный или истекший токен' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Неверный или истекший токен' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', async () => {
    // We need to mock User.findById because the middleware makes a request to the DB
    const User = require('../models/User');
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ id: '123', status: 'active' })
    });

    const payload = { id: '123' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
