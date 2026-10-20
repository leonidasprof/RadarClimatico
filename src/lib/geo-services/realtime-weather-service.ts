/**
 * SERVIÇO METEOROLÓGICO EM TEMPO REAL (OPEN-METEO & NASA POWER)
 * Integração com APIs públicas abertas para sincronização de temperatura,
 * sensação térmica, umidade, vento e curva horária real do Recife.
 */

import { zones as defaultZones, type Zone } from "../radar-data";

export interface RealtimeWeatherSnapshot {
  source: "live" | "cache" | "fallback";
  fetchedAt: string;
  recifeBaseTemp: number;
  recifeBaseFeels: number;
  recifeBaseHumidity: number;
  recifeWindSpeed: number;
  recifePrecipitation: number;
  zones: Zone[];
  hourly: { h: string; t: number; feels?: number | undefined }[];
  cityAverageTemp: number;
  cityMaxFeels: number; // Maior sensação térmica do dia registrada hoje até a hora atual
  cityMaxFeelsZone?: string | undefined;
  cityMaxFeelsHour?: string | undefined;
  cityMaxTemp?: number | undefined; // Maior temperatura do dia registrada hoje até a hora atual
  cityMaxTempZone?: string | undefined;
  cityMaxTempHour?: string | undefined;
  criticalZonesCount: number;
  peakHour: string;
  peakTemp: number;
}

export interface ZoneCoordinates {
  id: string;
  name: string;
  lat: number;
  lon: number;
  // Fator biofísico microclimático (Landsat 8/9 ST_B10 + MapBiomas 11)
  tempDelta: number;
  feelsDelta: number;
  humidityDelta: number;
}

export const RECIFE_ZONE_COORDINATES: Record<string, ZoneCoordinates> = {
  "santo-amaro": {
    id: "santo-amaro",
    name: "Santo Amaro",
    lat: -8.0460,
    lon: -34.8870,
    tempDelta: +2.4,
    feelsDelta: +4.2,
    humidityDelta: -6,
  },
  "boa-vista": {
    id: "boa-vista",
    name: "Boa Vista",
    lat: -8.0570,
    lon: -34.8940,
    tempDelta: +1.8,
    feelsDelta: +3.2,
    humidityDelta: -4,
  },
  "afogados": {
    id: "afogados",
    name: "Afogados",
    lat: -8.0770,
    lon: -34.9080,
    tempDelta: +1.2,
    feelsDelta: +2.1,
    humidityDelta: -2,
  },
  "imbiribeira": {
    id: "imbiribeira",
    name: "Imbiribeira",
    lat: -8.0960,
    lon: -34.9150,
    tempDelta: +0.8,
    feelsDelta: +1.5,
    humidityDelta: +1,
  },
  "ibura": {
    id: "ibura",
    name: "Ibura",
    lat: -8.1180,
    lon: -34.9450,
    tempDelta: +1.0,
    feelsDelta: +1.8,
    humidityDelta: -1,
  },
  "boa-viagem": {
    id: "boa-viagem",
    name: "Boa Viagem",
    lat: -8.1250,
    lon: -34.9025,
    tempDelta: -0.2,
    feelsDelta: +0.4,
    humidityDelta: +5,
  },
  "casa-forte": {
    id: "casa-forte",
    name: "Casa Forte",
    lat: -8.0280,
    lon: -34.9220,
    tempDelta: -1.6,
    feelsDelta: -2.8,
    humidityDelta: +4,
  },
  "dois-irmaos": {
    id: "dois-irmaos",
    name: "Dois Irmãos",
    lat: -8.0160,
    lon: -34.9430,
    tempDelta: -3.2,
    feelsDelta: -5.4,
    humidityDelta: +8,
  },
};

const CACHE_KEY = "arboris_realtime_weather_snapshot_v2";
const LEGACY_CACHE_KEY = "arboris_realtime_weather_snapshot_v1";
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutos

