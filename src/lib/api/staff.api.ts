import { apiClient } from './client';
import { ApiResponse, BusinessStaff, StaffPermissionRole } from '@/types/api.types';

export const staffApi = {
  addStaff: (businessId: string, data: { email?: string; userId?: string; permissionRole: StaffPermissionRole }) =>
    apiClient.post<ApiResponse<BusinessStaff>>(`/businesses/${businessId}/staff`, data),

  listByBusiness: (businessId: string) =>
    apiClient.get<ApiResponse<BusinessStaff[]>>(`/businesses/${businessId}/staff`),

  updatePermission: (businessId: string, staffId: string, permissionRole: StaffPermissionRole) =>
    apiClient.patch<ApiResponse<BusinessStaff>>(`/businesses/${businessId}/staff/${staffId}`, { permissionRole }),

  removeStaff: (businessId: string, staffId: string) =>
    apiClient.delete<ApiResponse<null>>(`/businesses/${businessId}/staff/${staffId}`),
};
