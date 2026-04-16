import { get } from './client';
import type { Campaign, CampaignDetail, CampaignEntity } from './graph.types';

interface GraphStageNode {
    stageName?: string;
}

interface GraphResourceNode {
    resourceId?: string;
}

interface GraphInteraction {
    activityType?: string;
    timestamp?: string;
    resource?: GraphResourceNode;
}

interface GraphCampaignNode {
    campaignId: string;
    name?: string;
    startedAt?: string;
    lastActivityAt?: string;
    stages?: GraphStageNode[];
    interactions?: GraphInteraction[];
}

interface AuthMeResponse {
    id: string;
}

const toStageName = (campaign: GraphCampaignNode): string => {
    const stage = campaign.stages?.[0]?.stageName;
    return stage || 'RECONNAISSANCE';
};

const toSeverity = (stageName: string): Campaign['severity'] => {
    switch (stageName.toUpperCase()) {
        case 'EXFILTRATION':
        case 'IMPACT':
            return 'CRITICAL';
        case 'DATA_STAGING':
            return 'HIGH';
        case 'PRIVILEGE_PROBING':
            return 'MEDIUM';
        default:
            return 'LOW';
    }
};

const toCampaign = (campaign: GraphCampaignNode): Campaign => {
    const stageName = toStageName(campaign);
    const startTime = campaign.startedAt || campaign.lastActivityAt || new Date().toISOString();

    return {
        campaignId: campaign.campaignId,
        killChainStage: stageName,
        entityCount: campaign.interactions?.length || 0,
        startTime,
        endTime: null,
        severity: toSeverity(stageName),
    };
};

const toCampaignDetail = (campaign: GraphCampaignNode): CampaignDetail => {
    const base = toCampaign(campaign);
    const interactions = campaign.interactions || [];

    const resources = Array.from(new Set(
        interactions
            .map((interaction) => interaction.resource?.resourceId)
            .filter((resourceId): resourceId is string => Boolean(resourceId))
    ));

    const entities = resources;

    const timeline = interactions
        .filter((interaction) => interaction.timestamp)
        .sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime())
        .map((interaction) => ({
            timestamp: interaction.timestamp as string,
            stage: base.killChainStage,
            description: interaction.activityType || 'Campaign interaction observed',
        }));

    return {
        ...base,
        entities,
        resources,
        timeline,
    };
};

export const graphApi = {
    /**
     * Get all campaigns for current authenticated user
     */
    getCampaigns: async (): Promise<Campaign[]> => {
        try {
            const me = await get<AuthMeResponse>('/api/v1/auth/me');
            if (!me?.id) {
                return [];
            }

            const campaigns = await get<GraphCampaignNode[]>(`/api/v1/graph/campaigns/user/${me.id}`);
            return campaigns.map(toCampaign);
        } catch {
            // Graph service may be unavailable in local/dev mode.
            return [];
        }
    },

    /**
     * Get detailed campaign information
     */
    getCampaignById: async (campaignId: string): Promise<CampaignDetail> => {
        const campaign = await get<GraphCampaignNode>(`/api/v1/graph/campaigns/${campaignId}`);
        return toCampaignDetail(campaign);
    },

    /**
     * Get entities related to a campaign
     */
    getCampaignEntities: async (campaignId: string): Promise<CampaignEntity[]> => {
        const campaign = await get<GraphCampaignNode>(`/api/v1/graph/campaigns/${campaignId}`);
        const detail = toCampaignDetail(campaign);

        return detail.entities.map((entityId) => ({
            entityId,
            entityType: 'RESOURCE',
            role: 'TARGET',
            firstSeen: detail.startTime,
            lastSeen: detail.endTime || detail.startTime,
        }));
    },
};
