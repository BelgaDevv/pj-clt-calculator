package com.github.belgadevv.pj_clt_calculator.infrastructure.repository;

import com.github.belgadevv.pj_clt_calculator.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;



public interface UserRepository extends JpaRepository<User, UUID> {


    // a query: SELECT * FROM users WHERE cpf = ?
    // Retorna Optional para forçar o tratamento do caso em que o CPF não existe
    Optional<User> findByCpf(String cpf);
}