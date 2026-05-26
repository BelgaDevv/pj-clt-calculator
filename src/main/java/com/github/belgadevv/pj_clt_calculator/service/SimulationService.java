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

    /**
     * Performs reverse equivalence calculation and saves the simulation.
     */
    public SimulationResponseDTO simular(SimulationRequestDTO dto) {

        // 1. Validates and finds the user by UUID
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // 2. Dynamically selects the calculation strategy (MEI or ME)
        ModalidadeTrabalhista regime = selecionarRegime(dto.getRegimePjEscolhido());

        // 3. Calculates the input base (desired salary + CLT benefits)
        double baseEntrada = dto.getSalarioDesejadoClt()
                + dto.getValeAlimentacao()
                + dto.getValeTransporte();

        // 4. Calculates monthly provisions that a PJ professional should reserve
        double provisoes = regime.calcularProvisoes(baseEntrada);

        // 5. Iterative Projection Engine (Adjusts gross revenue factoring in cascading taxes)
        double faturamentoBruto = (baseEntrada + provisoes) / 0.85; // Initial estimation (15% margin fallback)

        // Refines approximation over 3 iterations to ensure accurate cents matching
        for (int i = 0; i < 3; i++) {
            double impostosTemp = regime.calcularImpostos(faturamentoBruto);
            faturamentoBruto = baseEntrada + provisoes + impostosTemp;
        }

        // 6. Consolidates final taxes based on the refined gross revenue
        double impostos = regime.calcularImpostos(faturamentoBruto);

        // 7. Calculates final available net margin
        double margemDisponivel = regime.calcularValorLiquido(faturamentoBruto, impostos, provisoes);

        // 8. Identifies Simples Nacional Annex dynamically (ME only)
        String anexoAplicado = null;
        if (dto.getRegimePjEscolhido().equalsIgnoreCase("ME")) {
            double proLabore = dto.getProLaborePercentual() != null
                    ? faturamentoBruto * dto.getProLaborePercentual()
                    : faturamentoBruto * 0.28;
            anexoAplicado = regimePJ_ME.calcularFatorR(faturamentoBruto, proLabore) ? "III" : "V";
        }

        // 9. Maps data to the Entity applying financial rounding masks
        Simulation simulation = new Simulation();
        simulation.setUser(user);
        simulation.setDataSimulacao(LocalDateTime.now());
        simulation.setRegimePjEscolhido(dto.getRegimePjEscolhido().toUpperCase());
        simulation.setSalarioDesejadoClt(regime.arredondar(dto.getSalarioDesejadoClt()));
        simulation.setValeAlimentacao(regime.arredondar(dto.getValeAlimentacao()));
        simulation.setValeTransporte(regime.arredondar(dto.getValeTransporte()));
        simulation.setProLaborePercentual(dto.getProLaborePercentual());

        simulation.setImpostoPj(regime.arredondar(impostos));
        simulation.setAnexoAplicadoMe(anexoAplicado);
        simulation.setProvisoesSimuladasPj(regime.arredondar(provisoes));
        simulation.setFaturamentoBrutoPj(regime.arredondar(faturamentoBruto));
        simulation.setMargemDisponivel(regime.arredondar(margemDisponivel));

        // Saves simulation history to PostgreSQL
        Simulation salva = simulationRepository.save(simulation);

        // 10. Converts and returns the output DTO contract
        return mapearParaDTO(salva);
    }

    /**
     * Retrieves the complete simulation history for a specific user ID.
     */
    public List<SimulationResponseDTO> buscarHistorico(UUID userId) {

        // Ensures referential integrity before running the query
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Fetches and maps entities into response DTOs efficiently
        return simulationRepository.findByUserId(userId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Resolves the correct calculation component based on input string.
     */
    private ModalidadeTrabalhista selecionarRegime(String regime) {
        return switch (regime.toUpperCase()) {
            case "MEI" -> regimePJ_MEI;
            case "ME" -> regimePJ_ME;
            default -> throw new RuntimeException("Invalid tax regime! Use MEI or ME.");
        };
    }

    /**
     * Maps database Entity values back into a clean front-end oriented DTO.
     */
    private SimulationResponseDTO mapearParaDTO(Simulation simulation) {
        SimulationResponseDTO response = new SimulationResponseDTO();
        response.setId(simulation.getId());
        response.setDataSimulacao(simulation.getDataSimulacao());
        response.setRegimePjEscolhido(simulation.getRegimePjEscolhido());
        response.setSalarioDesejadoClt(simulation.getSalarioDesejadoClt());
        response.setValeAlimentacao(simulation.getValeAlimentacao());
        response.setValeTransporte(simulation.getValeTransporte());
        response.setProLaborePercentual(simulation.getProLaborePercentual());
        response.setImpostoPj(simulation.getImpostoPj());
        response.setAnexoAplicadoMe(simulation.getAnexoAplicadoMe());
        response.setProvisoesSimuladasPj(simulation.getProvisoesSimuladasPj());
        response.setFaturamentoBrutoPj(simulation.getFaturamentoBrutoPj());
        response.setMargemDisponivel(simulation.getMargemDisponivel());
        return response;
    }
}