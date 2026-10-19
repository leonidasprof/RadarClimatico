import { useState, useEffect } from "react";
import {
  fetchNasaPowerData,
  generateNasaCsvBlob,
  NASA_SUPPORTED_CITIES,
  type NasaPowerResponse,
} from "@/lib/geo-services/nasa-power-service";
import {
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Database,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface NasaPowerDashboardViewProps {
  onBack?: () => void;
}

type ClimateVariable = "T2M" | "PRECTOTCORR" | "WS10M" | "PS";

export function NasaPowerDashboardView({ onBack }: NasaPowerDashboardViewProps) {
  const [selectedCity, setSelectedCity] = useState<string>("recife");
  // Período padrão: últimos 30 dias de referência
  const [startDate, setStartDate] = useState<string>("2024-01-01");
  const [endDate, setEndDate] = useState<string>("2024-01-31");
  const [activeVar, setActiveVar] = useState<ClimateVariable>("T2M");

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<NasaPowerResponse | null>(null);

  // Consulta automática ao carregar ou trocar cidade
  const loadData = async (city = selectedCity, start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const res = await fetchNasaPowerData(city, start, end);
      setData(res);
      if (res.source === "live") {
        toast.success("Dados meteorológicos atualizados via NASA POWER API", {
          description: `${res.records.length} medições sincronizadas para ${res.city}`,
        });
      } else if (res.source === "cache") {
        toast.info("Dados carregados do cache local de alta performance", {
          description: `Sessão recente para ${res.city}`,
        });
      } else {
        toast.warning("Modo Resiliente ativado (NASA POWER indisponível)", {
          description: "Exibindo série histórica meteorológica consolidada para a localidade.",
        });
      }
    } catch {
      toast.error("Erro ao processar dados climáticos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const handleDownloadCsv = () => {
    if (!data) return;
    const blob = generateNasaCsvBlob(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nasa_power_${selectedCity}_${startDate.replace(/-/g, "")}_${endDate.replace(/-/g, "")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Arquivo CSV exportado com sucesso!", {
      description: "Compatível com scripts Python / Pandas / Google Colab.",
    });
  };

  // Metadados da variável ativa
  const variableMeta: Record<
    ClimateVariable,
    { label: string; unit: string; icon: typeof Thermometer; color: string; desc: string }
  > = {
    T2M: {
      label: "Temperatura Média a 2m",
      unit: "°C",
      icon: Thermometer,
      color: "var(--heat-4)",
      desc: "Temperatura do ar a 2 metros da superfície.",
    },
    PRECTOTCORR: {
      label: "Precipitação Corrigida",
      unit: "mm/dia",
      icon: CloudRain,
      color: "#0ea5e9",
      desc: "Chuva diária consolidada com correção de viés de radar/satélite.",
    },
    WS10M: {
      label: "Velocidade do Vento a 10m",
      unit: "m/s",
      icon: Wind,
      color: "#10b981",
      desc: "Velocidade média dos ventos a 10 metros de altura.",
    },
    PS: {
      label: "Pressão Atmosférica",
      unit: "kPa",
      icon: Gauge,
      color: "#8b5cf6",
      desc: "Pressão barométrica na superfície local.",
    },
  };

  const currentMeta = variableMeta[activeVar];
  const Icon = currentMeta.icon;

  // Extração dos valores da variável ativa
  const records = data?.records || [];
  const chartValues = records.map((r) => {
    if (activeVar === "T2M") return r.temp;
    if (activeVar === "PRECTOTCORR") return r.precipitation;
    if (activeVar === "WS10M") return r.windSpeed;
    return r.pressure;
  });

  const minVal = chartValues.length ? Math.min(...chartValues) : 0;
  const maxVal = chartValues.length ? Math.max(...chartValues) : 1;
  const valRange = maxVal - minVal || 1;

  // Criação dos pontos do gráfico SVG responsivo
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const points = chartValues.map((val, i) => {
    const x = paddingX + (i / Math.max(1, chartValues.length - 1)) * plotWidth;
    const y = paddingY + plotHeight - ((val - minVal) / valRange) * plotHeight;
    return { x, y, val, date: records[i]?.dateDisplay || "" };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const polygonStr = `${paddingX},${svgHeight - paddingY} ${polylineStr} ${svgWidth - paddingX},${
    svgHeight - paddingY
  }`;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo NASA POWER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
              <CloudRain className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Dashboard Climático NASA POWER</h2>
                <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-sky-400">
                  API Oficial NASA LaRC
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitoramento de séries temporais de temperatura (T2M), precipitação (PRECTOTCORR), vento (WS10M) e pressão (PS).
              </p>
            </div>
          </div>
        </div>

        {/* Ações e Status da Conexão */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-1 text-xs">
            {data?.source === "live" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] text-emerald-400 font-semibold">NASA Online</span>
              </>
            ) : data?.source === "cache" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="font-mono text-[11px] text-sky-400">Cache Local</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-mono text-[11px] text-amber-400">Modo Resiliente</span>
              </>
            )}
          </div>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar dados da API"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-primary ${loading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={!data || loading}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Baixar base de dados em formato CSV para análise no Colab/Excel"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar CSV</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 cursor-pointer"
            >
              ← Voltar ao Radar
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Interativos (Cidade, Período e Variáveis) */}
      <div className="panel p-4 grid gap-3 md:grid-cols-12 items-center">
        {/* Seletor de Cidade */}
        <div className="md:col-span-4">
          <label className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1 mb-1">
            <MapPin className="h-3 w-3 text-sky-400" />
            Município / Localidade
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <optgroup label="Região Metropolitana do Recife (RMR)">
              <option value="recife">Recife - PE (Ponto Central)</option>
              <option value="olinda">Olinda - PE</option>
              <option value="jaboatao">Jaboatão dos Guararapes - PE</option>
              <option value="paulista">Paulista - PE</option>
              <option value="camaragibe">Camaragibe - PE</option>
              <option value="cabo">Cabo de Santo Agostinho - PE</option>
              <option value="igarassu">Igarassu - PE</option>
              <option value="ipojuca">Ipojuca / Suape - PE</option>
            </optgroup>
            <optgroup label="Cidades de Referência Comparativa">
              <option value="salvador">Salvador - BA</option>
              <option value="fortaleza">Fortaleza - CE</option>
              <option value="sao-paulo">São Paulo - SP</option>
              <option value="rio-janeiro">Rio de Janeiro - RJ</option>
              <option value="brasilia">Brasília - DF</option>
            </optgroup>
          </select>
        </div>

        {/* Seletor de Datas */}
        <div className="md:col-span-4 flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Botão de Aplicação do Filtro */}
        <div className="md:col-span-4 flex items-end">
          <button
            onClick={() => loadData(selectedCity, startDate, endDate)}
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 px-3 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Consultar Período Selecionado</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas da Consulta */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Temperatura */}
        <div
          onClick={() => setActiveVar("T2M")}
          className={`panel p-3.5 cursor-pointer transition-all border-l-4 ${
            activeVar === "T2M"
              ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
              : "border-transparent hover:border-orange-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-orange-400" />
              Temperatura Média (T2M)
            </span>
            <span className="font-mono text-[10px]">°C</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {data?.stats.tempMean ?? "--"} <span className="text-sm font-normal text-muted-foreground">°C</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Mín: {data?.stats.tempMin ?? "--"}° · Máx: {data?.stats.tempMax ?? "--"}°
          </p>
        </div>

        {/* Chuva */}
        <div
          onClick={() => setActiveVar("PRECTOTCORR")}
          className={`panel p-3.5 cursor-pointer transition-all border-l-4 ${
            activeVar === "PRECTOTCORR"
              ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30"
              : "border-transparent hover:border-sky-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <CloudRain className="h-3.5 w-3.5 text-sky-400" />
              Precipitação Acumulada
            </span>
            <span className="font-mono text-[10px]">mm</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-sky-400">
            {data?.stats.precipTotal ?? "--"} <span className="text-sm font-normal text-muted-foreground">mm</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Média diária: {data?.stats.precipMeanDaily ?? "--"} mm · Pico: {data?.stats.precipMaxDaily ?? "--"} mm
          </p>
        </div>

        {/* Vento */}
        <div
          onClick={() => setActiveVar("WS10M")}
          className={`panel p-3.5 cursor-pointer transition-all border-l-4 ${
            activeVar === "WS10M"
              ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
              : "border-transparent hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-emerald-400" />
              Velocidade do Vento (WS10M)
            </span>
            <span className="font-mono text-[10px]">m/s</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-400">
            {data?.stats.windMean ?? "--"} <span className="text-sm font-normal text-muted-foreground">m/s</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Rajada máxima no período: {data?.stats.windMax ?? "--"} m/s ({(Number(data?.stats.windMax || 0) * 3.6).toFixed(1)} km/h)
          </p>
        </div>

        {/* Pressão */}
        <div
          onClick={() => setActiveVar("PS")}
          className={`panel p-3.5 cursor-pointer transition-all border-l-4 ${
            activeVar === "PS"
              ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
              : "border-transparent hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-purple-400" />
              Pressão Barométrica (PS)
            </span>
            <span className="font-mono text-[10px]">kPa</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-purple-400">
            {data?.stats.pressureMean ?? "--"} <span className="text-sm font-normal text-muted-foreground">kPa</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {records.length} medições validadas
          </p>
        </div>
      </div>

      {/* Painel do Gráfico Interativo com SVG vetorial de alta precisão */}
      <div className="panel p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: currentMeta.color }} />
              <h3 className="text-sm font-bold text-foreground">
                {currentMeta.label} — {data?.city}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentMeta.desc}</p>
          </div>

          {/* Abas de alternância de variável */}
          <div className="flex flex-wrap gap-1 rounded-lg border border-border/80 bg-background/60 p-1">
            {(["T2M", "PRECTOTCORR", "WS10M", "PS"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveVar(v)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  activeVar === v
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "T2M" && "Temperatura"}
                {v === "PRECTOTCORR" && "Precipitação"}
                {v === "WS10M" && "Vento"}
                {v === "PS" && "Pressão"}
              </button>
            ))}
          </div>
        </div>

        {/* Visualização do Gráfico */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>Sincronizando série meteorológica com a NASA...</span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-muted-foreground text-xs">
            Nenhum dado encontrado para o intervalo selecionado.
          </div>
        ) : activeVar === "PRECTOTCORR" ? (
          // Visualização em Barras para Precipitação (idêntico ao plotly.bar do notebook)
          <div className="space-y-3">
            <div className="relative h-56 w-full">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-full w-full select-none" preserveAspectRatio="none">
                {/* Linhas de grade horizontal */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={paddingX} y1={paddingY + plotHeight * 0.5} x2={svgWidth - paddingX} y2={paddingY + plotHeight * 0.5} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" strokeOpacity="0.15" />

                {/* Barras diárias de chuva */}
                {records.map((r, i) => {
                  const barWidth = Math.max(3, (plotWidth / records.length) * 0.68);
                  const x = paddingX + (i / Math.max(1, records.length - 1)) * plotWidth - barWidth / 2;
                  const barHeight = ((r.precipitation - minVal) / valRange) * plotHeight;
                  const y = svgHeight - paddingY - barHeight;

                  return (
                    <g key={r.date} className="group">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(1, barHeight)}
                        rx={2}
                        fill="#0284c7"
                        className="transition-all hover:fill-sky-400 cursor-pointer"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground px-2">
              <span>{records[0]?.dateDisplay}</span>
              <span>Total no período: {data?.stats.precipTotal} mm</span>
              <span>{records[records.length - 1]?.dateDisplay}</span>
            </div>
          </div>
        ) : (
          // Visualização em Linha Contínua com Área Preenchida (idêntico ao plotly.line)
          <div className="space-y-3">
            <div className="relative h-56 w-full">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-full w-full select-none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nasaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentMeta.color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={currentMeta.color} stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Linhas de grade horizontal */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={paddingX} y1={paddingY + plotHeight * 0.5} x2={svgWidth - paddingX} y2={paddingY + plotHeight * 0.5} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" strokeOpacity="0.15" />

                {/* Área sob a curva */}
                <polygon points={polygonStr} fill="url(#nasaGradient)" />

                {/* Linha da série */}
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke={currentMeta.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Marcadores dos pontos */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={records.length > 40 ? 1.5 : 3}
                    fill={currentMeta.color}
                    className="drop-shadow-sm transition-transform hover:scale-150 cursor-pointer"
                  />
                ))}
              </svg>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground px-2">
              <span>{records[0]?.dateDisplay} ({minVal.toFixed(1)} {currentMeta.unit})</span>
              <span>Média: {(chartValues.reduce((a, b) => a + b, 0) / chartValues.length).toFixed(1)} {currentMeta.unit}</span>
              <span>{records[records.length - 1]?.dateDisplay} ({maxVal.toFixed(1)} {currentMeta.unit})</span>
            </div>
          </div>
        )}
      </div>

      {/* Prévia dos Dados Tabulares com Exportação */}
      <div className="panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-foreground">Amostra dos Dados Diários Sincronizados</h4>
            <p className="text-[11px] text-muted-foreground">
              Mostrando os primeiros 10 registros da série temporal da NASA POWER
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar planilha completa (.CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-mono text-[10px] uppercase text-muted-foreground border-b border-border/70">
              <tr>
                <th className="py-2 px-3">Data</th>
                <th className="py-2 px-3">Temp. Média (°C)</th>
                <th className="py-2 px-3">Chuva (mm/dia)</th>
                <th className="py-2 px-3">Vento (m/s)</th>
                <th className="py-2 px-3">Pressão (kPa)</th>
                <th className="py-2 px-3">Localidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {records.slice(0, 10).map((r) => (
                <tr key={r.date} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-3 font-semibold text-foreground">{r.dateDisplay}</td>
                  <td className="py-2 px-3 text-orange-400 font-bold">{r.temp.toFixed(1)}</td>
                  <td className="py-2 px-3 text-sky-400 font-semibold">{r.precipitation.toFixed(1)}</td>
                  <td className="py-2 px-3 text-emerald-400">{r.windSpeed.toFixed(1)}</td>
                  <td className="py-2 px-3 text-purple-400">{r.pressure.toFixed(1)}</td>
                  <td className="py-2 px-3 text-muted-foreground font-sans text-xs">{data?.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
