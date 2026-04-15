// ── Shared Frontend Types ─────────────────────────────────────────

export type UserRole = 'user' | 'admin'

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'insane'

export type ChallengeCategory =
  | 'web'
  | 'pwn'
  | 'rev'
  | 'crypto'
  | 'forensics'
  | 'osint'
  | 'misc'
  | 'stego'
  | 'network'
  | 'mobile'

export interface ISocialLinks {
  linkedin?: string
  github?: string
  instagram?: string
}

export interface IUser {
  _id: string
  username: string
  role: UserRole
  avatar?: string
  bio?: string
  country?: string
  score: number
  solvedChallenges: string[]
  isBanned: boolean
  createdAt: string
  updatedAt: string
  isProfilePublic: boolean
  socialLinks?: ISocialLinks
}

export type ChallengeStatus = 'pending' | 'approved' | 'rejected'

// ── Challenge ─────────────────────────────────────────────────
export type ChallengeLiveStatus = 'live' | 'ended'

export interface IFlag {
  sequence: number
  value: string
}

export interface IChallenge {
  _id: string
  title: string
  slug: string
  description: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  points: number
  flag?: string  // Legacy: deprecated
  flags?: IFlag[]  // New: for multi-flag story-based challenges
  hints: IHint[]
  files: IFile[]
  attachments: string[]
  solveCount: number
  isActive: boolean
  status: ChallengeStatus
  rejectionReason?: string | null
  isSolved?: boolean
  createdBy?: string | IUser
  author?: string | IUser
  liveStatus?: ChallengeLiveStatus
  createdAt: string
  updatedAt: string
}

export interface IHint {
  _id: string
  content: string
  cost: number
}

export interface IFile {
  _id: string
  filename: string
  url: string
  size: number
}

// ── Submission ─────────────────────────────────────────────────
export interface ISubmission {
  _id: string
  userId?: string | IUser
  challengeId?: string | IChallenge
  submittedFlag?: string
  isCorrect?: boolean
  pointsAwarded: number
  timestamp?: string
  // legacy aliases
  challenge?: string | IChallenge
  status?: 'correct' | 'incorrect'
  createdAt?: string
}

// ── Leaderboard ───────────────────────────────────────────────────
export interface ILeaderboardEntry {
  rank: number
  user: Pick<IUser, '_id' | 'username' | 'avatar' | 'country' | 'score'>
  solvedCount: number
  lastSolveAt: string
}

// ── API response shapes ───────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ── Analytics ─────────────────────────────────────────────────────
export interface IAnalyticsData {
  overview: {
    totalUsers: number;
    totalChallenges: number;
    totalSolves: number;
  };
  userGrowth: { date: string; count: number }[];
  submissionTrend: { date: string; solves: number }[];
  topChallenges: {
    title: string;
    solveCount: number;
    category: ChallengeCategory;
  }[];
  categoryStats: { category: string; count: number }[];
  difficultyStats: { difficulty: string; count: number }[];
}

import { z } from 'zod';

// ... existing code ...

// ── Auth ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginPayload = LoginInput;
export type RegisterPayload = RegisterInput;

export interface AuthResponse {
  user: IUser;
  token?: string;
}

// ── Admin Profile ─────────────────────────────────────────────────
export interface IAdminProfile {
  name: string;
  bio: string;
  profileImage: string;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

