import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { Crosshair, Layers, Minus, Plus, Satellite, Map as MapIcon } from "lucide-react";
import { zones, ndviVar, vulnVar, type Zone } from "@/lib/radar-data";
import { useTheme } from "@/context/theme-context";
import { RECIFE_CENTER, zoneCoordinates } from "./RecifeLiveMap";

interface RecifeSatelliteMapProps {
  mode: "ndvi" | "vuln";
  selectedZoneA: Zone;
  selectedZoneB?: Zone;
  onSelectZone: (zone: Zone) => void;
  onSelectComparisonZone?: (zone: Zone) => void;
  additionalTreesPct?: number; // Para refletir visualmente no simulador
  hideInlineLegend?: boolean;
  className?: string;
}

/**
 * Mapa real do Recife (Leaflet) para as camadas de Cobertura Vegetal (NDVI)
 * e Vulnerabilidade Social (IVS).
 *
 * Usa as mesmas bases públicas e sem chave da tela principal:
 *  - Satélite: Esri World Imagery (+ rótulos de vias e lugares)
 *  - Ruas: OpenStreetMap
 *  - NDVI orbital opcional: NASA GIBS · MODIS Terra NDVI 8 dias (250 m)
 */

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
const ESRI_ATTR = "Imagens &copy; Esri, Maxar, Earthstar Geographics";
const GIBS_ATTR =
  'NDVI &copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer">NASA GIBS</a> / MODIS';

const BASE_TILES = {
  ruas: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  satelite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};
const SAT_LABEL_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
];
const GIBS_NDVI_TILES =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png";

/** Refúgios verdes reais do Recife (centro aproximado + raio em metros). */
const GREEN_AREAS: {
  name: string;
  pos: [number, number];
  radius: number;
  ndvi: number;
  note: string;
}[] = [
  {
    name: "Parque Estadual de Dois Irmãos",
    pos: [-8.0105, -34.9445],
    radius: 950,
    ndvi: 0.82,
    note: "Remanescente de Mata Atlântica",
  },
  {
    name: "Mata do Engenho Uchôa",
    pos: [-8.0965, -34.9555],
    radius: 650,
    ndvi: 0.74,
    note: "Unidade de conservação",
  },
  {
    name: "Jardim Botânico do Recife",
    pos: [-8.0765, -34.9605],
    radius: 450,
    ndvi: 0.78,
    note: "Mata Atlântica urbana",
  },
  {
    name: "Parque dos Manguezais",
    pos: [-8.0935, -34.8975],
    radius: 850,
    ndvi: 0.68,
    note: "Manguezal do Pina",
  },
  {
    name: "Campus UFPE",
    pos: [-8.0505, -34.9515],
    radius: 550,
    ndvi: 0.55,
    note: "Mancha verde universitária",
  },
  {
    name: "Parque da Jaqueira",
    pos: [-8.0375, -34.9035],
    radius: 220,
    ndvi: 0.58,
    note: "Corredor verde Zona Norte",
  },
  {
    name: "Sítio Trindade",
    pos: [-8.0245, -34.9105],
    radius: 180,
    ndvi: 0.6,
    note: "Área verde histórica",
  },
  {
    name: "Parque 13 de Maio",
    pos: [-8.0565, -34.8845],
    radius: 150,
    ndvi: 0.5,
    note: "Ilha de frescor central",
  },
  {
    name: "Parque Dona Lindu",
    pos: [-8.1415, -34.9015],
    radius: 120,
    ndvi: 0.32,
    note: "Área verde litorânea",
  },
];

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/** Resolve `var(--x)` para a cor real (atributos SVG do Leaflet não resolvem variáveis CSS). */
function resolveColor(value: string) {
  if (typeof window === "undefined") return value;
  const styles = getComputedStyle(document.documentElement);
  return value.replace(
    /var\((--[\w-]+)\)/g,
    (_, name: string) => styles.getPropertyValue(name).trim() || "#10b981",
  );
}

