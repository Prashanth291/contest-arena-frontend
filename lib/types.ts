// ═══════════════════════════════════════════════════════
// TypeScript Types — All DTOs from Backend Audit
// ═══════════════════════════════════════════════════════

// ── Auth Service ──────────────────────────────────────

export type Role = 'USER' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'GITHUB';

export interface AuthResponse {
  token: string;
  username: string;
  userId: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;       // email
  role: Role;
  userId: string;
  iat: number;
  exp: number;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: Role;
}

// ── Contest Service ───────────────────────────────────

export type ContestStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ContestRequest {
  title: string;
  description: string;
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  createdBy: string;
  password?: string;
}

export interface ContestProblemSummary {
  problemId: string;
  title: string;
  label: string;
  problemOrder: number;
  score: number;
}

export interface ContestResponse {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: ContestStatus;
  createdBy: string;
  joinCode: string;
  problems: ContestProblemSummary[];
}

export interface AssignProblemRequest {
  problemId: string;
  label: string;
  problemOrder: number;
  score: number;
}

export interface JoinContestRequest {
  password?: string;
}

// ── Problem Service ──────────────────────────────────

export interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface ProblemRequest {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  baseScore: number;
  createdBy: string;
  testCases: TestCase[];
}

export interface ProblemResponse {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  baseScore: number;
  createdBy: string;
  createdAt: string;
  testCases: TestCase[];
}

// ── Leaderboard Service ──────────────────────────────

export interface LeaderboardEntry {
  userId: string;
  username: string;
  solvedCount: number;
  totalScore: number;
  totalPenalty: number;
  rank: number;
  lastAcAt: string | null;
}

export type Verdict = 'AC' | 'WA';

export interface LeaderboardUpdate {
  contestId: string;
  userId: string;
  username: string;
  problemId: string;
  problemLabel: string;
  verdict: Verdict;
  solvedCount: number;
  totalScore: number;
  totalPenalty: number;
  scoreEarned: number;
  penaltyAdded: number;
  newRank: number;
}

// ── Kafka Events (for mock execution) ────────────────

export interface SubmissionResultEvent {
  submissionId: string;
  userId: string;
  username: string;
  contestId: string;
  problemId: string;
  verdict: Verdict;
  submittedAt: string;
  score: number;
}

// ── API Error ────────────────────────────────────────

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// ── Frontend-only types ──────────────────────────────

export type SubmissionStatus = 'idle' | 'submitting' | 'accepted' | 'wrong_answer';

export interface Submission {
  id: string;
  problemId: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  verdict?: Verdict;
  submittedAt: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
