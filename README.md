# pj-clt-calculator

A web application that calculates the financial equivalence between CLT (formal employment) and PJ (self-employed contractor) work models in Brazil, including a tax provisioning engine and an investment projection module.

This project was developed as part of the **Requirements Engineering** course at **Universidade Católica do Salvador (UCSAL)**. Based on a software Vision Document, I was responsible for analyzing the scope, designing the architecture, and building the full-stack application from scratch.

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

## 🎓 Academic Context

Developed for the *Requirements Engineering* course at **Universidade Católica do Salvador (UCSAL)** (2026).  
* **Vision Document Author:** [Gabriel Sebastião](https://github.com/Akilis16)  
* **System Architecture & Implementation:** [Gabriel Santos](https://github.com/BelgaDevv)

The vision document covers functional and non-functional requirements, use case diagrams, class diagrams, activity diagrams, sequence diagrams, component diagrams, and a C4 model architecture overview. The developer performed requirements analysis, scope refinement, and domain modeling before implementation.

---

## Project status

- [x] Requirements analysis
- [x] Domain modeling
- [x] Database design
- [x] Spring Boot API
- [x] React frontend
- [x] Integration and testing

---

## Running locally

> Instructions will be added as the project progresses.
Academic project — UCSAL 2026.
