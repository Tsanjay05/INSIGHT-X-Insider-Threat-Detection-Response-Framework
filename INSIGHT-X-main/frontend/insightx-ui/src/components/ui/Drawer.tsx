import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    position?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

export function Drawer({ isOpen, onClose, children, position = 'right', size = 'md', className }: DrawerProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full',
    };

    const positionClasses = {
        left: 'left-0 top-0 bottom-0 border-r border-border-default h-full animate-in slide-in-from-left duration-300',
        right: 'right-0 top-0 bottom-0 border-l border-border-default h-full animate-in slide-in-from-right duration-300',
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
                className={cn(
                    "relative w-full bg-bg-tertiary shadow-2xl flex flex-col",
                    sizeClasses[size],
                    positionClasses[position],
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

export function DrawerHeader({ children, onClose, className }: { children: React.ReactNode; onClose?: () => void; className?: string }) {
    return (
        <div className={cn("flex items-center justify-between p-5 border-b border-border-subtle bg-bg-secondary", className)}>
            <h3 className="text-xl font-bold text-text-primary">{children}</h3>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-white/5"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </button>
            )}
        </div>
    );
}

export function DrawerBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex-1 overflow-y-auto p-6", className)}>{children}</div>;
}

export function DrawerFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex justify-end gap-3 p-5 border-t border-border-subtle bg-bg-secondary", className)}>
            {children}
        </div>
    );
}
