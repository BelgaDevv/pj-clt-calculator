package com.github.belgadevv.pj_clt_calculator.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponseDTO {

    // Database record identifier
    private UUID id;

    // Timestamp of when the simulation was processed
    private LocalDateTime dataSimulacao;

    // Simulation path: CLT_PARA_PJ | PJ_PARA_CLT | META_PARA_PJ
    private String direcao;

    // Chosen tax regime: "MEI" or "ME"
    private String regimePjEscolhido;

    // ── SIMULATION PARAMETERS (Inputs / Calculated Values depending on Direction) ──

    // CLT salary (Input for CLT_PARA_PJ / Calculated output for PJ_PARA_CLT)
    private Double salarioDesejadoClt;

    private double valeAlimentacao;
    private double valeTransporte;

    // Pro-labore percentage (ME only)
    private Double proLaborePercentual;

    // Gross revenue (Input for PJ_PARA_CLT / Calculated output for CLT_PARA_PJ and META_PARA_PJ)
    private Double faturamentoBrutoPj;

    // Target net margin (Input strictly for META_PARA_PJ)
    private Double margemDesejada;

    // ── CALCULATION OUTPUTS ────────────────────────────────────────────────────────

    // Total calculated PJ taxes
    private double impostoPj;

    // Applied Simples Nacional Annex (ME only)
    private String anexoAplicadoMe;

    // Monthly provisions the professional should reserve to simulate CLT benefits
    private double provisoesSimuladasPj;

    // Net margin left after deducting taxes and provisions from gross revenue
    private double margemDisponivel;
}