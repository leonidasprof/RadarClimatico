export type Zone = {
  id: string;
  name: string;
  temp: number;
  feels: number;
  humidity: number;
  canopy: number; // % cobertura vegetal
  vuln: number; // índice de vulnerabilidade social 0-100
  rating: "A" | "B" | "C" | "D" | "E";
  x: number; // % posição no mapa
  y: number;
  size: number; // px
  // Dados de NDVI e arborização urbana
  ndvi: number; // Índice NDVI médio (-1 a +1)
  treesNeeded: number; // Mudas estimadas para atingir a meta municipal de 30%
  priorityStatus: "Crítica" | "Alta" | "Moderada" | "Refúgio";
  // Dados demográficos e de saúde pública
  popTotal: number;
  popLowIncomeRisk: number; // População de baixa renda / vulnerabilidade crítica
  upaWeeklyVisits: number; // Atendimentos UPA desidratação/insolação na semana
  hospitalAdmissions: number; // Internações graves por choque térmico/síncope
  vulnerableGroups: number; // Crianças <5 anos e idosos >65 anos expostos
  sanitationDeficitPct: number; // % domicílios com déficit de saneamento
  upaReference: string; // Unidade de Saúde / UPA de referência territorial
};

export const zones: Zone[] = [
  {
    id: "boa-viagem",
    name: "Boa Viagem",
    temp: 33.4,
    feels: 39.1,
    humidity: 71,
    canopy: 12,
    vuln: 34,
    rating: "C",
    x: 62,
    y: 78,
    size: 150,
    ndvi: 0.26,
    treesNeeded: 8200,
    priorityStatus: "Moderada",
    popTotal: 122000,
    popLowIncomeRisk: 14500,
    upaWeeklyVisits: 32,
    hospitalAdmissions: 9,
    vulnerableGroups: 18200,
    sanitationDeficitPct: 8,
    upaReference: "UPA Imbiribeira / Policlínica Pina",
  },
  {
    id: "santo-amaro",
    name: "Santo Amaro",
    temp: 36.8,
    feels: 44.2,
    humidity: 58,
    canopy: 5,
    vuln: 76,
    rating: "E",
    x: 47,
    y: 34,
    size: 175,
    ndvi: 0.11,
    treesNeeded: 12400,
    priorityStatus: "Crítica",
    popTotal: 27900,
    popLowIncomeRisk: 21200,
    upaWeeklyVisits: 84,
    hospitalAdmissions: 28,
    vulnerableGroups: 7400,
    sanitationDeficitPct: 42,
    upaReference: "UPA Olinda/Recife / Policlínica Waldemar de Oliveira",
  },
  {
    id: "boa-vista",
    name: "Boa Vista",
    temp: 36.1,
    feels: 43.0,
    humidity: 60,
    canopy: 7,
    vuln: 55,
    rating: "E",
    x: 40,
    y: 46,
    size: 145,
    ndvi: 0.14,
    treesNeeded: 9800,
    priorityStatus: "Crítica",
    popTotal: 17500,
    popLowIncomeRisk: 8600,
    upaWeeklyVisits: 62,
    hospitalAdmissions: 19,
    vulnerableGroups: 4100,
    sanitationDeficitPct: 18,
    upaReference: "Hospital da Restauração / UPA Torrões",
  },
  {
    id: "afogados",
    name: "Afogados",
    temp: 35.2,
    feels: 41.6,
    humidity: 63,
    canopy: 9,
    vuln: 68,
    rating: "D",
    x: 26,
    y: 62,
    size: 160,
    ndvi: 0.19,
    treesNeeded: 11200,
    priorityStatus: "Alta",
    popTotal: 38200,
    popLowIncomeRisk: 24800,
    upaWeeklyVisits: 58,
    hospitalAdmissions: 17,
    vulnerableGroups: 8900,
    sanitationDeficitPct: 36,
    upaReference: "Policlínica Agamenon Magalhães / UPA Torrões",
  },
  {
    id: "imbiribeira",
    name: "Imbiribeira",
    temp: 34.6,
    feels: 40.4,
    humidity: 66,
    canopy: 11,
    vuln: 61,
    rating: "D",
    x: 46,
    y: 70,
    size: 130,
    ndvi: 0.23,
    treesNeeded: 14600,
    priorityStatus: "Alta",
    popTotal: 49800,
    popLowIncomeRisk: 28400,
    upaWeeklyVisits: 51,
    hospitalAdmissions: 15,
    vulnerableGroups: 11200,
    sanitationDeficitPct: 29,
    upaReference: "UPA Imbiribeira (Av. Mascarenhas de Morais)",
  },
  {
    id: "casa-forte",
    name: "Casa Forte",
    temp: 30.9,
    feels: 34.2,
    humidity: 74,
    canopy: 38,
    vuln: 18,
    rating: "B",
    x: 30,
    y: 30,
    size: 120,
    ndvi: 0.62,
    treesNeeded: 0,
    priorityStatus: "Refúgio",
    popTotal: 15400,
    popLowIncomeRisk: 2100,
    upaWeeklyVisits: 14,
    hospitalAdmissions: 3,
    vulnerableGroups: 3800,
    sanitationDeficitPct: 4,
    upaReference: "UPA Nova Descoberta",
  },
  {
    id: "dois-irmaos",
    name: "Dois Irmãos",
    temp: 28.7,
    feels: 31.0,
    humidity: 82,
    canopy: 64,
    vuln: 22,
    rating: "A",
    x: 15,
    y: 18,
    size: 135,
    ndvi: 0.79,
    treesNeeded: 0,
    priorityStatus: "Refúgio",
    popTotal: 12800,
    popLowIncomeRisk: 3400,
    upaWeeklyVisits: 9,
    hospitalAdmissions: 1,
    vulnerableGroups: 2900,
    sanitationDeficitPct: 9,
    upaReference: "UPA Caxangá / Policlínica Lessa de Andrade",
  },
  {
    id: "ibura",
    name: "Ibura",
    temp: 34.9,
    feels: 41.0,
    humidity: 64,
    canopy: 16,
    vuln: 82,
    rating: "D",
    x: 33,
    y: 88,
    size: 140,
    ndvi: 0.31,
    treesNeeded: 16800,
    priorityStatus: "Crítica",
    popTotal: 52400,
    popLowIncomeRisk: 39800,
    upaWeeklyVisits: 78,
    hospitalAdmissions: 24,
    vulnerableGroups: 13900,
    sanitationDeficitPct: 48,
    upaReference: "UPA Ibura (UR-1 / Zumbi do Pacheco)",
  },
];

