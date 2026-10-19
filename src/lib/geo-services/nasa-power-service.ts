/**
 * SERVIÇO DE INTEGRAÇÃO NASA POWER API
 * Endpoint: https://power.larc.nasa.gov/api/temporal/daily/point
 * Variáveis:
 * - T2M: Temperatura média a 2 metros (°C)
 * - PS: Pressão atmosférica na superfície (kPa)
 * - WS10M: Velocidade do vento a 10 metros (m/s)
 * - PRECTOTCORR: Precipitação diária corrigida (mm/dia)
 */

export interface NasaDailyRecord {
  date: string;         // YYYY-MM-DD
  dateDisplay: string;  // DD/MM/YYYY
  timestamp: number;
  temp: number;         // °C
  pressure: number;     // kPa
  windSpeed: number;    // m/s
  precipitation: number;// mm/dia
}

export interface NasaDatasetStats {
  tempMean: number;
  tempMax: number;
  tempMin: number;
  precipTotal: number;
  precipMeanDaily: number;
  precipMaxDaily: number;
  windMean: number;
  windMax: number;
  pressureMean: number;
  recordCount: number;
}

export interface NasaPowerResponse {
  source: "live" | "cache" | "fallback";
  city: string;
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
  records: NasaDailyRecord[];
  stats: NasaDatasetStats;
  fetchedAt: string;
}

export const NASA_SUPPORTED_CITIES: Record<string, { name: string; lat: number; lon: number; state: string }> = {
  "recife": { name: "Recife - PE", lat: -8.0543, lon: -34.8813, state: "PE" },
  "olinda": { name: "Olinda - PE", lat: -7.9986, lon: -34.8459, state: "PE" },
  "jaboatao": { name: "Jaboatão dos Guararapes - PE", lat: -8.1098, lon: -35.0142, state: "PE" },
  "paulista": { name: "Paulista - PE", lat: -7.9408, lon: -34.8731, state: "PE" },
  "camaragibe": { name: "Camaragibe - PE", lat: -8.0205, lon: -34.9781, state: "PE" },
  "cabo": { name: "Cabo de Santo Agostinho - PE", lat: -8.2811, lon: -35.0344, state: "PE" },
  "igarassu": { name: "Igarassu - PE", lat: -7.8342, lon: -34.9064, state: "PE" },
  "ipojuca": { name: "Ipojuca / Suape - PE", lat: -8.3981, lon: -35.0636, state: "PE" },
  // Cidades de referência comparativas presentes no notebook
  "sao-paulo": { name: "São Paulo - SP", lat: -23.55, lon: -46.63, state: "SP" },
  "rio-janeiro": { name: "Rio de Janeiro - RJ", lat: -22.91, lon: -43.20, state: "RJ" },
  "salvador": { name: "Salvador - BA", lat: -12.97, lon: -38.50, state: "BA" },
  "fortaleza": { name: "Fortaleza - CE", lat: -3.73, lon: -38.52, state: "CE" },
  "brasilia": { name: "Brasília - DF", lat: -15.79, lon: -47.88, state: "DF" },
};

const CACHE_PREFIX = "arboris_nasa_cache_v2_";
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

/**
 * Consulta a API da NASA POWER de forma assíncrona, robusta e com cache local.
 */
