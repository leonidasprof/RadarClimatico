import { useState } from "react";
import {
  zones,
  zoneDailyHistory,
  zoneMonthlyHistory,
  zoneYearlyHistory,
  calculateMicroclimateDelta,
  heatVar,
  canopyVar,
  AVAILABLE_YEARS,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
  DAY_RANGE_OPTIONS,
  type Zone,
  type DayRange,
} from "@/lib/radar-data";
import {
  ArrowLeftRight,
  TrendingUp,
  ShieldAlert,
  Trees,
  Thermometer,
  Layers,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Calendar,
  BarChart2,
} from "lucide-react";

interface ComparisonHistoryViewProps {
  initialZone: Zone;
  onSelectZone: (zone: Zone) => void;
}

type DrillLevel = "year" | "month" | "day";

/**
 * Módulo de Comparação e Histórico (Épico 1)
 * Drill-down hierárquico interativo: Ano → Mês → Período de dias
 * - Nível Ano: pills clicáveis para selecionar e navegar para os meses
 * - Nível Mês: grid de meses com mini barras de prévia
 * - Nível Dias: seletor de período (3/7/14/30 dias) + slider de dia inicial + pickers inline
 */
export function ComparisonHistoryView({
  initialZone,
  onSelectZone,
}: ComparisonHistoryViewProps) {
  const [zoneA, setZoneA] = useState<Zone>(initialZone);
  const [zoneB, setZoneB] = useState<Zone>(
    zones.find((z) => z.id !== initialZone.id && (z.rating === "A" || z.rating === "B")) ||
      zones[zones.length - 1]!
  );

  // ─── Estado do drill-down ───────────────────────────────────────────────────
  const [drillLevel, setDrillLevel] = useState<DrillLevel>("year");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(7);
  const [dayRange, setDayRange] = useState<DayRange>(7);
  const [startDay, setStartDay] = useState<number>(1);

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][selectedMonthIndex] ?? 30;
  const maxStartDay = Math.max(1, daysInMonth - dayRange + 1);

  // ─── Dados ─────────────────────────────────────────────────────────────────
  const yearlyA = zoneYearlyHistory(zoneA);
  const yearlyB = zoneYearlyHistory(zoneB);
  const monthlyA = zoneMonthlyHistory(zoneA, selectedYear);
  const monthlyB = zoneMonthlyHistory(zoneB, selectedYear);
  const dailyA = zoneDailyHistory(zoneA, selectedYear, selectedMonthIndex, dayRange, startDay);
  const dailyB = zoneDailyHistory(zoneB, selectedYear, selectedMonthIndex, dayRange, startDay);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectYear = (year: number) => { setSelectedYear(year); setDrillLevel("month"); };
  const handleSelectMonth = (monthIndex: number) => { setSelectedMonthIndex(monthIndex); setStartDay(1); setDrillLevel("day"); };
  const handleBreadcrumbYear = () => setDrillLevel("year");
  const handleBreadcrumbMonth = () => setDrillLevel("month");

  // ─── Dados do gráfico ──────────────────────────────────────────────────────
  const getChartData = () => {
    if (drillLevel === "year")
      return {
        dataA: yearlyA.map((d) => ({ label: String(d.year), t: d.avgMax, key: d.year })),
        dataB: yearlyB.map((d) => ({ label: String(d.year), t: d.avgMax, key: d.year })),
      };
    if (drillLevel === "month")
      return {
        dataA: monthlyA.map((d) => ({ label: d.month, t: d.avgMax, key: d.monthIndex })),
        dataB: monthlyB.map((d) => ({ label: d.month, t: d.avgMax, key: d.monthIndex })),
      };
    return {
      dataA: dailyA.map((d) => ({ label: d.date, t: d.t, key: d.date })),
      dataB: dailyB.map((d) => ({ label: d.date, t: d.t, key: d.date })),
    };
  };

  const { dataA, dataB } = getChartData();
  const allTemps = [...dataA.map((d) => d.t), ...dataB.map((d) => d.t)];
  const minTemp = Math.min(...allTemps) - 1.5;
  const maxTemp = Math.max(...allTemps) + 1.5;
  const deltas = calculateMicroclimateDelta(zoneA, zoneB);

  const drillTitle =
    drillLevel === "year"
      ? "Média das Máximas por Ano (2022 – 2026)"
      : drillLevel === "month"
      ? `Média das Máximas por Mês — ${selectedYear}`
      : `Máximas Diárias — ${dayRange} dias · ${MONTH_NAMES_FULL[selectedMonthIndex]}/${selectedYear}`;

  const drillSubtitle =
    drillLevel === "year"
      ? "Selecione um ano para explorar os meses. Tendência de aquecimento urbano visível ao longo dos anos."
      : drillLevel === "month"
      ? "Selecione um mês para ver as máximas diárias no período escolhido."
      : `Exibindo do dia ${String(startDay).padStart(2, "0")} ao ${String(startDay + dayRange - 1).padStart(2, "0")} de ${MONTH_NAMES_FULL[selectedMonthIndex]}.`;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Comparação e Tendências Históricas</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Análise cruzada de disparidades microclimáticas com drill-down interativo por ano, mês e período.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: heatVar(zoneA.temp) }} />
            <select
              value={zoneA.id}
              onChange={(e) => {
                const found = zones.find((z) => z.id === e.target.value);
                if (found) { setZoneA(found); onSelectZone(found); }
              }}
              className="rounded-md border border-border bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {zones.map((z) => (<option key={`a-${z.id}`} value={z.id}>{z.name} ({z.temp}°C · {z.rating})</option>))}
            </select>
          </div>
          <span className="text-xs font-mono text-muted-foreground">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: heatVar(zoneB.temp) }} />
            <select
              value={zoneB.id}
              onChange={(e) => {
                const found = zones.find((z) => z.id === e.target.value);
                if (found) setZoneB(found);
              }}
              className="rounded-md border border-border bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {zones.map((z) => (<option key={`b-${z.id}`} value={z.id}>{z.name} ({z.temp}°C · {z.rating})</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Deltas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Diferença de Temperatura</span>
            <Thermometer className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-2xl font-semibold">
            <span style={{ color: deltas.tempDiff > 0 ? "var(--heat-5)" : "var(--heat-2)" }}>
              {deltas.tempDiff > 0 ? `+${deltas.tempDiff}` : deltas.tempDiff} °C
            </span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{zoneA.name} vs {zoneB.name}</p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Diferença Sensação Térmica</span>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-2xl font-semibold">
            <span style={{ color: deltas.feelsDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}>
              {deltas.feelsDiff > 0 ? `+${deltas.feelsDiff}` : deltas.feelsDiff} °C
            </span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {deltas.feelsDiff > 0 ? `${zoneA.name} mais sufocante` : `${zoneB.name} mais quente`}
          </p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Diferença de Arborização</span>
            <Trees className="h-4 w-4 text-canopy" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-2xl font-semibold">
            <span style={{ color: deltas.canopyDiff >= 0 ? "var(--canopy)" : "var(--destructive)" }}>
              {deltas.canopyDiff > 0 ? `+${deltas.canopyDiff}` : deltas.canopyDiff}%
            </span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {zoneA.canopy}% ({zoneA.name}) vs {zoneB.canopy}% ({zoneB.name})
          </p>
        </div>
        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Disparidade IVS (Vulnerab.)</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-2xl font-semibold">
            <span style={{ color: deltas.vulnDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}>
              {deltas.vulnDiff > 0 ? `+${deltas.vulnDiff}` : deltas.vulnDiff} pts
            </span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            IVS {zoneA.vuln} vs IVS {zoneB.vuln} (escala 0-100)
          </p>
        </div>
      </div>

      {/* ─── Painel principal de Drill-Down ─────────────────────────────────── */}
      <div className="panel p-5 space-y-5">

        {/* Cabeçalho: breadcrumb + título + legenda */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <nav className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mb-1.5 flex-wrap">
              <button
                onClick={handleBreadcrumbYear}
                className={`flex items-center gap-1 transition-colors ${drillLevel === "year" ? "text-primary font-bold pointer-events-none" : "hover:text-primary hover:underline cursor-pointer"}`}
              >
                <BarChart2 className="h-3 w-3" />
                Anos
              </button>
              {drillLevel !== "year" && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <button
                    onClick={handleBreadcrumbMonth}
                    className={`flex items-center gap-1 transition-colors ${drillLevel === "month" ? "text-primary font-bold pointer-events-none" : "hover:text-primary hover:underline cursor-pointer"}`}
                  >
                    <Calendar className="h-3 w-3" />
                    {selectedYear}
                  </button>
                </>
              )}
              {drillLevel === "day" && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="flex items-center gap-1 text-primary font-bold">
                    <CalendarDays className="h-3 w-3" />
                    {MONTH_NAMES_FULL[selectedMonthIndex]}
                  </span>
                </>
              )}
            </nav>
            <h3 className="text-sm font-semibold leading-snug">{drillTitle}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{drillSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {drillLevel !== "year" && (
              <button
                onClick={drillLevel === "day" ? handleBreadcrumbMonth : handleBreadcrumbYear}
                className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            )}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ background: heatVar(zoneA.temp) }} />
                <span className="font-medium text-foreground">{zoneA.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-accent" />
                <span className="font-medium text-foreground">{zoneB.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── NÍVEL ANO: pills de anos clicáveis ─────────────────────────── */}
        {drillLevel === "year" && (
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Selecione o ano para explorar →
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => handleSelectYear(year)}
                  className={`group relative flex flex-col items-center rounded-xl border px-6 py-3 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    year === selectedYear
                      ? "border-primary bg-primary/15 shadow-md shadow-primary/20"
                      : "border-border/60 bg-secondary/40 hover:border-primary/50 hover:bg-primary/10"
                  }`}
                >
                  <span className={`font-mono text-base font-bold ${year === selectedYear ? "text-primary" : "text-foreground"}`}>
                    {year}
                  </span>
                  {year === 2026 && (
                    <span className="mt-0.5 rounded-full bg-primary/20 px-1.5 font-mono text-[9px] font-bold text-primary uppercase tracking-wide">
                      atual
                    </span>
                  )}
                  <span className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                    {yearlyA.find((d) => d.year === year)?.avgMax.toFixed(1)}° / {yearlyB.find((d) => d.year === year)?.avgMax.toFixed(1)}°
                  </span>
                  <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── NÍVEL MÊS: grid de meses com mini barras ───────────────────── */}
        {drillLevel === "month" && (
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Selecione o mês em {selectedYear} →
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
              {MONTH_NAMES_SHORT.map((m, idx) => {
                const avgA = monthlyA[idx]?.avgMax ?? 0;
                const avgB = monthlyB[idx]?.avgMax ?? 0;
                const isSelected = idx === selectedMonthIndex;
                return (
                  <button
                    key={m}
                    onClick={() => handleSelectMonth(idx)}
                    className={`flex flex-col items-center rounded-xl border px-2 py-2.5 text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isSelected
                        ? "border-primary bg-primary/15 shadow shadow-primary/20"
                        : "border-border/60 bg-secondary/40 hover:border-primary/40 hover:bg-primary/10"
                    }`}
                  >
                    <span className={`font-mono text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {m}
                    </span>
                    <div className="mt-1.5 h-8 w-full flex items-end justify-center gap-0.5">
                      <div
                        className="w-2 rounded-t transition-all"
                        style={{ height: `${Math.max(20, ((avgA - 26) / (40 - 26)) * 100)}%`, background: heatVar(avgA) }}
                      />
                      <div
                        className="w-2 rounded-t bg-accent opacity-80 transition-all"
                        style={{ height: `${Math.max(20, ((avgB - 26) / (40 - 26)) * 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 font-mono text-[9px] text-muted-foreground">
                      {avgA.toFixed(0)}°
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NÍVEL DIA: seletor de período + slider de dia inicial ──────── */}
        {drillLevel === "day" && (
          <div className="flex flex-wrap gap-5 items-start rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
            {/* Período em dias */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Período
              </p>
              <div className="flex items-center gap-1.5">
                {DAY_RANGE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setDayRange(r);
                      setStartDay(Math.min(startDay, Math.max(1, daysInMonth - r + 1)));
                    }}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                      dayRange === r
                        ? "border-primary bg-primary text-primary-foreground shadow"
                        : "border-border/60 bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
            </div>

            {/* Slider de dia inicial */}
            <div className="flex-1 min-w-52 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  A partir do dia
                </p>
                <span className="font-mono text-xs font-bold text-primary">
                  {String(startDay).padStart(2, "0")}/{String(selectedMonthIndex + 1).padStart(2, "0")}
                  {" "}→{" "}
                  {String(Math.min(startDay + dayRange - 1, daysInMonth)).padStart(2, "0")}/{String(selectedMonthIndex + 1).padStart(2, "0")}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={maxStartDay}
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
                className="w-full h-1.5 appearance-none rounded-full bg-border cursor-pointer accent-primary"
              />
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
                <span>Dia 01</span>
                <span>Dia {String(daysInMonth).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Troca de mês inline */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Mês</p>
              <select
                value={selectedMonthIndex}
                onChange={(e) => { setSelectedMonthIndex(Number(e.target.value)); setStartDay(1); }}
                className="rounded-lg border border-border/70 bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {MONTH_NAMES_FULL.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
            </div>

            {/* Troca de ano inline */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ano</p>
              <div className="flex items-center gap-1 flex-wrap">
                {AVAILABLE_YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`rounded-md border px-2 py-1 font-mono text-[10px] font-bold transition-all ${
                      selectedYear === y
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GRÁFICO DE BARRAS PAREADAS ─────────────────────────────────── */}
        <div
          className="pb-2 pt-4"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${dataA.length}, minmax(0, 1fr))`,
            gap: dataA.length > 10 ? "0.25rem" : dataA.length > 6 ? "0.5rem" : "0.75rem",
          }}
        >
          {dataA.map((itemA, i) => {
            const itemB = dataB[i]!;
            const heightA = ((itemA.t - minTemp) / (maxTemp - minTemp)) * 100;
            const heightB = ((itemB.t - minTemp) / (maxTemp - minTemp)) * 100;
            const isClickable = drillLevel !== "day";
            return (
              <div key={String(itemA.key)} className="flex flex-col items-center">
                <div className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground mb-1 flex-wrap justify-center">
                  <span className="font-semibold text-foreground">{itemA.t.toFixed(1)}°</span>
                  <span className="opacity-40">/</span>
                  <span>{itemB.t.toFixed(1)}°</span>
                </div>
                <div
                  className={`relative flex h-44 w-full items-end justify-center gap-1 rounded bg-secondary/30 p-1 transition-all ${
                    isClickable ? "cursor-pointer group hover:bg-primary/10 hover:ring-1 hover:ring-primary/30" : ""
                  }`}
                  onClick={() => {
                    if (drillLevel === "year") handleSelectYear(itemA.key as number);
                    else if (drillLevel === "month") handleSelectMonth(itemA.key as number);
                  }}
                  title={isClickable ? `Clique para detalhar ${itemA.label}` : undefined}
                >
                  <div
                    className="w-1/2 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(heightA, 6)}%`, background: heatVar(itemA.t) }}
                    title={`${zoneA.name}: ${itemA.t}°C`}
                  />
                  <div
                    className="w-1/2 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(heightB, 6)}%`, background: "var(--accent)", opacity: 0.85 }}
                    title={`${zoneB.name}: ${itemB.t}°C`}
                  />
                  {isClickable && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="rounded-full bg-primary/20 p-1">
                        <ChevronRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="mt-1.5 font-mono text-[9px] text-muted-foreground text-center leading-tight break-all">
                  {itemA.label}
                </span>
              </div>
            );
          })}
        </div>

        {drillLevel !== "day" && (
          <p className="text-center font-mono text-[10px] text-muted-foreground/50">
            {drillLevel === "year"
              ? "▲ Clique em um ano (pills ou barras) para explorar os meses"
              : "▲ Clique em um mês (pills ou barras) para ver o período diário"}
          </p>
        )}
      </div>

      {/* Tabela Comparativa + Diagnóstico */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 panel p-5">
          <h3 className="text-sm font-semibold mb-3">Tabela Direta de Indicadores Físico-Climáticos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Indicador</th>
                  <th className="pb-2 font-medium">{zoneA.name}</th>
                  <th className="pb-2 font-medium">{zoneB.name}</th>
                  <th className="pb-2 font-medium text-right">Diferença Líquida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-2.5 text-muted-foreground">Temperatura Atual</td>
                  <td className="py-2.5 font-mono font-semibold">{zoneA.temp.toFixed(1)} °C</td>
                  <td className="py-2.5 font-mono font-semibold">{zoneB.temp.toFixed(1)} °C</td>
                  <td className="py-2.5 font-mono font-semibold text-right" style={{ color: deltas.tempDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}>
                    {deltas.tempDiff > 0 ? `+${deltas.tempDiff}` : deltas.tempDiff} °C
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Sensação Térmica Máxima</td>
                  <td className="py-2.5 font-mono font-semibold">{zoneA.feels.toFixed(1)} °C</td>
                  <td className="py-2.5 font-mono font-semibold">{zoneB.feels.toFixed(1)} °C</td>
                  <td className="py-2.5 font-mono font-semibold text-right" style={{ color: deltas.feelsDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}>
                    {deltas.feelsDiff > 0 ? `+${deltas.feelsDiff}` : deltas.feelsDiff} °C
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Cobertura Arbórea (Canopy)</td>
                  <td className="py-2.5 font-mono font-semibold" style={{ color: canopyVar(zoneA.canopy) }}>{zoneA.canopy}%</td>
                  <td className="py-2.5 font-mono font-semibold" style={{ color: canopyVar(zoneB.canopy) }}>{zoneB.canopy}%</td>
                  <td className="py-2.5 font-mono font-semibold text-right" style={{ color: deltas.canopyDiff >= 0 ? "var(--canopy)" : "var(--destructive)" }}>
                    {deltas.canopyDiff > 0 ? `+${deltas.canopyDiff}` : deltas.canopyDiff}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Umidade Relativa</td>
                  <td className="py-2.5 font-mono">{zoneA.humidity}%</td>
                  <td className="py-2.5 font-mono">{zoneB.humidity}%</td>
                  <td className="py-2.5 font-mono text-right text-muted-foreground">
                    {deltas.humidityDiff > 0 ? `+${deltas.humidityDiff}` : deltas.humidityDiff}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Vulnerabilidade Social (IVS)</td>
                  <td className="py-2.5 font-mono">{zoneA.vuln}/100</td>
                  <td className="py-2.5 font-mono">{zoneB.vuln}/100</td>
                  <td className="py-2.5 font-mono font-semibold text-right" style={{ color: deltas.vulnDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}>
                    {deltas.vulnDiff > 0 ? `+${deltas.vulnDiff}` : deltas.vulnDiff} pts
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Classificação de Resiliência</td>
                  <td className="py-2.5 font-display font-bold" style={{ color: heatVar(zoneA.temp) }}>Grau {zoneA.rating}</td>
                  <td className="py-2.5 font-display font-bold" style={{ color: heatVar(zoneB.temp) }}>Grau {zoneB.rating}</td>
                  <td className="py-2.5 font-mono text-right text-muted-foreground">
                    {zoneA.rating === zoneB.rating ? "Equivalente" : "Divergente"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Diagnóstico da Disparidade</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O bairro <strong>{zoneA.name}</strong> registra uma sensação térmica{" "}
              {Math.abs(deltas.feelsDiff)} °C {deltas.feelsDiff >= 0 ? "superior" : "inferior"} em relação a{" "}
              <strong>{zoneB.name}</strong>.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              Esta disparidade é explicada prioritariamente pelo contraste de cobertura arbórea (
              <strong>{zoneA.canopy}%</strong> vs <strong>{zoneB.canopy}%</strong>) somada à retenção de
              radiação solar pela densidade de concreto e tráfego viário.
            </p>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-card p-3.5 shadow-md">
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500 font-bold">Diretriz Tática</span>
                  <span className="text-xs font-bold text-foreground">Recomendação para a Defesa Civil</span>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${deltas.tempDiff > 0 || deltas.vulnDiff > 20 ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary/20 text-primary"}`}>
                {deltas.tempDiff > 0 || deltas.vulnDiff > 20 ? "Ação Operacional" : "Monitoramento"}
              </span>
            </div>
            <p className="mt-2.5 text-xs font-semibold text-foreground leading-relaxed">
              {deltas.tempDiff > 0 || deltas.vulnDiff > 20
                ? `Priorizar envio imediato de equipes de apoio, distribuição de água potável e bebedouros móveis para ${zoneA.name}.`
                : `Ambos os bairros mantêm parâmetros operacionais controlados sem emergência imediata.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}