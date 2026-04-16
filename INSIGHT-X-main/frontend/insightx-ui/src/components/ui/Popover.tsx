import * as React from 'react';
import { cn } from '../../lib/utils';

interface PopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const PopoverContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);

export function Popover({ open, onOpenChange, children }: PopoverProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onOpenChange]);

    return (
        <PopoverContext.Provider value={{ open, onOpenChange }}>
            <div className="relative inline-block text-left" ref={containerRef}>
                {children}
            </div>
        </PopoverContext.Provider>
    );
}

export function PopoverTrigger({ asChild, children, className }: { asChild?: boolean; children: React.ReactNode; className?: string }) {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error("PopoverTrigger must be used within Popover");

    const { open, onOpenChange } = context;

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                children.props.onClick?.(e);
                onOpenChange(!open);
            },
            'aria-expanded': open
        });
    }

    return (
        <button className={className} onClick={() => onOpenChange(!open)}>
            {children}
        </button>
    );
}

export function PopoverContent({ children, align = 'center', className }: { children: React.ReactNode, align?: 'start' | 'center' | 'end', className?: string }) {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error("PopoverContent must be used within Popover");

    if (!context.open) return null;

    return (
        <div className={cn(
            "absolute z-50 mt-2 min-w-[12rem] rounded-md border border-border-default bg-bg-secondary p-4 shadow-md outline-none animate-in fade-in zoom-in-95",
            align === 'start' ? "left-0" : align === 'end' ? "right-0" : "left-1/2 -translate-x-1/2",
            className
        )}>
            {children}
        </div>
    );
}
