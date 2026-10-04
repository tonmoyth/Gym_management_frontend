import { apiClient } from './client';
import { ApiResponse, SpecializationTag } from '@/types/api.types';

export const specializationTagApi = {
  getAll: () =>
    apiClient.get<ApiResponse<SpecializationTag[]>>('/specialization-tags'),

  create: (name: string, slug?: string) =>
    apiClient.post<ApiResponse<SpecializationTag>>('/specialization-tags', { name, slug }),
};
