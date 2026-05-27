package com.github.belgadevv.pj_clt_calculator.service.calculator;

public abstract class ModalidadeTrabalhista {

    // Calculates the specific tax deduction based on the chosen regime (MEI or ME)
    public abstract double calcularImpostos(double faturamentoBruto);

    // Calculates monthly provisions required to simulate standard CLT benefits
    public double calcularProvisoes(double faturamentoBruto) {
        double decimoTerceiroMensal = faturamentoBruto / 12;
        double feriasComTercoMensal = (faturamentoBruto * 1.33) / 12;
        double fgtsMensal = faturamentoBruto * 0.08;

        return arredondar(decimoTerceiroMensal + feriasComTercoMensal + fgtsMensal);
    }

    // Standard utility method to round monetary values to two decimal places
    public double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    // Calculates net pocket income after subtracting taxes and required provisions
    public double calcularValorLiquido(double faturamentoBruto, double impostos, double provisoes) {
        return arredondar(faturamentoBruto - impostos - provisoes);
    }
}