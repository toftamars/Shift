import { createSlice } from '@reduxjs/toolkit';

/** Skill: client-localstorage-schema — versioned keys, minimal fields, try/catch */
const AUTH_STORAGE_VERSION = 'v1';
export const AUTH_STORAGE_KEYS = {
  token: `auth:token:${AUTH_STORAGE_VERSION}`,
  user: `auth:user:${AUTH_STORAGE_VERSION}`,
} as const;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const LEGACY_KEYS = { token: 'token', user: 'user' } as const;

const loadFromStorage = (): AuthState => {
  try {
    let token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    let raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    if (!token && !raw) {
      token = localStorage.getItem(LEGACY_KEYS.token);
      raw = localStorage.getItem(LEGACY_KEYS.user);
      if (token || raw) {
        const user = raw ? (JSON.parse(raw) as User) : null;
        if (token) localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
        if (user) localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
        localStorage.removeItem(LEGACY_KEYS.token);
        localStorage.removeItem(LEGACY_KEYS.user);
        return { token, user };
      }
    }
    const user = raw ? (JSON.parse(raw) as User) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const initialState: AuthState = loadFromStorage();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: { payload: { token: string; user: User } }) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      try {
        localStorage.setItem(AUTH_STORAGE_KEYS.token, action.payload.token);
        localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(action.payload.user));
      } catch {
        // Incognito, quota exceeded, or storage disabled
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      try {
        localStorage.removeItem(AUTH_STORAGE_KEYS.token);
        localStorage.removeItem(AUTH_STORAGE_KEYS.user);
      } catch {}
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
