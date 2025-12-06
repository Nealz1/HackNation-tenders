
// Minimal toast implementation
import { useState, useEffect } from 'react';

type Toast = {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = ({ title, description, variant }: Toast) => {
        const newToast = { title, description, variant };
        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 3s
        setTimeout(() => {
            setToasts((prev) => prev.filter(t => t !== newToast));
        }, 3000);
    };

    return { toast, toasts };
}
