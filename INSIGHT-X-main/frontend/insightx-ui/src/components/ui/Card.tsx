import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva(
    'rounded-lg transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-bg-tertiary border border-border-subtle',
                elevated: 'bg-bg-tertiary shadow-lg border-none',
                glass: 'bg-bg-tertiary/50 backdrop-blur-md border border-border-subtle',
                outlined: 'bg-transparent border border-border-default',
            },
            padding: {
                default: 'p-5',
                none: 'p-0',
                sm: 'p-3',
                lg: 'p-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'default',
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

function Card({ className, variant, padding, ...props }: CardProps) {
    return (
        <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
    );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn('text-sm text-text-secondary', className)}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex items-center pt-4', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
