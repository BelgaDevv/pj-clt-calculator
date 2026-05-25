package com.github.belgadevv.pj_clt_calculator.service;

import com.github.belgadevv.pj_clt_calculator.domain.entity.User;
import com.github.belgadevv.pj_clt_calculator.dto.UserLoginDTO;
import com.github.belgadevv.pj_clt_calculator.dto.UserRegistrationDTO;
import com.github.belgadevv.pj_clt_calculator.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;

    // PasswordEncoder é injetado pelo Spring — o bean foi definido no SecurityConfig
    // Responsável por criptografar e comparar senhas usando BCrypt
    private final PasswordEncoder passwordEncoder;

    // Método responsável por cadastrar um novo usuário no sistema
    // Recebe um DTO de cadastro para não expor a entidade diretamente
    public User cadastrarUsuario(UserRegistrationDTO dto) {

        // Garante que o usuário digitou a mesma senha nos dois campos
        if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
            throw new RuntimeException("As senhas não coincidem!");
        }

        // Busca no banco se já existe um usuário com o CPF informado
        // Optional evita NullPointerException — o CPF pode ou não existir
        Optional<User> usuarioExistente = userRepository.findByCpf(dto.getCpf());
        if (usuarioExistente.isPresent()) {
            throw new RuntimeException("Este CPF já está cadastrado no sistema!");
        }

        // Monta a entidade User com os dados do DTO
        // A senha é criptografada com BCrypt antes de ser armazenada
        // O UUID é gerado automaticamente pelo Spring ao salvar
        User novoUsuario = new User();
        novoUsuario.setCpf(dto.getCpf());
        novoUsuario.setSenhacrip(passwordEncoder.encode(dto.getSenha()));

        // Persiste o usuário no banco e retorna a entidade salva com o UUID gerado
        return userRepository.save(novoUsuario);
    }

    // Método responsável por autenticar o usuário no sistema
    // Recebe um DTO de login com CPF e senha
    public User autenticar(UserLoginDTO dto) {

        // Busca o usuário pelo CPF — lança exceção se não encontrar
        // orElseThrow evita o uso de if/else para checar Optional
        User usuario = userRepository.findByCpf(dto.getCpf())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o CPF informado!"));

        // BCrypt não descriptografa — ele recriptografa a senha informada
        // e compara com o hash armazenado no banco
        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenhacrip())) {
            throw new RuntimeException("Senha incorreta!");
        }

        // Retorna o usuário autenticado
        return usuario;
    }
}