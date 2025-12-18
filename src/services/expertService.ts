// Service Expert Agent - Génération et validation de cas cliniques

import axios from 'axios';
import type { CasClinique, ValidationSynthese } from '../types/models';
import { EXPERT_ENDPOINTS, CONFIG } from '../constants/api';
import type { ApiError } from './authService';

// ════════════════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ════════════════════════════════════════════════════════════════════

const expertApi = axios.create({
  timeout: CONFIG.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ════════════════════════════════════════════════════════════════════
// GESTION ERREURS
// ════════════════════════════════════════════════════════════════════

function handleError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Erreur inconnue',
  };
}

// ════════════════════════════════════════════════════════════════════
// EXPERT SERVICE
// ════════════════════════════════════════════════════════════════════

export const expertService = {
  /**
   * Générer un nouveau cas clinique
   * Le cas retourné ne contient PAS diagnosis/examens/médicaments (exclus par Expert)
   * Utilise un timeout plus long car la génération peut nécessiter plusieurs retries LLM
   */
  async generateCase(userId: string, params?: {
    age_range?: string;
    niveau_apprenant?: string;
    symptome_initial?: string;
    random?: boolean;
  }): Promise<{
    session_id: string;
    cas_clinique: CasClinique;
    metadata: {
      proximite_params: string;
      differences: string;
      preuve_integrite: string;
      niveau_complexite: string;
      note: string;
    };
  }> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Utiliser timeout plus long pour generation de cas (retries LLM possibles)
      const response = await expertApi.post(EXPERT_ENDPOINTS.GENERATE, {
        action: 'generate_case',
        session_id: sessionId,
        user_id: userId,
        params: params || {},
      }, {
        timeout: CONFIG.API_TIMEOUT_GENERATE_CASE_MS || 120000,
      });

      return {
        session_id: sessionId,
        cas_clinique: response.data.cas_clinique,
        metadata: response.data.metadata,
      };
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Valider diagnostic
   * Envoie MESSAGE BRUT de l'apprenant + HISTORIQUE conversation
   */
  async validateDiagnostic(
    sessionId: string,
    userId: string,
    messageApprenant: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<ValidationSynthese> {
    try {
      const response = await expertApi.post(EXPERT_ENDPOINTS.VALIDATE_DIAGNOSTIC, {
        action: 'validate_diagnosis',
        session_id: sessionId,
        user_id: userId,
        message_apprenant: messageApprenant,
        history: history,
      });

      return response.data.synthese_validation as ValidationSynthese;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Terminer une session Expert et libérer les ressources
   * Correspond à POST /end_session de l'Expert Agent
   */
  async endSession(sessionId: string): Promise<{ status: string; message: string; cleaned: object }> {
    try {
      const response = await expertApi.post(EXPERT_ENDPOINTS.END_SESSION, {
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      // On ne throw pas l'erreur car c'est un cleanup best-effort
      console.warn('Erreur lors du nettoyage session Expert:', error);
      return { status: 'error', message: 'Cleanup failed', cleaned: {} };
    }
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await expertApi.get(EXPERT_ENDPOINTS.HEALTH);
      return response.status === 200;
    } catch {
      return false;
    }
  },
  /**
   * Récupérer les statistiques de l'expert (pour le tableau de bord)
   */
  async getExpertStats(expertId: string): Promise<{
    school_case_activity: number[];
    school_case_labels: string[];
    recent_activities: Array<{ text: string; time: string; type: string }>;
  }> {
    try {
      // Note: This endpoint is on the main backend, not the expert agent
      // We need to use a different axios instance or full URL if they differ.
      // Assuming EXPERT_ENDPOINTS.EXPERT_BY_ID is correct relative to expertApi's base URL.
      // Wait, expertApi uses EXPERT_API_URL (port 5001) but expert stats are on Learner_auth_API (port 5004).
      // We should use userService or a new axios instance for port 5004 calls if expertApi is strictly for the agent.
      // However, looking at api.ts, EXPERT_API_URL is 5001. BACKEND_ENDPOINTS are for 5004.
      // Let's check where getExpertStats should really go. It was in expertService.ts before.
      // If the route is in expert.py (Learner_auth_API), we should use an axios instance pointing to API_BASE_URL (5004).

      // Let's use a direct axios call or import an instance that points to the main backend.
      // For now, I'll assume I can use the full URL from CONFIG/constants.

      const { API_BASE_URL } = await import('../constants/api');
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/expert/${expertId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};
