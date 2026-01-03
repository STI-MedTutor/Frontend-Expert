import { API_BASE_URL, BACKEND_ENDPOINTS, EXPERT_API_URL } from '../constants/api';
import { getToken } from './authService';

export interface Expert {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    domaine_expertise: string;
    etablissement?: string;
    annees_experience?: number;
    is_enseignant: boolean;
}

export interface Apprenant {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    ecole?: string;
    classe?: string;
}

export interface RejectedCase {
    case_id: string;
    titre: string;
    rejection_reason: string;
    rejection_parts?: string[];
    patient?: string;
    rejected_at?: string;
    rejected_by?: string;
}

export interface CreateExpertData {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    domaine_expertise: string;
    etablissement?: string;
    annees_experience?: number;
    is_enseignant: boolean;
}

export interface CreateApprenantData {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
}

class AdminService {
    private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        };

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            throw new Error(error.message || `Erreur HTTP ${response.status}`);
        }
        return response.json();
    }

    // Experts
    async getExperts(): Promise<Expert[]> {
        // En attendant un endpoint admin dédié, on peut utiliser une recherche ou un endpoint spécifique
        // Pour l'instant on simule ou on utilise un endpoint existant si possible
        return this.fetchWithAuth<Expert[]>(`${API_BASE_URL}/admin/experts`);
    }

    async createExpert(data: CreateExpertData): Promise<Expert> {
        return this.fetchWithAuth<Expert>(`${API_BASE_URL}${BACKEND_ENDPOINTS.REGISTER_EXPERT}`, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                est_enseignant: data.is_enseignant
            }),
        });
    }

    async deleteExpert(id: number): Promise<void> {
        return this.fetchWithAuth<void>(`${API_BASE_URL}/admin/experts/${id}`, {
            method: 'DELETE',
        });
    }

    // Apprenants
    async getApprenants(): Promise<Apprenant[]> {
        return this.fetchWithAuth<Apprenant[]>(`${API_BASE_URL}/admin/apprenants`);
    }

    async createApprenant(data: CreateApprenantData): Promise<Apprenant> {
        return this.fetchWithAuth<Apprenant>(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteApprenant(id: number): Promise<void> {
        return this.fetchWithAuth<void>(`${API_BASE_URL}/admin/apprenants/${id}`, {
            method: 'DELETE',
        });
    }

    // Domaines
    async getDomainesExpertise(): Promise<string[]> {
        return this.fetchWithAuth<string[]>(`${API_BASE_URL}${BACKEND_ENDPOINTS.DOMAINES_EXPERTISE}`);
    }

    // Rejets
    async getRejectedCases(): Promise<RejectedCase[]> {
        // On récupère les cas rejetés depuis l'Expert Agent
        // On suppose qu'il y a un endpoint /cases/rejected ou similaire
        // Sinon on filtre les cas normaux
        try {
            const response = await this.fetchWithAuth<any>(`${EXPERT_API_URL}/cases?status=rejected`);
            const cases = response.cases || [];
            return cases.map((c: any) => ({
                case_id: c.id,
                titre: c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Cas sans titre',
                rejection_reason: c.rejection_reason || 'Aucun motif fourni',
                rejection_parts: c.rejected_elements || [],
                patient: c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : 'Inconnu',
                rejected_at: c.updated_at || c.created_at,
                rejected_by: c.expert_id || 'Expert'
            }));
        } catch (error) {
            console.error('Erreur getRejectedCases:', error);
            return [];
        }
    }
}

export const adminService = new AdminService();
