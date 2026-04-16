import apiClient from './apiClient'
import type { ApiResponse, IChallenge, PaginationMeta } from '../types'

interface ChallengeFilters {
  page?: number
  limit?: number
  category?: string
  difficulty?: string
  search?: string
}

interface ChallengesResponse {
  challenges: IChallenge[]
  meta: PaginationMeta
}

interface SubmitFlagPayload {
  flag: string
}

interface SubmitFlagResponse {
  correct: boolean
  pointsAwarded?: number
  message: string
}

// ── Challenge API service ─────────────────────────────────────────
export const challengeService = {

  getAll: async (filters: ChallengeFilters = {}): Promise<ApiResponse<ChallengesResponse>> => {
    const { data } = await apiClient.get('/challenges', { params: filters })
    return data
  },

  getById: async (id: string): Promise<ApiResponse<IChallenge>> => {
    const { data } = await apiClient.get(`/challenges/${id}`)
    return data
  },

  getBySlug: async (slug: string): Promise<ApiResponse<IChallenge>> => {
    const { data } = await apiClient.get(`/challenges/slug/${slug}`)
    return data
  },

  submitFlag: async (id: string, payload: SubmitFlagPayload): Promise<ApiResponse<SubmitFlagResponse>> => {
    const { data } = await apiClient.post(`/challenges/${id}/submit`, payload)
    return data
  },

  getRecentSolvers: async (id: string): Promise<ApiResponse<any[]>> => {
    const { data } = await apiClient.get(`/challenges/${id}/solvers`)
    return data
  },

  unlockHint: async (challengeId: string, hintId: string): Promise<ApiResponse<{ content: string }>> => {
    const { data } = await apiClient.post(`/challenges/${challengeId}/hints/${hintId}/unlock`)
    return data
  },
}
