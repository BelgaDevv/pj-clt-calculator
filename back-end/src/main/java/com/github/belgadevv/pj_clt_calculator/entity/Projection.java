package com.github.belgadevv.pj_clt_calculator.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projection")
public class Projection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    // Many-to-One relationship — multiple projections belong to a single user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "data_projecao", nullable = false)
    private LocalDateTime dataProjecao;

    // Projection path direction: "NORMAL" or "INVERSA"
    @Column(name = "direcao", nullable = false, length = 10)
    private String direcao;

    // ── PROJECTION PARAMETERS (INPUTS) ───────────────────────────────────

    // Monthly investment contribution (Input for NORMAL flow / Output for INVERSA flow)
    @Column(name = "aporte_mensal")
    private Double aporteMensal;

    // Investment horizon timeline in years (Mandatory for both calculation paths)
    @Column(name = "prazo_anos", nullable = false)
    private int prazoAnos;

    // Target financial wealth milestone (Input strictly for INVERSA flow)
    @Column(name = "meta_patrimonio")
    private Double metaPatrimonio;

    // ── CALCULATION OUTPUTS (RESULTS) ────────────────────────────────────

    // Total accumulated future value without accounting for inflation losses
    @Column(name = "montante_nominal")
    private Double montanteNominal;

    // Total accumulated future value adjusted for a 5% baseline annual inflation rate
    @Column(name = "montante_real")
    private Double montanteReal;

    // Required calculated monthly contribution to reach the milestone target (Output for INVERSA flow)
    @Column(name = "aporte_mensal_necessario")
    private Double aporteMensalNecessario;
}