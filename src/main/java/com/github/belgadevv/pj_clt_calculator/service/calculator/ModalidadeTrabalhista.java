package com.github.belgadevv.pj_clt_calculator.service.calculator;

public abstract class ModalidadeTrabalhista {

    // mandatory methods
    public abstract double calcularImpostos(double faturamentoBruto);
    public abstract double calcularProvisoes(double faturamentoBruto);
}
