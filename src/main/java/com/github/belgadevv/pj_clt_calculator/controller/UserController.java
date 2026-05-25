package com.github.belgadevv.pj_clt_calculator.controller;

import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// @RestController combina @Controller e @ResponseBody
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;

    // @PostMapping mapeia requisições POST para /api/users/register
    // @RequestBody deserializa o JSON recebido para o DTO
    // @Valid aciona as validações definidas no DTO antes de entrar no método
    @PostMapping("/register")
    public ResponseEntity<String> cadastrar(@RequestBody @Valid UserRegistrationDTO dto) {
        try {
            userService.cadastrarUsuario(dto);
            // 201 Created — usuário criado com sucesso
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
        } catch (RuntimeException e) {
            // 409 Conflict — CPF já cadastrado ou senhas não coincidem
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // @PostMapping mapeia requisições POST para /api/users/login
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid UserLoginDTO dto) {
        try {
            userService.autenticar(dto);
            // 200 OK — login realizado com sucesso
            return ResponseEntity.ok("Login realizado com sucesso!");
        } catch (RuntimeException e) {
            // 401 Unauthorized — CPF não encontrado ou senha incorreta
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}