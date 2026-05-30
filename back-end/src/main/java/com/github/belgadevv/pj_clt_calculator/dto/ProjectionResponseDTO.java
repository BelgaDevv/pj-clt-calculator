package com.github.belgadevv.pj_clt_calculator.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectionResponseDTO {

    private UUID id;
    
    private LocalDateTime dataProjecao;

    private String descricao;

    private String direcao;

    private Boolean fixado;

    // ── PROJECTION PARAMETERS (INPUTS) ───────────────────────────────────

    private Double aporteMensal;
    private int prazoAnos;
    private Double metaPatrimonio;

    // ── CALCULATION OUTPUTS (RESULTS) ────────────────────────────────────

    private Double montanteNominal;
    private Double montanteReal;
    private Double aporteMensalNecessario;

    // Historical evolution of the investment's real value over time (for NORMAL flow) or required monthly contribution (for INVERSA flow)
    private List<EvolucaoPatrimonialDTO> historico;

}