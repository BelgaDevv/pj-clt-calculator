package com.github.belgadevv.pj_clt_calculator.exception;

// 400 - Dados inválidos para projeção
public class InvalidProjectionException extends RuntimeException {
    public InvalidProjectionException(String message) {
        super(message);
    }
}