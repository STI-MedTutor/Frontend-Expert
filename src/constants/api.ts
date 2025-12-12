// Configuration de l'API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004';
export const EXPERT_API_URL = import.meta.env.VITE_EXPERT_API_URL || 'http://localhost:5001';

// Timeout
export const API_TIMEOUT_MS = 30000;

// Endpoints Backend (Learner Auth API - Port 5004)
export const BACKEND_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER_EXPERT: '/auth/register/expert',
  LOGOUT: '/auth/logout',
  REQUEST_PASSWORD_RESET: '/auth/request-reset',
  CONFIRM_PASSWORD_RESET: '/auth/confirm-reset',

  // Expert
  EXPERT_BY_ID: (id: string) => `/expert/${id}`,
  DOMAINES_EXPERTISE: '/auth/domaines-expertise',
};

// Endpoints Expert Agent
export const EXPERT_ENDPOINTS = {
  CASES: '/cases',
  CASE_BY_ID: (id: string) => `/cases/${id}`,
  HEALTH: '/health',
};

// Configuration
export const CONFIG = {
  API_TIMEOUT_MS,
};
