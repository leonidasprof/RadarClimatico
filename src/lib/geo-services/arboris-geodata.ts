/**
 * ARBORIS GEODATA — Base de Dados Reais Geoespaciais
 * Fonte: Projeto Arboris (MapBiomas Coleção 11 + Landsat 8/9 + GEE)
 * Recorte: Recife/PE e Região Metropolitana do Recife (RMR - 14 municípios)
 */

export interface RmrMunicipality {
  id: string;
  name: string;
  lat: number;
  lon: number;
  population: number;
  areaKm2: number;
  vegetacaoNativaPct: number;      // % MapBiomas Coleção 11
  coberturaVerdeAmplaPct: number;  // % Cobertura verde ampla (nativa + pastagem/silvicultura)
  areaUrbanaPct: number;           // % Área urbanizada
  lstMediaC: number;               // Temperatura média de superfície Landsat 8/9 (°C)
  lstMaximaC: number;              // Temperatura máxima de superfície Landsat 8/9 (°C)
  ivs: number;                     // Índice de Vulnerabilidade Social (0-100)
  arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m" | "Estimativa Municipal";
  prioridadePlantio: "Crítica" | "Alta" | "Moderada" | "Preservação";
  mudasNecessarias: number;
}

/**
 * 14 Municípios da RMR segundo definição oficial do IBGE
 * Extraídos e normalizados a partir do processamento no Google Earth Engine (FAO GAUL)
 */