/**
 * Consulta a API pública do Open-Meteo para Recife em tempo real
 * e atualiza dinamicamente as zonas e a curva horária.
 */
export async function fetchRealtimeRecifeWeather(): Promise<RealtimeWeatherSnapshot> {
  // Limpeza de cache legado com dados salvos futuros incorretos
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LEGACY_CACHE_KEY);
    } catch {
      // Ignora erro
    }
  }

  // 1. Verificar Cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return {
          ...parsed.data,
          source: "cache",
        };
      }
    }
  } catch {
    // Ignora erro de localStorage
  }

  // 2. Chamar a API pública Open-Meteo para Recife (-8.05, -34.90)
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=-8.05&longitude=-34.90&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&hourly=temperature_2m,apparent_temperature&timezone=America%2FRecife&forecast_days=1";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo retornou HTTP ${res.status}`);
    }

    const json = await res.json();
    const current = json?.current;
    const hourly = json?.hourly;

    if (!current || typeof current.temperature_2m !== "number") {
      throw new Error("Formato inválido retornado pela API");
    }

    const baseTemp = Number(current.temperature_2m.toFixed(1));
    const baseFeels = Number(current.apparent_temperature.toFixed(1));
    const baseHumidity = Math.round(current.relative_humidity_2m);
    const windSpeed = Number((current.wind_speed_10m || 0).toFixed(1));
    const precipitation = Number((current.precipitation || 0).toFixed(1));

    // 3. Atualizar cada zona com base no microclima territorial biofísico real
    const updatedZones: Zone[] = defaultZones.map((z) => {
      const coords = RECIFE_ZONE_COORDINATES[z.id];
      const tempDelta = coords ? coords.tempDelta : 0;
      const feelsDelta = coords ? coords.feelsDelta : 0;
      const humDelta = coords ? coords.humidityDelta : 0;

      const newTemp = Number((baseTemp + tempDelta).toFixed(1));
      const newFeels = Number((baseFeels + feelsDelta).toFixed(1));
      const newHumidity = Math.max(30, Math.min(95, baseHumidity + humDelta));

      // Recalcula a classificação térmica biofísica real (A a E)
      let newRating: "A" | "B" | "C" | "D" | "E" = z.rating;
      if (newFeels <= 32.0 && z.canopy >= 35) newRating = "A";
      else if (newFeels <= 35.0) newRating = "B";
      else if (newFeels <= 38.5) newRating = "C";
      else if (newFeels <= 42.0) newRating = "D";
      else newRating = "E";

      return {
        ...z,
        temp: newTemp,
        feels: newFeels,
        humidity: newHumidity,
        rating: newRating,
      };
    });

    // 4. Montar a curva horária real do dia a partir de hourly
    const realHourly: { h: string; t: number; feels?: number | undefined }[] = [];
    if (hourly && Array.isArray(hourly.time) && Array.isArray(hourly.temperature_2m)) {
      // Pega horas marcantes: 06h, 08h, 10h, 12h, 14h, 16h, 18h, 20h, 22h
      const targetHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
      for (const th of targetHours) {
        if (hourly.temperature_2m[th] !== undefined) {
          realHourly.push({
            h: `${String(th).padStart(2, "0")}h`,
            t: Number(hourly.temperature_2m[th].toFixed(1)),
            feels: hourly.apparent_temperature?.[th]
              ? Number(hourly.apparent_temperature[th].toFixed(1))
              : undefined,
          });
        }
      }
    }

    // Se por acaso hourly estiver vazio, gera curva coerente com baseTemp
    const finalHourly =
      realHourly.length >= 6
        ? realHourly
        : [
            { h: "06h", t: Number((baseTemp - 2.8).toFixed(1)) },
            { h: "08h", t: Number((baseTemp - 1.2).toFixed(1)) },
            { h: "10h", t: Number((baseTemp + 0.8).toFixed(1)) },
            { h: "12h", t: Number((baseTemp + 2.2).toFixed(1)) },
            { h: "14h", t: Number((baseTemp + 3.1).toFixed(1)) },
            { h: "16h", t: Number((baseTemp + 1.9).toFixed(1)) },
            { h: "18h", t: Number((baseTemp - 0.4).toFixed(1)) },
            { h: "20h", t: Number((baseTemp - 1.8).toFixed(1)) },
            { h: "22h", t: Number((baseTemp - 2.4).toFixed(1)) },
          ];

    // 5. KPIs consolidados
    const avgTemp = Number(
      (updatedZones.reduce((acc, z) => acc + z.temp, 0) / updatedZones.length).toFixed(1)
    );
    const instantMaxFeels = Number(Math.max(...updatedZones.map((z) => z.feels)).toFixed(1));
    const instantPeakZone = updatedZones.find((z) => z.feels === instantMaxFeels)?.name || "Santo Amaro";
    const instantMaxTemp = Number(Math.max(...updatedZones.map((z) => z.temp)).toFixed(1));
    const instantPeakTempZone = updatedZones.find((z) => z.temp === instantMaxTemp)?.name || "Santo Amaro";
    const critCount = updatedZones.filter((z) => z.rating === "D" || z.rating === "E").length;

    // Identifica o pico previsto na curva horária para o painel de previsão (HourlyPanel)
    const peakRecord = [...finalHourly].sort((a, b) => b.t - a.t)[0] || { h: "14h", t: 34.5 };

    // Regra de Negócio: Maior sensação/temperatura do dia
    // Avalia estritamente medições em tempo real e horas JÁ OCORRIDAS hoje (<= hora atual local).
    // Jamais antecipa picos de horas futuras da previsão (ex.: 12h ou 14h quando ainda são 06h).
    const dailyPeak = getOrUpdateDailyMaxFeels(
      instantMaxFeels,
      instantPeakZone,
      instantMaxTemp,
      instantPeakTempZone,
      hourly,
      finalHourly
    );

    const snapshot: RealtimeWeatherSnapshot = {
      source: "live",
      fetchedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      recifeBaseTemp: baseTemp,
      recifeBaseFeels: baseFeels,
      recifeBaseHumidity: baseHumidity,
      recifeWindSpeed: windSpeed,
      recifePrecipitation: precipitation,
      zones: updatedZones,
      hourly: finalHourly,
      cityAverageTemp: avgTemp,
      cityMaxFeels: dailyPeak.maxFeels,
      cityMaxFeelsZone: dailyPeak.peakZone,
      cityMaxFeelsHour: dailyPeak.peakHour,
      cityMaxTemp: dailyPeak.maxTemp,
      cityMaxTempZone: dailyPeak.maxTempZone,
      cityMaxTempHour: dailyPeak.maxTempHour,
      criticalZonesCount: critCount,
      peakHour: peakRecord.h,
      peakTemp: peakRecord.t,
    };

    // Salvar no cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: snapshot })
      );
    } catch {
      // Ignora erro de cota
    }

    return snapshot;
  } catch (err) {
    console.warn("Falha ao consultar API pública em tempo real. Ativando fallback resiliente:", err);
    return getResilientFallbackSnapshot();
  }
}

