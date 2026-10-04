import { apiClient } from './client';
import { ApiResponse, Membership } from '@/types/api.types';

export interface BookMembershipInput {
  businessId: string;
  planId: string;
  startDate?: string;
}

export const membershipApi = {
  // Member actions
  book: (data: BookMembershipInput) =>
    apiClient.post<ApiResponse<Membership>>('/memberships', data),

  getMyMemberships: () =>
    apiClient.get<ApiResponse<Membership[]>>('/memberships/me'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Membership>>(`/memberships/${id}`),

  upgrade: (id: string, planId: string) =>
    apiClient.patch<ApiResponse<Membership>>(`/memberships/${id}/upgrade`, { planId }),

  cancel: (id: string) =>
    apiClient.patch<ApiResponse<Membership>>(`/memberships/${id}/cancel`),

  // Business Owner actions
  getPendingBookings: (businessId: string) =>
    apiClient.get<ApiResponse<Membership[]>>(`/businesses/${businessId}/bookings/pending`),

  getBusinessMembers: (businessId: string, status?: string) =>
    apiClient.get<ApiResponse<any[]>>(`/memberships/business/${businessId}${status ? `?status=${status}` : ''}`),

  approve: (id: string) =>
    apiClient.patch<ApiResponse<Membership>>(`/memberships/${id}/approve`),

  reject: (id: string, reason?: string) =>
    apiClient.patch<ApiResponse<Membership>>(`/memberships/${id}/reject`, { reason }),
};
