package com.github.belgadevv.pj_clt_calculator.service.calculator;

import org.springframework.stereotype.Component;

@Component
public class RegimePJ_MEI extends ModalidadeTrabalhista {

    // Valor da guia DAS-MEI (Prestação de Serviços gira em torno de R$ 75,00 a R$ 80,00)
    private final double VALOR_FIXO_DAS = 75.60;

    @Override
    public double calcularImpostos(double faturamentoBruto) {
        // O imposto do MEI é fixo, não muda se faturar R$ 1.000 ou R$ 6.000
        return VALOR_FIXO_DAS;
    }

    @Override
    public double calcularProvisoes(double faturamentoBruto) {
        // MEI por padrão legal não tem provisão (férias/13º embutidos).
        // Retorna 0, pois cabe ao PJ provisionar por conta própria no cálculo final do líquido.
        return 0.0;
    }
}
