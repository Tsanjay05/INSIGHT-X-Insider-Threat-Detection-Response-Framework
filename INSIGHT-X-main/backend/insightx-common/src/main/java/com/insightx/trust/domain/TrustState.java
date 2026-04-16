package com.insightx.trust.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * Immutable snapshot of an entity's current trust state, suitable for audit.
 *
 * <p>
 * This intentionally stores a summary of historical behavior rather than raw
 * events.
 */
public final class TrustState {

    private final String entityId;
    private final TrustScore currentTrustScore;
    private final Instant lastUpdated;
    private final RollingHistorySummary rollingHistorySummary;

    public TrustState(String entityId,
            TrustScore currentTrustScore,
            Instant lastUpdated,
            RollingHistorySummary rollingHistorySummary) {
        this.entityId = Objects.requireNonNull(entityId, "entityId must not be null");
        this.currentTrustScore = Objects.requireNonNull(currentTrustScore, "currentTrustScore must not be null");
        this.lastUpdated = Objects.requireNonNull(lastUpdated, "lastUpdated must not be null");
        this.rollingHistorySummary = Objects.requireNonNull(rollingHistorySummary,
                "rollingHistorySummary must not be null");
    }

    public static TrustState initial(String entityId, Instant now) {
        return new TrustState(
                entityId,
                new TrustScore(TrustInvariants.INITIAL_TRUST_SCORE, TrustInvariants.INITIAL_CONFIDENCE),
                now,
                RollingHistorySummary.empty(now));
    }

    public String getEntityId() {
        return entityId;
    }

    public TrustScore getCurrentTrustScore() {
        return currentTrustScore;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public RollingHistorySummary getRollingHistorySummary() {
        return rollingHistorySummary;
    }
}
