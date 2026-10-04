import { apiClient } from './client';
import { ApiResponse, TrainerProfile, TrainerCertification, Gender } from '@/types/api.types';

export interface TrainerDashboardData {
  business: {
    id: string;
    name: string;
    logo?: string;
    address?: string;
  };
  trainer: {
    id: string;
    name: string;
    profilePhoto?: string;
    verifiedBadge: boolean;
    avgRating: number;
  };
  todaySchedule: {
    id: string;
    className: string;
    startTime: string;
    endTime: string;
    totalBookedMembers: number;
    status: 'COMPLETED' | 'UPCOMING';
  }[];
  assignedMembers: {
    totalAssignedMembers: number;
    activeMembers: number;
    inactiveMembers: number;
  };
  todayAttendance: {
    checkedIn: number;
    absent: number;
    attendanceRate: number;
  };
  monthlyStatistics: {
    classesThisMonth: number;
    completedClasses: number;
    cancelledClasses: number;
    newMembersThisMonth: number;
  };
  upcomingClasses: {
    id: string;
    className: string;
    startTime: string;
    endTime: string;
    totalBookedMembers: number;
  }[];
  recentMemberActivities: {
    memberName: string;
    activity: string;
    time: string;
  }[];
  quickStatistics: {
    averageAttendanceRate: number;
    averageMemberRating: number;
    totalReviews: number;
  };
}

export const trainerApi = {
  getOwnProfile: () =>
    apiClient.get<ApiResponse<TrainerProfile>>('/trainer-profile/me'),

  updateProfile: (data: FormData | { bio?: string; gender?: Gender; experience?: number; specializationIds?: string[] }) => {
    if (data instanceof FormData) {
      return apiClient.patch<ApiResponse<TrainerProfile>>('/trainer-profile/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.patch<ApiResponse<TrainerProfile>>('/trainer-profile/me', data);
  },

  getPublicProfile: (id: string) =>
    apiClient.get<ApiResponse<TrainerProfile>>(`/trainer-profile/${id}`),

  getAllTrainers: (params?: { specialization?: string; gender?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<TrainerProfile[]>>('/trainer-profile', { params }),

  setSpecializations: (specializationIds: string[]) =>
    apiClient.put<ApiResponse<any>>('/trainer-profile/specializations', { specializationIds }),

  uploadCertification: (data: FormData) =>
    apiClient.post<ApiResponse<TrainerCertification>>('/trainer-profile/certifications', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteCertification: (certId: string) =>
    apiClient.delete<ApiResponse<{ deletedId: string; profileCompletionPercent: number }>>(`/trainer-profile/certifications/${certId}`),

  getOwnCertifications: () =>
    apiClient.get<ApiResponse<TrainerCertification[]>>('/trainer-profile/certifications/me'),

  getBusinessDashboard: (businessId: string) =>
    apiClient.get<ApiResponse<TrainerDashboardData>>(`/businesses/${businessId}/trainers/me/dashboard`),

  // Business Owner actions
  getBusinessTrainers: (businessId: string, params?: any) =>
    apiClient.get<ApiResponse<TrainerProfile[]>>(`/trainer-profile/businesses/${businessId}/trainers`, { params }),

  removeTrainerFromBusiness: (businessId: string, trainerId: string) =>
    apiClient.delete<ApiResponse<null>>(`/trainer-profile/businesses/${businessId}/trainers/${trainerId}`),

  directAddTrainer: (
    businessId: string,
    data: { trainerId: string; monthlySalary: number; joinedAt?: string; notes?: string }
  ) =>
    apiClient.post<ApiResponse<any>>(
      `/trainer-profile/businesses/${businessId}/trainers/direct-add`,
      data
    ),

  updateSalary: (businessId: string, trainerId: string, data: { monthlySalary: number }) =>
    apiClient.patch<ApiResponse<any>>(
      `/trainer-profile/businesses/${businessId}/trainers/${trainerId}/salary`,
      data
    ),
};
