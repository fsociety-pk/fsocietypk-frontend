import apiClient from './apiClient'
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, IUser } from '../types'

// ── Auth API service ──────────────────────────────────────────────
export const authService = {

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/login', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  getMe: async (): Promise<ApiResponse<IUser>> => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  refreshToken: async (): Promise<void> => {
    return Promise.resolve()
  },
}