export type RatingDefinition = {
  rating: "A" | "B" | "C" | "D" | "E";
  name: string;
  shortDesc: string;
  fullDesc: string;
  color: string;
  urgency: string;
};

export const ratingDefinitions: Record<"A" | "B" | "C" | "D" | "E", RatingDefinition> = {
  A: {
    rating: "A",
    name: "Excelente / Refúgio Climático",
    shortDesc: "Baixo estresse e alto conforto térmico",
    fullDesc: "Microclima favorável e protetor, sensação térmica amena (≤32 °C) e alta cobertura arbórea (>50%). Risco nulo à saúde pública.",
    color: "oklch(0.68 0.18 142)",
    urgency: "Preservação",
  },
  B: {
    rating: "B",
    name: "Favorável / Seguro",
    shortDesc: "Microclima estável e equilibrado",
    fullDesc: "Microclima estável, boa arborização (30–50%), baixo estresse térmico para a população e boa retenção de umidade.",
    color: "oklch(0.75 0.14 125)",
    urgency: "Preventivo",
  },
  C: {
    rating: "C",
    name: "Moderado / Atenção",
    shortDesc: "Desconforto pontual em horários de pico",
    fullDesc: "Desconforto térmico perceptível em picos diurnos, cobertura arbórea média (15–30%), requer hidratação preventiva para pedestres.",
    color: "var(--heat-3)",
    urgency: "Monitoramento",
  },
  D: {
    rating: "D",
    name: "Alto Risco / Alerta",
    shortDesc: "Estresse térmico severo e pouca vegetação",
    fullDesc: "Estresse térmico elevado (sensação >40 °C), déficit crítico de árvores (<15%), risco a idosos, crianças e trabalhadores ao ar livre.",
    color: "var(--heat-4)",
    urgency: "Prioridade Alta",
  },
  E: {
    rating: "E",
    name: "Crítico / Risco Extremo",
    shortDesc: "Ilha de calor crítica e urgência de ação",
    fullDesc: "Ilha de calor severa (sensação >43 °C), solo impermeabilizado, alta vulnerabilidade social. Demanda resposta imediata da Defesa Civil.",
    color: "var(--heat-5)",
    urgency: "Despacho Imediato",
  },
};

