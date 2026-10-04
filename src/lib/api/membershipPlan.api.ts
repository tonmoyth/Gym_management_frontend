import { apiClient } from './client';
import { ApiResponse, MembershipPlan } from '@/types/api.types';

export interface CreatePlanInput {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  benefits: string[];
}

export const membershipPlanApi = {
  create: (businessId: string, data: CreatePlanInput) =>
    apiClient.post<ApiResponse<MembershipPlan>>(`/businesses/${businessId}/plans`, data),

  listByBusiness: (businessId: string) =>
    apiClient.get<ApiResponse<MembershipPlan[]>>(`/businesses/${businessId}/plans`),

  getById: (businessId: string, planId: string) =>
    apiClient.get<ApiResponse<MembershipPlan>>(`/businesses/${businessId}/plans/${planId}`),

  update: (businessId: string, planId: string, data: Partial<CreatePlanInput>) =>
    apiClient.patch<ApiResponse<MembershipPlan>>(`/businesses/${businessId}/plans/${planId}`, data),

  archive: (businessId: string, planId: string) =>
    apiClient.patch<ApiResponse<MembershipPlan>>(`/businesses/${businessId}/plans/${planId}/archive`),
};
