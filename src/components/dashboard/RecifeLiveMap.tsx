import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { Plus, Minus, Crosshair } from "lucide-react";
import type { Zone } from "@/lib/radar-data";

/**
 * Mapa real do Recife (Leaflet + OpenStreetMap).
 *
 * Bases cartográficas gratuitas e sem chave de API:
 *  - Mapa de ruas: OpenStreetMap (tile.openstreetmap.org)
 *  - Satélite: Esri World Imagery
 *
 * Os 8 bairros monitorados são posicionados por latitude/longitude reais.
 */

// Centroides aproximados dos bairros monitorados (WGS84)
export const zoneCoordinates: Record<string, [number, number]> = {
  "boa-viagem": [-8.1275, -34.9015],
  "santo-amaro": [-8.0478, -34.8785],
  "boa-vista": [-8.0605, -34.8895],
  afogados: [-8.0775, -34.9085],
  imbiribeira: [-8.1095, -34.9135],
  "casa-forte": [-8.0365, -34.9195],
  "dois-irmaos": [-8.0135, -34.9475],
  ibura: [-8.1185, -34.9465],
};

export const RECIFE_CENTER: [number, number] = [-8.07, -34.91];

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
const ESRI_ATTR = "Imagens &copy; Esri, Maxar, Earthstar Geographics";

const BASE_TILES = {
  ruas: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};
// Rótulos sobre o satélite (vias e nomes de lugares)
const SAT_LABEL_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
];

// Mesma escala da legenda: 28° → 45°
const HEAT_STOPS: [number, [number, number, number]][] = [
  [28, [6, 182, 212]],
  [32, [16, 185, 129]],
  [36, [234, 179, 8]],
  [40, [249, 115, 22]],
  [45, [239, 68, 68]],
];

function tempToHex(t: number) {
  const first = HEAT_STOPS[0]!;
  const last = HEAT_STOPS[HEAT_STOPS.length - 1]!;
  if (t <= first[0]) return rgb(first[1]);
  if (t >= last[0]) return rgb(last[1]);
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    const [t0, c0] = HEAT_STOPS[i]!;
    const [t1, c1] = HEAT_STOPS[i + 1]!;
    if (t >= t0 && t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return rgb([0, 1, 2].map((j) => c0[j]! + (c1[j]! - c0[j]!) * k) as [number, number, number]);
    }
  }
  return rgb(last[1]);
}

