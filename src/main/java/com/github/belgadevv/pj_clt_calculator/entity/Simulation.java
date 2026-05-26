package com.github.belgadevv.pj_clt_calculator.entity;

import jakarta.persistence.*;
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
@Entity
@Table(name = "simulation")
public class Simulation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    // N:1 relationship with User - LAZY ensures user data is only loaded when explicitly accessed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "data_simulacao", nullable = false)
    private LocalDateTime dataSimulacao;

    // ── INPUTS — Data provided by the user ──────────────────────────

    // Chosen tax regime: "MEI" or "ME"
    @Column(name = "regime_pj_escolhido", nullable = false, length = 3)
    private String regimePjEscolhido;

    // Desired CLT salary to match as PJ
    @Column(name = "salario_desejado_clt", nullable = false)
    private double salarioDesejadoClt;

    @Column(name = "vale_alimentacao")
    private double valeAlimentacao;

    @Column(name = "vale_transporte")
    private double valeTransporte;

    // Percentage of gross revenue allocated to pro-labore (ME only, nullable for MEI)
    @Column(name = "pro_labore_percentual")
    private Double proLaborePercentual;

    // ── RESULTS — Values calculated by the system ──────────────────────

    // Total calculated taxes (Fixed DAS for MEI / Simples Nacional + INSS for ME)
    @Column(name = "imposto_pj")
    private double impostoPj;

    // Simples Nacional Annex applied after Fator R calculation (ME only, nullable for MEI)
    @Column(name = "anexo_aplicado_me", length = 3)
    private String anexoAplicadoMe;

    // Monthly provisions to reserve for simulating CLT rights (13th salary, vacation, FGTS)
    @Column(name = "provisoes_simuladas_pj")
    private double provisoesSimuladasPj;

    // Gross revenue required to match the desired CLT salary (Main result)
    @Column(name = "faturamento_bruto_pj")
    private double faturamentoBrutoPj;

    // Net margin left after deducting taxes and provisions from gross revenue
    @Column(name = "margem_disponivel")
    private double margemDisponivel;
}