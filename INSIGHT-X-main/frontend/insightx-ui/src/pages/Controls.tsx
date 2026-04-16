import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { controlsApi } from '../api/controls';
import type { AdaptiveControl } from '../api/controls.types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ExportButton } from '../components/utils/export';
import { formatTimeAgo, getControlStatusColor } from '../lib/utils';

export default function Controls() {
    const { data: controls, isLoading, error } = useQuery({
        queryKey: ['controls'],
        queryFn: () => controlsApi.getControls(),
    });

    if (isLoading) return <LoadingState message="Loading controls..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load controls'} />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Adaptive Controls</h1>
                    <p className="text-text-secondary mt-1">Real-time access controls and risk mitigations</p>
                </div>
                <div className="flex gap-3">
                    {controls && controls.length > 0 && (
                        <ExportButton data={controls} filename="adaptive-controls" format="csv" />
                    )}
                    <Link to="/approvals" className="px-4 py-2 rounded-md bg-primary-400 text-white hover:bg-primary-500 font-medium">
                        View Approvals
                    </Link>
                </div>
            </div>

            {/* Controls Table */}
            <Card>
                {!controls || controls.length === 0 ? (
                    <EmptyState
                        icon={Shield}
                        title="No Active Controls"
                        description="No adaptive controls are currently enforced. Controls will appear here when trust-based policiesare triggered."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Control ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Entity</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Applied</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Expires</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {controls.map((control: AdaptiveControl) => (
                                    <tr key={control.controlId} className="border-b border-border-subtle hover:bg-white/5">
                                        <td className="py-3 px-4">
                                            <Link to={`/controls/${control.controlId}`} className="font-mono text-sm text-primary-400 hover:text-primary-300">
                                                {control.controlId.slice(0, 8)}...
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-primary">{control.entityId}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="info">{control.controlType.replace(/_/g, ' ')}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge className={getControlStatusColor(control.status)}>
                                                {control.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">
                                            {formatTimeAgo(control.appliedAt)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">
                                            {control.expiresAt ? formatTimeAgo(control.expiresAt) : 'Never'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                to={`/controls/${control.controlId}`}
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
