import api from './api';
import type { User } from '../types/auth';

export interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_schemas: number;
  total_api_requests: number;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ToggleUserStatusRequest {
  is_active: boolean;
}

class AdminService {
  // Get platform statistics
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  }

  // Get all users with pagination
  async getAllUsers(page: number = 1, limit: number = 20): Promise<PaginatedUsers> {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    await api.put(`/admin/users/${userId}/toggle-status`, { is_active: isActive });
  }

  // Revoke user's API key
  async revokeUserAPIKey(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/revoke-api-key`);
  }

  // Get all schemas (admin can see all users' schemas)
  async getAllSchemas(): Promise<any[]> {
    const response = await api.get('/admin/schemas');
    return response.data;
  }

  // Get user's specific schemas
  async getUserSchemas(userId: string): Promise<any[]> {
    const response = await api.get(`/admin/users/${userId}/schemas`);
    return response.data;
  }
}

export default new AdminService();
