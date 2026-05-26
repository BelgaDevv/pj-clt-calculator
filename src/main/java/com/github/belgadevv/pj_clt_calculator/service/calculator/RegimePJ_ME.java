package com.github.belgadevv.pj_clt_calculator.service.calculator;

import org.springframework.stereotype.Component;

@Component
public class RegimePJ_ME extends ModalidadeTrabalhista {

    private final double ALIQUOTA_ANEXO_III = 0.06; // 6%
    private final double ALIQUOTA_ANEXO_V = 0.155;  // 15.5%
    private final double PERCENTUAL_PRO_LABORE = 0.28; // 28% para atingir o Fator R

    public boolean calcularFatorR(double faturamentoBruto, double proLabore) {
        if (faturamentoBruto == 0) return false;
        // Se a razão entre o pro-labore e o faturamento for maior ou igual a 28%, cai no Anexo III
        return (proLabore / faturamentoBruto) >= PERCENTUAL_PRO_LABORE;
    }

    @Override
    public double calcularImpostos(double faturamentoBruto) {
        // Simulando a estratégia ideal: Forçamos o pró-labore em 28% para pagar menos imposto (Anexo III)
        double proLaboreSugerido = faturamentoBruto * PERCENTUAL_PRO_LABORE;

        boolean enquadraAnexoIII = calcularFatorR(faturamentoBruto, proLaboreSugerido);
        double impostoSimplesNacional;

        if (enquadraAnexoIII) {
            impostoSimplesNacional = faturamentoBruto * ALIQUOTA_ANEXO_III;
        } else {
            impostoSimplesNacional = faturamentoBruto * ALIQUOTA_ANEXO_V;
        }

        // Além do Simples, o pró-labore sofre desconto de INSS (11%)
        double inssProLabore = proLaboreSugerido * 0.11;

        return impostoSimplesNacional + inssProLabore;
    }


}
