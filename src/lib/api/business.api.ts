import { apiClient } from './client';
import { ApiResponse, Business } from '@/types/api.types';

export interface BusinessFilters {
  searchTerm?: string;
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  amenities?: string;
  address?: string;
  status?: string;
}

export interface BusinessDashboardData {
  business: {
    businessId: string;
    businessName: string;
    logo?: string | null;
    status: string;
    referralCode?: string | null;
    createdAt: string;
  };
  members: {
    activeMembers: number;
    pendingMembers: number;
    totalMembers: number;
  };
  trainers: {
    activeTrainers: number;
    totalTrainers: number;
  };
  membership: {
    activeMemberships: number;
  };
  attendance: {
    todayAttendance: number;
  };
  revenue: {
    todayRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
  };
  trainerPayout: {
    monthlyPayout: number;
    pendingPayout: number;
    paidPayout: number;
  };
  pendingActions: {
    pendingBookingRequests: number;
    pendingTrainerApplications: number;
  };
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  classes: {
    todayClasses: number;
    ongoingClasses: number;
  };
  equipment: {
    totalEquipment: number;
    maintenanceRequired: number;
    lowStockEquipment: number;
  };
  subscription: {
    subscriptionStatus: string;
    nextBillingDate: string;
  } | null;
  quickStats: {
    newMembersThisMonth: number;
    newTrainersThisMonth: number;
    newReviewsThisMonth: number;
    newRevenueThisMonth: number;
  };
}

export const businessApi = {
  create: (data: {
    name: string;
    description?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    amenities?: string[];
    email?: string;
    phone?: string;
    whatsapp?: string;
    referralCode?: string;
  }) => apiClient.post<ApiResponse<Business>>('/businesses', data),

  getAll: (params?: BusinessFilters) =>
    apiClient.get<ApiResponse<Business[]>>('/businesses', { params }),

  getMyBusiness: () =>
    apiClient.get<ApiResponse<Business>>('/businesses/me'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Business>>(`/businesses/${id}`),

  getDashboard: (id: string) =>
    apiClient.get<ApiResponse<BusinessDashboardData>>(`/businesses/${id}/dashboard`),

  update: (id: string, data: FormData | Partial<Business>) => {
    if (data instanceof FormData) {
      return apiClient.patch<ApiResponse<Business>>(`/businesses/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.patch<ApiResponse<Business>>(`/businesses/${id}`, data);
  },
};
