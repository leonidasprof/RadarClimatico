import React from "react";
import { zones, ndviVar, vulnVar, type Zone } from "@/lib/radar-data";
import { Crosshair } from "lucide-react";

interface RecifeSatelliteMapProps {
  mode: "ndvi" | "vuln";
  selectedZoneA: Zone;
  selectedZoneB?: Zone;
  onSelectZone: (zone: Zone) => void;
  onSelectComparisonZone?: (zone: Zone) => void;
  additionalTreesPct?: number; // Para refletir visualmente no simulador
  className?: string;
}

/**
 * Mapa de Satélite com Manchas Verdes (NDVI) e Camadas de Vulnerabilidade Social do Recife.
 * Incorpora malha viária esquemática, hidrografia do Capibaribe e Beberibe,
 * e polígonos de manchas de dossel/densidade arbórea.
 */
export function RecifeSatelliteMap({
  mode,
  selectedZoneA,
  selectedZoneB,
  onSelectZone,
  additionalTreesPct = 0,
  className = "",
}: RecifeSatelliteMapProps) {
  // Coordenadas esquemáticas das vias arteriais e hidrografia
  const arterialRoads = [
    "M40 0 C 38 18, 42 34, 46 46 S 52 74, 54 100", // Av. Agamenon Magalhães / Norte
    "M0 30 C 22 26, 44 33, 68 30 S 90 26, 100 28", // Caxangá / Conde da Boa Vista
    "M2 68 C 24 64, 46 66, 66 60 S 86 52, 100 50", // Av. Sul / Boa Viagem
    "M70 4 C 68 26, 66 48, 64 72 S 62 90, 62 100", // Av. Boa Viagem
    "M18 0 C 20 24, 16 50, 22 76 S 28 92, 30 100", // Radial Oeste
  ];

  // Manchas de NDVI (dossel e refúgios verdes baseados em dados multiespectrais Landsat/Sentinel)
  const ndviPatches = [
    // Dois Irmãos (Reserva Florestal / Parque Estadual - NDVI > 0.75)
    { id: "p-dois-irmaos", path: "M 8 10 Q 18 6, 24 16 Q 26 26, 18 30 Q 10 32, 6 22 Z", fill: "var(--canopy)", opacity: 0.75 },
    { id: "p-dois-irmaos-core", path: "M 11 14 Q 17 11, 20 18 Q 21 24, 15 26 Q 10 24, 9 18 Z", fill: "#10b981", opacity: 0.9 },
    // Casa Forte / Poço da Panela (Corredor Verde Zona Norte - NDVI ~ 0.60)
    { id: "p-casa-forte", path: "M 24 24 Q 35 22, 38 32 Q 34 38, 26 36 Q 22 30, 24 24 Z", fill: "var(--canopy)", opacity: 0.65 },
    // Várzea / UFPE (Campus Universitário - Mancha verde)
    { id: "p-ufpe", path: "M 8 40 Q 16 38, 20 46 Q 16 54, 8 50 Z", fill: "oklch(0.72 0.16 135)", opacity: 0.6 },
    // Santo Amaro (NDVI 0.11 - Manchas fragmentadas mínimas no Cemitério e Treze de Maio)
    { id: "p-sto-amaro-1", path: "M 46 32 Q 49 32, 48 35 Q 45 35, 46 32 Z", fill: "oklch(0.78 0.12 95)", opacity: 0.5 },
    { id: "p-sto-amaro-2", path: "M 48 37 Q 50 36, 49 39 Q 47 39, 48 37 Z", fill: "oklch(0.78 0.12 95)", opacity: 0.45 },
    // Boa Vista (Parque 13 de Maio e Praça do Derby)
    { id: "p-boa-vista", path: "M 38 44 Q 42 43, 42 47 Q 37 48, 38 44 Z", fill: "oklch(0.75 0.14 125)", opacity: 0.5 },
    // Boa Viagem (Parque Dona Lindu e manguezais adjacentes)
    { id: "p-bv-lindu", path: "M 60 76 Q 64 74, 65 79 Q 59 81, 60 76 Z", fill: "oklch(0.75 0.14 125)", opacity: 0.55 },
    // Bacia do Pina / Manguezal Parque dos Mangues (NDVI alto)
    { id: "p-mangues", path: "M 50 64 Q 58 60, 60 68 Q 54 74, 48 70 Z", fill: "var(--canopy)", opacity: 0.7 },
    // Ibura (Encostas verdes residuais da UR-1 e Monte dos Guararapes)
    { id: "p-ibura", path: "M 28 84 Q 38 82, 36 92 Q 26 94, 28 84 Z", fill: "oklch(0.72 0.16 135)", opacity: 0.5 },
    // Afogados / Bacia do Tejipió (faixa ciliar degradada)
    { id: "p-afogados", path: "M 22 60 Q 28 58, 29 64 Q 23 66, 22 60 Z", fill: "oklch(0.78 0.12 95)", opacity: 0.45 },
  ];

  // Manchas de Vulnerabilidade Social (IVS - assentamentos precários, palafitas e alta exposição ao calor)
  const vulnPatches = [
    // Santo Amaro / Ilha do Chié / Santa Teresinha (IVS 76)
    { id: "v-sto-amaro", path: "M 42 30 Q 52 28, 52 40 Q 44 42, 42 30 Z", fill: "var(--heat-5)", opacity: 0.45 },
    // Ibura / Encostas desprovidas de infraestrutura (IVS 82)
    { id: "v-ibura", path: "M 26 80 Q 40 78, 38 94 Q 24 96, 26 80 Z", fill: "var(--heat-5)", opacity: 0.5 },
    // Afogados / Bacia do Tejipió e favela do Coque contígua (IVS 68)
    { id: "v-afogados", path: "M 20 58 Q 32 56, 32 68 Q 20 70, 20 58 Z", fill: "var(--heat-4)", opacity: 0.42 },
    // Imbiribeira / Comunidade Beira Rio / Alagados (IVS 61)
    { id: "v-imbiribeira", path: "M 40 66 Q 50 64, 48 76 Q 38 78, 40 66 Z", fill: "var(--heat-4)", opacity: 0.38 },
    // Boa Vista / Habitações precárias centrais (IVS 55)
    { id: "v-boa-vista", path: "M 36 42 Q 44 40, 44 50 Q 36 52, 36 42 Z", fill: "var(--heat-3)", opacity: 0.32 },
  ];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border/80 bg-[#090d12] shadow-2xl ${className}`}>
      {/* Grade e Textura Tática de Satélite */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* SVG Central do Satélite */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full select-none"
        aria-label="Mapa de Satélite NDVI e Vulnerabilidade do Recife"
      >
        <defs>
          {/* Gradiente do Oceano Atlântico */}
          <linearGradient id="oceanGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.45" />
          </linearGradient>

          {/* Gradiente para Mancha de Simulação Ativa no Bairro Selecionado */}
          <radialGradient id="simulatedCanopyGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--canopy)" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Oceano Atlântico (Orla Leste do Recife) */}
        <path
          d="M 80 0 C 78 26, 75 52, 72 76 S 68 94, 68 100 L 100 100 L 100 0 Z"
          fill="url(#oceanGradient)"
        />

        {/* Hidrografia Principal: Rio Capibaribe, Rio Beberibe e Bacia do Pina */}
        <g fill="none" strokeLinecap="round">
          {/* Rio Capibaribe Principal */}
          <path
            d="M 0 20 C 18 28, 28 38, 38 52 S 50 60, 62 58"
            stroke="#0ea5e9"
            strokeOpacity="0.55"
            strokeWidth="1.8"
          />
          {/* Braço Norte / Rio Beberibe */}
          <path
            d="M 24 0 C 30 14, 36 30, 44 44 S 54 56, 62 58"
            stroke="#0ea5e9"
            strokeOpacity="0.45"
            strokeWidth="1.3"
          />
          {/* Deságue na Bacia do Pina / Bacia Portuária */}
          <path
            d="M 62 58 C 66 56, 70 52, 72 46"
            stroke="#0ea5e9"
            strokeOpacity="0.6"
            strokeWidth="2.0"
          />
          {/* Linha Costeira da Praia de Boa Viagem */}
          <path
            d="M 80 0 C 78 26, 75 52, 72 76 S 68 94, 68 100"
            stroke="#38bdf8"
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
        </g>

        {/* Malha Viária de Satélite */}
        <g stroke="#94a3b8" strokeOpacity="0.18" strokeWidth="0.65" fill="none" strokeLinecap="round">
          {arterialRoads.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* CAMADA ESPECTRAL: NDVI (Manchas Verdes) */}
        {mode === "ndvi" && (
          <g id="ndvi-layer">
            {ndviPatches.map((patch) => (
              <path
                key={patch.id}
                d={patch.path}
                fill={patch.fill}
                fillOpacity={patch.opacity}
                className="transition-all duration-700 filter drop-shadow-sm"
              />
            ))}

            {/* Expansão Visual da Copa Simulada no Bairro A */}
            {additionalTreesPct > 0 && (
              <circle
                cx={selectedZoneA.x}
                cy={selectedZoneA.y}
                r={12 + additionalTreesPct * 0.4}
                fill="url(#simulatedCanopyGradient)"
                className="animate-pulse"
              />
            )}
          </g>
        )}

        {/* CAMADA ESPECTRAL: Vulnerabilidade Social (IVS) */}
        {mode === "vuln" && (
          <g id="vuln-layer">
            {vulnPatches.map((patch) => (
              <path
                key={patch.id}
                d={patch.path}
                fill={patch.fill}
                fillOpacity={patch.opacity}
                className="transition-all duration-700 filter blur-xs"
              />
            ))}
          </g>
        )}

        {/* Conexão Visual de Comparação entre Zona A e Zona B (quando ambas selecionadas) */}
        {selectedZoneB && (
          <line
            x1={selectedZoneA.x}
            y1={selectedZoneA.y}
            x2={selectedZoneB.x}
            y2={selectedZoneB.y}
            stroke="var(--foreground)"
            strokeOpacity="0.35"
            strokeWidth="0.9"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Marcadores Interativos dos Bairros sobrepostos com posicionamento absoluto */}
      {zones.map((z) => {
        const isA = z.id === selectedZoneA.id;
        const isB = selectedZoneB && z.id === selectedZoneB.id;
        const isSelected = isA || isB;

        // Cor de destaque baseada no modo
        const color =
          mode === "ndvi"
            ? ndviVar(z.ndvi)
            : vulnVar(z.vuln);

        return (
          <button
            key={z.id}
            onClick={() => onSelectZone(z)}
            className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none transition-transform hover:scale-110"
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
            title={`${z.name} · ${mode === "ndvi" ? `NDVI ${z.ndvi.toFixed(2)} (${z.canopy}% copa)` : `IVS ${z.vuln}/100`}`}
          >
            {/* Halo de pulso em bairros sob intervenção ou selecionados */}
            {isSelected && (
              <span
                className="absolute -inset-3 rounded-full animate-ping opacity-60 pointer-events-none"
                style={{ background: color }}
              />
            )}

            {/* Círculo do Marcador */}
            <div
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                isSelected
                  ? "h-8 w-8 ring-2 ring-white shadow-lg"
                  : "h-5 w-5 ring-1 ring-border/80 opacity-85 group-hover:opacity-100"
              }`}
              style={{
                background: color,
                boxShadow: isSelected ? `0 0 16px ${color}` : undefined,
              }}
            >
              {isA && (
                <span className="font-mono text-[10px] font-extrabold text-white">
                  A
                </span>
              )}
              {isB && (
                <span className="font-mono text-[10px] font-extrabold text-white">
                  B
                </span>
              )}
              {!isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
              )}
            </div>

            {/* Tag Flutuante com Nome e Métrica */}
            <div
              className={`absolute left-1/2 top-full -translate-x-1/2 mt-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-mono shadow-md backdrop-blur border transition-all ${
                isSelected
                  ? "bg-background/95 border-white text-foreground font-bold ring-1 ring-white/30 z-20"
                  : "bg-background/80 border-border/60 text-muted-foreground group-hover:text-foreground z-10"
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{z.name}</span>
                <span className="font-semibold" style={{ color }}>
                  {mode === "ndvi" ? `${z.canopy}%` : `IVS ${z.vuln}`}
                </span>
              </div>
            </div>
          </button>
        );
      })}

      {/* Legenda Espectral de Satélite no Canto Inferior Esquerdo */}
      <div className="absolute bottom-3 left-3 rounded-lg border border-border/80 bg-background/90 p-3 backdrop-blur shadow-xl text-xs max-w-xs z-20">
        {mode === "ndvi" ? (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-canopy" />
                Índice NDVI (Densidade de Copa)
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold">Satélite Sentinel</span>
            </div>
            <div
              className="h-2 w-48 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.68 0.18 45) 0%, oklch(0.78 0.12 85) 25%, oklch(0.76 0.14 115) 50%, var(--canopy) 100%)",
              }}
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>0.10 (Asfalto)</span>
              <span>0.30 (OMS)</span>
              <span>0.80 (Refúgio)</span>
            </div>
            {additionalTreesPct > 0 && (
              <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                <Crosshair className="h-3 w-3" />
                <span>Simulação ativa: +{additionalTreesPct}% copa em {selectedZoneA.name}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Vulnerabilidade Social (IVS)
              </span>
              <span className="font-mono text-[10px] text-amber-400 font-semibold">Censo & Saúde</span>
            </div>
            <div
              className="h-2 w-48 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--accent) 0%, var(--heat-3) 45%, var(--heat-5) 100%)",
              }}
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>0 (Seguro)</span>
              <span>50 (Moderado)</span>
              <span>100 (Crítico)</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de Comparação Territorial Ativa (Canto Superior Direito) */}
      {selectedZoneB && (
        <div className="absolute top-3 right-3 rounded-lg border border-border/80 bg-background/90 px-3 py-1.5 backdrop-blur shadow-md text-xs z-20 flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="rounded bg-primary/20 px-1.5 py-0.2 font-bold text-primary">A</span>
            <span className="font-medium text-foreground">{selectedZoneA.name}</span>
          </div>
          <span className="text-muted-foreground font-mono">vs</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="rounded bg-accent/20 px-1.5 py-0.2 font-bold text-accent">B</span>
            <span className="font-medium text-foreground">{selectedZoneB.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
