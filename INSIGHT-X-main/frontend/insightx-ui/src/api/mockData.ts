/**
 * Mock data for INSIGHT-X frontend development
 * Provides realistic demo data aligned with actual frontend type definitions
 */

import type { TrustDecision } from './trust';
import type { AdaptiveControl } from './controls.types';
import type { IntentHypothesis } from './intent.types';
import type { DecisionProvenance } from './provenance.types';
import type { Campaign } from './graph.types';

// Demo User IDs
export const DEMO_USERS = [
    'alice.johnson@corp.com',
    'bob.martinez@corp.com',
    'charlie.davis@corp.com',
    'diana.research@corp.com',
    'eve.contractor@external.com',
];

// Mock Trust Decisions (aligned with TrustDecision type)
export const mockTrustDecisions: TrustDecision[] = [
    {
        decisionId: 'dec-001',
        entityId: 'alice.johnson@corp.com',
        finalScore: { value: 85.3, confidence: 0.92 },
        riskLevel: 'LOW',
        policyFlags: ['allowAccess'],
        decidedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        humanInLoopRequired: false,
        orderedDeltas: [],
        resultingState: {},
    },
    {
        decisionId: 'dec-002',
        entityId: 'bob.martinez@corp.com',
        finalScore: { value: 42.1, confidence: 0.87 },
        riskLevel: 'HIGH',
        policyFlags: ['requireStepUpAuth', 'requireSecurityReview'],
        decidedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        humanInLoopRequired: true,
        orderedDeltas: [],
        resultingState: {},
    },
    {
        decisionId: 'dec-003',
        entityId: 'eve.contractor@external.com',
        finalScore: { value: 18.7, confidence: 0.95 },
        riskLevel: 'CRITICAL',
        policyFlags: ['requireCaseCreation', 'requireSecurityReview'],
        decidedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        humanInLoopRequired: true,
        orderedDeltas: [],
        resultingState: {},
    },
    {
        decisionId: 'dec-004',
        entityId: 'charlie.davis@corp.com',
        finalScore: { value: 72.5, confidence: 0.89 },
        riskLevel: 'MEDIUM',
        policyFlags: ['allowAccess'],
        decidedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        humanInLoopRequired: false,
        orderedDeltas: [],
        resultingState: {},
    },
];

// Mock Adaptive Controls (aligned with AdaptiveControl type)
export const mockControls: AdaptiveControl[] = [
    {
        controlId: 'ctrl-001',
        entityId: 'bob.martinez@corp.com',
        controlType: 'STEP_UP_AUTH',
        status: 'ACTIVE',
        decisionId: 'dec-002',
        policyId: 'policy-baseline-v3',
        appliedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedReason: null,
        reason: 'HIGH risk detected (score: 42.1)',
    },
    {
        controlId: 'ctrl-002',
        entityId: 'eve.contractor@external.com',
        controlType: 'BLOCK_ACCESS',
        status: 'ACTIVE',
        decisionId: 'dec-003',
        policyId: 'policy-baseline-v3',
        appliedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        expiresAt: null,
        revokedAt: null,
        revokedReason: null,
        reason: 'CRITICAL risk - Potential data exfiltration',
    },
    {
        controlId: 'ctrl-003',
        entityId: 'charlie.davis@corp.com',
        controlType: 'THROTTLE',
        status: 'EXPIRED',
        decisionId: 'dec-004',
        policyId: 'policy-baseline-v3',
        appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedReason: null,
        reason: 'Temporary rate limit during anomaly',
    },
];

// Mock Intent Hypotheses (aligned with IntentHypothesis type)
export const mockHypotheses: IntentHypothesis[] = [
    {
        hypothesisId: 'hyp-001',
        entityId: 'bob.martinez@corp.com',
        intentType: 'CREDENTIAL_COMPROMISE',
        confidence: 0.73,
        lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        evidence: ['dec-002', 'signal-multi-failed-auth'],
        corroborationSources: ['auth-logs', 'geo-ip-analyzer'],
    },
    {
        hypothesisId: 'hyp-002',
        entityId: 'eve.contractor@external.com',
        intentType: 'MALICIOUS_INSIDER',
        confidence: 0.89,
        lastUpdated: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        evidence: ['dec-003', 'signal-data-exfil', 'signal-priv-esc'],
        corroborationSources: ['dlp-connector', 'siem-alerts'],
    },
    {
        hypothesisId: 'hyp-003',
        entityId: 'alice.johnson@corp.com',
        intentType: 'BENIGN_ROLE_EXPANSION',
        confidence: 0.65,
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        evidence: ['dec-001', 'signal-new-project-access'],
        corroborationSources: ['hr-system', 'access-provisioning'],
    },
];

// Mock Provenance Records (aligned with DecisionProvenance type)
export const mockProvenance: DecisionProvenance[] = [
    {
        provenanceId: 'prov-001',
        decisionId: 'dec-002',
        entityId: 'bob.martinez@corp.com',
        decisionTimestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        trustScore: 42.1,
        confidence: 0.87,
        riskLevel: 'HIGH',
        policyId: 'policy-baseline-v3',
        policyVersion: '3.2.1',
        policyHash: 'sha256:abc123...',
        policyFallback: false,
        isSimulation: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
        provenanceId: 'prov-002',
        decisionId: 'dec-003',
        entityId: 'eve.contractor@external.com',
        decisionTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        trustScore: 18.7,
        confidence: 0.95,
        riskLevel: 'CRITICAL',
        policyId: 'policy-baseline-v3',
        policyVersion: '3.2.1',
        policyHash: 'sha256:abc123...',
        policyFallback: false,
        isSimulation: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
];

// Mock Campaigns (aligned with Campaign type)
export const mockCampaigns: Campaign[] = [
    {
        campaignId: 'camp-001',
        killChainStage: 'PRIVILEGE_PROBING',
        entityCount: 2,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: null,
        severity: 'HIGH',
    },
    {
        campaignId: 'camp-002',
        killChainStage: 'EXFILTRATION_ATTEMPT',
        entityCount: 1,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: null,
        severity: 'CRITICAL',
    },
];


