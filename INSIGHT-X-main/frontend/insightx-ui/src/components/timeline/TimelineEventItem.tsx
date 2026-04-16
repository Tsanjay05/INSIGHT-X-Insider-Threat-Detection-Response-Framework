import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';

interface TimelineEventItemProps {
    timestamp: string;
    title: string;
    description: string;
    riskScore?: number;
    user?: string;
    resource?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: React.ReactNode;
}

export function TimelineEventItem({
    timestamp,
    title,
    description,
    riskScore,
    user,
    resource,
    severity = 'low',
    details
}: TimelineEventItemProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const severityColors = {
        low: 'border-l-gray-600',
        medium: 'border-l-warning-400',
        high: 'border-l-danger-400',
        critical: 'border-l-danger-600',
    };

    return (
        <div className="relative pl-6 pb-6 last:pb-0">
            {/* Timeline Line */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-0.5 bg-border-default", severityColors[severity])} />

            {/* Event Content */}
            <div
                className={cn(
                    "bg-bg-secondary border border-border-subtle rounded-lg p-4 transition-all hover:shadow-md",
                    isExpanded && "ring-1 ring-border-strong"
                )}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                            <span className="text-xs font-mono text-text-tertiary">{timestamp}</span>
                            <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
                            {riskScore !== undefined && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold",
                                    riskScore >= 80 ? "bg-success-bg text-success-400" :
                                        riskScore >= 60 ? "bg-primary-500/20 text-primary-400" :
                                            riskScore >= 40 ? "bg-warning-bg text-warning-400" :
                                                "bg-danger-bg text-danger-400"
                                )}>
                                    Risk: {riskScore}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
                            {user && <span>User: <span className="text-text-primary">{user}</span></span>}
                            {resource && <span>Resource: <span className="text-text-primary">{resource}</span></span>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {details && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                aria-expanded={isExpanded}
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        )}
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {isExpanded && details && (
                    <div className="mt-4 pt-4 border-t border-border-subtle animate-in slide-in-from-top-2">
                        {details}
                    </div>
                )}
            </div>
        </div>
    );
}
