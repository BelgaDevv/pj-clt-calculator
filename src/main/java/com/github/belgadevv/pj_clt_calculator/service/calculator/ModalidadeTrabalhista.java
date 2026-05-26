package com.github.belgadevv.pj_clt_calculator.service.calculator;

public abstract class ModalidadeTrabalhista {


    public abstract double calcularImpostos(double faturamentoBruto);

    public double calcularProvisoes(double faturamentoBruto) {
        double decimoTerceiroMensal = faturamentoBruto / 12;
        double feriasComTercoMensal = (faturamentoBruto * 1.33) / 12;
        double fgtsMensal = faturamentoBruto * 0.08;

        return arredondar(decimoTerceiroMensal + feriasComTercoMensal + fgtsMensal);
    }

    public double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    public double calcularValorLiquido(double faturamentoBruto, double impostos, double provisoes) {
        return arredondar(faturamentoBruto - impostos - provisoes);
    }
}