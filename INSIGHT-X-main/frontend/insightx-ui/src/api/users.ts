/**
 * User management API client
 */

import type {
    UserListResponse,
    UserDetail,
    UserActivityLog,
    UserSession,
    UserFilters,
    CreateUserRequest,
    UpdateUserRequest,
    UserActivity,
} from './users.types';
import type { User, UserRole, UserStatus } from './auth.types';
import type { DecisionProvenance } from './provenance.types';
import { UserRole as UserRoleEnum, UserStatus as UserStatusEnum } from './auth.types';
import { get, post } from './client';

const PROVENANCE_BASE_PATH = '/api/v1/provenance';
const TRUST_BASE_PATH = '/api/v1/trust';
const AUTH_BASE_PATH = '/auth';
const AUDIT_BASE_PATH = '/api/v1/audit';

interface DecisionSummary {
    latest: DecisionProvenance;
    earliestAt: string;
    count: number;
}

interface BackendAuditLog {
    id: number | string;
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    status?: string;
    ipAddress?: string;
}

interface TrustStateResponse {
    entityId: string;
    trustScore: number;
    confidence: number;
    lastUpdated: string;
}

const nowIso = (): string => new Date().toISOString();

const toTimestamp = (decision: DecisionProvenance): string => {
    return decision.decisionTimestamp || decision.createdAt || nowIso();
};

const toDisplayName = (entityId: string): string => {
    const raw = entityId.includes('@') ? entityId.split('@')[0] : entityId;
    return raw
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || entityId;
};

const toEmail = (entityId: string): string => {
    return entityId.includes('@') ? entityId : `${entityId}@insightx.local`;
};

const normalizeRole = (value?: string | UserRole): UserRole => {
    switch ((value || '').toUpperCase()) {
        case 'ADMIN':
            return UserRoleEnum.ADMIN;
        case 'SECURITY_ANALYST':
            return UserRoleEnum.SECURITY_ANALYST;
        case 'VIEWER':
            return UserRoleEnum.VIEWER;
        case 'ANALYST':
        default:
            return UserRoleEnum.ANALYST;
    }
};

const normalizeStatus = (value?: string | UserStatus): UserStatus => {
    switch ((value || '').toUpperCase()) {
        case 'INACTIVE':
            return UserStatusEnum.INACTIVE;
        case 'SUSPENDED':
            return UserStatusEnum.SUSPENDED;
        case 'ACTIVE':
        default:
            return UserStatusEnum.ACTIVE;
    }
};

const roundTrustScore = (score?: number): number | undefined => {
    if (typeof score !== 'number') return undefined;
    return Math.max(0, Math.min(100, Math.round(score)));
};

const buildDecisionSummaries = (decisions: DecisionProvenance[]): Map<string, DecisionSummary> => {
    const summaries = new Map<string, DecisionSummary>();

    for (const decision of decisions) {
        const key = decision.entityId;
        const timestamp = toTimestamp(decision);
        const existing = summaries.get(key);

        if (!existing) {
            summaries.set(key, {
                latest: decision,
                earliestAt: timestamp,
                count: 1,
            });
            continue;
        }

        const existingLatestTimestamp = new Date(toTimestamp(existing.latest)).getTime();
        const currentTimestamp = new Date(timestamp).getTime();

        if (currentTimestamp > existingLatestTimestamp) {
            existing.latest = decision;
        }

        if (currentTimestamp < new Date(existing.earliestAt).getTime()) {
            existing.earliestAt = timestamp;
        }

        existing.count += 1;
        summaries.set(key, existing);
    }

    return summaries;
};

const toUserFromSummary = (entityId: string, summary: DecisionSummary, existing?: User | null): User => {
    const latestTimestamp = toTimestamp(summary.latest);

    return {
        id: entityId,
        email: existing?.email || toEmail(entityId),
        name: existing?.name || toDisplayName(entityId),
        role: existing?.role || UserRoleEnum.ANALYST,
        status: existing?.status || UserStatusEnum.ACTIVE,
        permissions: existing?.permissions || [],
        avatar: existing?.avatar,
        department: existing?.department || 'Security Operations',
        lastLogin: existing?.lastLogin || latestTimestamp,
        createdAt: existing?.createdAt || summary.earliestAt,
        updatedAt: latestTimestamp,
        trustScore: roundTrustScore(summary.latest.trustScore),
        riskLevel: summary.latest.riskLevel,
    };
};

const getCurrentAuthUser = async (): Promise<User | null> => {
    try {
        const user = await get<User>(`${AUTH_BASE_PATH}/me`);
        return {
            ...user,
            role: normalizeRole(user.role),
            status: normalizeStatus(user.status),
        };
    } catch {
        return null;
    }
};

/**
 * Get paginated list of users
 */
