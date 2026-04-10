import api from './api';
import { IChallenge, ApiResponse } from '../types';

export interface SubmitFlagResponse {
  correct: boolean;
  points?: number;
}

export interface UnlockHintResponse {
  content: string;
}

export interface SubmitChallengePayload {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  flag: string;
  hints?: string[];
  attachments?: string[];
}

export interface SubmitChallengeResponse {
  _id: string;
  title: string;
  status: string;
  difficulty: string;
  points: number;
}

export const challengeService = {
  /** Get all approved active challenges */
  getChallenges: async (): Promise<ApiResponse<IChallenge[]>> => {
    const response = await api.get<ApiResponse<IChallenge[]>>('/challenges');
    return response.data;
  },

  /** Get single challenge details (approved) */
  getChallengeById: async (id: string): Promise<ApiResponse<IChallenge & { isSolved: boolean }>> => {
    const response = await api.get<ApiResponse<IChallenge & { isSolved: boolean }>>(`/challenges/${id}`);
    return response.data;
  },

  /** Submit a flag for a challenge */
  submitFlag: async (challengeId: string, flag: string): Promise<ApiResponse<SubmitFlagResponse>> => {
    const response = await api.post<ApiResponse<SubmitFlagResponse>>('/challenges/submit', {
      challengeId,
      flag,
    });
    return response.data;
  },

  /** Unlock a single hint for a challenge */
  unlockHint: async (
    challengeId: string,
    hintId: string
  ): Promise<ApiResponse<UnlockHintResponse>> => {
    const attempts = [
      () => api.post(`/challenges/${challengeId}/hints/${hintId}/unlock`),
      () => api.post(`/challenges/hints/${hintId}/unlock`, { challengeId }),
      () => api.post(`/hints/${hintId}/unlock`, { challengeId }),
      () => api.post('/challenges/unlock-hint', { challengeId, hintId }),
    ];

    let lastError: any = null;

    for (const attempt of attempts) {
      try {
        const response = await attempt();
        const payload: any = response.data;

        if (payload?.data?.content) {
          return payload as ApiResponse<UnlockHintResponse>;
        }

        if (typeof payload?.content === 'string') {
          return {
            success: true,
            statusCode: 200,
            message: 'Hint unlocked',
            data: { content: payload.content },
          };
        }
      } catch (error: any) {
        lastError = error;
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    throw lastError;
  },

  /** Submit a new challenge for admin review */
  createChallenge: async (
    payload: SubmitChallengePayload
  ): Promise<ApiResponse<SubmitChallengeResponse>> => {
    const response = await api.post<ApiResponse<SubmitChallengeResponse>>('/challenges', payload);
    return response.data;
  },

  /** Get the current user's submitted challenges (all statuses) */
  getMySubmissions: async (): Promise<ApiResponse<IChallenge[]>> => {
    const response = await api.get<ApiResponse<IChallenge[]>>('/challenges/my-submissions');
    return response.data;
  },
};