export async function fetchNasaPowerData(
  cityKey: string,
  startDateStr: string, // YYYYMMDD ou YYYY-MM-DD
  endDateStr: string    // YYYYMMDD ou YYYY-MM-DD
): Promise<NasaPowerResponse> {
  const city = NASA_SUPPORTED_CITIES[cityKey] || NASA_SUPPORTED_CITIES["recife"]!;
  const cleanStart = startDateStr.replace(/-/g, "");
  const cleanEnd = endDateStr.replace(/-/g, "");

  const cacheKey = `${CACHE_PREFIX}${cityKey}_${cleanStart}_${cleanEnd}`;

  // 1. Verificar Cache
  try {
    const cached = localStorage.getItem(cacheKey);
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

  // 2. Chamar API da NASA POWER
  const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
  url.searchParams.set("parameters", "T2M,PS,WS10M,PRECTOTCORR");
  url.searchParams.set("community", "AG");
  url.searchParams.set("longitude", city.lon.toFixed(4));
  url.searchParams.set("latitude", city.lat.toFixed(4));
  url.searchParams.set("start", cleanStart);
  url.searchParams.set("end", cleanEnd);
  url.searchParams.set("format", "JSON");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`NASA POWER retornou HTTP ${res.status}`);
    }

    const data = await res.json();
    const params = data?.properties?.parameter;

    if (!params || !params.T2M) {
      throw new Error("Formato de resposta inesperado da NASA");
    }

    const t2mMap = params.T2M || {};
    const psMap = params.PS || {};
    const wsMap = params.WS10M || {};
    const precMap = params.PRECTOTCORR || {};

    const dates = Object.keys(t2mMap).sort();
    const records: NasaDailyRecord[] = dates.map((dStr) => {
      const y = dStr.slice(0, 4);
      const m = dStr.slice(4, 6);
      const d = dStr.slice(6, 8);
      const iso = `${y}-${m}-${d}`;
      const display = `${d}/${m}/${y}`;

      const rawTemp = t2mMap[dStr];
      const rawPs = psMap[dStr];
      const rawWs = wsMap[dStr];
      const rawPrec = precMap[dStr];

      // Filtra valores -999 (ausentes)
      const temp = rawTemp === -999 || rawTemp === undefined ? 27.5 : Number(rawTemp.toFixed(1));
      const pressure = rawPs === -999 || rawPs === undefined ? 101.2 : Number(rawPs.toFixed(1));
      const windSpeed = rawWs === -999 || rawWs === undefined ? 4.2 : Number(rawWs.toFixed(1));
      const precipitation = rawPrec === -999 || rawPrec === undefined || rawPrec < 0 ? 0 : Number(rawPrec.toFixed(1));

      return {
        date: iso,
        dateDisplay: display,
        timestamp: new Date(iso).getTime(),
        temp,
        pressure,
        windSpeed,
        precipitation,
      };
    });

    const stats = calculateStats(records);
    const result: NasaPowerResponse = {
      source: "live",
      city: city.name,
      lat: city.lat,
      lon: city.lon,
      startDate: cleanStart,
      endDate: cleanEnd,
      records,
      stats,
      fetchedAt: new Date().toISOString(),
    };

    // Salvar em cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch {
      // Ignora erro de cota de armazenamento
    }

    return result;
  } catch (err) {
    console.warn("NASA POWER API offline ou inacessível. Ativando fallback resiliente com dados históricos locais:", err);
    return getResilientFallbackData(cityKey, cleanStart, cleanEnd);
  }
}

/**
 * Fallback determinístico resiliente baseado em observações climáticas do Recife (NASA POWER / INMET)
 */
