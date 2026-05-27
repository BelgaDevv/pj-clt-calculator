package com.github.belgadevv.pj_clt_calculator.service.calculator;

import org.springframework.stereotype.Component;

@Component
public class RegimePJ_ME extends ModalidadeTrabalhista {

    // Simples Nacional tax rates for micro-enterprises (ME)
    private final double ALIQUOTA_ANEXO_III = 0.06;   // 6% (Lower rate if Factor R is met)
    private final double ALIQUOTA_ANEXO_V = 0.155;    // 15.5% (Default rate if Factor R is not met)
    private final double PERCENTUAL_PRO_LABORE = 0.28; // 28% mandatory payroll-to-revenue ratio to trigger Factor R

    /**
     * Calculates the "Fator R" logic.
     * If the company's payroll costs (pro-labore) represent 28% or more of its gross revenue,
     * the company qualifies for the lower tax bracket (Anexo III).
     */
    public boolean calcularFatorR(double faturamentoBruto, double proLabore) {
        if (faturamentoBruto == 0) return false;
        return (proLabore / faturamentoBruto) >= PERCENTUAL_PRO_LABORE;
    }

    @Override
    public double calcularImpostos(double faturamentoBruto) {
        // Optimizing corporate tax: Automatically simulation assumes 28% pro-labore allocation to trigger Anexo III
        double proLaboreSugerido = faturamentoBruto * PERCENTUAL_PRO_LABORE;

        boolean enquadraAnexoIII = calcularFatorR(faturamentoBruto, proLaboreSugerido);
        double impostoSimplesNacional;

        if (enquadraAnexoIII) {
            impostoSimplesNacional = faturamentoBruto * ALIQUOTA_ANEXO_III;
        } else {
            impostoSimplesNacional = faturamentoBruto * ALIQUOTA_ANEXO_V;
        }

        // Apart from corporate Simples Nacional, the pro-labore withdrawal triggers an individual 11% INSS tax
        double inssProLabore = proLaboreSugerido * 0.11;

        return impostoSimplesNacional + inssProLabore;
    }
}