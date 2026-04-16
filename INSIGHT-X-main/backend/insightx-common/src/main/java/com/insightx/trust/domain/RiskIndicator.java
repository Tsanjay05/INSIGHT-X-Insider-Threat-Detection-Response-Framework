package com.insightx.trust.domain;

import java.util.Objects;

/**
 * Immutable description of a single risk signal contributing to a trust evaluation.
 *
 * <ul>
 *   <li>{@code severity} is a normalized measure of how severe the indicator is in [0, 1].</li>
 *   <li>{@code contribution} is the indicator's impact on the trust score in [-100, 100].</li>
 * </ul>
 */
public final class RiskIndicator {

    public enum Type {
        BEHAVIORAL,
        ENTITLEMENT,
        DATA_ACCESS,
        DATA_EXFILTRATION,
        CONFIGURATION_CHANGE,
        OTHER
    }

    private final String id;
    private final Type type;
    private final double severity;
    private final double contribution;
    private final String description;
    private final String source;

    public RiskIndicator(String id,
                         Type type,
                         double severity,
                         double contribution,
                         String description,
                         String source) {
        this.id = Objects.requireNonNull(id, "id must not be null");
        this.type = Objects.requireNonNull(type, "type must not be null");
        this.severity = enforceSeverityBounds(severity);
        this.contribution = enforceContributionBounds(contribution);
        this.description = description;
        this.source = Objects.requireNonNull(source, "source must not be null");
    }

    private double enforceSeverityBounds(double severity) {
        if (Double.isNaN(severity) || Double.isInfinite(severity)) {
            throw new IllegalArgumentException("RiskIndicator severity must be a finite number");
        }
        if (severity < 0.0 || severity > 1.0) {
            throw new IllegalArgumentException("RiskIndicator severity must be between 0 and 1 inclusive, was " + severity);
        }
        return severity;
    }

    private double enforceContributionBounds(double contribution) {
        if (Double.isNaN(contribution) || Double.isInfinite(contribution)) {
            throw new IllegalArgumentException("RiskIndicator contribution must be a finite number");
        }
        if (contribution < -100.0 || contribution > 100.0) {
            throw new IllegalArgumentException("RiskIndicator contribution must be between -100 and 100 inclusive, was " + contribution);
        }
        return contribution;
    }

    public String getId() {
        return id;
    }

    public Type getType() {
        return type;
    }

    public double getSeverity() {
        return severity;
    }

    public double getContribution() {
        return contribution;
    }

    public String getDescription() {
        return description;
    }

    public String getSource() {
        return source;
    }
}

