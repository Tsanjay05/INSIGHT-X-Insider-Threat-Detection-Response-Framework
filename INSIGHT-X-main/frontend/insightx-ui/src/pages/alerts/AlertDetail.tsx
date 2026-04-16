/**
 * Alert Detail Page
 * Shows full alert information with timeline, related entities, and comments
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Clock, MapPin, Globe, Monitor, Tag, Link2, Shield, Info, MessageSquare, Activity } from 'lucide-react';
import { useAlert, useUpdateAlertStatus, useAddAlertComment } from '@/hooks/useAlertDetail';
import { DetailHeader } from '@/components/detail/DetailHeader';
import { DetailInfoGrid } from '@/components/detail/DetailInfoGrid';
import { ActivityTimeline } from '@/components/detail/ActivityTimeline';
import { CommentSection } from '@/components/detail/CommentSection';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatTimestamp } from '@/lib/utils';
import type { AlertStatus } from '@/api/alerts.types';

const severityVariant: Record<string, 'danger' | 'warning' | 'default' | 'outline'> = {
    CRITICAL: 'danger',
    HIGH: 'warning',
    MEDIUM: 'default',
    LOW: 'outline',
    INFO: 'outline',
};

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline'> = {
    NEW: 'warning',
    ACKNOWLEDGED: 'default',
    INVESTIGATING: 'default',
    ESCALATED: 'danger',
    RESOLVED: 'success',
    DISMISSED: 'outline',
};

export default function AlertDetail() {
    const { alertId } = useParams<{ alertId: string }>();
    const { data: alert, isLoading, error } = useAlert(alertId || '');
    const updateStatus = useUpdateAlertStatus();
    const addComment = useAddAlertComment();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
        </div>
    );
    if (error || !alert) return <ErrorState message="Failed to load alert details" />;

    const handleStatusChange = async (status: AlertStatus) => {
        try {
            await updateStatus.mutateAsync({ id: alert.id, status });
            toast({
                title: 'Status Updated',
                description: `Alert status changed to ${status}`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: (error as Error).message || 'Failed to update status',
                variant: 'danger',
            });
        }
    };

    const handleAddComment = async (content: string) => {
        try {
            await addComment.mutateAsync({ id: alert.id, content });
            toast({
                title: 'Comment Added',
                description: 'Your investigation note has been saved.',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Failed to Add Comment',
                description: (error as Error).message || 'Failed to save comment',
                variant: 'danger',
            });
        }
    };

    // Simple risk score bar chart
    const riskWidth = `${Math.min(alert.riskScore, 100)}%`;
    const riskColor = alert.riskScore >= 80 ? 'bg-danger-400' : alert.riskScore >= 60 ? 'bg-warning-400' : alert.riskScore >= 40 ? 'bg-info-400' : 'bg-success-400';

    return (
        <div className="space-y-6">
            <DetailHeader
                title={alert.title}
                subtitle={alert.description}
                backTo="/alerts"
                icon={<AlertTriangle className="h-6 w-6" />}
                badges={[
                    { label: alert.severity, variant: severityVariant[alert.severity] || 'default' },
                    { label: alert.status, variant: statusVariant[alert.status] || 'default' },
                ]}
                actions={
                    <>
                        {alert.status === 'NEW' && (
                            <Button variant="primary" onClick={() => handleStatusChange('ACKNOWLEDGED')} loading={updateStatus.isPending}>
                                Acknowledge
                            </Button>
                        )}
                        {(alert.status === 'NEW' || alert.status === 'ACKNOWLEDGED') && (
                            <Button variant="secondary" onClick={() => handleStatusChange('INVESTIGATING')}>
                                Investigate
                            </Button>
                        )}
                        {alert.status !== 'ESCALATED' && alert.status !== 'RESOLVED' && (
                            <Button variant="danger" onClick={() => handleStatusChange('ESCALATED')}>
                                Escalate
                            </Button>
                        )}
                        {alert.status !== 'RESOLVED' && alert.status !== 'DISMISSED' && (
                            <Button variant="ghost" onClick={() => handleStatusChange('RESOLVED')}>
                                Resolve
                            </Button>
                        )}
                    </>
                }
            />

            {/* Risk Score Bar */}
            <Card>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">Risk Score</span>
                    <span className="text-2xl font-bold text-text-primary">{alert.riskScore}</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${riskColor}`}
                        style={{ width: riskWidth }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-text-tertiary">
                    <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                </div>
            </Card>

            <Tabs
                tabs={[
                    { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
                    { id: 'timeline', label: 'Timeline', icon: <Activity className="h-4 w-4" />, count: alert.timeline.length },
                    { id: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" />, count: alert.comments.length },
                ]}
                defaultTab={activeTab}
                onChange={setActiveTab}
            >
                {(tab: string) => (
                    <>
                        <TabPanel tabId="overview" activeTab={tab}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Info Grid */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4">Alert Details</h3>
                                        <DetailInfoGrid
                                            columns={2}
                                            items={[
                                                { label: 'Source', value: <span className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5 text-text-tertiary" />{alert.source}</span> },
                                                { label: 'Entity', value: <span className="font-mono text-xs">{alert.entityId}</span> },
                                                { label: 'Entity Type', value: alert.entityType },
                                                { label: 'Assigned To', value: alert.assignedTo || 'Unassigned' },
                                                { label: 'Created', value: <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-text-tertiary" />{formatTimestamp(alert.createdAt)}</span> },
                                                { label: 'Last Updated', value: formatTimestamp(alert.updatedAt) },
                                                ...(alert.ipAddress ? [{ label: 'IP Address', value: <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-text-tertiary" />{alert.ipAddress}</span> }] : []),
                                                ...(alert.location ? [{ label: 'Location', value: <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-text-tertiary" />{alert.location}</span> }] : []),
                                            ]}
                                        />
                                    </Card>

                                    {/* Raw Event Data (table) */}
                                    <Card>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4">Raw Event Data</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border-subtle">
                                                        <th className="text-left py-2 px-3 text-xs font-medium text-text-tertiary uppercase">Field</th>
                                                        <th className="text-left py-2 px-3 text-xs font-medium text-text-tertiary uppercase">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(alert.rawEvent).map(([key, val]) => (
                                                        <tr key={key} className="border-b border-border-subtle/50">
                                                            <td className="py-2 px-3 text-sm font-mono text-text-secondary">{key}</td>
                                                            <td className="py-2 px-3 text-sm text-text-primary font-mono">{String(val)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right: Related Items */}
                                <div className="space-y-6">
                                    {/* Tags */}
                                    {alert.tags.length > 0 && (
                                        <Card>
                                            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-text-tertiary" /> Tags
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {alert.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-1 text-xs bg-white/5 text-text-secondary rounded-md border border-border-subtle">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </Card>
                                    )}

                                    {/* Related Controls */}
                                    <Card>
                                        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-text-tertiary" /> Related Controls
                                        </h3>
                                        {alert.relatedControls.length > 0 ? (
                                            <div className="space-y-2">
                                                {alert.relatedControls.map((ctrl) => (
                                                    <div key={ctrl} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 cursor-pointer">
                                                        <Link2 className="h-3.5 w-3.5" />
                                                        <span className="font-mono text-xs">{ctrl}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-tertiary">No related controls</p>
                                        )}
                                    </Card>

                                    {/* Affected Resources */}
                                    <Card>
                                        <h3 className="text-sm font-semibold text-text-primary mb-3">Affected Resources</h3>
                                        <div className="space-y-2">
                                            {alert.affectedResources.map((res) => (
                                                <div key={res} className="px-3 py-2 bg-bg-elevated rounded-md text-sm text-text-secondary font-mono">
                                                    {res}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel tabId="timeline" activeTab={tab}>
                            <Card>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Activity Timeline</h3>
                                <ActivityTimeline items={alert.timeline} />
                            </Card>
                        </TabPanel>

                        <TabPanel tabId="comments" activeTab={tab}>
                            <Card>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Investigation Notes</h3>
                                <CommentSection
                                    comments={alert.comments}
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
