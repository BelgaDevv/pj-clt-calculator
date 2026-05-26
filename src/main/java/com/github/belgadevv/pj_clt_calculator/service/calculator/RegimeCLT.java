package com.github.belgadevv.pj_clt_calculator.service.calculator;

import org.springframework.stereotype.Component;

@Component
public class RegimeCLT extends ModalidadeTrabalhista {

    private final double PERCENTUAL_FGTS = 0.08;

    @Override
    public double calcularImpostos(double salarioBruto) {
        // Cálculo simplificado de INSS + IRRF progressivo (para ser refinado depois)
        double inss = calcularInssSimplificado(salarioBruto);
        double irrf = calcularIrrfSimplificado(salarioBruto - inss);
        return inss + irrf;
    }

    @Override
    public double calcularProvisoes(double salarioBruto) {
        // Guarda as frações mensais de 13º, Férias + 1/3 e o FGTS (Benefícios reais acumulados)
        double decimoTerceiroMensal = salarioBruto / 12;
        double feriasComTercoMensal = (salarioBruto * 1.33) / 12;
        double fgtsMensal = salarioBruto * PERCENTUAL_FGTS;

        return decimoTerceiroMensal + feriasComTercoMensal + fgtsMensal;
    }

    private double calcularInssSimplificado(double salario) {
        if (salario <= 1412) return salario * 0.075;
        if (salario <= 2666) return salario * 0.09;
        if (salario <= 4000) return salario * 0.12;
        return salario * 0.14; // Teto do INSS real bate em ~R$ 900, mas mantemos simples para o MVP
    }

    private double calcularIrrfSimplificado(double baseCalculo) {
        if (baseCalculo <= 2259) return 0;
        if (baseCalculo <= 2826) return (baseCalculo * 0.075) - 169.44;
        if (baseCalculo <= 3751) return (baseCalculo * 0.15) - 381.44;
        return (baseCalculo * 0.275) - 896.00;
    }
}