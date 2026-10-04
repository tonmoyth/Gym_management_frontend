import { apiClient } from './client';
import { ApiResponse, Favorite } from '@/types/api.types';

export interface GetFavoritesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const favoriteApi = {
  add: (businessId: string) =>
    apiClient.post<ApiResponse<Favorite>>('/favorites', { businessId }),

  getMyFavorites: (params?: GetFavoritesParams) =>
    apiClient.get<ApiResponse<Favorite[]>>('/favorites', { params }),

  remove: (businessId: string) =>
    apiClient.delete<ApiResponse<null>>(`/favorites/${businessId}`),
};

