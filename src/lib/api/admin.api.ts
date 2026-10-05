import { apiClient } from './client';
import {
  ApiResponse,
  Business,
  TrainerCertification,
  User,
  Dispute,
  Review,
  JobPost,
  AuditLog,
  BusinessReferral,
  PlatformSubscription,
  Payment,
} from '@/types/api.types';

export interface AdminDashboardData {
  businesses: { total: number; active: number; growthRate?: number };
  trainers: { total: number; active: number; growthRate?: number };
  members: { total: number; active: number; growthRate?: number };
  revenue: { total: number; monthly: number; growthRate?: number };
  activeAccounts?: number;
  inactiveAccounts?: number;
  recentRegistrations?: any[];
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  body: string;
  targetRole?: string;
  recipientCount?: number;
  createdBy?: string;
  createdAt: string;
}

export const adminApi = {
  // Global Dashboard
  getDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboardData>>('/admin/dashboard'),

  // Businesses Management
  getPendingBusinesses: () =>
    apiClient.get<ApiResponse<Business[]>>('/admin/businesses/pending'),

  getAllBusinesses: (params?: any) =>
    apiClient.get<ApiResponse<Business[]>>('/admin/businesses', { params }),

  approveBusiness: (id: string) =>
    apiClient.patch<ApiResponse<Business>>(`/admin/businesses/${id}/approve`, {}),

  rejectBusiness: (id: string, reason?: string) =>
    apiClient.patch<ApiResponse<Business>>(`/admin/businesses/${id}/reject`, { reason }),

  suspendBusiness: (id: string, reason?: string) =>
    apiClient.patch<ApiResponse<Business>>(`/admin/businesses/${id}/suspend`, { reason }),

  // Certifications Verification
  getPendingCertifications: () =>
    apiClient.get<ApiResponse<TrainerCertification[]>>('/admin/certifications/pending'),

  verifyCertification: (id: string) =>
    apiClient.patch<ApiResponse<TrainerCertification>>(`/admin/certifications/${id}/verify`),

  rejectCertification: (id: string, rejectionReason: string) =>
    apiClient.patch<ApiResponse<TrainerCertification>>(`/admin/certifications/${id}/reject`, { rejectionReason }),

  // User Oversight
  getUsers: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<User[]>>('/admin/users', { params }),

  updateUserStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/status`, {
      isActive,
      status: isActive ? 'ACTIVE' : 'SUSPENDED',
    }),

  // Payments & Gateways Oversight
  getGatewayStatus: () =>
    apiClient.get<ApiResponse<any>>('/admin/payments/gateways/status'),

  getTransactions: (params?: any) =>
    apiClient.get<ApiResponse<Payment[]>>('/admin/payments/transactions', { params }),

  // Disputes & Refunds
  getDisputes: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Dispute[]>>('/admin/disputes', { params }),

  getDisputeById: (id: string) =>
    apiClient.get<ApiResponse<Dispute>>(`/admin/disputes/${id}`),

  resolveDispute: (
    id: string,
    data: {
      resolution?: 'REFUND' | 'WARNING' | 'ACCOUNT_ACTION' | 'DISMISSAL';
      reason?: string;
      resolutionNote?: string;
      status?: 'RESOLVED' | 'DISMISSED';
      refundAmount?: number;
      paymentId?: string;
      accountAction?: 'SUSPEND' | 'ACTIVATE';
      targetUserId?: string;
    }
  ) => apiClient.patch<ApiResponse<Dispute>>(`/admin/disputes/${id}/resolve`, data),

  // Content Moderation
  getFlaggedReviews: () =>
    apiClient.get<ApiResponse<Review[]>>('/admin/moderation/reviews'),

  deleteReview: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/moderation/reviews/${id}`),

  getJobPostsForModeration: (params?: { isOpen?: boolean | string; search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<JobPost[]>>('/admin/moderation/job-posts', { params }),

  removeJobPost: (id: string) =>
    apiClient.patch<ApiResponse<JobPost>>(`/admin/moderation/job-posts/${id}/remove`),

  deleteJobPost: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/moderation/job-posts/${id}`),

  // System-wide Announcements
  getAnnouncements: (params?: any) =>
    apiClient.get<ApiResponse<SystemAnnouncement[]>>('/admin/announcements', { params }),

  createAnnouncement: (data: { title: string; body: string; targetRole?: string }) =>
    apiClient.post<ApiResponse<SystemAnnouncement>>('/admin/announcements', data),

  // Platform Staff
  getStaff: (params?: { role?: string; status?: string; search?: string }) =>
    apiClient.get<ApiResponse<any[]>>('/admin/staff', { params }),

  createStaff: (data: {
    name?: string;
    fullName?: string;
    email: string;
    password?: string;
    role?: 'ADMIN' | 'STAFF';
    permissions?: string[];
    permissionScope?: string;
  }) => apiClient.post<ApiResponse<any>>('/admin/staff', data),

  updateStaff: (id: string, data: { role?: 'ADMIN' | 'STAFF'; permissions?: string[]; status?: 'ACTIVE' | 'SUSPENDED'; permissionScope?: string }) =>
    apiClient.patch<ApiResponse<any>>(`/admin/staff/${id}`, data),

  deleteStaff: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/staff/${id}`),

  // Audit Logs
  getAuditLogs: (params?: any) =>
    apiClient.get<ApiResponse<AuditLog[]>>('/admin/audit-logs', { params }),

  // Platform Reports
  getPlatformReport: (params?: any) =>
    apiClient.get<ApiResponse<any>>('/admin/reports/platform', { params }),

  // Referral system temporarily disabled - will be implemented later
  /*
  // Type-A Referrals
  getTypeAReferrals: () =>
    apiClient.get<ApiResponse<BusinessReferral[]>>('/admin/referrals/business'),

  creditTypeAReferral: (id: string) =>
    apiClient.patch<ApiResponse<BusinessReferral>>(`/admin/referrals/business/${id}/credit`),
  */

  // Subscriptions Control
  getAllSubscriptions: () =>
    apiClient.get<ApiResponse<PlatformSubscription[]>>('/admin/subscriptions'),

  updateSubscriptionStatus: (businessId: string, status: string) =>
    apiClient.patch<ApiResponse<PlatformSubscription>>(`/admin/subscriptions/${businessId}/status`, { status }),
};
