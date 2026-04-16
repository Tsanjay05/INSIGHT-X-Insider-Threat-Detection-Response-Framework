/**
 * Grid display for entity metadata key-value pairs
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface InfoItem {
    label: string;
    value: React.ReactNode;
    className?: string;
}

interface DetailInfoGridProps {
    items: InfoItem[];
    columns?: 2 | 3 | 4;
    className?: string;
}

export function DetailInfoGrid({ items, columns = 3, className }: DetailInfoGridProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-4', gridCols[columns], className)}>
            {items.map((item, i) => (
                <div key={i} className={cn('space-y-1', item.className)}>
                    <dt className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                        {item.label}
                    </dt>
                    <dd className="text-sm text-text-primary">{item.value}</dd>
                </div>
            ))}
        </div>
    );
}
