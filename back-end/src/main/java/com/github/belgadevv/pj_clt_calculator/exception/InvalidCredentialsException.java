package com.github.belgadevv.pj_clt_calculator.exception;

// 401 - Credenciais inválidas (senha incorreta)
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
