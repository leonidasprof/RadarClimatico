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
};

export const zones: Zone[] = [
  { id: "boa-viagem", name: "Boa Viagem", temp: 33.4, feels: 39.1, humidity: 71, canopy: 12, vuln: 34, rating: "C", x: 62, y: 78, size: 150 },
  { id: "santo-amaro", name: "Santo Amaro", temp: 36.8, feels: 44.2, humidity: 58, canopy: 5, vuln: 76, rating: "E", x: 47, y: 34, size: 175 },
  { id: "boa-vista", name: "Boa Vista", temp: 36.1, feels: 43.0, humidity: 60, canopy: 7, vuln: 55, rating: "E", x: 40, y: 46, size: 145 },
  { id: "afogados", name: "Afogados", temp: 35.2, feels: 41.6, humidity: 63, canopy: 9, vuln: 68, rating: "D", x: 26, y: 62, size: 160 },
  { id: "imbiribeira", name: "Imbiribeira", temp: 34.6, feels: 40.4, humidity: 66, canopy: 11, vuln: 61, rating: "D", x: 46, y: 70, size: 130 },
  { id: "casa-forte", name: "Casa Forte", temp: 30.9, feels: 34.2, humidity: 74, canopy: 38, vuln: 18, rating: "B", x: 30, y: 30, size: 120 },
  { id: "dois-irmaos", name: "Dois Irmãos", temp: 28.7, feels: 31.0, humidity: 82, canopy: 64, vuln: 22, rating: "A", x: 15, y: 18, size: 135 },
  { id: "ibura", name: "Ibura", temp: 34.9, feels: 41.0, humidity: 64, canopy: 16, vuln: 82, rating: "D", x: 33, y: 88, size: 140 },
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

export const alerts = [
  {
    id: 1,
    level: "critico" as const,
    zone: "Santo Amaro",
    title: "Onda de calor prevista",
    detail: "Sensação térmica de 44 °C prevista para as próximas 3 h. Aglomeração de ambulantes e ponto de ônibus sem sombreamento.",
    time: "há 4 min",
    eta: "13h20 – 16h00",
  },
  {
    id: 2,
    level: "alto" as const,
    zone: "Boa Vista",
    title: "Anomalia térmica detectada",
    detail: "Sensores da frota de ônibus registraram +4,1 °C acima da média histórica do trecho da Av. Conde da Boa Vista.",
    time: "há 18 min",
    eta: "12h50 – 15h10",
  },
  {
    id: 3,
    level: "moderado" as const,
    zone: "Imbiribeira",
    title: "Rota crítica sem sombra",
    detail: "Trecho de 1,4 km com índice de sombreamento abaixo de 0,2 em horário de pico de deslocamento a pé.",
    time: "há 42 min",
    eta: "14h00 – 17h00",
  },
];

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
  if (temp >= 30) return "var(--heat-2)";
  return "var(--heat-1)";
}

export type AlertLevel = "critico" | "alto" | "moderado";

export type AlertItem = {
  id: string | number;
  level: AlertLevel;
  zone: string;
  title: string;
  detail: string;
  time: string;
  eta: string;
  notified?: boolean;
};

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

