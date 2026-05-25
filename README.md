# pj-clt-calculator

A web application that calculates the financial equivalence between CLT (formal employment) and PJ (self-employed contractor) work models in Brazil, including a tax provisioning engine and an investment projection module.

This project was developed as part of the **Requirements Engineering** course at **Universidade Católica do Salvador (UCSAL)**, where the developer received a vision document authored by a classmate and was responsible for analyzing the requirements, refining the scope, and implementing the solution from scratch.

---

## About the project

In Brazil, many tech professionals are hired as PJ (Pessoa Jurídica) instead of CLT (Consolidação das Leis do Trabalho). While PJ contracts often offer higher gross pay, they come without mandatory labor benefits like paid vacation, 13th salary, and FGTS. This tool helps professionals understand exactly how much they need to charge as PJ to maintain the same standard of living as a CLT employee.

### Core features

- **Equivalence simulation** — user inputs desired net salary and benefits; the system calculates the required gross PJ revenue, covering taxes (DAS + INSS) and labor provisions
- **Tax regime support** — MEI (fixed DAS) and ME (Simples Nacional, with Annex III/V based on Fator R)
- **Simulation history** — all equivalence simulations are saved and linked to the user's account
- **Investment projection** — user defines a monthly contribution and time horizon; the system projects the nominal and real return (discounting 5% annual inflation)
- **Export flow** — equivalence results can optionally be used as the basis for an investment projection

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (SPA) |
| Backend | Spring Boot (REST API) |
| Database | PostgreSQL |

---

## Database model

Three tables:

- `users` — authentication (UUID as PK, CPF as unique attribute, hashed password)
- `simulation` — equivalence simulation data (tax regime, pro-labore, provisions, gross revenue, available margin)
- `projection` — investment projection data (monthly contribution, period, nominal and real return, optional reference to a simulation)

---

## Academic context

| Field | Info |
|---|---|
| Institution | Universidade Católica do Salvador (UCSAL) |
| Course | Bacharelado em Engenharia de Software |
| Subject | Engenharia de Requisitos |
| Vision document author | Gabriel Sebastião Meneses Sales |
| Developer | Gabriel Santos dos Santos |
| Year | 2026 |

The vision document covers functional and non-functional requirements, use case diagrams, class diagrams, activity diagrams, sequence diagrams, component diagrams, and a C4 model architecture overview. The developer performed requirements analysis, scope refinement, and domain modeling before implementation.

---

## Project status

- [x] Requirements analysis
- [x] Domain modeling
- [x] Database design
- [ ] Spring Boot API
- [ ] React frontend
- [ ] Integration and testing

---

## Running locally

> Instructions will be added as the project progresses.

---

## License

Academic project — UCSAL 2026.