export function RecifeSatelliteMap({
  mode,
  selectedZoneA,
  selectedZoneB,
  onSelectZone,
  onSelectComparisonZone,
  additionalTreesPct = 0,
  hideInlineLegend = false,
  className = "",
}: RecifeSatelliteMapProps) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const baseLayersRef = useRef<Leaflet.TileLayer[]>([]);
  const ndviTileRef = useRef<Leaflet.TileLayer | null>(null);
  const thematicRef = useRef<Leaflet.LayerGroup | null>(null);
  const compareRef = useRef<Leaflet.LayerGroup | null>(null);
  const markersRef = useRef<Leaflet.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  const [baseMap, setBaseMap] = useState<"satelite" | "ruas">("satelite");
  const [showThematic, setShowThematic] = useState(true);
  const [showNasaNdvi, setShowNasaNdvi] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Refs estáveis para os callbacks (evita recriar camadas a cada render)
  const handlersRef = useRef({ onSelectZone, onSelectComparisonZone, mode, selectedZoneA });
  handlersRef.current = { onSelectZone, onSelectComparisonZone, mode, selectedZoneA };

  const fitAll = (animate = true) => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;
    const pts = zones.map((z) => zoneCoordinates[z.id]).filter(Boolean) as [number, number][];
    if (!pts.length) {
      map.setView(RECIFE_CENTER, 12);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), {
      paddingTopLeft: [60, 56],
      paddingBottomRight: [40, hideInlineLegend ? 40 : 110],
      animate,
    });
  };
  const fitAllRef = useRef(fitAll);
  fitAllRef.current = fitAll;

  // 1. Cria o mapa uma única vez (somente no navegador)
  useEffect(() => {
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;
    let fitted = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: RECIFE_CENTER,
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
        maxBounds: L.latLngBounds([-8.45, -35.3], [-7.7, -34.6]),
        maxBoundsViscosity: 0.8,
      });
      map.attributionControl.setPrefix(false);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      thematicRef.current = L.layerGroup().addTo(map);
      compareRef.current = L.layerGroup().addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      resizeObs = new ResizeObserver(() => {
        map.invalidateSize();
        if (!fitted && map.getSize().y > 0) {
          fitted = true;
          fitAllRef.current(false);
        }
      });
      resizeObs.observe(containerRef.current);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Camada base (satélite com rótulos ou ruas)
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!ready || !map || !L) return;
    baseLayersRef.current.forEach((l) => l.remove());

    const isSat = baseMap === "satelite";
    const base = L.tileLayer(BASE_TILES[baseMap], {
      attribution: isSat ? ESRI_ATTR : OSM_ATTR,
      maxZoom: 19,
      className: !isSat && isDark ? "arboris-tiles-dark" : "",
    }).addTo(map);
    base.bringToBack();
    const labels =
      isSat && showLabels
        ? SAT_LABEL_TILES.map((url) =>
            L.tileLayer(url, { maxZoom: 19, pane: "overlayPane", opacity: 0.7 }).addTo(map),
          )
        : [];
    baseLayersRef.current = [base, ...labels];
  }, [ready, baseMap, isDark, showLabels]);

  // 3. NDVI orbital real (NASA GIBS / MODIS)
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!ready || !map || !L) return;
    ndviTileRef.current?.remove();
    ndviTileRef.current = null;
    if (mode !== "ndvi" || !showNasaNdvi) return;
    ndviTileRef.current = L.tileLayer(GIBS_NDVI_TILES, {
      attribution: GIBS_ATTR,
      maxNativeZoom: 9,
      maxZoom: 19,
      opacity: 0.55,
      pane: "overlayPane",
    }).addTo(map);
  }, [ready, mode, showNasaNdvi]);

  // 4. Camada temática: manchas verdes (NDVI) ou manchas de vulnerabilidade (IVS)
  useEffect(() => {
    const L = LRef.current;
    const group = thematicRef.current;
    if (!ready || !L || !group) return;
    group.clearLayers();
    if (!showThematic) return;

    if (mode === "ndvi") {
      GREEN_AREAS.forEach((g) => {
        const color = resolveColor(ndviVar(g.ndvi));
        L.circle(g.pos, {
          radius: g.radius,
          color,
          weight: 1.5,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.38,
        })
          .bindTooltip(
            `<strong>${escapeHtml(g.name)}</strong><br/>${escapeHtml(g.note)} · NDVI ${g.ndvi.toFixed(2)}`,
            { direction: "top", sticky: true },
          )
          .addTo(group);
      });

      zones.forEach((z) => {
        const pos = zoneCoordinates[z.id];
        if (!pos) return;
        const color = resolveColor(ndviVar(z.ndvi));
        L.circle(pos, {
          radius: 850,
          stroke: true,
          color,
          weight: 1,
          opacity: 0.6,
          dashArray: "4 4",
          fillColor: color,
          fillOpacity: 0.18 + z.ndvi * 0.35,
          interactive: false,
        }).addTo(group);
      });

      // Expansão da copa simulada no bairro A
      const posA = zoneCoordinates[selectedZoneA.id];
      if (posA && additionalTreesPct > 0) {
        const canopy = resolveColor("var(--canopy)");
        L.circle(posA, {
          radius: 450 + additionalTreesPct * 30,
          color: canopy,
          weight: 2,
          dashArray: "6 4",
          fillColor: canopy,
          fillOpacity: 0.32,
          className: "arboris-pulse",
          interactive: false,
        }).addTo(group);
      }
    } else {
      zones.forEach((z) => {
        const pos = zoneCoordinates[z.id];
        if (!pos) return;
        const color = resolveColor(vulnVar(z.vuln));
        const radius = 450 + z.vuln * 9;
        L.circle(pos, {
          radius: radius * 1.5,
          stroke: false,
          fillColor: color,
          fillOpacity: 0.14,
          interactive: false,
        }).addTo(group);
        L.circle(pos, {
          radius,
          color,
          weight: 1.5,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: 0.36,
        })
          .bindTooltip(
            `<strong>${escapeHtml(z.name)}</strong><br/>IVS ${z.vuln} · ${z.popLowIncomeRisk.toLocaleString("pt-BR")} hab. em risco<br/>Saneamento deficitário: ${z.sanitationDeficitPct}%`,
            { direction: "top", sticky: true },
          )
          .on("click", () => {
            const h = handlersRef.current;
            if (h.onSelectComparisonZone) {
              if (z.id !== h.selectedZoneA.id) h.onSelectComparisonZone(z);
            } else h.onSelectZone(z);
          })
          .addTo(group);
      });
    }
  }, [ready, mode, showThematic, selectedZoneA.id, additionalTreesPct, isDark]);

  // 5. Linha de comparação A → B (com distância real)
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = compareRef.current;
    if (!ready || !L || !map || !group) return;
    group.clearLayers();
    if (!selectedZoneB) return;
    const a = zoneCoordinates[selectedZoneA.id];
    const b = zoneCoordinates[selectedZoneB.id];
    if (!a || !b) return;

    L.polyline([a, b], { color: "#0f172a", opacity: 0.75, weight: 6, interactive: false }).addTo(
      group,
    );
    L.polyline([a, b], {
      color: "#38bdf8",
      opacity: 0.95,
      weight: 3,
      dashArray: "8 8",
      interactive: false,
    }).addTo(group);
    const km = (map.distance(a, b) / 1000).toFixed(1).replace(".", ",");
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    L.marker(mid, {
      interactive: false,
      icon: L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div style="transform: translate(-50%, -50%); width: max-content;" class="rounded-full bg-sky-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-md ring-2 ring-white/70">${km} km</div>`,
      }),
    }).addTo(group);
  }, [ready, selectedZoneA.id, selectedZoneB?.id]);

  // 6. Marcadores dos bairros (A / B / demais)
  useEffect(() => {
    const L = LRef.current;
    const group = markersRef.current;
    if (!ready || !L || !group) return;
    group.clearLayers();

    zones.forEach((z) => {
      const pos = zoneCoordinates[z.id];
      if (!pos) return;
      const isA = z.id === selectedZoneA.id;
      const isB = selectedZoneB?.id === z.id;
      const color = resolveColor(mode === "ndvi" ? ndviVar(z.ndvi) : vulnVar(z.vuln));
      const metric = mode === "ndvi" ? `${z.canopy}% copa` : `IVS ${z.vuln}`;

      const dot = isA
        ? `<span class="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 font-mono text-[10px] font-extrabold text-white ring-2 ring-white shadow-lg">A</span>`
        : isB
          ? `<span class="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 font-mono text-[10px] font-extrabold text-white ring-2 ring-white shadow-lg">B</span>`
          : `<span class="h-3 w-3 rounded-full ring-2 ring-white shadow" style="background:${escapeHtml(color)}"></span>`;

      const pill = isA
        ? "bg-red-600 text-white ring-2 ring-red-300/60"
        : isB
          ? "bg-sky-600 text-white ring-2 ring-sky-300/60"
          : "bg-slate-900/85 text-white/90 border border-white/20 hover:bg-slate-900";

      const ring =
        isA || isB
          ? `<span class="absolute left-3 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 ${isA ? "border-red-500/70" : "border-sky-400/70"} animate-ping pointer-events-none"></span>`
          : "";

      const html = `
        <div class="relative" style="transform: translate(-12px, -50%); width: max-content;">
          ${ring}
          <div class="relative flex items-center gap-1.5 rounded-full pr-2.5 py-0.5 pl-0.5 text-[11px] font-semibold shadow-md cursor-pointer transition-transform hover:scale-105 ${pill}">
            ${dot}
            <span class="whitespace-nowrap">${escapeHtml(z.name)}</span>
            <span class="font-mono font-bold" style="color:${isA || isB ? "#fff" : escapeHtml(color)}">${metric}</span>
          </div>
        </div>`;

      const title =
        mode === "vuln"
          ? isA
            ? `${z.name} · Bairro fixado (origem) · IVS ${z.vuln}`
            : isB
              ? `${z.name} · Bairro comparado · IVS ${z.vuln}`
              : `${z.name} · Clique para comparar com ${selectedZoneA.name}`
          : `${z.name} · NDVI ${z.ndvi.toFixed(2)} (${z.canopy}% copa)`;

      L.marker(pos, {
        icon: L.divIcon({ className: "", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
        zIndexOffset: isA ? 1000 : isB ? 900 : 0,
        title,
        keyboard: true,
      })
        .on("click", () => {
          const h = handlersRef.current;
          if (h.mode === "vuln" && h.onSelectComparisonZone) {
            if (z.id === h.selectedZoneA.id) return;
            h.onSelectComparisonZone(z);
          } else {
            h.onSelectZone(z);
          }
        })
        .addTo(group);
    });
  }, [ready, mode, selectedZoneA.id, selectedZoneB?.id, isDark]);

  const toggleBtn = (active: boolean) =>
    `flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-xl border border-border/80 bg-muted shadow-xl ${className}`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        role="region"
        aria-label={
          mode === "ndvi"
            ? "Mapa de cobertura vegetal do Recife"
            : "Mapa de vulnerabilidade social do Recife"
        }
      />

      {!ready && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center text-xs text-muted-foreground font-mono">
          Carregando mapa…
        </div>
      )}

      {/* Zoom e recentralizar */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-lg border border-border/80 bg-card/90 p-1 backdrop-blur-md shadow-md">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground cursor-pointer"
          title="Aumentar zoom"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground cursor-pointer"
          title="Diminuir zoom"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => fitAll(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground cursor-pointer"
          title="Centralizar no Recife"
        >
          <Crosshair className="h-3.5 w-3.5 text-cyan-500" />
        </button>
      </div>

      {/* Base e camadas */}
      <div className="absolute top-3 left-14 z-10 flex flex-wrap items-center gap-1 rounded-lg border border-border/80 bg-card/90 p-1 backdrop-blur-md shadow-md max-w-[calc(100%-4.5rem)]">
        <button
          type="button"
          className={toggleBtn(baseMap === "satelite")}
          onClick={() => setBaseMap("satelite")}
          title="Imagem de satélite (Esri)"
        >
          <Satellite className="h-3 w-3" /> Satélite
        </button>
        <button
          type="button"
          className={toggleBtn(baseMap === "ruas")}
          onClick={() => setBaseMap("ruas")}
          title="Mapa de ruas (OpenStreetMap)"
        >
          <MapIcon className="h-3 w-3" /> Ruas
        </button>
        <span className="mx-0.5 h-4 w-px bg-border" />
        <button
          type="button"
          className={toggleBtn(showThematic)}
          onClick={() => setShowThematic((v) => !v)}
          title="Mostrar/ocultar a camada temática"
        >
          <Layers className="h-3 w-3" /> {mode === "ndvi" ? "Manchas verdes" : "Manchas IVS"}
        </button>
        {mode === "ndvi" && (
          <button
            type="button"
            className={toggleBtn(showNasaNdvi)}
            onClick={() => setShowNasaNdvi((v) => !v)}
            title="NDVI real do satélite MODIS (NASA GIBS, 250 m, composição de 8 dias)"
          >
            NDVI NASA
          </button>
        )}
        {baseMap === "satelite" && (
          <button
            type="button"
            className={toggleBtn(showLabels)}
            onClick={() => setShowLabels((v) => !v)}
            title="Rótulos de vias e lugares"
          >
            Rótulos
          </button>
        )}
      </div>

      {/* Legenda */}
      {!hideInlineLegend && (
        <div className="absolute bottom-10 left-3 rounded-lg border border-border/80 bg-background/90 p-3 backdrop-blur shadow-xl text-xs max-w-xs z-10">
          {mode === "ndvi" ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-canopy" />
                  Índice NDVI (Densidade de Copa)
                </span>
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
                <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono">
                  <Crosshair className="h-3 w-3" />
                  <span>
                    Simulação ativa: +{additionalTreesPct}% copa em {selectedZoneA.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1 mb-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Vulnerabilidade Social (IVS)
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
      )}

      {/* Indicador de comparação A → B */}
      {selectedZoneB && (
        <div className="absolute top-14 right-3 z-10 hidden sm:flex items-center gap-2 rounded-lg border border-border/80 bg-background/90 px-3 py-1.5 backdrop-blur shadow-md font-mono text-[11px]">
          <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-bold text-red-600 dark:text-red-400">
            A · {selectedZoneA.name}
          </span>
          <span className="text-muted-foreground">┄┄→</span>
          <span className="rounded bg-sky-500/15 px-1.5 py-0.5 font-bold text-sky-600 dark:text-sky-400">
            B · {selectedZoneB.name}
          </span>
        </div>
      )}
    </div>
  );
}
