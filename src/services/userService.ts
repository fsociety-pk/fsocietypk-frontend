import apiClient from './apiClient';
import { ApiResponse, IUser } from '../types';

export interface UserProfile extends IUser {
  rank: number;
  grade?: string;
  solveHistory: any[];
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  username?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  isProfilePublic?: boolean;
}

// ── User API service ──────────────────────────────────────────────
export const userService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const { data } = await apiClient.get('/users/me/profile');
    return data;
  },

  getPublicProfile: async (username: string): Promise<ApiResponse<UserProfile>> => {
    const { data } = await apiClient.get(`/users/${username}/profile`);
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> => {
    const { data } = await apiClient.put('/users/me/profile', payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
    // Don't send confirmPassword to backend
    const { confirmPassword, ...rest } = payload;
    const { data } = await apiClient.post('/users/me/change-password', rest);
    return data;
  },
};
