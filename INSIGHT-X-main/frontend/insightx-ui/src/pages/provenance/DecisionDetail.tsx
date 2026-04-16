import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Archive, Shield, AlertCircle } from 'lucide-react';
import { provenanceApi } from '../../api/provenance';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatTimestamp, getRiskLevelColor } from '../../lib/utils';

export default function DecisionDetail() {
    const { decisionId } = useParams<{ decisionId: string }>();
    const navigate = useNavigate();

    const { data: decision, isLoading, error } = useQuery({
        queryKey: ['provenance', 'decision', decisionId],
        queryFn: () => provenanceApi.getDecisionById(decisionId!),
        enabled: !!decisionId,
    });

    if (isLoading) return <LoadingState message="Loading decision provenance..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load decision'} />;
    if (!decision) return <ErrorState message="Decision not found" />;

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link to="/" className="hover:text-text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/provenance" className="hover:text-text-primary">Provenance</Link>
                <span>/</span>
                <span className="text-text-primary">{decisionId?.slice(0, 12)}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-bold text-text-primary">Decision Provenance</h1>
                    </div>
                    <p className="font-mono text-sm text-text-tertiary">{decision.decisionId}</p>
                </div>
                <Badge className={getRiskLevelColor(decision.riskLevel)}>
                    {decision.riskLevel}
                </Badge>
            </div>

            {/* Decision Overview */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="flex items-start gap-3 mb-3">
                            <Shield className="w-5 h-5 text-primary-400 mt-1" />
                            <div>
                                <p className="text-xs text-text-tertiary">Final Score</p>
                                <p className="text-3xl font-bold text-text-primary">{Math.round(decision.trustScore)}</p>
                                <p className="text-xs text-text-tertiary mt-1">{Math.round(decision.confidence * 100)}% confidence</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-text-tertiary mb-2">Entity</p>
                        <p className="text-lg font-semibold text-text-primary">{decision.entityId}</p>
                        <Link to={`/trust/${decision.entityId}`} className="text-sm text-primary-400 hover:text-primary-300">
                            View Trust Profile →
                        </Link>
                    </div>
                    <div>
                        <p className="text-xs text-text-tertiary mb-2">Decided At</p>
                        <p className="text-sm font-medium text-text-primary">{formatTimestamp(decision.decisionTimestamp)}</p>
                    </div>
                </div>
            </Card>

            {/* Policy Information */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Policy Arbitration</h3>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <dt className="text-xs text-text-tertiary">Policy ID</dt>
                        <dd className="font-mono text-sm text-text-secondary">{decision.policyId}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-text-tertiary">Policy Version</dt>
                        <dd className="font-mono text-sm text-text-secondary">{decision.policyVersion}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-text-tertiary">Policy Hash</dt>
                        <dd className="font-mono text-xs text-text-tertiary break-all">{decision.policyHash}</dd>
                    </div>
                </dl>
            </Card>

            {/* Signal Contributions */}
            <Card>
                <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-warning-400 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Input Signals</h3>
                        <p className="text-sm text-text-tertiary">Signals that contributed to this decision</p>
                    </div>
                </div>

                {decision.signals && decision.signals.length > 0 ? (
                    <div className="space-y-3">
                        {decision.signals.map((signal) => (
                            <div key={signal.signalId} className="border border-border-subtle rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-mono text-xs text-text-tertiary">{signal.signalId}</p>
                                        <p className="font-semibold text-text-primary">{signal.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-text-tertiary">Contribution</p>
                                        <p className={`font-bold ${signal.contribution > 0 ? 'text-danger-400' : 'text-success-400'}`}>
                                            {signal.contribution > 0 ? '+' : ''}{signal.contribution.toFixed(1)}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-text-tertiary">Severity:</span>
                                        <span className="ml-2 text-text-secondary">{signal.severity.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-tertiary">Source:</span>
                                        <span className="ml-2 text-text-secondary">{signal.source}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-tertiary">No signal data available</p>
                )}
            </Card>

            {/* Controls Applied */}
            {decision.controlsApplied && decision.controlsApplied.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Controls Applied</h3>
                    <div className="space-y-2">
                        {decision.controlsApplied.map((controlId, index) => (
                            <Link
                                key={index}
                                to={`/controls/${controlId}`}
                                className="block p-3 rounded-md border border-border-subtle hover:border-primary-400 transition-colors"
                            >
                                <p className="font-mono text-sm text-primary-400">{controlId}</p>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            {/* Explanation */}
            {decision.explanation && (
                <Card>
                    <div className="flex items-start gap-3 mb-4">
                        <Archive className="w-5 h-5 text-info-400 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">Decision Explanation</h3>
                            <p className="text-sm text-text-tertiary">Deterministic computation breakdown</p>
                        </div>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{decision.explanation}</p>
                </Card>
            )}
        </div>
    );
}
