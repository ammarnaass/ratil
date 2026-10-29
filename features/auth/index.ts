/**
 * رتل - Ratil
 * نقطة الدخول العامة لميزة المصادقة والمستخدمين (Auth Feature Public API)
 * features/auth/index.ts
 */

// Hooks & Context
export { AuthProvider, useAuth } from './hooks/useAuth';

// Components
export { AuthCard } from './components/AuthCard';
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { UserNavMenu } from './components/UserNavMenu';

// Types
export type {
  User,
  UserRole,
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  SyncDataPayload,
  SyncResponse,
} from './types/auth.types';

// Constants
export {
  AUTH_COOKIE_NAME,
  AUTH_STORAGE_KEY,
  AUTH_ROUTES,
  API_AUTH_ENDPOINTS,
} from './constants/auth.constants';

// Services
export {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  syncUserData,
  fetchUserCloudData,
} from './services/auth.service';

// Validators
export {
  validateEmail,
  validatePassword,
  validateName,
  validateLoginInput,
  validateRegisterInput,
} from './validators/auth.validator';
