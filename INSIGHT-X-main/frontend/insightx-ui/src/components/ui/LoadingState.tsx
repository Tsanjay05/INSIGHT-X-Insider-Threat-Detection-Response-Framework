import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export function LoadingState({ message = 'Loading...', size = 'medium' }: LoadingStateProps) {
    const sizeClasses = {
        small: 'w-5 h-5',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-400`} />
            {message && (
                <p className="mt-4 text-sm text-text-secondary">{message}</p>
            )}
        </div>
    );
}

import { Skeleton } from './Skeleton';

export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-border-subtle bg-background-secondary p-5">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6" />
        </div>
    );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-10 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}
