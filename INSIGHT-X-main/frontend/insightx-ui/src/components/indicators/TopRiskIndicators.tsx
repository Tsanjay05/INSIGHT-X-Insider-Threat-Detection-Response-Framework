import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

export interface RiskIndicator {
    id: string;
    title: string;
    description: string;
    severity: 'danger' | 'warning' | 'info';
}

interface TopRiskIndicatorsProps {
    indicators?: RiskIndicator[];
}

const iconBySeverity = {
    danger: ShieldAlert,
    warning: Zap,
    info: AlertTriangle,
} as const;

const colorBySeverity = {
    danger: 'bg-semantic-danger-bg text-semantic-danger-400',
    warning: 'bg-semantic-warning-bg text-semantic-warning-400',
    info: 'bg-semantic-info-bg text-semantic-info-400',
} as const;

export function TopRiskIndicators({ indicators = [] }: TopRiskIndicatorsProps) {
    return (
        <Card variant="default" className="col-span-12 lg:col-span-4">
            <CardHeader>
                <CardTitle>Top Risk Indicators</CardTitle>
            </CardHeader>
            <CardContent>
                {indicators.length > 0 ? (
                    <div className="space-y-4">
                        {indicators.map((indicator) => {
                            const Icon = iconBySeverity[indicator.severity];
                            const colorClasses = colorBySeverity[indicator.severity];

                            return (
                                <div
                                    key={indicator.id}
                                    className="flex items-start gap-4 p-3 rounded-md bg-white/5 border border-border-subtle hover:bg-white/10 transition-colors"
                                >
                                    <div className={`p-2 rounded-full shrink-0 ${colorClasses}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-text-primary">{indicator.title}</h4>
                                        <p className="text-xs text-text-secondary mt-1">{indicator.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-text-tertiary">
                        No risk indicators available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
