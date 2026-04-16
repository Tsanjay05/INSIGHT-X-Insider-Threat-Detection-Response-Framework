
import { cn } from '../../lib/utils';

interface ToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Toggle({ checked, onCheckedChange, disabled, className }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-bg-primary",
                checked ? "bg-primary-400" : "bg-neutral-600",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}
