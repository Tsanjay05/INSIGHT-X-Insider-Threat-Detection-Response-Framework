/**
 * Case Detail Page
 * Full case investigation view with evidence, timeline, and comments
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FolderOpen, Clock, AlertCircle, FileText, MessageSquare, Activity, User, Shield, ExternalLink, Info } from 'lucide-react';
import { useCase, useUpdateCaseStatus, useAddCaseComment } from '@/hooks/useCases';
import { DetailHeader } from '@/components/detail/DetailHeader';
import { DetailInfoGrid } from '@/components/detail/DetailInfoGrid';
import { ActivityTimeline } from '@/components/detail/ActivityTimeline';
import { CommentSection } from '@/components/detail/CommentSection';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatTimestamp, formatTimeAgo } from '@/lib/utils';
import type { CaseStatus } from '@/api/cases.types';

const priorityVariant: Record<string, 'danger' | 'warning' | 'default' | 'outline'> = {
    CRITICAL: 'danger',
    HIGH: 'warning',
    MEDIUM: 'default',
    LOW: 'outline',
};

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline'> = {
    OPEN: 'warning',
    INVESTIGATING: 'default',
    PENDING_ACTION: 'warning',
    ESCALATED: 'danger',
    RESOLVED: 'success',
    CLOSED: 'outline',
};

const evidenceIcon: Record<string, React.ReactNode> = {
    ALERT: <AlertCircle className="h-4 w-4 text-warning-400" />,
    LOG: <FileText className="h-4 w-4 text-info-400" />,
    SCREENSHOT: <FileText className="h-4 w-4 text-primary-400" />,
    FILE: <FileText className="h-4 w-4 text-text-secondary" />,
    NOTE: <MessageSquare className="h-4 w-4 text-success-400" />,
};

export default function CaseDetail() {
    const { caseId } = useParams<{ caseId: string }>();
    const { data: caseData, isLoading, error } = useCase(caseId || '');
    const updateStatus = useUpdateCaseStatus();
    const addComment = useAddCaseComment();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
        </div>
    );
    if (error || !caseData) return <ErrorState message="Failed to load case details" />;

    const handleStatusChange = async (status: CaseStatus) => {
        try {
            await updateStatus.mutateAsync({ id: caseData.id, status });
            toast({
                title: 'Status Updated',
                description: `Case status changed to ${status}`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: (error as Error).message || 'Failed to update case status',
                variant: 'danger',
            });
        }
    };

    const handleAddComment = async (content: string) => {
        try {
            await addComment.mutateAsync({ id: caseData.id, content, isInternal: true });
            toast({
                title: 'Note Added',
                description: 'Investigation note has been saved.',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Failed to Add Note',
                description: (error as Error).message || 'Failed to save note',
                variant: 'danger',
            });
        }
    };

    // SLA countdown
    const slaRemaining = caseData.slaDeadline
        ? new Date(caseData.slaDeadline).getTime() - Date.now()
        : null;
    const slaBreached = slaRemaining !== null && slaRemaining < 0;
    const slaUrgent = slaRemaining !== null && slaRemaining > 0 && slaRemaining < 86400000;

    // Risk score visualization
    const riskWidth = `${Math.min(caseData.riskScore, 100)}%`;
    const riskColor = caseData.riskScore >= 80 ? 'bg-danger-400' : caseData.riskScore >= 60 ? 'bg-warning-400' : caseData.riskScore >= 40 ? 'bg-info-400' : 'bg-success-400';

    return (
        <div className="space-y-6">
            <DetailHeader
                title={caseData.title}
                subtitle={`Subject: ${caseData.subject}`}
                backTo="/cases"
                icon={<FolderOpen className="h-6 w-6" />}
                badges={[
                    { label: caseData.priority, variant: priorityVariant[caseData.priority] || 'default' },
                    { label: caseData.status, variant: statusVariant[caseData.status] || 'default' },
                ]}
                actions={
                    <>
                        {caseData.status === 'OPEN' && (
                            <Button variant="primary" onClick={() => handleStatusChange('INVESTIGATING')} loading={updateStatus.isPending}>
                                Start Investigation
                            </Button>
                        )}
                        {caseData.status === 'INVESTIGATING' && (
                            <Button variant="primary" onClick={() => handleStatusChange('PENDING_ACTION')}>
                                Pending Action
                            </Button>
                        )}
                        {caseData.status !== 'RESOLVED' && caseData.status !== 'CLOSED' && (
                            <Button variant="danger" onClick={() => handleStatusChange('ESCALATED')}>
                                Escalate
                            </Button>
                        )}
                        {(caseData.status === 'INVESTIGATING' || caseData.status === 'PENDING_ACTION') && (
                            <Button variant="ghost" onClick={() => handleStatusChange('RESOLVED')}>
                                Resolve
                            </Button>
                        )}
                    </>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-text-primary">{caseData.riskScore}</div>
                    <div className="mt-2 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${riskColor}`} style={{ width: riskWidth }} />
                    </div>
                </Card>
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Linked Alerts</div>
                    <div className="text-2xl font-bold text-text-primary">{caseData.alertCount}</div>
                </Card>
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Evidence Items</div>
                    <div className="text-2xl font-bold text-text-primary">{caseData.evidence.length}</div>
                </Card>
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">SLA Status</div>
                    <div className={`text-lg font-bold ${slaBreached ? 'text-danger-400' : slaUrgent ? 'text-warning-400' : 'text-success-400'}`}>
                        {slaBreached ? 'BREACHED' : slaRemaining ? formatTimeAgo(new Date(Date.now() + slaRemaining).toISOString()).replace(' ago', ' left').replace('-', '') : 'N/A'}
                    </div>
                    {caseData.slaDeadline && (
                        <div className="text-xs text-text-tertiary mt-0.5">Deadline: {formatTimestamp(caseData.slaDeadline)}</div>
                    )}
                </Card>
            </div>

            <Tabs
                tabs={[
                    { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
                    { id: 'evidence', label: 'Evidence', icon: <FileText className="h-4 w-4" />, count: caseData.evidence.length },
                    { id: 'timeline', label: 'Timeline', icon: <Activity className="h-4 w-4" />, count: caseData.timeline.length },
                    { id: 'comments', label: 'Notes', icon: <MessageSquare className="h-4 w-4" />, count: caseData.comments.length },
                ]}
                defaultTab={activeTab}
                onChange={setActiveTab}
            >
                {(tab: string) => (
                    <>
                        <TabPanel tabId="overview" activeTab={tab}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Case Info */}
                                    <Card>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4">Case Information</h3>
                                        <DetailInfoGrid
                                            columns={2}
                                            items={[
                                                { label: 'Case ID', value: <span className="font-mono text-xs">{caseData.id}</span> },
                                                { label: 'Subject', value: <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-text-tertiary" />{caseData.subject}</span> },
                                                { label: 'Assigned To', value: caseData.assignedTo || 'Unassigned' },
                                                { label: 'Priority', value: <Badge variant={priorityVariant[caseData.priority]}>{caseData.priority}</Badge> },
                                                { label: 'Created', value: <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-text-tertiary" />{formatTimestamp(caseData.createdAt)}</span> },
                                                { label: 'Last Updated', value: formatTimestamp(caseData.updatedAt) },
                                            ]}
                                        />
                                    </Card>

                                    {/* Summary & Findings */}
                                    <Card>
                                        <h3 className="text-lg font-semibold text-text-primary mb-3">Investigation Summary</h3>
                                        <p className="text-sm text-text-secondary leading-relaxed">{caseData.summary}</p>
                                        {caseData.findings && (
                                            <>
                                                <h4 className="text-sm font-semibold text-text-primary mt-4 mb-2">Findings</h4>
                                                <p className="text-sm text-text-secondary leading-relaxed">{caseData.findings}</p>
                                            </>
                                        )}
                                        {caseData.recommendation && (
                                            <div className="mt-4 p-3 rounded-lg bg-warning-400/5 border border-warning-400/20">
                                                <h4 className="text-sm font-semibold text-warning-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-text-secondary">{caseData.recommendation}</p>
                                            </div>
                                        )}
                                    </Card>
                                </div>

                                {/* Right sidebar */}
                                <div className="space-y-6">
                                    {/* Tags */}
                                    <Card>
                                        <h3 className="text-sm font-semibold text-text-primary mb-3">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {caseData.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-1 text-xs bg-white/5 text-text-secondary rounded-md border border-border-subtle">{tag}</span>
                                            ))}
                                        </div>
                                    </Card>

                                    {/* Related controls */}
                                    <Card>
                                        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-text-tertiary" /> Controls Applied
                                        </h3>
                                        <div className="space-y-2">
                                            {caseData.relatedControls.map((ctrl) => (
                                                <div key={ctrl} className="flex items-center gap-2 text-sm text-primary-400">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    <span className="font-mono text-xs">{ctrl}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel tabId="evidence" activeTab={tab}>
                            <Card>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-text-primary">Evidence ({caseData.evidence.length})</h3>
                                    <Button variant="secondary" size="sm">Add Evidence</Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border-subtle">
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Type</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Title</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Source</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Added By</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {caseData.evidence.map((ev) => (
                                                <tr key={ev.id} className="border-b border-border-subtle/50 hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            {evidenceIcon[ev.type] || <FileText className="h-4 w-4 text-text-tertiary" />}
                                                            <Badge variant="outline">{ev.type}</Badge>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="text-sm text-text-primary font-medium">{ev.title}</div>
                                                        <div className="text-xs text-text-tertiary mt-0.5">{ev.description}</div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-sm text-text-secondary">{ev.source}</td>
                                                    <td className="py-2.5 px-3 text-sm text-text-secondary">{ev.addedBy}</td>
                                                    <td className="py-2.5 px-3 text-sm text-text-tertiary">{formatTimeAgo(ev.addedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabPanel>

                        <TabPanel tabId="timeline" activeTab={tab}>
                            <Card>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Investigation Timeline</h3>
                                <ActivityTimeline items={caseData.timeline} />
                            </Card>
                        </TabPanel>

                        <TabPanel tabId="comments" activeTab={tab}>
                            <Card>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Investigation Notes</h3>
                                <CommentSection
                                    comments={caseData.comments}
                                    onAddComment={handleAddComment}
                                    isSubmitting={addComment.isPending}
                                    placeholder="Add investigation note..."
                                />
                            </Card>
                        </TabPanel>
                    </>
                )}
            </Tabs>
        </div>
    );
}
