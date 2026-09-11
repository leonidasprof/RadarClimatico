import { useState } from "react";
import {
  zones,
  ndviVar,
  canopyVar,
  calculateCoolingImpact,
  ratingDefinitions,
  type Zone,
} from "@/lib/radar-data";
import { RecifeSatelliteMap } from "./RecifeSatelliteMap";
import { MapLayerSwitcher } from "./MapLayerSwitcher";
import {
  Trees,
  Leaf,
  Sliders,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Filter,
} from "lucide-react";

interface VegetationCoverViewProps {
  initialZone: Zone;
  onSelectZone: (zone: Zone) => void;
  onBackToThermalMap: () => void;
  activeLayer?: "calor" | "vegetal" | "vulnerabilidade";
  onChangeLayer?: (layer: "calor" | "vegetal" | "vulnerabilidade") => void;
}

export function VegetationCoverView({
  initialZone,
  onSelectZone,
  onBackToThermalMap,
  activeLayer = "vegetal",
  onChangeLayer,
}: VegetationCoverViewProps) {
  const [zoneA, setZoneA] = useState<Zone>(initialZone);
  // Bairro de comparação contrastante
  const [zoneB, setZoneB] = useState<Zone>(
    zones.find((z) => z.id !== initialZone.id && (z.rating === "A" || z.rating === "B")) ||
      zones[zones.length - 1]!
  );
  // Percentual adicional de árvores simulado (0 a 35%)
  const [treeIncrease, setTreeIncrease] = useState<number>(15);
  // Filtro na tabela de déficit
  const [filterPriority, setFilterPriority] = useState<string>("todos");

  // Cálculo da simulação de arrefecimento urbano para o Bairro A
  const simulation = calculateCoolingImpact(zoneA, treeIncrease);

  const deltaCanopy = Number((zoneA.canopy - zoneB.canopy).toFixed(1));
  const deltaNdvi = Number((zoneA.ndvi - zoneB.ndvi).toFixed(2));
  const deltaTemp = Number((zoneA.temp - zoneB.temp).toFixed(1));

  // Filtragem dos bairros na tabela de déficit
  const filteredZones = zones.filter((z) => {
    if (filterPriority === "todos") return true;
    return z.priorityStatus.toLowerCase() === filterPriority.toLowerCase();
  });

  const handleSelectPrimary = (z: Zone) => {
    setZoneA(z);
    onSelectZone(z);
  };

  const handleSwitchLayer = (layer: "calor" | "vegetal" | "vulnerabilidade") => {
    if (onChangeLayer) {
      onChangeLayer(layer);
    } else if (layer === "calor") {
      onBackToThermalMap();
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Navegação Superior e Seletor de Camadas do Mapa */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSwitchLayer("calor")}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer shadow-xs"
            title="Retornar à visualização do Mapa Térmico de Calor"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            <span>Voltar ao Mapa Térmico</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-canopy/20 text-canopy ring-1 ring-canopy/30">
                <Trees className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold tracking-tight">
                Cobertura Vegetal & Densidade Espectral (NDVI)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sensoriamento orbital por satélite, simulação de arrefecimento urbano e plano de plantio para o Recife.
            </p>
          </div>
        </div>

        {/* Seletores de Camada e de Comparação Territorial no Mapa Térmico */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Camadas Integrado do Mapa (Borda laranja e cores distintas) */}
          <MapLayerSwitcher activeLayer={activeLayer} onChangeLayer={handleSwitchLayer} />

          <div className="h-5 w-px bg-border/60 hidden sm:block" />

          {/* Seletores Territoriais de Comparação entre 2 Bairros (Sempre na mesma linha) */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-2.5 py-1 text-xs whitespace-nowrap">
              <span className="rounded bg-primary/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary shrink-0">
                Bairro A
              </span>
              <select
                value={zoneA.id}
                onChange={(e) => {
                  const found = zones.find((z) => z.id === e.target.value);
                  if (found) handleSelectPrimary(found);
                }}
                className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                {zones.map((z) => (
                  <option key={`a-${z.id}`} value={z.id} className="bg-card text-foreground">
                    {z.name} ({z.canopy}% copa)
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-mono text-muted-foreground shrink-0">vs</span>

            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-2.5 py-1 text-xs whitespace-nowrap">
              <span className="rounded bg-accent/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-accent shrink-0">
                Bairro B
              </span>
              <select
                value={zoneB.id}
                onChange={(e) => {
                  const found = zones.find((z) => z.id === e.target.value);
                  if (found) setZoneB(found);
                }}
                className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                {zones.map((z) => (
                  <option key={`b-${z.id}`} value={z.id} className="bg-card text-foreground">
                    {z.name} ({z.canopy}% copa)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de Comparação Direta entre os 2 Bairros Selecionados */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="panel p-3.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Trees className="h-3.5 w-3.5 text-canopy" />
            Diferença de Copa Arbórea
          </span>
          <p className="mt-1.5 flex items-baseline gap-1 font-display text-2xl font-bold">
            <span style={{ color: deltaCanopy >= 0 ? "var(--canopy)" : "var(--destructive)" }}>
              {deltaCanopy > 0 ? `+${deltaCanopy}%` : `${deltaCanopy}%`}
            </span>
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {zoneA.name} ({zoneA.canopy}%) vs {zoneB.name} ({zoneB.canopy}%)
          </p>
        </div>

        <div className="panel p-3.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Índice NDVI Relativo
          </span>
          <p className="mt-1.5 flex items-baseline gap-1 font-display text-2xl font-bold">
            <span style={{ color: deltaNdvi >= 0 ? "var(--canopy)" : "var(--accent)" }}>
              {deltaNdvi > 0 ? `+${deltaNdvi}` : deltaNdvi}
            </span>
            <span className="text-xs font-normal text-muted-foreground">escala orbital</span>
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {zoneA.ndvi.toFixed(2)} vs {zoneB.ndvi.toFixed(2)}
          </p>
        </div>

        <div className="panel p-3.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-primary" />
            Disparidade Térmica
          </span>
          <p className="mt-1.5 flex items-baseline gap-1 font-display text-2xl font-bold">
            <span style={{ color: deltaTemp > 0 ? "var(--heat-5)" : "var(--canopy)" }}>
              {deltaTemp > 0 ? `+${deltaTemp} °C` : `${deltaTemp} °C`}
            </span>
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {deltaTemp > 0 ? `${zoneA.name} mais quente` : `${zoneB.name} mais quente`}
          </p>
        </div>

        <div className="panel p-3.5 sm:col-span-3 lg:col-span-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Meta Municipal (OMS)
          </span>
          <div className="mt-1.5 flex items-baseline gap-1 font-display text-2xl font-bold text-foreground">
            30% <span className="text-xs font-normal text-muted-foreground">de copa contínua</span>
          </div>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {zoneA.canopy >= 30 ? "✓ Bairro A em conformidade" : `⚠️ Déficit de ${30 - zoneA.canopy}% em ${zoneA.name}`}
          </p>
        </div>
      </div>

      {/* GRID CENTRAL: MAPA DE SATÉLITE COM MANCHAS VERDES (NDVI) + SIMULADOR LATERAL */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* MAPA DE SATÉLITE CENTRAL (Col 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="panel p-4 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-canopy animate-pulse" />
                  Mosaico de Satélite Multiespectral · Recife
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Camada NDVI renderizada com isolinhas de calor e malha urbana. Clique nos marcadores para trocar o território.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-secondary/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Resolução 10m · Sentinel-2
                </span>
              </div>
            </div>

            {/* Mapa de Satélite */}
            <div className="h-[460px] w-full">
              <RecifeSatelliteMap
                mode="ndvi"
                selectedZoneA={zoneA}
                selectedZoneB={zoneB}
                onSelectZone={handleSelectPrimary}
                additionalTreesPct={treeIncrease}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* LATERAL: SIMULADOR DE ARREFECIMENTO (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel p-5 border-2 border-primary/30 relative overflow-hidden">
            {/* Brilho decorativo no topo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-canopy via-primary to-accent" />

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Sliders className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Simulador de Arrefecimento
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Microterritório foco: <strong>{zoneA.name}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTreeIncrease(15)}
                className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title="Restaurar padrão da simulação"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* CONTROLE DESLIZANTE (SLIDER INTERATIVO) */}
            <div className="mt-4 rounded-xl border border-border/80 bg-background/60 p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="tree-slider" className="font-semibold text-foreground flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-canopy" />
                  Expansão de Copa Arbórea
                </label>
                <span className="font-mono text-base font-extrabold text-canopy">
                  +{treeIncrease}% de árvores
                </span>
              </div>

              <input
                id="tree-slider"
                type="range"
                min="0"
                max="40"
                step="1"
                value={treeIncrease}
                onChange={(e) => setTreeIncrease(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-secondary accent-primary cursor-pointer transition-all"
              />

              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>0% (atual: {zoneA.canopy}%)</span>
                <span>+20%</span>
                <span>+40% (máx. viável)</span>
              </div>
            </div>

            {/* RESULTADOS PROJETADOS DA SIMULAÇÃO */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Queda de Temperatura de Superfície */}
                <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] font-mono uppercase tracking-wider">Queda Temp. Superfície</span>
                    <TrendingDown className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="mt-1 font-display text-2xl font-bold text-primary">
                    -{simulation.tempDrop} °C
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    De {zoneA.temp.toFixed(1)}°C para <strong>{simulation.newTemp}°C</strong>
                  </p>
                </div>

                {/* Queda na Sensação Térmica */}
                <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] font-mono uppercase tracking-wider">Alívio de Sensação</span>
                    <Wind className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-400">
                    -{simulation.feelsDrop} °C
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    De {zoneA.feels.toFixed(1)}°C para <strong>{simulation.newFeels}°C</strong>
                  </p>
                </div>
              </div>

              {/* Indicadores complementares de infraestrutura verde */}
              <div className="rounded-xl border border-border/80 bg-card/50 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Mudas Nativas Necessárias:</span>
                  <span className="font-mono font-bold text-foreground">
                    {simulation.treesToPlant.toLocaleString()} árvores
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Sombra em Calçadas & Vias:</span>
                  <span className="font-mono font-semibold text-foreground">
                    +{simulation.shadedAreaM2.toLocaleString()} m² contínuos
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="text-muted-foreground">Sequestro Anual de CO₂:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{simulation.co2Tons} toneladas/ano
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-muted-foreground">Nova Classificação Climática:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-muted-foreground line-through">Grau {zoneA.rating}</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span
                      className="rounded px-1.5 py-0.2 text-xs font-bold"
                      style={{
                        background: `color-mix(in oklab, ${ratingDefinitions[simulation.projectedRating].color} 20%, transparent)`,
                        color: ratingDefinitions[simulation.projectedRating].color,
                      }}
                    >
                      Grau {simulation.projectedRating} ({ratingDefinitions[simulation.projectedRating].name.split("/")[0]})
                    </span>
                  </div>
                </div>
              </div>

              {/* Parecer do Algoritmo */}
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-foreground leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Diagnóstico de Eficiência Arbórea:</strong> Um acréscimo de +{treeIncrease}% de copa em {zoneA.name} reduz a absorção asfáltica de radiação em ~26%, evitando a formação de ilhas de calor noturnas.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ABAIXO: TABELA DE "DÉFICIT ARBÓREO POR BAIRRO" */}
      <div className="panel p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-border/70">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trees className="h-4 w-4 text-canopy" />
              Déficit Arbóreo por Bairro · Região Metropolitana do Recife
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Matriz comparativa de cobertura vegetal, gap em relação à meta da OMS (30%) e estimativa de mudas necessárias.
            </p>
          </div>

          {/* Filtro rápido por nível de prioridade */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filtrar:
            </span>
            <div className="flex gap-1 rounded-md border border-border p-0.5 bg-card/60 text-xs">
              {["todos", "crítica", "alta", "moderada", "refúgio"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`rounded px-2 py-0.5 capitalize transition-colors cursor-pointer ${
                    filterPriority === p
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela de Bairros */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground text-left">
                <th className="pb-3 font-medium">Bairro</th>
                <th className="pb-3 font-medium">Cobertura Atual (%)</th>
                <th className="pb-3 font-medium">Meta Recomendada</th>
                <th className="pb-3 font-medium">Déficit Arbóreo (%)</th>
                <th className="pb-3 font-medium">Árvores Necessárias</th>
                <th className="pb-3 font-medium">NDVI Médio</th>
                <th className="pb-3 font-medium">Prioridade</th>
                <th className="pb-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredZones.map((z) => {
                const deficit = Math.max(0, 30 - z.canopy);
                const isSelected = z.id === zoneA.id;

                return (
                  <tr
                    key={z.id}
                    className={`transition-colors ${
                      isSelected ? "bg-primary/10 font-medium" : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Bairro */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: canopyVar(z.canopy) }}
                        />
                        <span className="font-semibold text-foreground text-sm">{z.name}</span>
                        {isSelected && (
                          <span className="rounded bg-primary/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
                            Ativo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cobertura Atual */}
                    <td className="py-3 font-mono font-bold" style={{ color: canopyVar(z.canopy) }}>
                      {z.canopy}%
                    </td>

                    {/* Meta */}
                    <td className="py-3 font-mono text-muted-foreground">30% (OMS)</td>

                    {/* Déficit */}
                    <td className="py-3 font-mono">
                      {deficit > 0 ? (
                        <span className="text-destructive font-semibold">-{deficit}%</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">Excedente (+{z.canopy - 30}%)</span>
                      )}
                    </td>

                    {/* Árvores Necessárias */}
                    <td className="py-3 font-mono">
                      {z.treesNeeded > 0 ? (
                        <span>{z.treesNeeded.toLocaleString()} mudas</span>
                      ) : (
                        <span className="text-emerald-400">Meta atingida</span>
                      )}
                    </td>

                    {/* NDVI */}
                    <td className="py-3 font-mono font-semibold" style={{ color: ndviVar(z.ndvi) }}>
                      {z.ndvi.toFixed(2)}
                    </td>

                    {/* Prioridade */}
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                          z.priorityStatus === "Crítica"
                            ? "bg-destructive/15 text-destructive"
                            : z.priorityStatus === "Alta"
                            ? "bg-amber-500/15 text-amber-500"
                            : z.priorityStatus === "Moderada"
                            ? "bg-primary/15 text-primary"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {z.priorityStatus}
                      </span>
                    </td>

                    {/* Ação */}
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleSelectPrimary(z)}
                        className="rounded-md border border-border bg-card/80 px-2.5 py-1 text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
                      >
                        Carregar no Simulador →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
