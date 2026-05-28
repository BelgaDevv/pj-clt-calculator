// src/pages/Auth.jsx

import React, { useState } from "react";
import "../styles/Auth.css";
export default function Auth({ onLoginSucesso }) {
  const [modo, setModo] = useState('login'); 
  
  // Estados estritamente alinhados com seu banco de dados: apenas CPF e Senha
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Aplica a máscara de CPF (000.000.000-00) na tela para o usuário
  const gerenciarMudancaCpf = (e) => {
    let valor = e.target.value.replace(/\D/g, ''); // Remove letras
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setCpf(valor);
    }
  };

  const alternarModo = () => {
    setModo(modo === 'login' ? 'cadastro' : 'login');
    setErro(null);
    setCpf('');
    setSenha('');
    setConfirmarSenha('');
  };

const handleSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);

    const cpfLimpo = cpf.replace(/\D/g, '');

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

      // 1. Se o servidor der qualquer erro (400, 401, 500), lemos como texto puro amigável
      if (!response.ok) {
        const textoErro = await response.text();
        throw new Error(textoErro || `Erro do servidor (${response.status})`);
      }

      // 2. SE FOR MODO LOGIN: Tratamento padrão com o JSON do UserResponseDTO
      if (modo === 'login') {
      const texto = await response.text();

console.log("RESPOSTA BRUTA:", texto);

const dados = JSON.parse(texto);

        if (dados && dados.id) {
onLoginSucesso(dados.id); // Guarda o ID no estado global e vai para a Home
        } else {
          throw new Error('Resposta de autenticação inválida do servidor.');
        }
      } 
      // 3. SE FOR MODO CADASTRO: Blindagem contra texto puro ou objetos híbridos
      else {
        // Se a rota de registro devolver texto ou objeto, evitamos quebrar
        const respostaCadastro = await response.text();
        
        try {
          // Tenta ler como JSON se o Java mandou o objeto User
          const usuarioObjeto = JSON.parse(respostaCadastro);
          alert('Cadastro realizado com sucesso! Faça login para entrar.');
        } catch {
          // Se o Java devolveu texto puro (ex: "Usuário cadastrado com sucesso!"), cai aqui
          alert('Cadastro realizado com sucesso! Faça login para acessar o sistema.');
        }
        
        // Joga o usuário automaticamente para a tela de Login limpa para ele entrar
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