import { apiClient } from './client';
import { ApiResponse, Announcement, AnnouncementAudience } from '@/types/api.types';

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  content?: string;
  audience: AnnouncementAudience;
  targetAudience?: AnnouncementAudience;
}

export const announcementApi = {
  create: (businessId: string, data: CreateAnnouncementInput) =>
    apiClient.post<ApiResponse<Announcement>>(`/businesses/${businessId}/announcements`, data),

  listByBusiness: (businessId: string) =>
    apiClient.get<ApiResponse<Announcement[]>>(`/businesses/${businessId}/announcements`),
};
