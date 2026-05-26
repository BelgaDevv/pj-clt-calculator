package com.github.belgadevv.pj_clt_calculator.controller;

import com.github.belgadevv.pj_clt_calculator.dto.SimulationRequestDTO;
import com.github.belgadevv.pj_clt_calculator.dto.SimulationResponseDTO;
import com.github.belgadevv.pj_clt_calculator.service.SimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/simulations")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    // Performs a new equivalence simulation and saves it to history
    @PostMapping
    public ResponseEntity<SimulationResponseDTO> simular(@RequestBody @Valid SimulationRequestDTO dto) {
        // No try/catch needed. If an error occurs, GlobalExceptionHandler catches it!
        SimulationResponseDTO response = simulationService.simular(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Retrieves the complete simulation history for a specific user
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<SimulationResponseDTO>> buscarHistorico(@PathVariable UUID userId) {
        // Clean and straightforward
        List<SimulationResponseDTO> historico = simulationService.buscarHistorico(userId);
        return ResponseEntity.ok(historico);
    }
}