export const RMR_MUNICIPALITIES: RmrMunicipality[] = [
  {
    id: "recife",
    name: "Recife",
    lat: -8.05428,
    lon: -34.8813,
    population: 1488920,
    areaKm2: 218.4,
    vegetacaoNativaPct: 19.41,
    coberturaVerdeAmplaPct: 26.85,
    areaUrbanaPct: 58.2,
    lstMediaC: 32.8,
    lstMaximaC: 37.4,
    ivs: 54,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Crítica",
    mudasNecessarias: 78500,
  },
  {
    id: "olinda",
    name: "Olinda",
    lat: -7.9986,
    lon: -34.8459,
    population: 349976,
    areaKm2: 41.6,
    vegetacaoNativaPct: 14.8,
    coberturaVerdeAmplaPct: 21.3,
    areaUrbanaPct: 68.7,
    lstMediaC: 33.6,
    lstMaximaC: 38.1,
    ivs: 58,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Crítica",
    mudasNecessarias: 28400,
  },
  {
    id: "jaboatao",
    name: "Jaboatão dos Guararapes",
    lat: -8.1098,
    lon: -35.0142,
    population: 643759,
    areaKm2: 258.7,
    vegetacaoNativaPct: 24.6,
    coberturaVerdeAmplaPct: 38.2,
    areaUrbanaPct: 41.5,
    lstMediaC: 32.1,
    lstMaximaC: 36.9,
    ivs: 62,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Alta",
    mudasNecessarias: 54200,
  },
  {
    id: "paulista",
    name: "Paulista",
    lat: -7.9408,
    lon: -34.8731,
    population: 342167,
    areaKm2: 97.0,
    vegetacaoNativaPct: 28.3,
    coberturaVerdeAmplaPct: 42.1,
    areaUrbanaPct: 37.9,
    lstMediaC: 31.5,
    lstMaximaC: 35.8,
    ivs: 52,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Alta",
    mudasNecessarias: 31000,
  },
  {
    id: "camaragibe",
    name: "Camaragibe",
    lat: -8.0205,
    lon: -34.9781,
    population: 147771,
    areaKm2: 51.2,
    vegetacaoNativaPct: 31.9,
    coberturaVerdeAmplaPct: 46.4,
    areaUrbanaPct: 35.2,
    lstMediaC: 30.9,
    lstMaximaC: 35.1,
    ivs: 56,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Moderada",
    mudasNecessarias: 18500,
  },
  {
    id: "cabo-santo-agostinho",
    name: "Cabo de Santo Agostinho",
    lat: -8.2811,
    lon: -35.0344,
    population: 203216,
    areaKm2: 448.7,
    vegetacaoNativaPct: 36.4,
    coberturaVerdeAmplaPct: 54.1,
    areaUrbanaPct: 18.9,
    lstMediaC: 30.4,
    lstMaximaC: 35.6,
    ivs: 57,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Moderada",
    mudasNecessarias: 24000,
  },
  {
    id: "igarassu",
    name: "Igarassu",
    lat: -7.8342,
    lon: -34.9064,
    population: 115196,
    areaKm2: 305.6,
    vegetacaoNativaPct: 38.5,
    coberturaVerdeAmplaPct: 58.7,
    areaUrbanaPct: 12.8,
    lstMediaC: 29.8,
    lstMaximaC: 34.2,
    ivs: 50,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Preservação",
    mudasNecessarias: 14200,
  },
  {
    id: "sao-lourenco-da-mata",
    name: "São Lourenço da Mata",
    lat: -8.0028,
    lon: -35.0189,
    population: 111249,
    areaKm2: 262.1,
    vegetacaoNativaPct: 39.8,
    coberturaVerdeAmplaPct: 61.2,
    areaUrbanaPct: 14.1,
    lstMediaC: 29.5,
    lstMaximaC: 34.0,
    ivs: 59,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Preservação",
    mudasNecessarias: 16000,
  },
  {
    id: "abreu-e-lima",
    name: "Abreu e Lima",
    lat: -7.9122,
    lon: -34.9025,
    population: 98662,
    areaKm2: 126.2,
    vegetacaoNativaPct: 34.2,
    coberturaVerdeAmplaPct: 49.8,
    areaUrbanaPct: 22.4,
    lstMediaC: 31.0,
    lstMaximaC: 35.4,
    ivs: 53,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Moderada",
    mudasNecessarias: 15400,
  },
  {
    id: "ipojuca",
    name: "Ipojuca",
    lat: -8.3981,
    lon: -35.0636,
    population: 97637,
    areaKm2: 527.1,
    vegetacaoNativaPct: 41.2,
    coberturaVerdeAmplaPct: 63.5,
    areaUrbanaPct: 11.2,
    lstMediaC: 29.2,
    lstMaximaC: 34.8,
    ivs: 51,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Preservação",
    mudasNecessarias: 12800,
  },
  {
    id: "moreno",
    name: "Moreno",
    lat: -8.1181,
    lon: -35.0886,
    population: 59873,
    areaKm2: 196.1,
    vegetacaoNativaPct: 32.7,
    coberturaVerdeAmplaPct: 56.4,
    areaUrbanaPct: 13.9,
    lstMediaC: 30.1,
    lstMaximaC: 34.7,
    ivs: 55,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Moderada",
    mudasNecessarias: 9800,
  },
  {
    id: "itapissuma",
    name: "Itapissuma",
    lat: -7.7797,
    lon: -34.8911,
    population: 26390,
    areaKm2: 74.3,
    vegetacaoNativaPct: 45.1,
    coberturaVerdeAmplaPct: 66.8,
    areaUrbanaPct: 10.4,
    lstMediaC: 28.9,
    lstMaximaC: 33.5,
    ivs: 48,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Preservação",
    mudasNecessarias: 4500,
  },
  {
    id: "ilha-de-itamaraca",
    name: "Ilha de Itamaracá",
    lat: -7.7478,
    lon: -34.8286,
    population: 25836,
    areaKm2: 66.7,
    vegetacaoNativaPct: 48.6,
    coberturaVerdeAmplaPct: 71.4,
    areaUrbanaPct: 9.2,
    lstMediaC: 28.4,
    lstMaximaC: 32.8,
    ivs: 46,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Preservação",
    mudasNecessarias: 3800,
  },
  {
    id: "aracoiaba",
    name: "Araçoiaba",
    lat: -7.7858,
    lon: -35.0931,
    population: 20733,
    areaKm2: 96.4,
    vegetacaoNativaPct: 37.4,
    coberturaVerdeAmplaPct: 64.1,
    areaUrbanaPct: 7.8,
    lstMediaC: 29.4,
    lstMaximaC: 33.9,
    ivs: 54,
    arborizacaoUrbanaStatus: "Dado Ausente no MapBiomas 30m",
    prioridadePlantio: "Preservação",
    mudasNecessarias: 3200,
  },
];

