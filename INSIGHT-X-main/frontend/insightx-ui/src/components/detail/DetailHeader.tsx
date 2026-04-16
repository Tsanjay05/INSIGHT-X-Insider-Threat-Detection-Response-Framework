/**
 * Reusable detail page header
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

interface DetailHeaderProps {
    title: string;
    subtitle?: string;
    backTo?: string;
    badges?: Array<{ label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'outline' }>;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
}

export function DetailHeader({ title, subtitle, backTo, badges, actions, icon }: DetailHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {backTo && (
                <button
                    onClick={() => navigate(backTo)}
                    className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            )}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {icon && (
                        <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400 mt-0.5">
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
                            {badges?.map((badge, i) => (
                                <Badge key={i} variant={badge.variant}>{badge.label}</Badge>
                            ))}
                        </div>
                        {subtitle && (
                            <p className="text-text-secondary mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
