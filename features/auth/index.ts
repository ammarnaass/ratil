'use client';

/**
 * رتل - Ratil
 * واجهة التصدير العامة لميزة المصادقة (Auth Feature Entry Point)
 * features/auth/index.ts
 */

// Types
export type {
  User,
  AuthCredentials,
  RegisterInput,
  AuthResponse,
  AuthState,
  AuthContextType,
} from './types/auth.types';

// Constants
export {
  AUTH_COOKIE_NAME,
  USER_STORAGE_KEY,
  AUTH_LIMITS,
  AUTH_MESSAGES,
} from './constants/auth.constants';

// Validators
export {
  validateEmail,
  validatePassword,
  validateName,
  validateLogin,
  validateRegister,
} from './validators/auth.validator';

// Context & Hooks
export { AuthContext } from './context/auth.context';
export { AuthProvider } from './components/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { useAuthForm } from './hooks/useAuthForm';

// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { PasswordInput } from './components/PasswordInput';
export { AuthModal } from './components/AuthModal';
export { UserNavMenu } from './components/UserNavMenu';

// Client Services
export {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
} from './services/auth.service';