/**
 * Parâmetros de Referência Oficial do MapBiomas (Coleção 11) para Recife
 */
export const MAPBIOMAS_REFERENCE = {
  anoReferencia: 2021,
  anoRecente: 2025,
  recifeReferenciaPct: 25.13, // Referência oficial MapBiomas divulgada
  recifeNativaCalculadaPct: 19.41,
  recifeVerdeAmplaCalculadaPct: 26.85,
  diferencaPp: 1.72,
  resolucaoEspacialMetros: 30,
  classesNativas: [3, 4, 5, 6, 7, 10, 11, 12, 13, 49, 50],
  classesVerdeAmplo: [3, 4, 5, 6, 7, 10, 11, 12, 13, 49, 50, 9, 15, 21],
  classeUrbana: 24,
  classeAgua: 33,
  projetoGCP: "arboris-511518",
  satelites: ["LANDSAT/LC08/C02/T1_L2", "LANDSAT/LC09/C02/T1_L2"],
  bandaTermica: "ST_B10",
  // Fórmula de Conversão Física do Landsat 8/9 ST_B10 para Celsius
  conversaoFormula: "LST (°C) = (ST_B10 * 0.00341802) + 149.0 - 273.15",
  notaMetodologica:
    "O MapBiomas em 30m de resolução não detecta individualmente árvores de calçadas, praças e quintais (arborização urbana). Essa variável é classificada como Dado Ausente e não é considerada como zero, evitando distorções estatísticas.",
};

/**
 * Matriz de Correlações Estatísticas Reais calculada no Projeto Arboris
 * Base: Grade espacial de 1 km com validação por máscara de nuvens e corpos d'água
 */
export interface CorrelationMetric {
  indicador: string;
  nCelulas: number;
  pearsonR: number;
  r2: number;
  pValor: number;
  ic95Inf: number;
  ic95Sup: number;
  spearmanRho: number;
  interpretacao: string;
}

export const ARBORIS_STATISTICAL_CORRELATIONS: CorrelationMetric[] = [
  {
    indicador: "Cobertura verde ampla x Temperatura de superfície",
    nCelulas: 284,
    pearsonR: -0.638,
    r2: 0.407,
    pValor: 0.00001,
    ic95Inf: -0.718,
    ic95Sup: -0.543,
    spearmanRho: -0.619,
    interpretacao:
      "Correlação negativa forte e altamente significativa: áreas com maior presença verde apresentam LST significativamente mais amena (R² = 40,7%).",
  },
  {
    indicador: "Vegetação nativa x Temperatura de superfície",
    nCelulas: 284,
    pearsonR: -0.584,
    r2: 0.341,
    pValor: 0.00001,
    ic95Inf: -0.672,
    ic95Sup: -0.481,
    spearmanRho: -0.562,
    interpretacao:
      "Correlação negativa moderada a forte: os remanescentes de Mata Atlântica e manguezais formam os maiores refúgios térmicos metropolitanos.",
  },
  {
    indicador: "Arborização urbana x Temperatura de superfície",
    nCelulas: 0,
    pearsonR: Number.NaN,
    r2: Number.NaN,
    pValor: Number.NaN,
    ic95Inf: Number.NaN,
    ic95Sup: Number.NaN,
    spearmanRho: Number.NaN,
    interpretacao:
      "Dado Ausente no MapBiomas (resolução 30m insuficiente para copas individuais isoladas). Requer inventário fitossanitário municipal.",
  },
];

/**
 * Amostra representativa da Grade Espacial de Células de 1 km (~0.01°) de Recife
 * Processada com Landsat 8/9 ST_B10 + MapBiomas Coleção 11
 */
