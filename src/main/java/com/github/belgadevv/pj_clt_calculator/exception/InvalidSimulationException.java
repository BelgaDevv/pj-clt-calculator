package com.github.belgadevv.pj_clt_calculator.exception;


// 400 - Dados inválidos para simulação
public class InvalidSimulationException extends RuntimeException {
    public InvalidSimulationException(String message) {
        super(message);
    }
}