import { apiClient } from './client';
import { ApiResponse, MemberProfile, SpecializationTag, Business, MembershipPlan, TrainerProfile } from '@/types/api.types';

export interface MemberDashboardData {
  member: {
    id: string;
    userId: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  membership: {
    id: string;
    status: string;
    business: { id: string; name: string };
    plan: { id: string; name: string; price: number; durationDays: number };
    startDate?: string;
    renewalDate?: string;
    daysRemaining: number;
  } | null;
  attendance: {
    total: number;
    thisMonth: number;
    today: {
      checkedIn: boolean;
      checkInTime?: string;
      checkOutTime?: string;
    };
    recent: {
      date: string;
      type: string;
      method: string;
      timestamp: string;
    }[];
  };
  upcomingClasses: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    trainer?: { id: string; name: string } | null;
    business: { id: string; name: string };
  }[];
}

export interface RecommendationsData {
  trainers: TrainerProfile[];
  businesses: Business[];
  plans: MembershipPlan[];
}

export const memberApi = {
  onboarding: (fitnessGoalTagId: string) =>
    apiClient.post<ApiResponse<MemberProfile>>('/members/onboarding', { fitnessGoalTagId }),

  getProfile: () =>
    apiClient.get<ApiResponse<MemberProfile>>('/members/me'),

  getRecommendations: (params?: any) =>
    apiClient.get<ApiResponse<RecommendationsData>>('/members/recommendations', { params }),

  getDashboard: () =>
    apiClient.get<ApiResponse<MemberDashboardData>>('/members/me/dashboard'),
};
