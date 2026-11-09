/**
 * Serviço de Alerta de Calor (Sistema de Alerta e Resposta ao Calor — Arboris)
 *
 * O que faz:
 *  1. Busca a previsão HORÁRIA de 72h do Open-Meteo para CADA bairro monitorado
 *     (uma única requisição com várias coordenadas — gratuita e sem chave).
 *  2. Aplica o ajuste de ilha de calor de cada bairro (tempDelta já calibrado no projeto).
 *  3. Calcula o Índice de Calor (fórmula oficial NOAA / Rothfusz), que combina
 *     temperatura + umidade — essencial em uma cidade úmida como o Recife.
 *  4. Classifica cada hora em 5 níveis (Normal → Emergência), no mesmo formato
 *     de níveis que a Defesa Civil / COP já usa para chuva.
 *  5. Resume por dia: nível máximo, hora de pico, horas em nível ≥ Alerta e
 *     prioridade de ação (nível × pessoas vulneráveis expostas).
 */
import { RECIFE_ZONE_COORDINATES } from "./realtime-weather-service";
import type { Zone } from "@/lib/radar-data";

export type HeatLevelId = "normal" | "atencao" | "alerta" | "perigo" | "emergencia";

export type HeatLevel = {
  id: HeatLevelId;
  rank: number; // 0..4
  label: string;
  min: number; // índice de calor mínimo (°C) para entrar no nível
  color: string;
  softBg: string;
  meaning: string;
};

/**
 * Limiares iniciais (°C de Índice de Calor). Baseados na escala NOAA e ajustados
 * para a população aclimatada do Recife. Devem ser recalibrados com os dados de
 * atendimentos nas UPAs (ver calibrateWithHealthData).
 */
export const HEAT_LEVELS: HeatLevel[] = [
  {
    id: "normal",
    rank: 0,
    label: "Normal",
    min: -99,
    color: "#10b981",
    softBg: "rgba(16,185,129,0.12)",
    meaning: "Calor habitual do Recife. Rotina normal.",
  },
  {
    id: "atencao",
    rank: 1,
    label: "Atenção",
    min: 32,
    color: "#eab308",
    softBg: "rgba(234,179,8,0.14)",
    meaning: "Fadiga possível com exposição prolongada ao sol. Comunicação preventiva.",
  },
  {
    id: "alerta",
    rank: 2,
    label: "Alerta",
    min: 37,
    color: "#f97316",
    softBg: "rgba(249,115,22,0.14)",
    meaning: "Risco de cãibras e exaustão. Grupos vulneráveis precisam de cuidado ativo.",
  },
  {
    id: "perigo",
    rank: 3,
    label: "Perigo",
    min: 41,
    color: "#ef4444",
    softBg: "rgba(239,68,68,0.14)",
    meaning: "Exaustão provável; insolação possível. Mobilização das secretarias.",
  },
  {
    id: "emergencia",
    rank: 4,
    label: "Emergência",
    min: 46,
    color: "#a21caf",
    softBg: "rgba(162,28,175,0.14)",
    meaning: "Risco alto de insolação e mortes evitáveis. Resposta coordenada pelo COP.",
  },
];

export function levelFor(heatIndex: number): HeatLevel {
  let found = HEAT_LEVELS[0]!;
  for (const l of HEAT_LEVELS) if (heatIndex >= l.min) found = l;
  return found;
}

/**
 * Índice de Calor (Heat Index) — NOAA / National Weather Service.
 * Entrada em °C e % de umidade relativa; saída em °C.
 */
