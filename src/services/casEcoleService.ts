import axios from 'axios';
import { EXPERT_API_URL, EXPERT_ENDPOINTS, CONFIG } from '../constants/api';
import type { CasEcole, CreateCasEcolePayload, CreateCasEcoleFromFultangPayload, UpdateCasEcolePayload } from '../types/casEcole';
import type { ClinicalCase } from '../types/clinicalCase';

// Instance Axios dédiée
const api = axios.create({
    baseURL: EXPERT_API_URL,
    timeout: CONFIG.API_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const casEcoleService = {
    /**
     * Récupérer tous les cas d'école
     */
    async getAllCasEcole(professeurId?: number): Promise<CasEcole[]> {
        try {
            const params = professeurId ? { professeur_id: professeurId } : {};
            const response = await api.get(EXPERT_ENDPOINTS.CAS_ECOLE, { params });
            return response.data.cas_ecole || [];
        } catch (error) {
            console.error('Erreur getAllCasEcole:', error);
            throw error;
        }
    },

    /**
     * Récupérer un cas d'école par ID
     */
    async getCasEcoleById(id: string): Promise<CasEcole> {
        try {
            const response = await api.get(EXPERT_ENDPOINTS.CAS_ECOLE_BY_ID(id));
            return response.data.cas_ecole;
        } catch (error) {
            console.error(`Erreur getCasEcoleById(${id}):`, error);
            throw error;
        }
    },

    /**
     * Créer un nouveau cas d'école (cas complet)
     */
    async createCasEcole(payload: CreateCasEcolePayload): Promise<CasEcole> {
        try {
            const response = await api.post(EXPERT_ENDPOINTS.CAS_ECOLE, payload);
            return response.data.cas_ecole;
        } catch (error) {
            console.error('Erreur createCasEcole:', error);
            throw error;
        }
    },

    /**
     * Créer un cas d'école à partir d'un cas existant (Fultang)
     */
    async createCasEcoleFromFultang(payload: CreateCasEcoleFromFultangPayload): Promise<CasEcole> {
        try {
            const response = await api.post(EXPERT_ENDPOINTS.CAS_ECOLE_FROM_FULTANG, payload);
            return response.data.cas_ecole;
        } catch (error) {
            console.error('Erreur createCasEcoleFromFultang:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un cas d'école
     */
    async updateCasEcole(id: string, payload: UpdateCasEcolePayload): Promise<CasEcole> {
        try {
            const response = await api.put(EXPERT_ENDPOINTS.CAS_ECOLE_BY_ID(id), payload);
            return response.data.cas_ecole;
        } catch (error) {
            console.error(`Erreur updateCasEcole(${id}):`, error);
            throw error;
        }
    },

    /**
     * Activer/Désactiver un cas d'école
     */
    async toggleActif(id: string): Promise<CasEcole> {
        try {
            const response = await api.put(EXPERT_ENDPOINTS.CAS_ECOLE_TOGGLE_ACTIF(id));
            return response.data.cas_ecole;
        } catch (error) {
            console.error(`Erreur toggleActif(${id}):`, error);
            throw error;
        }
    },

    /**
     * Supprimer un cas d'école
     */
    async deleteCasEcole(id: string): Promise<void> {
        try {
            await api.delete(EXPERT_ENDPOINTS.CAS_ECOLE_BY_ID(id));
        } catch (error) {
            console.error(`Erreur deleteCasEcole(${id}):`, error);
            throw error;
        }
    },

    /**
     * Lister les cas cliniques disponibles pour création
     */
    async getCasCliniquesDisponibles(): Promise<ClinicalCase[]> {
        try {
            const response = await api.get(EXPERT_ENDPOINTS.CAS_CLINIQUES_DISPONIBLES);
            return response.data.cas_cliniques || [];
        } catch (error) {
            console.error('Erreur getCasCliniquesDisponibles:', error);
            return [];
        }
    }
};
