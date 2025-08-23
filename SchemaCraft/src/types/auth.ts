export interface User {
  id: string;
  name: string;
  email: string;
  google_id?: string;
  api_key: string;
  is_admin: boolean;
  is_active: boolean;
  mongodb_uri?: string;
  database_name?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  api_usage: {
    total_requests: number;
    last_request?: string;
    monthly_quota: number;
    used_this_month: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}
