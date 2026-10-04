import { apiClient } from './client';
import { ApiResponse, Notification } from '@/types/api.types';

export const notificationApi = {
  getMyNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Notification[]>>('/notifications', { params }),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch<ApiResponse<null>>('/notifications/read-all'),
};
