import { useState } from "react";
import {
  zones,
  zoneHistory,
  calculateMicroclimateDelta,
  heatVar,
  canopyVar,
  type Zone,
} from "@/lib/radar-data";
import { ArrowLeftRight, TrendingUp, ShieldAlert, Trees, Thermometer, Layers } from "lucide-react";

interface ComparisonHistoryViewProps {
  initialZone: Zone;
  onSelectZone: (zone: Zone) => void;
}

/**
 * Módulo de Comparação e Histórico (Épico 1)
 * Permite selecionar dois bairros e comparar diretamente curvas históricas de 7 dias,
 * índices de sensibilidade térmica, cobertura arbórea e vulnerabilidade social.
 */
export function ComparisonHistoryView({
  initialZone,
  onSelectZone,
}: ComparisonHistoryViewProps) {
  const [zoneA, setZoneA] = useState<Zone>(initialZone);
  // Pré-seleciona um bairro com características contrastantes para enriquecer a análise
  const [zoneB, setZoneB] = useState<Zone>(
    zones.find((z) => z.id !== initialZone.id && (z.rating === "A" || z.rating === "B")) ||
      zones[zones.length - 1]!
  );

  const historyA = zoneHistory(zoneA);
  const historyB = zoneHistory(zoneB);

  // Lógica de cálculo dos deltas comparativos
  const deltas = calculateMicroclimateDelta(zoneA, zoneB);

  // Escala dinâmica para o gráfico comparativo
  const allTemps = [...historyA.map((d) => d.t), ...historyB.map((d) => d.t)];
  const minTemp = Math.min(...allTemps) - 1.5;
  const maxTemp = Math.max(...allTemps) + 1.5;

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
            Análise cruzada de disparidades microclimáticas e evolução de temperaturas dos últimos 7 dias.
          </p>
        </div>

        {/* Seletores rápidos dos bairros a comparar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: heatVar(zoneA.temp) }} />
            <select
              value={zoneA.id}
              onChange={(e) => {
                const found = zones.find((z) => z.id === e.target.value);
                if (found) {
                  setZoneA(found);
                  onSelectZone(found);
                }
              }}
              className="rounded-md border border-border bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {zones.map((z) => (
                <option key={`a-${z.id}`} value={z.id}>
                  {z.name} ({z.temp}°C · {z.rating})
                </option>
              ))}
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
              {zones.map((z) => (
                <option key={`b-${z.id}`} value={z.id}>
                  {z.name} ({z.temp}°C · {z.rating})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Deltas Comparativos (Disparidade Microclimática) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Delta Temperatura */}
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
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {zoneA.name} vs {zoneB.name}
          </p>
        </div>

        {/* Delta Sensação Térmica */}
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

        {/* Delta Cobertura Vegetal */}
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

        {/* Delta Vulnerabilidade */}
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

      {/* Gráfico Comparativo de Séries Históricas de 7 Dias */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-semibold">
              Evolução Térmica Comparada — Últimos 7 Dias (Máximas Diárias)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparativo dia a dia para identificar persistência de ondas de calor e capacidade de resfriamento noturno.
            </p>
          </div>

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

        {/* Barras Pareadas por Dia */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 pt-4 pb-2">
          {historyA.map((itemA, i) => {
            const itemB = historyB[i]!;
            const heightA = ((itemA.t - minTemp) / (maxTemp - minTemp)) * 100;
            const heightB = ((itemB.t - minTemp) / (maxTemp - minTemp)) * 100;

            return (
              <div key={itemA.day} className="flex flex-col items-center">
                {/* Valores térmicos no topo */}
                <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">{itemA.t.toFixed(1)}°</span>
                  <span>/</span>
                  <span className="text-muted-foreground">{itemB.t.toFixed(1)}°</span>
                </div>

                {/* Coluna com barras pareadas */}
                <div className="flex h-44 w-full items-end justify-center gap-1 rounded bg-secondary/30 p-1">
                  {/* Barra Zona A */}
                  <div
                    className="w-1/2 rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(heightA, 10)}%`,
                      background: heatVar(itemA.t),
                    }}
                    title={`${zoneA.name}: ${itemA.t}°C`}
                  />
                  {/* Barra Zona B */}
                  <div
                    className="w-1/2 rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(heightB, 10)}%`,
                      background: "var(--accent)",
                      opacity: 0.85,
                    }}
                    title={`${zoneB.name}: ${itemB.t}°C`}
                  />
                </div>

                {/* Rótulo do dia */}
                <span className="mt-2 font-mono text-xs text-muted-foreground">{itemA.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela Comparativa de Parâmetros e Diagnóstico Técnico */}
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
                  <td
                    className="py-2.5 font-mono font-semibold text-right"
                    style={{ color: deltas.tempDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}
                  >
                    {deltas.tempDiff > 0 ? `+${deltas.tempDiff}` : deltas.tempDiff} °C
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Sensação Térmica Máxima</td>
                  <td className="py-2.5 font-mono font-semibold">{zoneA.feels.toFixed(1)} °C</td>
                  <td className="py-2.5 font-mono font-semibold">{zoneB.feels.toFixed(1)} °C</td>
                  <td
                    className="py-2.5 font-mono font-semibold text-right"
                    style={{ color: deltas.feelsDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}
                  >
                    {deltas.feelsDiff > 0 ? `+${deltas.feelsDiff}` : deltas.feelsDiff} °C
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Cobertura Arbórea (Canopy)</td>
                  <td className="py-2.5 font-mono font-semibold" style={{ color: canopyVar(zoneA.canopy) }}>
                    {zoneA.canopy}%
                  </td>
                  <td className="py-2.5 font-mono font-semibold" style={{ color: canopyVar(zoneB.canopy) }}>
                    {zoneB.canopy}%
                  </td>
                  <td
                    className="py-2.5 font-mono font-semibold text-right"
                    style={{ color: deltas.canopyDiff >= 0 ? "var(--canopy)" : "var(--destructive)" }}
                  >
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
                  <td
                    className="py-2.5 font-mono font-semibold text-right"
                    style={{ color: deltas.vulnDiff > 0 ? "var(--heat-5)" : "var(--accent)" }}
                  >
                    {deltas.vulnDiff > 0 ? `+${deltas.vulnDiff}` : deltas.vulnDiff} pts
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Classificação de Resiliência</td>
                  <td className="py-2.5 font-display font-bold" style={{ color: heatVar(zoneA.temp) }}>
                    Grau {zoneA.rating}
                  </td>
                  <td className="py-2.5 font-display font-bold" style={{ color: heatVar(zoneB.temp) }}>
                    Grau {zoneB.rating}
                  </td>
                  <td className="py-2.5 font-mono text-right text-muted-foreground">
                    {zoneA.rating === zoneB.rating ? "Equivalente" : "Divergente"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Parecer Técnico Automatizado */}
        <div className="lg:col-span-4 panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Diagnóstico da Disparidade</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O bairro <strong>{zoneA.name}</strong> registra uma sensação térmica{" "}
              {Math.abs(deltas.feelsDiff)} °C {deltas.feelsDiff >= 0 ? "superior" : "inferior"} em
              relação a <strong>{zoneB.name}</strong>.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              Esta disparidade é explicada prioritariamente pelo contraste de cobertura arbórea (
              <strong>{zoneA.canopy}%</strong> vs <strong>{zoneB.canopy}%</strong>) somada à retenção de
              radiação solar pela densidade de concreto e tráfego viário.
            </p>
          </div>

          {/* Área de Recomendação para Órgão (Defesa Civil) em Alto Destaque */}
          <div className="mt-4 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-card p-3.5 shadow-md">
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                    Diretriz Tática
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Recomendação para a Defesa Civil
                  </span>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                  deltas.tempDiff > 0 || deltas.vulnDiff > 20
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-primary/20 text-primary"
                }`}
              >
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
