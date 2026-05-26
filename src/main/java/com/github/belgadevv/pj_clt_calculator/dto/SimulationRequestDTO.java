package com.github.belgadevv.pj_clt_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequestDTO {

    // ID of the user performing the simulation
    @NotNull(message = "User ID is required!")
    private UUID userId;

    // Chosen tax regime: "MEI" or "ME"
    @NotBlank(message = "Tax regime is required!")
    private String regimePjEscolhido;

    // Desired CLT salary to match as PJ
    @NotNull(message = "Desired salary is required!")
    @Positive(message = "Desired salary must be greater than zero!")
    private double salarioDesejadoClt;

    // Optional benefits (defaults to 0 if not provided)
    private double valeAlimentacao;
    private double valeTransporte;

    // Pro-labore percentage (required for ME, nullable for MEI)
    private Double proLaborePercentual;
}