export type OrganRecommendation = {
  organ: string;
  urgency: "Imediata" | "Alta" | "Monitoramento" | "Preventiva";
  action: string;
  description: string;
};

export const zoneOrganRecommendations: Record<string, OrganRecommendation> = {
  "santo-amaro": {
    organ: "Defesa Civil & Secretaria de Saúde",
    urgency: "Imediata",
    action: "Despacho de caminhões-pipa e agentes comunitários",
    description: "Priorizar o envio emergencial de caminhões-pipa para as áreas de baixa renda. A operação requer acompanhamento de agentes comunitários para suporte local e orientação sobre prevenção à insolação.",
  },
  "boa-vista": {
    organ: "Defesa Civil & CTTU",
    urgency: "Imediata",
    action: "Acionamento de aspersores térmicos e contenção de pedestres em áreas expostas",
    description: "Mobilizar equipes para mitigação no corredor da Av. Conde da Boa Vista e orientar trabalhadores urbanos para refúgios refrigerados.",
  },
  "afogados": {
    organ: "Defesa Civil & EMLURB",
    urgency: "Alta",
    action: "Instalação de estruturas provisórias de sombreamento e distribuição de água",
    description: "Intervir no entorno do Mercado de Afogados e feiras livres, garantindo pontos de alívio térmico imediato e fiscalização de insolação.",
  },
  "imbiribeira": {
    organ: "EMLURB & Defesa Civil",
    urgency: "Alta",
    action: "Cobertura emergencial de paradas de ônibus e vistoria em rotas a pé",
    description: "Trecho de 1,4 km com déficit crítico de sombra; instalar coberturas provisórias de lona refletiva nos pontos de maior embarque.",
  },
  "ibura": {
    organ: "Defesa Civil & Assistência Social",
    urgency: "Alta",
    action: "Rondas comunitárias preventivas e suporte a famílias vulneráveis",
    description: "Monitorar encostas com alta retenção de radiação infravermelha e emitir alerta sonoro via líderes comunitários.",
  },
  "boa-viagem": {
    organ: "Defesa Civil & Guarda Municipal",
    urgency: "Monitoramento",
    action: "Campanha de alerta e conscientização na orla e centros de compras",
    description: "Alertar banhistas e trabalhadores sobre radiação solar máxima e hidratação regular entre 11h e 15h.",
  },
  "casa-forte": {
    organ: "Secretaria de Meio Ambiente",
    urgency: "Preventiva",
    action: "Manutenção fitossanitária e vigilância do corredor verde da Zona Norte",
    description: "Preservar a integridade do dossel arbóreo como barreira térmica protetora para os bairros limítrofes mais quentes.",
  },
  "dois-irmaos": {
    organ: "Secretaria de Meio Ambiente",
    urgency: "Preventiva",
    action: "Proteção da Reserva Florestal e monitoramento de umidade microclimática",
    description: "Assegurar a conservação do refúgio florestal metropolitano que ameniza a temperatura de toda a bacia do Capibaribe.",
  },
};

export const historyDays = ["18/08", "19/08", "20/08", "21/08", "22/08", "23/08", "24/08"];

// Histórico dos últimos 7 dias (máxima diária, °C) — derivado de forma determinística
export function zoneHistory(zone: Zone) {
  const offsets = [-1.8, -0.9, 0.4, -1.2, 1.1, 0.2, 0];
  return historyDays.map((d, i) => ({
    day: d,
    t: Number((zone.temp + offsets[i]! + ((zone.id.charCodeAt(i % zone.id.length) % 7) - 3) * 0.15).toFixed(1)),
  }));
}

// ─── Dados históricos para drill-down hierárquico (Ano → Mês → Dias) ───────

/**
 * Data de referência corrente do sistema: 20 de Outubro de 2026.
 * Meses posteriores (Novembro e Dezembro de 2026) e dias posteriores a 20/10/2026
 * ainda não transcorreram e não possuem dados meteorológicos consolidados.
 */
