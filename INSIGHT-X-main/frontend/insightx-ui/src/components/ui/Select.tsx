
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function Select({ options, value, onChange, placeholder = "Select...", className, disabled }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-border-default bg-white/5 px-3 py-2 text-sm text-text-primary ring-offset-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50",
                    isOpen && "ring-2 ring-primary-400 border-primary-400"
                )}
            >
                <span className={cn(!selectedOption && "text-text-tertiary")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border-strong bg-bg-secondary py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                "relative flex cursor-default select-none items-center py-2 pl-3 pr-9",
                                option.value === value ? "bg-primary-400/10 text-primary-400" : "text-text-primary hover:bg-bg-tertiary"
                            )}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span className={cn("block truncate", option.value === value && "font-medium")}>
                                {option.label}
                            </span>
                            {option.value === value && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-400">
                                    <Check className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
