import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { provenanceApi } from '../api/provenance';
import type { DecisionProvenance } from '../api/provenance.types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ExportButton } from '../components/utils/export';
import { formatTimestamp, getRiskLevelColor } from '../lib/utils';

export default function Provenance() {
    const { data: decisions, isLoading, error } = useQuery({
        queryKey: ['provenance'],
        queryFn: () => provenanceApi.getDecisions(),
    });

    if (isLoading) return <LoadingState message="Loading provenance data..." />;
    if (error) return <ErrorState message="Failed to load provenance data" />;
    if (!decisions || decisions.length === 0) {
        return <EmptyState icon={Archive} title="No provenance records found" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Decision Provenance</h1>
                    <p className="text-muted-foreground mt-1">
                        Audit trail of automated security decisions
                    </p>
                </div>
                <ExportButton data={decisions} filename="provenance" />
            </div>

            <div className="grid gap-4">
                {decisions.map((decision: DecisionProvenance) => (
                    <Card key={decision.provenanceId}>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4 flex-1">
                                <div className="p-3 rounded-lg bg-accent">
                                    <Archive className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link
                                            to={`/provenance/${decision.decisionId}`}
                                            className="text-lg font-semibold hover:underline"
                                        >
                                            {decision.decisionId}
                                        </Link>
                                        <Badge variant={getRiskLevelColor(decision.riskLevel) as any}>
                                            {decision.riskLevel}
                                        </Badge>
                                        {decision.isSimulation && <Badge variant="secondary">SIMULATION</Badge>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                        <div>
                                            <span className="text-muted-foreground">Trust Score:</span>{' '}
                                            <span className="font-medium">{decision.trustScore.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Decided:</span>{' '}
                                            <span className="font-medium">
                                                {formatTimestamp(decision.decisionTimestamp)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Confidence:</span>{' '}
                                            <span className="font-medium">{(decision.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Policy:</span>{' '}
                                            <span className="font-mono text-xs">{decision.policyId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
