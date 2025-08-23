import api from './api';
import type { LoginRequest, SignupRequest, LoginResponse, User } from '../types/auth';

export class AuthService {
  // Sign up with email and password
  static async signup(userData: SignupRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/signup', userData);
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // Sign in with email and password
  static async signin(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/signin', credentials);
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // Get current user
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  }

  // Update MongoDB URI
  static async updateMongoURI(mongodbUri: string, databaseName: string): Promise<void> {
    await api.put('/auth/mongodb-uri', {
      mongodb_uri: mongodbUri,
      database_name: databaseName,
    });
  }

  // Sign out
  static signout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Get stored user
  static getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get stored token
  static getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