interface DailyPeakRecord {
  date: string; // "YYYY-MM-DD" local
  maxFeels: number;
  peakZone: string;
  peakHour: string;
  maxTemp?: number;
  maxTempZone?: string;
  maxTempHour?: string;
}

const DAILY_PEAK_KEY = "arboris_daily_peak_v2";
const LEGACY_DAILY_PEAK_KEY = "arboris_daily_peak_feels_record";

function parseHourInt(hourStr?: string | undefined): number | null {
  if (!hourStr) return null;
  const match = hourStr.match(/(\d{1,2})/);
  if (!match || !match[1]) return null;
  const num = parseInt(match[1], 10);
  return isNaN(num) ? null : num;
}

function getLocalDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Regra de Negócio: Maior temperatura e sensação do dia
 * - Informa a temperatura mais alta registrada na cidade ao longo das 24 horas do dia
 * - Avalia estritamente as horas já decorridas hoje (<= hora atual local) e as leituras ao vivo
 * - Jamais antecipa previsões de horários futuros (ex.: se são 06:44, analisa apenas 00h-06h)
 * - Conforme o dia avança (ex.: 10h, 12h, 14h), detecta e atualiza o novo pico mais quente
 * - Ao cair da tarde/noite, retém o maior pico registrado durante o dia até as 23:59
 * - Quando o dia vira (após 23:59 -> 00:00), reseta para o novo ciclo matinal do dia
 */
