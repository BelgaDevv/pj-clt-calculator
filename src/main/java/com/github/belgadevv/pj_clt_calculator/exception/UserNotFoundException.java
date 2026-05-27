package com.github.belgadevv.pj_clt_calculator.exception;

// 404 - Usuário não encontrado
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}