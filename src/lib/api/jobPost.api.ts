import { apiClient } from './client';
import { ApiResponse, JobPost, TrainerApplication } from '@/types/api.types';

export const jobPostApi = {
  // Trainer
  getOpenPosts: (params?: { specialization?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<JobPost[]>>('/job-posts', { params }),

  getMyApplications: () =>
    apiClient.get<ApiResponse<TrainerApplication[]>>('/job-posts/applications/me'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<JobPost>>(`/job-posts/${id}`),

  apply: (id: string) =>
    apiClient.post<ApiResponse<TrainerApplication>>(`/job-posts/${id}/apply`),

  // Owner
  getMyPosts: (params?: { page?: number; limit?: number; isOpen?: boolean }) =>
    apiClient.get<ApiResponse<JobPost[]>>('/job-posts/my-posts', { params }),

  create: (data: {
    title: string;
    description: string;
    specializationTagId: string;
    salary?: number;
    experience?: number;
  }) => apiClient.post<ApiResponse<JobPost>>('/job-posts', data),

  close: (id: string) =>
    apiClient.patch<ApiResponse<JobPost>>(`/job-posts/${id}/close`),

  getApplicants: (id: string) =>
    apiClient.get<ApiResponse<TrainerApplication[]>>(`/job-posts/${id}/applicants`),

  approveApplication: (appId: string, data?: { monthlySalary?: number }) =>
    apiClient.patch<ApiResponse<TrainerApplication>>(`/job-posts/applications/${appId}/approve`, data),

  rejectApplication: (appId: string) =>
    apiClient.patch<ApiResponse<TrainerApplication>>(`/job-posts/applications/${appId}/reject`),
};
