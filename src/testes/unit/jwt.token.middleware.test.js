import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getMockReq, getMockRes } from '@jest-mock/express';
import jwt from 'jsonwebtoken';
import verifyToken from '../../middlewares/jwt.token.middleware.js';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('JWT Token Middleware (verifyToken)', () => {
  let req;
  let res;
  let next;
  const mockJwtSecret = 'test-secret-key';

  beforeEach(() => {
    req = getMockReq();
    ({ res, next } = getMockRes());
    jest.clearAllMocks();

    process.env.JWT_SECRET = mockJwtSecret;
  });

  it('should call next() and set req.userId if token is valid', () => {
    const token = 'valid.token.here';
    const decodedPayload = { id: 'user123' };
    req.headers['authorization'] = `Bearer ${token}`;

    jwt.verify.mockImplementation((t, secret, callback) => {
      callback(null, decodedPayload);
    });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, mockJwtSecret, expect.any(Function));
    expect(req.userId).toBe(decodedPayload.id);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should return 401 if token is present but not in "Bearer <token>" format (e.g. missing space)', () => {
    req.headers['authorization'] = 'BearertokenWithoutSpace';
    
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is present but "Bearer" part is missing', () => {
    req.headers['authorization'] = 'just.a.token';
    
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });


  it('should return 403 if token verification fails (e.g., invalid token)', () => {
    const token = 'invalid.or.expired.token';
    req.headers['authorization'] = `Bearer ${token}`;
    const verificationError = new Error('jwt malformed');

    jwt.verify.mockImplementation((t, secret, callback) => {
      callback(verificationError, null);
    });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, mockJwtSecret, expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
    expect(req.userId).toBeUndefined();
  });

  it('should handle unexpected errors during token processing and return 500', () => {
    Object.defineProperty(req, 'headers', {
        get: jest.fn(() => { throw new Error('Unexpected header access error') })
    });
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});