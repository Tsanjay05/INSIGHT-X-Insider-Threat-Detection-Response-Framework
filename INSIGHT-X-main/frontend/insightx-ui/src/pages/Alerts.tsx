import { useState } from 'react';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAlerts } from '@/hooks/useAlertDetail';
import { formatTimeAgo } from '@/lib/utils';
import type { AlertSeverity } from '../api/alerts.types';

export default function Alerts() {
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useAlerts({
        page,
        pageSize: 20,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
    });

    // Filter alerts by search query (client-side for now)
    const filteredAlerts = data?.alerts?.filter(alert =>
        searchQuery === '' ||
        alert.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.source?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <ErrorState message={(error as Error).message || 'Failed to load alerts'} />;
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Alerts</h1>
                    <p className="text-text-secondary">Monitor and respond to security alerts across the organization.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Input
                        placeholder="Search alerts..."
                        icon={<Search className="h-4 w-4" />}
                        className="w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="w-32">
                        <Select
                            options={[
                                { value: 'all', label: 'All Severities' },
                                { value: 'CRITICAL', label: 'Critical' },
                                { value: 'HIGH', label: 'High' },
                                { value: 'MEDIUM', label: 'Medium' },
                                { value: 'LOW', label: 'Low' },
                            ]}
                            onChange={(value) => setSeverityFilter(value as AlertSeverity | 'all')}
                            placeholder="Severity"
                            value={severityFilter}
                        />
                    </div>
                </div>
            </div>

            {filteredAlerts.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Search}
                        title="No Alerts Found"
                        description={
                            searchQuery || severityFilter !== 'all'
                                ? "No alerts match your search filters."
                                : "No security alerts have been generated yet."
                        }
                    />
                </Card>
            ) : (
                <Card>
                    <div className="space-y-0">
                        {filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="border-b border-border-subtle last:border-0 p-4 hover:bg-bg-tertiary/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant={
                                                    alert.severity === 'CRITICAL' ? 'danger' :
                                                        alert.severity === 'HIGH' ? 'warning' :
                                                            alert.severity === 'MEDIUM' ? 'info' : 'default'
                                                }
                                                size="sm"
                                            >
                                                {alert.severity}
                                            </Badge>
                                            <span className="text-xs text-text-tertiary">
                                                {formatTimeAgo(alert.createdAt)}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-semibold text-text-primary mb-1">
                                            {alert.title}
                                        </h3>

                                        <p className="text-sm text-text-secondary mb-2">
                                            {alert.description || 'No description available'}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
                                            {alert.entityId && (
                                                <span>
                                                    Entity: <span className="text-text-primary font-mono">{alert.entityId}</span>
                                                </span>
                                            )}
                                            {alert.source && (
                                                <span>
                                                    Source: <span className="text-text-primary">{alert.source}</span>
                                                </span>
                                            )}
                                            {alert.riskScore !== undefined && (
                                                <span>
                                                    Risk Score: <span className="text-text-primary font-semibold">{alert.riskScore}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Pagination */}
                    {data && data.total > 20 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                            <p className="text-sm text-text-secondary">
                                Showing {filteredAlerts.length} of {data.total} alerts
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 text-sm bg-bg-tertiary border border-border-default rounded-md text-text-primary hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={filteredAlerts.length < 20}
                                    className="px-3 py-1 text-sm bg-bg-tertiary border border-border-default rounded-md text-text-primary hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            )
            }
        </div >
    );
}
