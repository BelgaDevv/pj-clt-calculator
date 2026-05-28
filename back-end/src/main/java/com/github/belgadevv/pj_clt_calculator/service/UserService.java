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
import com.github.belgadevv.pj_clt_calculator.dto.UserResponseDTO;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Registers a new user in the system
  public UserResponseDTO cadastrarUsuario(UserRegistrationDTO dto) {

    // Verifica se as senhas coincidem
    if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
        throw new InvalidSimulationException("As senhas não coincidem!");
    }

    // Verifica se o CPF já existe
    Optional<User> usuarioExistente = userRepository.findByCpf(dto.getCpf());

    if (usuarioExistente.isPresent()) {
        throw new CpfAlreadyRegisteredException(
                "Este CPF já está cadastrado no sistema!"
        );
    }

    // Cria entidade
    User novoUsuario = new User();

    novoUsuario.setCpf(dto.getCpf());

    novoUsuario.setPasswordHash(
            passwordEncoder.encode(dto.getSenha())
    );

    // Salva no banco
    User usuarioSalvo = userRepository.save(novoUsuario);

    // Retorna DTO
    return new UserResponseDTO(
            usuarioSalvo.getId(),
            usuarioSalvo.getCpf()
    );
}

    // Authenticates the user using CPF and password
 public UserResponseDTO autenticar(UserLoginDTO dto) {

    User usuario = userRepository.findByCpf(dto.getCpf())
            .orElseThrow(() ->
                    new UserNotFoundException("Usuário não encontrado com o CPF informado!")
            );

    if (!passwordEncoder.matches(dto.getSenha(), usuario.getPasswordHash())) {
        throw new InvalidCredentialsException("Senha incorreta!");
    }

    return new UserResponseDTO(
            usuario.getId(),
            usuario.getCpf()
    );
}
}