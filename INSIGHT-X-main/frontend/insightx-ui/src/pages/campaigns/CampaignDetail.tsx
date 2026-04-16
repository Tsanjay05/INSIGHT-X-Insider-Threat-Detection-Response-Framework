import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Network, Users, Clock } from 'lucide-react';
import { graphApi } from '../../api/graph';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatTimestamp, getRiskLevelColor } from '../../lib/utils';

export default function CampaignDetail() {
    const { campaignId } = useParams<{ campaignId: string }>();
    const navigate = useNavigate();

    const { data: campaign, isLoading, error } = useQuery({
        queryKey: ['campaign', campaignId],
        queryFn: () => graphApi.getCampaignById(campaignId!),
        enabled: !!campaignId,
    });

    const { data: entities } = useQuery({
        queryKey: ['campaign', campaignId, 'entities'],
        queryFn: () => graphApi.getCampaignEntities(campaignId!),
        enabled: !!campaignId,
    });

    if (isLoading) return <LoadingState message="Loading campaign details..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load campaign'} />;
    if (!campaign) return <ErrorState message="Campaign not found" />;

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link to="/" className="hover:text-text-primary">Dashboard</Link>
                <span>/</span>
                <Link to="/campaigns" className="hover:text-text-primary">Campaigns</Link>
                <span>/</span>
                <span className="text-text-primary">{campaignId?.slice(0, 8)}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-bold text-text-primary">Campaign Detail</h1>
                    </div>
                    <p className="font-mono text-sm text-text-tertiary">{campaign.campaignId}</p>
                </div>
                <Badge className={getRiskLevelColor(campaign.severity)}>
                    {campaign.severity}
                </Badge>
            </div>

            {/* Campaign Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-start gap-3">
                        <Network className="w-5 h-5 text-primary-400 mt-1" />
                        <div>
                            <p className="text-xs text-text-tertiary">Kill-Chain Stage</p>
                            <p className="text-xl font-bold text-text-primary mt-1">{campaign.killChainStage}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-info-400 mt-1" />
                        <div>
                            <p className="text-xs text-text-tertiary">Entities Involved</p>
                            <p className="text-xl font-bold text-text-primary mt-1">{campaign.entityCount}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-warning-400 mt-1" />
                        <div>
                            <p className="text-xs text-text-tertiary">Status</p>
                            <p className="text-xl font-bold text-text-primary mt-1">
                                {campaign.endTime ? 'Completed' : 'Active'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Timeline */}
            {campaign.timeline && campaign.timeline.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Campaign Timeline</h3>
                    <div className="space-y-4">
                        {campaign.timeline.map((event, index) => (
                            <div key={index} className="flex gap-4 border-l-2 border-primary-400 pl-4">
                                <div className="flex-shrink-0 w-32 text-xs text-text-tertiary">
                                    {formatTimestamp(event.timestamp)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-text-primary">{event.stage}</p>
                                    <p className="text-sm text-text-secondary mt-1">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Involved Entities */}
            {entities && entities.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Involved Entities</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Entity ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">First Seen</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entities.map((entity) => (
                                    <tr key={entity.entityId} className="border-b border-border-subtle hover:bg-white/5">
                                        <td className="py-3 px-4 font-semibold text-text-primary">{entity.entityId}</td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">{entity.entityType}</td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">{entity.role}</td>
                                        <td className="py-3 px-4 text-sm text-text-secondary">{formatTimestamp(entity.firstSeen)}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                to={`/trust/${entity.entityId}`}
                                                className="text-sm text-primary-400 hover:text-primary-300"
                                            >
                                                View Trust →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Resources/Assets */}
            {campaign.resources && campaign.resources.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Targeted Resources</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {campaign.resources.map((resource, index) => (
                            <div key={index} className="p-3 rounded-md border border-border-subtle">
                                <p className="text-sm font-mono text-text-primary">{resource}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
