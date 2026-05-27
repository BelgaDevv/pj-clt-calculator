package com.github.belgadevv.pj_clt_calculator.repository;

import com.github.belgadevv.pj_clt_calculator.entity.Projection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectionRepository extends JpaRepository<Projection, UUID> {

    // Retrieves the complete projection historical logs associated with a specific User ID
    List<Projection> findByUserId(UUID userId);
}