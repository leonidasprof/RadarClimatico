import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  zones,
  alerts,
  hourly,
  priorities,
  heatVar,
  canopyVar,
  vulnVar,
  zoneHistory,
  ratingDefinitions,
  zoneOrganRecommendations,
  evaluateWeatherAlerts,
  type Zone,
  type AlertItem,
} from "@/lib/radar-data";
import { RecifeStreetMesh } from "@/components/RecifeStreetMesh";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { UserContactModal } from "@/components/auth/UserContactModal";
import { ReportAlertModal } from "@/components/alerts/ReportAlertModal";
import { GreenDashboardView } from "@/components/dashboard/GreenDashboardView";
import { ComparisonHistoryView } from "@/components/history/ComparisonHistoryView";
import { VegetationCoverView } from "@/components/dashboard/VegetationCoverView";
import { SocialVulnerabilityView } from "@/components/dashboard/SocialVulnerabilityView";
import { NasaPowerDashboardView } from "@/components/dashboard/NasaPowerDashboardView";
import { EnvironmentalAnalysisView } from "@/components/dashboard/EnvironmentalAnalysisView";
import {
  fetchRealtimeRecifeWeather,
  type RealtimeWeatherSnapshot,
} from "@/lib/geo-services/realtime-weather-service";
import { MapLayerSwitcher } from "@/components/dashboard/MapLayerSwitcher";
import { LoginPage } from "./login";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TourProvider, useTour } from "@/context/TourContext";
import { ClimaTourOverlay } from "@/components/tour/ClimaTourOverlay";
import {
  Sun,
  Moon,
  LogOut,
  Edit3,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Info,
  Plus,
  ArrowLeftRight,
  Trees,
  CheckCheck,
  ArrowRight,
  Filter,
  Sparkles,
  HeartPulse,
  Globe,
  ExternalLink,
  CloudRain,
  TrendingDown,
  History,
  Clock,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar Climático" },
      {
        name: "description",
        content:
          "Dashboard Arboris para gestores públicos: mapa de ilhas de calor, alertas antecipados de ondas de calor e priorização de infraestrutura verde no Recife.",
      },
      { property: "og:title", content: "Radar Climático | Arboris" },
      {
        property: "og:description",
        content:
          "Inteligência territorial e microclimática para detectar, comunicar e mitigar ondas de calor no Recife.",
      },
    ],
  }),
  component: Dashboard,
});

const levelStyles = {
  critico: { label: "Crítico", color: "var(--heat-5)" },
  alto: { label: "Alto", color: "var(--heat-4)" },
  moderado: { label: "Moderado", color: "var(--heat-3)" },
};

export type NavTab =
  | "tempo-real"
  | "historico"
  | "verde"
  | "clima-nasa"
  | "analise-ambiental"
  | "alertas"
  | "indice";

