import axios, {type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

/**
 * Base URL for API requests
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, 
});

// Function to get auth token - this will be used lazily to ensure store is initialized
function getAuthToken() {
  // Fallback to localStorage to avoid circular dependencies
  return localStorage.getItem('token');
}

// Add request interceptor for auth headers
axiosInstance.interceptors.request.use(
  async (config: any) => {
    if (config.requiresAuth !== false) {
      const token =  getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle authentication errors (401)
    if (error.response?.status === 401) {
      try {
        // Import auth store and clear user data on unauthorized
        const { useAuthStore } = await import('@/stores/auth');
        const authStore = useAuthStore();
        authStore.clearUserData();
      } catch (e) {
        console.error('Failed to clear auth data:', e);
      }
    }
    
    // Handle different error scenarios (403, 500, etc.)
    console.error('API request error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Options for API requests
 */
export interface RequestOptions extends AxiosRequestConfig {
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
  try {
    const response: AxiosResponse<T> = await axiosInstance({
      url: endpoint,
      ...options
    });
    return (response.data as any).data;
  } catch (error) {
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
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'POST', data });
  },

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'PUT', data });
  },

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
  },
  
  /**
   * Make a PATCH request
   */
  patch<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'PATCH', data });
  }
};