package com.insightx.trust.domain;

import java.util.Objects;

/**
 * Versioned reference to a policy artifact used during evaluation.
 *
 * <p>
 * Court-defensible systems must be able to prove exactly which policy logic was applied.
 * This type provides stable identifiers and content hashes suitable for immutably linking
 * decisions to policy bundles.
 */
public final class PolicyReference {

    private final String policyId;
    private final String version;
    private final String contentHash;

    public PolicyReference(String policyId, String version, String contentHash) {
        this.policyId = Objects.requireNonNull(policyId, "policyId must not be null");
        this.version = Objects.requireNonNull(version, "version must not be null");
        this.contentHash = Objects.requireNonNull(contentHash, "contentHash must not be null");
    }

    public String getPolicyId() {
        return policyId;
    }

    public String getVersion() {
        return version;
    }

    public String getContentHash() {
        return contentHash;
    }
}

