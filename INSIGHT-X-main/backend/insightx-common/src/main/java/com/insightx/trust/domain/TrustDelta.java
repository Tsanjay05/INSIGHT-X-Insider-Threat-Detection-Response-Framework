package com.insightx.trust.domain;

public final class TrustDelta {

    private final double trustDelta;
    private final double confidenceDelta;
    private final String reason;
    private final TrustSource source;
    private final java.time.Instant appliedAt;

    private TrustDelta(double trustDelta, double confidenceDelta, String reason, TrustSource source,
            java.time.Instant appliedAt) {
        this.trustDelta = trustDelta;
        this.confidenceDelta = confidenceDelta;
        this.reason = java.util.Objects.requireNonNull(reason, "Reason must not be null");
        this.source = java.util.Objects.requireNonNull(source, "Source must not be null");
        this.appliedAt = java.util.Objects.requireNonNull(appliedAt, "AppliedAt must not be null");
    }

    public static TrustDelta of(double trustDelta, double confidenceDelta, String reason, TrustSource source,
            java.time.Instant appliedAt) {
        return new TrustDelta(trustDelta, confidenceDelta, reason, source, appliedAt);
    }

    public double getTrustDelta() {
        return trustDelta;
    }

    public double getConfidenceDelta() {
        return confidenceDelta;
    }

    public String getReason() {
        return reason;
    }

    public TrustSource getSource() {
        return source;
    }

    public java.time.Instant getAppliedAt() {
        return appliedAt;
    }

    @Override
    public String toString() {
        return String.format("TrustDelta{score=%.2f, conf=%.2f, src=%s, reason='%s'}",
                trustDelta, confidenceDelta, source, reason);
    }
}
