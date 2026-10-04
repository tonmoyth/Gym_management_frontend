import { apiClient } from './client';
import { ApiResponse, Review } from '@/types/api.types';

export interface CreateReviewInput {
  businessId: string;
  trainerId?: string;
  rating: number;
  comment?: string;
}

export const reviewApi = {
  create: (data: CreateReviewInput) =>
    apiClient.post<ApiResponse<Review>>('/reviews', data),

  getByBusiness: (businessId: string) =>
    apiClient.get<ApiResponse<Review[]>>(`/reviews/business/${businessId}`),

  getByTrainer: (trainerId: string) =>
    apiClient.get<ApiResponse<Review[]>>(`/reviews/trainer/${trainerId}`),
};
