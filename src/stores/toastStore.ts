import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

// Simple toast store using a custom hook
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

const notify = () => {
    listeners.forEach(listener => listener([...toasts]));
};

const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    toasts.push({ id, message, type });
    notify();

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        notify();
    }, 3000);
};

export const useToast = () => {
    const [, setToasts] = useState<Toast[]>([]);

    const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }, []);

    // Subscribe on mount
    useState(() => {
        const unsubscribe = subscribe(setToasts);
        return unsubscribe;
    });

    return {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
    };
};
