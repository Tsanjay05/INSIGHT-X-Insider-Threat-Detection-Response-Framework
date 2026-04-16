import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { intentApi } from '../api/intent';
import type { IntentHypothesis } from '../api/intent.types';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { formatTimeAgo } from '../lib/utils';

export default function Intent() {
    const { data: hypotheses, isLoading, error } = useQuery({
        queryKey: ['intent'],
        queryFn: () => intentApi.getAllHypotheses(),
    });

    if (isLoading) return <LoadingState message="Loading intent hypotheses..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load hypotheses'} />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Intent Analysis</h1>
                <p className="text-text-secondary mt-1">Behavioral intent hypotheses and confidence levels</p>
            </div>

            {/* Hypotheses Table */}
            <Card>
                {!hypotheses || hypotheses.length === 0 ? (
                    <EmptyState
                        icon={Brain}
                        title="No Intent Hypotheses"
                        description="Intent hypotheses will be generated as behavioral patterns are detected and corroborated."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Entity</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Intent Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Confidence</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Evidence</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Last Updated</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hypotheses.map((hypothesis: IntentHypothesis) => (
                                    <tr key={hypothesis.hypothesisId} className="border-b border-border-subtle hover:bg-white/5">
                                        <td className="py-3 px-4 text-sm font-medium text-text-primary">
                                            {hypothesis.entityId}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-primary">
                                            {hypothesis.intentType}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden max-w-[100px]">
                                                    <div
                                                        className="h-full bg-primary-400"
                                                        style={{ width: `${hypothesis.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-text-primary">
                                                    {Math.round(hypothesis.confidence * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">
                                            {hypothesis.evidence.length} signals
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">
                                            {formatTimeAgo(hypothesis.lastUpdated)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                to={`/intent/${hypothesis.entityId}`}
                                                className="text-sm text-primary-400 hover:text-primary-300"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
