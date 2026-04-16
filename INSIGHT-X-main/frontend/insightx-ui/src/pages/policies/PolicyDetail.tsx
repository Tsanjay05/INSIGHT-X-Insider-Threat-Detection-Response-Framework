/**
 * Policy Detail Page
 * Policy rules, conditions, enforcement history, and configuration
 */

import { useParams } from 'react-router-dom';
import { FileText, Shield, Activity, Zap, Settings, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { usePolicy, useTogglePolicy } from '@/hooks/usePolicies';
import { DetailHeader } from '@/components/detail/DetailHeader';
import { DetailInfoGrid } from '@/components/detail/DetailInfoGrid';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatTimestamp, formatTimeAgo } from '@/lib/utils';
import { useState } from 'react';

const typeColor: Record<string, string> = {
    PREVENTION: 'text-danger-400 bg-danger-400/10',
    DETECTION: 'text-warning-400 bg-warning-400/10',
    RESPONSE: 'text-info-400 bg-info-400/10',
    COMPLIANCE: 'text-success-400 bg-success-400/10',
};

const resultIcon: Record<string, React.ReactNode> = {
    ENFORCED: <CheckCircle className="h-4 w-4 text-success-400" />,
    BYPASSED: <AlertCircle className="h-4 w-4 text-warning-400" />,
    FAILED: <XCircle className="h-4 w-4 text-danger-400" />,
};

