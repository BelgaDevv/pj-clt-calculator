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

        SimulationResponseDTO response =
                simulationService.calcular(dto);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // SALVAR NO HISTÓRICO
    // ==========================================
    @PostMapping("/save")
    public ResponseEntity<SimulationResponseDTO> salvar(
            @RequestBody @Valid SimulationRequestDTO dto
    ) {

        SimulationResponseDTO response =
                simulationService.salvar(dto);

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

    // ==========================================
    // DELETAR SIMULAÇÃO
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable UUID id
    ) {

        simulationService.deletar(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ATUALIZAR DESCRIÇÃO
    // ==========================================
   @PutMapping("/{id}")
public ResponseEntity<Void> atualizarDescricao(
        @PathVariable UUID id,
        @RequestBody java.util.Map<String, String> body // Mude para Map
) {
    String novaDescricao = body.get("descricao");
    simulationService.atualizarDescricao(id, novaDescricao);
    return ResponseEntity.ok().build();
}
    // ==========================================
    // TOGGLE PIN
    // ==========================================
    @PatchMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(
            @PathVariable UUID id
    ) {

        simulationService.togglePin(id);

        return ResponseEntity.ok().build();
    }
}