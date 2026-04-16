import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
// import { Calendar } from '../ui/calendar'; // Assumption: Calendar component exists or we use native date input for now

interface FilterOption {
    label: string;
    value: string;
}

interface FilterGroup {
    id: string;
    label: string;
    type: 'select' | 'multi-select' | 'date-range' | 'boolean';
    options?: FilterOption[];
}

interface AdvancedFilterProps {
    filters: FilterGroup[];
    activeFilters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
    className?: string;
}

export function AdvancedFilter({
    filters,
    activeFilters,
    onFilterChange,
    className,
}: AdvancedFilterProps) {
    const [open, setOpen] = useState(false);

    // Count active filters
    const activeCount = Object.keys(activeFilters).filter(k =>
        activeFilters[k] !== undefined &&
        activeFilters[k] !== null &&
        activeFilters[k] !== '' &&
        (Array.isArray(activeFilters[k]) ? activeFilters[k].length > 0 : true)
    ).length;

    const handleClear = () => {
        onFilterChange({});
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-8 border-dashed", className)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {activeCount > 0 && (
                        <>
                            <div className="mx-2 h-4 w-[1px] bg-border-default" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                {activeCount}
                            </Badge>
                            <Badge variant="secondary" className="hidden rounded-sm px-1 font-normal lg:inline-flex">
                                {activeCount} selected
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                {/* Placeholder for filter UI - utilizing simple logic for now */}
                <div className="p-4 space-y-4">
                    <h4 className="font-medium leading-none">Filters</h4>
                    {filters.map((group) => (
                        <div key={group.id} className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">{group.label}</label>
                            {group.type === 'select' && (
                                <select
                                    className="w-full bg-bg-tertiary border border-border-default rounded-md text-sm p-1"
                                    value={activeFilters[group.id] || ''}
                                    onChange={(e) => onFilterChange({ ...activeFilters, [group.id]: e.target.value })}
                                >
                                    <option value="">All</option>
                                    {group.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}

                    <div className="pt-2 flex justify-between border-t border-border-default">
                        <Button variant="ghost" size="sm" onClick={handleClear} className="h-auto p-0 text-xs text-text-tertiary">
                            Clear filters
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
