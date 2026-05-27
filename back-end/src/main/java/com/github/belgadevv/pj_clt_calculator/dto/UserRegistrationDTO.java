package com.github.belgadevv.pj_clt_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {

    // Check if the CPF is not null and has 11 digits.
    @NotBlank(message = "O CPF é obrigatório!")
    @Size(min = 11, max = 11, message = "O CPF deve conter exatamente 11 dígitos!")
    private String cpf;

    // Check if the password is not null and has 6 digits.
    @NotBlank(message = "A senha é obrigatória!")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres!")
    private String senha;

    // Double check mechanism
    @NotBlank(message = "A confirmação de senha é obrigatória!")
    private String confirmacaoSenha;
}