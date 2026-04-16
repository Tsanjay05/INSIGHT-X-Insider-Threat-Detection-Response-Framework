import React from 'react';
import { cn } from '../../../lib/utils';
import { Card } from '../Card';

interface ChartWrapperProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export function ChartWrapper({
    title,
    description,
    action,
    children,
    className,
    containerClassName,
}: ChartWrapperProps) {
    return (
        <Card className={cn("flex flex-col", className)}>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                    {description && (
                        <p className="text-sm text-text-tertiary mt-1">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className={cn("flex-1 min-h-[300px] w-full", containerClassName)}>
                {children}
            </div>
        </Card>
    );
}