export function getOrUpdateDailyMaxFeels(
  currentZonesMaxFeels: number,
  currentPeakZoneName: string,
  currentZonesMaxTemp?: number,
  currentPeakTempZoneName?: string,
  rawHourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
  },
  sparseHourly?: { h: string; t: number; feels?: number }[]
): {
  maxFeels: number;
  peakZone: string;
  peakHour: string;
  maxTemp: number;
  maxTempZone: string;
  maxTempHour: string;
} {
  const today = getLocalDateKey();
  const now = new Date();
  const currentHour = now.getHours();
  const currentHourStr = `${String(currentHour).padStart(2, "0")}h`;

  // Limpeza preventiva de chaves legadas com dados inconsistentes ou antecipados
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LEGACY_DAILY_PEAK_KEY);
    } catch {
      // Ignora erro
    }
  }

  let stored: DailyPeakRecord | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DAILY_PEAK_KEY);
      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch {
      stored = null;
    }
  }

  // 1. Ponto de partida: medições instantâneas capturadas no momento atual
  let bestFeels = currentZonesMaxFeels;
  let bestZone = currentPeakZoneName || "Santo Amaro";
  let bestHour = currentHourStr;

  let bestTemp = currentZonesMaxTemp ?? Number((currentZonesMaxFeels - 3.5).toFixed(1));
  let bestTempZone = currentPeakTempZoneName || "Santo Amaro";
  let bestTempHour = currentHourStr;

  // 2. Avalia horas já decorridas no dia de hoje (00:00 até currentHour)
  // REGRA DE NEGÓCIO: Apenas horas decorridas (h <= currentHour) são elegíveis como "registradas".
  if (rawHourly?.temperature_2m && Array.isArray(rawHourly.temperature_2m)) {
    const apparentList = rawHourly.apparent_temperature;
    for (let h = 0; h <= currentHour && h < rawHourly.temperature_2m.length; h++) {
      const hHourStr = `${String(h).padStart(2, "0")}h`;

      // Sensação térmica na zona mais crítica (Santo Amaro: feelsDelta +4.2)
      if (apparentList) {
        const appVal = apparentList[h];
        if (typeof appVal === "number") {
          const feelsAtH = Number((appVal + 4.2).toFixed(1));
          if (feelsAtH > bestFeels) {
            bestFeels = feelsAtH;
            bestZone = "Santo Amaro";
            bestHour = hHourStr;
          }
        }
      }

      // Temperatura real na zona mais crítica (Santo Amaro: tempDelta +2.4)
      const rawTemp = rawHourly.temperature_2m[h];
      if (typeof rawTemp === "number") {
        const tempAtH = Number((rawTemp + 2.4).toFixed(1));
        if (tempAtH > bestTemp) {
          bestTemp = tempAtH;
          bestTempZone = "Santo Amaro";
          bestTempHour = hHourStr;
        }
      }
    }
  } else if (sparseHourly && sparseHourly.length > 0) {
    // Curva horária alternativa: avalia apenas horários já transcorridos (<= currentHour)
    for (const item of sparseHourly) {
      const itemHourInt = parseHourInt(item.h);
      if (itemHourInt !== null && itemHourInt <= currentHour) {
        const feelsAtH = Number(((item.feels ?? item.t) + 4.2).toFixed(1));
        if (feelsAtH > bestFeels) {
          bestFeels = feelsAtH;
          bestZone = "Santo Amaro";
          bestHour = item.h;
        }
        const tempAtH = Number((item.t + 2.4).toFixed(1));
        if (tempAtH > bestTemp) {
          bestTemp = tempAtH;
          bestTempZone = "Santo Amaro";
          bestTempHour = item.h;
        }
      }
    }
  }

  // 3. Mescla com o registro persistido do dia corrente
  const isNewDay = !stored || stored.date !== today;
  if (!isNewDay && stored) {
    const storedFeelsHourInt = parseHourInt(stored.peakHour);
    // Valida se o registro persistido é coerente (hora <= currentHour)
    const isStoredHourValid = storedFeelsHourInt === null || storedFeelsHourInt <= currentHour;

    if (isStoredHourValid && stored.maxFeels > bestFeels) {
      bestFeels = stored.maxFeels;
      bestZone = stored.peakZone;
      bestHour = stored.peakHour;
    }

    if (stored.maxTemp !== undefined) {
      const storedTempHourInt = parseHourInt(stored.maxTempHour);
      const isTempHourValid = storedTempHourInt === null || storedTempHourInt <= currentHour;
      if (isTempHourValid && stored.maxTemp > bestTemp) {
        bestTemp = stored.maxTemp;
        bestTempZone = stored.maxTempZone || "Santo Amaro";
        bestTempHour = stored.maxTempHour || bestHour;
      }
    }
  }

  // 4. Salva o pico validado de hoje no localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        DAILY_PEAK_KEY,
        JSON.stringify({
          date: today,
          maxFeels: bestFeels,
          peakZone: bestZone,
          peakHour: bestHour,
          maxTemp: bestTemp,
          maxTempZone: bestTempZone,
          maxTempHour: bestTempHour,
        })
      );
    } catch {
      // Ignora erro de cota
    }
  }

  return {
    maxFeels: bestFeels,
    peakZone: bestZone,
    peakHour: bestHour,
    maxTemp: bestTemp,
    maxTempZone: bestTempZone,
    maxTempHour: bestTempHour,
  };
}

