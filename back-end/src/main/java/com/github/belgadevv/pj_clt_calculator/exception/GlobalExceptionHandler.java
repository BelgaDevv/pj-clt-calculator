package com.github.belgadevv.pj_clt_calculator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Intercepts exceptions across all controllers to centralize error handling
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 - Validation errors triggered by @Valid in DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationErrors(MethodArgumentNotValidException e) {
        String mensagem = e.getBindingResult().getFieldErrors()
                .stream()
                // 1. Filtra para garantir que só leremos erros com mensagens não-nulas
                .map(error -> error.getDefaultMessage())
                .filter(msg -> msg != null && !msg.isBlank())
                .findFirst()
                // 2. Se tudo falhar ou vier vazio, assume essa mensagem padrão segura
                .orElse("Dados inválidos enviados na requisição.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensagem);
    }

    // 404 - User not found
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    // 409 - CPF already registered
    @ExceptionHandler(CpfAlreadyRegisteredException.class)
    public ResponseEntity<String> handleCpfAlreadyRegistered(CpfAlreadyRegisteredException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    // 401 - Invalid credentials
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<String> handleInvalidCredentials(InvalidCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    // 400 - Invalid simulation data
    @ExceptionHandler(InvalidSimulationException.class)
    public ResponseEntity<String> handleInvalidSimulation(InvalidSimulationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    // 400 - Invalid projection data
    @ExceptionHandler(InvalidProjectionException.class)
    public ResponseEntity<String> handleInvalidProjection(InvalidProjectionException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    // 400 - Invalid regime or direction
    @ExceptionHandler(InvalidRegimeException.class)
    public ResponseEntity<String> handleInvalidRegime(InvalidRegimeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    // 500 - Unexpected errors
@ExceptionHandler(Exception.class)
public ResponseEntity handleGenericError(Exception e) {

e.printStackTrace();

return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(e.getMessage());

}
}