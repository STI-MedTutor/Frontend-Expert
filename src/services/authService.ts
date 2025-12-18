import { API_BASE_URL, BACKEND_ENDPOINTS } from '../constants/api';

// Types pour l'authentification
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    prenom: string;
    nom: string;
    email: string;
    password: string;
    domaine_expertise?: string;
    etablissement?: string;
    annees_experience?: number;
    is_teacher?: boolean;
}

export interface User {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    domaine_expertise?: string;
    etablissement?: string;
    annees_experience?: number;
    role?: string;
    is_teacher?: boolean;
    is_enseignant?: boolean | number;
    created_at?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user_type: 'expert' | 'apprenant' | 'gerant';
    user: User;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// Fonction pour obtenir le token
const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Fonction pour définir le token
const setToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
};

// Fonction pour supprimer le token
const removeToken = (): void => {
    localStorage.removeItem('auth_token');
};

// Helper pour les requêtes fetch
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                message: errorData.message || 'Une erreur est survenue',
                errors: errorData.errors,
                status: response.status,
            } as ApiError;
        }

        return await response.json();
    } catch (error) {
        if ((error as ApiError).status) {
            throw error;
        }
        throw {
            message: 'Erreur de connexion au serveur',
            status: 0,
        } as ApiError;
    }
}

// Service d'authentification
class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Transform English field names to French for backend
            const backendData = {
                email: credentials.email,
                mot_de_passe: credentials.password,
            };

            const response = await fetchAPI<AuthResponse>(BACKEND_ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify(backendData),
            });

            if (response.token) {
                setToken(response.token);
            }

            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                // Store user ID for future API calls
                localStorage.setItem('user_id', response.user.id);
            }

            return response;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            // Transform English field names to French for backend
            const backendData = {
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                mot_de_passe: data.password,
                domaine_expertise: data.domaine_expertise,
                etablissement: data.etablissement,
                annees_experience: data.annees_experience,
                est_enseignant: data.is_teacher,
            };

            const response = await fetchAPI<AuthResponse>(BACKEND_ENDPOINTS.REGISTER_EXPERT, {
                method: 'POST',
                body: JSON.stringify(backendData),
            });

            if (response.token) {
                setToken(response.token);
            }

            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                // Store user ID for future API calls
                localStorage.setItem('user_id', response.user.id);
            }

            return response;
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await fetchAPI(BACKEND_ENDPOINTS.LOGOUT, { method: 'POST' });
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            removeToken();
            localStorage.removeItem('user');
            localStorage.removeItem('user_id');
        }
    }

    async getCurrentUser(): Promise<User> {
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
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            throw error;
        }
    }

    isAuthenticated(): boolean {
        return !!getToken();
    }

    getCachedUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    async requestPasswordReset(email: string): Promise<{ message: string }> {
        try {
            return await fetchAPI(BACKEND_ENDPOINTS.REQUEST_PASSWORD_RESET, {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            throw error;
        }
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        try {
            // Transform to backend field name
            const backendData = {
                token,
                nouveau_mot_de_passe: password,
            };

            return await fetchAPI(BACKEND_ENDPOINTS.CONFIRM_PASSWORD_RESET, {
                method: 'POST',
                body: JSON.stringify(backendData),
            });
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            throw error;
        }
    }


}

export const authService = new AuthService();
export { getToken, setToken, removeToken };
