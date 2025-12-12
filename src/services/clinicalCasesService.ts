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
}

export const clinicalCasesService = new ClinicalCasesService();