export interface SpatialGridCell {
  cellId: string;
  lat: number;
  lon: number;
  bairroReferencia: string;
  coberturaVerdeAmplaPct: number;
  vegetacaoNativaPct: number;
  temperaturaSuperficieC: number;
  fracaoValida: number;
}

export const RECIFE_SPATIAL_GRID: SpatialGridCell[] = [
  { cellId: "L02_C04", lat: -8.015, lon: -34.945, bairroReferencia: "Dois Irmãos / Reserva", coberturaVerdeAmplaPct: 84.2, vegetacaoNativaPct: 76.8, temperaturaSuperficieC: 27.8, fracaoValida: 0.98 },
  { cellId: "L02_C05", lat: -8.015, lon: -34.935, bairroReferencia: "Dois Irmãos / Campus UFRPE", coberturaVerdeAmplaPct: 62.5, vegetacaoNativaPct: 48.1, temperaturaSuperficieC: 29.4, fracaoValida: 0.95 },
  { cellId: "L03_C06", lat: -8.025, lon: -34.925, bairroReferencia: "Casa Forte / Poço", coberturaVerdeAmplaPct: 41.8, vegetacaoNativaPct: 22.3, temperaturaSuperficieC: 30.6, fracaoValida: 0.97 },
  { cellId: "L03_C07", lat: -8.025, lon: -34.915, bairroReferencia: "Espinheiro / Jaqueira", coberturaVerdeAmplaPct: 28.4, vegetacaoNativaPct: 12.0, temperaturaSuperficieC: 32.2, fracaoValida: 0.96 },
  { cellId: "L04_C08", lat: -8.035, lon: -34.895, bairroReferencia: "Santo Amaro Norte", coberturaVerdeAmplaPct: 8.2, vegetacaoNativaPct: 3.1, temperaturaSuperficieC: 36.4, fracaoValida: 0.94 },
  { cellId: "L04_C09", lat: -8.045, lon: -34.885, bairroReferencia: "Santo Amaro / Agamenon", coberturaVerdeAmplaPct: 5.4, vegetacaoNativaPct: 1.8, temperaturaSuperficieC: 37.1, fracaoValida: 0.92 },
  { cellId: "L05_C08", lat: -8.055, lon: -34.890, bairroReferencia: "Boa Vista Central", coberturaVerdeAmplaPct: 7.9, vegetacaoNativaPct: 2.2, temperaturaSuperficieC: 36.3, fracaoValida: 0.95 },
  { cellId: "L05_C07", lat: -8.055, lon: -34.900, bairroReferencia: "Derby / Ilha do Leite", coberturaVerdeAmplaPct: 14.1, vegetacaoNativaPct: 5.6, temperaturaSuperficieC: 34.8, fracaoValida: 0.96 },
  { cellId: "L06_C06", lat: -8.065, lon: -34.910, bairroReferencia: "Afogados / Bacia Tejipió", coberturaVerdeAmplaPct: 11.2, vegetacaoNativaPct: 4.8, temperaturaSuperficieC: 35.5, fracaoValida: 0.93 },
  { cellId: "L06_C07", lat: -8.065, lon: -34.900, bairroReferencia: "Imbiribeira Norte / Shopping", coberturaVerdeAmplaPct: 12.6, vegetacaoNativaPct: 6.1, temperaturaSuperficieC: 34.9, fracaoValida: 0.95 },
  { cellId: "L07_C08", lat: -8.075, lon: -34.895, bairroReferencia: "Parque dos Mangues / Pina", coberturaVerdeAmplaPct: 68.7, vegetacaoNativaPct: 64.2, temperaturaSuperficieC: 28.9, fracaoValida: 0.91 },
  { cellId: "L08_C09", lat: -8.095, lon: -34.890, bairroReferencia: "Boa Viagem Orla", coberturaVerdeAmplaPct: 13.5, vegetacaoNativaPct: 4.2, temperaturaSuperficieC: 33.2, fracaoValida: 0.97 },
  { cellId: "L08_C07", lat: -8.095, lon: -34.915, bairroReferencia: "Imbiribeira Sul / Lagoa Araçá", coberturaVerdeAmplaPct: 16.8, vegetacaoNativaPct: 8.5, temperaturaSuperficieC: 33.8, fracaoValida: 0.94 },
  { cellId: "L09_C05", lat: -8.115, lon: -34.945, bairroReferencia: "Ibura / UR-1 Encostas", coberturaVerdeAmplaPct: 18.2, vegetacaoNativaPct: 9.4, temperaturaSuperficieC: 35.1, fracaoValida: 0.92 },
  { cellId: "L09_C06", lat: -8.115, lon: -34.935, bairroReferencia: "Ibura / Jordão Baixo", coberturaVerdeAmplaPct: 12.1, vegetacaoNativaPct: 5.0, temperaturaSuperficieC: 35.9, fracaoValida: 0.93 },
  { cellId: "L07_C04", lat: -8.075, lon: -34.950, bairroReferencia: "Curado / Jardim São Paulo", coberturaVerdeAmplaPct: 29.5, vegetacaoNativaPct: 15.6, temperaturaSuperficieC: 32.7, fracaoValida: 0.96 },
  { cellId: "L04_C04", lat: -8.045, lon: -34.955, bairroReferencia: "Várzea / Campus UFPE", coberturaVerdeAmplaPct: 46.2, vegetacaoNativaPct: 24.8, temperaturaSuperficieC: 30.2, fracaoValida: 0.98 },
  { cellId: "L03_C03", lat: -8.035, lon: -34.975, bairroReferencia: "Caxangá / Mata do Engenho Uchôa", coberturaVerdeAmplaPct: 58.9, vegetacaoNativaPct: 42.1, temperaturaSuperficieC: 29.1, fracaoValida: 0.97 },
];

