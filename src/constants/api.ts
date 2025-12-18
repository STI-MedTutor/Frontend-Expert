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

  // Cas d'École
  CAS_ECOLE: '/cas_ecole',
  CAS_ECOLE_BY_ID: (id: string) => `/cas_ecole/${id}`,
  CAS_ECOLE_FROM_FULTANG: '/cas_ecole/from_fultang',
  CAS_ECOLE_TOGGLE_ACTIF: (id: string) => `/cas_ecole/${id}/toggle_actif`,
  CAS_CLINIQUES_DISPONIBLES: '/cas_ecole/cas_disponibles',
  GENERATE: '/generate',
  VALIDATE_DIAGNOSTIC: '/validate_diagnostic',
  END_SESSION: '/end_session',
};

// Configuration
export const CONFIG = {
  API_TIMEOUT_MS,
  API_TIMEOUT_GENERATE_CASE_MS: 120000,
};
// Liste des domaines d'expertise
export const DOMAINES_EXPERTISE_LIST = [
  'cardiologie', 'neurologie', 'pneumologie', 'gastro-enterologie', 'nephrologie',
  'endocrinologie', 'rhumatologie', 'dermatologie', 'pediatrie', 'geriatrie',
  'psychiatrie', 'medecine-generale', 'chirurgie-generale', 'gynecologie',
  'urologie', 'ophtalmologie', 'orl', 'oncologie', 'hematologie', 'infectiologie', 'autre'
];
