// src/api.ts
// Centralized axios instance with auth interceptor.
// All backend calls should use this instead of raw axios or fetch.

import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Module-level logout callback, set by AuthContext on mount.
// The interceptor calls this on 401 to trigger a global logout.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

// Paths that should NOT trigger global logout on 401
// (auth endpoints where 401 is expected behavior, not a session expiry)
const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/check', '/auth/reset-password', '/auth/forgot-password', '/auth/change-password'];

api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      onUnauthorized &&
      !AUTH_PATHS.some(p => error.config?.url?.includes(p))
    ) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
