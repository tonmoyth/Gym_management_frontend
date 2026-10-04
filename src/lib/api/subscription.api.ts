import { apiClient } from './client';
import {
  ApiResponse,
  PaginatedResponse,
  PlatformSubscription,
  SubscriptionPlan,
  PaymentAccount,
  SubscriptionStatusOverview,
  SubscriptionPayment,
  PaymentAccountType,
} from '@/types/api.types';

export interface SubmitSubscriptionPaymentDto {
  subscriptionPlanId: string;
  paymentAccountId: string;
  paymentMethod: PaymentAccountType;
  transactionId: string;
  paymentProof?: string;
}

export interface SubscriptionPaymentsQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const subscriptionApi = {
  // Legacy / me
  getMySubscription: () =>
    apiClient.get<ApiResponse<PlatformSubscription>>('/subscription/me'),

  // Available plans for subscription
  getActivePlans: () =>
    apiClient.get<ApiResponse<SubscriptionPlan[]>>('/subscription/plans'),

  // Super Admin receiving accounts for payment instructions
  getPaymentAccounts: () =>
    apiClient.get<ApiResponse<PaymentAccount[]>>('/subscription/payment-accounts'),

  // Real-time subscription state & overview for current business
  getStatus: () =>
    apiClient.get<ApiResponse<SubscriptionStatusOverview>>('/subscription/status'),

  // Initial subscription payment submission
  pay: (data: SubmitSubscriptionPaymentDto) =>
    apiClient.post<ApiResponse<{ payment: SubscriptionPayment }>>('/subscription/pay', data),

  // Subscription renewal payment submission
  renew: (data: SubmitSubscriptionPaymentDto) =>
    apiClient.post<ApiResponse<{ payment: SubscriptionPayment }>>('/subscription/renew', data),

  // Gym's payment history
  getPayments: (params?: SubscriptionPaymentsQueryParams) =>
    apiClient.get<ApiResponse<SubscriptionPayment[]> | PaginatedResponse<SubscriptionPayment>>(
      '/subscription/payments',
      { params }
    ),
};
