import { useState } from "react";
import { zones, priorities, canopyVar, heatVar, type Zone } from "@/lib/radar-data";
import { Trees, Leaf, TrendingUp, AlertCircle, Sparkles, MapPin, ArrowUpDown } from "lucide-react";

interface GreenDashboardViewProps {
  onSelectZone: (zone: Zone) => void;
}

/**
 * Dashboard Verde (Épico 1)
 * Tela dedicada à consulta de dados de áreas verdes, déficit de arborização urbana
 * e impacto direto da cobertura vegetal na mitigação de ilhas de calor no Recife.
 */
export function GreenDashboardView({ onSelectZone }: GreenDashboardViewProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Ordenação dos bairros por índice de cobertura vegetal
  const sortedZones = [...zones].sort((a, b) =>
    sortOrder === "desc" ? b.canopy - a.canopy : a.canopy - b.canopy
  );

  // Cálculo das métricas consolidadas municipais
  const avgCanopy = (zones.reduce((acc, z) => acc + z.canopy, 0) / zones.length).toFixed(1);
  const mostVegetated = [...zones].sort((a, b) => b.canopy - a.canopy)[0]!;
  const leastVegetated = [...zones].sort((a, b) => a.canopy - b.canopy)[0]!;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard Verde */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canopy/20 text-canopy">
              <Trees className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Dashboard de Áreas Verdes & Cobertura Arbórea</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitoramento do dossel vegetal urbano, déficit de sombreamento e priorização de corredores ecológicos no Recife.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Ordenar: {sortOrder === "desc" ? "Maior cobertura" : "Menor cobertura"}</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Ambientais (KPIs Verdes) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Cobertura média urbana</span>
            <Leaf className="h-4 w-4 text-canopy" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-semibold text-canopy">
            {avgCanopy}%
            <span className="text-xs font-normal text-muted-foreground">/ meta 30%</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Déficit de 10,2% para atingir o padrão OMS
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Maior refúgio térmico</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-semibold text-foreground">
            {mostVegetated.name}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {mostVegetated.canopy}% vegetal · {mostVegetated.temp}°C (ilhas amenas)
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Zona mais crítica (déficit)</span>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-semibold text-destructive">
            {leastVegetated.name}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Apenas {leastVegetated.canopy}% vegetal · Sensação {leastVegetated.feels}°C
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Mitigação térmica estimada</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-semibold text-primary">
            -3,8 °C
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Redução média para cada +15% de arborização
          </p>
        </div>
      </div>

      {/* Grid Principal: Ranking de Bairros e Correlação Microclimática */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Coluna Esquerda: Ranking e Detalhamento da Cobertura Arbórea */}
        <div className="lg:col-span-7 space-y-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Índice de Cobertura Arbórea por Bairro</h3>
                <p className="text-xs text-muted-foreground">
                  Percentual de cobertura de copa arbórea (canopy cover) vs limiar de resiliência climática
                </p>
              </div>
              <span className="font-mono text-xs rounded bg-secondary px-2 py-0.5 text-muted-foreground">
                8 bairros monitorados
              </span>
            </div>

            <div className="space-y-4">
              {sortedZones.map((z) => {
                const isSafe = z.canopy >= 30;
                return (
                  <div
                    key={z.id}
                    onClick={() => onSelectZone(z)}
                    className="group rounded-lg border border-border/60 bg-background/50 p-3 transition-all hover:bg-card hover:border-primary/40 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-semibold text-foreground text-sm">{z.name}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          (Temp. {z.temp.toFixed(1)}°C · Sensação {z.feels.toFixed(1)}°C)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono font-bold text-xs"
                          style={{ color: canopyVar(z.canopy) }}
                        >
                          {z.canopy}% cobertura
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${isSafe
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-destructive/15 text-destructive"
                            }`}
                        >
                          {isSafe ? "Resiliente" : "Déficit"}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progresso da cobertura com marcador da meta de 30% */}
                    <div className="relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(z.canopy, 100)}%`,
                          background: canopyVar(z.canopy),
                        }}
                      />
                      {/* Marcador da linha de corte de 30% da OMS */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
                        style={{ left: "30%" }}
                        title="Meta recomendada da OMS (30%)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Correlação Térmica e Ações Prioritárias */}
        <div className="lg:col-span-5 space-y-4">
          {/* Matriz de Correlação: Vegetação vs Sensação Térmica */}
          <div className="panel p-5">
            <h3 className="text-sm font-semibold">Correlação Microclimática</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              Evidência empírica: quanto menor o dossel arbóreo, maior o acúmulo de radiação térmica de superfície.
            </p>

            <div className="rounded-lg border border-border/80 bg-background/50 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Bairros com &gt; 35% de árvores</span>
                <span className="font-mono font-medium text-emerald-500">Média 32,6 °C sensação</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Bairros com 10% a 35% de árvores</span>
                <span className="font-mono font-medium text-amber-500">Média 40,2 °C sensação</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bairros com &lt; 10% de árvores</span>
                <span className="font-mono font-medium text-destructive">Média 43,6 °C sensação (+11°C!)</span>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Diagnóstico de Gestão Urbana:</strong> Áreas com asfalto exposto e ausência de arborização viária contínua (ex: Santo Amaro e Boa Vista) funcionam como baterias térmicas durante a tarde, retendo calor até às 22h.
              </p>
            </div>
          </div>

          {/* Plano de Ação & Corredores Ecológicos */}
          <div className="panel p-5">
            <h3 className="text-sm font-semibold">Plano de Arborização & Corredores Verdes</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              Intervenções prioritárias validadas pelo cruzamento de calor e vulnerabilidade social.
            </p>

            <ul className="space-y-3">
              {priorities.map((p) => (
                <li
                  key={p.zone}
                  className="rounded-lg border border-border/70 bg-card/60 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{p.zone}</span>
                    <span className="font-mono text-[11px] font-bold text-primary">
                      Score {p.score}/100
                    </span>
                  </div>
                  <p className="text-muted-foreground">{p.action}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      Status: Em planejamento
                    </span>
                    <button
                      onClick={() => {
                        const target = zones.find((z) => z.name === p.zone);
                        if (target) onSelectZone(target);
                      }}
                      className="text-primary hover:underline text-[11px] font-medium cursor-pointer"
                    >
                      Ver detalhes no mapa →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
