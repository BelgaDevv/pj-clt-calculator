package com.github.belgadevv.pj_clt_calculator.exception;

// 400 - Regime ou direção inválidos
public class InvalidRegimeException extends RuntimeException {
    public InvalidRegimeException(String message) {
        super(message);
    }
}