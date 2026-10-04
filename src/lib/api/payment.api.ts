import { apiClient } from './client';
import { ApiResponse, Payment, PaymentGateway, Invoice } from '@/types/api.types';

export interface InitiatePaymentInput {
  membershipId?: string;
  subscriptionId?: string;
  gateway: PaymentGateway;
  amount: number;
  currency?: string;
  senderPhone?: string;
  transactionId?: string;
}

export interface VerifiedSessionData {
  isPaid: boolean;
  sessionId: string;
  paymentId?: string | null;
  gatewayTransactionId?: string;
  amount: number;
  currency: string;
  status: string;
  payerName?: string;
  payerEmail?: string;
  planName?: string;
  planDuration?: number;
  businessName?: string;
  businessAddress?: string;
  membershipId?: string | null;
  membershipStatus?: string;
  paymentDate?: string;
}

export const paymentApi = {
  initiate: (data: InitiatePaymentInput) =>
    apiClient.post<ApiResponse<{ payment: Payment; gatewayUrl?: string; clientSecret?: string }>>('/payments/initiate', data),

  getMyPayments: () =>
    apiClient.get<ApiResponse<Payment[]>>('/payments/me'),

  getInvoice: (paymentId: string) =>
    apiClient.get<ApiResponse<Invoice>>(`/payments/${paymentId}/invoice`),

  verifySession: (sessionId: string) =>
    apiClient.get<ApiResponse<VerifiedSessionData>>(`/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`),
};