function rgb([r, g, b]: [number, number, number]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export type LiveMapLayers = {
  bairros: boolean;
  ilhas: boolean;
};

interface RecifeLiveMapProps {
  zones: Zone[];
  selectedId: string;
  onSelect: (z: Zone) => void;
  getZoneColor: (z: Zone) => string;
  layers: LiveMapLayers;
  baseMap: "ruas" | "satelite";
  isDark: boolean;
  onRecenter?: () => void;
  className?: string;
}

export function RecifeLiveMap({
  zones,
  selectedId,
  onSelect,
  getZoneColor,
  layers,
  baseMap,
  isDark,
  onRecenter,
  className = "",
}: RecifeLiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const baseLayerRef = useRef<Leaflet.TileLayer | null>(null);
  const labelLayersRef = useRef<Leaflet.TileLayer[]>([]);
  const markersRef = useRef<Leaflet.LayerGroup | null>(null);
  const heatRef = useRef<Leaflet.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  const prevSelectedRef = useRef(selectedId);
  const [ready, setReady] = useState(false);

  onSelectRef.current = onSelect;

  // Assinaturas estáveis: evitam redesenhar marcadores a cada render do painel
  const zonesRef = useRef(zones);
  zonesRef.current = zones;
  const getColorRef = useRef(getZoneColor);
  getColorRef.current = getZoneColor;
  const zonesKey = zones.map((z) => `${z.id}:${z.temp}:${z.name}`).join("|");
  const colorsKey = zones.map((z) => getZoneColor(z)).join("|");

  const fitToZones = (animate = true) => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;
    const pts = zones.map((z) => zoneCoordinates[z.id]).filter(Boolean) as [number, number][];
    if (!pts.length) {
      map.setView(RECIFE_CENTER, 12);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), {
      // espaço extra à direita para o card de legenda
      paddingTopLeft: [56, 40],
      paddingBottomRight: [map.getSize().x > 600 ? 240 : 40, 40],
      animate,
    });
  };

  const fittedRef = useRef(false);
  const fitToZonesRef = useRef(fitToZones);
  fitToZonesRef.current = fitToZones;

  // 1. Cria o mapa uma única vez (Leaflet só roda no navegador)
  useEffect(() => {
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;

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

      heatRef.current = L.layerGroup().addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      resizeObs = new ResizeObserver(() => {
        map.invalidateSize();
        if (!fittedRef.current && map.getSize().y > 0) {
          fittedRef.current = true;
          fitToZonesRef.current(false);
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

  // 2. Camada base (OpenStreetMap ou satélite com rótulos)
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!ready || !map || !L) return;

    baseLayerRef.current?.remove();
    labelLayersRef.current.forEach((l) => l.remove());
    labelLayersRef.current = [];

    const isSat = baseMap === "satelite";
    baseLayerRef.current = L.tileLayer(isSat ? BASE_TILES.satellite : BASE_TILES.ruas, {
      attribution: isSat ? ESRI_ATTR : OSM_ATTR,
      maxZoom: 19,
      className: !isSat && isDark ? "arboris-tiles-dark" : "",
    }).addTo(map);
    baseLayerRef.current.bringToBack();

    if (isSat) {
      labelLayersRef.current = SAT_LABEL_TILES.map((url) =>
        L.tileLayer(url, { maxZoom: 19, pane: "overlayPane", opacity: 0.7 }).addTo(map),
      );
    }
  }, [ready, baseMap, isDark]);

  // 3. Manchas de calor (círculos em metros, proporcionais à temperatura)
  useEffect(() => {
    const L = LRef.current;
    const group = heatRef.current;
    if (!ready || !L || !group) return;
    group.clearLayers();
    if (!layers.ilhas) return;

    zonesRef.current.forEach((z) => {
      const pos = zoneCoordinates[z.id];
      if (!pos) return;
      const color = tempToHex(z.temp);
      const radius = 450 + Math.max(0, z.temp - 28) * 140;
      L.circle(pos, {
        radius: radius * 1.6,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(group);
      L.circle(pos, {
        radius,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.28,
        interactive: false,
      }).addTo(group);
    });
  }, [ready, zonesKey, layers.ilhas]);

  // 4. Marcadores dos bairros (nome + temperatura + bolinha de risco)
  useEffect(() => {
    const L = LRef.current;
    const group = markersRef.current;
    if (!ready || !L || !group) return;
    group.clearLayers();
    if (!layers.bairros) return;

    zonesRef.current.forEach((z) => {
      const pos = zoneCoordinates[z.id];
      if (!pos) return;
      const active = z.id === selectedId;
      const isPeak = z.id === "santo-amaro" || z.temp >= 36;
      const temp = z.temp.toFixed(1).replace(".", ",");

      const rings =
        active || isPeak
          ? `<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full border border-rose-500/50 animate-ping pointer-events-none"></span>
             <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-rose-500/60 pointer-events-none"></span>`
          : "";

      const pillCls = active
        ? "bg-slate-900 text-white ring-2 ring-rose-500 scale-105 shadow-xl"
        : "bg-slate-900/85 text-white/90 hover:bg-slate-900 hover:scale-105 border border-white/20";

      const html = `
        <div class="relative" style="transform: translate(-50%, -50%); width: max-content;">
          ${rings}
          <div class="relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-md transition-all duration-150 cursor-pointer ${pillCls}" title="${escapeHtml(z.name)}: ${temp} °C">
            <span class="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs" style="background-color: ${escapeHtml(getColorRef.current(z))}"></span>
            <span class="font-sans font-medium text-[11px] whitespace-nowrap text-white">${escapeHtml(z.name)}</span>
            <span class="font-mono text-[11px] font-bold text-amber-300">${temp}°</span>
          </div>
        </div>`;

      const marker = L.marker(pos, {
        icon: L.divIcon({ className: "", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
        zIndexOffset: active ? 1000 : isPeak ? 500 : 0,
        keyboard: true,
        title: z.name,
      });
      marker.on("click", () => onSelectRef.current(z));
      marker.addTo(group);
    });
  }, [ready, zonesKey, colorsKey, selectedId, layers.bairros]);

  // 5. Ao trocar de bairro, desloca o mapa suavemente até ele
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (prevSelectedRef.current === selectedId) return;
    prevSelectedRef.current = selectedId;
    const pos = zoneCoordinates[selectedId];
    if (pos && !map.getBounds().pad(-0.15).contains(pos)) {
      map.panTo(pos, { animate: true });
    }
  }, [ready, selectedId]);

  return (
    <div className={`isolate ${className || "relative h-full w-full"}`}>
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 bg-muted"
        role="region"
        aria-label="Mapa do Recife com os bairros monitorados"
      />

      {!ready && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center text-xs text-muted-foreground font-mono">
          Carregando mapa…
        </div>
      )}

      {/* Controles de zoom flutuantes */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1 rounded-lg border border-border/80 bg-card/90 p-1 backdrop-blur-md shadow-md">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
          title="Aumentar zoom"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
          title="Diminuir zoom"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            fitToZones(true);
            onRecenter?.();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
          title="Centralizar no Recife"
        >
          <Crosshair className="h-3.5 w-3.5 text-cyan-500" />
        </button>
      </div>
    </div>
  );
}
