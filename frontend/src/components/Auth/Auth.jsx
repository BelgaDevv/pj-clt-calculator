
import React, { useState } from "react";
import "./Auth.css";

export default function Auth({ onLoginSucesso }) {
  // --- STATE MANAGEMENT ---
  const [modo, setModo] = useState('login');
  
  // States strictly aligned with the database schema: only CPF and Password
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // --- INPUT MASKING ---
  // Applies the CPF mask (000.000.000-00) on screen for the user UI experience
  const gerenciarMudancaCpf = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); // Removes all non-digit characters
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setCpf(valor);
    }
  };

  // --- UI TOGGLE ---
  // Switches between login and registration views while resetting fields
  const alternarModo = () => {
    setModo(modo === 'login' ? 'cadastro' : 'login');
    setErro(null);
    setCpf('');
    setSenha('');
    setConfirmarSenha('');
  };

  // --- FORM SUBMISSION ---
  const handleSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);

    // Strips formatting characters from CPF before validation and API calls
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Form validation rules
    if (!cpfLimpo || !senha) {
      setErro('Por favor, preencha o CPF e a senha.');
      return;
    }

    if (cpfLimpo.length !== 11) {
      setErro('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    if (modo === 'cadastro' && senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      // Setup dynamic endpoints based on the active authentication mode
      const url = modo === 'login'
        ? 'http://localhost:8080/api/users/login'
        : 'http://localhost:8080/api/users/register';

      const corpoRequisicao = modo === 'login'
        ? { cpf: cpfLimpo, senha }
        : { cpf: cpfLimpo, senha, confirmacaoSenha: confirmarSenha };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(corpoRequisicao),
      });

      // 1. Error Handling: If the server returns any error status code, parse it as text
      if (!response.ok) {
        const textoErro = await response.text();
        throw new Error(textoErro || `Erro do servidor (${response.status})`);
      }

      // 2. LOGIN FLOW: Standard handling parsing the UserResponseDTO JSON payload
      if (modo === 'login') {
        const texto = await response.text();
        console.log("RESPOSTA BRUTA:", texto);

        const dados = JSON.parse(texto);

        if (dados && dados.id) {
          onLoginSucesso(dados.id); // Stores the user ID globally and redirects to Home
        } else {
          throw new Error('Resposta de autenticação inválida do servidor.');
        }
      }
      // 3. REGISTRATION FLOW: Secure parsing supporting plain text or hybrid JSON objects
      else {
        const respostaCadastro = await response.text();
        
        try {
          // Attempt parsing as JSON if the backend returned the User object entity
          const usuarioObjeto = JSON.parse(respostaCadastro);
          alert('Cadastro realizado com sucesso! Faça login para entrar.');
        } catch {
          // Fallback if the backend returned plain text (e.g., success message string)
          alert('Cadastro realizado com sucesso! Faça login para acessar o sistema.');
        }
        
        // Reset state and direct user automatically to the login view
        setModo('login');
        setSenha('');
        setConfirmarSenha('');
      }

    } catch (err) {
      console.error('Erro na autenticação:', err);
      setErro(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // --- RENDERING UI ---
  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="auth-header">
          <h1>PJ vs <span>CLT</span></h1>
          <p>{modo === 'login' ? 'Entre com seu CPF e senha' : 'Crie sua conta informando seu CPF e uma senha'}</p>
        </div>

        {erro && (
          <div className="erro-inline">
            ⚠️ {erro}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmeter}>
          
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={gerenciarMudancaCpf}
              disabled={carregando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
          </div>

          {modo === 'cadastro' && (
            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={carregando}
              />
            </div>
          )}

          <button type="submit" className="btn-auth" disabled={carregando}>
            {carregando ? 'Processando...' : modo === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro'}
          </button>
        </form>

        <div className="auth-footer">
          {modo === 'login' ? (
            <>
              Não tem uma conta?
              <button type="button" className="auth-toggle-link" onClick={alternarModo}>Cadastre-se</button>
            </>
          ) : (
            <>
              Já possui uma conta?
              <button type="button" className="auth-toggle-link" onClick={alternarModo}>Faça Login</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}