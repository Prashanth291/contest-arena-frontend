// ═══════════════════════════════════════════════════════
// API Client — Typed fetch wrappers for all 3 services
// ═══════════════════════════════════════════════════════

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ContestRequest,
  ContestResponse,
  AssignProblemRequest,
  JoinContestRequest,
  ProblemRequest,
  ProblemResponse,
  LeaderboardEntry,
  ApiError,
} from './types';

// ── Service base URLs (proxied through Next.js rewrites) ──
const AUTH_BASE = '/api/proxy/auth';
const CONTEST_BASE = '/api/proxy/contest';
const LEADERBOARD_BASE = '/api/proxy/leaderboard';

// ── Error class ──────────────────────────────────────

export class ApiRequestError extends Error {
  status: number;
  apiError?: ApiError;

  constructor(status: number, message: string, apiError?: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.apiError = apiError;
  }
}

// ── Core fetch wrapper ────────────────────────────────

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}

function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  includeAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const userId = getUserId();
    if (userId) {
      headers['X-User-Id'] = userId;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let apiError: ApiError | undefined;
    try {
      apiError = await response.json();
    } catch {
      // Response body wasn't JSON
    }
    throw new ApiRequestError(
      response.status,
      apiError?.message || `Request failed with status ${response.status}`,
      apiError,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Handle text responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/plain')) {
    return await response.text() as T;
  }

  return await response.json();
}

// ═══════════════════════════════════════════════════════
//  AUTH SERVICE API
// ═══════════════════════════════════════════════════════

export const authApi = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>(`${AUTH_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  register(data: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>(`${AUTH_BASE}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  getOAuthUrl(provider: 'google' | 'github'): string {
    return `http://localhost:8081/oauth2/authorization/${provider}`;
  },
};

// ═══════════════════════════════════════════════════════
//  CONTEST SERVICE API
// ═══════════════════════════════════════════════════════

export const contestApi = {
  // Contests
  createContest(data: ContestRequest): Promise<ContestResponse> {
    return request<ContestResponse>(`${CONTEST_BASE}/contests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getContests(): Promise<ContestResponse[]> {
    return request<ContestResponse[]>(`${CONTEST_BASE}/contests`);
  },

  getContest(id: string): Promise<ContestResponse> {
    return request<ContestResponse>(`${CONTEST_BASE}/contests/${id}`);
  },

  updateContest(id: string, data: ContestRequest): Promise<ContestResponse> {
    return request<ContestResponse>(`${CONTEST_BASE}/contests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteContest(id: string): Promise<void> {
    return request<void>(`${CONTEST_BASE}/contests/${id}`, {
      method: 'DELETE',
    });
  },

  startContest(id: string): Promise<string> {
    return request<string>(`${CONTEST_BASE}/contests/${id}/start`, {
      method: 'POST',
    });
  },

  joinContest(joinCode: string, data?: JoinContestRequest): Promise<string> {
    return request<string>(`${CONTEST_BASE}/contests/join/${joinCode}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  removeParticipant(contestId: string, participantId: string): Promise<void> {
    return request<void>(`${CONTEST_BASE}/contests/${contestId}/participants/${participantId}`, {
      method: 'DELETE',
    });
  },

  // Contest Problems assignment
  assignProblem(contestId: string, data: AssignProblemRequest): Promise<void> {
    return request<void>(`${CONTEST_BASE}/contests/${contestId}/problems`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeProblemFromContest(contestId: string, problemId: string): Promise<void> {
    return request<void>(`${CONTEST_BASE}/contests/${contestId}/problems/${problemId}`, {
      method: 'DELETE',
    });
  },

  // Problems
  createProblem(data: ProblemRequest): Promise<ProblemResponse> {
    return request<ProblemResponse>(`${CONTEST_BASE}/problems`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProblem(id: string): Promise<ProblemResponse> {
    const requesterId = getUserId();
    const query = requesterId ? `?requesterId=${encodeURIComponent(requesterId)}` : '';
    return request<ProblemResponse>(`${CONTEST_BASE}/problems/${id}${query}`);
  },

  updateProblem(id: string, data: ProblemRequest): Promise<ProblemResponse> {
    return request<ProblemResponse>(`${CONTEST_BASE}/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProblem(id: string): Promise<void> {
    return request<void>(`${CONTEST_BASE}/problems/${id}`, {
      method: 'DELETE',
    });
  },

  listProblems(): Promise<ProblemResponse[]> {
    const createdBy = getUserId();
    const query = createdBy ? `?createdBy=${encodeURIComponent(createdBy)}` : '';
    return request<ProblemResponse[]>(`${CONTEST_BASE}/problems${query}`);
  },
};

// ═══════════════════════════════════════════════════════
//  LEADERBOARD SERVICE API
// ═══════════════════════════════════════════════════════

export const leaderboardApi = {
  getLeaderboard(contestId: string, page = 0, size = 50): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>(
      `${LEADERBOARD_BASE}/leaderboard/${contestId}?page=${page}&size=${size}`,
    );
  },

  ping(): Promise<string> {
    return request<string>(`${LEADERBOARD_BASE}/leaderboard/ping`);
  },
};
