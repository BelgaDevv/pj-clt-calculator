package com.github.belgadevv.pj_clt_calculator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // 🌟 Adicione esta linha!
public class InvalidSimulationException extends RuntimeException {
    public InvalidSimulationException(String message) {
        super(message);
    }
}