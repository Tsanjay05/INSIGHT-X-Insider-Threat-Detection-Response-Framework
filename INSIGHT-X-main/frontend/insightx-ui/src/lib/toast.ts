

// This is a hook-based utility. To use outside components, we'd need an event bus or singleton.
// For now, we'll rely on the hook being used inside components.
// We can also export a singleton event emitter if needed for non-React contexts (like API interceptors).

// Simple event emitter for non-React usage
type ToastEvent = {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
};

class ToastEmitter {
    private listeners: ((toast: ToastEvent) => void)[] = [];

    subscribe(listener: (toast: ToastEvent) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    emit(toast: ToastEvent) {
        this.listeners.forEach((listener) => listener(toast));
    }
}

export const toastEmitter = new ToastEmitter();

export const toast = {
    success: (message: string, title?: string) => toastEmitter.emit({ type: 'success', message, title }),
    error: (message: string, title?: string) => toastEmitter.emit({ type: 'error', message, title }),
    warning: (message: string, title?: string) => toastEmitter.emit({ type: 'warning', message, title }),
    info: (message: string, title?: string) => toastEmitter.emit({ type: 'info', message, title }),
};
