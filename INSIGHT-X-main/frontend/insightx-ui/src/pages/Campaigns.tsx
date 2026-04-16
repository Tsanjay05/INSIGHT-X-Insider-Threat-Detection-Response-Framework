import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';
import { graphApi } from '../api/graph';
import type { Campaign } from '../api/graph.types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { formatTimestamp, getRiskLevelColor } from '../lib/utils';

export default function Campaigns() {
    const { data: campaigns, isLoading, error } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => graphApi.getCampaigns(),
    });

    if (isLoading) return <LoadingState message="Loading campaigns..." />;
    if (error) return <ErrorState message={(error as Error).message || 'Failed to load campaigns'} />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Campaign Intelligence</h1>
                <p className="text-text-secondary mt-1">Detected attack campaigns and kill-chain progression</p>
            </div>

            {/* Campaigns Grid */}
            {!campaigns || campaigns.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Network}
                        title="No Campaigns Detected"
                        description="Multi-stage attack campaigns will appear here when correlated signals indicate coordinated threat activity."
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {campaigns.map((campaign: Campaign) => (
                        <Card key={campaign.campaignId} className="hover:border-primary-400/50 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-text-primary">Campaign {campaign.campaignId.slice(0, 8)}</h3>
                                    <p className="text-sm text-text-tertiary mt-1">Kill-chain: {campaign.killChainStage}</p>
                                </div>
                                <Badge className={getRiskLevelColor(campaign.severity)}>
                                    {campaign.severity}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-text-tertiary">Entities</p>
                                    <p className="text-xl font-bold text-text-primary">{campaign.entityCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-tertiary">Duration</p>
                                    <p className="text-sm font-medium text-text-primary">
                                        {campaign.endTime ? 'Completed' : 'Active'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-border-subtle pt-4">
                                <p className="text-xs text-text-tertiary mb-1">Started</p>
                                <p className="text-sm text-text-secondary">{formatTimestamp(campaign.startTime)}</p>
                            </div>

                            <Link
                                to={`/campaigns/${campaign.campaignId}`}
                                className="block mt-4 text-center py-2 rounded-md border border-border-default text-primary-400 hover:bg-primary-400/10 transition-colors text-sm font-medium"
                            >
                                View Campaign Details
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
