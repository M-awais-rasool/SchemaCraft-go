import api from './api';

export interface SchemaField {
  name: string;
  type: string;
  visibility: string;
  required: boolean;
  default?: any;
  description?: string;
}

export interface AuthFieldConfig {
  email_field: string;
  username_field?: string;
  allow_both: boolean;
}

export interface AuthConfig {
  enabled: boolean;
  user_collection: string;
  login_fields: AuthFieldConfig;
  response_fields: string[];
  password_field: string;
  token_expiration: number;
  require_email_verification: boolean;
  allow_signup: boolean;
}

export interface Schema {
  id: string;
  user_id: string;
  collection_name: string;
  fields: SchemaField[];
  auth_config?: AuthConfig;
  endpoint_protection?: {
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateSchemaRequest {
  collection_name: string;
  fields: SchemaField[];
  auth_config?: AuthConfig;
  endpoint_protection?: {
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  };
}

export class SchemaService {
  // Create a new schema
  static async createSchema(data: CreateSchemaRequest): Promise<Schema> {
    const response = await api.post<Schema>('/schemas', data);
    return response.data;
  }

  // Get all schemas for the user
  static async getSchemas(): Promise<Schema[]> {
    const response = await api.get<Schema[]>('/schemas');
    return response.data;
  }

  // Get a specific schema by ID
  static async getSchemaById(id: string): Promise<Schema> {
    const response = await api.get<Schema>(`/schemas/${id}`);
    return response.data;
  }

  // Delete a schema
  static async deleteSchema(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/schemas/${id}`);
    return response.data;
  }
}