export const CURRENT_DATE_REFERENCE = {
  year: 2026,
  monthIndex: 9, // 0 = Jan, 9 = Outubro, 10 = Nov, 11 = Dez
  day: 20,
} as const;

/**
 * Verifica se um determinado mês/ano já possui dados consolidados (já ocorreu ou é o mês corrente).
 */
export function isMonthAvailable(year: number, monthIndex: number): boolean {
  if (year < CURRENT_DATE_REFERENCE.year) return true;
  if (year > CURRENT_DATE_REFERENCE.year) return false;
  return monthIndex <= CURRENT_DATE_REFERENCE.monthIndex;
}

/**
 * Retorna o total de dias disponíveis com dados consolidados para o mês/ano.
 * Em Outubro/2026 (mês corrente), os dados vão até o dia 20.
 */
export function getMaxAvailableDaysInMonth(year: number, monthIndex: number): number {
  const daysInMonthTable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const standardDays = daysInMonthTable[monthIndex] ?? 30;

  if (year === CURRENT_DATE_REFERENCE.year && monthIndex === CURRENT_DATE_REFERENCE.monthIndex) {
    return CURRENT_DATE_REFERENCE.day; // 20 dias consolidados até hoje
  }
  return standardDays;
}

export type MonthlyRecord = { month: string; monthIndex: number; avgMax: number; isPartial?: boolean };
export type YearlyRecord = { year: number; avgMax: number; isCurrentYear?: boolean };

/**
 * Nomes abreviados dos meses.
 */
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Sazonalidade climática do Recife: modulação relativa por mês (°C em relação à média anual)
const RECIFE_SEASONAL_OFFSET = [
  1.8,  // Jan — verão, quente
  1.4,  // Fev
  0.6,  // Mar
  -0.4, // Abr — início das chuvas
  -1.6, // Mai — período úmido
  -2.2, // Jun — mais fresco
  -2.4, // Jul — mínima anual
  -1.2, // Ago
  0.3,  // Set — seco, aquecendo
  1.2,  // Out
  1.6,  // Nov
  1.9,  // Dez
];

/**
 * Gera histórico mensal para uma zona.
 * Para o ano corrente (2026), retorna EXCLUSIVAMENTE os meses já transcorridos (Janeiro a Outubro).
 * Novembro e Dezembro de 2026 não são incluídos pois ainda não existem dados.
 */
export function zoneMonthlyHistory(zone: Zone, year: number): MonthlyRecord[] {
  // Ano de referência: 2026 = atual. Para anos anteriores, aplica leve tendência de aquecimento.
  const yearDelta = (CURRENT_DATE_REFERENCE.year - year) * 0.18;
  const idSeed = zone.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 7;

  // Limita até o mês atual para o ano de 2026 (máximo índice 9 = Outubro)
  const maxMonthIdx = year === CURRENT_DATE_REFERENCE.year ? CURRENT_DATE_REFERENCE.monthIndex : 11;
  const availableMonths = MONTH_NAMES.slice(0, maxMonthIdx + 1);

  return availableMonths.map((month, i) => ({
    month,
    monthIndex: i,
    isPartial: year === CURRENT_DATE_REFERENCE.year && i === CURRENT_DATE_REFERENCE.monthIndex,
    avgMax: Number(
      (
        zone.temp +
        RECIFE_SEASONAL_OFFSET[i]! +
        ((idSeed + i) % 5) * 0.12 -
        yearDelta
      ).toFixed(1)
    ),
  }));
}

export function zoneYearlyHistory(zone: Zone): YearlyRecord[] {
  const years = [2022, 2023, 2024, 2025, 2026];
  const idSeed = zone.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 5;
  return years.map((year, i) => {
    // Para o ano de 2026 (ano corrente), calculamos a média das máximas com base nos meses já decorridos (Jan a Out)
    if (year === CURRENT_DATE_REFERENCE.year) {
      const monthly = zoneMonthlyHistory(zone, year);
      const avg = monthly.reduce((acc, m) => acc + m.avgMax, 0) / monthly.length;
      return {
        year,
        avgMax: Number(avg.toFixed(1)),
        isCurrentYear: true,
      };
    }

    return {
      year,
      avgMax: Number(
        (
          zone.temp -
          (CURRENT_DATE_REFERENCE.year - year) * 0.18 +
          ((idSeed + i) % 3) * 0.08
        ).toFixed(1)
      ),
    };
  });
}

