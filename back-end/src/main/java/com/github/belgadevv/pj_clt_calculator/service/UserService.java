package com.github.belgadevv.pj_clt_calculator.service;

import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.entity.User;
import com.github.belgadevv.pj_clt_calculator.exception.CpfAlreadyRegisteredException;
import com.github.belgadevv.pj_clt_calculator.exception.InvalidCredentialsException;
import com.github.belgadevv.pj_clt_calculator.exception.InvalidSimulationException;
import com.github.belgadevv.pj_clt_calculator.exception.UserNotFoundException;
import com.github.belgadevv.pj_clt_calculator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Registers a new user in the system
    public User cadastrarUsuario(UserRegistrationDTO dto) {

        // Checks if both password fields match before proceeding
        if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
            throw new InvalidSimulationException("As senhas não coincidem!");
        }

        // Optional is a representative way of saying that the method return must be explicitly handled
        Optional<User> usuarioExistente = userRepository.findByCpf(dto.getCpf());
        if (usuarioExistente.isPresent()) {
            throw new CpfAlreadyRegisteredException("Este CPF já está cadastrado no sistema!");
        }

        // Creates the User entity using the DTO data
        User novoUsuario = new User();
        novoUsuario.setCpf(dto.getCpf());

        // The password is encrypted with BCrypt before being stored
        novoUsuario.setPasswordHash(passwordEncoder.encode(dto.getSenha()));

        // Persists the user in the database and returns the saved entity with the generated UUID
        return userRepository.save(novoUsuario);
    }

    // Authenticates the user using CPF and password
    public void autenticar(UserLoginDTO dto) {

        // Searches for the user by CPF — throws UserNotFoundException if not found
        User usuario = userRepository.findByCpf(dto.getCpf())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com o CPF informado!"));

        // BCrypt re-encrypts the entered password and compares with the stored hash
        if (!passwordEncoder.matches(dto.getSenha(), usuario.getPasswordHash())) {
            throw new InvalidCredentialsException("Senha incorreta!");
        }
    }
}