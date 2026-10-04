import { apiClient } from './client';
import {
  ApiResponse,
  PaginatedResponse,
  PaymentAccount,
  PaymentAccountType,
  PaymentAccountStatus,
} from '@/types/api.types';

export interface CreatePaymentAccountDto {
  accountType: PaymentAccountType;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentAccountDto {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  isDefault?: boolean;
  status?: PaymentAccountStatus;
}

export interface PaymentAccountQueryParams {
  accountType?: PaymentAccountType;
  status?: PaymentAccountStatus;
  isDefault?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export const paymentAccountApi = {
  getAll: (params?: PaymentAccountQueryParams) =>
    apiClient.get<ApiResponse<PaymentAccount[]> | PaginatedResponse<PaymentAccount>>(
      '/payment-accounts',
      { params }
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<PaymentAccount>>(`/payment-accounts/${id}`),

  create: (data: CreatePaymentAccountDto) =>
    apiClient.post<ApiResponse<PaymentAccount>>('/payment-accounts', data),

  update: (id: string, data: UpdatePaymentAccountDto) =>
    apiClient.patch<ApiResponse<PaymentAccount>>(`/payment-accounts/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/payment-accounts/${id}`),

  getByBusiness: (businessId: string) =>
    apiClient.get<ApiResponse<PaymentAccount[]>>(`/payment-accounts/business/${businessId}`),

  getByPlan: (planId: string) =>
    apiClient.get<
      ApiResponse<{
        plan: any;
        business: {
          id: string;
          name: string;
          logo?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
        };
        paymentAccounts: PaymentAccount[];
      }>
    >(`/payment-accounts/plan/${planId}`),
};
