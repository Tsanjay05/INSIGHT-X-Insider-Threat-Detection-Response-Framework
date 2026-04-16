import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

/**
 * Skeleton loader for the Dashboard page.
 * Used while dashboard metrics, risk distribution, and activity data are loading.
 * Aligns with Master-Front Phase 3 (Dashboard Implementation).
 */
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>

            {/* Metrics Grid (4 cards) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border border-border-default p-6 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-border-default p-6 h-80">
                    <Skeleton className="mb-4 h-5 w-32" />
                    <Skeleton className="h-full w-full rounded" />
                </div>
                <div className="rounded-lg border border-border-default p-6 h-80">
                    <Skeleton className="mb-4 h-5 w-36" />
                    <Skeleton className="h-full w-full rounded" />
                </div>
            </div>

            {/* Activity / Table section */}
            <div className="rounded-lg border border-border-default p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn('flex items-center gap-4 py-3')}>
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
