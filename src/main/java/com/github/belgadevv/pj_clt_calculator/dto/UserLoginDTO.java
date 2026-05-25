package com.github.belgadevv.pj_clt_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO de entrada para o login
// Contém apenas os dados necessários para autenticar o usuário
// Diferente do UserRegistrationDTO não tem confirmacaoSenha
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserLoginDTO {

    @NotBlank(message = "O CPF é obrigatório!")
    @Size(min = 11, max = 11, message = "O CPF deve conter exatamente 11 dígitos!")
    private String cpf;

    @NotBlank(message = "A senha é obrigatória!")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres!")
    private String senha;
}