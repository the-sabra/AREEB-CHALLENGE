/**
 * Main User interface
 */
export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  registeredEvents: number[];
  createdAt: string;
}

/**
 * Interface for authentication responses
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Interface for login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface for registration request
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Interface for API response status
 */
export interface ApiResponse {
  message: string;
  success: boolean;
}