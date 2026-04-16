/**
 * Vertical timeline for events, status changes, comments
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/utils';
import {
    AlertCircle,
    MessageSquare,
    Shield,
    UserCheck,
    ArrowUpCircle,
    PlusCircle,
    Clock,
    CheckCircle,
} from 'lucide-react';

interface TimelineItem {
    id: string;
    type: string;
    description: string;
    actor?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

interface ActivityTimelineProps {
    items: TimelineItem[];
    className?: string;
}

const getIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
        CREATED: <PlusCircle className="h-4 w-4" />,
        STATUS_CHANGE: <ArrowUpCircle className="h-4 w-4" />,
        COMMENT: <MessageSquare className="h-4 w-4" />,
        ESCALATION: <AlertCircle className="h-4 w-4" />,
        ASSIGNMENT: <UserCheck className="h-4 w-4" />,
        CONTROL_APPLIED: <Shield className="h-4 w-4" />,
        EVIDENCE_ADDED: <PlusCircle className="h-4 w-4" />,
        SLA_BREACH: <Clock className="h-4 w-4" />,
        RESOLVED: <CheckCircle className="h-4 w-4" />,
    };
    return iconMap[type] || <Clock className="h-4 w-4" />;
};

const getColor = (type: string) => {
    const colorMap: Record<string, string> = {
        CREATED: 'bg-primary-500/20 text-primary-400',
        STATUS_CHANGE: 'bg-info-500/20 text-info-400',
        COMMENT: 'bg-white/10 text-text-secondary',
        ESCALATION: 'bg-warning-500/20 text-warning-400',
        ASSIGNMENT: 'bg-success-500/20 text-success-400',
        CONTROL_APPLIED: 'bg-primary-500/20 text-primary-400',
        EVIDENCE_ADDED: 'bg-info-500/20 text-info-400',
        SLA_BREACH: 'bg-danger-500/20 text-danger-400',
        RESOLVED: 'bg-success-500/20 text-success-400',
    };
    return colorMap[type] || 'bg-white/10 text-text-secondary';
};

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
    return (
        <div className={cn('space-y-0', className)}>
            {items.map((item, index) => (
                <div key={item.id} className="flex gap-3 relative">
                    {/* Connector line */}
                    {index < items.length - 1 && (
                        <div className="absolute left-[15px] top-[32px] bottom-0 w-px bg-border-subtle" />
                    )}

                    {/* Icon */}
                    <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10', getColor(item.type))}>
                        {getIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6 min-w-0">
                        <p className="text-sm text-text-primary">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {item.actor && (
                                <span className="text-xs text-text-secondary font-medium">{item.actor}</span>
                            )}
                            {item.actor && <span className="text-xs text-text-tertiary">·</span>}
                            <span className="text-xs text-text-tertiary">{formatTimeAgo(item.timestamp)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
