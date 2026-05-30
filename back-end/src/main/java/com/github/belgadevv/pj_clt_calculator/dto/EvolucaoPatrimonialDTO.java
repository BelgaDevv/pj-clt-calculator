package com.github.belgadevv.pj_clt_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EvolucaoPatrimonialDTO {

    private int mes;
    private double patrimonioReal;
    private double totalInvestido;
}