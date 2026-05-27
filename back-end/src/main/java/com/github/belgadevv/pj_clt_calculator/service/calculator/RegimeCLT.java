package com.github.belgadevv.pj_clt_calculator.service.calculator;

import org.springframework.stereotype.Component;

@Component
public class RegimeCLT extends ModalidadeTrabalhista {

    // Standard Brazilian FGTS (Severance Indemnity Fund) rate of 8%
    private final double PERCENTUAL_FGTS = 0.08;

    @Override
    public double calcularImpostos(double salarioBruto) {
        // Simplified calculation for INSS (Social Security) + progressive IRRF (Income Tax)
        double inss = calcularInssSimplificado(salarioBruto);
        double irrf = calcularIrrfSimplificado(salarioBruto - inss);
        return inss + irrf;
    }

    @Override
    public double calcularProvisoes(double salarioBruto) {
        // Accrues monthly fractions for 13th salary, Paid Leave + 1/3 constitutional bonus, and FGTS
        double decimoTerceiroMensal = salarioBruto / 12;
        double feriasComTercoMensal = (salarioBruto * 1.33) / 12;
        double fgtsMensal = salarioBruto * PERCENTUAL_FGTS;

        return decimoTerceiroMensal + feriasComTercoMensal + fgtsMensal;
    }

    // Simplified INSS progressive tax brackets logic for MVP baseline
    private double calcularInssSimplificado(double salario) {
        if (salario <= 1412) return salario * 0.075;
        if (salario <= 2666) return salario * 0.09;
        if (salario <= 4000) return salario * 0.12;
        return salario * 0.14;
    }

    // Simplified IRRF progressive tax brackets and deductions logic for MVP baseline
    private double calcularIrrfSimplificado(double baseCalculo) {
        if (baseCalculo <= 2259) return 0;
        if (baseCalculo <= 2826) return (baseCalculo * 0.075) - 169.44;
        if (baseCalculo <= 3751) return (baseCalculo * 0.15) - 381.44;
        return (baseCalculo * 0.275) - 896.00;
    }
}