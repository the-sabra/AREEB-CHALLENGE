import { describe, it, expect, vi, beforeEach } from 'vitest';
import validationMiddleware from '../../middleware/validation.js';
import { validationResult } from 'express-validator';

// Mock express-validator
vi.mock('express-validator', () => ({
  validationResult: vi.fn()
}));

describe('Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next if there are no validation errors', () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
    
    validationMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return a 400 response if there are validation errors', () => {
    const mockErrors = [
      { 
        msg: 'Email is required', 
        param: 'email', 
        location: 'body' 
      }
    ];
    
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors
    });
    
    validationMiddleware(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockErrors[0] });
  });
});
