import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
    'animate-spin',
    {
        variants: {
            size: {
                sm: 'h-4 w-4',
                default: 'h-5 w-5',
                md: 'h-8 w-8',
                lg: 'h-12 w-12',
            },
            variant: {
                default: 'text-primary-400',
                white: 'text-white',
                muted: 'text-text-tertiary',
            }
        },
        defaultVariants: {
            size: 'default',
            variant: 'default',
        },
    }
);

export interface SpinnerProps extends React.SVGProps<SVGSVGElement>, VariantProps<typeof spinnerVariants> { }

export function Spinner({ className, size, variant, ...props }: SpinnerProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(spinnerVariants({ size, variant, className }))}
            {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
