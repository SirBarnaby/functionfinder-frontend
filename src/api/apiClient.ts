import axios, { AxiosInstance, AxiosResponse } from 'axios';

/**
 * Simple API client for handling HTTP requests
 */
export class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  
  // API base URL from environment variables - without v1 prefix since it's already in the .env
  private readonly baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5151/api';

  private constructor() {
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    // Enhanced request logging for debugging
    this.client.interceptors.request.use(config => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
      return config;
    });
    
    // Simple response handling
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        // Log and properly format errors
        console.error('API Error:', error.message, error.response?.data || {});
        return Promise.reject(error);
      }
    );
    
    // Add request interceptor for auth token
    this.client.interceptors.request.use(config => {
      // Get auth token from localStorage if available
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
          }
        } catch (error) {
          console.error('Failed to parse stored user data for auth header:', error);
        }
      }
      return config;
    });
  }

  /**
   * Get singleton instance of ApiClient
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'GET', url);
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'POST', url);
      throw error;
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PUT', url);
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete<T>(url);
      return response.data;
    } catch (error) {
      this.handleError(error, 'DELETE', url);
      throw error;
    }
  }

  /**
   * Centralized error handler for consistent error reporting
   */
  private handleError(error: any, method: string, url: string): void {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message || 'Unknown error';
    
    console.error(`API Error: ${method} ${url} - ${status} - ${message}`);
  }
}