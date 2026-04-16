import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface TrustDeltaProps {
    current: number;
    previous: number;
    className?: string;
    showLabel?: boolean;
}

export function TrustDelta({ current, previous, className, showLabel = true }: TrustDeltaProps) {
    const delta = current - previous;
    const absDelta = Math.abs(delta);

    // Determine status
    // Using simple thresholds: increase is good, decrease is bad (usually, assuming higher score is better)
    // Actually, for Trust Score, higher is better.
    const isPositive = delta > 0;
    const isNegative = delta < 0;

    const Icon = isPositive
        ? TrendingUp
        : isNegative
            ? TrendingDown
            : Minus;

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <Badge
                variant={isPositive ? 'success' : isNegative ? 'danger' : 'secondary'}
                size="sm"
                className="gap-1 px-1.5"
            >
                <Icon className="w-3 h-3" />
                <span>{absDelta.toFixed(1)}</span>
                {/* <span>({Math.abs(percentChange).toFixed(1)}%)</span> */}
                {/* Just showing absolute score diff for now as simpler */}
            </Badge>

            {showLabel && (
                <span className="text-xs text-text-tertiary">
                    {isPositive ? 'improved' : isNegative ? 'declined' : 'no change'}
                </span>
            )}
        </div>
    );
}
