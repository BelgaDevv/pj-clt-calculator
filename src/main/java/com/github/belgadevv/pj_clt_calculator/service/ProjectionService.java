package com.github.belgadevv.pj_clt_calculator.service;

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

    // Estimated baseline annual inflation rate (5% as defined in the vision blueprint)
    private static final double TAXA_INFLACAO_ANUAL = 0.05;

    public ProjectionResponseDTO projetar(ProjectionRequestDTO dto) {

        // 1. Retrieve user profile or throw an error if missing
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // 2. Execute calculation based on selected strategy path direction
        Projection projection = switch (dto.getDirecao().toUpperCase()) {
            case "NORMAL" -> calcularNormal(dto, user);
            case "INVERSA" -> calcularInversa(dto, user);
            default -> throw new RuntimeException("Invalid projection direction! Use NORMAL or INVERSA.");
        };

        // 3. Persist calculation log history and map to outbound contract
        return mapearParaDTO(projectionRepository.save(projection));
    }

    // ── NORMAL FLOW ────────────────────────────────────────────────────────
    // Input: Monthly contribution and timeframe -> Output: Accumulated future wealth
    private Projection calcularNormal(ProjectionRequestDTO dto, User user) {

        if (dto.getAporteMensal() == null || dto.getAporteMensal() <= 0) {
            throw new RuntimeException("Monthly contribution value is required for the normal calculation path!");
        }

        int meses = dto.getPrazoAnos() * 12;

        // Baseline nominal monthly interest rate (0.8% monthly compounding ~ approx 10% annually)
        double taxaMensalNominal = 0.008;

        // Compound interest formula for ordinary annuities (Future Value of an Asset Stream)
        // FV = PMT * [((1 + i)^n - 1) / i]
        double montanteNominal = dto.getAporteMensal()
                * (Math.pow(1 + taxaMensalNominal, meses) - 1)
                / taxaMensalNominal;

        // Monthly real interest rate derivation factoring in the 5% inflation drag
        // Fisher Equation Variation: Real Rate = ((1 + Nominal Rate) / (1 + Inflation Rate)) - 1
        double taxaRealAnual = ((1 + 0.10) / (1 + TAXA_INFLACAO_ANUAL)) - 1;
        double taxaRealMensal = Math.pow(1 + taxaRealAnual, 1.0 / 12) - 1;

        double montanteReal = dto.getAporteMensal()
                * (Math.pow(1 + taxaRealMensal, meses) - 1)
                / taxaRealMensal;

        Projection projection = new Projection();
        projection.setUser(user);
        projection.setDataProjecao(LocalDateTime.now());
        projection.setDirecao("NORMAL");
        projection.setAporteMensal(arredondar(dto.getAporteMensal()));
        projection.setPrazoAnos(dto.getPrazoAnos());
        projection.setMontanteNominal(arredondar(montanteNominal));
        projection.setMontanteReal(arredondar(montanteReal));
        return projection;
    }

    // ── INVERSA FLOW ────────────────────────────────────────────────────────
    // Input: Wealth target milestone and timeframe -> Output: Required monthly contribution
    private Projection calcularInversa(ProjectionRequestDTO dto, User user) {

        if (dto.getMetaPatrimonio() == null || dto.getMetaPatrimonio() <= 0) {
            throw new RuntimeException("Target wealth milestone is required for the inverse calculation path!");
        }

        int meses = dto.getPrazoAnos() * 12;
        double taxaMensalNominal = 0.008;

        // Inverted Ordinary Annuity Formula isolating the regular payment parameter (PMT)
        // PMT = FV * i / [((1 + i)^n - 1)]
        double aporteMensalNecessario = dto.getMetaPatrimonio()
                * taxaMensalNominal
                / (Math.pow(1 + taxaMensalNominal, meses) - 1);

        // Derive parallel purchasing power reality check (Real Amount) for the target milestone
        double taxaRealAnual = ((1 + 0.10) / (1 + TAXA_INFLACAO_ANUAL)) - 1;
        double taxaRealMensal = Math.pow(1 + taxaRealAnual, 1.0 / 12) - 1;

        double montanteReal = aporteMensalNecessario
                * (Math.pow(1 + taxaRealMensal, meses) - 1)
                / taxaRealMensal;

        Projection projection = new Projection();
        projection.setUser(user);
        projection.setDataProjecao(LocalDateTime.now());
        projection.setDirecao("INVERSA");
        projection.setPrazoAnos(dto.getPrazoAnos());
        projection.setMetaPatrimonio(arredondar(dto.getMetaPatrimonio()));
        projection.setAporteMensalNecessario(arredondar(aporteMensalNecessario));
        projection.setMontanteNominal(arredondar(dto.getMetaPatrimonio()));
        projection.setMontanteReal(arredondar(montanteReal));
        return projection;
    }

    // Retrieves full historical logs of projections executed by a specific User profile
    public List<ProjectionResponseDTO> buscarHistorico(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return projectionRepository.findByUserId(userId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    // Standard utility utility to format floating scales to 2 decimal places
    private double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    // Maps database projection structures into unified JSON data transfer payloads
    private ProjectionResponseDTO mapearParaDTO(Projection projection) {
        ProjectionResponseDTO response = new ProjectionResponseDTO();
        response.setId(projection.getId());
        response.setDataProjecao(projection.getDataProjecao());
        response.setDirecao(projection.getDirecao());
        response.setAporteMensal(projection.getAporteMensal());
        response.setPrazoAnos(projection.getPrazoAnos());
        response.setMetaPatrimonio(projection.getMetaPatrimonio());
        response.setMontanteNominal(projection.getMontanteNominal());
        response.setMontanteReal(projection.getMontanteReal());
        response.setAporteMensalNecessario(projection.getAporteMensalNecessario());
        return response;
    }
}