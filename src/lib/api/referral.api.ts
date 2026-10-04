// Referral system temporarily disabled - will be implemented later
/*
import { apiClient } from './client';
import { ApiResponse, MemberReferral, MemberReferralSetting, BusinessReferral } from '@/types/api.types';

export const referralApi = {
  // Member
  getMyCode: () =>
    apiClient.get<ApiResponse<{ referralCode: string }>>('/referrals/my-code'),

  getMyReferrals: () =>
    apiClient.get<ApiResponse<MemberReferral[]>>('/referrals/member/me'),

  registerMemberReferral: (data: { referralCode: string; businessId: string }) =>
    apiClient.post<ApiResponse<MemberReferral>>('/referrals/member', data),

  // Owner
  getOwnerMemberReferrals: (params?: any) =>
    apiClient.get<ApiResponse<MemberReferral[]>>('/referrals/member', { params }),

  creditMemberReferral: (id: string) =>
    apiClient.patch<ApiResponse<MemberReferral>>(`/referrals/member/${id}/credit`),

  getReferralSettings: (businessId: string) =>
    apiClient.get<ApiResponse<MemberReferralSetting>>(`/businesses/${businessId}/referral-settings`),

  setReferralSettings: (businessId: string, data: { commissionAmount: number; referralDiscount?: number; isEnabled?: boolean }) =>
    apiClient.put<ApiResponse<MemberReferralSetting>>(`/businesses/${businessId}/referral-settings`, data),

  // Type A (Business Referrals)
  getMyBusinessReferralCode: () =>
    apiClient.get<ApiResponse<{ referralCode: string }>>('/referrals/business/my-code'),

  getMyBusinessReferrals: () =>
    apiClient.get<ApiResponse<BusinessReferral[]>>('/referrals/business/me'),

  registerBusinessReferral: (data: { referralCode: string; businessId: string }) =>
    apiClient.post<ApiResponse<BusinessReferral>>('/referrals/business', data),
};
*/

export const referralApi = {} as any;
