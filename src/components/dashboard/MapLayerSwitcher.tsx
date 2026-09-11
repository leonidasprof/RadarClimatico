import { Flame, Trees, HeartPulse, Layers } from "lucide-react";

export type MapLayerType = "calor" | "vegetal" | "vulnerabilidade";

interface MapLayerSwitcherProps {
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  showLabel?: boolean;
  className?: string;
}

export function MapLayerSwitcher({
  activeLayer,
  onChangeLayer,
  showLabel = true,
  className = "",
}: MapLayerSwitcherProps) {
  const layers = [
    {
      id: "calor" as const,
      label: "Calor",
      shortLabel: "Calor",
      icon: Flame,
      title: "Camada de Anomalias Térmicas e Sensação Térmica",
      activeClasses:
        "bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 font-semibold ring-1 ring-orange-400/50",
      inactiveClasses:
        "text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/15 font-medium",
      dotColor: "bg-orange-500",
    },
    {
      id: "vegetal" as const,
      label: "Cobertura vegetal",
      shortLabel: "Vegetal",
      icon: Trees,
      title: "Camada de Cobertura Arbórea, Satélite NDVI e Simulador de Arrefecimento",
      activeClasses:
        "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-semibold ring-1 ring-emerald-400/50",
      inactiveClasses:
        "text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/15 font-medium",
      dotColor: "bg-emerald-500",
    },
    {
      id: "vulnerabilidade" as const,
      label: "Vulnerabilidade",
      shortLabel: "Saúde / IVS",
      icon: HeartPulse,
      title: "Camada de Vulnerabilidade Social, Demografia de Baixa Renda e Demanda das UPAs",
      activeClasses:
        "bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 text-white shadow-md shadow-rose-500/30 font-semibold ring-1 ring-rose-400/50",
      inactiveClasses:
        "text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/15 font-medium",
      dotColor: "bg-rose-500",
    },
  ];

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-500/90 bg-card/95 p-1 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40 backdrop-blur-md transition-all ${className}`}
      role="tablist"
      aria-label="Seletor de Camadas do Mapa"
    >
      {showLabel && (
        <div className="hidden sm:flex items-center gap-1 px-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold select-none border-r border-amber-500/30 mr-0.5">
          <Layers className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>Camadas</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        {layers.map((l) => {
          const isActive = activeLayer === l.id;
          const Icon = l.icon;

          return (
            <button
              key={l.id}
              id={`map-layer-btn-${l.id}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChangeLayer(l.id)}
              className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? l.activeClasses + " scale-[1.02]"
                  : l.inactiveClasses + " hover:scale-[1.01]"
              }`}
              title={l.title}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                  isActive ? "scale-110" : "group-hover:scale-110 opacity-80"
                }`}
              />
              <span className="whitespace-nowrap">{l.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
