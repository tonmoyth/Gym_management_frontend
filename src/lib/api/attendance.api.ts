import { apiClient } from './client';
import {
  ApiResponse,
  AttendanceLog,
  AttendanceSummary,
  BiometricDevice,
  TodayAttendanceSummary,
  AttendanceReportParams,
  TestDeviceAttendanceInput,
} from '@/types/api.types';

export type { TodayAttendanceSummary };

export interface MyAttendanceData {
  summary: AttendanceSummary;
  history: {
    id?: string;
    date: string;
    checkIn?: string | null;
    checkOut?: string | null;
    duration?: string;
    business?: string;
    businessName?: string;
    method?: string;
  }[];
}

export const attendanceApi = {
  // Member actions
  checkIn: (businessId: string) =>
    apiClient.post<ApiResponse<AttendanceLog>>('/check-in', { businessId }),

  checkOut: (businessId: string) =>
    apiClient.post<ApiResponse<AttendanceLog>>('/check-out', { businessId }),

  getMyAttendance: (params?: { dateFrom?: string; dateTo?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<MyAttendanceData>>('/me', { params }),

  // Business Owner actions
  getReport: (businessId: string, params?: AttendanceReportParams) =>
    apiClient.get<ApiResponse<AttendanceLog[]>>(`/businesses/${businessId}/attendance`, { params }),

  getTodaySummary: async (businessId: string) => {
    const res = await apiClient.get<ApiResponse<TodayAttendanceSummary>>(
      `/businesses/${businessId}/attendance/today`
    );
    if (res.data?.data) {
      const d = res.data.data;
      // Guarantee both naming conventions work seamlessly
      d.totalCheckIns = d.totalCheckIn ?? d.totalCheckIns ?? 0;
      d.totalCheckIn = d.totalCheckIn ?? d.totalCheckIns ?? 0;
      d.totalCheckOuts = d.totalCheckOut ?? d.totalCheckOuts ?? 0;
      d.totalCheckOut = d.totalCheckOut ?? d.totalCheckOuts ?? 0;
      d.currentlyInside = d.currentlyInside ?? d.currentlyPresent ?? 0;
      d.currentlyPresent = d.currentlyInside ?? d.currentlyPresent ?? 0;
      d.attendanceRate = d.attendanceRate ?? 0;
    }
    return res;
  },

  getMemberHistory: (
    businessId: string,
    memberId: string,
    params?: { dateFrom?: string; dateTo?: string; page?: number; limit?: number }
  ) =>
    apiClient.get<ApiResponse<AttendanceLog[]>>(
      `/businesses/${businessId}/attendance/member/${memberId}`,
      { params }
    ),

  // Biometric Devices
  registerDevice: (businessId: string, data: { name: string; serialNumber: string; brand: string }) =>
    apiClient.post<ApiResponse<BiometricDevice>>(`/businesses/${businessId}/devices`, data),

  getDevices: (businessId: string, params?: { searchTerm?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<BiometricDevice[]>>(`/businesses/${businessId}/devices`, { params }),

  deleteDevice: (businessId: string, deviceId: string) =>
    apiClient.delete<ApiResponse<null>>(`/businesses/${businessId}/devices/${deviceId}`),

  // Hardware Testing & Simulation (Public/Owner POST /device)
  testDevice: (data: TestDeviceAttendanceInput) =>
    apiClient.post<ApiResponse<{ processed: number; total: number }>>('/device', data),
};

