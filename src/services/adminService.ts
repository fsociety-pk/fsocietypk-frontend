import apiClient from './apiClient';
import { ApiResponse, IUser, IChallenge, IAnalyticsData } from '../types';
import type { Role } from '../utils/roles';

export interface AdminStats {
  totalUsers: number;
  totalChallenges: number;
  pendingChallenges: number;
  totalSubmissions: number;
  totalPointsPlatform: number;
  pendingWriteups: number;
  pendingResources: number;
  totalProjects: number;
  bannedUsers: number;
}

export interface AdminChallengeUpdate {
  title?: string; description?: string; category?: IChallenge['category']; difficulty?: IChallenge['difficulty'];
  challengeUrl?: string; hints?: { content: string; cost: number }[];
  flags?: { sequence: number; value: string }[];
}
export interface BackendStatus {
  checkedAt: string; status: 'online' | 'degraded';
  backend: { environment: string; nodeVersion: string; processUptimeSeconds: number; rssBytes: number; heapUsedBytes: number };
  host: { hostname: string; platform: string; cpuCores: number; loadAverage: number[]; totalMemoryBytes: number; freeMemoryBytes: number; uptimeSeconds: number; disk: { totalBytes: number; availableBytes: number; usedPercent: number } | null };
  database: { connected: boolean; latencyMs: number | null };
  email: { configured: boolean; queue: Record<string, number> | null; workerPollSeconds: number; maxAttempts: number };
}

export interface UserManagementList {
  protectedAdminId?: string;
  users: (IUser & { email?: string })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

// ── Admin API service ─────────────────────────────────────────────
export const adminService = {
  getSystemStatus: async (): Promise<ApiResponse<BackendStatus>> => (await apiClient.get('/admin/system/status')).data,
  testEmail: async () => (await apiClient.post('/admin/system/email-test')).data,
  retryEmails: async (): Promise<ApiResponse<{ retried: number }>> => (await apiClient.post('/admin/system/email-retry')).data,
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    const { data } = await apiClient.get('/admin/stats');
    return data;
  },

  getUsers: async (page = 1, limit = 25, search = '', status = 'all', role = 'user'): Promise<ApiResponse<UserManagementList>> => {
    const { data } = await apiClient.get('/admin/users', { params: { page, limit, search, status, role } });
    return data;
  },
  updateRole: async (id: string, role: Role): Promise<ApiResponse<IUser>> => (await apiClient.patch(`/admin/users/${id}/role`, { role })).data,

  toggleBan: async (userId: string): Promise<ApiResponse<IUser>> => {
    const { data } = await apiClient.patch(`/admin/users/${userId}/ban`);
    return data;
  },

  getChallenges: async (status?: string): Promise<ApiResponse<IChallenge[]>> => {
    const { data } = await apiClient.get('/admin/challenges', { params: { status } });
    return data;
  },

  getChallenge: async (id: string): Promise<ApiResponse<IChallenge>> => (await apiClient.get(`/admin/challenges/${id}`)).data,
  updateChallenge: async (id: string, payload: AdminChallengeUpdate): Promise<ApiResponse<IChallenge>> => (await apiClient.patch(`/admin/challenges/${id}`, payload)).data,
  createChallenge: async (payload: FormData) => (await apiClient.post('/admin/challenges', payload, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 })).data,

  updateChallengeStatus: async (
    id: string,
    status: string,
    rejectionReason?: string,
    isActive?: boolean,
  ): Promise<ApiResponse<IChallenge>> => {
    const { data } = await apiClient.patch(`/admin/challenges/${id}/status`, {
      status,
      rejectionReason,
      isActive,
    });
    return data;
  },

  deleteChallenge: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/admin/challenges/${id}`);
    return data;
  },

  updateChallengeLiveStatus: async (
    id: string,
    liveStatus: string,
  ): Promise<ApiResponse<IChallenge>> => {
    const { data } = await apiClient.patch(`/admin/challenges/${id}/live-status`, {
      liveStatus,
    });
    return data;
  },

  // Announcements
  createAnnouncement: async (payload: { title: string; message: string; targetRole?: string }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/admin/announcements', payload);
    return data;
  },

  getAnnouncements: async (): Promise<ApiResponse<any[]>> => {
    const { data } = await apiClient.get('/admin/announcements');
    return data;
  },
  updateAnnouncement: async (id: string, isActive: boolean): Promise<ApiResponse<{ emailsQueued?: boolean }>> => (await apiClient.patch(`/admin/announcements/${id}`, { isActive })).data,

  getAnalytics: async (): Promise<ApiResponse<IAnalyticsData>> => {
    const { data } = await apiClient.get('/admin/analytics');
    return data;
  },
};
