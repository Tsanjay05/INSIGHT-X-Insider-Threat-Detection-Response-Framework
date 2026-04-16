package com.insightx.trust.service;

import com.insightx.trust.api.NormalizedSignal;
import com.insightx.trust.domain.TrustDelta;
import com.insightx.trust.domain.TrustSource;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Service to calculate the immediate trust impact of a new signal.
 * Validates inputs and applies deterministic impact logic.
 */
@Service
public class SignalTrustImpactEngine {

    // Signal weights could be configuration driven, but we use contribution from
    // NormalizedSignal directly
    // as per the API contract.

    public TrustDelta computeImpact(NormalizedSignal signal) {
        Objects.requireNonNull(signal, "Signal must not be null");

        double contribution = signal.contribution();
        double severity = signal.severity(); // 0.0 to 1.0

        // Confidence Impact:
        // Fresh signals increase confidence.
        // Higher severity signals might have more impact on confidence (or less if they
        // are outliers?)
        // Let's assume a valid signal always adds a small confidence boost.
        // Boost = 0.01 + (0.05 * severity)
        double confidenceBoost = 0.01 + (0.05 * severity);

        // Explanation
        String reason = String.format("Signal[%s] type=%s severity=%.2f impact=%+.2f",
                signal.id(), signal.type(), severity, contribution);

        return TrustDelta.of(
                contribution,
                confidenceBoost,
                reason,
                TrustSource.SIGNAL,
                signal.observedAt());
    }
}
