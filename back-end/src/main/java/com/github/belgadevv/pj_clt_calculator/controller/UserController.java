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
import com.github.belgadevv.pj_clt_calculator.dto.UserResponseDTO;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Register Method
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

    // Login Method
  @PostMapping("/login")
public ResponseEntity<UserResponseDTO> login(
        @RequestBody @Valid UserLoginDTO dto
) {

    UserResponseDTO response = userService.autenticar(dto);

    return ResponseEntity.ok(response);
}
}