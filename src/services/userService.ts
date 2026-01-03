import { API_BASE_URL, BACKEND_ENDPOINTS } from '../constants/api';
import type { User } from './authService';

// Types pour les mises à jour utilisateur
export interface UpdateUserData {
    prenom?: string;
    nom?: string;
    email?: string;
    domaine_expertise?: string;
    etablissement?: string;
    annees_experience?: number;
    is_enseignant?: boolean;
}

export interface UserStats {
    total_cases: number;
    active_cases: number;
    completed_cases: number;
    total_patients: number;
}

// Helper pour les requêtes fetch
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}

// Service utilisateur
class UserService {
    async getProfile(): Promise<User> {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await fetchAPI<User>(BACKEND_ENDPOINTS.EXPERT_BY_ID(userId));

            if (response) {
                localStorage.setItem('user', JSON.stringify(response));
            }

            return response;
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            throw error;
        }
    }

    async updateProfile(data: UpdateUserData): Promise<User> {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                throw new Error('User ID not found');
            }

            // Transform field names to French if needed
            const backendData: Record<string, any> = {};
            if (data.nom) backendData.nom = data.nom;
            if (data.prenom) backendData.prenom = data.prenom;
            if (data.email) backendData.email = data.email;
            if (data.domaine_expertise) backendData.domaine_expertise = data.domaine_expertise;
            if (data.etablissement) backendData.etablissement = data.etablissement;
            if (data.annees_experience !== undefined) backendData.annees_experience = data.annees_experience;
            if (data.is_enseignant !== undefined) backendData.is_enseignant = data.is_enseignant;

            const response = await fetchAPI<{ message: string; expert: User }>(BACKEND_ENDPOINTS.EXPERT_BY_ID(userId), {
                method: 'PUT',
                body: JSON.stringify(backendData),
            });

            if (response.expert) {
                localStorage.setItem('user', JSON.stringify(response.expert));
                return response.expert;
            }

            throw new Error('Invalid response from server');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            throw error;
        }
    }

    // Note: These methods are not available in the current backend
    // They are commented out for future implementation

    // async getStats(): Promise<UserStats> { ... }
    // async uploadAvatar(file: File): Promise<{ avatar_url: string }> { ... }
    // async deleteAccount(): Promise<{ message: string }> { ... }
}

export const userService = new UserService();