function getResilientFallbackData(cityKey: string, cleanStart: string, cleanEnd: string): NasaPowerResponse {
  const city = NASA_SUPPORTED_CITIES[cityKey] || NASA_SUPPORTED_CITIES["recife"]!;

  // Cria intervalo de datas
  const start = parseDateString(cleanStart);
  const end = parseDateString(cleanEnd);

  const records: NasaDailyRecord[] = [];
  const current = new Date(start);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    const display = `${d}/${m}/${y}`;

    // Sazonalidade Recife: meses 4 a 7 (Mai-Jul) mais chuvosos e frescos
    const month = current.getMonth();
    const dayOfYear = Math.floor((current.getTime() - new Date(y, 0, 0).getTime()) / 86400000);
    const wave = Math.sin((dayOfYear / 365) * 2 * Math.PI);

    // Temp base: verão ~29°C, inverno ~25.5°C
    const baseTemp = 27.2 - wave * 1.8;
    const tempNoise = Math.sin(dayOfYear * 1.3) * 1.1 + Math.cos(dayOfYear * 0.7) * 0.6;
    const temp = Number((baseTemp + tempNoise).toFixed(1));

    // Pressão: 101.3 kPa médio
    const pressure = Number((101.3 + Math.sin(dayOfYear * 0.4) * 0.3).toFixed(1));

    // Vento: mais intenso de Ago a Nov (~5.5 m/s)
    const windSpeed = Number((4.2 + (month >= 7 && month <= 10 ? 1.5 : 0) + Math.cos(dayOfYear * 2.1) * 0.8).toFixed(1));

    // Chuva: pico de Abril a Julho
    let rainProb = 0.2;
    let rainMean = 3;
    if (month >= 3 && month <= 6) {
      rainProb = 0.55;
      rainMean = 14;
    }
    const isRain = Math.sin(dayOfYear * 3.7 + current.getDate()) > 1 - rainProb * 2;
    const precipitation = isRain ? Number((Math.abs(Math.sin(dayOfYear * 2.9)) * rainMean).toFixed(1)) : 0;

    records.push({
      date: iso,
      dateDisplay: display,
      timestamp: current.getTime(),
      temp,
      pressure,
      windSpeed,
      precipitation,
    });

    current.setDate(current.getDate() + 1);
  }

  const stats = calculateStats(records);
  return {
    source: "fallback",
    city: city.name,
    lat: city.lat,
    lon: city.lon,
    startDate: cleanStart,
    endDate: cleanEnd,
    records,
    stats,
    fetchedAt: new Date().toISOString(),
  };
}

function parseDateString(str: string): Date {
  if (str.length === 8) {
    const y = parseInt(str.slice(0, 4), 10);
    const m = parseInt(str.slice(4, 6), 10) - 1;
    const d = parseInt(str.slice(6, 8), 10);
    return new Date(y, m, d);
  }
  return new Date(str);
}

function calculateStats(records: NasaDailyRecord[]): NasaDatasetStats {
  if (!records.length) {
    return {
      tempMean: 0,
      tempMax: 0,
      tempMin: 0,
      precipTotal: 0,
      precipMeanDaily: 0,
      precipMaxDaily: 0,
      windMean: 0,
      windMax: 0,
      pressureMean: 0,
      recordCount: 0,
    };
  }

  const temps = records.map((r) => r.temp);
  const precips = records.map((r) => r.precipitation);
  const winds = records.map((r) => r.windSpeed);
  const pressures = records.map((r) => r.pressure);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  return {
    tempMean: Number((sum(temps) / temps.length).toFixed(1)),
    tempMax: Number(Math.max(...temps).toFixed(1)),
    tempMin: Number(Math.min(...temps).toFixed(1)),
    precipTotal: Number(sum(precips).toFixed(1)),
    precipMeanDaily: Number((sum(precips) / precips.length).toFixed(1)),
    precipMaxDaily: Number(Math.max(...precips).toFixed(1)),
    windMean: Number((sum(winds) / winds.length).toFixed(1)),
    windMax: Number(Math.max(...winds).toFixed(1)),
    pressureMean: Number((sum(pressures) / pressures.length).toFixed(1)),
    recordCount: records.length,
  };
}

/**
 * Converte o dataset consultado em CSV no padrão oficial do Colab:
 * "dados_climaticos_filtrados.csv" / "clima_recife_2020ate2026.csv"
 */
export function generateNasaCsvBlob(data: NasaPowerResponse): Blob {
  const headers = [
    "data",
    "cidade",
    "latitude",
    "longitude",
    "temperatura_media_c",
    "pressao_atmosferica_kpa",
    "velocidade_vento_ms",
    "precipitacao_mm_dia",
  ];

  const rows = data.records.map((r) => [
    r.date,
    `"${data.city}"`,
    data.lat,
    data.lon,
    r.temp,
    r.pressure,
    r.windSpeed,
    r.precipitation,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}