function Dashboard() {
  const [currentZones, setCurrentZones] = useState<Zone[]>(zones);
  const [selected, setSelected] = useState<Zone>(zones[1]!);
  const [activeTab, setActiveTab] = useState<NavTab>("tempo-real");
  const [mapLayer, setMapLayer] = useState<"calor" | "vegetal" | "vulnerabilidade">("calor");
  const [alertsList, setAlertsList] = useState<AlertItem[]>(alerts);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [weatherSnapshot, setWeatherSnapshot] = useState<RealtimeWeatherSnapshot | null>(null);
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();

  /**
   * Sincronização automática do clima em tempo real para Recife
   * Consulta a API pública do Open-Meteo e aplica a modelagem biofísica do Arboris
   */
  const syncWeather = async (silent = false) => {
    setIsSyncingWeather(true);
    try {
      const snap = await fetchRealtimeRecifeWeather();
      setWeatherSnapshot(snap);
      setCurrentZones(snap.zones);
      setSelected((prev) => snap.zones.find((z) => z.id === prev.id) || snap.zones[1]!);
      // Aplica regra de negócio: avalia limiares térmicos reais dos microterritórios
      setAlertsList((prev) => evaluateWeatherAlerts(snap.zones, prev));
      if (!silent) {
        toast.success("Clima em tempo real sincronizado!", {
          description: `Temperatura e sensação atualizadas via API pública Open-Meteo (${snap.recifeBaseTemp}°C).`,
        });
      }
    } catch (err) {
      console.warn("Falha ao sincronizar clima:", err);
    } finally {
      setIsSyncingWeather(false);
    }
  };

  useEffect(() => {
    syncWeather(true);
  }, []);

  /**
   * Lógica de negócio: Disparo operacional de alerta (Épico 1)
   * Marca o alerta como notificado e dispara confirmação via Toast/Sonner
   * simulando a integração com sistemas de rádio da Defesa Civil e push notification.
   */
  const handleDispatchAlert = (alertId: string | number) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, notified: true } : a))
    );
    const target = alertsList.find((a) => a.id === alertId);
    toast.success("Notificação operacional despachada!", {
      description: `Alerta para ${target?.zone || "região crítica"} transmitido aos agentes de campo e Defesa Civil.`,
    });
  };

  /**
   * Lógica de negócio: Registro de novo alerta de onda de calor (Épico 1)
   * Insere o novo alerta no topo da lista reativa com carimbo de tempo imediato.
   */
  const handleAddAlert = (newAlert: AlertItem) => {
    setAlertsList((prev) => [newAlert, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-mono text-xs text-muted-foreground">Carregando Radar Climático...</p>
        </div>
      </div>
    );
  }

  // Quando o app abrir, exige autenticação na tela de login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <TourProvider>
      <TourRouteSync setActiveTab={setActiveTab} setMapLayer={setMapLayer} />
      <div className="min-h-screen">
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === "tempo-real") setMapLayer("calor");
          }}
          onOpenContactModal={() => setContactModalOpen(true)}
          weatherSnapshot={weatherSnapshot}
          isSyncingWeather={isSyncingWeather}
          onSyncWeather={() => syncWeather(false)}
        />
        <main className="mx-auto grid max-w-[1500px] gap-4 px-4 pb-14 lg:grid-cols-12">
          {/* Visualização Padrão: Operação em Tempo Real (Mapa Térmico & Camadas) */}
          {activeTab === "tempo-real" && (
            <>
              {mapLayer === "calor" && (
                <>
                  <div className="lg:col-span-8 space-y-4">
                    <Kpis weather={weatherSnapshot} />
                    <MapPanel
                      selected={selected}
                      onSelect={setSelected}
                      zonesList={currentZones}
                      onOpenGreenDashboard={() => setActiveTab("verde")}
                      activeLayer={mapLayer}
                      onChangeLayer={setMapLayer}
                    />
                    {/* Linha 1 abaixo do mapa térmico: Índice Térmico e Histórico de Temperatura */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <RatingPanel
                        zonesList={currentZones}
                        onSelect={setSelected}
                        selected={selected}
                      />
                      <HistoryPanel
                        zone={selected}
                        onOpenComparison={() => setActiveTab("historico")}
                      />
                    </div>
                    {/* Linha 2 abaixo: Curva do Dia e Priorização de Infraestrutura Verde */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <HourlyPanel
                        hourlyData={weatherSnapshot?.hourly}
                        peakHour={weatherSnapshot?.peakHour}
                        peakTemp={weatherSnapshot?.peakTemp}
                      />
                      <PriorityPanel onOpenGreenDashboard={() => setActiveTab("verde")} />
                    </div>
                  </div>
                  <aside className="lg:col-span-4 space-y-4">
                    <AlertsPanel
                      alerts={alertsList}
                      onOpenReportModal={() => setReportModalOpen(true)}
                      onDispatchAlert={handleDispatchAlert}
                    />
                    <ZoneDetail
                      zone={selected}
                      onOpenComparison={() => setActiveTab("historico")}
                      onOpenVegetalView={() => setMapLayer("vegetal")}
                      onOpenVulnView={() => setMapLayer("vulnerabilidade")}
                      onOpenNasaPower={() => setActiveTab("clima-nasa")}
                      onOpenEnvironmentalAnalysis={() => setActiveTab("analise-ambiental")}
                    />
                    <InsightsPanel />
                  </aside>
                </>
              )}

              {/* Visualização de Cobertura Vegetal integrada dentro do Mapa Térmico */}
              {mapLayer === "vegetal" && (
                <div className="lg:col-span-12" data-tour="sub-vegetal-view">
                  <VegetationCoverView
                    initialZone={selected}
                    onSelectZone={setSelected}
                    activeLayer={mapLayer}
                    onChangeLayer={setMapLayer}
                    onBackToThermalMap={() => setMapLayer("calor")}
                  />
                </div>
              )}

              {/* Visualização de Vulnerabilidade Social integrada dentro do Mapa Térmico */}
              {mapLayer === "vulnerabilidade" && (
                <div className="lg:col-span-12" data-tour="sub-vuln-view">
                  <SocialVulnerabilityView
                    initialZone={selected}
                    onSelectZone={setSelected}
                    activeLayer={mapLayer}
                    onChangeLayer={setMapLayer}
                    onBackToThermalMap={() => setMapLayer("calor")}
                  />
                </div>
              )}
            </>
          )}

          {/* Módulo de Comparação e Histórico (Épico 1) */}
          {activeTab === "historico" && (
            <div className="lg:col-span-12" data-tour="sub-history-view">
              <ComparisonHistoryView
                initialZone={selected}
                onSelectZone={setSelected}
              />
            </div>
          )}

          {/* Dashboard Verde (Épico 1) */}
          {activeTab === "verde" && (
            <div className="lg:col-span-12" data-tour="sub-green-view">
              <GreenDashboardView
                onSelectZone={(z) => {
                  setSelected(z);
                  setActiveTab("tempo-real");
                }}
              />
            </div>
          )}

          {/* Dashboard Climático NASA POWER (Módulo 3 Arboris) */}
          {activeTab === "clima-nasa" && (
            <div className="lg:col-span-12" data-tour="sub-nasa-view">
              <NasaPowerDashboardView onBack={() => setActiveTab("tempo-real")} />
            </div>
          )}

          {/* Análise Ambiental MapBiomas + Landsat (Módulos 1, 2, 4 e 5 Arboris) */}
          {activeTab === "analise-ambiental" && (
            <div className="lg:col-span-12" data-tour="sub-mapbiomas-view">
              <EnvironmentalAnalysisView
                onBack={() => setActiveTab("tempo-real")}
                onSelectMunicipality={(m) => {
                  const matched = zones.find((z) => z.name.toLowerCase().includes(m.name.toLowerCase()));
                  if (matched) {
                    setSelected(matched);
                    setActiveTab("tempo-real");
                  }
                }}
              />
            </div>
          )}

          {/* Módulo de Alertas em Vista Expandida (Épico 1) */}
          {activeTab === "alertas" && (
            <div className="lg:col-span-12 space-y-4">
              <AlertsPanel
                alerts={alertsList}
                onOpenReportModal={() => setReportModalOpen(true)}
                onDispatchAlert={handleDispatchAlert}
                expandedView
              />
            </div>
          )}

          {/* Índice Térmico Completo */}
          {activeTab === "indice" && (
            <div className="lg:col-span-12 space-y-4">
              <div className="panel p-6">
                <div className="flex items-center justify-between mb-4 border-b border-border/70 pb-3">
                  <div>
                    <h2 className="text-lg font-bold">Matriz de Índice Térmico e Risco Microclimático</h2>
                    <p className="text-xs text-muted-foreground">Classificação de calor e estresse térmico em todos os microterritórios monitorados do Recife</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("tempo-real")}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    ← Voltar ao mapa operacional
                  </button>
                </div>
                <RatingPanel
                  zonesList={currentZones}
                  onSelect={(z) => {
                    setSelected(z);
                    setActiveTab("tempo-real");
                  }}
                  selected={selected}
                />
              </div>
            </div>
          )}
        </main>
        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground bg-card/20">
          <div className="mx-auto max-w-4xl px-4 flex flex-col items-center gap-4">
            <img
              src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
              alt="Logo Arboris"
              className="h-16 object-contain"
            />

            <Button
              asChild
              variant="outline"
              className="gap-2.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-sm transition-all duration-200 h-10 px-5 font-medium rounded-lg"
            >
              <a
                href="https://radarclimatico.vercel.app/site_arboris/index.html"
                target="_blank"
                rel="noopener noreferrer"
                title="Acessar o portal/site do Radar Climático Arboris"
                id="btn-site-radarclimatico"
              >
                <Globe className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Acessar Portal Radar Climático</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70 shrink-0" />
              </a>
            </Button>

            <p className="text-muted-foreground/80">
              Radar Climático · Plataforma Arboris Integrada · Dados reais: Google Earth Engine, Landsat 8/9, MapBiomas Coleção 11 e NASA POWER
            </p>
          </div>
        </footer>
        <ReportAlertModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          onAddAlert={handleAddAlert}
        />
        <UserContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
        />
        <ClimaTourOverlay />
      </div>
    </TourProvider>
  );
}

function TourRouteSync({
  setActiveTab,
  setMapLayer,
}: {
  setActiveTab: (tab: NavTab) => void;
  setMapLayer: (layer: "calor" | "vegetal" | "vulnerabilidade") => void;
}) {
  const { registerNavHandler } = useTour();
  useEffect(() => {
    registerNavHandler((tab: string, layer?: "calor" | "vegetal" | "vulnerabilidade") => {
      setActiveTab(tab as NavTab);
      if (layer) setMapLayer(layer);
    });
  }, [registerNavHandler, setActiveTab, setMapLayer]);
  return null;
}

