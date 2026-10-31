/**
 * رتل - Ratil
 * تعريفات أنواع المصادقة والمستخدمين (TypeScript Types)
 * features/auth/types/auth.types.ts
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'moderator' | 'user';
  status?: 'active' | 'suspended';
  avatar?: string | null;
  lastLoginAt?: string;
  loginCount?: number;
  createdAt?: string;
  created_at?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
