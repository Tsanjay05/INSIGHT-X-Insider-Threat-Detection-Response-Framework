package com.insightx.controls.repository;

import com.insightx.controls.domain.SimulationResult;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SimulationResultRepository extends R2dbcRepository<SimulationResult, String> {
}
