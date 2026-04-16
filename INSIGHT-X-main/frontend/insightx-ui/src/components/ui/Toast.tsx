import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        ({ type, title, message, duration = 5000 }: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast = { id, type, title, message, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const toast = useCallback((props: {
        title?: string;
        description?: string;
        message?: string;
        variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'error';
        type?: ToastType;
        duration?: number
    }) => {
        const type = (props.variant === 'danger' ? 'error' : props.variant === 'default' ? 'info' : props.variant) as ToastType || props.type || 'info';
        const message = props.description || props.message || '';

        context.addToast({
            type,
            title: props.title,
            message,
            duration: props.duration
        });
    }, [context]);

    return { ...context, toast };
};

// Toast Container Component
export const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast,
}) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

// Export Toaster for compatibility, though App handles placement
export const Toaster = () => null;

// Toast Item Component
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle className="h-5 w-5 text-semantic-success-500" />,
        error: <AlertCircle className="h-5 w-5 text-semantic-danger-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-semantic-warning-500" />,
        info: <Info className="h-5 w-5 text-semantic-info-500" />,
    };

    const bgColors = {
        success: 'bg-semantic-success-bg border-semantic-success-500/20',
        error: 'bg-semantic-danger-bg border-semantic-danger-500/20',
        warning: 'bg-semantic-warning-bg border-semantic-warning-500/20',
        info: 'bg-semantic-info-bg border-semantic-info-500/20',
    };

    return (
        <div
            className={cn(
                'relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full',
                bgColors[toast.type] || 'bg-bg-secondary border-border-default'
            )}
        >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <div className="flex-1">
                {toast.title && <h4 className="mb-1 text-sm font-semibold text-text-primary">{toast.title}</h4>}
                <p className="text-sm text-text-secondary">{toast.message}</p>
            </div>
            <button
                onClick={onClose}
                className="absolute right-2 top-2 rounded-md p-1 text-text-tertiary hover:text-text-primary hover:bg-white/10"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};
