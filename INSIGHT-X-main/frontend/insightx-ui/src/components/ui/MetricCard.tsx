import { cn } from '../../lib/utils';
import { Card } from './Card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        label?: string; // e.g., "vs last month"
        direction?: 'up' | 'down' | 'neutral'; // explicit override, otherwise inferred from value
    };
    icon?: React.ReactNode;
    className?: string;
    valueClassName?: string;
}

export function MetricCard({
    title,
    value,
    trend,
    icon,
    className,
    valueClassName,
}: MetricCardProps) {
    const trendDirection = trend?.direction || (trend?.value && trend.value > 0 ? 'up' : trend?.value && trend.value < 0 ? 'down' : 'neutral');
    const trendColor = trendDirection === 'up' ? 'text-success-400' : trendDirection === 'down' ? 'text-danger-400' : 'text-text-tertiary';
    const TrendIcon = trendDirection === 'up' ? ArrowUp : trendDirection === 'down' ? ArrowDown : Minus;

    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-text-tertiary">{title}</p>
                    <div className={cn("text-2xl font-bold text-text-primary mt-2", valueClassName)}>
                        {value}
                    </div>
                </div>
                {icon && (
                    <div className="p-2 bg-bg-tertiary rounded-lg text-text-secondary">
                        {icon}
                    </div>
                )}
            </div>

            {trend && (
                <div className="flex items-center gap-2 mt-4 text-xs">
                    <span className={cn("flex items-center font-medium", trendColor)}>
                        <TrendIcon className="w-3 h-3 mr-1" />
                        {Math.abs(trend.value)}%
                    </span>
                    {trend.label && (
                        <span className="text-text-tertiary">{trend.label}</span>
                    )}
                </div>
            )}
        </Card>
    );
}
