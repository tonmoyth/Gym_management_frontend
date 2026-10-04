import { apiClient } from './client';
import { ApiResponse, TrainerPayout } from '@/types/api.types';

export interface PayoutSummary {
  totalPayout: number;
  totalPaid: number;
  totalPending: number;
  totalTrainers: number;
}

export interface PayoutListResponse {
  summary?: PayoutSummary;
  data: TrainerPayout[];
}

export interface CreatePayoutInput {
  trainerId: string;
  month: string | number;
  year?: number;
  amount: number;
  note?: string;
}

export const payoutApi = {
  // Owner
  createOrUpdate: (businessId: string, data: CreatePayoutInput) =>
    apiClient.post<ApiResponse<TrainerPayout>>(`/businesses/${businessId}/payouts`, data),

  listByBusiness: (
    businessId: string,
    params?: { month?: string; year?: string; status?: string; trainerId?: string }
  ) =>
    apiClient.get<ApiResponse<PayoutListResponse | TrainerPayout[]>>(`/businesses/${businessId}/payouts`, { params }),

  markAsPaid: (businessId: string, id: string, data?: { transactionReference?: string }) =>
    apiClient.patch<ApiResponse<TrainerPayout>>(`/businesses/${businessId}/payouts/${id}/mark-paid`, data),

  // Trainer
  getMyPayouts: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<TrainerPayout[]>>('/payouts/trainer/me', { params }),
};
