import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, isAdmin } from '../../middleware/auth.js';
import jwt from '../../utils/jwt.js';
import userService from '../../services/user.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Mock dependencies
vi.mock('../../utils/jwt.js', () => ({
  default: {
    verify: vi.fn()
  }
}));

vi.mock('../../services/user.service.js', () => ({
  default: {
    getUserById: vi.fn()
  }
}));

vi.mock('dotenv', () => ({
  config: vi.fn()
}));

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call next with 401 error when no token is provided', async () => {
      req.headers.authorization = undefined;
      
      await authenticate(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiResponse));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Authentication required');
    });

    it('should call next with 401 error when token verification fails', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await authenticate(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiResponse));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Invalid token');
    });

    it('should call next with 401 error when user is not found', async () => {
      jwt.verify.mockReturnValue({ userId: 1 });
      userService.getUserById.mockResolvedValue(null);
      
      await authenticate(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ApiResponse));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe('Invalid token');
    });

    it('should set user in req and call next when authentication is successful', async () => {
      const user = { id: 1, name: 'Test User' };
      jwt.verify.mockReturnValue({ userId: 1 });
      userService.getUserById.mockResolvedValue(user);
      
      await authenticate(req, res, next);
      
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('isAdmin', () => {
    it('should throw 403 error when user is not an admin', () => {
      req.user = { is_admin: false };
      
      expect(() => isAdmin(req, res, next)).toThrow(ApiResponse);
      expect(() => isAdmin(req, res, next)).toThrow('Admin access required');
    });

    it('should call next when user is an admin', () => {
      req.user = { is_admin: true };
      
      isAdmin(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });
  });
});