export default function PolicyDetail() {
    const { policyId } = useParams<{ policyId: string }>();
    const { data: policy, isLoading, error } = usePolicy(policyId || '');
    const togglePolicy = useTogglePolicy();
    const [activeTab, setActiveTab] = useState('overview');

    if (isLoading) return <LoadingState message="Loading policy details..." />;
    if (error || !policy) return <ErrorState message="Failed to load policy details" />;

    const handleToggle = () => {
        togglePolicy.mutate({ id: policy.id, enabled: !policy.enabled });
    };

    // Enforcement stats chart
    const enforced = policy.enforcementHistory.filter((e) => e.result === 'ENFORCED').length;
    const bypassed = policy.enforcementHistory.filter((e) => e.result === 'BYPASSED').length;
    const failed = policy.enforcementHistory.filter((e) => e.result === 'FAILED').length;
    const totalEnf = policy.enforcementHistory.length;

    return (
        <div className="space-y-6">
            <DetailHeader
                title={policy.name}
                subtitle={policy.description}
                backTo="/policies"
                icon={<FileText className="h-6 w-6" />}
                badges={[
                    { label: policy.type, variant: 'outline' },
                    { label: policy.enabled ? 'ENABLED' : 'DISABLED', variant: policy.enabled ? 'success' : 'outline' },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-text-secondary">{policy.enabled ? 'Enabled' : 'Disabled'}</span>
                        <Toggle checked={policy.enabled} onCheckedChange={handleToggle} />
                    </div>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Total Triggers</div>
                    <div className="text-2xl font-bold text-text-primary">{policy.triggerCount.toLocaleString()}</div>
                </Card>
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Last Triggered</div>
                    <div className="text-lg font-bold text-text-primary">
                        {policy.lastTriggered ? formatTimeAgo(policy.lastTriggered) : 'Never'}
                    </div>
                </Card>
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Active Rules</div>
                    <div className="text-2xl font-bold text-text-primary">{policy.rules.filter((r) => r.enabled).length}</div>
                </Card>
                <Card>
                    <div className="text-xs text-text-tertiary mb-1">Priority</div>
                    <div className="text-2xl font-bold text-text-primary">P{policy.priority}</div>
                </Card>
            </div>

            {/* Enforcement Results Chart (simple horizontal bar) */}
            {totalEnf > 0 && (
                <Card>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Enforcement Results</h3>
                    <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
                        {enforced > 0 && (
                            <div
                                className="bg-success-400 transition-all"
                                style={{ width: `${(enforced / totalEnf) * 100}%` }}
                                title={`Enforced: ${enforced}`}
                            />
                        )}
                        {bypassed > 0 && (
                            <div
                                className="bg-warning-400 transition-all"
                                style={{ width: `${(bypassed / totalEnf) * 100}%` }}
                                title={`Bypassed: ${bypassed}`}
                            />
                        )}
                        {failed > 0 && (
                            <div
                                className="bg-danger-400 transition-all"
                                style={{ width: `${(failed / totalEnf) * 100}%` }}
                                title={`Failed: ${failed}`}
                            />
                        )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success-400" />Enforced ({enforced})</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-warning-400" />Bypassed ({bypassed})</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-danger-400" />Failed ({failed})</span>
                    </div>
                </Card>
            )}

            <Tabs
                tabs={[
                    { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
                    { id: 'rules', label: 'Rules', icon: <Settings className="h-4 w-4" />, count: policy.rules.length },
                    { id: 'enforcement', label: 'Enforcement History', icon: <Activity className="h-4 w-4" />, count: policy.enforcementHistory.length },
                ]}
                defaultTab={activeTab}
                onChange={setActiveTab}
            >
                {(tab: string) => (
                    <>
                        <TabPanel tabId="overview" activeTab={tab}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Card>
                                        <h3 className="text-lg font-semibold text-text-primary mb-4">Policy Details</h3>
                                        <DetailInfoGrid
                                            columns={2}
                                            items={[
                                                { label: 'Type', value: <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor[policy.type]}`}>{policy.type}</span> },
                                                { label: 'Status', value: policy.status },
                                                { label: 'Created By', value: policy.createdBy },
                                                { label: 'Created', value: formatTimestamp(policy.createdAt) },
                                                { label: 'Last Updated', value: formatTimestamp(policy.updatedAt) },
                                                { label: 'Priority', value: `P${policy.priority}` },
                                            ]}
                                        />
                                        {policy.notes && (
                                            <div className="mt-4 pt-4 border-t border-border-subtle">
                                                <h4 className="text-sm font-medium text-text-secondary mb-1">Notes</h4>
                                                <p className="text-sm text-text-tertiary">{policy.notes}</p>
                                            </div>
                                        )}
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <Card>
                                        <h3 className="text-sm font-semibold text-text-primary mb-3">Affected Entities</h3>
                                        <div className="space-y-2">
                                            {policy.affectedEntities.map((entity) => (
                                                <div key={entity} className="px-3 py-2 bg-bg-elevated rounded-md text-sm text-text-secondary font-mono">
                                                    {entity}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                    <Card>
                                        <h3 className="text-sm font-semibold text-text-primary mb-3">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-1 text-xs bg-white/5 text-text-secondary rounded-md border border-border-subtle">{tag}</span>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel tabId="rules" activeTab={tab}>
                            <div className="space-y-4">
                                {policy.rules.map((rule) => (
                                    <Card key={rule.id}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-primary-400" />
                                                    <h4 className="text-base font-semibold text-text-primary">{rule.name}</h4>
                                                    <Badge variant={rule.enabled ? 'success' : 'outline'}>{rule.enabled ? 'Active' : 'Inactive'}</Badge>
                                                </div>
                                                <p className="text-sm text-text-secondary mt-1">{rule.description}</p>
                                            </div>
                                        </div>

                                        {/* Conditions table */}
                                        <div className="mt-4">
                                            <h5 className="text-xs font-semibold text-text-tertiary uppercase mb-2">Conditions (IF)</h5>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-border-subtle">
                                                            <th className="text-left py-1.5 px-2 text-xs text-text-tertiary">Field</th>
                                                            <th className="text-left py-1.5 px-2 text-xs text-text-tertiary">Operator</th>
                                                            <th className="text-left py-1.5 px-2 text-xs text-text-tertiary">Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rule.conditions.map((cond, i) => (
                                                            <tr key={i} className="border-b border-border-subtle/50">
                                                                <td className="py-1.5 px-2 text-sm font-mono text-primary-400">{cond.field}</td>
                                                                <td className="py-1.5 px-2 text-sm text-text-secondary">{cond.operator.replace('_', ' ')}</td>
                                                                <td className="py-1.5 px-2 text-sm font-mono text-text-primary">{String(cond.value)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4">
                                            <h5 className="text-xs font-semibold text-text-tertiary uppercase mb-2">Actions (THEN)</h5>
                                            <div className="space-y-2">
                                                {rule.actions.map((action, i) => (
                                                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-bg-elevated rounded-lg">
                                                        <Shield className="h-4 w-4 text-primary-400 flex-shrink-0" />
                                                        <div>
                                                            <span className="text-sm font-medium text-text-primary">{action.type.replace('_', ' ')}</span>
                                                            {Object.keys(action.parameters).length > 0 && (
                                                                <span className="text-xs text-text-tertiary ml-2">
                                                                    ({Object.entries(action.parameters).map(([k, v]) => `${k}: ${v}`).join(', ')})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabPanel>

                        <TabPanel tabId="enforcement" activeTab={tab}>
                            <Card>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Enforcement History</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border-subtle">
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Result</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Entity</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Action</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Details</th>
                                                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-tertiary uppercase">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {policy.enforcementHistory.map((event) => (
                                                <tr key={event.id} className="border-b border-border-subtle/50 hover:bg-white/[0.02]">
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            {resultIcon[event.result]}
                                                            <Badge variant={event.result === 'ENFORCED' ? 'success' : event.result === 'BYPASSED' ? 'warning' : 'danger'}>
                                                                {event.result}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-sm font-mono text-text-primary">{event.entityId}</td>
                                                    <td className="py-2.5 px-3 text-sm text-text-secondary">{event.action}</td>
                                                    <td className="py-2.5 px-3 text-sm text-text-tertiary">{event.details}</td>
                                                    <td className="py-2.5 px-3 text-sm text-text-tertiary">{formatTimeAgo(event.timestamp)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabPanel>
                    </>
                )}
            </Tabs>
        </div>
    );
}
