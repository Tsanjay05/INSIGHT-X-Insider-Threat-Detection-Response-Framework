import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Shield, Users, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { TrustTrendChart, type TrustTrendDatum } from '../components/charts/TrustTrendChart';
import { HighRiskUsersTable } from '../components/tables/HighRiskUsersTable';
import { TopRiskIndicators, type RiskIndicator } from '../components/indicators/TopRiskIndicators';
import { getAlerts } from '../api/alerts';
import { getCases } from '../api/cases';
import { getUsers } from '../api/users';
import { formatTimeAgo } from '../lib/utils';
import { getTrustColor, getTrustLabel } from '../config/designTokens';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export default function Dashboard() {
    const navigate = useNavigate();

    const alertsQuery = useQuery({
        queryKey: ['alerts', { page: 1, pageSize: 20 }],
        queryFn: () => getAlerts({ page: 1, pageSize: 20 }),
    });

    const casesQuery = useQuery({
        queryKey: ['cases', { page: 1, pageSize: 10 }],
        queryFn: () => getCases({ page: 1, pageSize: 10 }),
    });

    const usersQuery = useQuery({
        queryKey: ['users', { page: 1, pageSize: 20 }],
        queryFn: () => getUsers({ page: 1, pageSize: 20 }),
    });

    if (alertsQuery.isLoading || casesQuery.isLoading || usersQuery.isLoading) {
        return <DashboardSkeleton />;
    }

    const queryError = alertsQuery.error || casesQuery.error || usersQuery.error;
    if (queryError) {
        return (
            <ErrorState
                error={queryError}
                onRetry={() => {
                    void alertsQuery.refetch();
                    void casesQuery.refetch();
                    void usersQuery.refetch();
                }}
            />
        );
    }

    const alerts = alertsQuery.data?.alerts ?? [];
    const cases = casesQuery.data?.cases ?? [];
    const users = usersQuery.data?.users ?? [];

    const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
    const pendingCases = cases.filter((c) => c.status === 'OPEN' || c.status === 'INVESTIGATING').length;
    const totalUsers = usersQuery.data?.total ?? users.length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;

    const avgTrustScore = users.length
        ? Math.round(users.reduce((sum, user) => sum + (user.trustScore ?? 0), 0) / users.length)
        : 0;

    const trustDirection = avgTrustScore >= 70 ? 'up' : 'down';

    const trustTrendData: TrustTrendDatum[] = [...alerts]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-8)
        .map((alert) => ({
            time: new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            score: clamp(100 - (alert.riskScore ?? 0), 0, 100),
        }));

    const chartData: TrustTrendDatum[] = trustTrendData.length > 0
        ? trustTrendData
        : [{ time: 'Now', score: avgTrustScore }];

    const criticalSeverityCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
    const escalatedCount = alerts.filter((a) => a.status === 'ESCALATED').length;
    const openCaseCount = cases.filter((c) => c.status === 'OPEN' || c.status === 'INVESTIGATING').length;
    const lowTrustUsersCount = users.filter((u) => (u.trustScore ?? 0) < 50).length;

    const riskIndicators: RiskIndicator[] = [];

    if (criticalSeverityCount > 0) {
        riskIndicators.push({
            id: 'critical-alerts',
            title: 'Critical Alerts',
            description: `${criticalSeverityCount} critical alert${criticalSeverityCount > 1 ? 's' : ''} require immediate response.`,
            severity: 'danger',
        });
    }

    if (openCaseCount > 0) {
        riskIndicators.push({
            id: 'open-cases',
            title: 'Open Investigations',
            description: `${openCaseCount} case${openCaseCount > 1 ? 's' : ''} currently open or under investigation.`,
            severity: 'warning',
        });
    }

    if (lowTrustUsersCount > 0) {
        riskIndicators.push({
            id: 'low-trust-users',
            title: 'Low Trust Users',
            description: `${lowTrustUsersCount} user${lowTrustUsersCount > 1 ? 's' : ''} with trust score below 50.`,
            severity: 'info',
        });
    }

    if (escalatedCount > 0) {
        riskIndicators.push({
            id: 'escalated-alerts',
            title: 'Escalated Alerts',
            description: `${escalatedCount} escalated alert${escalatedCount > 1 ? 's' : ''} awaiting closure.`,
            severity: 'warning',
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-1">Real-time overview of your security posture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-text-tertiary">Average Trust Score</p>
                            <Shield className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold" style={{ color: getTrustColor(avgTrustScore) }}>
                                {avgTrustScore}
                            </p>
                            <span className="text-sm text-text-tertiary">/ 100</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            {trustDirection === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-semantic-success-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-semantic-danger-400" />
                            )}
                            <span className="text-xs text-text-tertiary">{getTrustLabel(avgTrustScore)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-text-tertiary">Critical Alerts</p>
                            <AlertTriangle className="w-5 h-5 text-semantic-danger-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-text-primary">{criticalAlerts}</p>
                            <span className="text-sm text-text-tertiary">active</span>
                        </div>
                        <div className="mt-2">
                            <Badge variant={criticalAlerts > 0 ? 'danger' : 'success'} size="sm">
                                {criticalAlerts > 0 ? 'Requires attention' : 'All clear'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-text-tertiary">Open Cases</p>
                            <Activity className="w-5 h-5 text-semantic-warning-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold text-text-primary">{pendingCases}</div>
                            <p className="text-xs text-text-tertiary mt-1">Requiring action</p>
                        </div>
                        <div className="mt-2">
                            <span className="text-xs text-text-tertiary">{casesQuery.data?.total ?? cases.length} total cases</span>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-text-tertiary">Monitored Users</p>
                            <Users className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-text-primary">{totalUsers}</p>
                            <span className="text-sm text-text-tertiary">users</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-xs text-text-tertiary">{activeUsers} active</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-12">
                <div className="col-span-12 lg:col-span-8">
                    <TrustTrendChart data={chartData} />
                </div>
                <TopRiskIndicators indicators={riskIndicators.slice(0, 3)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {alerts.length > 0 ? (
                            <div className="space-y-3">
                                {alerts.slice(0, 5).map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary border border-border-subtle hover:border-border-default transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
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
                                                <span className="text-xs text-text-tertiary">{formatTimeAgo(alert.createdAt)}</span>
                                            </div>
                                            <p className="text-sm font-medium text-text-primary truncate">{alert.title}</p>
                                            <p className="text-xs text-text-secondary truncate">{alert.source}</p>
                                            {alert.entityId && (
                                                <p className="text-xs text-text-tertiary font-mono mt-1">{alert.entityId}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-tertiary text-center py-8">No recent alerts</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cases.length > 0 ? (
                            <div className="space-y-3">
                                {cases.slice(0, 5).map((caseItem) => (
                                    <div
                                        key={caseItem.id}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary border border-border-subtle hover:border-border-default transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-text-primary font-mono">{caseItem.id}</span>
                                                <Badge
                                                    variant={
                                                        caseItem.status === 'OPEN' ? 'warning' :
                                                            caseItem.status === 'INVESTIGATING' ? 'info' : 'success'
                                                    }
                                                    size="sm"
                                                >
                                                    {caseItem.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-text-primary">{caseItem.title || 'Untitled Case'}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                                                <span>Priority: {caseItem.priority}</span>
                                                {caseItem.assignedTo && <span>• {caseItem.assignedTo}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-tertiary text-center py-8">No active cases</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <HighRiskUsersTable users={users} onViewAll={() => navigate('/users')} />
        </div>
    );
}
