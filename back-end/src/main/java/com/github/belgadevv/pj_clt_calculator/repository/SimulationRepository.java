package com.github.belgadevv.pj_clt_calculator.repository;

import com.github.belgadevv.pj_clt_calculator.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SimulationRepository extends JpaRepository<Simulation, UUID> {

    // search all simulations by user id
 List<Simulation> findByUserIdOrderByFixadoDescDataSimulacaoDesc(UUID userId);

  long countByUserId(UUID userId);
}