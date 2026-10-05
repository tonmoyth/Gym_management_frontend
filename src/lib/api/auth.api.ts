import axios from 'axios';
import { apiClient } from './client';
import { ApiResponse, Role, User } from '@/types/api.types';

export interface RegisterInput {
  fullName?: string;
  email: string;
  password: string;
  role: Role;
  referralCode?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  email: string;
  otp: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<ApiResponse<any>>('/auth/register', data),

  login: (data: LoginInput) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/login', data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout'),

  verifyEmail: (data: VerifyEmailInput) =>
    axios.post<ApiResponse<User>>('/api/auth/verify-email', data),

  resendVerificationOtp: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-verification-otp', { email }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (data: ResetPasswordInput) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', data),

  deleteAccount: () =>
    apiClient.delete<ApiResponse<null>>('/auth/delete-account'),
};
