import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
    /** When provided, message is derived from error; overrides title/message when set */
    error?: Error | unknown;
    title?: string;
    message?: string;
    onRetry?: () => void;
    type?: 'error' | 'warning';
}

function getErrorMessage(error: Error | unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) return String((error as { message: unknown }).message);
    return 'An error occurred.';
}

export function ErrorState({
    error,
    title = 'Something went wrong',
    message: messageProp,
    onRetry,
    type = 'error',
}: ErrorStateProps) {
    const message = error !== undefined ? getErrorMessage(error) : (messageProp ?? 'An error occurred while loading this content.');
    const Icon = type === 'error' ? XCircle : AlertCircle;
    const iconColor = type === 'error' ? 'text-danger-400' : 'text-warning-400';

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icon className={`w-16 h-16 ${iconColor} mb-4`} />
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-secondary text-center max-w-md mb-6">
                {message}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="secondary">
                    Try Again
                </Button>
            )}
        </div>
    );
}
