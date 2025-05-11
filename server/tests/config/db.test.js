import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { connect } from '../../config/db.js';

// Mock better-sqlite3
vi.mock('better-sqlite3', () => {
  const mockDb = {
    prepare: vi.fn()
  };
  
  const mockConstructor = vi.fn(() => mockDb);
  return {
    default: mockConstructor
  };
});

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Mock console.log and console.error
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Configuration', () => {
  let mockDb;
  let mockStmt;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockStmt = {
      get: vi.fn()
    };
    
    mockDb = Database();
    mockDb.prepare.mockReturnValue(mockStmt);
  });
  
  it('should successfully connect to the database', async () => {
    mockStmt.get.mockReturnValue({ test: 1 });
    
    await connect();
    
    expect(mockDb.prepare).toHaveBeenCalledWith('SELECT 1 as test');
    expect(mockStmt.get).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Connected to the database');
    expect(process.exit).not.toHaveBeenCalled();
  });
  
  it('should exit process if database connection fails', async () => {
    mockStmt.get.mockReturnValue({ test: 2 });
    
    await connect();
    
    expect(mockDb.prepare).toHaveBeenCalledWith('SELECT 1 as test');
    expect(console.error).toHaveBeenCalledWith('Database connection error:', expect.any(Error));
    expect(mockExit).toHaveBeenCalledWith(1);
  });
  
  it('should exit process if get throws an error', async () => {
    mockStmt.get.mockImplementation(() => {
      throw new Error('Connection error');
    });
    
    await connect();
    
    expect(mockDb.prepare).toHaveBeenCalledWith('SELECT 1 as test');
    expect(console.error).toHaveBeenCalledWith('Database connection error:', expect.any(Error));
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
