import api from './api';

export interface INotification {
  _id: string;
  userId: string;
  type: 'challenge_submitted' | 'challenge_approved' | 'challenge_rejected' | 'challenge_solved' | 'system';
  title: string;
  message: string;
  challengeId?: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (filter?: { read?: boolean }, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (filter?.read !== undefined) {
      params.append('read', String(filter.read));
    }
    const response = await api.get<{ data: INotification[] }>(`/notifications?${params.toString()}`, { signal });
    return response.data.data;
  },

  getUnreadCount: async (signal?: AbortSignal) => {
    const response = await api.get<{ data: { unreadCount: number } }>('/notifications/unread-count', { signal });
    return Number(response.data?.data?.unreadCount ?? 0);
  },

  setRead: async (notificationId: string, read: boolean) => {
    const response = await api.patch<{ data: INotification }>(`/notifications/${notificationId}/read`, { read });
    return response.data.data;
  },

  markAllAsRead: async (ids: string[]) => {
    await api.patch('/notifications/read/all', { ids });
  },

  deleteNotification: async (notificationId: string) => {
    await api.delete(`/notifications/${notificationId}`);
  },

  clearAll: async (ids: string[]) => {
    await api.delete('/notifications', { data: { ids } });
  },
};
