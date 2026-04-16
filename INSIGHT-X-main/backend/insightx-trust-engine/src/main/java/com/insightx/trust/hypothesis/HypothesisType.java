package com.insightx.trust.hypothesis;

/**
 * Categorization of intent hypotheses.
 * 
 * <p>
 * Corresponds to FR-3.1.
 */
public enum HypothesisType {
    BENIGN_ROLE_EXPANSION,
    NEGLIGENT_MISUSE,
    CREDENTIAL_COMPROMISE,
    MALICIOUS_INSIDER,
    UNKNOWN
}
