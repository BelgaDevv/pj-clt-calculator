package com.github.belgadevv.pj_clt_calculator.service;

import com.github.belgadevv.pj_clt_calculator.dto.SimulationRequestDTO;
import com.github.belgadevv.pj_clt_calculator.dto.SimulationResponseDTO;
import com.github.belgadevv.pj_clt_calculator.entity.Simulation;
import com.github.belgadevv.pj_clt_calculator.entity.User;
import com.github.belgadevv.pj_clt_calculator.exception.InvalidRegimeException;
import com.github.belgadevv.pj_clt_calculator.exception.InvalidSimulationException;
import com.github.belgadevv.pj_clt_calculator.exception.UserNotFoundException;
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

    // =========================================================
    // CALCULA APENAS (NÃO SALVA)
    // =========================================================
    public SimulationResponseDTO calcular(SimulationRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        ModalidadeTrabalhista regime =
                selecionarRegime(dto.getRegimePjEscolhido());

        Simulation simulation = switch (dto.getDirecao().toUpperCase()) {

            case "CLT_PARA_PJ" ->
                    calcularCltParaPj(dto, user, regime);

            case "PJ_PARA_CLT" ->
                    calcularPjParaClt(dto, user, regime);

            case "META_PARA_PJ" ->
                    calcularMetaParaPj(dto, user, regime);

            default -> throw new InvalidSimulationException(
                    "Invalid direction! Use CLT_PARA_PJ, PJ_PARA_CLT or META_PARA_PJ."
            );
        };

        // NÃO SALVA
        return mapearParaDTO(simulation);
    }

    // =========================================================
    // SALVA EXPLICITAMENTE
    // =========================================================
    public SimulationResponseDTO salvar(SimulationRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        ModalidadeTrabalhista regime =
                selecionarRegime(dto.getRegimePjEscolhido());

        Simulation simulation = switch (dto.getDirecao().toUpperCase()) {

            case "CLT_PARA_PJ" ->
                    calcularCltParaPj(dto, user, regime);

            case "PJ_PARA_CLT" ->
                    calcularPjParaClt(dto, user, regime);

            case "META_PARA_PJ" ->
                    calcularMetaParaPj(dto, user, regime);

            default -> throw new InvalidSimulationException(
                    "Invalid direction! Use CLT_PARA_PJ, PJ_PARA_CLT or META_PARA_PJ."
            );
        };

        long totalSimulacoes =
        simulationRepository.countByUserId(dto.getUserId());

if (totalSimulacoes >= 12) {
    throw new InvalidSimulationException(
            "Limite máximo de 12 simulações atingido."
    );
}

        // AGORA SIM SALVA
        Simulation simulationSalva =
                simulationRepository.save(simulation);

        return mapearParaDTO(simulationSalva);
    }

    // =========================================================
    // CLT → PJ
    // =========================================================
    private Simulation calcularCltParaPj(
            SimulationRequestDTO dto,
            User user,
            ModalidadeTrabalhista regime
    ) {

        if (dto.getSalarioDesejadoClt() == null
                || dto.getSalarioDesejadoClt() <= 0) {

            throw new InvalidSimulationException(
                    "Desired CLT salary is required for this calculation path!"
            );
        }

        double baseEntrada =
                dto.getSalarioDesejadoClt()
                        + dto.getValeAlimentacao()
                        + dto.getValeTransporte();

        double provisoes =
                regime.calcularProvisoes(baseEntrada);

        double faturamentoBruto =
                (baseEntrada + provisoes) / 0.85;

        for (int i = 0; i < 3; i++) {
            faturamentoBruto =
                    baseEntrada
                            + provisoes
                            + regime.calcularImpostos(faturamentoBruto);
        }

        double impostos =
                regime.calcularImpostos(faturamentoBruto);

        double margem =
                regime.calcularValorLiquido(
                        faturamentoBruto,
                        impostos,
                        provisoes
                );

        String anexo =
                resolverAnexo(dto, faturamentoBruto, regime);

        return montarSimulation(
                user,
                dto,
                regime,
                faturamentoBruto,
                impostos,
                provisoes,
                margem,
                anexo
        );
    }

    // =========================================================
    // PJ → CLT
    // =========================================================
    private Simulation calcularPjParaClt(
            SimulationRequestDTO dto,
            User user,
            ModalidadeTrabalhista regime
    ) {

        if (dto.getFaturamentoBrutoPj() == null
                || dto.getFaturamentoBrutoPj() <= 0) {

            throw new InvalidSimulationException(
                    "PJ Gross revenue is required for this calculation path!"
            );
        }

        double faturamentoBruto =
                dto.getFaturamentoBrutoPj();

        double impostos =
                regime.calcularImpostos(faturamentoBruto);

        double provisoes =
                regime.calcularProvisoes(faturamentoBruto);

        double margem =
                regime.calcularValorLiquido(
                        faturamentoBruto,
                        impostos,
                        provisoes
                );

        String anexo =
                resolverAnexo(dto, faturamentoBruto, regime);

        Simulation simulation = montarSimulation(
                user,
                dto,
                regime,
                faturamentoBruto,
                impostos,
                provisoes,
                margem,
                anexo
        );

        simulation.setSalarioDesejadoClt(
                regime.arredondar(margem)
        );

        return simulation;
    }

    // =========================================================
    // META → PJ
    // =========================================================
    private Simulation calcularMetaParaPj(
            SimulationRequestDTO dto,
            User user,
            ModalidadeTrabalhista regime
    ) {

        if (dto.getMargemDesejada() == null
                || dto.getMargemDesejada() <= 0) {

            throw new InvalidSimulationException(
                    "Target net margin is required for this calculation path!"
            );
        }

        double faturamentoBruto =
                dto.getMargemDesejada() / 0.70;

        for (int i = 0; i < 3; i++) {

            double impostos =
                    regime.calcularImpostos(faturamentoBruto);

            double provisoes =
                    regime.calcularProvisoes(faturamentoBruto);

            faturamentoBruto =
                    dto.getMargemDesejada()
                            + impostos
                            + provisoes;
        }

        double impostos =
                regime.calcularImpostos(faturamentoBruto);

        double provisoes =
                regime.calcularProvisoes(faturamentoBruto);

        double margem =
                regime.calcularValorLiquido(
                        faturamentoBruto,
                        impostos,
                        provisoes
                );

        String anexo =
                resolverAnexo(dto, faturamentoBruto, regime);

        return montarSimulation(
                user,
                dto,
                regime,
                faturamentoBruto,
                impostos,
                provisoes,
                margem,
                anexo
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private String resolverAnexo(
            SimulationRequestDTO dto,
            double faturamentoBruto,
            ModalidadeTrabalhista regime
    ) {

        if (!dto.getRegimePjEscolhido().equalsIgnoreCase("ME")) {
            return null;
        }

        double proLabore =
                dto.getProLaborePercentual() != null
                        ? faturamentoBruto * dto.getProLaborePercentual()
                        : faturamentoBruto * 0.28;

        return regimePJ_ME.calcularFatorR(
                faturamentoBruto,
                proLabore
        ) ? "III" : "V";
    }

    private Simulation montarSimulation(
            User user,
            SimulationRequestDTO dto,
            ModalidadeTrabalhista regime,
            double faturamentoBruto,
            double impostos,
            double provisoes,
            double margem,
            String anexo
    ) {

        Simulation simulation = new Simulation();

        simulation.setDescricao(dto.getDescricao());
        simulation.setUser(user);

        simulation.setDataSimulacao(LocalDateTime.now());

        simulation.setDirecao(dto.getDirecao().toUpperCase());

        simulation.setRegimePjEscolhido(
                dto.getRegimePjEscolhido().toUpperCase()
        );

        simulation.setSalarioDesejadoClt(
                dto.getSalarioDesejadoClt() != null
                        ? regime.arredondar(dto.getSalarioDesejadoClt())
                        : null
        );

        simulation.setValeAlimentacao(
                regime.arredondar(dto.getValeAlimentacao())
        );

        simulation.setValeTransporte(
                regime.arredondar(dto.getValeTransporte())
        );

        simulation.setProLaborePercentual(
                dto.getProLaborePercentual()
        );

        simulation.setFaturamentoBrutoPj(
                regime.arredondar(faturamentoBruto)
        );

        simulation.setMargemDesejada(
                dto.getMargemDesejada() != null
                        ? regime.arredondar(dto.getMargemDesejada())
                        : null
        );

        simulation.setImpostoPj(
                regime.arredondar(impostos)
        );

        simulation.setAnexoAplicadoMe(anexo);

        simulation.setProvisoesSimuladasPj(
                regime.arredondar(provisoes)
        );

        simulation.setMargemDisponivel(
                regime.arredondar(margem)
        );

        return simulation;
    }

    // =========================================================
    // HISTÓRICO
    // =========================================================
    public List<SimulationResponseDTO> buscarHistorico(UUID userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found!")
                );

        return simulationRepository
               .findByUserIdOrderByDataSimulacaoDesc(userId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // REGIME
    // =========================================================
    private ModalidadeTrabalhista selecionarRegime(String regime) {

        return switch (regime.toUpperCase()) {

            case "MEI" -> regimePJ_MEI;

            case "ME" -> regimePJ_ME;

            default -> throw new InvalidRegimeException(
                    "Invalid regime choice! Use MEI or ME."
            );
        };
    }

    // =========================================================
    // DTO
    // =========================================================
    private SimulationResponseDTO mapearParaDTO(
            Simulation simulation
    ) {

        SimulationResponseDTO response =
                new SimulationResponseDTO();

        response.setDescricao(simulation.getDescricao());
        response.setId(simulation.getId());

        response.setDataSimulacao(
                simulation.getDataSimulacao()
        );

        response.setDirecao(simulation.getDirecao());

        response.setRegimePjEscolhido(
                simulation.getRegimePjEscolhido()
        );

        response.setSalarioDesejadoClt(
                simulation.getSalarioDesejadoClt()
        );

        response.setValeAlimentacao(
                simulation.getValeAlimentacao()
        );

        response.setValeTransporte(
                simulation.getValeTransporte()
        );

        response.setProLaborePercentual(
                simulation.getProLaborePercentual()
        );

        response.setFaturamentoBrutoPj(
                simulation.getFaturamentoBrutoPj()
        );

        response.setMargemDesejada(
                simulation.getMargemDesejada()
        );

        response.setImpostoPj(
                simulation.getImpostoPj()
        );

        response.setAnexoAplicadoMe(
                simulation.getAnexoAplicadoMe()
        );

        response.setProvisoesSimuladasPj(
                simulation.getProvisoesSimuladasPj()
        );

        response.setMargemDisponivel(
                simulation.getMargemDisponivel()
        );

        return response;
    }
}