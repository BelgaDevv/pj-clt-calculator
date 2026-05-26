package com.github.belgadevv.pj_clt_calculator.controller;

import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;


    // Register Method
    @PostMapping("/register")
    public ResponseEntity<String> cadastrar(@RequestBody @Valid UserRegistrationDTO dto) {
        try {
            userService.cadastrarUsuario(dto);
            // 201 Created — user created
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
        } catch (RuntimeException e) {
            // 409 Conflict — CPF is already in use or passwords don`t match
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

  // Login Method
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid UserLoginDTO dto) {
        try {
            userService.autenticar(dto);
            // 200 OK — successful login
            return ResponseEntity.ok("Login realizado com sucesso!");
        } catch (RuntimeException e) {
            // 401 Unauthorized — CPF not found or incorrect password
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}