import { apiClient } from './client';
import { ApiResponse, DietPlan } from '@/types/api.types';

export interface AssignableMember {
  id: string; // memberProfile ID
  userId: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  businessId: string;
  businessName: string;
}

export interface TrainerDietPlanItem {
  id: string;
  memberId: string;
  businessId: string;
  businessName?: string;
  memberName?: string;
  memberEmail?: string;
  memberImage?: string | null;
  title: string;
  goal?: string;
  dailyCalories: number;
  macros?: { protein?: string; carbs?: string; fats?: string };
  startDate?: string;
  endDate?: string;
  notes?: string;
  meals?: any;
  createdAt: string;
  updatedAt?: string;
}

export const dietPlanApi = {
  create: (data: any) =>
    apiClient.post<ApiResponse<DietPlan>>('/diet-plans', data),

  update: (id: string, data: { content: any }) =>
    apiClient.patch<ApiResponse<DietPlan>>(`/diet-plans/${id}`, data),

  getByMemberId: (memberId: string) =>
    apiClient.get<ApiResponse<DietPlan>>(`/diet-plans/member/${memberId}`),

  getMyDietPlan: () =>
    apiClient.get<ApiResponse<DietPlan>>('/diet-plans/me'),

  getAssignableMembers: (businessId?: string) =>
    apiClient.get<ApiResponse<AssignableMember[]>>('/diet-plans/assignable-members', {
      params: businessId ? { businessId } : undefined,
    }),

  getTrainerDietPlans: () =>
    apiClient.get<ApiResponse<TrainerDietPlanItem[]>>('/diet-plans/trainer/me'),
};
