const adminMiddleware = require('../middleware/adminMiddleware');

describe('adminMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 403 if user is not authorized', () => {
    req.user = null;
    adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not an admin', () => {
    req.user = { role: 'user' };
    adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user is an admin', () => {
    req.user = { role: 'admin' };
    adminMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
