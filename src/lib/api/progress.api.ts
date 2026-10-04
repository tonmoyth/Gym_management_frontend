import { apiClient } from './client';
import { ApiResponse, ProgressLog } from '@/types/api.types';

export interface CreateProgressInput {
  memberId?: string; // If logged by trainer
  weight?: number;
  bmi?: number;
  measurements?: {
    height?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    bodyFat?: number;
  };
  workoutLog?: string;
}

export interface TrainerProgressLogItem {
  id: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  memberImage?: string | null;
  weight?: number | null;
  bmi?: number | null;
  measurements?: {
    height?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    bodyFat?: number;
  };
  workoutLog?: string;
  loggedAt: string;
  date?: string;
}

export const progressApi = {
  create: async (data: CreateProgressInput) => {
    const res = await apiClient.post<ApiResponse<any>>('/progress', data);
    if (res.data?.data?.progress && !res.data.data.id) {
      res.data.data = res.data.data.progress;
    }
    return res;
  },

  getByMemberId: async (memberId: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/progress/member/${memberId}`);
    if (res.data?.data && !Array.isArray(res.data.data) && Array.isArray(res.data.data.progress)) {
      res.data.data = res.data.data.progress;
    }
    return res;
  },

  getMyProgress: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/progress/me');
    if (res.data?.data && !Array.isArray(res.data.data) && Array.isArray(res.data.data.progress)) {
      res.data.data = res.data.data.progress;
    }
    return res;
  },

  getTrainerLoggedProgress: async () => {
    return apiClient.get<ApiResponse<TrainerProgressLogItem[]>>('/progress/trainer/me');
  },
};
