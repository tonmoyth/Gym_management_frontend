import { apiClient } from './client';
import {
  ApiResponse,
  PaginatedResponse,
  SubscriptionPlan,
  BillingCycle,
  SubscriptionPlanStatus,
} from '@/types/api.types';

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  durationDays?: number;
  features: string[];
  status?: SubscriptionPlanStatus;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  durationDays?: number;
  features?: string[];
  status?: SubscriptionPlanStatus;
}

export interface SubscriptionPlanQueryParams {
  status?: SubscriptionPlanStatus;
  billingCycle?: BillingCycle;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export const subscriptionPlanApi = {
  getAll: (params?: SubscriptionPlanQueryParams) =>
    apiClient.get<ApiResponse<SubscriptionPlan[]> | PaginatedResponse<SubscriptionPlan>>(
      '/admin/subscription-plans',
      { params }
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<SubscriptionPlan>>(`/admin/subscription-plans/${id}`),

  create: (data: CreateSubscriptionPlanDto) =>
    apiClient.post<ApiResponse<SubscriptionPlan>>('/admin/subscription-plans', data),

  update: (id: string, data: UpdateSubscriptionPlanDto) =>
    apiClient.patch<ApiResponse<SubscriptionPlan>>(`/admin/subscription-plans/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/admin/subscription-plans/${id}`),
};
