import { useState, useEffect } from 'react';
import { authService, type User } from '../services/authService';

// Store global pour l'authentification
let globalUser: User | null = null;
let globalUserType: string | null = null;
let globalIsAuthenticated = false;
let listeners: Array<(user: User | null, userType: string | null, isAuthenticated: boolean) => void> = [];

// Initialiser l'état depuis le cache
const initializeAuth = () => {
    const cachedUser = authService.getCachedUser();
    const isAuth = authService.isAuthenticated();

    globalUser = cachedUser;
    globalUserType = localStorage.getItem('user_type');
    globalIsAuthenticated = isAuth;
};

// Initialiser au chargement du module
initializeAuth();

// Notifier tous les listeners
const notifyListeners = () => {
    listeners.forEach(listener => listener(globalUser, globalUserType, globalIsAuthenticated));
};

// Mettre à jour l'état global
const setAuthState = (user: User | null, userType: string | null, isAuthenticated: boolean) => {
    globalUser = user;
    globalUserType = userType;
    globalIsAuthenticated = isAuthenticated;
    if (userType) localStorage.setItem('user_type', userType);
    else localStorage.removeItem('user_type');
    notifyListeners();
};

// Hook personnalisé pour l'authentification
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(globalUser);
    const [userType, setUserType] = useState<string | null>(globalUserType);
    const [isAuthenticated, setIsAuthenticated] = useState(globalIsAuthenticated);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // S'abonner aux changements
        const listener = (newUser: User | null, newUserType: string | null, newIsAuth: boolean) => {
            setUser(newUser);
            setUserType(newUserType);
            setIsAuthenticated(newIsAuth);
        };

        listeners.push(listener);

        // Se désabonner au démontage
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setAuthState(response.user, response.user_type, true);
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            setAuthState(response.user, 'expert', true); // Register is for experts
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setAuthState(null, null, false);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const user = await authService.getCurrentUser();
            // On garde le userType actuel car getCurrentUser ne le renvoie pas forcément
            setAuthState(user, globalUserType, true);
            return user;
        } catch (error) {
            setAuthState(null, null, false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        userType,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };
};

// Fonction pour vérifier l'authentification (utile pour les guards de route)
export const checkAuth = (): boolean => {
    return authService.isAuthenticated();
};

// Fonction pour obtenir l'utilisateur actuel
export const getCurrentUser = (): User | null => {
    return authService.getCachedUser();
};
