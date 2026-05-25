package com.github.belgadevv.pj_clt_calculator.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
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


    // @GeneratedValue(UUID) delega ao Spring a geração automática do UUID antes do INSERT
    // @Column(name = "id") mapeia para a coluna "id" no banco
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID idUser;

    @Column(unique = true, nullable = false, length = 11)
    private String cpf;

    // name = "password_hash" mapeia para a coluna com esse nome no banco
    @Column(name = "password_hash", nullable = false)
    private String senhacrip;
}