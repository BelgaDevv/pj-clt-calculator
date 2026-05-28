package com.github.belgadevv.pj_clt_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserResponseDTO {

    private UUID id;
    private String cpf;
}