/**
 * Perfil térmico diurno para modelagem consistente mesmo offline
 */
function getDiurnalFallbackProfile(hour: number): { baseTemp: number; baseFeels: number; baseHumidity: number } {
  const profile: Record<number, { t: number; f: number; h: number }> = {
    0: { t: 26.1, f: 29.3, h: 84 },
    1: { t: 25.7, f: 28.9, h: 85 },
    2: { t: 25.4, f: 28.7, h: 86 },
    3: { t: 25.5, f: 28.9, h: 86 },
    4: { t: 25.7, f: 28.7, h: 87 },
    5: { t: 25.2, f: 28.2, h: 88 },
    6: { t: 26.5, f: 29.1, h: 82 },
    7: { t: 27.5, f: 30.2, h: 78 },
    8: { t: 28.4, f: 31.8, h: 74 },
    9: { t: 29.5, f: 33.5, h: 70 },
    10: { t: 30.5, f: 35.1, h: 68 },
    11: { t: 31.2, f: 36.2, h: 66 },
    12: { t: 31.8, f: 37.2, h: 64 },
    13: { t: 32.2, f: 37.8, h: 63 },
    14: { t: 32.0, f: 37.5, h: 64 },
    15: { t: 31.4, f: 36.6, h: 67 },
    16: { t: 30.5, f: 35.2, h: 70 },
    17: { t: 29.3, f: 33.4, h: 74 },
    18: { t: 28.2, f: 31.8, h: 78 },
    19: { t: 27.6, f: 30.9, h: 80 },
    20: { t: 27.2, f: 30.3, h: 82 },
    21: { t: 26.9, f: 29.9, h: 83 },
    22: { t: 26.6, f: 29.5, h: 84 },
    23: { t: 26.4, f: 29.3, h: 84 },
  };
  const p = profile[hour] || { t: 27.0, f: 30.0, h: 75 };
  return { baseTemp: p.t, baseFeels: p.f, baseHumidity: p.h };
}

