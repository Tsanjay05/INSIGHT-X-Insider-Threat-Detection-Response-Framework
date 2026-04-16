import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Brain, TrendingUp } from 'lucide-react';
import { intentApi } from '../../api/intent';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatTimestamp } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function IntentDetail() {
    const { entityId } = useParams<{ entityId: string }>();
    const navigate = useNavigate();

    const { data: hypothesis, isLoading, error } = useQuery({
        queryKey: ['intent', entityId],
        queryFn: () => intentApi.getHypothesis(entityId!),
        enabled: !!entityId,
    });

    if (isLoading) return <LoadingState message="Loading intent hypothesis..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load hypothesis'} />;
    if (!hypothesis) return <ErrorState message="Hypothesis not found" />;

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link to="/" className="hover:text-text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/intent" className="hover:text-text-primary">Intent</Link>
                <span>/</span>
                <span className="text-text-primary">{entityId}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-bold text-text-primary">Intent Hypothesis</h1>
                    </div>
                    <p className="text-text-secondary">Entity: {hypothesis.entityId}</p>
                </div>
                <Link
                    to={`/trust/${hypothesis.entityId}`}
                    className="text-sm text-primary-400 hover:text-primary-300"
                >
                    View Trust Profile →
                </Link>
            </div>

            {/* Hypothesis Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-start gap-3 mb-3">
                        <Brain className="w-5 h-5 text-primary-400 mt-1" />
                        <div>
                            <p className="text-xs text-text-tertiary">Intent Type</p>
                            <p className="text-xl font-bold text-text-primary mt-1">{hypothesis.intentType}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-success-400 mt-1" />
                        <div>
                            <p className="text-xs text-text-tertiary">Confidence</p>
                            <p className="text-3xl font-bold text-text-primary mt-1">
                                {Math.round(hypothesis.confidence * 100)}%
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div>
                        <p className="text-xs text-text-tertiary mb-2">Last Updated</p>
                        <p className="text-sm font-medium text-text-primary">
                            {formatTimestamp(hypothesis.lastUpdated)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Confidence Timeline */}
            {hypothesis.confidenceHistory && hypothesis.confidenceHistory.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Confidence Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={hypothesis.confidenceHistory}>
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                                stroke="#9E9EA7"
                                style={{ fontSize: '11px' }}
                            />
                            <YAxis
                                domain={[0, 1]}
                                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                                stroke="#9E9EA7"
                                style={{ fontSize: '11px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1C1C1E',
                                    border: '1px solid rgba(255, 255, 255, 0.18)',
                                    borderRadius: '6px',
                                }}
                                labelFormatter={(value) => formatTimestamp(value as string)}
                                formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Confidence']}
                            />
                            <Line
                                type="monotone"
                                dataKey="confidence"
                                stroke="#306FFF"
                                strokeWidth={2}
                                dot={{ fill: '#306FFF', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Evidence / Supporting Signals */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Evidence</h3>
                {hypothesis.evidence && hypothesis.evidence.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {hypothesis.evidence.map((evidenceId, index) => (
                            <div key={index} className="p-3 rounded-md border border-border-subtle">
                                <p className="font-mono text-xs text-text-tertiary">Signal {index + 1}</p>
                                <p className="text-sm text-text-primary mt-1">{evidenceId}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-tertiary">No evidence data available</p>
                )}
            </Card>

            {/* Corroboration Sources */}
            {hypothesis.corroborationSources && hypothesis.corroborationSources.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Corroboration Sources</h3>
                    <div className="space-y-2">
                        {hypothesis.corroborationSources.map((source, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-md bg-white/5">
                                <div className="w-2 h-2 rounded-full bg-success-400" />
                                <p className="text-sm text-text-primary">{source}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Contributing Signals */}
            {hypothesis.signals && hypothesis.signals.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Contributing Signals</h3>
                    <div className="space-y-3">
                        {hypothesis.signals.map((signal, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-md border border-border-subtle">
                                <div>
                                    <p className="font-mono text-xs text-text-tertiary">{signal.signalId}</p>
                                    <p className="text-xs text-text-secondary mt-1">{formatTimestamp(signal.timestamp)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-text-tertiary">Contribution</p>
                                    <p className="font-bold text-primary-400">{signal.contribution.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