export function heatIndexC(tempC: number, rh: number): number {
  const T = (tempC * 9) / 5 + 32;
  // Fórmula simples de Steadman, usada quando o calor é baixo
  let hi = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);
  if ((hi + T) / 2 >= 80) {
    hi =
      -42.379 +
      2.04901523 * T +
      10.14333127 * rh -
      0.22475541 * T * rh -
      0.00683783 * T * T -
      0.05481717 * rh * rh +
      0.00122874 * T * T * rh +
      0.00085282 * T * rh * rh -
      0.00000199 * T * T * rh * rh;
    if (rh < 13 && T >= 80 && T <= 112) {
      hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (rh > 85 && T >= 80 && T <= 87) {
      hi += ((rh - 85) / 10) * ((87 - T) / 5);
    }
  }
  return Number((((hi - 32) * 5) / 9).toFixed(1));
}

export type HourPoint = {
  time: string; // ISO local (America/Recife)
  hour: number;
  temp: number;
  humidity: number;
  heatIndex: number;
  level: HeatLevel;
};

export type DaySummary = {
  date: string; // YYYY-MM-DD
  label: string; // Hoje / Amanhã / Qua 11/11
  maxHeatIndex: number;
  maxTemp: number;
  peakHour: number;
  level: HeatLevel;
  hoursAtOrAboveAlert: number;
  firstAlertHour: number | null;
};

export type ZoneHeatForecast = {
  zoneId: string;
  zoneName: string;
  hours: HourPoint[];
  days: DaySummary[];
};

export type HeatForecastSnapshot = {
  generatedAt: string;
  source: "open-meteo" | "cache" | "fallback";
  zones: ZoneHeatForecast[];
};

const CACHE_KEY = "arboris_heat_forecast_v1";
const CACHE_TTL_MS = 1000 * 60 * 30;

function dayLabel(date: string, index: number): string {
  if (index === 0) return "Hoje";
  if (index === 1) return "Amanhã";
  const d = new Date(`${date}T12:00:00`);
  const wd = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()];
  return `${wd} ${date.slice(8, 10)}/${date.slice(5, 7)}`;
}

function summarizeDays(hours: HourPoint[]): DaySummary[] {
  const byDate = new Map<string, HourPoint[]>();
  for (const h of hours) {
    const d = h.time.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(h);
  }
  return Array.from(byDate.entries()).map(([date, hs], i) => {
    const peak = hs.reduce((a, b) => (b.heatIndex > a.heatIndex ? b : a), hs[0]!);
    const alertHours = hs.filter((h) => h.level.rank >= 2);
    return {
      date,
      label: dayLabel(date, i),
      maxHeatIndex: peak.heatIndex,
      maxTemp: Math.max(...hs.map((h) => h.temp)),
      peakHour: peak.hour,
      level: peak.level,
      hoursAtOrAboveAlert: alertHours.length,
      firstAlertHour: alertHours[0]?.hour ?? null,
    };
  });
}

function buildZone(
  zone: Pick<Zone, "id" | "name">,
  times: string[],
  temps: number[],
  hums: number[],
): ZoneHeatForecast {
  const delta = RECIFE_ZONE_COORDINATES[zone.id]?.tempDelta ?? 0;
  const humDelta = RECIFE_ZONE_COORDINATES[zone.id]?.humidityDelta ?? 0;
  const hours: HourPoint[] = times.map((time, i) => {
    const temp = Number(((temps[i] ?? 28) + delta).toFixed(1));
    const humidity = Math.max(25, Math.min(100, (hums[i] ?? 70) + humDelta));
    const hi = heatIndexC(temp, humidity);
    return {
      time,
      hour: Number(time.slice(11, 13)),
      temp,
      humidity,
      heatIndex: hi,
      level: levelFor(hi),
    };
  });
  return { zoneId: zone.id, zoneName: zone.name, hours, days: summarizeDays(hours) };
}

