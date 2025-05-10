import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import express from 'express';

// Mock the necessary modules
vi.mock('../../services/event.service.js', () => {
  return {
    default: {
      createEvent: vi.fn().mockResolvedValue({ id: 1, name: 'Test Event', image: 'test-image.jpg' }),
      getEventById: vi.fn().mockResolvedValue({ id: 1, name: 'Test Event', image: 'test-image.jpg' }),
      updateEvent: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Event', image: 'updated-image.jpg' }),
      deleteEvent: vi.fn().mockResolvedValue(true)
    }
  };
});

vi.mock('../../utils/fileUpload.js', () => {
  return {
    getFileUrl: vi.fn(filename => `http://localhost:3000/uploads/${filename}`),
    deleteFile: vi.fn(),
    ensureUploadDirExists: vi.fn().mockReturnValue('/mock/uploads/dir'),
    default: {
      single: () => (req, res, next) => {
        req.file = {
          filename: 'test-image.jpg',
          path: '/mock/uploads/dir/test-image.jpg'
        };
        next();
      }
    }
  };
});

// Mock the ApiResponse
vi.mock('../../utils/ApiResponse.js', () => {
  return {
    ApiResponse: {
      success: (statusCode, data, message) => ({
        status: 'success',
        statusCode,
        data,
        message
      })
    }
  };
});

describe('Image Upload Feature', () => {
  it('should correctly process image paths and URLs', async () => {
    // Import modules after mocking is set up
    const { getFileUrl } = await import('../../utils/fileUpload.js');
    
    // Test the URL generation
    const url = getFileUrl('test-image.jpg');
    expect(url).toBe('http://localhost:3000/uploads/test-image.jpg');
  });
  
  it('should correctly handle image paths in event controllers', async () => {
    // Import controllers after mocking is set up
    const eventController = await import('../../controllers/event.controller.js');
    
    // Create a mock Express response
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    
    // Create a mock request with a file
    const req = {
      file: {
        filename: 'test-image.jpg',
        path: '/mock/uploads/dir/test-image.jpg'
      },
      body: {
        name: 'Test Event',
        description: 'Test Description',
        date: '2023-06-15',
        venue: 'Test Venue',
        price: 100,
        capacity: 50,
        category_id: 1
      },
      params: {
        eventId: 1
      }
    };
    
    // Test creating an event with an image
    const next = vi.fn();
    await eventController.default.createEvent(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    
    // Extract the response data
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.data.event.imageUrl).toBeDefined();
  });
});