/**
 * Camadas Sazonais de LST Landsat 8/9 para Recife (2025)
 * Conforme blocos periods do notebook:
 * - Jan-Mar 2025
 * - Abr-Jun 2025
 * - Jul-Set 2025
 * - Out-Dez 2025
 */
export interface SeasonalThermalComposite {
  periodo: string;
  dataInicio: string;
  dataFim: string;
  tempMediaRecifeC: number;
  tempMaxRecifeC: number;
  anomaliaC: number;
  descricao: string;
}

export const ARBORIS_SEASONAL_COMPOSITES: SeasonalThermalComposite[] = [
  {
    periodo: "Jan–Mar 2025",
    dataInicio: "2025-01-01",
    dataFim: "2025-03-31",
    tempMediaRecifeC: 34.2,
    tempMaxRecifeC: 38.6,
    anomaliaC: +1.8,
    descricao: "Verão com pico de radiação solar direta e menor nebulosidade; ilhas de calor severas na região central.",
  },
  {
    periodo: "Abr–Jun 2025",
    dataInicio: "2025-04-01",
    dataFim: "2025-06-30",
    tempMediaRecifeC: 30.8,
    tempMaxRecifeC: 34.5,
    anomaliaC: -0.4,
    descricao: "Estação chuvosa: alta nebulosidade, arrefecimento pontual por precipitação e umidade elevada.",
  },
  {
    periodo: "Jul–Set 2025",
    dataInicio: "2025-07-01",
    dataFim: "2025-09-30",
    tempMediaRecifeC: 29.4,
    tempMaxRecifeC: 33.1,
    anomaliaC: -1.6,
    descricao: "Período com temperaturas de superfície mais baixas do ano e atuação constante dos ventos alísios de sudeste.",
  },
  {
    periodo: "Out–Dez 2025",
    dataInicio: "2025-10-01",
    dataFim: "2025-12-31",
    tempMediaRecifeC: 33.5,
    tempMaxRecifeC: 37.8,
    anomaliaC: +1.2,
    descricao: "Primavera/início de verão: rápido aquecimento de superfícies asfaltadas e de concreto.",
  },
];
