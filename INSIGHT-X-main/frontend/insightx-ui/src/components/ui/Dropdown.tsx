import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    multiple?: boolean;
    searchable?: boolean;
}

export function Dropdown({
    options,
    value,
    onChange,
    placeholder = "Select...",
    className,
    disabled,
    multiple = false,
    searchable = false
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (optionValue: string) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const removeValue = (e: React.MouseEvent, valToRemove: string) => {
        e.stopPropagation();
        if (Array.isArray(value)) {
            onChange(value.filter(v => v !== valToRemove));
        }
    };

    const isSelected = (optionValue: string) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(optionValue);
        }
        return value === optionValue;
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Trigger */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex min-h-[40px] w-full items-center justify-between rounded-md border border-border-default bg-bg-secondary px-3 py-2 text-sm ring-offset-bg-primary transition-colors hover:bg-bg-tertiary cursor-pointer",
                    isOpen && "ring-2 ring-primary-400 border-primary-400",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                <div className="flex flex-wrap gap-1">
                    {multiple && Array.isArray(value) && value.length > 0 ? (
                        value.map(val => {
                            const opt = options.find(o => o.value === val);
                            return (
                                <Badge key={val} variant="secondary" className="mr-1 mb-0.5">
                                    {opt?.label || val}
                                    <span
                                        className="ml-1 cursor-pointer hover:text-text-primary"
                                        onClick={(e) => removeValue(e, val)}
                                    >
                                        <X className="h-3 w-3" />
                                    </span>
                                </Badge>
                            );
                        })
                    ) : !multiple && value ? (
                        <span className="text-text-primary">
                            {options.find(o => o.value === value)?.label || value}
                        </span>
                    ) : (
                        <span className="text-text-tertiary">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </div>

            {/* Panel */}
            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full rounded-md border border-border-strong bg-bg-secondary shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                    {searchable && (
                        <div className="p-2 border-b border-border-subtle sticky top-0 bg-bg-secondary z-10">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-text-tertiary" />
                                <input
                                    type="text"
                                    className="w-full bg-bg-tertiary border border-border-subtle rounded-md py-1.5 pl-8 pr-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-400"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-text-tertiary">No results found.</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors",
                                        isSelected(option.value)
                                            ? "bg-primary-400/10 text-primary-400"
                                            : "text-text-primary hover:bg-bg-tertiary"
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className={cn("block truncate", isSelected(option.value) && "font-medium")}>
                                        {option.label}
                                    </span>
                                    {isSelected(option.value) && (
                                        <span className="absolute right-2 flex items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
