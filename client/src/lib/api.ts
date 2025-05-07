// import { ApiResponse } from '@/types/user';

/**
 * Base URL for API requests
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Options for API requests
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any; w
  requiresAuth?: boolean;
}

/**
 * Generic API client for making typed HTTP requests
 * 
 * @param endpoint - API endpoint path
 * @param options - Request options
 * @returns Promise with typed response data
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    requiresAuth = true
  } = options;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders
  };

  // Add request body if provided
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Make the request
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    // Check if response is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Parse and return response data
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API request error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Typed convenience methods for common API operations
 */
export const api = {
  /**
   * Make a GET request
   */
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'POST', body: data });
  },

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'PUT', body: data });
  },

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
  }
};