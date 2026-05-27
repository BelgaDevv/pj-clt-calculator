package com.github.belgadevv.pj_clt_calculator.exception;

// 409 - CPF já cadastrado
public class CpfAlreadyRegisteredException extends RuntimeException {
    public CpfAlreadyRegisteredException(String message) {
        super(message);
    }
}