import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Shield } from 'lucide-react';
import { trustApi, type TrustHistoryEntry } from '../../api/trust';
import { TrustScoreBadge } from '../../components/trust/TrustScoreBadge';
import { TrustTrendChart } from '../../components/trust/TrustTrendChart';
import { TrustDelta } from '../../components/trust/TrustDelta';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatTimestamp, formatTimeAgo } from '../../lib/utils';
import { getTrustColor } from '../../config/designTokens';

export default function EntityTrustDetail() {
    const { entityId } = useParams<{ entityId: string }>();

    const { data: trustState, isLoading: trustLoading, error: trustError } = useQuery({
        queryKey: ['trust', entityId],
        queryFn: () => trustApi.getEntityTrust(entityId!),
        enabled: !!entityId,
    });

    const { data: trustHistory, isLoading: historyLoading, error: historyError } = useQuery({
        queryKey: ['trust-history', entityId],
        queryFn: () => trustApi.getTrustHistory(entityId!, 20),
        enabled: !!entityId,
    });

    const isLoading = trustLoading || historyLoading;
    const error = trustError || historyError;

    if (isLoading) return <LoadingState message="Loading trust state..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load trust state'} />;
    if (!trustState) return <ErrorState message="Trust state not found" />;

    // Transform history data for chart
    const chartData = trustHistory?.map(entry => ({
        timestamp: entry.timestamp,
        score: entry.trustScore,
        confidence: entry.confidence * 100, // Convert to percentage for display
    })) || [];

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link to="/" className="hover:text-text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/trust" className="hover:text-text-primary">Trust</Link>
                <span>/</span>
                <span className="text-text-primary">{entityId}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link to="/" className="text-text-secondary hover:text-text-primary">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-bold text-text-primary">Entity Trust Profile</h1>
                    </div>
                    <p className="text-text-secondary">Entity ID: {entityId}</p>
                </div>
            </div>

            {/* Trust Score Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="flex flex-col items-center justify-center py-8">
                    <TrustScoreBadge
                        score={trustState.currentScore.value}
                        confidence={trustState.currentScore.confidence}
                        size="large"
                        showLabel
                    />
                </Card>

                <Card>
                    <div className="flex items-start gap-3 mb-4">
                        <Clock className="w-5 h-5 text-primary-400 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">Last Evaluated</h3>
                            <p className="text-sm text-text-tertiary">Trust computation timestamp</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{formatTimeAgo(trustState.lastEvaluated)}</p>
                    <p className="text-sm text-text-secondary mt-1">{formatTimestamp(trustState.lastEvaluated)}</p>
                </Card>
            </div>

            {/* Trust Timeline Chart */}
            <Card>
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary-400 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">Trust Score Timeline</h3>
                            <p className="text-sm text-text-tertiary">Historical trust score changes</p>
                        </div>
                    </div>

                    {/* Trust Delta using last 2 points if available */}
                    {chartData.length >= 2 && (
                        <TrustDelta
                            current={chartData[chartData.length - 1].score}
                            previous={chartData[chartData.length - 2].score}
                        />
                    )}
                </div>

                {chartData.length === 0 ? (
                    <EmptyState
                        title="No History Available"
                        description="No historical trust score data is available for this entity yet."
                        icon={Shield}
                    />
                ) : (
                    <TrustTrendChart data={chartData} />
                )}
            </Card>

            {/* Trust History Table */}
            {trustHistory && trustHistory.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Trust Evaluations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Timestamp</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Trust Score</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Confidence</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Risk Level</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Decision ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trustHistory.slice(0, 10).map((entry: TrustHistoryEntry) => (
                                    <tr key={entry.decisionId} className="border-b border-border-subtle hover:bg-bg-tertiary/30 transition-colors">
                                        <td className="py-3 px-4 text-sm text-text-secondary">
                                            {formatTimeAgo(entry.timestamp)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: getTrustColor(entry.trustScore) }}
                                            >
                                                {entry.trustScore}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-primary">
                                            {Math.round(entry.confidence * 100)}%
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded ${entry.riskLevel === 'CRITICAL' ? 'bg-semantic-danger-bg text-semantic-danger-400' :
                                                entry.riskLevel === 'HIGH' ? 'bg-semantic-warning-bg text-semantic-warning-400' :
                                                    entry.riskLevel === 'MEDIUM' ? 'bg-semantic-info-bg text-semantic-info-400' :
                                                        'bg-semantic-success-bg text-semantic-success-400'
                                                }`}>
                                                {entry.riskLevel}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-text-tertiary font-mono">
                                            {entry.decisionId}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
