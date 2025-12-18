import type { ClinicalCase } from './clinicalCase';

export interface CasEcole {
    id: string;
    titre: string;
    ecole_id: number;
    ecole_nom: string;
    classe_id: number;
    classe_nom: string;
    professeur_id: number;
    professeur_nom: string;
    professeur_email: string;
    cas_clinique: ClinicalCase;
    temps_limite_minutes: number;
    penalite_par_minute: number;
    actif: boolean;
    date_creation: string;
}

export interface CreateCasEcolePayload {
    titre: string;
    ecole_id: number;
    ecole_nom: string;
    classe_id: number;
    classe_nom: string;
    professeur_id: number;
    professeur_nom: string;
    professeur_email: string;
    cas_clinique: ClinicalCase;
    temps_limite_minutes: number;
    penalite_par_minute: number;
}

export interface CreateCasEcoleFromFultangPayload {
    cas_clinique_id: string;
    titre?: string;
    ecole_id: number;
    ecole_nom: string;
    classe_id: number;
    classe_nom: string;
    professeur_id: number;
    professeur_nom: string;
    professeur_email: string;
    temps_limite_minutes: number;
    penalite_par_minute: number;
}

export interface UpdateCasEcolePayload {
    titre?: string;
    temps_limite_minutes?: number;
    penalite_par_minute?: number;
    actif?: boolean;
}
