package com.github.belgadevv.pj_clt_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO de entrada para o cadastro de usuário
// Define exatamente quais dados o cliente precisa enviar para criar uma conta
// Isola a entidade User da camada de apresentação por segurança
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {

    // @NotBlank garante que o campo não seja nulo nem vazio
    @NotBlank(message = "O CPF é obrigatório!")
    @Size(min = 11, max = 11, message = "O CPF deve conter exatamente 11 dígitos!")
    private String cpf;

    @NotBlank(message = "A senha é obrigatória!")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres!")
    private String senha;

    // Campo usado apenas para validar se o usuário digitou a senha corretamente
    // Comparado com "senha" no UserService — não é armazenado no banco
    @NotBlank(message = "A confirmação de senha é obrigatória!")
    private String confirmacaoSenha;
}