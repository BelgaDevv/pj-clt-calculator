package com.github.belgadevv.pj_clt_calculator.controller;

import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Register Method
    @PostMapping("/register")
    public ResponseEntity<String> cadastrar(@RequestBody @Valid UserRegistrationDTO dto) {
        userService.cadastrarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
    }

    // Login Method
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid UserLoginDTO dto) {
        userService.autenticar(dto);
        return ResponseEntity.ok("Login realizado com sucesso!");
    }
}