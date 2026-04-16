import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary:
                    'bg-gradient-to-br from-primary-400 to-primary-500 text-white hover:brightness-110 shadow-md active:scale-95',
                secondary:
                    'bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/30',
                danger:
                    'bg-gradient-to-br from-semantic-danger-400 to-semantic-danger-600 text-white hover:brightness-110',
                ghost:
                    'bg-transparent text-white/70 hover:bg-white/10 hover:text-white',
                outline:
                    'bg-transparent border border-border-default text-text-primary hover:bg-white/5',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 px-3',
                lg: 'h-11 px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={loading || props.disabled}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
