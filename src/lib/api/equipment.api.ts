import { apiClient } from './client';
import { ApiResponse, Equipment, EquipmentCondition } from '@/types/api.types';

export interface CreateEquipmentInput {
  name: string;
  quantity: number;
  condition: EquipmentCondition;
  lastMaintenanceDate?: string;
}

export const equipmentApi = {
  create: (businessId: string, data: CreateEquipmentInput) =>
    apiClient.post<ApiResponse<Equipment>>(`/businesses/${businessId}/equipment`, data),

  listByBusiness: (businessId: string) =>
    apiClient.get<ApiResponse<Equipment[]>>(`/businesses/${businessId}/equipment`),

  update: (businessId: string, id: string, data: Partial<CreateEquipmentInput>) =>
    apiClient.patch<ApiResponse<Equipment>>(`/businesses/${businessId}/equipment/${id}`, data),

  delete: (businessId: string, id: string) =>
    apiClient.delete<ApiResponse<null>>(`/businesses/${businessId}/equipment/${id}`),
};
