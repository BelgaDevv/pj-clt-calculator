package com.github.belgadevv.pj_clt_calculator.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// @Configuration indica que essa classe define beans de configuração do Spring
// @EnableWebSecurity ativa o módulo de segurança do Spring Security
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Define o bean de criptografia de senha usando o algoritmo BCrypt
    // BCrypt é um algoritmo de hash seguro e lento por design
    // dificultando ataques de força bruta
    // Esse bean é injetado no UserService via @RequiredArgsConstructor
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Define as regras de segurança HTTP da aplicação
    // csrf().disable() desabilita a proteção CSRF pois a API é stateless (sem sessão)
    // anyRequest().permitAll() libera todos os endpoints sem autenticação
    // Futuramente endpoints protegidos exigirão token JWT
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}