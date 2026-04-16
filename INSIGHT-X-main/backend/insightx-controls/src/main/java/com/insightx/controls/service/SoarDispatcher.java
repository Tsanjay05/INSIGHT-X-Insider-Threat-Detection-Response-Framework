package com.insightx.controls.service;

import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Interface for dispatching actions to external SOAR platforms.
 * Implementation must be non-blocking and fail-safe.
 */
public interface SoarDispatcher {

    /**
     * Dispatch an action to the SOAR platform.
     * 
     * @param actionType   The type of action (e.g. "REVOKE_ACCESS", "ISOLATE_HOST")
     * @param entityId     The target entity
     * @param evidenceJson Context/Evidence for the action
     * @return Mono<Boolean> indicating if dispatch was successful (not execution,
     *         just handoff)
     */
    Mono<Boolean> dispatch(String actionType, String entityId, String evidenceJson);
}
