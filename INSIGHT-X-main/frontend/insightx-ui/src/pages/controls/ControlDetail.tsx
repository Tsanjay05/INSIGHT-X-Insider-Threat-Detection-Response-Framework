import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Shield, Clock, AlertTriangle } from 'lucide-react';
import { controlsApi } from '../../api/controls';
import { UserRole } from '../../api/auth.types';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatTimestamp, formatTimeAgo, getControlStatusColor } from '../../lib/utils';

export default function ControlDetail() {
    const { controlId } = useParams<{ controlId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: control, isLoading, error } = useQuery({
        queryKey: ['control', controlId],
        queryFn: () => controlsApi.getControlById(controlId!),
        enabled: !!controlId,
    });

    const revokeMutation = useMutation({
        mutationFn: (reason: string) => controlsApi.revokeControl(controlId!, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['control', controlId] });
            queryClient.invalidateQueries({ queryKey: ['controls'] });
        },
    });

    const handleRevoke = () => {
        const reason = prompt('Enter revocation reason:');
        if (reason) {
            revokeMutation.mutate(reason);
        }
    };

    if (isLoading) return <LoadingState message="Loading control details..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load control'} />;
    if (!control) return <ErrorState message="Control not found" />;

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link to="/" className="hover:text-text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/controls" className="hover:text-text-primary">Controls</Link>
                <span>/</span>
                <span className="text-text-primary">{controlId?.slice(0, 8)}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-bold text-text-primary">Control Detail</h1>
                    </div>
                    <p className="font-mono text-sm text-text-tertiary">{control.controlId}</p>
                </div>
                <Badge className={getControlStatusColor(control.status)}>{control.status}</Badge>
            </div>

            {/* Control Overview Card */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-start gap-3 mb-4">
                            <Shield className="w-5 h-5 text-primary-400 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Control Information</h3>
                                <p className="text-sm text-text-tertiary">Type and target details</p>
                            </div>
                        </div>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-xs text-text-tertiary">Control Type</dt>
                                <dd className="font-semibold text-text-primary">{control.controlType.replace(/_/g, ' ')}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-tertiary">Target Entity</dt>
                                <dd className="font-semibold text-text-primary">{control.entityId}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-tertiary">Reason</dt>
                                <dd className="text-sm text-text-secondary">{control.reason}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <div className="flex items-start gap-3 mb-4">
                            <Clock className="w-5 h-5 text-warning-400 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Timeline</h3>
                                <p className="text-sm text-text-tertiary">Control lifecycle</p>
                            </div>
                        </div>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-xs text-text-tertiary">Applied At</dt>
                                <dd className="text-sm text-text-secondary">{formatTimestamp(control.appliedAt)}</dd>
                                <dd className="text-xs text-text-tertiary">{formatTimeAgo(control.appliedAt)}</dd>
                            </div>
                            {control.expiresAt && (
                                <div>
                                    <dt className="text-xs text-text-tertiary">Expires At</dt>
                                    <dd className="text-sm text-text-secondary">{formatTimestamp(control.expiresAt)}</dd>
                                    <dd className="text-xs text-text-tertiary">{formatTimeAgo(control.expiresAt)}</dd>
                                </div>
                            )}
                            {control.revokedAt && (
                                <div>
                                    <dt className="text-xs text-text-tertiary">Revoked At</dt>
                                    <dd className="text-sm text-text-secondary">{formatTimestamp(control.revokedAt)}</dd>
                                    <dd className="text-xs text-danger-400">{control.revokedReason}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </Card>

            {/* Policy Context */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Policy Context</h3>
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-xs text-text-tertiary">Decision ID</dt>
                        <dd className="font-mono text-sm text-primary-400">{control.decisionId}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-text-tertiary">Policy ID</dt>
                        <dd className="font-mono text-sm text-text-secondary">{control.policyId}</dd>
                    </div>
                </dl>
            </Card>

            {/* Actions */}
            {control.status === 'ACTIVE' && (
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SECURITY_ANALYST]}>
                    <Card>
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-danger-400 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Control Actions</h3>
                                <p className="text-sm text-text-tertiary">Manually revoke this control</p>
                            </div>
                        </div>
                        <Button
                            variant="danger"
                            onClick={handleRevoke}
                            disabled={revokeMutation.isPending}
                        >
                            {revokeMutation.isPending ? 'Revoking...' : 'Revoke Control'}
                        </Button>
                    </Card>
                </RoleGuard>
            )}
        </div>
    );
}
