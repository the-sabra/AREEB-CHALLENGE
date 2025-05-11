import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler, AppError } from '../../middleware/error.handler.js';
import logger from '../../config/logger.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Mock dependencies
vi.mock('../../config/logger.js', () => ({
  default: {
    error: vi.fn()
  }
}));

vi.mock('../../utils/ApiResponse.js', () => ({
  ApiResponse: {
    error: vi.fn()
  }
}));

describe('Error Handler Middleware', () => {
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
    
    // Setup ApiResponse.error mock
    ApiResponse.error.mockImplementation((statusCode, message) => ({
      status: 'fail',
      statusCode,
      message
    }));
  });

  describe('AppError', () => {
    it('should create an error with status "fail" for 4xx errors', () => {
      const error = new AppError('Not found', 404);
      
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.status).toBe('fail');
    });

    it('should create an error with status "error" for 5xx errors', () => {
      const error = new AppError('Server error', 500);
      
      expect(error.message).toBe('Server error');
      expect(error.statusCode).toBe(500);
      expect(error.status).toBe('error');
    });
  });

  describe('errorHandler', () => {
    it('should log the error stack', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      errorHandler(error, req, res, next);
      
      expect(logger.error).toHaveBeenCalledWith('Error stack trace');
    });

    it('should use default 500 status code if not provided', () => {
      const error = new Error('Internal error');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(ApiResponse.error).toHaveBeenCalledWith(500, 'Internal error');
    });

    it('should use status code from error object if provided', () => {
      const error = new AppError('Bad request', 400);
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(ApiResponse.error).toHaveBeenCalledWith(400, 'Bad request');
    });

    it('should use default error message if not provided', () => {
      const error = new Error();
      error.message = '';
      
      errorHandler(error, req, res, next);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(500, 'Internal server error');
    });
  });
});
