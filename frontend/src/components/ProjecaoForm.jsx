import React, { useState, useEffect } from 'react';
import '../styles/ProjecaoForm.css';
import { calcularProjecao, salvarProjecao } from '../services/api';

export default function ProjecaoForm({ onSalvar, userId }) {
  const [caminhoAtivo, setCaminhoAtivo] = useState('aporte_to_patrimonio');
  const [tituloProjecao, setTituloProjecao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const [aporteMensal, setAporteMensal] = useState('1000');
  const [metaPatrimonio, setMetaPatrimonio] = useState('1000000');
  const [prazoAnos, setPrazoAnos] = useState('10');

  const [resultados, setResultados] = useState(null);

useEffect(() => {

  const calcularAutomaticamente = async () => {

    try {

      setCarregando(true);

      const payload = {
        userId,

        descricao:
          tituloProjecao.trim() ||
          `Projeção ${prazoAnos} anos`,

        direcao:
          caminhoAtivo === 'aporte_to_patrimonio'
            ? 'NORMAL'
            : 'INVERSA',

        prazoAnos:
          parseInt(prazoAnos) || 10,

        aporteMensal:
          caminhoAtivo === 'aporte_to_patrimonio'
            ? Number(aporteMensal)
            : null,

        metaPatrimonio:
          caminhoAtivo === 'meta_to_aporte'
            ? Number(metaPatrimonio)
            : null,
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

}, [
  caminhoAtivo,
  aporteMensal,
  metaPatrimonio,
  prazoAnos
]);

  const handleSalvar = async () => {
    

  if (!resultados) {
    setErro('Nenhuma projeção calculada.');
    return;
  }

  try {

    const payload = {
      userId,

      descricao:
        tituloProjecao.trim() ||
        `Projeção ${prazoAnos} anos`,

      direcao:
        caminhoAtivo === 'aporte_to_patrimonio'
          ? 'NORMAL'
          : 'INVERSA',

      prazoAnos:
        parseInt(prazoAnos) || 10,

      aporteMensal:
        caminhoAtivo === 'aporte_to_patrimonio'
          ? Number(aporteMensal)
          : null,

      metaPatrimonio:
        caminhoAtivo === 'meta_to_aporte'
          ? Number(metaPatrimonio)
          : null,
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
  const formatarMoeda = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="projecao-container">

      {/* ABAS */}
      <div className="direcionamento-abas">
        <button type="button"
          className={`aba-filtro ${caminhoAtivo === 'aporte_to_patrimonio' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('aporte_to_patrimonio')}>
          <span className="aba-titulo">Projetar Patrimônio no Tempo</span>
          <span className="aba-subtitulo">(Aporte → Patrimônio)</span>
        </button>
        <button type="button"
          className={`aba-filtro ${caminhoAtivo === 'meta_to_aporte' ? 'ativa' : ''}`}
          onClick={() => setCaminhoAtivo('meta_to_aporte')}>
          <span className="aba-titulo">Calcular Aporte para uma Meta</span>
          <span className="aba-subtitulo">(Meta → Aporte Mensal)</span>
        </button>
      </div>

      <div className="titulo-salvamento-row">
        <input
          type="text"
          placeholder="Dê um nome para esta projeção..."
          value={tituloProjecao}
          onChange={(e) => setTituloProjecao(e.target.value)}
          className="input-titulo-projecao"
        />
        <button type="button" onClick={handleSalvar}
          className="btn-salvar-projecao"
          disabled={!resultados}>
          💾 Salvar Projeção
        </button>
      </div>

      {/* MENSAGEM DE ERRO */}
      {erro && <div className="erro-inline">⚠ {erro}</div>}

      <div className="projecao-grid-operacional">

        {/* ENTRADAS */}
        <div className="card-formulario-entradas">
          <div className="secao-form-titulo">Parâmetros de Acumulação</div>

          <div className="bloco-dinamico-inputs">
            <span className="subtitulo-caixa">Mesa de Configuração</span>

            {caminhoAtivo === 'aporte_to_patrimonio' ? (
              <div className="grupo-input">
                <label>Aporte Mensal Constante (R$)</label>
                <input type="number" value={aporteMensal}
                  onChange={(e) => setAporteMensal(e.target.value)} />
              </div>
            ) : (
              <div className="grupo-input">
                <label>Meta de Patrimônio Alvo (R$)</label>
                <input type="number" value={metaPatrimonio}
                  onChange={(e) => setMetaPatrimonio(e.target.value)} />
              </div>
            )}

            <div className="grupo-input">
              <label>Horizonte de Tempo (Anos)</label>
              <input type="number" value={prazoAnos}
                onChange={(e) => setPrazoAnos(e.target.value)} />
            </div>
          </div>

        

          <p className="legenda-automatica">
           *Os resultados são atualizados automaticamente conforme os parâmetros*
          </p>
        </div>

        {/* SAÍDAS */}
        <div className="card-painel-resultados">
          <div className="secao-form-titulo">Análise de Cenário Real</div>

          <div className="dados-analise-renderizados">
            <span className="subtitulo-caixa">Poder de Compra Calculado</span>

            <div className="bloco-saida-linha principal-projecao">
              <span className="label-saida">
                {caminhoAtivo === 'aporte_to_patrimonio'
                  ? 'Montante Real Acumulado' : 'Aporte Mensal Necessário'}
              </span>
              <span className="valor-saida destacado-projecao">
                {caminhoAtivo === 'aporte_to_patrimonio'
                  ? formatarMoeda(resultados?.montanteReal)
                  : formatarMoeda(resultados?.aporteMensalNecessario)}
              </span>
            </div>

            <div className="bloco-saida-linha">
              <span className="label-saida">Montante Nominal Acumulado</span>
              <span className="valor-saida valor-investido">
                {formatarMoeda(resultados?.montanteNominal)}
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