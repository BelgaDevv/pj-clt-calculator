package com.github.belgadevv.pj_clt_calculator.service;

import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserResponseDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserUpdateDTO;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Cadastro
    public UserResponseDTO cadastrarUsuario(UserRegistrationDTO dto) {

        if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
            throw new InvalidSimulationException(
                    "As senhas não coincidem!"
            );
        }

        Optional<User> usuarioExistente =
                userRepository.findByCpf(dto.getCpf());

        if (usuarioExistente.isPresent()) {
            throw new CpfAlreadyRegisteredException(
                    "Este CPF já está cadastrado no sistema!"
            );
        }

        User novoUsuario = new User();

        novoUsuario.setCpf(dto.getCpf());

        novoUsuario.setPasswordHash(
                passwordEncoder.encode(dto.getSenha())
        );

        User usuarioSalvo =
                userRepository.save(novoUsuario);

      return new UserResponseDTO(
        usuarioSalvo.getId(),
        usuarioSalvo.getCpf(),
        usuarioSalvo.getNome(),
        usuarioSalvo.getEmail()
);
    }

    // Login
    public UserResponseDTO autenticar(UserLoginDTO dto) {

        User usuario = userRepository
                .findByCpf(dto.getCpf())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Usuário não encontrado com o CPF informado!"
                        )
                );

        if (!passwordEncoder.matches(
                dto.getSenha(),
                usuario.getPasswordHash()
        )) {
            throw new InvalidCredentialsException(
                    "Senha incorreta!"
            );
        }

        return new UserResponseDTO(
                usuario.getId(),
                usuario.getCpf(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }

    // Atualização de dados
    public User atualizarDados(
            UUID id,
            UserUpdateDTO dto
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Usuário não encontrado."
                        )
                );

        user.setNome(dto.getNome());
        user.setEmail(dto.getEmail());

        return userRepository.save(user);
    }


    //search user by id
    public UserResponseDTO buscarPorId(UUID id) {

    User usuario = userRepository.findById(id)
            .orElseThrow(() ->
                    new UserNotFoundException("Usuário não encontrado!")
            );

    return new UserResponseDTO(
            usuario.getId(),
            usuario.getCpf(),
            usuario.getNome(),
            usuario.getEmail()
    );
}
}