export type DailyRecord = { day: string; date: string; t: number };

/**
 * Gera histórico diário de máximas para uma zona em um mês/ano específico.
 * Para Outubro de 2026, limita estritamente ao dia 20 (data atual).
 * Para meses futuros como Novembro e Dezembro de 2026, retorna lista vazia.
 */
export function zoneDailyHistory(
  zone: Zone,
  year: number,
  monthIndex: number,
  numDays: number = 7,
  startDay: number = 1
): DailyRecord[] {
  if (!isMonthAvailable(year, monthIndex)) {
    return [];
  }

  const maxAvailableDays = getMaxAvailableDaysInMonth(year, monthIndex);
  if (startDay > maxAvailableDays) {
    return [];
  }

  // Ajusta o número de dias para não ultrapassar a data atual
  const effectiveDays = Math.min(numDays, maxAvailableDays - startDay + 1);
  const yearDelta = (CURRENT_DATE_REFERENCE.year - year) * 0.18;
  const idSeed = zone.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseTemp = zone.temp + RECIFE_SEASONAL_OFFSET[monthIndex]! - yearDelta;

  return Array.from({ length: effectiveDays }, (_, i) => {
    const dayNum = startDay + i;
    const noise = Math.sin((dayNum + idSeed) * 1.7) * 1.2 + Math.cos((dayNum + idSeed) * 0.9) * 0.7;
    return {
      day: String(dayNum).padStart(2, "0"),
      date: `${String(dayNum).padStart(2, "0")}/${String(monthIndex + 1).padStart(2, "0")}`,
      t: Number((baseTemp + noise).toFixed(1)),
    };
  });
}

export const AVAILABLE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;
export const MONTH_NAMES_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const;
export const MONTH_NAMES_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] as const;
export const DAY_RANGE_OPTIONS = [3, 7, 14, 30] as const;
export const hourly = [
  { h: "06h", t: 26.1 },
  { h: "08h", t: 28.4 },
  { h: "10h", t: 31.7 },
  { h: "12h", t: 34.9 },
  { h: "14h", t: 36.8 },
  { h: "16h", t: 35.4 },
  { h: "18h", t: 32.2 },
  { h: "20h", t: 29.8 },
  { h: "22h", t: 28.3 },
];

export const priorities = [
  { zone: "Santo Amaro", score: 94, action: "Plantio + sombreamento de parada" },
  { zone: "Ibura", score: 88, action: "Corredor verde e bebedouros" },
  { zone: "Afogados", score: 81, action: "Arborização viária (2,3 km)" },
  { zone: "Imbiribeira", score: 73, action: "Cobertura em ponto de ônibus" },
];

export function heatVar(temp: number) {
  if (temp >= 36) return "var(--heat-5)";
  if (temp >= 34) return "var(--heat-4)";
  if (temp >= 32) return "var(--heat-3)";
  if (temp >= 28) return "oklch(0.75 0.14 125)";
  return "oklch(0.68 0.18 142)";
}

export function ratingColor(rating: "A" | "B" | "C" | "D" | "E") {
  return ratingDefinitions[rating]?.color || "var(--heat-3)";
}

export type DayRange = 3 | 7 | 14 | 30;

export type AlertLevel = "critico" | "alto" | "moderado";

export type AlertItem = {
  id: string | number;
  level: AlertLevel;
  zone: string;
  title: string;
  detail: string;
  time: string; // Ex: "Hoje às 11:20" ou "19/10 às 14:35"
  date?: string; // Ex: "19/10/2026"
  eta: string;
  notified?: boolean; // Se foi despachado / arquivado no histórico
  recordedTemp?: number; // Temperatura registrada no momento exato em que o alerta foi gerado
  recordedFeels?: number; // Sensação térmica no momento do disparo
  currentTemp?: number; // Temperatura atual do bairro para detecção de mudança brusca
  conditionShift?: string | undefined; // Mensagem informativa caso o tempo mude após o alerta
  isDynamic?: boolean; // Gerado automaticamente pela regra de negócio das APIs
};

/**
 * Alertas iniciais pré-armazenados no Histórico de Alertas.
 * Representam as ocorrências geradas nos horários anteriores do dia (pico matutino)
 * para auditoria e prestação de contas, já despachadas às equipes de campo.
 */
