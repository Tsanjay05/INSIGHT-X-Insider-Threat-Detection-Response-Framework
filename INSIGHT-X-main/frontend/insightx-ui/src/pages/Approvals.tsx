import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { controlsApi } from '../api/controls';
import type { ApprovalRequest } from '../api/controls.types';
import { UserRole } from '../api/auth.types';
import { RoleGuard } from '../components/auth/RoleGuard';

// ... (lines 6-83 unchanged, so I will target just the import and the usage)
// Actually, I need to add the import at the top.
// I'll do two chunks. One for import, one for usage.

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { formatTimestamp, formatTimeAgo } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export default function Approvals() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: requests, isLoading, error } = useQuery({
        queryKey: ['approvals'],
        queryFn: () => controlsApi.getApprovals(),
    });

    const approveMutation = useMutation({
        mutationFn: (requestId: string) => controlsApi.approveRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            toast({
                title: 'Request Approved',
                description: 'The approval request has been successfully approved.',
                variant: 'success',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Approval Failed',
                description: error.message || 'Failed to approve request. Please try again.',
                variant: 'danger',
            });
        },
    });

    const denyMutation = useMutation({
        mutationFn: (requestId: string) => controlsApi.denyRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            toast({
                title: 'Request Denied',
                description: 'The approval request has been denied.',
                variant: 'warning',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Denial Failed',
                description: error.message || 'Failed to deny request. Please try again.',
                variant: 'danger',
            });
        },
    });

    const handleApprove = (requestId: string) => {
        approveMutation.mutate(requestId);
    };

    const handleDeny = (requestId: string) => {
        denyMutation.mutate(requestId);
    };

    if (isLoading) return <LoadingState message="Loading approval requests..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load approvals'} />;

    // Separate by status
    const pendingRequests = requests?.filter((r: ApprovalRequest) => r.status === 'PENDING') || [];
    const processedRequests = requests?.filter((r: ApprovalRequest) => r.status !== 'PENDING') || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Approval Queue</h1>
                <p className="text-text-secondary mt-1">Human-in-the-loop review for high-risk decisions</p>
            </div>

            {/* Pending Approvals */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-text-primary">Pending Requests</h2>
                    <Badge variant="warning">{pendingRequests.length} pending</Badge>
                </div>

                {pendingRequests.length === 0 ? (
                    <EmptyState
                        icon={CheckCircle}
                        title="No Pending Approvals"
                        description="All approval requests have been processed."
                    />
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map((request: ApprovalRequest) => (
                            <div key={request.requestId} className="border border-warning-400/20 rounded-lg p-4 bg-warning-400/5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className="w-4 h-4 text-warning-400" />
                                            <span className="font-mono text-sm text-text-primary">{request.requestId.slice(0, 12)}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary">Entity: <span className="text-text-primary font-medium">{request.entityId}</span></p>
                                    </div>
                                    <Badge variant="warning">PENDING</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-text-tertiary">Decision ID</p>
                                        <p className="font-mono text-xs text-text-secondary">{request.decisionId.slice(0, 16)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-tertiary">Requested</p>
                                        <p className="text-xs text-text-secondary">{formatTimeAgo(request.requestedAt)}</p>
                                    </div>
                                </div>

                                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SECURITY_ANALYST]}>
                                    <div className="flex gap-3 pt-3 border-t border-border-subtle">
                                        <Button
                                            variant="primary"
                                            onClick={() => handleApprove(request.requestId)}
                                            className="flex-1"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeny(request.requestId)}
                                            className="flex-1"
                                        >
                                            Deny
                                        </Button>
                                    </div>
                                </RoleGuard>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Processed Approvals */}
            {processedRequests.length > 0 && (
                <Card>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Decisions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Request ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Entity</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Reviewed By</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Reviewed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedRequests.map((request: ApprovalRequest) => (
                                    <tr key={request.requestId} className="border-b border-border-subtle">
                                        <td className="py-3 px-4 font-mono text-xs text-text-primary">
                                            {request.requestId.slice(0, 12)}...
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-primary">{request.entityId}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant={request.status === 'APPROVED' ? 'success' : 'danger'}>
                                                {request.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">{request.reviewedBy || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">
                                            {request.reviewedAt ? formatTimestamp(request.reviewedAt) : '-'}
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
