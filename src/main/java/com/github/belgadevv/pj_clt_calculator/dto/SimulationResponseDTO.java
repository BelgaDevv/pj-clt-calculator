package com.github.belgadevv.pj_clt_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    // ── INPUTS ─────────────────────────────────────────────────────────

    private String regimePjEscolhido;
    private double salarioDesejadoClt;
    private double valeAlimentacao;
    private double valeTransporte;
    private Double proLaborePercentual;

    // ── RESULTS ────────────────────────────────────────────────────────

    // Total calculated PJ taxes
    private double impostoPj;

    // Applied Simples Nacional Annex (ME only)
    private String anexoAplicadoMe;

    // Monthly provisions the professional should reserve to simulate CLT benefits
    private double provisoesSimuladasPj;

    // Required monthly gross revenue (Main output)
    private double faturamentoBrutoPj;

    // Available net margin left for investment/personal draw
    private double margemDisponivel;
}