export const alerts: AlertItem[] = [
  {
    id: "hist-1",
    level: "critico",
    zone: "Santo Amaro",
    title: "Pico de Onda de Calor (Matutino)",
    detail: "Sensação térmica atingiu 44.2 °C no período matutino com aglomeração em pontos de ônibus sem sombreamento.",
    date: "19/10/2026",
    time: "Hoje às 11:20",
    eta: "Janela matutina (11h20 – 14h00)",
    recordedTemp: 36.8,
    recordedFeels: 44.2,
    currentTemp: 31.8,
    notified: true,
  },
  {
    id: "hist-2",
    level: "alto",
    zone: "Boa Vista",
    title: "Anomalia Térmica em Corredor de Transporte",
    detail: "Sensores móveis registraram anomalia de +4,1 °C acima da média na Av. Conde da Boa Vista no início da manhã.",
    date: "19/10/2026",
    time: "Hoje às 09:45",
    eta: "Janela 09h45 – 12h10",
    recordedTemp: 34.9,
    recordedFeels: 39.8,
    currentTemp: 31.2,
    notified: true,
  },
  {
    id: "hist-3",
    level: "moderado",
    zone: "Imbiribeira",
    title: "Rota Crítica com Déficit de Sombra",
    detail: "Sobrecarga de radiação solar em trecho de 1,4 km de deslocamento de pedestres registrado nas primeiras horas do dia.",
    date: "19/10/2026",
    time: "Hoje às 08:30",
    eta: "Janela 08h30 – 11h00",
    recordedTemp: 32.4,
    recordedFeels: 36.2,
    currentTemp: 30.5,
    notified: true,
  },
];

/**
 * REGRA DE NEGÓCIO OFICIAL DO ARBORIS:
 * Avalia as temperaturas em tempo real dos bairros e gera alertas dinâmicos
 * apenas se os limiares térmicos forem ultrapassados, carimbando dia e horário de geração.
 * Se o tempo mudar bruscamente (ex: queda acentuada de temperatura), registra a mudança.
 */
export function evaluateWeatherAlerts(
  zonesList: Zone[],
  currentAlerts: AlertItem[]
): AlertItem[] {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const updatedAlerts = [...currentAlerts];

  zonesList.forEach((zone) => {
    const isCritical = zone.feels >= 41.0 || zone.temp >= 36.0;
    const isHigh = (zone.feels >= 38.0 && zone.feels < 41.0) || (zone.temp >= 34.5 && zone.temp < 36.0);
    const isModerate = zone.feels >= 36.0 && zone.humidity >= 65;

    // Procura se já existe alerta ativo para esse bairro
    const activeIndex = updatedAlerts.findIndex((a) => !a.notified && a.zone === zone.name);

    if (isCritical || isHigh || isModerate) {
      const level: AlertLevel = isCritical ? "critico" : isHigh ? "alto" : "moderado";

      if (activeIndex === -1) {
        // Gera novo alerta ativo com dia e horário exato
        updatedAlerts.unshift({
          id: `dyn-${zone.id}-${Date.now()}`,
          level,
          zone: zone.name,
          title: isCritical
            ? `Onda de Calor Extrema: ${zone.name}`
            : isHigh
              ? `Anomalia Térmica Elevada: ${zone.name}`
              : `Alerta Preventivo: Sobrecarga Térmica em ${zone.name}`,
          detail: `Detectado em tempo real às ${timeStr}: Temperatura de ${zone.temp.toFixed(1)} °C e sensação térmica de ${zone.feels.toFixed(1)} °C. Limiar de risco operacional ultrapassado.`,
          date: dateStr,
          time: `Hoje às ${timeStr}`,
          recordedTemp: zone.temp,
          recordedFeels: zone.feels,
          currentTemp: zone.temp,
          eta: `Próximas 3 horas (até ${(now.getHours() + 3) % 24}h00)`,
          notified: false,
          isDynamic: true,
        });
      } else {
        // Atualiza a temperatura atual no alerta existente e detecta mudanças bruscas
        const existing = updatedAlerts[activeIndex]!;
        const tempDrop = (existing.recordedTemp || zone.temp) - zone.temp;
        updatedAlerts[activeIndex] = {
          ...existing,
          currentTemp: zone.temp,
          conditionShift:
            tempDrop >= 2.0
              ? `Atenção: A temperatura caiu ${tempDrop.toFixed(1)} °C desde o momento de geração deste alerta.`
              : undefined,
        };
      }
    } else if (activeIndex !== -1) {
      // Se a temperatura do bairro caiu e saiu dos limiares de risco (tempo mudou bruscamente)
      const existing = updatedAlerts[activeIndex]!;
      updatedAlerts[activeIndex] = {
        ...existing,
        notified: true, // Arquiva no histórico
        currentTemp: zone.temp,
        conditionShift: `O tempo mudou: temperatura normalizou para ${zone.temp.toFixed(1)} °C após o alerta gerado às ${existing.time}.`,
        detail: `${existing.detail} [Condição normalizada: temperatura baixou para ${zone.temp.toFixed(1)} °C às ${timeStr}].`,
      };
    }
  });

  return updatedAlerts;
}

