import React from 'react';
import { LucideIcon, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No data available',
    description = 'There is nothing to show here yet.',
    icon: Icon = FileX,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg border border-dashed border-border-default bg-bg-secondary/30 p-12 text-center',
                className
            )}
        >
            <div className="mb-4 rounded-full bg-bg-tertiary p-3">
                <Icon className="h-6 w-6 text-text-tertiary" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-text-primary">{title}</h3>
            <p className="mb-6 max-w-sm text-sm text-text-tertiary">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="outline">
                    {action.label}
                </Button>
            )}
        </div>
    );
};
