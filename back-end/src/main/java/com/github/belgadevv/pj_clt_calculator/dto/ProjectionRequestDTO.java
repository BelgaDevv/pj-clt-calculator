package com.github.belgadevv.pj_clt_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectionRequestDTO {

    @NotNull(message = "User ID is required!")
    private UUID userId;

    // Projection calculation path direction: "NORMAL" or "INVERSA"
    @NotBlank(message = "Projection direction is required!")
    private String direcao;

    private String descricao;

    // Investment timeline duration in years (Mandatory for both calculation paths)
    @NotNull(message = "The timeframe in years is required!")
    @Positive(message = "The timeframe must be a positive number greater than zero!")
    private Integer prazoAnos;

    // Monthly investment contribution (Mandatory strictly for NORMAL path / Nullable for INVERSA)
    private Double aporteMensal;

    // Target financial wealth milestone (Mandatory strictly for INVERSA path / Nullable for NORMAL)
    private Double metaPatrimonio;
}