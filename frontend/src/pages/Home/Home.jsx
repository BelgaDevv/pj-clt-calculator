import React, { useState, useEffect, useRef } from 'react';
import SimulacaoForm from "../../components/SimulacaoForm/SimulacaoForm.jsx";
import ProjecaoForm from "../../components/ProjecaoForm/ProjecaoForm.jsx";
import './Home.css';
import HistoricoChart from '../../components/HistoricoChart/HistoricoChart.jsx';

import {
  FaSun,
  FaMoon,
  FaTrash,
  FaThumbtack,
  FaPen
} from "react-icons/fa";


import {
  buscarHistoricoSimulacoes,
  buscarHistoricoProjecoes,
  excluirSimulacao,
  excluirProjecao,
  atualizarSimulacao,
  atualizarProjecao,
  togglePinSimulacao,
  togglePinProjecao,
  buscarUsuario,
  atualizarUsuario
} from "../../services/api";

export default function Home({userId,
  onLogout,
  abrirAjuda }) {
  const timeoutNotificacao = useRef(null);

  // =======================================================
  // NAVIGATION AND INTERFACE STATES
  // =======================================================
  const [painelAtivo, setPainelAtivo] = useState('inicio');
  const [dadosSelecionados, setDadosSelecionados] = useState(null);
  const [historicoSimulacaoAberto, setHistoricoSimulacaoAberto] = useState(false);
  const [historicoProjecaoAberto, setHistoricoProjecaoAberto] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [painelUsuarioAberto, setPainelUsuarioAberto] = useState(false);
  const [emailUsuario, setEmailUsuario] = useState("");
 

  const [tema, setTema] = useState(
    localStorage.getItem("tema") || "dark"
  );

  // =======================================================
  // EDITING AND NOTIFICATION STATES
  // =======================================================
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');
  const [notificacao, setNotificacao] = useState(null);

  // =======================================================
  // CALCULATION ENGINE STATES
  // =======================================================
  const [valoresFormulario, setValoresFormulario] = useState({
    salarioBruto: 0,
    beneficios: 0,
    faturamentoPJ: 0,
    gastasContador: 0
  });
  const [resultadosAPI, setResultadosAPI] = useState(null);
  const [carregandoAPI, setCarregandoAPI] = useState(false);

  // =======================================================
  // HISTORY LISTS (FETCHED FROM DATABASE)
  // =======================================================
  const [historicoSimulacoes, setHistoricoSimulacoes] = useState([]);
  const [historicoProjecoes, setHistoricoProjecoes] = useState([]);

  // =======================================================
  // TOAST / NOTIFICATION DISPATCHER
  // =======================================================
  const mostrarNotificacao = (mensagem, tipo = 'sucesso') => {
    if (timeoutNotificacao.current) {
      clearTimeout(timeoutNotificacao.current);
    }
    setNotificacao({ mensagem, tipo });
    timeoutNotificacao.current = setTimeout(() => {
      setNotificacao(null);
    }, 3000);
  };

  // =======================================================
  // INITIAL LOAD: FETCH HISTORY FROM DATABASE
  // =======================================================
  useEffect(() => {
    if (!userId) return;

    const carregarHistoricosDoBanco = async () => {
      try {
        // 1. Simulation History
        const dadosSimu = await buscarHistoricoSimulacoes(userId);

        const itensFormatados = dadosSimu.map(item => ({
          id: item.id ?? crypto.randomUUID(),
          tipo: 'simulacao',
          descricao: item.descricao || "Simulação Arquivada",
          modalidade: item.regimePjEscolhido || 'CLT',
          valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            item.faturamentoBrutoPj || item.salarioDesejadoClt || item.margemDisponivel || 0
          ),
          payloadCompleto: item,
          fixado: item.fixado || false,
          ordem: new Date(item.dataSimulacao).getTime()
        }));

        const listaOrdenadaSimu = itensFormatados.sort((a, b) => {
          if (a.fixado && !b.fixado) return -1;
          if (!a.fixado && b.fixado) return 1;
          return b.ordem - a.ordem;
        });
        setHistoricoSimulacoes(listaOrdenadaSimu);

       // 2. Projection History
const dadosProj = await buscarHistoricoProjecoes(userId);

const itensFormatadosProj = dadosProj.map((item, index) => ({
  id: item.id ?? crypto.randomUUID(),
  tipo: 'projecao',
  descricao: item.descricao || "Projeção Arquivada",
  valor: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(
    item.montanteReal || item.aporteMensalNecessario || 0
  ),
  payloadCompleto: item,
  fixado: Boolean(item.fixado),
  ordem: item.dataProjecao
    ? new Date(item.dataProjecao).getTime()
    : Date.now() - index
}));

const listaOrdenadaProj = [...itensFormatadosProj].sort((a, b) => {
  if (a.fixado && !b.fixado) return -1;
  if (!a.fixado && b.fixado) return 1;

  if (b.ordem !== a.ordem) {
    return b.ordem - a.ordem;
  }

  return String(b.id).localeCompare(String(a.id));
});

setHistoricoProjecoes(listaOrdenadaProj);

      } catch (error) {
        console.error("Erro ao buscar registros iniciais:", error);
      }
    };

    carregarHistoricosDoBanco();
  }, [userId]);

  // =======================================================
  // DEBOUNCE FOR REAL-TIME CALCULATION ENGINE
  // =======================================================
  useEffect(() => {
    if (painelAtivo !== 'nova_simulacao' || !userId) return;

    const salario = Number(valoresFormulario.salarioBruto) || 0;
    const faturamento = Number(valoresFormulario.faturamentoPJ) || 0;

    if (salario <= 0 && faturamento <= 0) {
      setResultadosAPI(null);
      return;
    }

    const handler = setTimeout(async () => {
      setCarregandoAPI(true);
      try {
        const direcaoCalculo = faturamento > 0 ? "PJ_PARA_CLT" : "CLT_PARA_PJ";
        const corpoFormatadoParaJava = {
          userId: userId,
          direcao: direcaoCalculo,
          regimePjEscolhido: "MEI",
          salarioDesejadoClt: salario,
          valeAlimentacao: Number(valoresFormulario.beneficios) || 0,
          valeTransporte: 0,
          proLaborePercentual: 28.0,
          faturamentoBrutoPj: faturamento,
          margemDesejada: 0.0
        };

        const response = await fetch('http://localhost:8080/api/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpoFormatadoParaJava),
        });

        if (!response.ok) {
          const textoErro = await response.text();
          throw new Error(textoErro || 'Erro interno no motor do servidor');
        }

        const dados = await response.json();
        setResultadosAPI(dados);
      } catch (error) {
        console.error("Erro no cálculo automático:", error);
      } finally {
        setCarregandoAPI(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [valoresFormulario, painelAtivo, userId]);

  // =======================================================
  // USER PROFILE ACTIONS
  // =======================================================
  const [nomeUsuario, setNomeUsuario] = useState("");

  const carregarUsuario = async () => {
    try {
      if (!userId) return;
      const usuario = await buscarUsuario(userId);
      setNomeUsuario(usuario.nome || "");
      setEmailUsuario(usuario.email || "");
    } catch (erro) {
      console.error("Erro ao carregar usuário:", erro);
    }
  };

  useEffect(() => {
    carregarUsuario();
  }, [userId]);

  const salvarDadosUsuario = async () => {
    try {
      await atualizarUsuario(userId, {
        nome: nomeUsuario,
        email: emailUsuario
      });
      mostrarNotificacao("Dados atualizados com sucesso!");
    } catch {
      mostrarNotificacao("Erro ao salvar.", "erro");
    }
  };

  // =======================================================
  // THEME MANAGEMENT
  // =======================================================
  const alternarTema = () => {
    const novoTema = tema === "dark" ? "light" : "dark";
    setTema(novoTema);
    localStorage.setItem("tema", novoTema);
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", tema);
  }, [tema]);

  // =======================================================
  // HISTORIC SYNCHRONIZATION AFTER SAVE
  // =======================================================
  const handleSalvarNoHistorico = (novaSimulacao) => {
    if (historicoSimulacoes.length >= 12) {
      mostrarNotificacao('Limite máximo de 12 simulações atingido.', 'erro');
      return;
    }

    const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const valorPrincipal = novaSimulacao.faturamentoBrutoPj
      ? formatador.format(novaSimulacao.faturamentoBrutoPj)
      : formatador.format(novaSimulacao.salarioDesejadoClt || 0);

    const novoItemCard = {
      id: novaSimulacao.id ?? crypto.randomUUID(),
      tipo: 'simulacao',
      descricao: novaSimulacao.descricao || 'Nova Simulação',
      modalidade: novaSimulacao.regimePjEscolhido || 'CLT',
      valor: valorPrincipal,
      payloadCompleto: novaSimulacao,
      fixado: false,
      ordem: Date.now() + Math.random()
    };

    setHistoricoSimulacoes(prev => {
      const jaExiste = prev.some(item => item.id === novoItemCard.id);
      if (jaExiste) return prev;
      return [novoItemCard, ...prev].slice(0, 12);
    });

    setHistoricoSimulacaoAberto(true);
    mostrarNotificacao('Simulação arquivada com sucesso!');
  };

  const handleSalvarProjecaoNoHistorico = (novaProjecao) => {
    if (historicoProjecoes.length >= 12) {
      mostrarNotificacao('Limite máximo de 12 projeções atingido.', 'erro');
      return;
    }

    const novoItemCard = {
      id: novaProjecao.id ?? crypto.randomUUID(),
      tipo: 'projecao',
      descricao: novaProjecao.descricao || 'Projeção',
      valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        novaProjecao.montanteReal || novaProjecao.aporteMensalNecessario || 0
      ),
      payloadCompleto: novaProjecao,
      fixado: false,
      ordem: Date.now() + Math.random()
    };

    setHistoricoProjecoes(prev => {
      const jaExiste = prev.some(item => item.id === novoItemCard.id);
      if (jaExiste) {
        mostrarNotificacao("Projeção já armazenada.", "erro");
        return prev;
      }
      return [novoItemCard, ...prev].slice(0, 12);
    });

    setHistoricoProjecaoAberto(true);
    mostrarNotificacao('Projeção arquivada com sucesso!');
  };

  // =======================================================
  // REMOVE RECORD FROM HISTORY
  // =======================================================
  const apagarItem = async (e, id, tipo) => {
    e.stopPropagation();
    try {
      if (tipo === 'simulacao') {
        await excluirSimulacao(id);
        setHistoricoSimulacoes(prev => prev.filter(item => item.id !== id));
      } else {
        await excluirProjecao(id);
        setHistoricoProjecoes(prev => prev.filter(item => item.id !== id));
      }

      if (dadosSelecionados?.id === id) {
        setDadosSelecionados(null);
        setPainelAtivo('inicio');
      }

      mostrarNotificacao('Item removido.', 'aviso');
    } catch (error) {
      console.error(error);
      mostrarNotificacao('Erro ao excluir.', 'erro');
    }
  };

  // =======================================================
  // TOGGLE PIN STATUS (PIN)
  // =======================================================
  const toggleFixado = async (e, id, tipo) => {
    e.stopPropagation();

    const ordenarHistorico = (lista) => {
      return lista.sort((a, b) => {
        if (a.fixado && !b.fixado) return -1;
        if (!a.fixado && b.fixado) return 1;
        return b.ordem - a.ordem;
      });
    };

    try {
      if (tipo === 'simulacao') {
        await togglePinSimulacao(id);
        setHistoricoSimulacoes(prev => {
          const atualizada = prev.map(item => item.id === id ? { ...item, fixado: !item.fixado } : item);
          return ordenarHistorico(atualizada);
        });
      } else {
        await togglePinProjecao(id);
        setHistoricoProjecoes(prev => {
          const atualizada = prev.map(item => item.id === id ? { ...item, fixado: !item.fixado } : item);
          return ordenarHistorico(atualizada);
        });
      }
      mostrarNotificacao('Destaque atualizado!');
    } catch (error) {
      console.error(error);
      mostrarNotificacao('Erro ao atualizar destaque.', 'erro');
    }
  };

  // =======================================================
  // VIEW & EDIT CONTROLS
  // =======================================================
  const handleVerHistorico = (item) => {
    setDadosSelecionados(item);
    setPainelAtivo('resultado_view');
  };

  const iniciarEdicao = (e, item) => {
    e.stopPropagation();
    setEditandoId(item.id);
    setTextoEditado(item.descricao);
  };

  const salvarEdicao = async (e, id, tipo) => {
    e.stopPropagation();
    if (!textoEditado.trim()) return;

    try {
      if (tipo === 'simulacao') {
        await atualizarSimulacao(id, textoEditado);
        setHistoricoSimulacoes(prev =>
          prev.map(item => item.id === id ? { ...item, descricao: textoEditado } : item)
        );
      } else {
        await atualizarProjecao(id, textoEditado);
        setHistoricoProjecoes(prev =>
          prev.map(item => item.id === id ? { ...item, descricao: textoEditado } : item)
        );
      }

      if (dadosSelecionados?.id === id) {
        setDadosSelecionados(prev => ({ ...prev, descricao: textoEditado }));
      }

      setEditandoId(null);
      mostrarNotificacao('Descrição updated.');
    } catch (error) {
      console.error(error);
      mostrarNotificacao('Erro ao atualizar.', 'erro');
    }
  };

  // =======================================================
  // LOGIC HELPERS FOR CLEAN REPORT ABSTRACTIONS
  // =======================================================
  const extrairCaminhoDeSimulacao = () => {
    if (!dadosSelecionados || dadosSelecionados.tipo !== 'simulacao') return null;
    const original = dadosSelecionados.payloadCompleto;
    
    if (original.direcao === 'CLT_PARA_PJ') return 'Migração de CLT para PJ';
    if (original.direcao === 'PJ_PARA_CLT') return 'Comparação de Proposta CLT';
    if (original.direcao === 'META_PARA_PJ') return 'Cálculo de Meta de Ganhos';
    return 'Simulação de Contrato';
  };

  const extrairRotuloMontanteAvaliado = () => {
    if (!dadosSelecionados) return 'Valor Avaliado';
    
    if (dadosSelecionados.tipo === 'projecao') {
      const pDirecao = dadosSelecionados.payloadCompleto?.direcao;
      return pDirecao === 'INVERSA' ? 'Meta Alvo Definida' : 'Aporte Mensal Informado';
    }

    const sDirecao = dadosSelecionados.payloadCompleto?.direcao;
    if (sDirecao === 'CLT_PARA_PJ') return 'Salário CLT de Entrada';
    if (sDirecao === 'PJ_PARA_CLT') return 'Proposta PJ de Entrada';
    if (sDirecao === 'META_PARA_PJ') return 'Meta de Salário Líquido';
    return 'Montante Analisado';
  };

  const formatarValorTabela = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // =======================================================
  // RENDER INTERFACE (JSX)
  // =======================================================
  return (
    <div className={`dashboard-container ${!sidebarAberta ? 'sidebar-oculta' : ''}`}>

      {notificacao && (
        <div className={`toast-notificacao ${notificacao.tipo}`}>
          {notificacao.tipo === 'erro' && '⚠️ '}
          {notificacao.tipo === 'sucesso' && '✓ '}
          {notificacao.tipo === 'aviso' && 'ℹ️ '}
          {notificacao.mensagem}
        </div>
      )}

      <button
        className={`btn-toggle-sidebar ${!sidebarAberta ? 'menu-fechado' : ''}`}
        onClick={() => setSidebarAberta(!sidebarAberta)}
        title={sidebarAberta ? "Ocultar Menu" : "Exibir Menu"}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <h3>PJ vs CLT</h3>
        </div>

        <div className="sidebar-scroll-content">
          <nav className="sidebar-menu">
            <button
              className={`menu-item-base ${painelAtivo === 'inicio' ? 'active' : ''}`}
              onClick={() => { setPainelAtivo('inicio'); setDadosSelecionados(null); }}
            >
              Início
            </button>

            {/* SIMULATIONS DROPDOWN */}
            <div className="menu-section-dropdown">
              <button
                className={`menu-item-base ${historicoSimulacaoAberto ? 'expanded' : ''}`}
                onClick={() => setHistoricoSimulacaoAberto(!historicoSimulacaoAberto)}
              >
                <span>Simulações Salvas</span>
                <span className="arrow-indicator">{historicoSimulacaoAberto ? '▲' : '▼'}</span>
              </button>

              {historicoSimulacaoAberto && (
                <div className="sub-menu-list">
                  {historicoSimulacoes.map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      className={`sub-item-card ${dadosSelecionados?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleVerHistorico(item)}
                    >
                      {editandoId === item.id ? (
                        <input
                          type="text"
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          onBlur={(e) => salvarEdicao(e, item.id, 'simulacao')}
                          onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(e, item.id, 'simulacao')}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="input-edicao-sidebar"
                        />
                      ) : (
                        <>
                          <span className="item-text-title">
                            {item.fixado && '📌 '}
                            {item.descricao}
                          </span>

                          <div className="acoes-item-sidebar">
                            <button
                              className="btn-icon-inline"
                              onClick={(e) => toggleFixado(e, item.id, 'simulacao')}
                            >
                              📌
                            </button>
                            <button
                              className="btn-icon-inline"
                              onClick={(e) => sidebarAberta && iniciarEdicao(e, item)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon-inline danger"
                              onClick={(e) => apagarItem(e, item.id, 'simulacao')}
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {historicoSimulacoes.length === 0 && (
                    <span className="txt-vazio">Nenhum registro</span>
                  )}
                </div>
              )}
            </div>

            {/* PROJECTIONS DROPDOWN */}
            <div className="menu-section-dropdown">
              <button
                className={`menu-item-base ${historicoProjecaoAberto ? 'expanded' : ''}`}
                onClick={() => setHistoricoProjecaoAberto(!historicoProjecaoAberto)}
              >
                <span>Projeções Salvas</span>
                <span className="arrow-indicator">{historicoProjecaoAberto ? '▲' : '▼'}</span>
              </button>

              {historicoProjecaoAberto && (
                <div className="sub-menu-list">
                  {historicoProjecoes.map(item => (
                    <div
                      role="button"
                      tabIndex={0}
                      key={item.id}
                      className={`sub-item-card ${dadosSelecionados?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleVerHistorico(item)}
                    >
                      {editandoId === item.id ? (
                        <input
                          type="text"
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          onBlur={(e) => salvarEdicao(e, item.id, 'projecao')}
                          onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(e, item.id, 'projecao')}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="input-edicao-sidebar"
                        />
                      ) : (
                        <>
                          <span className="item-text-title">
                            {item.fixado && '📌 '}
                            {item.descricao}
                          </span>

                          <div className="acoes-item-sidebar">
                            <button
                              className="btn-icon-inline"
                              onClick={(e) => toggleFixado(e, item.id, 'projecao')}
                            >
                              📌
                            </button>
                            <button
                              className="btn-icon-inline"
                              onClick={(e) => sidebarAberta && iniciarEdicao(e, item)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon-inline danger"
                              onClick={(e) => apagarItem(e, item.id, 'projecao')}
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {historicoProjecoes.length === 0 && <span className="txt-vazio">Nenhum registro</span>}
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Painel de Planejamento Estratégico</h2>
          <div className="user-profile" onClick={() => setPainelUsuarioAberto(true)}>
            <div className="avatar">
              {nomeUsuario ? nomeUsuario.substring(0, 2).toUpperCase() : "GS"}
            </div>
          </div>
        </header>

        <section className="content-body">
          {painelAtivo === 'inicio' && (
            <div className="welcome-stage animation-blur-fade">
              <h1>Plataforma de Planejamento Financeiro</h1>
              <p>Escolha uma ferramenta abaixo ou gerencie seus relatórios salvos no menu lateral.</p>

              <div className="shortcut-grid">
                <div className="shortcut-card" onClick={() => setPainelAtivo('nova_simulacao')}>
                  <h2>Nova Simulação</h2>
                  <p>Calcule e compare propostas de trabalho sob regimes CLT vs PJ com impostos deduzidos.</p>
                  <span className="action-tag">Acessar Ferramenta →</span>
                </div>

                <div className="shortcut-card" onClick={() => setPainelAtivo('nova_projecao')}>
                  <h2>Nova Projeção</h2>
                  <p>Estime o crescimento real do seu patrimônio aplicando taxas de juros e a inflação oficial.</p>
                  <span className="action-tag">Acessar Ferramenta →</span>
                </div>
              </div>
            </div>
          )}

          {painelAtivo === 'nova_simulacao' && (
            <>
              {carregandoAPI && <div className="spinner-discreto">Calculando em tempo real no servidor...</div>}
              <div className={carregandoAPI ? "estado-carregando-suave" : "simulacao-wrapper-estavel"}>
                <SimulacaoForm
                  onSalvar={handleSalvarNoHistorico}
                  onValoresAlterados={setValoresFormulario}
                  resultadosAPI={resultadosAPI}
                  userId={userId}
                />
              </div>
            </>
          )}

          {painelAtivo === 'nova_projecao' && (
            <ProjecaoForm
              userId={userId}
              onSalvar={handleSalvarProjecaoNoHistorico}
            />
          )}

       {painelAtivo === 'resultado_view' && dadosSelecionados && (
            <div className="welcome-stage animation-blur-fade">
              <div className="stage-header">
                <div>
                  <span className="badge-tipo">
                    {dadosSelecionados.tipo === 'simulacao' ? 'Simulação de Contrato' : 'Projeção Patrimonial'}
                  </span>
                  <h1 style={{ marginTop: '8px' }}>{dadosSelecionados.descricao}</h1>
                </div>
                <button className="btn-voltar" onClick={() => { setPainelAtivo('inicio'); setDadosSelecionados(null); }}>
                  Fechar Relatório ×
                </button>
              </div>

              <div className="resultado-detalhado-box">
                <h3>Resumo Analítico da Consulta</h3>
                <hr />
                
                {/* CABEÇALHO GRID INTELIGENTE RESPONSIVO */}
                <div className="info-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', width: '100%', marginBottom: '20px' }}>
                  {dadosSelecionados.tipo === 'simulacao' ? (
                    <>
                      <div style={{ flex: '1 1 200px' }}>
                        <p style={{ margin: 0 }}><strong>Objetivo Analisado:</strong> {extrairCaminhoDeSimulacao()}</p>
                      </div>
                      <div style={{ flex: '1 1 200px', textAlign: 'center' }}>
                        <p style={{ margin: 0 }}><strong>{extrairRotuloMontanteAvaliado()}:</strong> {dadosSelecionados.valor}</p>
                      </div>
                      <div style={{ flex: '1 1 200px', textAlign: 'right' }}>
                        <p style={{ margin: 0 }}><strong>Regime Tributário:</strong> {dadosSelecionados.modalidade || 'Não aplicável'}</p>
                      </div>
                    </>
            ) : (
  <>
    <div style={{ flex: '1 1 250px' }}>
      <p style={{ margin: 0 }}>
        <strong>{extrairRotuloMontanteAvaliado()}:</strong>{" "}
        {formatarValorTabela(
          dadosSelecionados.payloadCompleto?.direcao === 'INVERSA'
            ? dadosSelecionados.payloadCompleto?.metaPatrimonio
            : dadosSelecionados.payloadCompleto?.aporteMensal
        )}
      </p>
    </div>

    <div style={{ flex: '1 1 250px', textAlign: 'right' }}>
  <p style={{ margin: 0 }}>
    <strong>Prazo Definido:</strong>{" "}
    {dadosSelecionados.payloadCompleto?.prazoAnos} anos
  </p>
</div>
  </>
)}
                  
                </div>

                {/* ======================================================= */}
                {/* CONTEÚDO SE FOR UMA SIMULAÇÃO DE CONTRATO (CLT vs PJ)   */}
                {/* ======================================================= */}
                {dadosSelecionados.tipo === 'simulacao' && dadosSelecionados.payloadCompleto && (() => {
                  const bruto = dadosSelecionados.payloadCompleto.faturamentoBrutoPj || dadosSelecionados.payloadCompleto.salarioDesejadoClt || 1;
                  const imposto = dadosSelecionados.payloadCompleto.impostoPj || dadosSelecionados.payloadCompleto.impostoClt || 0;
                  const reservas = dadosSelecionados.payloadCompleto.provisoesSimuladasPj || 0;
                  const liquido = dadosSelecionados.payloadCompleto.margemDisponivel || dadosSelecionados.payloadCompleto.salarioLiquidoClt || 0;

                  const pctImposto = (imposto / bruto) * 100;
                  const pctReservas = (reservas / bruto) * 100;
                  const pctLiquido = (liquido / bruto) * 100;

                  return (
                    <div className="resumo-grafico-container" style={{ width: '100%', maxWidth: '750px', margin: '30px auto 0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3 style={{ color: '#38bdf8', fontSize: '15px', fontWeight: '600', textAlign: 'left', letterSpacing: '0.5px' }}>
                        Distribuição do Faturamento Mensal
                      </h3>

                      <div style={{ width: '100%', height: '32px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                        {pctLiquido > 0 && <div style={{ width: `${pctLiquido}%`, backgroundColor: '#10b981', height: '100%' }} />}
                        {pctReservas > 0 && <div style={{ width: `${pctReservas}%`, backgroundColor: '#f59e0b', height: '100%' }} />}
                        {pctImposto > 0 && <div style={{ width: `${pctImposto}%`, backgroundColor: '#ef4444', height: '100%' }} />}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#94a3b8', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
                          <span>Faturamento Bruto Simulado (100%)</span>
                          <strong style={{ color: '#f8fafc' }}>{formatarValorTabela(bruto)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }} />
                            <span style={{ color: '#f8fafc' }}>(=) Líquido Real no Bolso ({pctLiquido.toFixed(1)}%)</span>
                          </div>
                          <strong style={{ color: '#10b981', fontSize: '14.5px' }}>{formatarValorTabela(liquido)}</strong>
                        </div>
                        {reservas > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '3px' }} />
                              <span style={{ color: '#94a3b8' }}>(-) Reservas Recomendadas ({pctReservas.toFixed(1)}%)</span>
                            </div>
                            <strong style={{ color: '#f59e0b' }}>{formatarValorTabela(reservas)}</strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }} />
                            <span style={{ color: '#94a3b8' }}>(-) Encargos e Impostos ({pctImposto.toFixed(1)}%)</span>
                          </div>
                          <strong style={{ color: '#ef4444' }}>{formatarValorTabela(imposto)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

{/* ======================================================= */}
                {/* CONTEÚDO SE FOR UMA PROJEÇÃO PATRIMONIAL                */}
                {/* ======================================================= */}
                {dadosSelecionados.tipo === 'projecao' && dadosSelecionados.payloadCompleto && (() => {
                 const data = dadosSelecionados.payloadCompleto;

// 1. PRAZO GARANTIDO EM MESES
const prazoMesesValido = data.prazoMeses && data.prazoMeses > 0 
  ? data.prazoMeses 
  : (data.prazoAnos ? data.prazoAnos * 12 : 120);

const prazoAnosValido = data.prazoAnos || Math.ceil(prazoMesesValido / 12);

// 2. CAPTURA DO PODER DE COMPRA REAL (O valor de R$ 152.498,35)
const poderCompraReal = data.montanteReal || data.patrimonioFinalAcumulado || 0;

// 3. CAPTURA DO APORTE MENSAL CORRETO (O valor de R$ 1.000,00)
const aporteUtilizado = data.aporteMensal || data.aporteMensalNecessario || 1000;

// 4. TOTAL INVESTIDO REAIS (1.000 * 120 meses = R$ 120.000,00)
const totalInvestido = data.totalInvestidoSemJuros || (aporteUtilizado * prazoMesesValido) || 120000;

// 5. JUROS REAIS GANHOS (Poder de Compra Real - Total Investido)
// R$ 152.498,35 - R$ 120.000,00 = R$ 32.498,35 de ganho acima da inflação
const totalJuros = poderCompraReal - totalInvestido;
const rendimentoBruto =
  (data.montanteNominal || 0) - totalInvestido;
                  return (
                    <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      
                      {/* 1. GRID DE KPIS SUPERIORES RÁPIDOS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        
                        {/* CARD 1: PRAZO TOTAL */}
                       {/* CARD 1: SALDO BRUTO */}
<div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #38bdf8' }}>
  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>
    Saldo Bruto Projetado
  </span>
  <strong style={{ fontSize: '18px', color: '#f8fafc' }}>
    {formatarValorTabela(data.montanteNominal)}
  </strong>

  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
    Antes da inflação
  </span>
</div>

<div style={{
  backgroundColor: '#1e293b',
  padding: '15px',
  borderRadius: '6px',
  borderLeft: '4px solid #38bdf8'
}}>
  <span style={{
    fontSize: '12px',
    color: '#94a3b8',
    display: 'block',
    marginBottom: '5px'
  }}>
    Rendimento Bruto
  </span>

  <strong style={{
    fontSize: '18px',
    color: '#38bdf8'
  }}>
    {formatarValorTabela(rendimentoBruto)}
  </strong>

  <span style={{
    fontSize: '11px',
    color: '#64748b',
    display: 'block'
  }}>
    Antes da inflação
  </span>
</div>

                        {/* CARD 3 (VERDE): PODER DE COMPRA REAL */}
                        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Poder de Compra Real</span>
                          <strong style={{ fontSize: '18px', color: '#10b981' }}>{formatarValorTabela(poderCompraReal)}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Aporte: {formatarValorTabela(aporteUtilizado)}/mês</span>
                        </div>

                        {/* CARD 3: TOTAL EM JUROS REAL */}
                        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Rendimento Real Acumulado</span>
                          <strong style={{ fontSize: '18px', color: '#f59e0b' }}>{formatarValorTabela(totalJuros)}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>(Acima da inflação)</span>
                        </div>
                        
                      </div>

                      {/* 2. GRÁFICO DE EVOLUÇÃO INTERATIVO */}
                      <div style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '5px' }}>
                        <HistoricoChart item={dadosSelecionados} />
                      </div>



                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </section>

        {painelUsuarioAberto && (
          <>
            <div className="overlay-usuario" onClick={() => setPainelUsuarioAberto(false)} />

            <aside className="painel-usuario">
              <button className="btn-fechar-painel" onClick={() => setPainelUsuarioAberto(false)}>✕</button>

              <div className="perfil-header">
                <div className="avatar-grande">
                  {nomeUsuario ? nomeUsuario.substring(0, 2).toUpperCase() : "GS"}
                </div>
                <div className="perfil-info">
                  <h3>{nomeUsuario || "Usuário"}</h3>
                  <span className="user-email">{emailUsuario || "email@usuario.com"}</span>
                </div>
              </div>

              <div className="bloco-config">
                <h4>Aparência</h4>
                <button className="toggle-theme" onClick={alternarTema}>
                  ☀️ <span>{tema === "dark" ? "Modo Escuro" : "Modo Claro"}</span>
                </button>
              </div>

              <div className="bloco-config">
                <h4>Dados do usuário</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <input 
                    type="text" 
                    value={nomeUsuario} 
                    onChange={(e) => setNomeUsuario(e.target.value)} 
                    placeholder="Nome"
                    className="input-perfil-usuario"
                  />
                  <input 
                    type="email" 
                    value={emailUsuario} 
                    onChange={(e) => setEmailUsuario(e.target.value)} 
                    placeholder="E-mail"
                    className="input-perfil-usuario"
                  />
                  <button onClick={salvarDadosUsuario} className="btn-salvar-usuario">Salvar Alterações</button>
                  
                </div>
              </div>
<button
  className="btn-ajuda"
  onClick={abrirAjuda}
>
  ❓ Central de Ajuda
</button>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button className="btn-logout-sidebar" onClick={onLogout}>Desconectar Conta</button>
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}