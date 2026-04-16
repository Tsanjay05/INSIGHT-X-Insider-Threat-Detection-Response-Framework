import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, error, ...props }, ref) => {
        return (
            <div className="relative flex items-center">
                {icon && (
                    <div className="absolute left-3 text-text-tertiary">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-md border bg-white/5 px-3 py-2 text-sm ring-offset-bg-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary transition-colors',
                        error
                            ? 'border-semantic-danger-400 focus-visible:ring-semantic-danger-400'
                            : 'border-border-default focus-visible:ring-border-focus',
                        icon && 'pl-10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
