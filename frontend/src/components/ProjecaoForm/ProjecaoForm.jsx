import React, { useState, useEffect } from 'react';
import "./ProjecaoForm.css";
import { calcularProjecao, salvarProjecao } from '../../services/api';

export default function ProjecaoForm({ onSalvar, userId }) {
  // --- STATE MANAGEMENT ---
  const [caminhoAtivo, setCaminhoAtivo] = useState('aporte_to_patrimonio');
  const [tituloProjecao, setTituloProjecao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const [aporteMensal, setAporteMensal] = useState('1000');
  const [metaPatrimonio, setMetaPatrimonio] = useState('1000000');
  const [prazoAnos, setPrazoAnos] = useState('10');

  const [resultados, setResultados] = useState(null);

  // --- AUTOMATIC CALCULATION HOOK ---
  useEffect(() => {
    const calcularAutomaticamente = async () => {
      try {
        setCarregando(true);

        const payload = {
          userId,
          descricao: tituloProjecao.trim() || `Projeção ${prazoAnos} anos`,
          direcao: caminhoAtivo === 'aporte_to_patrimonio' ? 'NORMAL' : 'INVERSA',
          prazoAnos: parseInt(prazoAnos) || 10,
          aporteMensal: caminhoAtivo === 'aporte_to_patrimonio' ? Number(aporteMensal) : null,
          metaPatrimonio: caminhoAtivo === 'meta_to_aporte' ? Number(metaPatrimonio) : null,
        };

        const resposta = await calcularProjecao(payload);
        setResultados(resposta);
        setErro(null);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    calcularAutomaticamente();
  }, [caminhoAtivo, aporteMensal, metaPatrimonio, prazoAnos]);

  // --- PERSIST DATA ---
  const handleSalvar = async () => {
    if (!resultados) {
      setErro('Nenhuma projeção calculada.');
      return;
    }

    try {
      const payload = {
        userId,
        descricao: tituloProjecao.trim() || `Projeção ${prazoAnos} anos`,
        direcao: caminhoAtivo === 'aporte_to_patrimonio' ? 'NORMAL' : 'INVERSA',
        prazoAnos: parseInt(prazoAnos) || 10,
        aporteMensal: caminhoAtivo === 'aporte_to_patrimonio' ? Number(aporteMensal) : null,
        metaPatrimonio: caminhoAtivo === 'meta_to_aporte' ? Number(metaPatrimonio) : null,
      };

      const projecaoSalva = await salvarProjecao(payload);

      if (typeof onSalvar === 'function') {
        onSalvar({
          ...projecaoSalva,
          tipo: 'projecao',
          tempo: `${prazoAnos} anos`,
        });
      }

      setErro(null);
    } catch (e) {
      setErro(e.message);
    }
  };

  // --- HELPERS ---
  const formatarMoeda = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="projecao-container">
      {/* NAVIGATION TABS */}
      <div className="direcionamento-abas">
        <button
          type="button"
          className={`aba-filtro ${caminhoAtivo === 'aporte_to_patrimonio' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('aporte_to_patrimonio')}
        >
          <span className="aba-titulo">Projetar Patrimônio no Tempo</span>
          <span className="aba-subtitulo">(Aporte → Patrimônio)</span>
        </button>
        <button
          type="button"
          className={`aba-filtro ${caminhoAtivo === 'meta_to_aporte' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('meta_to_aporte')}
        >
          <span className="aba-titulo">Calcular Aporte para uma Meta</span>
          <span className="aba-subtitulo">(Meta → Aporte Mensal)</span>
        </button>
      </div>

      {/* HEADER ACTIONS */}
      <div className="titulo-salvamento-row">
        <input
          type="text"
          placeholder="Dê um nome para esta projeção..."
          value={tituloProjecao}
          onChange={(e) => setTituloProjecao(e.target.value)}
          className="input-titulo-projecao"
        />
        <button
          type="button"
          onClick={handleSalvar}
          className="btn-salvar-projecao"
          disabled={!resultados}
        >
          {carregando ? '⏳ Atualizando...' : '💾 Salvar Projeção'}
        </button>
      </div>

      {/* INLINE ERROR DISPLAY */}
      {erro && <div className="erro-inline">⚠ {erro}</div>}

      {/* MAIN OPERATIONAL GRID */}
      <div className="projecao-grid-operacional">
        {/* INPUT PANEL CARD */}
        <div className="card-formulario-entradas">
          <div className="secao-form-titulo">Parâmetros de Acumulação</div>

          <div className="bloco-dinamico-inputs">
            <span className="subtitulo-caixa">Mesa de Configuração</span>

            {caminhoAtivo === 'aporte_to_patrimonio' ? (
              <div className="grupo-input">
                <label>Aporte Mensal Constante (R$)</label>
                <input
                  type="number"
                  value={aporteMensal}
                  onChange={(e) => setAporteMensal(e.target.value)}
                />
              </div>
            ) : (
              <div className="grupo-input">
                {/* ABSTRAÇÃO 1: De "Meta de Patrimônio Alvo" para "Quanto quero ter acumulado" */}
                <label>Quanto quero ter acumulado (R$)</label>
                <input
                  type="number"
                  value={metaPatrimonio}
                  onChange={(e) => setMetaPatrimonio(e.target.value)}
                />
              </div>
            )}

            <div className="grupo-input">
              <label>Prazo (Anos)</label>
              <input
                type="number"
                value={prazoAnos}
                onChange={(e) => setPrazoAnos(e.target.value)}
              />
            </div>
          </div>

          <p className="legenda-automatica">
            *Os resultados são atualizados automaticamente conforme os parâmetros*
          </p>
        </div>

        {/* OUTPUT METRICS CARD */}
        <div className="card-painel-resultados">
          <div className="secao-form-titulo">Análise de Cenário Real</div>

          <div className="dados-analise-renderizados">
            <span className="subtitulo-caixa">
  {caminhoAtivo === 'aporte_to_patrimonio' ? 'Resultado Estimado' : 'Aporte Necessário'}
</span>

            <div className="bloco-saida-linha principal-projecao">
              {/* ABSTRAÇÃO 2: De "Montante Real Acumulado" para "Poder de compra real" */}
              <span className="label-saida">
                {caminhoAtivo === 'aporte_to_patrimonio'
                  ? 'Poder de Compra Real'
                  : 'Aporte Mensal Necessário'}
              </span>
              <span className="valor-saida destacado-projecao">
                {caminhoAtivo === 'aporte_to_patrimonio'
                  ? formatarMoeda(resultados?.montanteReal)
                  : formatarMoeda(resultados?.aporteMensalNecessario)}
              </span>
            </div>

            <div className="bloco-saida-linha">
              {/* ABSTRAÇÃO 3: De "Montante Nominal Acumulado" para "Dinheiro total na conta (Saldo Bruto)" */}
              <span className="label-saida">
                {caminhoAtivo === 'aporte_to_patrimonio' 
                  ? 'Dinheiro total na conta (Saldo Bruto)' 
                  : 'Meta Alvo Final'}
              </span>
              <span className="valor-saida valor-investido">
                {caminhoAtivo === 'aporte_to_patrimonio'
                  ? formatarMoeda(resultados?.montanteNominal)
                  : formatarMoeda(resultados?.metaPatrimonio || resultados?.montanteNominal)}
              </span>
            </div>

            <div className="bloco-saida-linha final">
              <span className="label-saida">Prazo</span>
              <span className="valor-saida">
                {prazoAnos} anos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}