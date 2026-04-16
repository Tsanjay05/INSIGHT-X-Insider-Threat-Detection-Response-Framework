import * as React from 'react';
import { cn } from '../../lib/utils';
import { Modal } from './Modal';

// Re-exporting Modal as Dialog for semantic compatibility with cmdk usage pattern
// In a full shadcn/ui setup, these would be Radix primitives, but here we use our custom Modal

export function Dialog({ open, onOpenChange, children, className }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode, className?: string }) {
    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className={cn("p-0 bg-transparent shadow-none", className)}>
            {children}
        </Modal>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("relative w-full overflow-hidden rounded-md bg-bg-secondary shadow-2xl", className)}>
            {children}
        </div>
    );
}
