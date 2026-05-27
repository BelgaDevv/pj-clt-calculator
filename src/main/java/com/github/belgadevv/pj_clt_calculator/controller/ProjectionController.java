package com.github.belgadevv.pj_clt_calculator.controller;

import com.github.belgadevv.pj_clt_calculator.dto.ProjectionRequestDTO;
import com.github.belgadevv.pj_clt_calculator.dto.ProjectionResponseDTO;
import com.github.belgadevv.pj_clt_calculator.service.ProjectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projections")
@RequiredArgsConstructor
public class ProjectionController {

    private final ProjectionService projectionService;

    /**
     * Executes a new asset growth projection analysis and persists it to the historical logs.
     * POST /api/projections
     */
    @PostMapping
    public ResponseEntity<?> projetar(@RequestBody @Valid ProjectionRequestDTO dto) {
        try {
            ProjectionResponseDTO response = projectionService.projetar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Retrieves the complete historical list of projections belonging to a specific User profile.
     * GET /api/projections/history/{userId}
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> buscarHistorico(@PathVariable UUID userId) {
        try {
            List<ProjectionResponseDTO> historico = projectionService.buscarHistorico(userId);
            return ResponseEntity.ok(historico);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}