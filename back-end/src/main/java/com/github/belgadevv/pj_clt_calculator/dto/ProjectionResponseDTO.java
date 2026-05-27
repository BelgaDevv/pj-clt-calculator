package com.github.belgadevv.pj_clt_calculator.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectionResponseDTO {

    private UUID id;
    private LocalDateTime dataProjecao;
    private String direcao;

    // ── PROJECTION PARAMETERS (INPUTS) ───────────────────────────────────

    private Double aporteMensal;
    private int prazoAnos;
    private Double metaPatrimonio;

    // ── CALCULATION OUTPUTS (RESULTS) ────────────────────────────────────

    private Double montanteNominal;
    private Double montanteReal;
    private Double aporteMensalNecessario;
}
