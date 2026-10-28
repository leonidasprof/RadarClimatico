import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  ShieldCheck,
  Edit3,
  LogOut,
  SunMedium,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Contrast,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { RealtimeWeatherSnapshot } from "@/lib/geo-services/realtime-weather-service";
import type { Zone } from "@/lib/radar-data";

interface TopHeaderProps {
  onToggleMobileMenu: () => void;
  onOpenContactModal: () => void;
  weatherSnapshot?: RealtimeWeatherSnapshot | null;
  isSyncingWeather?: boolean;
  onSyncWeather?: () => void;
  zonesList?: Zone[];
  onSelectZone: (zone: Zone) => void;
  onOpenAlerts?: () => void;
}

export function TopHeader({
  onToggleMobileMenu,
  onOpenContactModal,
  weatherSnapshot,
  isSyncingWeather,
  onSyncWeather,
  zonesList = [],
  onSelectZone,
  onOpenAlerts,
}: TopHeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Relógio e Data em tempo real
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const d = new Date();
    const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const year = d.getFullYear();
    return `${capWeekday}, ${day} de ${month} de ${year}`;
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      const weekday = now.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const day = String(now.getDate()).padStart(2, "0");
      const month = now.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      const year = now.getFullYear();
      setCurrentDate(`${capWeekday}, ${day} de ${month} de ${year}`);
    };
    const timer = setInterval(update, 5000);
    return () => clearInterval(timer);
  }, []);

  // Atalho de teclado '/' para focar na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    toast.info("Sessão encerrada.", {
      description: "Você foi desconectado do Radar Climático.",
    });
    navigate({ to: "/login" });
  };

  // Ícone dinâmico do clima baseado no Open-Meteo weather_code
  const renderWeatherIcon = () => {
    const iconType = weatherSnapshot?.weatherIcon || "sun";
    const desc = weatherSnapshot?.weatherDescription || "Ensolarado";

    let icon = <SunMedium className="h-4 w-4 text-amber-500 shrink-0" />;
    switch (iconType) {
      case "cloud-sun":
        icon = <CloudSun className="h-4 w-4 text-amber-500 shrink-0" />;
        break;
      case "cloud":
        icon = <Cloud className="h-4 w-4 text-slate-400 shrink-0" />;
        break;
      case "rain":
        icon = <CloudRain className="h-4 w-4 text-sky-500 shrink-0" />;
        break;
      case "cloud-lightning":
        icon = <CloudLightning className="h-4 w-4 text-purple-500 shrink-0" />;
        break;
      case "sun":
      default:
        icon = <SunMedium className="h-4 w-4 text-amber-500 shrink-0" />;
        break;
    }

    return (
      <span title={`Clima atual: ${desc}`} className="inline-flex items-center">
        {icon}
      </span>
    );
  };

  const filteredZones = searchQuery.trim()
    ? zonesList.filter((z) =>
        z.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md px-4 sm:px-6 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* LADO ESQUERDO: Botão Mobile + Títulos e Slogan */}
        <div className="flex items-center gap-2.5 min-w-0" data-tour="header-title">
          <button
            onClick={onToggleMobileMenu}
            type="button"
            className="lg:hidden p-1.5 rounded-lg border border-border bg-card/80 text-foreground hover:bg-card focus:outline-none cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-foreground truncate">
              SISTEMA DE MONITORAMENTO E ALERTA DE ILHAS DE CALOR
            </h1>
            <p className="text-[10px] font-semibold text-primary/90 tracking-wide mt-0.5">
              MONITORAR HOJE, PROTEGER AMANHÃ
            </p>
          </div>
        </div>

        {/* CENTRO: BARRA DE PESQUISA */}
        <div className="relative flex-1 max-w-md hidden md:block mx-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Buscar bairro, região ou indicador..."
              className="w-full rounded-xl border border-border bg-card/60 pl-8 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card shadow-xs transition-all"
            />
            <kbd className="absolute right-2.5 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/60 pointer-events-none">
              /
            </kbd>
          </div>

          {/* Dropdown de resultados de busca de bairros */}
          {searchFocused && filteredZones.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-in fade-in max-h-56 overflow-y-auto">
              <p className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1">
                Bairros correspondentes ({filteredZones.length})
              </p>
              {filteredZones.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onMouseDown={() => {
                    onSelectZone(z);
                    setSearchQuery("");
                  }}
                  className="flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 text-xs hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-foreground">{z.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {z.temp.toFixed(1).replace(".", ",")}°C
                    </span>
                    <span
                      className="rounded px-1.5 py-0.2 font-display text-[10px] font-bold"
                      style={{
                        background: "color-mix(in oklab, var(--primary) 20%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      Classe {z.rating}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LADO DIREITO: QUADRINHO UNIFICADO (ON LINE + DATA/HORA/CLIMA) + TEMA + PERFIL */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-auto ml-auto">
          {/* QUADRINHO UNIFICADO: STATUS ON LINE + HORA + DATA + ÍCONE DO CLIMA */}
          <button
            onClick={onSyncWeather}
            disabled={isSyncingWeather}
            type="button"
            data-tour="sensors-status"
            className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-border/80 bg-card/75 px-2.5 sm:px-3 py-1.5 text-xs transition-colors hover:bg-card cursor-pointer shadow-xs"
            title="Conexão com estações meteorológicas (clique para sincronizar)"
          >
            {/* Status On line em destaque esmeralda */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>On line</span>
            </span>

            <div className="h-4 w-px bg-border/80" />

            {/* Hora e Data em tempo real */}
            <div className="flex flex-col text-right leading-tight font-mono">
              <span className="font-bold text-foreground text-xs">
                {isSyncingWeather ? "Sincronizando..." : currentTime}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                {currentDate}
              </span>
            </div>

            {/* Ícone meteorológico dinâmico da Open-Meteo */}
            <div className="hidden sm:flex items-center pl-1 border-l border-border/80">
              {renderWeatherIcon()}
            </div>
          </button>

          {/* Botão de Alternar Modo Claro / Escuro com ícone Contrast dedicado */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-border bg-card/60 transition-colors hover:bg-card focus:outline-none cursor-pointer"
            aria-label="Alternar modo claro/escuro"
            title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          >
            <Contrast className="h-4 w-4 text-foreground/80 hover:text-foreground transition-transform hover:rotate-180 duration-300" />
          </button>

          {/* Menu de Perfil do Operador */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              className="flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-2 py-1 transition-all hover:bg-card hover:border-primary/50 focus:outline-none cursor-pointer shadow-xs"
              aria-label="Menu da conta de usuário"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground shadow-xs">
                {user?.avatarInitials ?? "JG"}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-foreground">
                  {user?.name ?? "Jorge Gonçalves"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {user?.role ? user.role.slice(0, 24) : "Coordenador de Operações"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      {user?.name ?? "Jorge Gonçalves"}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                      {user?.email ?? "jorge.goncalves@recife.pe.gov.br"}
                    </p>
                    <span className="mt-1.5 inline-block rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono text-secondary-foreground font-semibold">
                      {user?.department ?? "Defesa Civil / CODECIR"}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenContactModal();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-muted cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">Alterar dados de contato</span>
                        <span className="text-[10px] text-muted-foreground">Telefone e perfil</span>
                      </div>
                    </button>
                  </div>

                  <div className="my-1 border-t border-border/60" />

                  <div className="py-0.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="font-medium">Sair da conta</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
