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
@Table(name = "simulation")
public class Simulation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "data_simulacao", nullable = false)
    private LocalDateTime dataSimulacao;

    // Simulation target direction: CLT_PARA_PJ | PJ_PARA_CLT | META_PARA_PJ
    @Column(name = "direcao", nullable = false, length = 15)
    private String direcao;

    // ── SIMULATION PARAMETERS (INPUTS) ───────────────────────────────────

    // Chosen tax regime: "MEI" or "ME"
    @Column(name = "regime_pj_escolhido", nullable = false, length = 3)
    private String regimePjEscolhido;

    // CLT salary (Input for CLT_PARA_PJ / Calculated output for PJ_PARA_CLT)
    @Column(name = "salario_desejado_clt")
    private Double salarioDesejadoClt;

    // Optional benefits (defaults to 0 if not provided)
    @Column(name = "vale_alimentacao")
    private double valeAlimentacao;

    @Column(name = "vale_transporte")
    private double valeTransporte;

    // Pro-labore percentage (Strictly for ME regimes)
    @Column(name = "pro_labore_percentual")
    private Double proLaborePercentual;

    // PJ Gross revenue (Input for PJ_PARA_CLT / Calculated output for other paths)
    @Column(name = "faturamento_bruto_pj")
    private Double faturamentoBrutoPj;

    // Target net margin pocket value (Input strictly for META_PARA_PJ)
    @Column(name = "margem_desejada")
    private Double margemDesejada;

    // ── CALCULATION OUTPUTS (RESULTS) ────────────────────────────────────

    // Total calculated PJ taxes
    @Column(name = "imposto_pj")
    private double impostoPj;

    // Applied Simples Nacional split tier (Strictly for ME regimes)
    @Column(name = "anexo_aplicado_me", length = 3)
    private String anexoAplicadoMe;

    // Monthly provisions the professional should reserve to simulate CLT benefits
    @Column(name = "provisoes_simuladas_pj")
    private double provisoesSimuladasPj;

    // Net margin left over after deducting taxes and provisions from gross revenue
    @Column(name = "margem_disponivel")
    private double margemDisponivel;
}