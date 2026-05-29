import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

// =========================================================
// GLOBAL PALETTE
// =========================================================

const COR_AZUL = '#38bdf8';
const COR_VERDE = '#10b981';
const COR_AMARELO = '#f59e0b';
const COR_VERMELHO = '#ef4444';

const COR_TEXTO = '#94a3b8';
const COR_GRID = '#334155';
const COR_FUNDO = '#0f172a';

// =========================================================
// HELPERS
// =========================================================

// Converts Brazilian currency string format to numeric value ("14.500" -> 14500)
const parseValorBR = (v) => {
  if (typeof v === 'number') return v;
  if (!v) return 0;

  return (
    Number(
      String(v)
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0
  );
};

// Extracts and parses year count from text values ("15 anos" -> 15)
const parseAnos = (t) => {
  if (!t) return 10;

  const n = parseInt(
    String(t).match(/\d+/)?.[0] || '10',
    10
  );

  return Math.max(1, n);
};

// =========================================================
// COMPONENT
// =========================================================

export default function HistoricoChart({ item }) {

  const config = useMemo(() => {
    if (!item) return null;

    // =====================================================
    // SIMULATION CHART SPECIFICS
    // =====================================================

    if (item.tipo === 'simulacao') {
      const r = item.payloadCompleto;
      let labels;
      let series;

      // -----------------------------------------
      // REAL DATA PRESENT
      // -----------------------------------------
      if (r) {
        labels = [
          'Imposto',
          'Provisões',
          'Margem líquida'
        ];

        series = [
          Math.max(0, Number(r.impostoPj) || 0),
          Math.max(0, Number(r.provisoesSimuladasPj) || 0),
          Math.max(0, Number(r.margemDisponivel) || 0),
        ];
      } else {
        // -----------------------------------------
        // FALLBACK DATA GENERATION
        // -----------------------------------------
        const bruto = parseValorBR(item.valor);
        const pj = item.modalidade === 'PJ';

        const imposto = bruto * (pj ? 0.11 : 0.18);
        const provisao = bruto * (pj ? 0.28 : 0.12);
        const margem = Math.max(0, bruto - imposto - provisao);

        labels = [
          'Imposto',
          'Provisões',
          'Margem líquida'
        ];

        series = [
          imposto,
          provisao,
          margem
        ];
      }

      return {
        type: 'donut',
        series,
        options: {
          chart: {
            background: 'transparent',
            foreColor: COR_TEXTO,
            animations: {
              enabled: true,
              speed: 280,
              animateGradually: {
                enabled: false
              },
              dynamicAnimation: {
                enabled: false
              }
            }
          },
          labels,
          colors: [
            COR_VERMELHO,
            COR_AMARELO,
            COR_VERDE
          ],
          stroke: {
            width: 2,
            colors: [COR_FUNDO]
          },
          legend: {
            position: 'bottom',
            labels: {
              colors: COR_TEXTO
            }
          },
          dataLabels: {
            style: {
              fontSize: '12px',
              fontWeight: 600
            },
            formatter: (val) => `${val.toFixed(1)}%`,
          },
          plotOptions: {
            pie: {
              donut: {
                size: '68%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Bruto',
                    color: COR_AZUL,
                    fontSize: '13px',
                    formatter: (w) => {
                      const total = w.globals.seriesTotals.reduce(
                        (a, b) => a + b,
                        0
                      );
                      return total.toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0
                        }
                      );
                    }
                  }
                }
              }
            }
          },
          tooltip: {
            theme: 'dark',
            y: {
              formatter: (v) =>
                v.toLocaleString(
                  'pt-BR',
                  {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  }
                )
            }
          }
        }
      };
    }

    // =====================================================
    // PROJECTION CHART SPECIFICS
    // =====================================================

    const p = item.payloadCompleto;
    const anos = parseAnos(item.tempo);
    const meses = anos * 12;

    const patrimonioInicial =
      parseValorBR(p?.patrimonioInicial) ||
      parseValorBR(item.valor) * 0.05 ||
      10000;

    const aporte =
      parseValorBR(p?.aporteMensal) ||
      Math.max(
        500,
        parseValorBR(item.valor) / meses / 2
      );

    const taxaAA = (Number(p?.taxaRentabilidade) || 11.5) / 100;
    const inflacaoAA = (Number(p?.taxaInflacao) || 4.5) / 100;

    // Calculates real annual interest rate adjusted for inflation
    const taxaRealAA = (1 + taxaAA) / (1 + inflacaoAA) - 1;
    // Compounded monthly real interest rate
    const taxaRealMM = Math.pow(1 + taxaRealAA, 1 / 12) - 1;

    const categorias = [];
    const totalSerie = [];
    const investidoSerie = [];

    let total = patrimonioInicial;
    let investido = patrimonioInicial;

    // Configures data step intervals to optimize rendering performance
    const step = Math.max(1, Math.floor(meses / 60));

    for (let i = 0; i <= meses; i++) {
      if (i > 0) {
        total = total * (1 + taxaRealMM) + aporte;
        investido += aporte;
      }

      if (i % step === 0 || i === meses) {
        categorias.push(`${(i / 12).toFixed(1)}a`);
        totalSerie.push(Math.round(total));
        investidoSerie.push(Math.round(investido));
      }
    }

    return {
      type: 'area',
      series: [
        {
          name: 'Patrimônio total',
          data: totalSerie
        },
        {
          name: 'Total investido',
          data: investidoSerie
        }
      ],
      options: {
        chart: {
          background: 'transparent',
          foreColor: COR_TEXTO,
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
          animations: {
            enabled: true,
            speed: 350,
            animateGradually: {
              enabled: false
            },
            dynamicAnimation: {
              enabled: false
            }
          }
        },
        colors: [COR_VERDE, COR_AZUL],
        stroke: {
          curve: 'smooth',
          width: 2
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 100]
          }
        },
        dataLabels: {
          enabled: false
        },
        grid: {
          borderColor: COR_GRID,
          strokeDashArray: 4
        },
        xaxis: {
          categories: categorias,
          labels: {
            style: {
              colors: COR_TEXTO,
              fontSize: '11px'
            }
          },
          axisBorder: {
            color: COR_GRID
          },
          axisTicks: {
            color: COR_GRID
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: COR_TEXTO,
              fontSize: '11px'
            },
            formatter: (v) => {
              if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1)}M`;
              if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)}k`;
              return `R$ ${v}`;
            }
          }
        },
        legend: {
          labels: {
            colors: COR_TEXTO
          }
        },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: (v) =>
              v.toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0
                }
              )
          }
        }
      }
    };
  }, [item]);

  // =====================================================
  // GUARD CONDITION
  // =====================================================

  if (!config || !config.series || config.series.length === 0) {
    return null;
  }

  // =====================================================
  // RENDER UI
  // =====================================================

  return (
    <div className="historico-chart-box animation-blur-fade">
      <div className="historico-chart-header">
        <h4>
          {item.tipo === 'simulacao'
            ? 'Composição do bruto mensal'
            : 'Evolução patrimonial real (descontada a inflação)'
          }
        </h4>
        <span className="historico-chart-sub">
          {item.tipo === 'simulacao'
            ? 'Distribuição entre imposto, provisões e margem líquida.'
            : `Projeção de ${parseAnos(item.tempo)} ano(s) com aportes mensais.`
          }
        </span>
      </div>

      <ReactApexChart
        key={item.id}
        options={config.options}
        series={config.series}
        type={config.type}
        height={320}
      />
    </div>
  );
}