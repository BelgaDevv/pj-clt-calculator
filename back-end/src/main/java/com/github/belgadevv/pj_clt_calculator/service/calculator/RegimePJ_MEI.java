package com.github.belgadevv.pj_clt_calculator.service.calculator;

import org.springframework.stereotype.Component;

@Component
public class RegimePJ_MEI extends ModalidadeTrabalhista {

    // Monthly fixed DAS-MEI tax guide value (Service sector baselines typically range around R$ 75.00 to R$ 80.00)
    private final double VALOR_FIXO_DAS = 75.60;

    @Override
    public double calcularImpostos(double faturamentoBruto) {
        // MEI taxation is fixed and independent of invoicing volume (same cost whether billing R$ 1,000 or R$ 6,000)
        return VALOR_FIXO_DAS;
    }
}