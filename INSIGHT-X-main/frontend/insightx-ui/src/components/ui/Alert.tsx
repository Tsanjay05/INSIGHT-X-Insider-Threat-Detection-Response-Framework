import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import React from 'react';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
        variants: {
            variant: {
                default: 'bg-bg-secondary text-text-primary border-border-default',
                success: 'bg-semantic-success-bg text-semantic-success-400 border-semantic-success-400/20 [&>svg]:text-semantic-success-400',
                warning: 'bg-semantic-warning-bg text-semantic-warning-400 border-semantic-warning-400/20 [&>svg]:text-semantic-warning-400',
                danger: 'bg-semantic-danger-bg text-semantic-danger-400 border-semantic-danger-400/20 [&>svg]:text-semantic-danger-400',
                info: 'bg-semantic-info-bg text-semantic-info-400 border-semantic-info-400/20 [&>svg]:text-semantic-info-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
    icon?: React.ReactNode;
    onClose?: () => void;
}

const icons = {
    default: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    danger: XCircle,
    info: Info,
};

export function Alert({ className, variant = 'default', icon, onClose, children, ...props }: AlertProps) {
    const VariantIcon = icons[variant || 'default'];

    return (
        <div role="alert" className={cn(alertVariants({ variant }), "pl-11", className)} {...props}>
            {icon ? icon : <VariantIcon className="h-5 w-5" />}
            {children}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-white/5"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            )}
        </div>
    );
}

export function AlertTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h5 className={cn("mb-1 font-medium leading-none tracking-tight text-white", className)} {...props}>
            {children}
        </h5>
    );
}

export function AlertDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <div className={cn("text-sm opacity-90", className)} {...props}>
            {children}
        </div>
    );
}
