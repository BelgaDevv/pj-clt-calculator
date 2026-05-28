package com.github.belgadevv.pj_clt_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequestDTO {

    // ID of the user performing the simulation
    @NotNull(message = "User ID is required!")
    private UUID userId;

    private String descricao;

    // Simulation path: CLT_PARA_PJ | PJ_PARA_CLT | META_PARA_PJ
    @NotBlank(message = "Simulation direction is required!")
    private String direcao;

    // Chosen tax regime: "MEI" or "ME"
    @NotBlank(message = "Tax regime is required!")
    private String regimePjEscolhido;

    // Input strictly for CLT_PARA_PJ (nullable for other paths)
    private Double salarioDesejadoClt;

    // Optional benefits (defaults to 0 if not provided)
    private double valeAlimentacao;
    private double valeTransporte;

    // Pro-labore percentage (required for ME, nullable for MEI)
    private Double proLaborePercentual;

    // Input strictly for PJ_PARA_CLT (nullable for other paths)
    private Double faturamentoBrutoPj;

    // Input target value strictly for META_PARA_PJ simulations
    private Double margemDesejada;
}