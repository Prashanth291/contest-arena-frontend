'use client';

// ═══════════════════════════════════════════════════════
// Auth Context — JWT management + useAuth hook
// ═══════════════════════════════════════════════════════

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, JwtPayload, Role } from './types';

// ── State ─────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ── JWT Utilities ─────────────────────────────────────

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 < Date.now();
}

function userFromPayload(payload: JwtPayload, token: string): User {
  // The backend doesn't include username in JWT, but we store it separately.
  // For now, fall back to email (sub) as username if not stored.
  const storedUsername = typeof window !== 'undefined'
    ? localStorage.getItem('username')
    : null;

  return {
    userId: payload.userId,
    username: storedUsername || payload.sub.split('@')[0],
    email: payload.sub,
    role: payload.role as Role,
  };
}

// ── Context ───────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (token: string, username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((token: string, username?: string) => {
    const payload = decodeJwt(token);
    if (!payload || isTokenExpired(payload)) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    localStorage.setItem('jwt_token', token);
    if (username) {
      localStorage.setItem('username', username);
    }

    const user = userFromPayload(payload, token);
    if (username) user.username = username;

    dispatch({ type: 'SET_USER', payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload && !isTokenExpired(payload)) {
        const user = userFromPayload(payload, token);
        dispatch({ type: 'SET_USER', payload: { user, token } });
      } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
