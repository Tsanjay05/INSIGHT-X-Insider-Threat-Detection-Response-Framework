package com.insightx.trust.service;

import com.insightx.trust.algorithm.TemporalDecayResult;
import com.insightx.trust.algorithm.TrustComputationResult;
import com.insightx.trust.domain.RiskIndicator;
import com.insightx.trust.domain.TrustState;
import com.insightx.trust.policy.PolicyDecision;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * Deterministic identifiers derived from input material.
 *
 * <p>
 * No randomness, no UUIDs. IDs are stable for the same inputs and policy bundle references.
 */
public final class DeterministicIds {

    private DeterministicIds() {
    }

    public static String decisionId(String entityId,
                                    Instant evaluationTimestamp,
                                    TrustState priorState,
                                    TemporalDecayResult decay,
                                    List<RiskIndicator> indicators,
                                    TrustComputationResult scoring,
                                    PolicyDecision policyDecision) {
        StringBuilder canonical = new StringBuilder(512);
        canonical.append("decision/v1").append('\n');
        canonical.append("entityId=").append(entityId).append('\n');
        canonical.append("evaluationTimestamp=").append(evaluationTimestamp).append('\n');
        canonical.append("priorValue=").append(priorState.getCurrentTrustScore().getValue()).append('\n');
        canonical.append("priorConfidence=").append(priorState.getCurrentTrustScore().getConfidence()).append('\n');
        canonical.append("priorLastUpdated=").append(priorState.getLastUpdated()).append('\n');
        canonical.append("decayApplied=").append(decay.valueChangeApplied()).append('\n');
        canonical.append("decayedValue=").append(decay.decayedScore().getValue()).append('\n');
        canonical.append("rawDelta=").append(scoring.rawDelta()).append('\n');
        canonical.append("appliedDelta=").append(scoring.appliedDelta()).append('\n');
        canonical.append("computedValue=").append(scoring.computedScore().getValue()).append('\n');
        canonical.append("computedConfidence=").append(scoring.computedScore().getConfidence()).append('\n');
        canonical.append("policyRiskLevel=").append(policyDecision.riskLevel().name()).append('\n');
        canonical.append("humanInLoop=").append(policyDecision.humanInLoopRequired()).append('\n');

        policyDecision.appliedPolicies().stream()
                .sorted(Comparator.comparing(a -> a.getPolicyId() + ":" + a.getVersion() + ":" + a.getContentHash()))
                .forEach(ref -> canonical.append("policyRef=").append(ref.getPolicyId())
                        .append("@").append(ref.getVersion())
                        .append("#").append(ref.getContentHash())
                        .append('\n'));

        indicators.stream()
                .sorted(Comparator.comparing(RiskIndicator::getId))
                .forEach(ri -> canonical
                        .append("indicator=").append(ri.getId())
                        .append("|").append(ri.getType())
                        .append("|").append(ri.getSeverity())
                        .append("|").append(ri.getContribution())
                        .append("|").append(ri.getSource())
                        .append('\n'));

        return "d_" + sha256Hex(canonical.toString());
    }

    private static String sha256Hex(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(s.getBytes(StandardCharsets.UTF_8));
            return toHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private static String toHex(byte[] bytes) {
        char[] hex = "0123456789abcdef".toCharArray();
        char[] out = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int v = bytes[i] & 0xFF;
            out[i * 2] = hex[v >>> 4];
            out[i * 2 + 1] = hex[v & 0x0F];
        }
        return new String(out);
    }
}

