package com.github.belgadevv.pj_clt_calculator.controller;

import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserResponseDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserUpdateDTO;
import com.github.belgadevv.pj_clt_calculator.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> cadastrar(
            @RequestBody @Valid UserRegistrationDTO dto
    ) {

        UserResponseDTO response =
                userService.cadastrarUsuario(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(
            @RequestBody @Valid UserLoginDTO dto
    ) {

        UserResponseDTO response =
                userService.autenticar(dto);

        return ResponseEntity.ok(response);
    }

    // UPDATE USER DATA
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarUsuario(
            @PathVariable UUID id,
            @RequestBody UserUpdateDTO dto
    ) {

        return ResponseEntity.ok(
                userService.atualizarDados(id, dto)
        );
    }
   
    // GET USER BY ID
    @GetMapping("/{id}")
public ResponseEntity<UserResponseDTO> buscarUsuario(
        @PathVariable UUID id
) {

    return ResponseEntity.ok(
            userService.buscarPorId(id)
    );
}
}