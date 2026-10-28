import {
  Activity,
  BarChart3,
  Trees,
  CloudSun,
  Layers,
  Bell,
  Gauge,
  FileText,
  Clock,
  Radio,
  X,
} from "lucide-react";
import type { NavTab } from "@/routes/index";
import type { RealtimeWeatherSnapshot } from "@/lib/geo-services/realtime-weather-service";
import { PernambucoMinimap } from "./PernambucoMinimap";

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDark: boolean;
  currentTime: string;
  weatherSnapshot?: RealtimeWeatherSnapshot | null;
  alertsCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenReports?: () => void;
}

export function SidebarNav({
  activeTab,
  onSelectTab,
  isDark,
  currentTime,
  weatherSnapshot,
  alertsCount = 0,
  mobileOpen = false,
  onCloseMobile,
  onOpenReports,
}: SidebarNavProps) {
  const navItems: {
    id: NavTab | "relatorios";
    label: string;
    icon: typeof Activity;
    badge?: number;
  }[] = [
    { id: "tempo-real", label: "Tempo real", icon: Activity },
    { id: "historico", label: "Comparação & Histórico", icon: BarChart3 },
    { id: "verde", label: "Dashboard Verde", icon: Trees },
    { id: "clima-nasa", label: "Clima NASA POWER", icon: CloudSun },
    { id: "analise-ambiental", label: "MapBiomas & Landsat", icon: Layers },
    { id: "alertas", label: "Alertas", icon: Bell, badge: alertsCount > 0 ? alertsCount : 3 },
    { id: "indice", label: "Índice Térmico", icon: Gauge },
    { id: "relatorios", label: "Relatórios", icon: FileText },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between overflow-y-auto no-scrollbar p-3.5 space-y-4">
      {/* 1. TOPO: LOGO OFICIAL CENTRALIZADA COM ARBORIS ABAIXO */}
      <div>
        <div className="flex flex-col items-center justify-center text-center pb-3 border-b border-border/70 relative">
          {mobileOpen && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              type="button"
              className="absolute right-0 top-0 lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => onSelectTab("tempo-real")}
            className="flex flex-col items-center justify-center focus:outline-none cursor-pointer group text-center"
            title="Ir para o início do Radar Climático"
          >
            <img
              src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
              alt="Logo Radar Climático Arboris"
              className="h-16 xl:h-20 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="mt-1 font-mono text-[11px] sm:text-xs font-bold tracking-[0.3em] text-foreground/90 uppercase">
              ARBORIS
            </span>
          </button>
        </div>

        {/* 2. MENUS DE NAVEGAÇÃO VERTICAL */}
        <nav className="mt-3.5 space-y-1" data-tour="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "relatorios") {
                    if (onOpenReports) onOpenReports();
                    else onSelectTab("tempo-real");
                  } else {
                    onSelectTab(item.id);
                  }
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/35 font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                      isActive
                        ? "bg-cyan-600 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. ESPAÇO RECIFE/PE COM O MAPA DE PERNAMBUCO E PONTO DO RECIFE */}
      <div className="space-y-3 pt-2 border-t border-border/70">
        <PernambucoMinimap />

        {/* 4. DADOS ATUALIZADOS */}
        <div className="rounded-xl border border-border/80 bg-card/60 p-2.5 text-xs backdrop-blur-xs shadow-xs space-y-1.5" data-tour="sidebar-sources">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Dados atualizados</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-3 w-3 text-cyan-500" />
              ↳ {weatherSnapshot?.fetchedAt || currentTime}
            </span>
          </div>

          <div className="font-mono text-[10px] text-muted-foreground space-y-0.5 pl-3 border-l border-border/60">
            <p className="hover:text-foreground transition-colors">Open-Meteo API</p>
            <p className="hover:text-foreground transition-colors">Landsat 8/9</p>
            <p className="hover:text-foreground transition-colors">MapBiomas · NASA POWER</p>
          </div>
        </div>

        {/* 5. RODAPÉ DA PLATAFORMA COM VERSÃO DO MVP */}
        <div className="pt-1 text-center font-mono text-[10px] text-muted-foreground space-y-0.5">
          <p className="font-semibold text-foreground/80 tracking-wide">v2.0 MVP</p>
          <p>Radar Climático</p>
          <p className="text-[9px] opacity-75">Plataforma Arboris Integrada</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR FIXA */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 border-r border-border/80 bg-card/75 dark:bg-card/50 backdrop-blur-md sticky top-0 h-screen z-30 flex-col">
        {content}
      </aside>

      {/* MOBILE / TABLET OVERLAY DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop escurecido com clique para fechar */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer lateral deslizando da esquerda */}
          <div className="relative w-72 max-w-[85vw] h-full bg-card border-r border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