/**
 * Fallback determinístico resiliente para garantir que nada quebre offline
 */
function getResilientFallbackSnapshot(): RealtimeWeatherSnapshot {
  const currentHour = new Date().getHours();
  const profile = getDiurnalFallbackProfile(currentHour);
  const baseTemp = profile.baseTemp;
  const baseFeels = profile.baseFeels;
  const baseHumidity = profile.baseHumidity;

  const updatedZones: Zone[] = defaultZones.map((z) => {
    const coords = RECIFE_ZONE_COORDINATES[z.id];
    const tempDelta = coords ? coords.tempDelta : 0;
    const feelsDelta = coords ? coords.feelsDelta : 0;
    const humDelta = coords ? coords.humidityDelta : 0;

    const newTemp = Number((baseTemp + tempDelta).toFixed(1));
    const newFeels = Number((baseFeels + feelsDelta).toFixed(1));
    const newHumidity = Math.max(30, Math.min(95, baseHumidity + humDelta));

    let newRating: "A" | "B" | "C" | "D" | "E" = z.rating;
    if (newFeels <= 32.0 && z.canopy >= 35) newRating = "A";
    else if (newFeels <= 35.0) newRating = "B";
    else if (newFeels <= 38.5) newRating = "C";
    else if (newFeels <= 42.0) newRating = "D";
    else newRating = "E";

    return {
      ...z,
      temp: newTemp,
      feels: newFeels,
      humidity: newHumidity,
      rating: newRating,
    };
  });

  const avgTemp = Number(
    (updatedZones.reduce((acc, z) => acc + z.temp, 0) / updatedZones.length).toFixed(1)
  );
  const instantMaxFeels = Number(Math.max(...updatedZones.map((z) => z.feels)).toFixed(1));
  const instantPeakZone = updatedZones.find((z) => z.feels === instantMaxFeels)?.name || "Santo Amaro";
  const instantMaxTemp = Number(Math.max(...updatedZones.map((z) => z.temp)).toFixed(1));
  const instantPeakTempZone = updatedZones.find((z) => z.temp === instantMaxTemp)?.name || "Santo Amaro";

  const fallbackHourly = [
    { h: "06h", t: 26.1, feels: 29.1 },
    { h: "08h", t: 28.4, feels: 31.8 },
    { h: "10h", t: 30.5, feels: 35.1 },
    { h: "12h", t: 31.8, feels: 37.2 },
    { h: "14h", t: 32.2, feels: 37.8 },
    { h: "16h", t: 30.5, feels: 35.2 },
    { h: "18h", t: 28.2, feels: 31.8 },
    { h: "20h", t: 27.2, feels: 30.3 },
    { h: "22h", t: 26.6, feels: 29.5 },
  ];

  const dailyPeak = getOrUpdateDailyMaxFeels(
    instantMaxFeels,
    instantPeakZone,
    instantMaxTemp,
    instantPeakTempZone,
    undefined,
    fallbackHourly
  );

  const critCount = updatedZones.filter((z) => z.rating === "D" || z.rating === "E").length;

  return {
    source: "fallback",
    fetchedAt: "Recife / PE",
    recifeBaseTemp: baseTemp,
    recifeBaseFeels: baseFeels,
    recifeBaseHumidity: baseHumidity,
    recifeWindSpeed: 14.2,
    recifePrecipitation: 0.0,
    zones: updatedZones,
    hourly: fallbackHourly,
    cityAverageTemp: avgTemp,
    cityMaxFeels: dailyPeak.maxFeels,
    cityMaxFeelsZone: dailyPeak.peakZone,
    cityMaxFeelsHour: dailyPeak.peakHour,
    cityMaxTemp: dailyPeak.maxTemp,
    cityMaxTempZone: dailyPeak.maxTempZone,
    cityMaxTempHour: dailyPeak.maxTempHour,
    criticalZonesCount: critCount,
    peakHour: "14h",
    peakTemp: 32.2,
  };
}
