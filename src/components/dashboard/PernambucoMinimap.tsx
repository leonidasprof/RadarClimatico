import { MapPin } from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface PernambucoMinimapProps {
  className?: string;
  showTitle?: boolean;
}

export function PernambucoMinimap({ className = "", showTitle = true }: PernambucoMinimapProps) {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} data-tour="sidebar-minimap">
      {showTitle && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
          <MapPin className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
          <span>Recife / PE</span>
        </div>
      )}

      {/* Container do Mapa Fiel com demarcação do Recife */}
      <div className="relative w-full rounded-xl border border-border/80 bg-card/60 p-2.5 backdrop-blur-xs shadow-xs overflow-hidden group">
        {/* Grade sutil de radar */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Imagem Real do Contorno do Mapa de Pernambuco */}
        <div className="relative w-full aspect-[2.6/1] flex items-center justify-center my-0.5">
          <img
            src={isDark ? "/mapa-pe-cyan.png" : "/mapa-pernambuco-real.png"}
            alt="Mapa do Estado de Pernambuco com contorno geográfico real"
            className="w-full h-full object-contain filter drop-shadow-xs select-none pointer-events-none transition-all duration-300"
          />

          {/* Ponto Pulsante sobre Recife (Litoral Leste: ~92.5% horizontal, ~45% vertical) */}
          <div
            className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: "92.5%", top: "45%" }}
          >
            {/* Onda expansiva de radar */}
            <span className="absolute -inset-2 rounded-full bg-cyan-400/50 animate-ping" />
            <span className="relative flex h-3 w-3 items-center justify-center rounded-full bg-cyan-500 ring-2 ring-white dark:ring-slate-900 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>
        </div>

        {/* Rodapé interno com coordenadas rápidas */}
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/50">
          <span>8.05° S, 34.88° O</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Recife
          </span>
        </div>
      </div>
    </div>
  );
}
