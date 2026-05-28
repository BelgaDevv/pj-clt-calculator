import React, { useState, useEffect } from 'react';
import '../styles/SimulacaoForm.css';
import {
  calcularSimulacao,
  salvarSimulacao
} from '../services/api';

export default function SimulacaoForm({ onSalvar, dadosCarregados, userId }) {
  const [caminhoAtivo, setCaminhoAtivo] = useState('clt_to_pj');
  const [tituloSimulacao, setTituloSimulacao] = useState('');
  const [resultados, setResultados] = useState(null);
  const [editandoHistorico, setEditandoHistorico] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // --- ESTADOS DOS INPUTS ---
  const [salarioCLT, setSalarioCLT] = useState('5000');
  const [valeAlimentacao, setValeAlimentacao] = useState('600');
  const [valeTransporte, setValeTransporte] = useState('300');
  const [faturamentoPJ, setFaturamentoPJ] = useState('10000');
  const [metaLiquida, setMetaLiquida] = useState('4000');
  const [regimePJ, setRegimePJ] = useState('ME');
  const [proLaborePct, setProlaborePct] = useState('28');



  // --- DETECTOR DE REABERTURA DE HISTÓRICO ---
  useEffect(() => {
    if (dadosCarregados) {
      setCaminhoAtivo(dadosCarregados.direcao === 'CLT_PARA_PJ' ? 'clt_to_pj' 
        : dadosCarregados.direcao === 'PJ_PARA_CLT' ? 'pj_to_clt' : 'meta_to_pj');
      setTituloSimulacao(dadosCarregados.descricao || '');
      setSalarioCLT(dadosCarregados.salarioDesejadoClt || '');
      setValeAlimentacao(dadosCarregados.valeAlimentacao || '');
      setValeTransporte(dadosCarregados.valeTransporte || '');
      setFaturamentoPJ(dadosCarregados.faturamentoBrutoPj || '');
      setRegimePJ(dadosCarregados.regimePjEscolhido || 'ME');
      setProlaborePct(dadosCarregados.proLaborePercentual 
        ? dadosCarregados.proLaborePercentual * 100 : '28');
      setResultados(dadosCarregados);
    

      setEditandoHistorico(true);
    }
  }, [dadosCarregados]);

  // --- MAPEIA CAMINHO FRONTEND → DIREÇÃO BACKEND ---
  const mapearDirecao = () => {
    if (caminhoAtivo === 'clt_to_pj') return 'CLT_PARA_PJ';
    if (caminhoAtivo === 'pj_to_clt') return 'PJ_PARA_CLT';
    return 'META_PARA_PJ';
  };

  // --- MAPEIA REGIME FRONTEND → REGIME BACKEND ---
  const mapearRegime = () => {
    return regimePJ === 'MEI' ? 'MEI' : 'ME';
  };

  // --- CHAMADA À API ---
  useEffect(() => {

  if (editandoHistorico) return;

  const calcularAutomaticamente = async () => {

    try {

      const payload = {
        userId,
        descricao: tituloSimulacao,
        direcao: mapearDirecao(),
        regimePjEscolhido: mapearRegime(),

        salarioDesejadoClt:
          caminhoAtivo === 'clt_to_pj'
            ? parseFloat(salarioCLT) || null
            : null,

        valeAlimentacao:
          parseFloat(valeAlimentacao) || 0,

        valeTransporte:
          parseFloat(valeTransporte) || 0,

        proLaborePercentual:
          mapearRegime() === 'ME'
            ? parseFloat(proLaborePct) / 100
            : null,

        faturamentoBrutoPj:
          caminhoAtivo === 'pj_to_clt'
            ? parseFloat(faturamentoPJ) || null
            : null,

        margemDesejada:
          caminhoAtivo === 'meta_to_pj'
            ? parseFloat(metaLiquida) || null
            : null,
      };

      const resposta = await calcularSimulacao(payload);

      setResultados(resposta);
      setErro(null);

    } catch (e) {
      setErro(e.message);
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

  // --- SALVA NO HISTÓRICO DA SIDEBAR ---
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

      salarioDesejadoClt:
        caminhoAtivo === 'clt_to_pj'
          ? parseFloat(salarioCLT) || null
          : null,

      valeAlimentacao:
        parseFloat(valeAlimentacao) || 0,

      valeTransporte:
        parseFloat(valeTransporte) || 0,

      proLaborePercentual:
        mapearRegime() === 'ME'
          ? parseFloat(proLaborePct) / 100
          : null,

      faturamentoBrutoPj:
        caminhoAtivo === 'pj_to_clt'
          ? parseFloat(faturamentoPJ) || null
          : null,

      margemDesejada:
        caminhoAtivo === 'meta_to_pj'
          ? parseFloat(metaLiquida) || null
          : null,
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

  const formatarMoeda = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- CONFIGURAÇÃO APEXCHARTS ---
  const chartOptions = {
    series: [
      { name: 'Margem Disponível', data: [resultados?.margemDisponivel || 0], color: '#22c55e' },
      { name: 'Provisões CLT', data: [resultados?.provisoesSimuladasPj || 0], color: '#eab308' },
      { name: 'Impostos PJ', data: [resultados?.impostoPj || 0], color: '#ef4444' }
    ],
    options: {
      chart: { type: 'bar', stacked: true, stackType: '100%', toolbar: { show: false }, background: '#1e293b' },
      plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
      dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + "%" },
      stroke: { width: 0 },
      xaxis: { categories: ['Histórico Analítico'], labels: { style: { colors: '#94a3b8' } } },
      yaxis: { show: false },
      fill: { opacity: 1 },
      legend: { show: false },
      grid: { show: false },
      tooltip: { theme: 'dark', y: { formatter: (val) => formatarMoeda(val) } }
    }
  };

  return (
    <div className="simulacao-container">

      {/* ABAS SUPERIORES */}
      <div className="direcionamento-abas">
        <button type="button" disabled={editandoHistorico}
          className={`aba-filtro ${caminhoAtivo === 'clt_to_pj' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('clt_to_pj')}>
          <span className="aba-titulo">Quero migrar para PJ</span>
          <span className="aba-subtitulo">(CLT → PJ)</span>
        </button>
        <button type="button" disabled={editandoHistorico}
          className={`aba-filtro ${caminhoAtivo === 'pj_to_clt' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('pj_to_clt')}>
          <span className="aba-titulo">Já sou PJ / Recebi Proposta</span>
          <span className="aba-subtitulo">(PJ → CLT)</span>
        </button>
        <button type="button" disabled={editandoHistorico}
          className={`aba-filtro ${caminhoAtivo === 'meta_to_pj' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('meta_to_pj')}>
          <span className="aba-titulo">Definir Meta Líquida</span>
          <span className="aba-subtitulo">(Meta → PJ)</span>
        </button>
      </div>

      <div className="titulo-salvamento-row">
        <input
          type="text"
          placeholder="Dê um nome para arquivar este cenário..."
          value={tituloSimulacao}
          onChange={(e) => setTituloSimulacao(e.target.value)}
          className="input-titulo-simulacao"
          disabled={editandoHistorico}
        />
        <button type="button" onClick={handleSalvarSimulacao}
          className="btn-salvar-historico"
          disabled={editandoHistorico || !resultados}>
          {editandoHistorico ? '🔒 Histórico Arquivado' : '💾 Salvar Análise'}
        </button>
      </div>

      {/* MENSAGEM DE ERRO */}
      {erro && (
        <div className="erro-inline">⚠ {erro}</div>
      )}

      <div className="simulacao-grid-operacional">

        {/* ENTRADAS */}
        <div className="card-formulario-entradas">
          <div className="secao-form-titulo">CAIXAS DE ENTRADA</div>
          <fieldset disabled={editandoHistorico}
            style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {caminhoAtivo === 'clt_to_pj' && (
              <>
                <span className="subtitulo-caixa">DADOS DA CLT (Entrada)</span>
                <div className="grupo-input">
                  <label>Salário Desejado CLT (R$)</label>
                  <input type="number" value={salarioCLT}
                    onChange={(e) => setSalarioCLT(e.target.value)} />
                </div>
                <div className="grupo-input">
                  <label>Vale Alimentação (R$)</label>
                  <input type="number" value={valeAlimentacao}
                    onChange={(e) => setValeAlimentacao(e.target.value)} />
                </div>
                <div className="grupo-input">
                  <label>Vale Transporte (R$)</label>
                  <input type="number" value={valeTransporte}
                    onChange={(e) => setValeTransporte(e.target.value)} />
                </div>
              </>
            )}

            {caminhoAtivo === 'pj_to_clt' && (
              <>
                <span className="subtitulo-caixa">DADOS DO CONTRATO PJ (Entrada)</span>
                <div className="grupo-input">
                  <label>Faturamento Bruto PJ (R$)</label>
                  <input type="number" value={faturamentoPJ}
                    onChange={(e) => setFaturamentoPJ(e.target.value)} />
                </div>
              </>
            )}

            {caminhoAtivo === 'meta_to_pj' && (
              <>
                <span className="subtitulo-caixa">META LÍQUIDA DESEJADA (Entrada)</span>
                <div className="grupo-input">
                  <label>Margem Líquida Desejada (R$)</label>
                  <input type="number" value={metaLiquida}
                    onChange={(e) => setMetaLiquida(e.target.value)} />
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
                <input type="number" value={proLaborePct}
                  onChange={(e) => setProlaborePct(e.target.value)} />
              </div>
            )}
          </fieldset>

         

          <p className="legenda-automatica">
             *Os resultados são atualizados automaticamente conforme os parâmetros*
          </p>
        </div>

        {/* SAÍDAS */}
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

         
          </div>
        </div>
      </div>

      {editandoHistorico && (
        <button type="button" className="btn-voltar-painel"
            onClick={() => window.location.reload()}
          style={{ marginTop: '15px', backgroundColor: '#334155', color: '#fff',
            border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          ← Nova Simulação
        </button>
      )}
    </div>
  );
}