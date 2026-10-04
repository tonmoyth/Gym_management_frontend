import { apiClient } from './client';
import { ApiResponse, ClassSchedule, ClassBooking } from '@/types/api.types';

export interface CreateClassInput {
  title: string;
  description?: string;
  daysOfWeek: string[];
  timeSlot?: string;
  startTime: string;
  endTime: string;
  startTimeStr?: string;
  endTimeStr?: string;
  capacity: number;
  trainerIds?: string[];
  trainerId?: string;
}

export const classScheduleApi = {
  create: (businessId: string, data: CreateClassInput) =>
    apiClient.post<ApiResponse<ClassSchedule>>(`/businesses/${businessId}/classes`, data),

  listByBusiness: (businessId: string, params?: any) =>
    apiClient.get<ApiResponse<ClassSchedule[]>>(`/businesses/${businessId}/classes`, { params }),

  getById: (businessId: string, classId: string) =>
    apiClient.get<ApiResponse<ClassSchedule>>(`/businesses/${businessId}/classes/${classId}`),

  update: (businessId: string, classId: string, data: Partial<CreateClassInput>) =>
    apiClient.patch<ApiResponse<ClassSchedule>>(`/businesses/${businessId}/classes/${classId}`, data),

  cancel: (businessId: string, classId: string) =>
    apiClient.delete<ApiResponse<null>>(`/businesses/${businessId}/classes/${classId}`),

  book: (classId: string) =>
    apiClient.post<ApiResponse<ClassBooking>>(`/classes/${classId}/book`),

  getMyBookings: () =>
    apiClient.get<ApiResponse<ClassBooking[]>>('/classes/my-bookings'),

  cancelBooking: (bookingId: string) =>
    apiClient.patch<ApiResponse<ClassBooking>>(`/classes/${bookingId}/cancel`),
};