/**
 * Retorna tonalidade verde proporcional à densidade arbórea.
 * Usado na camada 'Cobertura vegetal' do Heatmap e no Dashboard Verde.
 */
export function canopyVar(canopy: number) {
  if (canopy >= 50) return "var(--canopy)";
  if (canopy >= 30) return "oklch(0.68 0.16 142)";
  if (canopy >= 15) return "oklch(0.75 0.14 125)";
  return "oklch(0.78 0.12 95)"; // Déficit crítico de vegetação
}

/**
 * Retorna cor baseada no IVS (Índice de Vulnerabilidade Social 0-100).
 * Usado na camada 'Vulnerabilidade' do Heatmap para evidenciar populações expostas.
 */
export function vulnVar(vuln: number) {
  if (vuln >= 70) return "var(--heat-5)";
  if (vuln >= 50) return "var(--heat-4)";
  if (vuln >= 30) return "var(--heat-3)";
  return "var(--accent)";
}

/**
 * Lógica de negócio para análise comparativa entre dois bairros:
 * Calcula deltas térmicos, de arborização e vulnerabilidade social
 * para subsidiar tomadas de decisão da Defesa Civil e Planejamento Urbano.
 */
export function calculateMicroclimateDelta(primary: Zone, secondary: Zone) {
  return {
    tempDiff: Number((primary.temp - secondary.temp).toFixed(1)),
    feelsDiff: Number((primary.feels - secondary.feels).toFixed(1)),
    canopyDiff: Number((primary.canopy - secondary.canopy).toFixed(1)),
    vulnDiff: Number((primary.vuln - secondary.vuln).toFixed(0)),
    humidityDiff: Number((primary.humidity - secondary.humidity).toFixed(0)),
  };
}

/**
 * Retorna cor baseada no índice NDVI (-1 a +1)
 */
export function ndviVar(ndvi: number) {
  if (ndvi >= 0.6) return "var(--canopy)"; // #10b981 dossel denso
  if (ndvi >= 0.35) return "oklch(0.72 0.16 135)"; // arborização média
  if (ndvi >= 0.2) return "oklch(0.76 0.14 115)"; // vegetação rasteira / gramíneas
  if (ndvi >= 0.12) return "oklch(0.78 0.12 85)"; // solo impermeável / transição
  return "oklch(0.68 0.18 45)"; // asfalto e concreto crítico (NDVI < 0.12)
}

export type WeeklyHealthData = {
  day: string;
  date: string;
  temp: number; // °C máx diária
  feels: number; // °C sensação térmica
  upaVisits: number; // Atendimentos UPA (Desidratação / Insolação)
  hospitalAdmissions: number; // Internações clínicas
  criticalHeat: boolean; // Flag de pico térmico
  note?: string;
};

/**
 * Curva semanal correlacionando a temperatura diária com o volume
 * de internações hospitalares e atendimentos de emergência nas UPAs do Recife.
 */
