import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
    compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message = 'An error occurred while loading this content.',
    onRetry,
    className,
    compact = false,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg border border-border-default bg-bg-secondary/50 p-8 text-center',
                compact && 'p-4',
                className
            )}
        >
            <AlertCircle className={cn('mb-3 h-10 w-10 text-semantic-danger-500', compact && 'h-6 w-6')} />
            <h3 className={cn('mb-1 font-semibold text-text-primary', compact && 'text-sm')}>
                {title}
            </h3>
            <p className={cn('max-w-xs text-sm text-text-tertiary', !compact && 'mb-4')}>
                {message}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" size={compact ? 'sm' : 'default'} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    );
};
