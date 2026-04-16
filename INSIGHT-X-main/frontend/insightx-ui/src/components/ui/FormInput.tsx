/**
 * Form Input component with label support
 */

import { Input, InputProps } from './Input';
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export interface FormInputProps extends Omit<InputProps, 'error'> {
    label?: string;
    helperText?: string;
    error?: string | boolean | null;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, helperText, error, className, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
        const hasError = !!error;
        const errorMessage = typeof error === 'string' ? error : null;

        return (
            <div className={cn("space-y-2", className)}>
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
                        {label}
                    </label>
                )}
                <Input
                    id={inputId}
                    ref={ref}
                    error={hasError}
                    {...props}
                />
                {errorMessage ? (
                    <p className="text-xs text-semantic-danger-400">{errorMessage}</p>
                ) : helperText ? (
                    <p className="text-xs text-text-tertiary">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';

export { FormInput };
