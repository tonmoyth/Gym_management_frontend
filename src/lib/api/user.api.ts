import { apiClient } from './client';
import { ApiResponse, User } from '@/types/api.types';

export const userApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/user/me'),

  updateProfile: (data: FormData | { fullName?: string; bio?: string }) => {
    if (data instanceof FormData) {
      return apiClient.patch<ApiResponse<User>>('/user/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.patch<ApiResponse<User>>('/user/me', data);
  },
};
