import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <Icon className="w-16 h-16 text-neutral-600 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-neutral-500 text-center max-w-md mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} variant="primary">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
