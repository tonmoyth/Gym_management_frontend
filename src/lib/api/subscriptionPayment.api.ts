import { apiClient } from './client';
import {
  ApiResponse,
  PaginatedResponse,
  SubscriptionPayment,
  SubscriptionPaymentStatus,
} from '@/types/api.types';

export interface SubscriptionPaymentQueryParams {
  status?: SubscriptionPaymentStatus;
  businessId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface RejectPaymentDto {
  rejectionReason: string;
}

export const subscriptionPaymentApi = {
  getAll: (params?: SubscriptionPaymentQueryParams) =>
    apiClient.get<ApiResponse<SubscriptionPayment[]> | PaginatedResponse<SubscriptionPayment>>(
      '/admin/subscription-payments',
      { params }
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<SubscriptionPayment>>(`/admin/subscription-payments/${id}`),

  approve: (id: string) =>
    apiClient.patch<ApiResponse<SubscriptionPayment>>(`/admin/subscription-payments/${id}/approve`),

  reject: (id: string, data: RejectPaymentDto) =>
    apiClient.patch<ApiResponse<SubscriptionPayment>>(
      `/admin/subscription-payments/${id}/reject`,
      data
    ),
};
