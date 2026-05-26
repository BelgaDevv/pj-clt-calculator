package com.github.belgadevv.pj_clt_calculator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Intercepts exceptions across all controllers to centralize error handling
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles Spring validation errors triggered by @Valid in DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationErrors(MethodArgumentNotValidException e) {
        String mensagem = e.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Invalid data!");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensagem);
    }

    // Handles business logic exceptions thrown by Services
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeExceptions(RuntimeException e) {
        String msg = e.getMessage();

        if (msg != null) {
            String lowerMsg = msg.toLowerCase();

            // 409 Conflict: CPF/Email already in use, or passwords don't match
            if (lowerMsg.contains("already in use") || lowerMsg.contains("don't match") || lowerMsg.contains("já cadastrado")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(msg);
            }

            // 401 Unauthorized: Incorrect password, invalid credentials
            if (lowerMsg.contains("incorrect") || lowerMsg.contains("unauthorized") || lowerMsg.contains("inválida")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(msg);
            }

            // 404 Not Found: User or resource not found
            if (lowerMsg.contains("not found") || lowerMsg.contains("não encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msg);
            }
        }

        // 400 Bad Request: Generic fallback for other business errors
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
    }
}