import { useState } from "react";
import {
  RMR_MUNICIPALITIES,
  RECIFE_SPATIAL_GRID,
  ARBORIS_STATISTICAL_CORRELATIONS,
  MAPBIOMAS_REFERENCE,
  ARBORIS_SEASONAL_COMPOSITES,
  type RmrMunicipality,
  type SpatialGridCell,
} from "@/lib/geo-services/arboris-geodata";
import {
  calculateSpatialLinearRegression,
  generateRecifeGridCsvBlob,
  generateCorrelationsCsvBlob,
  generateRmrMunicipiosCsvBlob,
  getMetropolitanHeatInsights,
} from "@/lib/geo-services/climate-analytics";
import {
  Trees,
  TrendingDown,
  Layers,
  Thermometer,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface EnvironmentalAnalysisViewProps {
  onSelectMunicipality?: (municipality: RmrMunicipality) => void;
  onBack?: () => void;
}

export function EnvironmentalAnalysisView({
  onSelectMunicipality,
  onBack,
}: EnvironmentalAnalysisViewProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>("Jan–Mar 2025");
  const [filterRmr, setFilterRmr] = useState<"todos" | "critico" | "alta" | "preservacao">("todos");
  const [selectedCell, setSelectedCell] = useState<SpatialGridCell | null>(RECIFE_SPATIAL_GRID[0]!);

  const regression = calculateSpatialLinearRegression(RECIFE_SPATIAL_GRID);
  const insights = getMetropolitanHeatInsights();

  // Filtro dos municípios da RMR
  const filteredMunicipalities = RMR_MUNICIPALITIES.filter((m) => {
    if (filterRmr === "todos") return true;
    if (filterRmr === "critico") return m.prioridadePlantio === "Crítica";
    if (filterRmr === "alta") return m.prioridadePlantio === "Alta";
    return m.prioridadePlantio === "Preservação";
  });

  // Download dos CSVs oficiais
  const handleDownloadGridCsv = () => {
    const blob = generateRecifeGridCsvBlob();
    downloadBlob(blob, "arboris_grade_verde_temperatura_2023.csv");
    toast.success("Grade espacial de Recife (1 km) exportada em CSV.");
  };

  const handleDownloadCorrCsv = () => {
    const blob = generateCorrelationsCsvBlob();
    downloadBlob(blob, "arboris_correlacoes_2023.csv");
    toast.success("Matriz de correlações de Pearson exportada em CSV.");
  };

  const handleDownloadRmrCsv = () => {
    const blob = generateRmrMunicipiosCsvBlob();
    downloadBlob(blob, "arboris_rmr_municipios_2021.csv");
    toast.success("Tabela metropolitana da RMR exportada em CSV.");
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dimensões do Scatter Plot (Dispersão x Regressão)
  const plotW = 600;
  const plotH = 260;
  const padX = 45;
  const padY = 30;
  const innerW = plotW - padX * 2;
  const innerH = plotH - padY * 2;

  // Eixo X: Cobertura Verde (0% a 90%)
  const minX = 0;
  const maxX = 90;
  // Eixo Y: LST (°C) (26°C a 38°C)
  const minY = 26;
  const maxY = 38;

  const toSvgX = (x: number) => padX + ((x - minX) / (maxX - minX)) * innerW;
  const toSvgY = (y: number) => padY + innerH - ((y - minY) / (maxY - minY)) * innerH;

  // Linha de regressão calculada
  const lineP1 = { x: toSvgX(0), y: toSvgY(regression.intercept) };
  const lineP2 = { x: toSvgX(85), y: toSvgY(regression.slope * 85 + regression.intercept) };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <TrendingDown className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Análise Ambiental: Cobertura Vegetal × Temperatura de Superfície
                </h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                  MapBiomas 11 + Landsat 8/9
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modelagem biofísica e estatística espacial para Recife e os 14 municípios da Região Metropolitana do Recife (RMR).
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação e Exportação */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="dropdown relative">
            <button
              onClick={handleDownloadGridCsv}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Baixar CSV com as células da grade espacial de 1 km de Recife"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Grade Recife (.CSV)</span>
            </button>
          </div>

          <button
            onClick={handleDownloadCorrCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Baixar CSV com as correlações de Pearson com IC95%"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Correlações (.CSV)</span>
          </button>

          <button
            onClick={handleDownloadRmrCsv}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            title="Baixar dados consolidados dos 14 municípios da RMR"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Base RMR (.CSV)</span>
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

      {/* Cards de Métricas e Validação com a Referência Oficial */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Referência MapBiomas */}
        <div className="panel p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Trees className="h-3.5 w-3.5 text-emerald-400" />
              Referência MapBiomas (Recife)
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            25,13% <span className="text-xs font-normal text-muted-foreground">de cobertura vegetal</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Calculado Arboris: {MAPBIOMAS_REFERENCE.recifeVerdeAmplaCalculadaPct}% (+{MAPBIOMAS_REFERENCE.diferencaPp} pp vs ref)
          </p>
        </div>

        {/* Correlação de Pearson */}
        <div className="panel p-4 border-l-4 border-sky-500">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-sky-400" />
              Correlação de Pearson (r)
            </span>
            <span className="font-mono text-[10px] font-bold text-sky-400">R² = 40,7%</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-sky-400">
            r = -0,638
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            p &lt; 0,0001 · IC 95%: [-0,718, -0,543]
          </p>
        </div>

        {/* Mitigação Térmica Biofísica */}
        <div className="panel p-4 border-l-4 border-primary">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-primary" />
              Mitigação Linear Estimada
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-primary">
            -2,1 °C <span className="text-xs font-normal text-muted-foreground">a cada +10% de copas</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Diferencial máximo medido em campo: 9,3 °C
          </p>
        </div>

        {/* Demanda de Mudas na RMR */}
        <div className="panel p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              Meta de Mudas na RMR
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-amber-400">
            {insights.totalMudasRMR.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Para atingir o padrão OMS em 14 municípios
          </p>
        </div>
      </div>

      {/* Grid Principal: Gráfico de Dispersão e Tabela de Correlações */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Coluna Esquerda: Gráfico de Dispersão Espacial com Linha de Regressão */}
        <div className="lg:col-span-7 space-y-4">
          <div className="panel p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Dispersão Espacial: Cobertura Verde Ampla × Temperatura de Superfície (LST)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cada ponto representa uma célula georreferenciada de 1 km² em Recife.
                </p>
              </div>
              <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground shrink-0">
                {regression.equation}
              </span>
            </div>

            {/* SVG do Scatter Plot */}
            <div className="relative h-64 w-full">
              <svg viewBox={`0 0 ${plotW} ${plotH}`} className="h-full w-full select-none" preserveAspectRatio="none">
                {/* Grades de fundo */}
                <line x1={padX} y1={padY} x2={plotW - padX} y2={padY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={padX} y1={padY + innerH * 0.5} x2={plotW - padX} y2={padY + innerH * 0.5} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={padX} y1={plotH - padY} x2={plotW - padX} y2={plotH - padY} stroke="currentColor" strokeOpacity="0.15" />
                <line x1={padX} y1={padY} x2={padX} y2={plotH - padY} stroke="currentColor" strokeOpacity="0.15" />

                {/* Linha de Regressão Linear Vermelha */}
                <line
                  x1={lineP1.x}
                  y1={lineP1.y}
                  x2={lineP2.x}
                  y2={lineP2.y}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Pontos da Grade Espacial */}
                {RECIFE_SPATIAL_GRID.map((cell) => {
                  const cx = toSvgX(cell.coberturaVerdeAmplaPct);
                  const cy = toSvgY(cell.temperaturaSuperficieC);
                  const isSelected = selectedCell?.cellId === cell.cellId;

                  return (
                    <g key={cell.cellId} onClick={() => setSelectedCell(cell)} className="cursor-pointer">
                      {isSelected && (
                        <circle cx={cx} cy={cy} r={9} fill="#ef4444" fillOpacity="0.3" className="animate-pulse" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5.5 : 4}
                        fill={cell.coberturaVerdeAmplaPct >= 40 ? "#10b981" : cell.temperaturaSuperficieC >= 35 ? "#ef4444" : "#f59e0b"}
                        stroke="var(--card)"
                        strokeWidth={1.5}
                        className="transition-transform hover:scale-150"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legenda dos Eixos do Gráfico */}
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground px-2">
              <span>0% Cobertura (solo exposto/asfalto)</span>
              <span className="text-primary font-semibold">Linha de Regressão: -0.11 °C por +1% verde</span>
              <span>90% Cobertura (Mata Atlântica/mangue)</span>
            </div>

            {/* Detalhe da Célula Selecionada */}
            {selectedCell && (
              <div className="rounded-lg border border-border/80 bg-background/70 p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-primary uppercase font-bold">
                    Célula {selectedCell.cellId} · {selectedCell.bairroReferencia}
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    Coords: {selectedCell.lat.toFixed(3)}, {selectedCell.lon.toFixed(3)} · Fração válida Landsat: {(selectedCell.fracaoValida * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center gap-3 font-mono text-right">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Verde Amplo</span>
                    <span className="font-bold text-emerald-400">{selectedCell.coberturaVerdeAmplaPct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Temperatura (LST)</span>
                    <span className="font-bold text-orange-400">{selectedCell.temperaturaSuperficieC.toFixed(1)} °C</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Matriz Estatística das Correlações Oficiais do Arboris */}
          <div className="panel p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tabela Oficial de Correlações Estatísticas (Projeto Arboris)
            </h4>

            <div className="overflow-x-auto rounded-lg border border-border/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 font-mono text-[10px] uppercase text-muted-foreground border-b border-border/70">
                  <tr>
                    <th className="py-2.5 px-3">Indicador Ambiental</th>
                    <th className="py-2.5 px-2 text-center">N</th>
                    <th className="py-2.5 px-2 text-center">Pearson r</th>
                    <th className="py-2.5 px-2 text-center">R²</th>
                    <th className="py-2.5 px-3 text-center">p-valor</th>
                    <th className="py-2.5 px-3 text-center">IC 95%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                  {ARBORIS_STATISTICAL_CORRELATIONS.map((c, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans text-xs font-semibold text-foreground">
                        {c.indicador}
                      </td>
                      <td className="py-2.5 px-2 text-center text-muted-foreground">
                        {c.nCelulas || "--"}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-sky-400">
                        {isNaN(c.pearsonR) ? "NaN*" : c.pearsonR.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-foreground">
                        {isNaN(c.r2) ? "NaN*" : (c.r2 * 100).toFixed(1) + "%"}
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">
                        {isNaN(c.pValor) ? "NaN*" : "< 0,0001"}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {isNaN(c.ic95Inf) ? "Ausente" : `[${c.ic95Inf.toFixed(2)}, ${c.ic95Sup.toFixed(2)}]`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              * Nota Metodológica: O MapBiomas (30m) não detecta arborização urbana de ruas isoladas. O indicador foi mantido como <em>NaN (Dado Ausente)</em> com total rigor científico para não distorcer o modelo.
            </p>
          </div>
        </div>

        {/* Coluna Direita: Municípios da RMR e Composições Sazonais Landsat */}
        <div className="lg:col-span-5 space-y-4">
          {/* Composições Sazonais LST */}
          <div className="panel p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-orange-400" />
                <h4 className="text-xs font-bold text-foreground">Composições Térmicas Sazonais (2025)</h4>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Landsat 8 & 9</span>
            </div>

            <div className="space-y-2">
              {ARBORIS_SEASONAL_COMPOSITES.map((comp) => {
                const isSelected = selectedSeason === comp.periodo;
                return (
                  <div
                    key={comp.periodo}
                    onClick={() => setSelectedSeason(comp.periodo)}
                    className={`rounded-lg p-2.5 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500/50 ring-1 ring-orange-500/30"
                        : "bg-background/60 border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{comp.periodo}</span>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="font-bold text-orange-400">{comp.tempMediaRecifeC}°C</span>
                        <span
                          className={`rounded px-1 text-[10px] font-bold ${
                            comp.anomaliaC >= 0
                              ? "bg-destructive/15 text-destructive"
                              : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {comp.anomaliaC >= 0 ? `+${comp.anomaliaC}°` : `${comp.anomaliaC}°`}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {comp.descricao}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranking dos 14 Municípios da RMR */}
          <div className="panel p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-2 gap-2">
              <div>
                <h4 className="text-xs font-bold text-foreground">Região Metropolitana do Recife (14 Cidades)</h4>
                <p className="text-[10px] text-muted-foreground">Classificação por criticidade e prioridade de plantio</p>
              </div>

              {/* Filtros rápidos da RMR */}
              <div className="flex gap-1">
                {(["todos", "critico", "alta", "preservacao"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterRmr(f)}
                    className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                      filterRmr === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredMunicipalities.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMunicipality && onSelectMunicipality(m)}
                  className="rounded-lg border border-border/60 bg-background/60 p-2.5 transition-all hover:bg-card hover:border-primary/40 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{m.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase ${
                        m.prioridadePlantio === "Crítica"
                          ? "bg-destructive/15 text-destructive border border-destructive/30"
                          : m.prioridadePlantio === "Alta"
                          ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {m.prioridadePlantio}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1 font-mono text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                    <div>
                      <span>Verde Amplo:</span>
                      <strong className="block text-foreground">{m.coberturaVerdeAmplaPct}%</strong>
                    </div>
                    <div>
                      <span>LST Máx:</span>
                      <strong className="block text-orange-400">{m.lstMaximaC}°C</strong>
                    </div>
                    <div>
                      <span>Mudas Alvo:</span>
                      <strong className="block text-emerald-400">{(m.mudasNecessarias / 1000).toFixed(1)}k</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
