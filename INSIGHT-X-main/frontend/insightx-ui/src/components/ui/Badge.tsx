import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'bg-white/10 text-text-primary ring-white/20',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/80',
                outline: 'text-text-primary ring-border-default',
                success:
                    'bg-semantic-success-bg text-semantic-success-400 ring-semantic-success-400/20',
                warning:
                    'bg-semantic-warning-bg text-semantic-warning-400 ring-semantic-warning-400/20',
                danger:
                    'bg-semantic-danger-bg text-semantic-danger-400 ring-semantic-danger-400/20',
                info:
                    'bg-semantic-info-bg text-semantic-info-400 ring-semantic-info-400/20',
            },
            size: {
                sm: 'px-1.5 py-0.5 text-[10px]',
                default: 'px-2 py-1 text-xs',
                lg: 'px-3 py-1.5 text-sm',
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
