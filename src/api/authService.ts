import { ApiClient } from './apiClient';
import axios from 'axios';

// Types for auth requests/responses
export interface AuthRequest {
  username: string;
  password: string;
}

// The actual API response from the backend
export interface ApiAuthResponse {
  token: string;
  expiration: string;
  userId?: string; // Added userId field to match the backend response
}

// The response format our app expects/uses internally
export interface AuthResponse {
  username: string;
  token: string;
  success: boolean;
  message?: string;
}

export interface User {
  username: string;
  token: string;
  userId: string; // Added userId field to store the actual user ID
}

/**
 * Service for handling authentication-related API calls
 */
class AuthService {
  private apiClient = ApiClient.getInstance();

  /**
   * Login a user
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login with direct axios call to bypass ApiClient');

      // Create payload with username and password
      const payload = { username, password };

      // Make a direct axios call to the endpoint
      const response = await axios.post<ApiAuthResponse>(
        'http://backend:5151/api/Auth/login?api-version=1',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Login successful with direct axios call', response.data);

      // Extract the actual userId value - it could be a nested object or a simple value
      let actualUserId = username; // Default to username as fallback

      if (response.data.userId) {
        // If it's a nested object with an 'id' field
        if (typeof response.data.userId === 'object' && response.data.userId.id) {
          actualUserId = response.data.userId.id;
          console.log('Extracted userId from nested object:', actualUserId);
        }
        // If it's a nested object with some other structure, try to get the first property
        else if (typeof response.data.userId === 'object') {
          const firstProp = Object.keys(response.data.userId)[0];
          if (firstProp && response.data.userId[firstProp]) {
            actualUserId = response.data.userId[firstProp];
            console.log('Extracted userId from first property:', actualUserId);
          }
        }
        // If it's a simple value (string/number)
        else if (typeof response.data.userId === 'string' || typeof response.data.userId === 'number') {
          actualUserId = response.data.userId;
          console.log('Using userId directly:', actualUserId);
        }
      }

      // Transform the API response to match our expected AuthResponse format
      const authResponse = {
        username: username, // We have the username from the request
        token: response.data.token,
        success: true,
        message: 'Login successful',
        userId: actualUserId
      };

      console.log('Returning auth response with userId:', authResponse.userId);
      return authResponse;
    } catch (error) {
      console.error('Login failed:', error);
      // Return failed response object
      return {
        username: '',
        token: '',
        success: false,
        message: 'Login failed. Please try again.',
        userId: ''
      };
    }
  }

  /**
   * Register a new user
   */
  async register(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with direct axios call to bypass ApiClient');

      // Create payload with username and password
      const payload = { username, password };

      // Make a direct axios call to the endpoint
      const response = await axios.post<ApiAuthResponse>(
        'http://backend:5151/api/Auth/register?api-version=1',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Registration successful with direct axios call', response.data);

      // Extract the actual userId value - it could be a nested object or a simple value
      let actualUserId = username; // Default to username as fallback

      if (response.data.userId) {
        // If it's a nested object with an 'id' field
        if (typeof response.data.userId === 'object' && response.data.userId.id) {
          actualUserId = response.data.userId.id;
          console.log('Extracted userId from nested object:', actualUserId);
        }
        // If it's a nested object with some other structure, try to get the first property
        else if (typeof response.data.userId === 'object') {
          const firstProp = Object.keys(response.data.userId)[0];
          if (firstProp && response.data.userId[firstProp]) {
            actualUserId = response.data.userId[firstProp];
            console.log('Extracted userId from first property:', actualUserId);
          }
        }
        // If it's a simple value (string/number)
        else if (typeof response.data.userId === 'string' || typeof response.data.userId === 'number') {
          actualUserId = response.data.userId;
          console.log('Using userId directly:', actualUserId);
        }
      }

      // Transform the API response to match our expected AuthResponse format
      return {
        username: username, // We have the username from the request
        token: response.data.token,
        success: true,
        message: 'Registration successful',
        userId: actualUserId
      };
    } catch (error) {
      console.error('Registration failed:', error);
      // Return failed response object
      return {
        username: '',
        token: '',
        success: false,
        message: 'Registration failed. Please try again.',
        userId: ''
      };
    }
  }
}

export const authService = new AuthService();
