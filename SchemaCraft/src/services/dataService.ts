import api from './api';

export interface DataRecord {
  id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export class DataService {
  // Get user's API key for dynamic API access
  static getUserAPIKey(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.api_key;
    }
    return null;
  }

  // Create API instance with API key
  static getAPIInstance() {
    const apiKey = this.getUserAPIKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Create a separate axios instance for API key requests
    const apiInstance = api.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    return apiInstance;
  }

  // Create a document in a collection
  static async createDocument(collection: string, data: Record<string, any>): Promise<DataRecord> {
    const apiInstance = this.getAPIInstance();
    const response = await apiInstance.post<DataRecord>(`/api/${collection}`, data);
    return response.data;
  }

  // Get documents from a collection
  static async getDocuments(
    collection: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<DataRecord>> {
    const apiInstance = this.getAPIInstance();
    const response = await apiInstance.get<PaginatedResponse<DataRecord>>(
      `/api/${collection}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Get a specific document by ID
  static async getDocumentById(collection: string, id: string): Promise<DataRecord> {
    const apiInstance = this.getAPIInstance();
    const response = await apiInstance.get<DataRecord>(`/api/${collection}/${id}`);
    return response.data;
  }

  // Update a document
  static async updateDocument(
    collection: string,
    id: string,
    data: Record<string, any>
  ): Promise<DataRecord> {
    const apiInstance = this.getAPIInstance();
    const response = await apiInstance.put<DataRecord>(`/api/${collection}/${id}`, data);
    return response.data;
  }

  // Delete a document
  static async deleteDocument(collection: string, id: string): Promise<{ message: string }> {
    const apiInstance = this.getAPIInstance();
    const response = await apiInstance.delete<{ message: string }>(`/api/${collection}/${id}`);
    return response.data;
  }
}
