// ── Shared Frontend Types ─────────────────────────────────────────

import type { Role } from '../utils/roles'
export type UserRole = Role

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

export interface IChallengeAttachment {
  _id: string
  fileKey: string
  originalName: string
  size: number
  sha256: string
  contentType: string
}

export interface IChallenge {
  emailsQueued?: boolean;
  _id: string
  title: string
  slug: string
  description: string
  challengeUrl?: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  points: number
  flag?: string  // Legacy: deprecated
  flags?: IFlag[]  // New: for multi-flag story-based challenges
  hints: IHint[]
  files: IFile[]
  attachments: Array<string | IChallengeAttachment>
  solveCount: number
  writeupCount?: number
  isActive: boolean
  status: ChallengeStatus
  rejectionReason?: string | null
  isSolved?: boolean
  totalFlags?: number
  completedFlags?: number
  completedSequences?: number[]
  completedAt?: string | null
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
  username: z.string().trim().toLowerCase().min(1, 'Enter your username or email').max(254).refine(value => value.includes('@') ? z.string().email().safeParse(value).success : /^[a-zA-Z0-9_-]{3,30}$/.test(value), 'Enter a valid username or email address'),
  password: z.string().min(1, 'Password is required').max(256, 'Password cannot exceed 256 characters'),
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254, 'Email cannot exceed 254 characters'),
  username: z
    .string().trim().toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .refine(password => new TextEncoder().encode(password).length <= 72, 'Keep your password within 72 bytes'),
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
