// src/services/api.js

const BASE_URL = 'http://localhost:8080/api';

// ── USUÁRIOS ─────────────────────────────────────────────────────────────────

export const cadastrarUsuario = async (cpf, senha, confirmacaoSenha) => {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, senha, confirmacaoSenha }),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.text();
};

export const loginUsuario = async (cpf, senha) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, senha }),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.text();
};

// ── SIMULAÇÕES ────────────────────────────────────────────────────────────────
export const criarSimulacao = async (payload) => { const response = await fetch(`${BASE_URL}/simulations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); if (!response.ok) { const erro = await response.text(); throw new Error(erro); } return response.json(); };

// Apenas calcula (não salva)
export const calcularSimulacao = async (payload) => { const response = await fetch(`${BASE_URL}/simulations/calculate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); if (!response.ok) { const erro = await response.text(); throw new Error(erro); } return response.json(); };

// Salva no histórico
export const salvarSimulacao = async (payload) => {
  const response = await fetch(`${BASE_URL}/simulations/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.json();
};

export const buscarHistoricoSimulacoes = async (userId) => {
  const response = await fetch(`${BASE_URL}/simulations/history/${userId}`);

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.json();
};
// ── PROJEÇÕES ─────────────────────────────────────────────────────────────────

// Apenas calcula (não salva)
export const calcularProjecao = async (payload) => {
  const response = await fetch(`${BASE_URL}/projections/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.json();
};

// Salva no histórico
export const salvarProjecao = async (payload) => {
  const response = await fetch(`${BASE_URL}/projections/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.json();
};

export const buscarHistoricoProjecoes = async (userId) => {
  const response = await fetch(`${BASE_URL}/projections/history/${userId}`);

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return response.json();
};