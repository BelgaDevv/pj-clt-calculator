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

    // ==========================================
    // CÁLCULO REATIVO (NÃO SALVA)
    // ==========================================
    @PostMapping("/calculate")
    public ResponseEntity<SimulationResponseDTO> calcular(
            @RequestBody @Valid SimulationRequestDTO dto
    ) {

        SimulationResponseDTO response = simulationService.calcular(dto);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // SALVAR NO HISTÓRICO
    // ==========================================
    @PostMapping("/save")
    public ResponseEntity<SimulationResponseDTO> salvar(
            @RequestBody @Valid SimulationRequestDTO dto
    ) {

        SimulationResponseDTO response = simulationService.salvar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // HISTÓRICO
    // ==========================================
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<SimulationResponseDTO>> buscarHistorico(
            @PathVariable UUID userId
    ) {

        List<SimulationResponseDTO> historico =
                simulationService.buscarHistorico(userId);

        return ResponseEntity.ok(historico);
    }
}