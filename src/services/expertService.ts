// Service Expert Agent - Génération et validation de cas cliniques

import axios from 'axios';
import { CasClinique, ValidationSynthese } from '../types/models';
import { EXPERT_ENDPOINTS, CONFIG } from '../constants/api';
import { ApiError } from './authService';

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
};
