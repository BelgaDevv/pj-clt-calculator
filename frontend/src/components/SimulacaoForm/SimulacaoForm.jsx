import React, { useState, useEffect } from 'react';
import "./SimulacaoForm.css";
import { calcularSimulacao, salvarSimulacao } from '../../services/api';

export default function SimulacaoForm({ onSalvar, dadosCarregados, userId }) {
  // --- STATE MANAGEMENT ---
  const [caminhoAtivo, setCaminhoAtivo] = useState('clt_to_pj');
  const [tituloSimulacao, setTituloSimulacao] = useState('');
  const [resultados, setResultados] = useState(null);
  const [editandoHistorico, setEditandoHistorico] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // --- FORM INPUT FIELDS STATES ---
  const [salarioCLT, setSalarioCLT] = useState('5000');
  const [valeAlimentacao, setValeAlimentacao] = useState('600');
  const [valeTransporte, setValeTransporte] = useState('300');
  const [faturamentoPJ, setFaturamentoPJ] = useState('10000');
  const [metaLiquida, setMetaLiquida] = useState('4000');
  const [regimePJ, setRegimePJ] = useState('ME');
  const [proLaborePct, setProlaborePct] = useState('28');

  // --- HISTORIC ENTRY RECORD RESTORATION ---
  useEffect(() => {
    if (dadosCarregados) {
      setCaminhoAtivo(
        dadosCarregados.direcao === 'CLT_PARA_PJ' ? 'clt_to_pj'
        : dadosCarregados.direcao === 'PJ_PARA_CLT' ? 'pj_to_clt' 
        : 'meta_to_pj'
      );
      setTituloSimulacao(dadosCarregados.descricao || '');
      setSalarioCLT(dadosCarregados.salarioDesejadoClt || '');
      setValeAlimentacao(dadosCarregados.valeAlimentacao || '');
      setValeTransporte(dadosCarregados.valeTransporte || '');
      setFaturamentoPJ(dadosCarregados.faturamentoBrutoPj || '');
      setRegimePJ(dadosCarregados.regimePjEscolhido || 'ME');
      setProlaborePct(
        dadosCarregados.proLaborePercentual
          ? dadosCarregados.proLaborePercentual * 100 
          : '28'
      );
      setResultados(dadosCarregados);
      setEditandoHistorico(true);
    }
  }, [dadosCarregados]);

  // --- STATE MAPPER HELPERS ---
  const mapearDirecao = () => {
    if (caminhoAtivo === 'clt_to_pj') return 'CLT_PARA_PJ';
    if (caminhoAtivo === 'pj_to_clt') return 'PJ_PARA_CLT';
    return 'META_PARA_PJ';
  };

  const mapearRegime = () => {
    return regimePJ === 'MEI' ? 'MEI' : 'ME';
  };

  // --- RECTIVE SIMULATION ENGINE HOOK ---
  useEffect(() => {
    if (editandoHistorico) return;

    const calcularAutomaticamente = async () => {
      try {
        setCarregando(true);
        const payload = {
          userId,
          descricao: tituloSimulacao,
          direcao: mapearDirecao(),
          regimePjEscolhido: mapearRegime(),
          salarioDesejadoClt: caminhoAtivo === 'clt_to_pj' ? parseFloat(salarioCLT) || null : null,
          valeAlimentacao: parseFloat(valeAlimentacao) || 0,
          valeTransporte: parseFloat(valeTransporte) || 0,
          proLaborePercentual: mapearRegime() === 'ME' ? parseFloat(proLaborePct) / 100 : null,
          faturamentoBrutoPj: caminhoAtivo === 'pj_to_clt' ? parseFloat(faturamentoPJ) || null : null,
          margemDesejada: caminhoAtivo === 'meta_to_pj' ? parseFloat(metaLiquida) || null : null,
        };

        const resposta = await calcularSimulacao(payload);
        setResultados(resposta);
        setErro(null);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    calcularAutomaticamente();
  }, [
    caminhoAtivo,
    salarioCLT,
    valeAlimentacao,
    valeTransporte,
    faturamentoPJ,
    metaLiquida,
    regimePJ,
    proLaborePct
  ]);

  // --- SUBMIT TO HISTORIC LOG STORAGE ---
  const handleSalvarSimulacao = async () => {
    if (!resultados) {
      setErro('Realize o cálculo antes de salvar.');
      return;
    }

    if (!tituloSimulacao.trim()) {
      setErro('Dê um nome para a sua simulação antes de salvar.');
      return;
    }

    try {
      const payload = {
        userId,
        descricao: tituloSimulacao,
        direcao: mapearDirecao(),
        regimePjEscolhido: mapearRegime(),
        salarioDesejadoClt: caminhoAtivo === 'clt_to_pj' ? parseFloat(salarioCLT) || null : null,
        valeAlimentacao: parseFloat(valeAlimentacao) || 0,
        valeTransporte: parseFloat(valeTransporte) || 0,
        proLaborePercentual: mapearRegime() === 'ME' ? parseFloat(proLaborePct) / 100 : null,
        faturamentoBrutoPj: caminhoAtivo === 'pj_to_clt' ? parseFloat(faturamentoPJ) || null : null,
        margemDesejada: caminhoAtivo === 'meta_to_pj' ? parseFloat(metaLiquida) || null : null,
      };

      const simulacaoSalva = await salvarSimulacao(payload);

      onSalvar({
        ...simulacaoSalva,
        tipo: 'simulacao',
      });

      setErro(null);
    } catch (e) {
      setErro(e.message);
    }
  };

  // --- UTILS ---
  const formatarMoeda = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- REACTIVE VERTICAL GRAPH HEIGHT COMPUTER ---
  const faturamentoTotal = resultados?.faturamentoBrutoPj || 0;
  
  const calcularAlturaBarra = (valorCategoria) => {
    if (!faturamentoTotal || !valorCategoria) return '0%';
    const pct = (valorCategoria / faturamentoTotal) * 100;
    return `${Math.min(100, Math.max(0, pct))}%`;
  };

  return (
    <div className="simulacao-container">
      {/* TABS CONTROLLER NAVIGATION */}
      <div className="direcionamento-abas">
        <button
          type="button"
          disabled={editandoHistorico}
          className={`aba-filtro ${caminhoAtivo === 'clt_to_pj' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('clt_to_pj')}
        >
          <span className="aba-titulo">Qurow migrar para PJ</span>
          <span className="aba-subtitulo">(CLT → PJ)</span>
        </button>
        <button
          type="button"
          disabled={editandoHistorico}
          className={`aba-filtro ${caminhoAtivo === 'pj_to_clt' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('pj_to_clt')}
        >
          <span className="aba-titulo">Já sou PJ / Recebi Proposta</span>
          <span className="aba-subtitulo">(PJ → CLT)</span>
        </button>
        <button
          type="button"
          disabled={editandoHistorico}
          className={`aba-filtro ${caminhoAtivo === 'meta_to_pj' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('meta_to_pj')}
        >
          <span className="aba-titulo">Definir Meta Líquida</span>
          <span className="aba-subtitulo">(Meta → PJ)</span>
        </button>
      </div>

      {/* ARCHIVE TITLE ACTION FIELD */}
      <div className="titulo-salvamento-row">
        <input
          type="text"
          placeholder="Dê um nome para arquivar este cenário..."
          value={tituloSimulacao}
          onChange={(e) => setTituloSimulacao(e.target.value)}
          className="input-titulo-simulacao"
          disabled={editandoHistorico}
        />
        <button
          type="button"
          onClick={handleSalvarSimulacao}
          className="btn-salvar-historico"
          disabled={editandoHistorico || !resultados}
        >
          {editandoHistorico ? '🔒 Histórico Arquivado' : '💾 Salvar Análise'}
        </button>
      </div>

      {/* REACTIVE ERR DISPLAY WRAPPER */}
      {erro && <div className="erro-inline">⚠ {erro}</div>}

      {/* CORE CONTENT LAYOUT GRID */}
      <div className="simulacao-grid-operacional">
        {/* INPUT STATIONS FORM SECTION */}
        <div className="card-formulario-entradas">
          <div className="secao-form-titulo">CAIXAS DE ENTRADA</div>
          <fieldset
            disabled={editandoHistorico}
            style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {caminhoAtivo === 'clt_to_pj' && (
              <>
                <span className="subtitulo-caixa">DADOS DA CLT (Entrada)</span>
                <div className="grupo-input">
                  <label>Salário Desejado CLT (R$)</label>
                  <input
                    type="number"
                    value={salarioCLT}
                    onChange={(e) => setSalarioCLT(e.target.value)}
                  />
                </div>
                <div className="grupo-input">
                  <label>Vale Alimentação (R$)</label>
                  <input
                    type="number"
                    value={valeAlimentacao}
                    onChange={(e) => setValeAlimentacao(e.target.value)}
                  />
                </div>
                <div className="grupo-input">
                  <label>Vale Transporte (R$)</label>
                  <input
                    type="number"
                    value={valeTransporte}
                    onChange={(e) => setValeTransporte(e.target.value)}
                  />
                </div>
              </>
            )}

            {caminhoAtivo === 'pj_to_clt' && (
              <>
                <span className="subtitulo-caixa">DADOS DO CONTRATO PJ (Entrada)</span>
                <div className="grupo-input">
                  <label>Faturamento Bruto PJ (R$)</label>
                  <input
                    type="number"
                    value={faturamentoPJ}
                    onChange={(e) => setFaturamentoPJ(e.target.value)}
                  />
                </div>
              </>
            )}

            {caminhoAtivo === 'meta_to_pj' && (
              <>
                <span className="subtitulo-caixa">META LÍQUIDA DESEJADA (Entrada)</span>
                <div className="grupo-input">
                  <label>Margem Líquida Desejada (R$)</label>
                  <input
                    type="number"
                    value={metaLiquida}
                    onChange={(e) => setMetaLiquida(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="divisor-interno-form"></div>
            <span className="subtitulo-caixa">Configuração Tributária PJ</span>
            
            <div className="grupo-input">
              <label>Regime PJ</label>
              <select value={regimePJ} onChange={(e) => setRegimePJ(e.target.value)}>
                <option value="ME">Simples Nacional (ME)</option>
                <option value="MEI">MEI (Microempreendedor Individual)</option>
              </select>
            </div>

            {regimePJ === 'ME' && (
              <div className="grupo-input">
                <label>Pró-labore % (Estratégia Fator R)</label>
                <input
                  type="number"
                  value={proLaborePct}
                  onChange={(e) => setProlaborePct(e.target.value)}
                />
              </div>
            )}
          </fieldset>

          <p className="legenda-automatica">
            *Os resultados são atualizados automaticamente conforme os parâmetros*
          </p>
        </div>

        {/* OUTPUT ANALYSIS LOG METRICS CARD */}
        <div className="card-painel-resultados">
          <div className="secao-form-titulo">CAIXAS DE SAÍDA</div>

          <div className="dados-analise-renderizados">
            <span className="subtitulo-caixa">Resultados Analíticos</span>

            <div className="bloco-saida-linha principal">
              <span className="label-saida">Faturamento Bruto PJ</span>
              <span className="valor-saida destacado">
                {formatarMoeda(resultados?.faturamentoBrutoPj)}
              </span>
            </div>
            <div className="bloco-saida-linha">
              <span className="label-saida">Imposto Mensal</span>
              <span className="valor-saida valor-imposto">
                {formatarMoeda(resultados?.impostoPj)}
              </span>
            </div>
            <div className="bloco-saida-linha">
              <span className="label-saida">Provisões CLT Diluídas</span>
              <span className="valor-saida valor-provisao">
                {formatarMoeda(resultados?.provisoesSimuladasPj)}
              </span>
            </div>
            <div className="bloco-saida-linha final">
              <span className="label-saida">Margem Disponível Líquida</span>
              <span className="valor-saida valor-margem">
                {formatarMoeda(resultados?.margemDisponivel)}
              </span>
            </div>

            {/* CUSTOM NATIVE VERTICAL GRAPH BLOCK EXTRACTIONS */}
            {resultados && (
              <div className="mini-grafico-secao">
                <div className="mini-grafico-container">
                  <div
                    className="barra-grafico imposto"
                    style={{ height: calcularAlturaBarra(resultados?.impostoPj) }}
                    title={`Imposto: ${formatarMoeda(resultados?.impostoPj)}`}
                  />
                  <div
                    className="barra-grafico provisao"
                    style={{ height: calcularAlturaBarra(resultados?.provisoesSimuladasPj) }}
                    title={`Provisões: ${formatarMoeda(resultados?.provisoesSimuladasPj)}`}
                  />
                  <div
                    className="barra-grafico margem"
                    style={{ height: calcularAlturaBarra(resultados?.margemDisponivel) }}
                    title={`Margem: ${formatarMoeda(resultados?.margemDisponivel)}`}
                  />
                </div>

                <div className="mini-grafico-legendas">
                  <div className="legenda-item">
                    <span className="dot imposto"></span> Imposto
                  </div>
                  <div className="legenda-item">
                    <span className="dot provisao"></span> Provisões
                  </div>
                  <div className="legenda-item">
                    <span className="dot margem"></span> Margem Líquida
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTEXT FLIPPER COMPONENT BACK CONTROLLER */}
      {editandoHistorico && (
        <button
          type="button"
          className="btn-voltar-painel"
          onClick={() => window.location.reload()}
          style={{
            marginTop: '15px',
            backgroundColor: '#334155',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ← Nova Simulação
        </button>
      )}
    </div>
  );
}