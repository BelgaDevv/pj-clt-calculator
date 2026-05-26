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

    // Direção da simulação escolhida pelo usuário
    // CLT_PARA_PJ | PJ_PARA_CLT | META_PARA_PJ
    @Column(name = "direcao", nullable = false, length = 15)
    private String direcao;

    // ── ENTRADAS ─────────────────────────────────────────────────────────

    // Regime tributário escolhido: "MEI" ou "ME"
    @Column(name = "regime_pj_escolhido", nullable = false, length = 3)
    private String regimePjEscolhido;

    // Salário CLT desejado — entrada na direção CLT_PARA_PJ
    // Resultado na direção PJ_PARA_CLT
    @Column(name = "salario_desejado_clt")
    private Double salarioDesejadoClt;

    // Benefícios opcionais
    @Column(name = "vale_alimentacao")
    private double valeAlimentacao;

    @Column(name = "vale_transporte")
    private double valeTransporte;

    // Percentual de pró-labore — apenas para ME
    @Column(name = "pro_labore_percentual")
    private Double proLaborePercentual;

    // Faturamento bruto informado pelo usuário — entrada na direção PJ_PARA_CLT
    // Resultado nas direções CLT_PARA_PJ e META_PARA_PJ
    @Column(name = "faturamento_bruto_pj")
    private Double faturamentoBrutoPj;

    // Margem líquida desejada — entrada na direção META_PARA_PJ
    @Column(name = "margem_desejada")
    private Double margemDesejada;

    // ── RESULTADOS ────────────────────────────────────────────────────────

    @Column(name = "imposto_pj")
    private double impostoPj;

    // Anexo aplicado — apenas para ME
    @Column(name = "anexo_aplicado_me", length = 3)
    private String anexoAplicadoMe;

    @Column(name = "provisoes_simuladas_pj")
    private double provisoesSimuladasPj;

    @Column(name = "margem_disponivel")
    private double margemDisponivel;
}