import "./Help.css";

export default function Help({ voltar }) {
  return (
    <div className="help-container">

     <div className="help-header">

  <button
    className="btn-voltar-ajuda"
    onClick={voltar}
  >
    ← Voltar ao Painel
  </button>

  <h1>Central de Ajuda</h1>

  <p>
    Aprenda a interpretar propostas PJ,
    entender impostos, benefícios e tomar
    decisões financeiras com mais segurança.
  </p>

  <p>
    Este guia foi criado para quem está começando...
  </p>

</div>

      <section className="help-section">
        <h2>📌 O que significa trabalhar como PJ?</h2>

        <p>
          Quando você trabalha como CLT, a empresa paga diversos
          benefícios e encargos além do seu salário.
        </p>

        <p>
          Já como PJ, você recebe um valor bruto e passa a ser
          responsável pelos seus próprios impostos, reservas e
          planejamento financeiro.
        </p>

        <p>
          Por isso uma proposta PJ aparentemente maior nem sempre
          significa mais dinheiro no bolso.
        </p>
      </section>

      <section className="help-section">
        <h2>💰 O que são impostos PJ?</h2>

        <p>
          Toda empresa precisa pagar tributos ao governo.
        </p>

        <p>
          Dependendo do enquadramento tributário, uma parte do
          faturamento será destinada aos impostos.
        </p>

        <p>
          Na plataforma esse valor aparece separado para que você
          visualize quanto realmente sobra após os tributos.
        </p>
      </section>

      <section className="help-section">
        <h2>📄 O que é Pró-Labore?</h2>

        <p>
          Pró-labore é o salário do sócio da empresa.
        </p>

        <p>
          É sobre ele que normalmente incidem contribuições como INSS.
        </p>

        <p>
          O restante do dinheiro pode permanecer na empresa ou ser
          distribuído posteriormente conforme as regras vigentes.
        </p>
      </section>

      <section className="help-section">
        <h2>📊 O que é o Fator R?</h2>

        <p>
          O Fator R é um cálculo utilizado no Simples Nacional para
          determinar a faixa de tributação de determinadas atividades.
        </p>

        <p>
          Dependendo da relação entre folha de pagamento e faturamento,
          sua empresa pode pagar menos ou mais impostos.
        </p>

        <p>
          Você não precisa calcular isso manualmente para utilizar a
          plataforma, mas é importante entender que ele influencia a
          carga tributária final.
        </p>
      </section>

      <section className="help-section">
        <h2>🏥 E os benefícios da CLT?</h2>

        <p>
          Muitos profissionais olham apenas para o salário.
        </p>

        <p>
          Porém a CLT normalmente oferece benefícios como:
        </p>

        <ul>
          <li>13º salário</li>
          <li>Férias remuneradas</li>
          <li>FGTS</li>
          <li>INSS</li>
          <li>Vale alimentação</li>
          <li>Vale transporte</li>
          <li>Plano de saúde</li>
        </ul>

        <p>
          Todos esses itens possuem valor financeiro e devem ser
          considerados ao comparar propostas.
        </p>
      </section>

      <section className="help-section">
        <h2>🧮 Como funciona a Simulação CLT x PJ?</h2>

        <p>
          A simulação compara o valor bruto informado com os descontos,
          encargos e reservas necessários.
        </p>

        <p>
          O objetivo é responder uma pergunta simples:
        </p>

        <blockquote>
          "Quanto realmente sobra no meu bolso em cada cenário?"
        </blockquote>

        <p>
          O resultado mostra impostos, provisões e renda líquida para
          facilitar a comparação.
        </p>
      </section>

      <section className="help-section">
        <h2>📈 Como funciona a Projeção Patrimonial?</h2>

        <p>
          A projeção calcula como seu patrimônio pode crescer ao longo
          do tempo através de aportes mensais.
        </p>

        <p>
          Além do valor bruto acumulado, a plataforma também estima o
          poder de compra real considerando a inflação.
        </p>

        <p>
          Isso permite visualizar quanto aquele dinheiro realmente
          valerá no futuro.
        </p>
      </section>

      <section className="help-section">
        <h2>📉 Como interpretar os gráficos?</h2>

        <p>
          Os gráficos mostram a evolução do patrimônio ao longo dos
          meses.
        </p>

        <ul>
          <li>Patrimônio acumulado</li>
          <li>Total investido</li>
          <li>Ganho obtido pelos juros</li>
        </ul>

        <p>
          Quanto maior a distância entre o patrimônio acumulado e o
          total investido, maior o impacto dos rendimentos.
        </p>
      </section>

      <section className="help-section">
        <h2>💾 Como salvar relatórios?</h2>

        <p>
          Após realizar uma simulação ou projeção, utilize o botão de
          salvar para arquivar o resultado.
        </p>

        <p>
          Os relatórios ficam disponíveis no menu lateral e podem ser:
        </p>

        <ul>
          <li>Editados</li>
          <li>Fixados</li>
          <li>Consultados novamente</li>
          <li>Excluídos</li>
        </ul>
      </section>

      <section className="help-section destaque">
        <h2>🎯 Por onde começar?</h2>

        <ol>
          <li>Entenda quanto você ganha hoje.</li>
          <li>Simule a proposta PJ recebida.</li>
          <li>Compare o valor líquido final.</li>
          <li>Analise impostos e reservas.</li>
          <li>Projete o crescimento do patrimônio.</li>
          <li>Tome sua decisão com dados reais.</li>
        </ol>
      </section>

    </div>
  );
}