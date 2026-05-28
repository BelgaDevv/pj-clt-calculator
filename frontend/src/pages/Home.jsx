import React, { useState, useEffect, useRef } from 'react';
import SimulacaoForm from '../components/SimulacaoForm';
import ProjecaoForm from '../components/ProjecaoForm';
import HistoricoChart from '../components/HistoricoChart';
import '../styles/Home.css';

export default function Home({ userId, onLogout }) {
  const timeoutNotificacao = useRef(null);
  
  console.log("USER ID NO PAINEL HOME:", userId);

  // --- ESTADOS DE NAVEGAÇÃO E INTERFACE ---
  const [painelAtivo, setPainelAtivo] = useState('inicio');
  const [dadosSelecionados, setDadosSelecionados] = useState(null);
  const [historicoSimulacaoAberto, setHistoricoSimulacaoAberto] = useState(false);
  const [historicoProjecaoAberto, setHistoricoProjecaoAberto] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(true);

  // --- ESTADOS DE EDIÇÃO E NOTIFICAÇÃO ---
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');
  const [notificacao, setNotificacao] = useState(null);

  // --- ESTADOS DO MOTOR DE CÁLCULO ---
  const [valoresFormulario, setValoresFormulario] = useState({
    salarioBruto: 0,
    beneficios: 0,
    faturamentoPJ: 0,
    gastosContador: 0
  });
  const [resultadosAPI, setResultadosAPI] = useState(null);
  const [carregandoAPI, setCarregandoAPI] = useState(false);

  // --- LISTAS DE HISTÓRICO (ALIMENTADAS PELO BANCO) ---
  const [historicoSimulacoes, setHistoricoSimulacoes] = useState([]);
  const [historicoProjecoes, setHistoricoProjecoes] = useState([]);

  // Função disparadora de Toasts elegantes
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
  // CARGA INICIAL: CARREGA O HISTÓRICO DO BANCO DE DADOS
  // =======================================================
  useEffect(() => {
    if (!userId) return;

    const carregarHistoricosDoBanco = async () => {
      try {
        // 1. Histórico de Simulações
        const resSimulacoes = await fetch(`http://localhost:8080/api/simulations/history/${userId}`);
        if (resSimulacoes.ok) {
          const dadosSimu = await resSimulacoes.json();
          const itensFormatados = dadosSimu.map(item => ({
            id: item.id ?? crypto.randomUUID(),
            tipo: 'simulacao',
            descricao: item.descricao || "Simulação Arquivada",
            modalidade: item.regimePjEscolhido || 'CLT',
            valor: new Intl.NumberFormat('pt-BR').format(
              item.faturamentoBrutoPj || item.salarioDesejadoClt || item.margemDisponivel || 0
            ),
            payloadCompleto: item
          }));
          setHistoricoSimulacoes(itensFormatados);
        }

        // 2. Histórico de Projeções
        const resProjecoes = await fetch(`http://localhost:8080/api/projections/history/${userId}`);
        if (resProjecoes.ok) {
          const dadosProj = await resProjecoes.json();
          const itensFormatadosProj = dadosProj.map(item => ({
            id: item.id ?? crypto.randomUUID(),
            tipo: 'projecao',
            descricao: item.descricao || "Projeção Arquivada",
            valor: new Intl.NumberFormat('pt-BR').format(
              item.montanteReal || item.aporteMensalNecessario || 0
            ),
            payloadCompleto: item
          }));
          setHistoricoProjecoes(itensFormatadosProj);
        }
      } catch (error) {
        console.error("Erro ao buscar registros iniciais:", error);
      }
    };

    carregarHistoricosDoBanco();
  }, [userId]);

  // ==========================================
  // DEBOUNCE DO MOTOR DE CÁLCULO EM TEMPO REAL
  // ==========================================
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

  // ==========================================
  // ATUALIZAÇÃO IMEDIATA DO HISTÓRICO (SEM F5)
  // ==========================================
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
      payloadCompleto: novaSimulacao
    };

    // CORREÇÃO CRÍTICA: Agora adiciona em simulacoes de verdade (no topo da lista)
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
      valor: new Intl.NumberFormat('pt-BR').format(
        novaProjecao.montanteReal || novaProjecao.aporteMensalNecessario || 0
      ),
      payloadCompleto: novaProjecao
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

  const handleVerHistorico = (item) => {
    setDadosSelecionados(item);
    setPainelAtivo('resultado_view');
  };

  const iniciarEdicao = (e, item) => {
    e.stopPropagation(); 
    setEditandoId(item.id);
    setTextoEditado(item.descricao);
  };

  const salvarEdicao = (e, id, tipo) => {
    e.stopPropagation();
    if (!textoEditado.trim()) return;

    if (tipo === 'simulacao') {
      setHistoricoSimulacoes(prev =>
        prev.map(item => item.id === id ? { ...item, descricao: textoEditado } : item)
      );
    } else {
      setHistoricoProjecoes(prev =>
        prev.map(item => item.id === id ? { ...item, descricao: textoEditado } : item)
      );
    }

    if (dadosSelecionados && dadosSelecionados.id === id) {
      setDadosSelecionados({ ...dadosSelecionados, descricao: textoEditado });
    }
    setEditandoId(null);
  };

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

            {/* DROPDOWN SIMULAÇÕES */}
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
                  {historicoSimulacoes.map(item => (
                    <div 
                      key={item.id} 
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
                          <span className="item-text-title">{item.descricao}</span>
                          <button className="btn-edit-inline" onClick={(e) => iniciarEdicao(e, item)}>✏️</button>
                        </>
                      )}
                    </div>
                  ))}
                  {historicoSimulacoes.length === 0 && <span className="txt-vazio">Nenhuma simulação</span>}
                </div>
              )}
            </div>

            {/* DROPDOWN PROJEÇÕES */}
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
                          <span className="item-text-title">{item.descricao}</span>
                          <button className="btn-edit-inline" onClick={(e) => iniciarEdicao(e, item)}>✏️</button>
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

        <button className="btn-logout" onClick={onLogout}>Sair</button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Painel de Análise Analítica</h2>
          <div className="user-profile">
            <strong>Usuário Ativo</strong>
            <div className="avatar"></div>
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
            <div className={carregandoAPI ? "estado-carregando-suave" : ""}>
              {carregandoAPI && <div className="spinner-discreto">Calculando em tempo real no servidor...</div>}
              <SimulacaoForm 
                onSalvar={handleSalvarNoHistorico} 
                onValoresAlterados={setValoresFormulario} 
                resultadosAPI={resultadosAPI}
                userId={userId} 
              />
            </div>
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
      </main>
    </div>
  );
}