/** Curva típica de um dia quente no Recife — usada só se a API estiver indisponível. */
function fallbackSeries(): { times: string[]; temps: number[]; hums: number[] } {
  const times: string[] = [];
  const temps: number[] = [];
  const hums: number[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 0; d < 3; d++) {
    for (let h = 0; h < 24; h++) {
      const dt = new Date(start.getTime() + (d * 24 + h) * 3600_000);
      const pad = (n: number) => String(n).padStart(2, "0");
      times.push(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(h)}:00`);
      const wave = Math.max(0, Math.sin(((h - 6) / 24) * 2 * Math.PI));
      temps.push(25.5 + 6.5 * wave + d * 0.4);
      hums.push(85 - 20 * wave);
    }
  }
  return { times, temps, hums };
}

function hydrate(raw: {
  zones: { zoneId: string; zoneName: string; hours: Omit<HourPoint, "level">[] }[];
}) {
  return raw.zones.map((z) => {
    const hours = z.hours.map((h) => ({ ...h, level: levelFor(h.heatIndex) }));
    return { zoneId: z.zoneId, zoneName: z.zoneName, hours, days: summarizeDays(hours) };
  });
}

export async function fetchHeatForecast(
  zones: Pick<Zone, "id" | "name">[],
): Promise<HeatForecastSnapshot> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return { generatedAt: parsed.generatedAt, source: "cache", zones: hydrate(parsed) };
      }
    }
  } catch {
    // localStorage indisponível — segue para a API
  }

  const coords = zones.map((z) => RECIFE_ZONE_COORDINATES[z.id] ?? { lat: -8.05, lon: -34.9 });
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${coords.map((c) => c.lat.toFixed(4)).join(",")}` +
    `&longitude=${coords.map((c) => c.lon.toFixed(4)).join(",")}` +
    "&hourly=temperature_2m,relative_humidity_2m&forecast_days=3&timezone=America%2FRecife";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Open-Meteo retornou HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json) ? json : [json];
    const result = zones.map((z, i) => {
      const h = list[i]?.hourly ?? list[0].hourly;
      return buildZone(z, h.time, h.temperature_2m, h.relative_humidity_2m);
    });
    const generatedAt = new Date().toISOString();
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          generatedAt,
          zones: result.map((z) => ({
            zoneId: z.zoneId,
            zoneName: z.zoneName,
            hours: z.hours.map(({ level: _l, ...rest }) => rest),
          })),
        }),
      );
    } catch {
      // ignora
    }
    return { generatedAt, source: "open-meteo", zones: result };
  } catch (err) {
    console.warn(
      "[Alerta de Calor] Falha na previsão Open-Meteo, usando curva de referência:",
      err,
    );
    const fb = fallbackSeries();
    return {
      generatedAt: new Date().toISOString(),
      source: "fallback",
      zones: zones.map((z) => buildZone(z, fb.times, fb.temps, fb.hums)),
    };
  }
}

/** Prioridade de ação: quanto mais alto o nível e mais pessoas vulneráveis, mais urgente. */
export function actionPriority(level: HeatLevel, vulnerableGroups: number, vuln: number): number {
  const weight = [0, 1, 3, 6, 10][level.rank] ?? 0;
  return Math.round(weight * (vulnerableGroups / 1000) * (0.5 + vuln / 100));
}

/**
 * Calibração local: regressão linear simples entre sensação térmica e atendimentos
 * nas UPAs (série do projeto). Retorna quantos atendimentos a mais por +1 °C e r de Pearson.
 */
export function calibrateWithHealthData(series: { feels: number; upaVisits: number }[]) {
  const n = series.length;
  if (n < 3) return null;
  const mx = series.reduce((s, p) => s + p.feels, 0) / n;
  const my = series.reduce((s, p) => s + p.upaVisits, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const p of series) {
    sxy += (p.feels - mx) * (p.upaVisits - my);
    sxx += (p.feels - mx) ** 2;
    syy += (p.upaVisits - my) ** 2;
  }
  const slope = sxy / sxx;
  const r = sxy / Math.sqrt(sxx * syy);
  return {
    slope: Number(slope.toFixed(1)),
    r: Number(r.toFixed(2)),
    baseline: Number(my.toFixed(0)),
  };
}
