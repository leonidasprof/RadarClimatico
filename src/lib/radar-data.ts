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
