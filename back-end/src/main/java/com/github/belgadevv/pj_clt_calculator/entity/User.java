package com.github.belgadevv.pj_clt_calculator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    // Unique database record identifier
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Brazilian Individual Taxpayer Registry ID (CPF)
    @Column(unique = true, nullable = false, length = 11)
    private String cpf;

    // Encrypted security credentials payload
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
}