import apiClient from './apiClient';
import { ApiResponse } from '../types';

export interface Writeup {
  _id: string;
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  challengeId: {
    _id: string;
    title: string;
    category: string;
    points?: number;
    difficulty?: string;
  };
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WriteupPayload {
  challengeId: string;
  title: string;
  content: string;
}

export const writeupService = {
  getAdminWriteups: async (page = 1, limit = 10, status = 'pending'): Promise<ApiResponse<{ writeups: Writeup[]; pagination: { page: number; limit: number; total: number; pages: number } }>> => (await apiClient.get('/admin/writeups', { params: { page, limit, status } })).data,
  // Submit new writeup
  submitWriteup: async (payload: WriteupPayload): Promise<ApiResponse<Writeup>> => {
    const { data } = await apiClient.post('/writeups', payload);
    return data;
  },

  // Get approved writeups for a challenge
  getWriteupsForChallenge: async (
    challengeId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ writeups: Writeup[]; pagination: any }>> => {
    const { data } = await apiClient.get(`/writeups/challenge/${challengeId}`, {
      params: { page, limit },
    });
    return data;
  },

  // Get user's writeups
  getUserWriteups: async (page = 1, limit = 10): Promise<ApiResponse<{ writeups: Writeup[]; pagination: any }>> => {
    const { data } = await apiClient.get('/writeups/user/me', {
      params: { page, limit },
    });
    return data;
  },

  // Get specific writeup by ID
  getWriteupById: async (id: string): Promise<ApiResponse<Writeup>> => {
    const { data } = await apiClient.get(`/writeups/${id}`);
    return data;
  },

  // Update writeup
  updateWriteup: async (id: string, payload: Partial<WriteupPayload>): Promise<ApiResponse<Writeup>> => {
    const { data } = await apiClient.put(`/writeups/${id}`, payload);
    return data;
  },

  // Delete writeup
  deleteWriteup: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/writeups/${id}`);
    return data;
  },

  // Admin: Get pending writeups
  getPendingWriteups: async (page = 1, limit = 10): Promise<ApiResponse<{ writeups: Writeup[]; pagination: any }>> => {
    const { data } = await apiClient.get('/writeups/admin/pending', {
      params: { page, limit },
    });
    return data;
  },

  // Admin: Approve writeup
  approveWriteup: async (id: string): Promise<ApiResponse<Writeup>> => {
    const { data } = await apiClient.put(`/writeups/${id}/approve`);
    return data;
  },

  // Admin: Reject writeup
  rejectWriteup: async (id: string, adminNotes?: string): Promise<ApiResponse<Writeup>> => {
    const { data } = await apiClient.put(`/writeups/${id}/reject`, { adminNotes });
    return data;
  },
};
