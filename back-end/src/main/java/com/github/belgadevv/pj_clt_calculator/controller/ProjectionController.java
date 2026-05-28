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

    // =========================================================
    // CÁLCULO REATIVO (NÃO SALVA)
    // =========================================================
    @PostMapping("/calculate")
    public ResponseEntity<ProjectionResponseDTO> calcular(
            @RequestBody @Valid ProjectionRequestDTO dto
    ) {

        return ResponseEntity.ok(
                projectionService.calcular(dto)
        );
    }

    // =========================================================
    // SALVAR NO HISTÓRICO
    // =========================================================
    @PostMapping("/save")
    public ResponseEntity<ProjectionResponseDTO> salvar(
            @RequestBody @Valid ProjectionRequestDTO dto
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        projectionService.salvar(dto)
                );
    }

    // =========================================================
    // HISTÓRICO
    // =========================================================
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ProjectionResponseDTO>> buscarHistorico(
            @PathVariable UUID userId
    ) {

        return ResponseEntity.ok(
                projectionService.buscarHistorico(userId)
        );
    }
}