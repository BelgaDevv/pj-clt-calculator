const BASE_URL = 'http://localhost:8080/api';

// =======================================================
// USER SERVICES
// =======================================================
export const buscarUsuario = async (userId) => {
  const response = await fetch(
    `http://localhost:8080/api/users/${userId}`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar usuário");
  }

  return response.json();
};

export const atualizarUsuario = async (userId, dados) => {
  const response = await fetch(
    `http://localhost:8080/api/users/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar usuário");
  }

  return response.json();
};
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

// =======================================================
// SIMULATION SERVICES
// =======================================================

// Calculates only (does not save)
export const calcularSimulacao = async (payload) => {
  const response = await fetch(`${BASE_URL}/simulations/calculate`, {
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

// Saves to history
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

// =======================================================
// PROJECTION SERVICES
// =======================================================

// Calculates only (does not save)
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

// Saves to history
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

// =======================================================
// UPDATE, DELETE AND FEATURE (PIN) SERVICES
// =======================================================

// FIXED: Returns only true/success because Java responds with 200 without body
export const atualizarSimulacao = async (id, descricao) => {
  const response = await fetch(`${BASE_URL}/simulations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descricao })
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return true;
};

export const atualizarProjecao = async (id, descricao) => {
  const response = await fetch(`${BASE_URL}/projections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descricao })
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }

  return true;
};

// Delete simulation
export const excluirSimulacao = async (id) => {
  const response = await fetch(`${BASE_URL}/simulations/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }
};

// Delete projection
export const excluirProjecao = async (id) => {
  const response = await fetch(`${BASE_URL}/projections/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }
};

// ADDED: Integration calls for Pin with Java
export const togglePinSimulacao = async (id) => {
  const response = await fetch(`${BASE_URL}/simulations/${id}/pin`, {
    method: 'PATCH'
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }
};

export const togglePinProjecao = async (id) => {
  const response = await fetch(`${BASE_URL}/projections/${id}/pin`, {
    method: 'PATCH'
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(erro);
  }
};