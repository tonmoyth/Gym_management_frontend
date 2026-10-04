import { apiClient } from './client';
import { ApiResponse, Dispute, DisputeCategory } from '@/types/api.types';

export interface CreateDisputeInput {
  subject?: string;
  description: string;
  category: DisputeCategory;
  businessId?: string;
  trainerId?: string;
}

export const disputeApi = {
  create: (data: CreateDisputeInput) =>
    apiClient.post<ApiResponse<Dispute>>('/disputes', data),

  getMyDisputes: () =>
    apiClient.get<ApiResponse<Dispute[]>>('/disputes/me'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`),
};
