import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export function Modal({ isOpen, onClose, children, size = 'medium', className }: ModalProps) {
    React.useEffect(() => {
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
        small: 'max-w-[600px]',
        medium: 'max-w-[800px]',
        large: 'max-w-[1200px]',
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className={cn(
                    "relative w-full bg-bg-tertiary rounded-xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200",
                    sizeClasses[size],
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

interface ModalHeaderProps {
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between p-5 border-b border-border-subtle bg-bg-secondary rounded-t-xl", className)}>
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

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-6", className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex justify-end gap-3 p-5 border-t border-border-subtle bg-bg-secondary rounded-b-xl", className)}>
            {children}
        </div>
    );
}
