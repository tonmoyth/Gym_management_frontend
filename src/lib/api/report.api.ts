import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';

export interface RevenueReportParams {
  period?: 'month' | 'quarter' | 'year' | 'all' | 'custom';
  year?: string;
  month?: string;
  quarter?: string;
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalMemberships: number;
  averageMembershipValue: number;
  growthPercentage: number;
}

export interface RevenueChartItem {
  label: string;
  revenue: number;
}

export interface TopPlanItem {
  planId: string;
  planName: string;
  totalSales: number;
  revenue: number;
}

export interface GatewayBreakdownItem {
  gateway: string;
  count: number;
  amount: number;
}

export interface RecentTransactionItem {
  id: string;
  amount: number;
  currency: string;
  gateway: string;
  transactionId: string;
  createdAt: string;
  payer: {
    name: string;
    email: string;
    image: string;
  };
  planName: string;
}

export interface RevenueReportData {
  summary: RevenueSummary;
  chart: RevenueChartItem[];
  topPlans: TopPlanItem[];
  gatewayBreakdown?: GatewayBreakdownItem[];
  recentTransactions?: RecentTransactionItem[];
  // Backwards compatible top-level aliases
  totalRevenue?: number;
  totalTransactions?: number;
  averageTicket?: number;
  total?: number;
  count?: number;
  breakdown?: Array<{
    planName: string;
    count: number;
    amount: number;
  }>;
}

export interface PayoutReportParams {
  status?: 'PENDING' | 'PAID';
  trainerId?: string;
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number | string;
  limit?: number | string;
}

export interface PayoutSummary {
  totalPaid: number;
  pendingAmount: number;
  failedAmount: number;
  totalPayouts: number;
}

export interface PayoutRecord {
  id: string;
  trainer: {
    id: string;
    name: string;
    email: string;
    profilePhoto: string;
  };
  amount: number;
  status: 'PENDING' | 'PAID';
  paymentDate: string | null;
  reference: string;
  month?: string;
  createdAt?: string;
}

export interface TrainerCompensationSummary {
  id: string;
  trainerName: string;
  email: string;
  profilePhoto: string;
  status: 'PENDING' | 'PAID';
  totalPayout: number;
  paymentDate: string | null;
  reference: string;
  monthsCount: number;
}

export interface PayoutReportData {
  summary: PayoutSummary;
  payouts: PayoutRecord[];
  trainers?: TrainerCompensationSummary[];
  totalPaid?: number;
  pendingAmount?: number;
  totalAmount?: number;
}

export const reportApi = {
  getRevenueReport: (businessId: string, params?: RevenueReportParams) =>
    apiClient.get<ApiResponse<RevenueReportData>>(`/businesses/${businessId}/reports/revenue`, { params }),

  getPayoutReport: (businessId: string, params?: PayoutReportParams) =>
    apiClient.get<ApiResponse<PayoutReportData>>(`/businesses/${businessId}/reports/payouts`, { params }),
};
