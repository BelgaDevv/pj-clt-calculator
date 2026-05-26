package com.github.belgadevv.pj_clt_calculator.service;

import com.github.belgadevv.pj_clt_calculator.dto.SimulationRequestDTO;
import com.github.belgadevv.pj_clt_calculator.dto.SimulationResponseDTO;
import com.github.belgadevv.pj_clt_calculator.entity.Simulation;
import com.github.belgadevv.pj_clt_calculator.entity.User;
import com.github.belgadevv.pj_clt_calculator.repository.SimulationRepository;
import com.github.belgadevv.pj_clt_calculator.repository.UserRepository;
import com.github.belgadevv.pj_clt_calculator.service.calculator.ModalidadeTrabalhista;
import com.github.belgadevv.pj_clt_calculator.service.calculator.RegimePJ_ME;
import com.github.belgadevv.pj_clt_calculator.service.calculator.RegimePJ_MEI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final SimulationRepository simulationRepository;
    private final UserRepository userRepository;
    private final RegimePJ_MEI regimePJ_MEI;
    private final RegimePJ_ME regimePJ_ME;

    public SimulationResponseDTO simular(SimulationRequestDTO dto) {

        // 1. Fetch user by ID
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // 2. Select the appropriate tax regime strategy
        ModalidadeTrabalhista regime = selecionarRegime(dto.getRegimePjEscolhido());

        // 3. Dispatch to the targeted multi-directional calculation engine
        Simulation simulation = switch (dto.getDirecao().toUpperCase()) {
            case "CLT_PARA_PJ" -> calcularCltParaPj(dto, user, regime);
            case "PJ_PARA_CLT" -> calcularPjParaClt(dto, user, regime);
            case "META_PARA_PJ" -> calcularMetaParaPj(dto, user, regime);
            default -> throw new RuntimeException("Invalid direction! Use CLT_PARA_PJ, PJ_PARA_CLT or META_PARA_PJ.");
        };

        // 4. Save to historical records and return the payload mapping
        return mapearParaDTO(simulationRepository.save(simulation));
    }

    // ── DIRECTION 1: CLT → PJ ──────────────────────────────────────────────
    // User provides a target CLT salary — system computes the required gross revenue
    private Simulation calcularCltParaPj(SimulationRequestDTO dto, User user, ModalidadeTrabalhista regime) {

        if (dto.getSalarioDesejadoClt() == null || dto.getSalarioDesejadoClt() <= 0) {
            throw new RuntimeException("Desired CLT salary is required for this calculation path!");
        }

        double baseEntrada = dto.getSalarioDesejadoClt()
                + dto.getValeAlimentacao()
                + dto.getValeTransporte();

        double provisoes = regime.calcularProvisoes(baseEntrada);

        // Iterative convergent loop solving circular dependency between gross revenue and dynamic tax brackets
        double faturamentoBruto = (baseEntrada + provisoes) / 0.85;
        for (int i = 0; i < 3; i++) {
            faturamentoBruto = baseEntrada + provisoes + regime.calcularImpostos(faturamentoBruto);
        }

        double impostos = regime.calcularImpostos(faturamentoBruto);
        double margem = regime.calcularValorLiquido(faturamentoBruto, impostos, provisoes);
        String anexo = resolverAnexo(dto, faturamentoBruto, regime);

        return montarSimulation(user, dto, regime,
                faturamentoBruto, impostos, provisoes, margem, anexo);
    }

    // ── DIRECTION 2: PJ → CLT ──────────────────────────────────────────────
    // User provides active PJ gross revenue — system deduces equivalent matching CLT salary
    private Simulation calcularPjParaClt(SimulationRequestDTO dto, User user, ModalidadeTrabalhista regime) {

        if (dto.getFaturamentoBrutoPj() == null || dto.getFaturamentoBrutoPj() <= 0) {
            throw new RuntimeException("PJ Gross revenue is required for this calculation path!");
        }

        double faturamentoBruto = dto.getFaturamentoBrutoPj();
        double impostos = regime.calcularImpostos(faturamentoBruto);
        double provisoes = regime.calcularProvisoes(faturamentoBruto);
        double margem = regime.calcularValorLiquido(faturamentoBruto, impostos, provisoes);
        String anexo = resolverAnexo(dto, faturamentoBruto, regime);

        // Dynamic output swap: The matching CLT salary maps straight to the left-over available margin
        Simulation simulation = montarSimulation(user, dto, regime,
                faturamentoBruto, impostos, provisoes, margem, anexo);
        simulation.setSalarioDesejadoClt(regime.arredondar(margem));
        return simulation;
    }

    // ── DIRECTION 3: TARGET NET MARGIN → PJ ────────────────────────────────
    // User sets target pocket margin — system reverse-engineers required gross revenue
    private Simulation calcularMetaParaPj(SimulationRequestDTO dto, User user, ModalidadeTrabalhista regime) {

        if (dto.getMargemDesejada() == null || dto.getMargemDesejada() <= 0) {
            throw new RuntimeException("Target net margin is required for this calculation path!");
        }

        // Iterative feedback loop calculating backward from net pocket margin target
        double faturamentoBruto = dto.getMargemDesejada() / 0.70; // Rough initial approximation boundary
        for (int i = 0; i < 3; i++) {
            double impostos = regime.calcularImpostos(faturamentoBruto);
            double provisoes = regime.calcularProvisoes(faturamentoBruto);
            faturamentoBruto = dto.getMargemDesejada() + impostos + provisoes;
        }

        double impostos = regime.calcularImpostos(faturamentoBruto);
        double provisoes = regime.calcularProvisoes(faturamentoBruto);
        double margem = regime.calcularValorLiquido(faturamentoBruto, impostos, provisoes);
        String anexo = resolverAnexo(dto, faturamentoBruto, regime);

        return montarSimulation(user, dto, regime,
                faturamentoBruto, impostos, provisoes, margem, anexo);
    }

    // ── MOTOR ASSISTANTS & HELPERS ─────────────────────────────────────────

    // Computes Simples Nacional split tier using Fator R rules (Strictly for ME regimes)
    private String resolverAnexo(SimulationRequestDTO dto, double faturamentoBruto, ModalidadeTrabalhista regime) {
        if (!dto.getRegimePjEscolhido().equalsIgnoreCase("ME")) return null;
        double proLabore = dto.getProLaborePercentual() != null
                ? faturamentoBruto * dto.getProLaborePercentual()
                : faturamentoBruto * 0.28;
        return regimePJ_ME.calcularFatorR(faturamentoBruto, proLabore) ? "III" : "V";
    }

    // Factory method building mapped transient states into a persistent Simulation Entity
    private Simulation montarSimulation(User user, SimulationRequestDTO dto,
                                        ModalidadeTrabalhista regime,
                                        double faturamentoBruto, double impostos,
                                        double provisoes, double margem, String anexo) {
        Simulation simulation = new Simulation();
        simulation.setUser(user);
        simulation.setDataSimulacao(LocalDateTime.now());
        simulation.setDirecao(dto.getDirecao().toUpperCase());
        simulation.setRegimePjEscolhido(dto.getRegimePjEscolhido().toUpperCase());
        simulation.setSalarioDesejadoClt(dto.getSalarioDesejadoClt() != null
                ? regime.arredondar(dto.getSalarioDesejadoClt()) : null);
        simulation.setValeAlimentacao(regime.arredondar(dto.getValeAlimentacao()));
        simulation.setValeTransporte(regime.arredondar(dto.getValeTransporte()));
        simulation.setProLaborePercentual(dto.getProLaborePercentual());
        simulation.setFaturamentoBrutoPj(regime.arredondar(faturamentoBruto));
        simulation.setMargemDesejada(dto.getMargemDesejada() != null
                ? regime.arredondar(dto.getMargemDesejada()) : null);
        simulation.setImpostoPj(regime.arredondar(impostos));
        simulation.setAnexoAplicadoMe(anexo);
        simulation.setProvisoesSimuladasPj(regime.arredondar(provisoes));
        simulation.setMargemDisponivel(regime.arredondar(margem));
        return simulation;
    }

    // Retransmits simulation logs tied specifically to a customer profile
    public List<SimulationResponseDTO> buscarHistorico(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return simulationRepository.findByUserId(userId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    // Stratifies chosen strategy implementation mapping
    private ModalidadeTrabalhista selecionarRegime(String regime) {
        return switch (regime.toUpperCase()) {
            case "MEI" -> regimePJ_MEI;
            case "ME" -> regimePJ_ME;
            default -> throw new RuntimeException("Invalid regime choice! Use MEI or ME.");
        };
    }

    // Entity to standard Response data transfer contract converter
    private SimulationResponseDTO mapearParaDTO(Simulation simulation) {
        SimulationResponseDTO response = new SimulationResponseDTO();
        response.setId(simulation.getId());
        response.setDataSimulacao(simulation.getDataSimulacao());
        response.setDirecao(simulation.getDirecao());
        response.setRegimePjEscolhido(simulation.getRegimePjEscolhido());
        response.setSalarioDesejadoClt(simulation.getSalarioDesejadoClt());
        response.setValeAlimentacao(simulation.getValeAlimentacao());
        response.setValeTransporte(simulation.getValeTransporte());
        response.setProLaborePercentual(simulation.getProLaborePercentual());
        response.setFaturamentoBrutoPj(simulation.getFaturamentoBrutoPj());
        response.setMargemDesejada(simulation.getMargemDesejada());
        response.setImpostoPj(simulation.getImpostoPj());
        response.setAnexoAplicadoMe(simulation.getAnexoAplicadoMe());
        response.setProvisoesSimuladasPj(simulation.getProvisoesSimuladasPj());
        response.setMargemDisponivel(simulation.getMargemDisponivel());
        return response;
    }
}