export const getUsers = async (filters?: UserFilters): Promise<UserListResponse> => {
    const decisions = await get<DecisionProvenance[]>(`${PROVENANCE_BASE_PATH}/decisions`);
    const currentUser = await getCurrentAuthUser();
    const summaries = buildDecisionSummaries(decisions);

    let users: User[] = Array.from(summaries.entries()).map(([entityId, summary]) =>
        toUserFromSummary(entityId, summary)
    );

    if (currentUser) {
        const currentSummary = summaries.get(currentUser.id);
        if (currentSummary) {
            users = users.map((user) => user.id === currentUser.id
                ? toUserFromSummary(currentUser.id, currentSummary, currentUser)
                : user);
        } else {
            users.unshift(currentUser);
        }
    }

    if (filters?.search) {
        const search = filters.search.toLowerCase();
        users = users.filter((user) =>
            user.name.toLowerCase().includes(search)
            || user.email.toLowerCase().includes(search)
            || user.id.toLowerCase().includes(search)
        );
    }

    if (filters?.role) {
        users = users.filter((user) => user.role === filters.role);
    }

    if (filters?.status) {
        users = users.filter((user) => user.status === filters.status);
    }

    if (filters?.department) {
        const department = filters.department.toLowerCase();
        users = users.filter((user) => (user.department || '').toLowerCase().includes(department));
    }

    users.sort((a, b) => {
        const aTime = new Date(a.lastLogin || a.updatedAt).getTime();
        const bTime = new Date(b.lastLogin || b.updatedAt).getTime();
        return bTime - aTime;
    });

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    const start = (page - 1) * pageSize;

    return {
        users: users.slice(start, start + pageSize),
        total: users.length,
        page,
        pageSize,
    };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<UserDetail> => {
    const [currentUser, decisions] = await Promise.all([
        getCurrentAuthUser(),
        get<DecisionProvenance[]>(`${PROVENANCE_BASE_PATH}/decisions`, { entityId: id }),
    ]);

    const summary = buildDecisionSummaries(decisions).get(id);
    const currentForId = currentUser && currentUser.id === id ? currentUser : null;

    if (!summary && !currentForId) {
        throw new Error('User not found');
    }

    let baseUser: User;
    if (summary) {
        baseUser = toUserFromSummary(id, summary, currentForId);
    } else {
        baseUser = currentForId as User;
    }

    let trustState: TrustStateResponse | null = null;
    try {
        trustState = await get<TrustStateResponse>(`${TRUST_BASE_PATH}/users/${id}`);
    } catch {
        trustState = null;
    }

    const trustScore = roundTrustScore(trustState?.trustScore) ?? baseUser.trustScore;
    const riskLevel = summary?.latest.riskLevel ?? baseUser.riskLevel;

    return {
        ...baseUser,
        trustScore,
        riskLevel,
        lastActivity: summary ? toTimestamp(summary.latest) : (baseUser.lastLogin || nowIso()),
        sessionCount: currentForId ? 1 : 0,
        bio: currentForId ? 'Authenticated platform user.' : 'Entity observed through trust decisions.',
    };
};

/**
 * Create new user
 */
export const createUser = async (_data: CreateUserRequest): Promise<User> => {
    throw new Error('Live backend does not expose user creation yet.');
};

/**
 * Update existing user
 */
export const updateUser = async (_id: string, _data: UpdateUserRequest): Promise<User> => {
    throw new Error('Live backend does not expose user updates yet.');
};

/**
 * Delete user
 */
export const deleteUser = async (_id: string): Promise<void> => {
    throw new Error('Live backend does not expose user deletion yet.');
};

/**
 * Get user activity log
 */
export const getUserActivity = async (
    id: string,
    page = 1,
    pageSize = 20
): Promise<UserActivityLog> => {
    const logs = await get<BackendAuditLog[]>(`${AUDIT_BASE_PATH}`, { actor: id });

    const activities: UserActivity[] = logs.map((log) => ({
        id: String(log.id),
        userId: id,
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        success: (log.status || '').toUpperCase() !== 'FAILURE',
    }));

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const start = (page - 1) * pageSize;
    return {
        activities: activities.slice(start, start + pageSize),
        total: activities.length,
        page,
        pageSize,
    };
};

/**
 * Get user sessions
 */
export const getUserSessions = async (id: string): Promise<UserSession[]> => {
    const currentUser = await getCurrentAuthUser();
    if (!currentUser || currentUser.id !== id) {
        return [];
    }

    const now = nowIso();
    return [
        {
            id: 'current-session',
            userId: id,
            device: 'Browser',
            browser: 'Active Session',
            ipAddress: 'N/A',
            createdAt: currentUser.createdAt,
            lastActive: now,
            isCurrent: true,
        },
    ];
};

/**
 * Revoke user session
 */
export const revokeSession = async (userId: string, sessionId: string): Promise<void> => {
    if (sessionId === 'current-session') {
        throw new Error('Current session cannot be revoked from this view.');
    }

    await post(`${AUDIT_BASE_PATH}/log`, {
        actor: userId,
        action: 'SESSION_REVOKE',
        resource: 'session',
        resourceId: sessionId,
        details: `Session ${sessionId} revoked from frontend.`,
        status: 'SUCCESS',
    });
};
