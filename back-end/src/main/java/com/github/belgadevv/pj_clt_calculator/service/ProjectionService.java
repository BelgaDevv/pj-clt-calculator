package com.github.belgadevv.pj_clt_calculator.service;
import com.github.belgadevv.pj_clt_calculator.exception.InvalidProjectionException;
import com.github.belgadevv.pj_clt_calculator.entity.Projection;
import com.github.belgadevv.pj_clt_calculator.entity.User;
import com.github.belgadevv.pj_clt_calculator.dto.ProjectionRequestDTO;
import com.github.belgadevv.pj_clt_calculator.dto.ProjectionResponseDTO;
import com.github.belgadevv.pj_clt_calculator.repository.ProjectionRepository;
import com.github.belgadevv.pj_clt_calculator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectionService {

    private final ProjectionRepository projectionRepository;
    private final UserRepository userRepository;

    private static final double TAXA_INFLACAO_ANUAL = 0.05;

    // =========================================================
    // CÁLCULO REATIVO (NÃO SALVA)
    // =========================================================
    public ProjectionResponseDTO calcular(ProjectionRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Projection projection = switch (dto.getDirecao().toUpperCase()) {

            case "NORMAL" ->
                    calcularNormal(dto, user);

            case "INVERSA" ->
                    calcularInversa(dto, user);

            default ->
                    throw new RuntimeException(
                            "Invalid projection direction! Use NORMAL or INVERSA."
                    );
        };

        return mapearParaDTO(projection);
    }

    // =========================================================
    // SALVAR NO HISTÓRICO
    // =========================================================
    public ProjectionResponseDTO salvar(ProjectionRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Projection projection = switch (dto.getDirecao().toUpperCase()) {

            case "NORMAL" ->
                    calcularNormal(dto, user);

            case "INVERSA" ->
                    calcularInversa(dto, user);

            default ->
                    throw new RuntimeException(
                            "Invalid projection direction! Use NORMAL or INVERSA."
                    );
        };

        long totalSimulacoes =
        projectionRepository.countByUserId(dto.getUserId());

if (totalSimulacoes >= 12) {
    throw new InvalidProjectionException(
            "Limite máximo de 12 simulações atingido."
    );
}

        return mapearParaDTO(
                projectionRepository.save(projection)
        );
    }

    // =========================================================
    // NORMAL
    // =========================================================
    private Projection calcularNormal(
            ProjectionRequestDTO dto,
            User user
    ) {

        if (dto.getAporteMensal() == null
                || dto.getAporteMensal() <= 0) {

            throw new RuntimeException(
                    "Monthly contribution value is required!"
            );
        }

        int meses = dto.getPrazoAnos() * 12;

        double taxaMensalNominal = 0.008;

        double montanteNominal =
                dto.getAporteMensal()
                        * (Math.pow(1 + taxaMensalNominal, meses) - 1)
                        / taxaMensalNominal;

        double taxaRealAnual =
                ((1 + 0.10) / (1 + TAXA_INFLACAO_ANUAL)) - 1;

        double taxaRealMensal =
                Math.pow(1 + taxaRealAnual, 1.0 / 12) - 1;

        double montanteReal =
                dto.getAporteMensal()
                        * (Math.pow(1 + taxaRealMensal, meses) - 1)
                        / taxaRealMensal;

        Projection projection = new Projection();

        projection.setDescricao(dto.getDescricao());
        projection.setUser(user);
        projection.setDataProjecao(LocalDateTime.now());

        projection.setDirecao("NORMAL");

        projection.setAporteMensal(
                arredondar(dto.getAporteMensal())
        );

        projection.setPrazoAnos(dto.getPrazoAnos());

        projection.setMontanteNominal(
                arredondar(montanteNominal)
        );

        projection.setMontanteReal(
                arredondar(montanteReal)
        );

        return projection;
    }

    // =========================================================
    // INVERSA
    // =========================================================
    private Projection calcularInversa(
            ProjectionRequestDTO dto,
            User user
    ) {

        if (dto.getMetaPatrimonio() == null
                || dto.getMetaPatrimonio() <= 0) {

            throw new RuntimeException(
                    "Target wealth milestone is required!"
            );
        }

        int meses = dto.getPrazoAnos() * 12;

        double taxaMensalNominal = 0.008;

        double aporteMensalNecessario =
                dto.getMetaPatrimonio()
                        * taxaMensalNominal
                        / (Math.pow(1 + taxaMensalNominal, meses) - 1);

        double taxaRealAnual =
                ((1 + 0.10) / (1 + TAXA_INFLACAO_ANUAL)) - 1;

        double taxaRealMensal =
                Math.pow(1 + taxaRealAnual, 1.0 / 12) - 1;

        double montanteReal =
                aporteMensalNecessario
                        * (Math.pow(1 + taxaRealMensal, meses) - 1)
                        / taxaRealMensal;

        Projection projection = new Projection();

        projection.setDescricao(dto.getDescricao());
        projection.setUser(user);
        projection.setDataProjecao(LocalDateTime.now());

        projection.setDirecao("INVERSA");

        projection.setPrazoAnos(dto.getPrazoAnos());

        projection.setMetaPatrimonio(
                arredondar(dto.getMetaPatrimonio())
        );

        projection.setAporteMensalNecessario(
                arredondar(aporteMensalNecessario)
        );

        projection.setMontanteNominal(
                arredondar(dto.getMetaPatrimonio())
        );

        projection.setMontanteReal(
                arredondar(montanteReal)
        );

        return projection;
    }

    // =========================================================
    // HISTÓRICO
    // =========================================================
    public List<ProjectionResponseDTO> buscarHistorico(UUID userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return projectionRepository
               .findByUserIdOrderByFixadoDescDataProjecaoDesc(userId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    


public void deletar(UUID id) {
        if (!projectionRepository.existsById(id)) {
            throw new RuntimeException("Projection not found!");
        }
        projectionRepository.deleteById(id);
    }

    public void atualizarDescricao(UUID id, String novaDescricao) {
        Projection projection = projectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projection not found!"));
        projection.setDescricao(novaDescricao);
        projectionRepository.save(projection);
    }

public void togglePin(UUID id) {
    Projection projection = projectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Projection not found!"));
    
    // Força a inversão exata: se for true vira false, se for false ou nulo vira true
    boolean novoStatus = (projection.getFixado() != null) ? !projection.getFixado() : true;
    projection.setFixado(novoStatus);
    
    projectionRepository.save(projection);
}





    
    // =========================================================
    // UTIL
    // =========================================================
    private double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    // =========================================================
    // DTO
    // =========================================================
    private ProjectionResponseDTO mapearParaDTO(Projection projection) {

        ProjectionResponseDTO response =
                new ProjectionResponseDTO();

        response.setDescricao(projection.getDescricao());

        response.setId(projection.getId());

        response.setDataProjecao(
                projection.getDataProjecao()
        );

        response.setDirecao(
                projection.getDirecao()
        );

        response.setAporteMensal(
                projection.getAporteMensal()
        );

        response.setPrazoAnos(
                projection.getPrazoAnos()
        );

        response.setMetaPatrimonio(
                projection.getMetaPatrimonio()
        );

        response.setMontanteNominal(
                projection.getMontanteNominal()
        );

        response.setMontanteReal(
                projection.getMontanteReal()
        );

        response.setAporteMensalNecessario(
                projection.getAporteMensalNecessario()
        );
        response.setFixado(
                projection.getFixado()
        );

        return response;
    }
}