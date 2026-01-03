import { EXPERT_API_URL, EXPERT_ENDPOINTS } from '../constants/api';
import type { ClinicalCase } from '../types/clinicalCase';

interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    cases?: T[];
    case?: T;
    total?: number;
}

class ClinicalCasesService {

    async getCases(pathologie?: string, niveau?: string): Promise<ClinicalCase[]> {
        try {
            const params = new URLSearchParams();
            if (pathologie) params.append('pathologie', pathologie);
            if (niveau) params.append('niveau', niveau);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.CASES}${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: ApiResponse<ClinicalCase> = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Erreur API inconnue');
            }

            return data.cases || [];
        } catch (error) {
            console.error('[ClinicalCasesService] Erreur getCases:', error);
            throw error;
        }
    }

    async getCaseById(id: string): Promise<ClinicalCase | undefined> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.CASE_BY_ID(id)}`);

            if (response.status === 404) {
                return undefined;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: ApiResponse<ClinicalCase> = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Erreur API inconnue');
            }

            return data.case;
        } catch (error) {
            console.error(`[ClinicalCasesService] Erreur getCaseById(${id}):`, error);
            throw error;
        }
    }

    async updateCase(id: string, updates: Partial<ClinicalCase>): Promise<ClinicalCase> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.CASE_BY_ID(id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: ApiResponse<ClinicalCase> = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Erreur API inconnue');
            }

            if (!data.case) {
                throw new Error('Réponse API invalide: cas non retourné');
            }

            return data.case;
        } catch (error) {
            console.error(`[ClinicalCasesService] Erreur updateCase(${id}):`, error);
            throw error;
        }
    }

    async createCase(caseData: Partial<ClinicalCase>): Promise<ClinicalCase> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.CASES}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(caseData),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: ApiResponse<ClinicalCase> = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Erreur API inconnue');
            }

            if (!data.case) {
                throw new Error('Réponse API invalide: cas non retourné');
            }

            return data.case;
        } catch (error) {
            console.error('[ClinicalCasesService] Erreur createCase:', error);
            throw error;
        }
    }

    async deleteCase(id: string): Promise<void> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.CASE_BY_ID(id)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: ApiResponse<ClinicalCase> = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Erreur API inconnue');
            }
        } catch (error) {
            console.error(`[ClinicalCasesService] Erreur deleteCase(${id}):`, error);
            throw error;
        }
    }

    async getAvailablePathologies(): Promise<string[]> {
        try {
            const cases = await this.getCases();
            const pathologies = new Set<string>();

            cases.forEach(c => {
                if (c.metadata?.pathologie) {
                    pathologies.add(c.metadata.pathologie);
                }
            });

            return Array.from(pathologies).sort();
        } catch (error) {
            console.error('[ClinicalCasesService] Erreur getAvailablePathologies:', error);
            return [];
        }
    }

    async getAvailableNiveaux(): Promise<string[]> {
        try {
            const cases = await this.getCases();
            const niveaux = new Set<string>();

            cases.forEach(c => {
                if (c.metadata?.niveau_complexite) {
                    niveaux.add(c.metadata.niveau_complexite);
                }
            });

            return Array.from(niveaux).sort();
        } catch (error) {
            console.error('[ClinicalCasesService] Erreur getAvailableNiveaux:', error);
            return [];
        }
    }

    async approveCase(id: string, expertId: string, expertDomaine: string, comment?: string): Promise<any> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.APPROVE_CASE(id)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expert_id: expertId,
                    expert_domaine: expertDomaine,
                    notes: comment
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                throw new Error('Erreur de réponse du serveur');
            }

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`[ClinicalCasesService] Erreur approveCase(${id}):`, error);
            throw error;
        }
    }

    async rejectCase(id: string, expertId: string, expertDomaine: string, reason: string, rejectedParts: string[]): Promise<any> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.REJECT_CASE(id)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expert_id: expertId,
                    expert_domaine: expertDomaine,
                    rejection_reason: reason,
                    rejection_parts: rejectedParts
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                throw new Error('Erreur de réponse du serveur');
            }

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`[ClinicalCasesService] Erreur rejectCase(${id}):`, error);
            throw error;
        }
    }

    async setInProgress(id: string, expertId: string, expertDomaine: string): Promise<any> {
        try {
            const response = await fetch(`${EXPERT_API_URL}${EXPERT_ENDPOINTS.IN_PROGRESS_CASE(id)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expert_id: expertId,
                    expert_domaine: expertDomaine,
                    status: 'in_progress'
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                throw new Error('Erreur de réponse du serveur');
            }

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`[ClinicalCasesService] Erreur setInProgress(${id}):`, error);
            throw error;
        }
    }
}

export const clinicalCasesService = new ClinicalCasesService();
