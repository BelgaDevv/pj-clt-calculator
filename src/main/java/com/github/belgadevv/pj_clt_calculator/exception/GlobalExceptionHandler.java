package com.github.belgadevv.pj_clt_calculator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// @RestControllerAdvice intercepta exceções lançadas em qualquer controller da aplicação
// Centraliza o tratamento de erros evitando try/catch repetido em cada controller
@RestControllerAdvice
public class GlobalExceptionHandler {

    // @ExceptionHandler define qual tipo de exceção esse método trata
    // MethodArgumentNotValidException é lançada pelo Spring quando
    // uma validação do @Valid falha antes de entrar no método do controller
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationErrors(MethodArgumentNotValidException e) {

        // Percorre os erros de campo e retorna a primeira mensagem encontrada
        // as mensagens foram definidas nas anotações @NotBlank e @Size dos DTOs
        String mensagem = e.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Dados inválidos!");

        // Retorna 400 Bad Request com a mensagem de validação
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensagem);
    }
}