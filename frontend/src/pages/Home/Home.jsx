import React, { useState, useEffect, useRef } from 'react';
import SimulacaoForm from "../../components/SimulacaoForm/SimulacaoForm.jsx";
import ProjecaoForm from "../../components/ProjecaoForm/ProjecaoForm.jsx";
import HistoricoChart from "../../components/HistoricoChart/HistoricoChart.jsx";
import './Home.css';

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

export default function Home({ userId, onLogout }) {
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
    gastosContador: 0
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

        console.table(
  dadosSimu.map(x => ({
    id: x.id,
    descricao: x.descricao,
    fixado: x.fixado,
    ordem: x.ordem
  }))
);

        const itensFormatados = dadosSimu.map(item => ({
          id: item.id ?? crypto.randomUUID(),
          tipo: 'simulacao',
          descricao: item.descricao || "Simulação Arquivada",
          modalidade: item.regimePjEscolhido || 'CLT',
          valor: new Intl.NumberFormat('pt-BR').format(
            item.faturamentoBrutoPj || item.salarioDesejadoClt || item.margemDisponivel || 0
          ),
          payloadCompleto: item,
          fixado: item.fixado || false,
         ordem: new Date(item.dataSimulacao).getTime()
        }));

        // Applies initial sorting putting pinned items at the top
        const listaOrdenadaSimu = itensFormatados.sort((a, b) => {
          if (a.fixado && !b.fixado) return -1;
          if (!a.fixado && b.fixado) return 1;
          return b.ordem - a.ordem;
        });
        setHistoricoSimulacoes(listaOrdenadaSimu);

        // 2. Projection History
        const dadosProj = await buscarHistoricoProjecoes(userId);
        const itensFormatadosProj = dadosProj.map(item => ({
          id: item.id ?? crypto.randomUUID(),
          tipo: 'projecao',
          descricao: item.descricao || "Projeção Arquivada",
          valor: new Intl.NumberFormat('pt-BR').format(
            item.montanteReal || item.aporteMensalNecessario || 0
          ),
          payloadCompleto: item,
          fixado: item.fixado || false,
          ordem: new Date(item.dataSimulacao).getTime()
        }));

        // Applies initial sorting putting pinned items at the top
        const listaOrdenadaProj = itensFormatadosProj.sort((a, b) => {
          if (a.fixado && !b.fixado) return -1;
          if (!a.fixado && b.fixado) return 1;
          return b.ordem - a.ordem;
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
  //uddate user data on backend
  // =======================================================
const [nomeUsuario, setNomeUsuario] = useState("");


const carregarUsuario = async () => {
  try {
    if (!userId) return;

    const usuario = await buscarUsuario(userId);
console.log("Usuario recebido:", usuario);
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

    mostrarNotificacao(
      "Dados atualizados com sucesso!"
    );

  } catch {

    mostrarNotificacao(
      "Erro ao salvar.",
      "erro"
    );

  }
};

 // =======================================================
  //theme
  // =======================================================

const alternarTema = () => {
  const novoTema =
    tema === "dark"
      ? "light"
      : "dark";

  setTema(novoTema);

  localStorage.setItem(
    "tema",
    novoTema
  );
};

   


useEffect(() => {
  document.body.setAttribute(
    "data-theme",
    tema
  );
}, [tema]);


  // =======================================================
  // IMMEDIATE UPDATE OF SIMULATION HISTORY
  // =======================================================
  const handleSalvarNoHistorico = (novaSimulacao) => {
    if (historicoSimulacoes.length >= 12) {
      mostrarNotificacao('Limite máximo de 12 simulações atingido.', 'erro');
      return;
    }

    const formatador = new Intl.NumberFormat('pt-BR');
    const valorPrincipal = novaSimulacao.faturamentoBrutoPj
      ? formatador.format(novaSimulacao.faturamentoBrutoPj)
      : formatador.format(novaSimulacao.salarioDesejadoClt || 0);

    const novoItemCard = {
      id: novaSimulacao.id ?? crypto.randomUUID(),
      tipo: 'simulacao',
      descricao: novaSimulacao.descricao || 'Nova Simulação',
      modalidade: novaSimulacao.resultados?.melhorOpcao || 'CLT',
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
  // TOGGLE PIN STATUS (PIN) WITH REORDERING
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
  // IMMEDIATE UPDATE OF PROJECTION HISTORY
  // =======================================================
  const handleSalvarProjecaoNoHistorico = (novaProjecao) => {
    if (historicoProjecoes.length >= 12) {
      mostrarNotificacao('Limite máximo de 12 projeções atingido.', 'erro');
      return;
    }

    const novoItemCard = {
      id: novaProjecao.id ?? crypto.randomUUID(),
      tipo: 'projecao',
      descricao: novaProjecao.descricao || 'Projeção',
      valor: new Intl.NumberFormat('pt-BR').format(
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
  // DETAILS VIEW CONTROL
  // =======================================================
  const handleVerHistorico = (item) => {
    setDadosSelecionados(item);
    setPainelAtivo('resultado_view');
  };

  // =======================================================
  // ITEM DESCRIPTION EDIT MANAGEMENT
  // =======================================================
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
  // COMPONENT RENDERING (JSX STRUCTURE)
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
                <span>Simulação</span>
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
                    <span className="txt-vazio">Nenhuma simulação</span>
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
                <span>Projeção</span>
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
                  {historicoProjecoes.length === 0 && <span className="txt-vazio">Nenhuma projeção</span>}
                </div>
              )}
            </div>
          </nav>
        </div>

       
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Painel de Análise Analítica</h2>
    <div
  className="user-profile"
  onClick={() => setPainelUsuarioAberto(true)}
>
  <div className="avatar">
    {nomeUsuario
      ? nomeUsuario.substring(0, 2).toUpperCase()
      : "GS"}
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
                  <span className="badge-tipo">{dadosSelecionados.tipo.toUpperCase()}</span>
                  <h1 style={{ marginTop: '8px' }}>{dadosSelecionados.descricao}</h1>
                </div>
                <button className="btn-voltar" onClick={() => { setPainelAtivo('inicio'); setDadosSelecionados(null); }}>Fechar Relatório ×</button>
              </div>

              <div className="resultado-detalhado-box">
                <h3>Resumo Analítico da Consulta</h3>
                <hr />
                <div className="info-row">
                  {dadosSelecionados.modalidade && <p><strong>Regime Contratual:</strong> {dadosSelecionados.modalidade}</p>}
                  {dadosSelecionados.valor && <p><strong>Montante Avaliado:</strong> R$ {dadosSelecionados.valor}</p>}
                </div>
                <div style={{ marginTop: '20px' }}>
                  <HistoricoChart item={dadosSelecionados} />
                </div>
              </div>
            </div>
          )}
        </section>

        {painelUsuarioAberto && (
  <>
    <div
      className="overlay-usuario"
      onClick={() => setPainelUsuarioAberto(false)}
    />

    <aside className="painel-usuario">
      <button
        className="btn-fechar-painel"
        onClick={() => setPainelUsuarioAberto(false)}
      >
        ✕
      </button>

      <div className="perfil-header">
        <div className="avatar-grande">
          {nomeUsuario
            ? nomeUsuario.substring(0, 2).toUpperCase()
            : "GS"}
        </div>

<div className="perfil-info">
  <h3>{nomeUsuario || "Usuário"}</h3>

  <span className="user-email">
    {emailUsuario || "email@usuario.com"}
  </span>
</div>
      </div>

      <div className="bloco-config">
        <h4>Aparência</h4>

        <button
          className="toggle-theme"
          onClick={alternarTema}
        >
          ☀️
          <span>
            {tema === "dark"
              ? "Modo Escuro"
              : "Modo Claro"}
          </span>
        </button>
      </div>

      <div className="bloco-config">
        <h4>Dados do usuário</h4>

      
<input
  type="text"
  value={nomeUsuario}
  onChange={(e) => setNomeUsuario(e.target.value)}
  placeholder="Nome"
/>

<input
  type="email"
  value={emailUsuario}
  onChange={(e) => setEmailUsuario(e.target.value)}
  placeholder="Email"
/>


       <button
  className="btn-salvar-usuario"
  onClick={salvarDadosUsuario}
>
  Salvar Alterações
</button>
      </div>

      <div
  className="item-menu-painel"
  onClick={() => setPainelAtivo("ajuda")}
>
  <span>❓</span>
  <span>Ajuda</span>
</div>

<div
  className="item-menu-painel sair"
  onClick={onLogout}
>
  <span>🚪</span>
  <span>Sair</span>
</div>
    </aside>
  </>
)}
      </main>
    </div>
  );
}