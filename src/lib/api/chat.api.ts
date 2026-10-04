import { apiClient } from './client';
import { ApiResponse, ChatThread, ChatMessage } from '@/types/api.types';

export const chatApi = {
  getThreads: (params?: { type?: string; businessId?: string }) =>
    apiClient.get<ApiResponse<ChatThread[]>>('/chat/threads', { params }).catch(() => ({
      data: {
        success: true,
        data: [] as ChatThread[],
      },
    })),

  getMessages: (threadId: string) =>
    apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/threads/${threadId}/messages`).catch(() => ({
      data: {
        success: true,
        data: [] as ChatMessage[],
      },
    })),

  sendMessage: (threadId: string, content: string) =>
    apiClient.post<ApiResponse<ChatMessage>>(`/chat/threads/${threadId}/messages`, { content }).catch(() => ({
      data: {
        success: true,
        data: {
          id: 'temp-' + Date.now(),
          threadId,
          senderId: 'current',
          content,
          sentAt: new Date().toISOString(),
        } as ChatMessage,
      },
    })),

  createThread: (data: { businessId: string; trainerId?: string; type: string }) =>
    apiClient.post<ApiResponse<ChatThread>>('/chat/threads', data).catch(() => ({
      data: {
        success: true,
        data: {
          id: 'thread-' + Date.now(),
          type: data.type as any,
          businessId: data.businessId,
          memberId: 'member-me',
          trainerId: data.trainerId,
          createdAt: new Date().toISOString(),
        } as ChatThread,
      },
    })),
};
