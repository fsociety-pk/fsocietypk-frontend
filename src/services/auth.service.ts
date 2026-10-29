import api from './api';
import { IUser, LoginInput, RegisterInput } from '../types';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: IUser;
    token?: string;
  };
}

// Response for /auth/me endpoint (returns user directly, not wrapped in { user })
export interface GetMeResponse {
  success: boolean;
  message: string;
  data: IUser;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: { registrationId: string; retryAfter: number; expiresIn: number };
}
export const authService = {
  usernameAvailability: async (username: string, signal?: AbortSignal): Promise<{ username: string; available: boolean }> => {
    const response = await api.get<{ data: { username: string; available: boolean } }>('/auth/username-availability', { params: { username }, signal });
    const data = response.data.data;
    if (data?.username !== username || typeof data?.available !== 'boolean') throw new Error('Invalid username availability response');
    return data;
  },
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<RegistrationResponse> => {
    const response = await api.post<RegistrationResponse>('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (registrationId: string, code: string): Promise<AuthResponse> => {
    return (await api.post<AuthResponse>('/auth/verify-email', { registrationId, code })).data;
  },
  resendOtp: async (registrationId: string): Promise<{ data: { retryAfter: number; expiresIn: number } }> => {
    return (await api.post('/auth/resend-otp', { registrationId })).data;
  },
  logout: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  getMe: async (signal?: AbortSignal): Promise<GetMeResponse> => {
    const response = await api.get<GetMeResponse>('/auth/me', { signal });
    return response.data;
  },
};