export const weeklyHealthCorrelation: WeeklyHealthData[] = [
  {
    day: "Seg",
    date: "18/08",
    temp: 31.4,
    feels: 35.2,
    upaVisits: 38,
    hospitalAdmissions: 8,
    criticalHeat: false,
    note: "Operação estável nas UPAs da RMR",
  },
  {
    day: "Ter",
    date: "19/08",
    temp: 32.8,
    feels: 37.0,
    upaVisits: 44,
    hospitalAdmissions: 11,
    criticalHeat: false,
    note: "Leve elevação nos registros pediátricos",
  },
  {
    day: "Qua",
    date: "20/08",
    temp: 34.6,
    feels: 40.4,
    upaVisits: 68,
    hospitalAdmissions: 17,
    criticalHeat: false,
    note: "Alerta preventivo Defesa Civil / Saúde",
  },
  {
    day: "Qui",
    date: "21/08",
    temp: 36.8,
    feels: 44.2,
    upaVisits: 118,
    hospitalAdmissions: 34,
    criticalHeat: true,
    note: "Pico de 36,8 °C: salto de +168% em admissões de emergência por choque térmico",
  },
  {
    day: "Sex",
    date: "22/08",
    temp: 35.9,
    feels: 42.8,
    upaVisits: 96,
    hospitalAdmissions: 26,
    criticalHeat: true,
    note: "Persistência do calor: 96 atendimentos por desidratação e síncope",
  },
  {
    day: "Sáb",
    date: "23/08",
    temp: 33.2,
    feels: 38.5,
    upaVisits: 52,
    hospitalAdmissions: 14,
    criticalHeat: false,
    note: "Queda gradual com entrada de ventos alísios",
  },
  {
    day: "Dom",
    date: "24/08",
    temp: 32.1,
    feels: 36.6,
    upaVisits: 40,
    hospitalAdmissions: 9,
    criticalHeat: false,
    note: "Normalização do fluxo hospitalar",
  },
];

/**
 * Simulador de Arrefecimento Urbano:
 * Calcula a queda projetada na temperatura de superfície e sensação térmica
 * com base no percentual adicional de árvores simulado.
 */
export function calculateCoolingImpact(zone: Zone, additionalTreesPct: number) {
  // A cada +1% de cobertura de copa: queda média de 0,21 °C na temperatura e 0,27 °C na sensação
  const tempDrop = Number((additionalTreesPct * 0.21).toFixed(1));
  const feelsDrop = Number((additionalTreesPct * 0.27).toFixed(1));
  const newTemp = Number(Math.max(26.5, zone.temp - tempDrop).toFixed(1));
  const newFeels = Number(Math.max(28.0, zone.feels - feelsDrop).toFixed(1));
  const newCanopy = Math.min(100, zone.canopy + additionalTreesPct);

  // Estimativa de mudas nativas para plantio (aprox. 310 mudas por cada 1% de cobertura territorial no bairro)
  const treesToPlant = Math.round(additionalTreesPct * 310);
  // Sequestro médio de CO2: ~22 kg por árvore adulta/ano (0,022 ton)
  const co2Tons = Number((treesToPlant * 0.022).toFixed(1));
  // Área de sombra contínua estimada em calçadas/vias (aprox. 14 m² por muda adulta)
  const shadedAreaM2 = treesToPlant * 14;

  // Projeção da nova classe bioclimática
  let projectedRating: "A" | "B" | "C" | "D" | "E" = zone.rating;
  if (newTemp <= 29.5 && newCanopy >= 45) projectedRating = "A";
  else if (newTemp <= 32.2 && newCanopy >= 28) projectedRating = "B";
  else if (newTemp <= 34.2) projectedRating = "C";
  else if (newTemp <= 35.8) projectedRating = "D";
  else projectedRating = "E";

  return {
    tempDrop,
    feelsDrop,
    newTemp,
    newFeels,
    newCanopy,
    treesToPlant,
    co2Tons,
    shadedAreaM2,
    projectedRating,
  };
}

/**
 * Análise comparativa sociodemográfica e epidemiológica entre dois territórios
 */
export function calculateVulnerabilityDelta(primary: Zone, secondary: Zone) {
  return {
    vulnDiff: primary.vuln - secondary.vuln,
    lowIncomeDiff: primary.popLowIncomeRisk - secondary.popLowIncomeRisk,
    upaVisitsDiff: primary.upaWeeklyVisits - secondary.upaWeeklyVisits,
    hospitalAdmissionsDiff: primary.hospitalAdmissions - secondary.hospitalAdmissions,
    vulnerableGroupsDiff: primary.vulnerableGroups - secondary.vulnerableGroups,
    sanitationDiff: primary.sanitationDeficitPct - secondary.sanitationDeficitPct,
  };
}


