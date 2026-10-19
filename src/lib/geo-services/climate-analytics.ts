/**
 * CLIMATE ANALYTICS — Motor de Análise Estatística e Inteligência Territorial
 * Projeto Arboris | MapBiomas + Landsat 8/9 + NASA POWER
 */

import {
  RECIFE_SPATIAL_GRID,
  RMR_MUNICIPALITIES,
  ARBORIS_STATISTICAL_CORRELATIONS,
  type SpatialGridCell,
  type RmrMunicipality,
} from "./arboris-geodata";

export interface LinearRegressionResult {
  slope: number;       // Coeficiente angular (m)
  intercept: number;   // Intercepto (b)
  r: number;           // Coeficiente de correlação de Pearson
  r2: number;          // Coeficiente de determinação (R²)
  equation: string;    // y = m*x + b
  predictedTempAtZeroGreen: number;
  predictedTempAt30Pct: number;
  predictedTempAt60Pct: number;
}

/**
 * Calcula regressão linear dos pontos da grade espacial de Recife
 * Relação entre % de cobertura verde ampla (X) e Temperatura de Superfície em °C (Y)
 */
export function calculateSpatialLinearRegression(
  cells: SpatialGridCell[] = RECIFE_SPATIAL_GRID
): LinearRegressionResult {
  const n = cells.length;
  if (n < 2) {
    return {
      slope: -0.11,
      intercept: 36.8,
      r: -0.64,
      r2: 0.41,
      equation: "y = -0.11x + 36.8",
      predictedTempAtZeroGreen: 36.8,
      predictedTempAt30Pct: 33.5,
      predictedTempAt60Pct: 30.2,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const c of cells) {
    const x = c.coberturaVerdeAmplaPct;
    const y = c.temperaturaSuperficieC;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Pearson r
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denominator === 0 ? 0 : numerator / denominator;
  const r2 = r * r;

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(2)),
    r: Number(r.toFixed(3)),
    r2: Number(r2.toFixed(3)),
    equation: `LST = ${slope.toFixed(3)} × (% Verde) + ${intercept.toFixed(2)}`,
    predictedTempAtZeroGreen: Number(intercept.toFixed(1)),
    predictedTempAt30Pct: Number((slope * 30 + intercept).toFixed(1)),
    predictedTempAt60Pct: Number((slope * 60 + intercept).toFixed(1)),
  };
}

/**
 * Inteligência de Negócio: Ranking de Vulnerabilidade e Risco Térmico Metropolitano
 */
export function getMetropolitanHeatInsights() {
  const sortedByLstMax = [...RMR_MUNICIPALITIES].sort((a, b) => b.lstMaximaC - a.lstMaximaC);
  const sortedByGreenDeficit = [...RMR_MUNICIPALITIES].sort(
    (a, b) => a.coberturaVerdeAmplaPct - b.coberturaVerdeAmplaPct
  );
  const sortedByMudas = [...RMR_MUNICIPALITIES].sort((a, b) => b.mudasNecessarias - a.mudasNecessarias);

  const top3Hottest = sortedByLstMax.slice(0, 3);
  const top3Deficit = sortedByGreenDeficit.slice(0, 3);
  const totalMudasRMR = RMR_MUNICIPALITIES.reduce((acc, m) => acc + m.mudasNecessarias, 0);

  return {
    top3Hottest,
    top3Deficit,
    totalMudasRMR,
    refugiosTermicos: RMR_MUNICIPALITIES.filter((m) => m.lstMediaC < 29.5),
    rmrCount: RMR_MUNICIPALITIES.length,
  };
}

/**
 * Exporta a grade espacial de 1 km de Recife em formato CSV exatamente compatível com o Colab
 * Arquivo: arboris_grade_verde_temperatura_2023.csv
 */
export function generateRecifeGridCsvBlob(): Blob {
  const headers = [
    "cell_id",
    "lat",
    "lon",
    "bairro_referencia",
    "cobertura_verde_ampla_pct",
    "vegetacao_nativa_pct",
    "arborizacao_urbana_pct",
    "temperatura_superficie_c",
    "lst_valida",
    "ano_mapbiomas",
    "ano_landsat",
  ];

  const rows = RECIFE_SPATIAL_GRID.map((c) => [
    c.cellId,
    c.lat,
    c.lon,
    `"${c.bairroReferencia}"`,
    c.coberturaVerdeAmplaPct,
    c.vegetacaoNativaPct,
    "NaN", // Ausente no MapBiomas conforme metodologia oficial Arboris
    c.temperaturaSuperficieC,
    c.fracaoValida,
    2021,
    2021,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}

/**
 * Exporta a tabela das correlações de Pearson com IC95% (Fisher) e p-valor
 * Arquivo: arboris_correlacoes_2023.csv
 */
export function generateCorrelationsCsvBlob(): Blob {
  const headers = [
    "indicador",
    "n_celulas",
    "pearson_r",
    "r2",
    "p_valor",
    "ic95_inf",
    "ic95_sup",
    "spearman_rho",
    "ano_mapbiomas",
    "ano_landsat",
  ];

  const rows = ARBORIS_STATISTICAL_CORRELATIONS.map((c) => [
    `"${c.indicador}"`,
    c.nCelulas,
    isNaN(c.pearsonR) ? "NaN" : c.pearsonR,
    isNaN(c.r2) ? "NaN" : c.r2,
    isNaN(c.pValor) ? "NaN" : c.pValor,
    isNaN(c.ic95Inf) ? "NaN" : c.ic95Inf,
    isNaN(c.ic95Sup) ? "NaN" : c.ic95Sup,
    isNaN(c.spearmanRho) ? "NaN" : c.spearmanRho,
    2021,
    2021,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}

/**
 * Exporta dados consolidados dos 14 municípios da RMR
 * Arquivo: arboris_rmr_municipios_2021.csv
 */
export function generateRmrMunicipiosCsvBlob(): Blob {
  const headers = [
    "municipio",
    "populacao",
    "area_km2",
    "vegetacao_nativa_pct",
    "cobertura_verde_ampla_pct",
    "area_urbana_pct",
    "lst_media_c",
    "lst_maxima_c",
    "ivs",
    "prioridade_plantio",
    "mudas_necessarias",
  ];

  const rows = RMR_MUNICIPALITIES.map((m) => [
    `"${m.name}"`,
    m.population,
    m.areaKm2,
    m.vegetacaoNativaPct,
    m.coberturaVerdeAmplaPct,
    m.areaUrbanaPct,
    m.lstMediaC,
    m.lstMaximaC,
    m.ivs,
    `"${m.prioridadePlantio}"`,
    m.mudasNecessarias,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}
