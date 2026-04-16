// Graph/Campaign API Types
export interface Campaign {
    campaignId: string;
    killChainStage: string;
    entityCount: number;
    startTime: string;
    endTime: string | null;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CampaignDetail extends Campaign {
    entities: string[];
    resources: string[];
    timeline: Array<{
        timestamp: string;
        stage: string;
        description: string;
    }>;
}

export interface CampaignEntity {
    entityId: string;
    entityType: string;
    role: string;
    firstSeen: string;
    lastSeen: string;
}