function Header({
  activeTab,
  onSelectTab,
  onOpenContactModal,
  weatherSnapshot,
  isSyncingWeather,
  onSyncWeather,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenContactModal: () => void;
  weatherSnapshot?: RealtimeWeatherSnapshot | null;
  isSyncingWeather?: boolean;
  onSyncWeather?: () => void;
}) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const timer = setInterval(update, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    toast.info("Sessão encerrada.", {
      description: "Você foi desconectado do Radar Climático.",
    });
    navigate({ to: "/login" });
  };

  const navItems: { id: NavTab; label: string }[] = [
    { id: "tempo-real", label: "Tempo real" },
    { id: "historico", label: "Comparação & Histórico" },
    { id: "verde", label: "Dashboard Verde" },
    { id: "clima-nasa", label: "Clima NASA POWER" },
    { id: "analise-ambiental", label: "MapBiomas & Landsat" },
    { id: "alertas", label: "Alertas" },
    { id: "indice", label: "Índice Térmico" },
  ];

  return (
    <header className="mx-auto mb-4 flex max-w-[1500px] flex-col gap-4 px-4 pt-6 pb-4">
      {/* Faixa superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-tour="header-title">
        {/* Logo maior à esquerda */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
            alt="Arboris Logo"
            className="h-11 sm:h-14 md:h-16 w-auto object-contain shrink-0"
          />

          {/* Texto principal + localização alinhados à esquerda da logo */}
          <div className="flex flex-col items-start min-w-0">
            <h1 className="text-sm sm:text-base md:text-xl font-bold leading-tight line-clamp-2 sm:line-clamp-none">
              SISTEMA DE MONITORAMENTO E ALERTA DE ILHAS DE CALOR
            </h1>
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Arboris · Recife / PE
            </p>
          </div>
        </div>

        {/* Botões à direita */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end sm:self-auto ml-auto sm:ml-0">
          {/* Badge Interativo com Horário em Tempo Real e Sincronização ao lado do botão de tema */}
          {onSyncWeather && (
            <button
              onClick={onSyncWeather}
              disabled={isSyncingWeather}
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 sm:px-3 py-1.5 whitespace-nowrap hover:bg-sky-500/20 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              title="Clique para sincronizar o clima ao vivo via Open-Meteo & NASA POWER"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono text-xs text-sky-400 font-semibold hidden sm:inline">
                {isSyncingWeather ? "Sincronizando..." : `Ao vivo · ${currentTime}`}
              </span>
              <span className="font-mono text-xs text-sky-400 font-semibold sm:hidden">
                {currentTime}
              </span>
            </button>
          )}

          {/* Botão alternar tema */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 transition-colors hover:bg-card focus:outline-none cursor-pointer"
            aria-label="Alternar modo claro/escuro"
            title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Botão Usuário */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              className="flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-2.5 py-1.5 transition-all hover:bg-card hover:border-primary/50 focus:outline-none cursor-pointer shadow-sm"
              aria-label="Menu da conta de usuário"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
                {user?.avatarInitials ?? "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-foreground">
                  {user?.name ?? "Usuário"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {user?.role ? user.role.slice(0, 24) : "Defesa Civil"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card p-2 shadow-2xl z-50">
                  {/* Perfil resumido */}
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      {user?.name ?? "Jorge Gonçalves"}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                      {user?.email ?? "jorge.goncalves@recife.pe.gov.br"}
                    </p>
                    <span className="mt-1.5 inline-block rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono text-secondary-foreground">
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
                        <span className="font-medium">Alterar informações de contato</span>
                        <span className="text-[10px] text-muted-foreground">Telefone, e-mail e cargo</span>
                      </div>
                    </button>
                  </div>

                  <div className="my-1 border-t border-border/60"></div>

                  <div className="py-0.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="font-medium">Sair da conta / trocar de usuário</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Faixa inferior: menus de navegação e sensores */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 py-1 px-1">
        {/* Navegação principal alinhada à esquerda */}
        <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar py-0.5">
          <nav className="flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1 overflow-x-auto no-scrollbar scroll-smooth" data-tour="nav-tabs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={
                    "rounded-md px-3 py-1.5 transition-colors cursor-pointer text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 " +
                    (isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40")
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Indicadores de status compactos e proporcionais na mesma linha à direita */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto pr-1" data-tour="sensors-status">
          <div
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 whitespace-nowrap"
            title="Sensores IoT e estações ativas em campo"
          >
            <span className="h-2 w-2 rounded-full bg-canopy shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">
              {weatherSnapshot?.zones.length || zones.length} online
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 whitespace-nowrap"
            title="Sensores offline"
          >
            <span className="h-2 w-2 rounded-full bg-destructive/60 shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">
              0 offline
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Kpis({ weather }: { weather?: RealtimeWeatherSnapshot | null }) {
  const avgTemp = weather?.cityAverageTemp
    ? weather.cityAverageTemp.toFixed(1).replace(".", ",")
    : "27,0";

  // 1. Regra de Negócio: Maior temperatura do dia
  // Durante as 24 horas do dia, este bloco informa a temperatura mais alta registrada na cidade até o momento
  const maxTempNum = weather?.cityMaxTemp !== undefined
    ? weather.cityMaxTemp
    : (weather?.cityAverageTemp ? Number((weather.cityAverageTemp + 2.4).toFixed(1)) : 29.4);

  const maxTempFormatted = maxTempNum.toFixed(1).replace(".", ",");
  const maxTempZone = weather?.cityMaxTempZone || "Santo Amaro";
  const maxTempHour = weather?.cityMaxTempHour ? ` (${weather.cityMaxTempHour})` : "";

  // 2. Regra de Negócio: Só usar o termo "Pico" se for alta (>= 32 °C)
  // Pela manhã ou em horários moderados (< 32 °C), NÃO usa o termo pico, exibindo "Máxima até o momento".
  const isHighTemp = maxTempNum >= 32.0;
  const tempStatus = isHighTemp ? "Pico registrado hoje" : "Máxima até o momento";
  const tempTone = isHighTemp ? "var(--heat-5)" : "var(--heat-4)";

  // Sensação térmica correspondente para contexto complementar
  const maxFeelsFormatted = weather?.cityMaxFeels
    ? weather.cityMaxFeels.toFixed(1).replace(".", ",")
    : undefined;

  const critCount = weather?.criticalZonesCount !== undefined ? String(weather.criticalZonesCount) : "0";
  const totalCount = weather?.zones.length || 8;

  const items: {
    label: string;
    value: string;
    unit: string;
    delta: string;
    subDelta?: string | undefined;
    tooltip?: string | undefined;
    tone: string;
  }[] = [
      {
        label: "Temp. média da cidade",
        value: avgTemp,
        unit: "°C",
        delta: weather?.source === "live" ? "Ao vivo · Open-Meteo API" : "+2,3 vs média histórica",
        tone: "var(--heat-4)",
      },
      {
        label: "Maior temperatura do dia",
        value: maxTempFormatted,
        unit: "°C",
        delta: tempStatus,
        subDelta: `${maxTempZone}${maxTempHour}`,
        tooltip: maxFeelsFormatted
          ? `Temperatura máx: ${maxTempFormatted}°C em ${maxTempZone}${maxTempHour} · Sensação térmica: ${maxFeelsFormatted}°C`
          : undefined,
        tone: tempTone,
      },
      {
        label: "Zonas em criticidade",
        value: critCount,
        unit: `de ${totalCount}`,
        delta: "Monitoramento contínuo",
        tone: "var(--heat-4)",
      },
      {
        label: "População exposta",
        value: "318",
        unit: "mil",
        delta: "62% em alta vulnerabilidade",
        tone: "var(--accent)",
      },
    ];
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-tour="kpi-macro">
      {items.map((k) => (
        <div key={k.label} title={k.tooltip} className="panel p-4 flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-semibold">
              <span style={{ color: k.tone }}>{k.value}</span>
              <span className="text-sm font-normal text-muted-foreground">{k.unit}</span>
            </p>
          </div>
          <div className="mt-1.5 font-mono text-[11px] text-muted-foreground leading-snug">
            <p>{k.delta}</p>
            {k.subDelta && <p className="font-semibold text-foreground/90">{k.subDelta}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}

function MapPanel({
  selected,
  onSelect,
  zonesList,
  onOpenGreenDashboard,
  activeLayer = "calor",
  onChangeLayer,
}: {
  selected: Zone;
  onSelect: (z: Zone) => void;
  zonesList?: Zone[];
  onOpenGreenDashboard?: () => void;
  activeLayer: "calor" | "vegetal" | "vulnerabilidade";
  onChangeLayer: (layer: "calor" | "vegetal" | "vulnerabilidade") => void;
}) {
  const activeZones = zonesList || zones;
  const layers = [
    { id: "calor", label: "Calor" },
    { id: "vegetal", label: "Cobertura vegetal" },
    { id: "vulnerabilidade", label: "Vulnerabilidade" },
  ] as const;

  /**
   * Lógica de cálculo cromático por camada (Épico 1):
   * - Calor: regras de temperatura e bioclimáticas de A a E (ratingDefinitions)
   * - Vegetal: escala verde florestal (canopyVar)
   * - Vulnerabilidade: tonalidades de alerta social (vulnVar)
   */
  const getZoneColor = (z: Zone) => {
    if (activeLayer === "calor") return ratingDefinitions[z.rating]?.color || heatVar(z.temp);
    if (activeLayer === "vegetal") return canopyVar(z.canopy);
    return vulnVar(z.vuln);
  };

  const getZoneLabel = (z: Zone) => {
    if (activeLayer === "calor") return `${z.name} · ${z.temp.toFixed(1).replace(".", ",")}° (${z.rating})`;
    if (activeLayer === "vegetal") return `${z.name} · ${z.canopy}% copa`;
    return `${z.name} · IVS ${z.vuln}`;
  };

  // Condição de pulso crítico: calor extremo (Classe E ou >=36°C), déficit de árvore (<=10%) ou altíssima vulnerabilidade (>=75)
  const shouldPulse = (z: Zone) => {
    if (activeLayer === "calor") return z.rating === "E" || z.temp >= 36;
    if (activeLayer === "vegetal") return z.canopy <= 10;
    return z.vuln >= 75;
  };

  return (
    <section className="panel overflow-hidden" data-tour="map-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Mapa térmico · Região Metropolitana do Recife</h2>
          <p className="text-[11px] text-muted-foreground">
            {activeLayer === "calor" && "Exibindo anomalias de temperatura de superfície e ilhas de calor"}
            {activeLayer === "vegetal" && "Exibindo densidade de copa arbórea e refúgios térmicos"}
            {activeLayer === "vulnerabilidade" && "Exibindo Índice de Vulnerabilidade Social (IVS) da população exposta"}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
            <span className="font-mono text-[10px] text-sky-400 font-medium">
              Dados ao Vivo (Open-Meteo + Landsat 8/9)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor rápido de foco territorial */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground text-[11px] hidden xs:inline">Bairro:</span>
            <select
              value={selected.id}
              onChange={(e) => {
                const found = activeZones.find((z) => z.id === e.target.value);
                if (found) onSelect(found);
              }}
              className="rounded border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[120px] sm:max-w-none"
            >
              {activeZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de camadas – exclui "Calor" pois já estamos nessa camada */}
          <div data-tour="map-layers">
            <MapLayerSwitcher activeLayer={activeLayer} onChangeLayer={onChangeLayer} excludeLayers={["calor"]} />
          </div>
        </div>
      </div>

      <div className="relative h-[380px] sm:h-[490px]">
        {/* malha viária esquemática do Recife */}
        <RecifeStreetMesh className="absolute inset-0 h-full w-full" />

        {activeZones.map((z) => {
          const active = z.id === selected.id;
          const color = getZoneColor(z);
          const isPulsing = shouldPulse(z);

          return (
            <button
              key={z.id}
              onClick={() => onSelect(z)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus:outline-none cursor-pointer"
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: z.size, height: z.size }}
              aria-label={`${z.name} - Classe ${z.rating}`}
            >
              <span
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: `radial-gradient(circle, color-mix(in oklab, ${color} 70%, transparent) 0%, transparent 68%)`,
                }}
              />
              <span
                className="absolute inset-[38%] rounded-full flex items-center justify-center font-display text-[11px] font-black shadow-md transition-all select-none"
                style={{
                  background: color,
                  color: z.rating === "B" || z.rating === "C" ? "#0f172a" : "#ffffff",
                  boxShadow: active
                    ? "0 0 0 3px var(--foreground), 0 0 14px color-mix(in oklab, var(--foreground) 50%, transparent)"
                    : "0 2px 5px rgba(0,0,0,0.35)",
                  opacity: 0.95,
                }}
              >
                {activeLayer === "calor" ? z.rating : ""}
              </span>
              {isPulsing && (
                <span
                  className="absolute inset-[36%] rounded-full pulse-ring"
                  style={{ background: color }}
                />
              )}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-4 whitespace-nowrap font-mono text-[11px] text-foreground font-semibold px-1.5 py-0.5 rounded bg-background/90 border border-border/60 shadow-xs backdrop-blur-xs">
                {getZoneLabel(z)}
              </span>
            </button>
          );
        })}

        {/* Legenda Dinâmica de Acordo com a Camada Ativa */}
        <div className={`absolute bottom-3 left-3 rounded-lg border border-border/80 bg-background/90 backdrop-blur-md shadow-md z-10 transition-all ${activeLayer === "calor" ? "p-2 max-w-[130px]" : "p-3 max-w-xs"}`}>
          {activeLayer === "calor" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-border/60 pb-1 gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  Escala Térmica
                </span>
                <span className="font-mono text-[8px] text-sky-400 font-semibold">A–E</span>
              </div>

              {/* Barra vertical com as 5 classes de E (topo, crítico) a A (base, ameno) */}
              <div className="flex flex-col gap-1 py-0.5">
                {(["E", "D", "C", "B", "A"] as const).map((r) => {
                  const def = ratingDefinitions[r];
                  return (
                    <div
                      key={r}
                      className="flex items-center gap-1.5 px-0.5 py-0.5 rounded hover:bg-muted/40 transition-colors"
                      title={`${def.name}: ${def.shortDesc} (Sensação ${r === "A" ? "≤32°C" : r === "B" ? "≤35°C" : r === "C" ? "≤38,5°C" : r === "D" ? "≤42°C" : ">42°C"})`}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded font-display text-[9px] font-black shadow-xs select-none"
                        style={{
                          background: def.color,
                          color: r === "B" || r === "C" ? "#0f172a" : "#ffffff",
                        }}
                      >
                        {r}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-foreground/90 whitespace-nowrap">
                        {r === "E" && ">42°"}
                        {r === "D" && "≤42°"}
                        {r === "C" && "≤38,5°"}
                        {r === "B" && "≤35°"}
                        {r === "A" && "≤32°"}
                      </span>
                      <span className="font-mono text-[8px] text-muted-foreground hidden sm:inline capitalize">
                        {r === "E" && "Crítico"}
                        {r === "D" && "Alerta"}
                        {r === "C" && "Atenção"}
                        {r === "B" && "Seguro"}
                        {r === "A" && "Refúgio"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeLayer === "vegetal" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cobertura arbórea (copa)
                </p>
                <button
                  onClick={() => onChangeLayer("vegetal")}
                  className="text-[10px] text-primary hover:underline ml-2 cursor-pointer font-semibold"
                >
                  Abrir Simulador Completo →
                </button>
              </div>
              <div
                className="h-2 w-52 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.78 0.12 95), oklch(0.75 0.14 125), var(--canopy))",
                }}
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>5% (crítico)</span>
                <span>30% (meta)</span>
                <span>60%+ (resiliente)</span>
              </div>
            </>
          )}

          {activeLayer === "vulnerabilidade" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Índice de Vulnerabilidade Social (IVS)
                </p>
                <button
                  onClick={() => onChangeLayer("vulnerabilidade")}
                  className="text-[10px] text-destructive hover:underline ml-2 cursor-pointer font-semibold"
                >
                  Abrir Tela de Saúde →
                </button>
              </div>
              <div
                className="h-2 w-52 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--accent), var(--heat-3), var(--heat-5))",
                }}
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>0 (baixo risco)</span>
                <span>50</span>
                <span>100 (alta vulnerab.)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function HourlyPanel({
  hourlyData,
  peakHour,
  peakTemp,
}: {
  hourlyData?: { h: string; t: number; feels?: number | undefined }[] | undefined;
  peakHour?: string | undefined;
  peakTemp?: number | undefined;
}) {
  const activeHourly = hourlyData && hourlyData.length ? hourlyData : hourly;
  const max = 40;
  const pts = activeHourly
    .map((p, i) => `${(i / (activeHourly.length - 1)) * 100},${100 - (p.t / max) * 100}`)
    .join(" ");

  const peakH = peakHour || "14h";
  const peakT = peakTemp !== undefined ? peakTemp.toFixed(1).replace(".", ",") : "36,8";

  return (
    <section className="panel p-4" data-tour="hourly-curve">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Curva térmica do dia</h2>
        {hourlyData && hourlyData.length > 0 && (
          <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 rounded font-semibold">
            API Open-Meteo
          </span>
        )}
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        Pico previsto {peakT} °C às {peakH} · limiar de alerta 35 °C
      </p>
      <div className="relative mt-4 h-40">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="curve" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--heat-5)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--heat-5)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            x2="100"
            y1={100 - (35 / max) * 100}
            y2={100 - (35 / max) * 100}
            stroke="var(--heat-4)"
            strokeDasharray="3 3"
            strokeWidth="0.6"
            opacity="0.7"
          />
          <polygon points={`0,100 ${pts} 100,100`} fill="url(#curve)" />
          <polyline points={pts} fill="none" stroke="var(--heat-5)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        {activeHourly.map((p) => (
          <span key={p.h}>{p.h}</span>
        ))}
      </div>
    </section>
  );
}

function PriorityPanel({ onOpenGreenDashboard }: { onOpenGreenDashboard?: () => void }) {
  return (
    <section className="panel p-4" data-tour="green-priority">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Priorização de infraestrutura verde</h2>
        {onOpenGreenDashboard && (
          <button
            onClick={onOpenGreenDashboard}
            className="text-[11px] text-primary hover:underline cursor-pointer"
          >
            Dashboard Verde →
          </button>
        )}
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        Calor × vulnerabilidade social × cobertura vegetal
      </p>
      <ul className="mt-4 space-y-3">
        {priorities.map((p) => (
          <li key={p.zone}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{p.zone}</span>
              <span className="font-mono text-xs text-muted-foreground">score {p.score}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full"
                style={{ width: `${p.score}%`, background: "var(--gradient-heat)" }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.action}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AlertsPanel({
  alerts: alertItems,
  onOpenReportModal,
  onDispatchAlert,
  expandedView = false,
}: {
  alerts: AlertItem[];
  onOpenReportModal: () => void;
  onDispatchAlert: (id: string | number) => void;
  expandedView?: boolean;
}) {
  const [viewMode, setViewMode] = useState<"ativos" | "historico">("ativos");
  const [filter, setFilter] = useState<"todos" | "critico" | "alto" | "moderado">("todos");

  // Alertas do dia: ocorrências em aberto aguardando despacho das equipes
  const activeAlerts = alertItems.filter((a) => !a.notified);
  // Histórico: ocorrências despachadas e transmitidas aos agentes de campo
  const historyAlerts = alertItems.filter((a) => a.notified);

  const currentList = viewMode === "ativos" ? activeAlerts : historyAlerts;

  // Filtro de severidade sobre a lista ativa no momento
  const filteredAlerts = currentList.filter((a) => {
    if (filter === "todos") return true;
    return a.level === filter;
  });

  const filterTabs = [
    {
      id: "todos",
      label: "Todos",
      count: currentList.length,
      dotClass: "bg-foreground/50",
      activeClass: "bg-card text-foreground shadow-sm ring-1 ring-border",
    },
    {
      id: "critico",
      label: "Crítico",
      count: currentList.filter((a) => a.level === "critico").length,
      dotClass: "bg-destructive",
      activeClass: "bg-destructive/15 text-destructive ring-1 ring-destructive/40 shadow-sm font-semibold",
    },
    {
      id: "alto",
      label: "Alto",
      count: currentList.filter((a) => a.level === "alto").length,
      dotClass: "bg-orange-500",
      activeClass: "bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/40 shadow-sm font-semibold",
    },
    {
      id: "moderado",
      label: "Moderado",
      count: currentList.filter((a) => a.level === "moderado").length,
      dotClass: "bg-amber-500",
      activeClass: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40 shadow-sm font-semibold",
    },
  ] as const;

  return (
    <section className="panel p-4" data-tour="alerts-panel">
      {/* Cabeçalho da Central de Alertas: Alternância entre Alertas do Dia e Histórico */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-card/60 border border-border/70 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("ativos")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${viewMode === "ativos"
              ? "bg-destructive/15 text-destructive font-semibold shadow-xs ring-1 ring-destructive/30"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <span className={activeAlerts.length > 0 ? "h-2 w-2 rounded-full bg-destructive animate-pulse" : "h-2 w-2 rounded-full bg-muted-foreground/50"} />
            <span>Alertas do dia</span>
            <span
              className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${viewMode === "ativos"
                ? "bg-destructive text-destructive-foreground font-bold"
                : "bg-muted text-muted-foreground"
                }`}
            >
              {activeAlerts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("historico")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${viewMode === "historico"
              ? "bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <History className="h-3 w-3" />
            <span>Histórico</span>
            <span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
              {historyAlerts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
            title="Registrar nova ocorrência ou anomalia operacional"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Alerta</span>
          </button>
        </div>
      </div>

      {/* Cenário 1: Aba "Alertas do dia" vazia */}
      {viewMode === "ativos" && activeAlerts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-4 ring-emerald-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Nenhum alerta crítico no dia de hoje
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Todas as estações e microterritórios do Recife estão operando dentro dos limiares térmicos toleráveis da Defesa Civil.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setViewMode("historico")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/40 transition-all cursor-pointer shadow-xs"
            >
              <History className="h-3.5 w-3.5 text-primary" />
              <span>Ver Histórico de Alertas ({historyAlerts.length})</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Registrar Alerta</span>
            </button>
          </div>
        </div>
      ) : viewMode === "historico" && historyAlerts.length === 0 ? (
        /* Cenário 2: Histórico vazio */
        <div className="rounded-xl border border-dashed border-border/80 bg-card/30 p-6 flex flex-col items-center justify-center text-center space-y-2">
          <History className="h-7 w-7 text-muted-foreground opacity-60" />
          <h4 className="text-sm font-semibold text-foreground">Histórico Vazio</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Nenhum alerta foi despachado ou arquivado nas últimas 24 horas.
          </p>
          <button
            onClick={() => setViewMode("ativos")}
            className="mt-2 text-xs text-primary font-semibold hover:underline cursor-pointer"
          >
            ← Voltar para Alertas do Dia
          </button>
        </div>
      ) : (
        /* Cenário 3: Exibição da lista de alertas (Alertas do Dia ou Histórico) */
        <>
          {/* Barra de contexto informativa */}
          <div className="mb-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {viewMode === "ativos"
                ? `Exibindo ${filteredAlerts.length} ocorrência(s) do dia em aberto:`
                : `Exibindo ${filteredAlerts.length} alerta(s) despachado(s) e arquivado(s):`}
            </span>
            {viewMode === "historico" && (
              <button
                onClick={() => setViewMode("ativos")}
                className="text-primary hover:underline font-mono text-[10px]"
              >
                ← Voltar para Alertas do Dia
              </button>
            )}
          </div>

          {/* Filtros táteis por severidade */}
          <div className="mb-3.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-card/40 p-1">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
                    ? tab.activeClass
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-transform ${tab.dotClass} ${isActive ? "scale-110 shadow-[0_0_8px_currentColor]" : "opacity-60 group-hover:opacity-100"
                      }`}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${isActive
                      ? "bg-foreground/10 text-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className={`space-y-3 ${expandedView ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 space-y-0" : ""}`}>
            {filteredAlerts.map((a) => {
              const s = levelStyles[a.level];
              const bottomCoverage = a.level === "critico" ? "100%" : a.level === "alto" ? "60%" : "30%";

              return (
                <li
                  key={a.id}
                  className="relative overflow-hidden rounded-lg border border-border/80 bg-card/60 p-3.5 flex flex-col justify-between transition-all hover:bg-card hover:border-border shadow-xs"
                >
                  {/* Contorno lateral esquerdo estilizado */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3.5px] rounded-tl-lg"
                    style={{ backgroundColor: s.color }}
                  />

                  {/* Contorno inferior proporcional à gravidade */}
                  <span
                    className="absolute left-0 bottom-0 h-[3.5px] rounded-bl-lg transition-all duration-300"
                    style={{
                      width: bottomCoverage,
                      backgroundColor: s.color,
                      boxShadow:
                        a.level === "critico"
                          ? `0 2px 8px color-mix(in oklab, ${s.color} 50%, transparent)`
                          : "none",
                    }}
                  />

                  {/* Brilho sutil na quina inferior esquerda */}
                  <span
                    className="absolute left-0 bottom-0 h-8 w-8 rounded-bl-lg pointer-events-none opacity-20 blur-md"
                    style={{ backgroundColor: s.color }}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider font-bold" style={{ color: s.color }}>
                        {s.label}
                      </span>
                      <span className="text-xs text-muted-foreground">· {a.zone}</span>
                      <span
                        className="ml-auto font-mono text-[10px] text-muted-foreground flex items-center gap-1"
                        title={`Carimbo de detecção: ${a.date || "Hoje"} às ${a.time}`}
                      >
                        <Clock className="h-2.5 w-2.5 opacity-70" />
                        {a.date ? `${a.date} · ` : ""}{a.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{a.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>

                    {/* Exibição da temperatura no disparo vs atual e alerta de virada de tempo */}
                    {(a.recordedTemp || a.conditionShift) && (
                      <div className="mt-2.5 space-y-1.5 rounded-md bg-secondary/50 p-2 border border-border/50">
                        {a.recordedTemp && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                            <span className="inline-flex items-center gap-1 text-foreground">
                              🌡️ No disparo: <strong className="text-destructive font-bold">{a.recordedTemp}°C</strong>
                              {a.recordedFeels ? ` (sensação ${a.recordedFeels}°C)` : ""}
                            </span>
                            {a.currentTemp !== undefined && (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                · Atual: <strong className="text-foreground">{a.currentTemp}°C</strong>
                              </span>
                            )}
                          </div>
                        )}
                        {a.conditionShift && (
                          <div className="flex items-start gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 p-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <span>{a.conditionShift}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/40">
                    <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      janela {a.eta}
                    </span>

                    {a.notified ? (
                      <span className="ml-auto flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-500">
                        <CheckCheck className="h-3 w-3" />
                        Despachado
                      </span>
                    ) : (
                      <button
                        onClick={() => onDispatchAlert(a.id)}
                        className="ml-auto rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
                      >
                        Disparar notificação
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

function ZoneDetail({
  zone,
  onOpenComparison,
  onOpenVegetalView,
  onOpenVulnView,
  onOpenNasaPower,
  onOpenEnvironmentalAnalysis,
}: {
  zone: Zone;
  onOpenComparison?: () => void;
  onOpenVegetalView?: () => void;
  onOpenVulnView?: () => void;
  onOpenNasaPower?: () => void;
  onOpenEnvironmentalAnalysis?: () => void;
}) {
  const [showRatingScale, setShowRatingScale] = useState(false);

  const ratingInfo = ratingDefinitions[zone.rating];
  const organRec = zoneOrganRecommendations[zone.id] || {
    organ: "Defesa Civil",
    urgency: "Alta",
    action: "Monitoramento contínuo e contingência de calor",
    description: "Acompanhamento em campo e prevenção de estresse térmico para pedestres.",
  };

  const rows = [
    { label: "Temperatura", value: `${zone.temp.toFixed(1)} °C` },
    { label: "Sensação térmica", value: `${zone.feels.toFixed(1)} °C` },
    { label: "Umidade relativa", value: `${zone.humidity}%` },
    { label: "Cobertura vegetal", value: `${zone.canopy}%` },
    { label: "Vulnerabilidade social", value: `${zone.vuln}/100` },
  ];

  return (
    <section className="panel p-4" data-tour="zone-detail">
      {/* Cabeçalho do Bairro Selecionado com Classificação em Destaque */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">{zone.name}</h2>
          <p className="font-mono text-[11px] text-muted-foreground">Microterritório selecionado no mapa</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold"
              style={{
                background: `color-mix(in oklab, ${ratingInfo.color} 18%, transparent)`,
                color: ratingInfo.color,
              }}
            >
              Classe {zone.rating} · {ratingInfo.name}
            </span>
          </div>
        </div>

        {/* Badge Visual da Classificação + Significado abaixo do E */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-2xl font-bold shadow-sm"
            style={{
              background: `color-mix(in oklab, ${ratingInfo.color} 22%, transparent)`,
              color: ratingInfo.color,
              border: `1.5px solid color-mix(in oklab, ${ratingInfo.color} 40%, transparent)`,
            }}
            title={`Classificação ${zone.rating}: ${ratingInfo.name}`}
          >
            {zone.rating}
          </div>
          <button
            onClick={() => setShowRatingScale((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer group notranslate"
            translate="no"
            title="Significado das classificações (A a E)"
          >
            <Info className="h-3.5 w-3.5 text-primary group-hover:text-primary shrink-0" />
            <span className="font-medium underline-offset-2 group-hover:underline notranslate" translate="no">
              significado
            </span>
            {showRatingScale ? <ChevronUp className="h-2.5 w-2.5 shrink-0" /> : <ChevronDown className="h-2.5 w-2.5 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Matriz Completa das Classificações A-E (visível ao expandir) */}
      {showRatingScale && (
        <div className="mt-2.5 mb-1 space-y-1.5 rounded-lg border border-border/80 bg-background/80 p-2.5 text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5 text-[10px] font-mono text-muted-foreground uppercase">
            <span>Classificação de Risco Térmico</span>
            <span>Sensação & Vegetação</span>
          </div>
          {(["A", "B", "C", "D", "E"] as const).map((r) => {
            const def = ratingDefinitions[r];
            const isCurrent = r === zone.rating;
            return (
              <div
                key={r}
                className={`flex items-start gap-2.5 rounded-md p-1.5 transition-colors ${isCurrent
                  ? "bg-primary/15 border border-primary/40 font-medium"
                  : "hover:bg-muted/40"
                  }`}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-display text-xs font-bold"
                  style={{
                    background: `color-mix(in oklab, ${def.color} 25%, transparent)`,
                    color: def.color,
                  }}
                >
                  {r}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground">{def.name}</span>
                    {isCurrent && (
                      <span className="rounded bg-primary px-1.5 py-0.2 text-[9px] font-mono font-bold text-primary-foreground">
                        Bairro atual
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                    {def.fullDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabela de Indicadores */}
      <dl className="mt-3 divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-1.5 text-sm">
            <dt className="text-muted-foreground text-xs">{r.label}</dt>
            <dd className="font-mono text-xs font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>

      {/* ÁREA DE RECOMENDAÇÃO OPERACIONAL PARA ÓRGÃO PÚBLICO EM ALTO DESTAQUE */}
      <div className="mt-4 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-card p-3.5 shadow-md relative">
        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                Recomendação Operacional
              </span>
              <span className="text-xs font-bold text-foreground">
                {organRec.organ}
              </span>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${organRec.urgency === "Imediata"
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : organRec.urgency === "Alta"
                ? "bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/40"
                : "bg-primary/20 text-primary"
              }`}
          >
            {organRec.urgency === "Imediata" ? "Despacho Imediato" : organRec.urgency}
          </span>
        </div>

        <div className="mt-2.5 space-y-1">
          <p className="text-xs font-semibold text-foreground leading-snug">
            {organRec.action}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {organRec.description}
          </p>
        </div>
      </div>

      {/* Ações de atalho direto para Cobertura Vegetal e Vulnerabilidade do Bairro */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        {onOpenVegetalView && (
          <button
            id="zone-detail-vegetal-btn"
            onClick={onOpenVegetalView}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-canopy/40 bg-canopy/10 py-2 px-2 text-xs font-semibold text-canopy hover:bg-canopy/20 transition-all cursor-pointer shadow-xs"
            title={`Abrir Cobertura Vegetal e Simulador para ${zone.name}`}
          >
            <Trees className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Cobertura vegetal</span>
          </button>
        )}
        {onOpenVulnView && (
          <button
            id="zone-detail-vuln-btn"
            onClick={onOpenVulnView}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 py-2 px-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer shadow-xs"
            title={`Abrir Vulnerabilidade e Saúde para ${zone.name}`}
          >
            <HeartPulse className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Vulnerabilidade</span>
          </button>
        )}
      </div>

      {/* Ações Avançadas: Clima NASA POWER e Análise Ambiental */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {onOpenNasaPower && (
          <button
            id="zone-detail-nasa-btn"
            onClick={onOpenNasaPower}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 py-1.5 px-2 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer shadow-xs"
            title={`Consultar dados climáticos da NASA POWER para ${zone.name}`}
          >
            <CloudRain className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Clima NASA</span>
          </button>
        )}
        {onOpenEnvironmentalAnalysis && (
          <button
            id="zone-detail-env-btn"
            onClick={onOpenEnvironmentalAnalysis}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 py-1.5 px-2 text-xs font-medium text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-xs"
            title={`Ver Análise Ambiental MapBiomas / Landsat`}
          >
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">MapBiomas</span>
          </button>
        )}
      </div>

      {/* Ação de atalho para comparação de bairros (Épico 1) */}
      {onOpenComparison && (
        <button
          onClick={onOpenComparison}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>Comparar este bairro com outro</span>
        </button>
      )}
    </section>
  );
}

function HistoryPanel({
  zone,
  onOpenComparison,
}: {
  zone: Zone;
  onOpenComparison?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const data = zoneHistory(zone);
  const temps = data.map((d) => d.t);
  const maxVal = Math.max(...temps);
  const minVal = Math.min(...temps);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  const trend = temps[temps.length - 1]! - temps[0]!;

  // Tom laranja de destaque idêntico ao texto "MÁXIMA 35,6 °C" do rodapé
  const orangeTone = "#f97316";

  // Minigráfico (sparkline) minimalista conectando as temperaturas de 18/08 a 24/08
  // 7 colunas de largura 50px no viewBox de 350px de largura
  // O centro de cada coluna i (0 a 6) é (i + 0.5) * 50
  const colWidth = 50;
  const chartPoints = data.map((d, i) => {
    const x = (i + 0.5) * colWidth;
    // Escala vertical: y de 14 (pico máximo) a 46 (mínimo)
    const range = maxVal - minVal || 1;
    const y = 14 + ((maxVal - d.t) / range) * 32;
    // O dia de pico no mockup é o 22/08 (ou valor máximo)
    const isPeak = d.day === "22/08" || d.t === maxVal;
    return { ...d, x, y, isPeak };
  });

  const polylinePoints = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <section className="panel p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Histórico de temperatura</h2>
            <p className="font-mono text-[11px] text-muted-foreground">
              {zone.name} · máximas dos últimos 7 dias
            </p>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            {open ? "Ocultar" : "Ver histórico"}
          </button>
        </div>

        {open && (
          <div className="mt-4 flex flex-col justify-between flex-1">
            {/* Parte 1: Minigráfico (sparkline) minimalista sem eixos ou grades extras */}
            <div>
              <div className="relative w-full h-16 pt-1">
                <svg
                  viewBox="0 0 350 60"
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Gradiente suave sob a linha */}
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Área sutil abaixo da curva */}
                  <polygon
                    points={`25,58 ${polylinePoints} 325,58`}
                    fill="url(#sparklineGrad)"
                    className="text-foreground"
                  />

                  {/* Linha temporal conectando as temperaturas de 18/08 a 24/08 */}
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground/40"
                  />

                  {/* Marcadores sutis em cada vértice */}
                  {chartPoints.map((p) => {
                    if (p.isPeak) {
                      return (
                        <g key={p.day}>
                          {/* Halo pulsante sutil no pico */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="11"
                            fill={orangeTone}
                            opacity="0.22"
                            className="animate-pulse"
                          />
                          {/* Ponto destacado em laranja com raio maior */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5.5"
                            fill={orangeTone}
                            stroke="var(--card)"
                            strokeWidth="1.8"
                            className="drop-shadow-sm"
                          />
                        </g>
                      );
                    }
                    return (
                      <circle
                        key={p.day}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="currentColor"
                        className="text-foreground/45"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Eixo X nativo e rótulos de dados perfeitamente alinhados */}
              <div className="grid grid-cols-7 gap-1 text-center pt-2">
                {chartPoints.map((p) => (
                  <div
                    key={p.day}
                    className={`flex flex-col items-center py-1 px-0.5 rounded-md transition-all ${p.isPeak
                      ? "bg-orange-500/10 ring-1 ring-orange-500/30 font-semibold"
                      : "hover:bg-muted/30"
                      }`}
                  >
                    <span
                      className="font-mono text-xs leading-none"
                      style={{ color: p.isPeak ? orangeTone : "var(--foreground)" }}
                    >
                      {p.t.toFixed(1)}°
                    </span>
                    <span
                      className="font-mono text-[10px] mt-1 leading-none"
                      style={{ color: p.isPeak ? orangeTone : "var(--muted-foreground)" }}
                    >
                      {p.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parte 2: Rodapé com Média, Máxima em tom laranja idêntico ao pico e Tendência */}
            <div className="mt-4 mb-2 grid grid-cols-3 gap-2 border-t border-border/60 py-3.5 text-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Média</p>
                <p className="font-display text-sm font-semibold">{avg.toFixed(1)} °C</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Máxima</p>
                <p className="font-display text-sm font-semibold" style={{ color: orangeTone }}>
                  MÁXIMA {maxVal.toFixed(1)} °C
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tendência</p>
                <p className="font-display text-sm font-semibold">
                  {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)} °C
                </p>
              </div>
            </div>

            {/* Parte 3: Atalho para o Módulo de Comparação & Histórico Avançado (Épico 1) */}
            {onOpenComparison && (
              <div className="mt-auto pt-4 pb-2 border-t border-border/50 flex flex-col items-center justify-center gap-3 text-center">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary shadow-xs ring-1 ring-primary/30"
                  title="Análise comparativa"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </span>
                <button
                  onClick={onOpenComparison}
                  className="rounded-full border border-primary px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-all cursor-pointer shadow-xs"
                >
                  Abrir análise comparativa de 7 dias
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RatingPanel({
  selected,
  onSelect,
  zonesList,
}: {
  selected: Zone;
  onSelect: (z: Zone) => void;
  zonesList?: Zone[];
}) {
  const sorted = [...(zonesList || zones)].sort((a, b) => b.feels - a.feels);
  return (
    <section className="panel p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Índice Térmico por bairro</h2>
          <span className="font-mono text-[10px] text-muted-foreground">Sensação máx.</span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          Classificação de estresse térmico de A a E
        </p>
        <ul className="mt-3 space-y-1">
          {sorted.map((z) => {
            const rColor = ratingDefinitions[z.rating]?.color || heatVar(z.temp);
            return (
              <li key={z.id}>
                <button
                  onClick={() => onSelect(z)}
                  className={
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors " +
                    (z.id === selected.id ? "bg-secondary" : "hover:bg-secondary/60")
                  }
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: rColor }} />
                  <span className="text-sm">{z.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {z.feels.toFixed(1).replace(".", ",")}°
                  </span>
                  <span className="w-5 text-center font-display text-sm font-semibold" style={{ color: rColor }}>
                    {z.rating}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function InsightsPanel() {
  const insights = [
    {
      id: "dossel-protetor",
      tag: "Eficiência Arbórea",
      badgeClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      title: "Disparidade de 13,2 °C entre Bairros",
      desc: "A cobertura de copa em Dois Irmãos (64%) arrefece o microclima em 13,2 °C em relação ao solo impermeabilizado de Santo Amaro.",
      metric: "-2,1 °C a cada +10% de árvores",
    },
    {
      id: "janela-critica",
      tag: "Sobrecarga Humana",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      title: "Pico de Exposição: 13h00 às 16h30",
      desc: "Cruzamento de radiação e baixa umidade relativa (58%) gera risco crítico de desidratação e estresse cardiovascular em pedestres expostos.",
      metric: "318 mil cidadãos expostos",
    },
  ];

  return (
    <section className="panel p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 border-b border-border/60 pb-2.5 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold">Insights</h2>
        </div>

        <ul className="space-y-2.5">
          {insights.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border/70 bg-card/60 p-2.5 transition-all hover:bg-card hover:border-primary/40 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`rounded border px-1.5 py-0.2 font-mono text-[9px] font-semibold uppercase tracking-wider ${item.badgeClass}`}
                >
                  {item.tag}
                </span>
                <span className="font-mono text-[10px] font-bold text-foreground">
                  {item.metric}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground leading-snug">
                {item.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}