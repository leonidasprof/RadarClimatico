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
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { ReportsModal } from "@/components/dashboard/ReportsModal";
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
  Minus,
  Crosshair,
  Maximize2,
  Minimize2,
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
  Thermometer,
  Flame,
  Users,
  Check,
  Truck,
  Droplets,
  CalendarRange,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar Climático Recife | Monitoramento de Ilhas de Calor e Alertas B2G — Arboris" },
      {
        name: "description",
        content:
          "Dashboard Arboris para gestores públicos: mapa de ilhas de calor, alertas antecipados de ondas de calor e priorização de infraestrutura verde no Recife.",
      },
      { property: "og:title", content: "Radar Climático Recife | Monitoramento de Ilhas de Calor e Alertas B2G — Arboris" },
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
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="min-h-screen flex bg-background text-foreground transition-colors">
        {/* 1. SIDEBAR LATERAL ESQUERDA (Desktop fixo / Mobile drawer) */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === "tempo-real") setMapLayer("calor");
          }}
          isDark={isDark}
          currentTime={weatherSnapshot?.fetchedAt || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          weatherSnapshot={weatherSnapshot}
          alertsCount={alertsList.filter((a) => !a.notified).length}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenReports={() => setReportsModalOpen(true)}
        />

        {/* 2. ÁREA DE CONTEÚDO PRINCIPAL À DIREITA */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            onOpenContactModal={() => setContactModalOpen(true)}
            weatherSnapshot={weatherSnapshot}
            isSyncingWeather={isSyncingWeather}
            onSyncWeather={() => syncWeather(false)}
            zonesList={currentZones}
            onSelectZone={setSelected}
            onOpenAlerts={() => setActiveTab("alertas")}
          />

          <main id="main-content" role="main" aria-label="Painel operacional do Radar Climático do Recife" className="p-3.5 sm:p-5 lg:p-6 space-y-4 max-w-[1600px] w-full mx-auto pb-14">
            {/* Visualização Padrão: Operação em Tempo Real (Mapa Térmico & Camadas) */}
            {activeTab === "tempo-real" && (
              <>
                {mapLayer === "calor" && (
                  <div className="space-y-4">
                    {/* Linha 1 de Indicadores Macro (KPIs) com Ícones e Sensação Térmica */}
                    <Kpis weather={weatherSnapshot} />

                    {/* Linha 2: Grid Principal 8 Colunas (Mapa + Bloco de Dados) x 4 Colunas (Painel Operacional) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                      <div className="lg:col-span-8 flex flex-col gap-4">
                        <MapPanel
                          selected={selected}
                          onSelect={setSelected}
                          zonesList={currentZones}
                          onOpenGreenDashboard={() => setActiveTab("verde")}
                          activeLayer={mapLayer}
                          onChangeLayer={setMapLayer}
                        />

                        {/* Bloco Alinhado Abaixo do Mapa: Índice Térmico (Tabela) e Histórico de Temperatura (Gráfico Duplo) */}
                        <div className="grid gap-4 md:grid-cols-2 flex-1">
                          <ThermalIndexTable
                            zonesList={currentZones}
                            onSelect={setSelected}
                            selected={selected}
                            onViewAll={() => setActiveTab("indice")}
                          />
                          <TemperatureHistoryCard
                            zone={selected}
                            onOpenComparison={() => setActiveTab("historico")}
                          />
                        </div>
                      </div>

                      <aside className="lg:col-span-4 flex flex-col gap-4">
                        <AlertsPanel
                          alerts={alertsList}
                          onOpenReportModal={() => setReportModalOpen(true)}
                          onDispatchAlert={handleDispatchAlert}
                        />
                        <div className="flex-1 flex flex-col min-h-0">
                          <ZoneDetail
                            zone={selected}
                            onOpenComparison={() => setActiveTab("historico")}
                            onOpenVegetalView={() => setMapLayer("vegetal")}
                            onOpenVulnView={() => setMapLayer("vulnerabilidade")}
                            onOpenNasaPower={() => setActiveTab("clima-nasa")}
                            onOpenEnvironmentalAnalysis={() => setActiveTab("analise-ambiental")}
                          />
                        </div>
                      </aside>
                    </div>

                    {/* Bloco Insights na horizontal iniciando abaixo do índice térmico até o final da página */}
                    <div className="w-full">
                      <InsightsPanel />
                    </div>
                  </div>
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
        <footer role="contentinfo" aria-label="Rodapé institucional da plataforma Radar Climático Arboris" className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground bg-card/20">
          <div className="mx-auto max-w-4xl px-4 flex flex-col items-center gap-4">
            <img
              src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
              alt="Logotipo Arboris — Plataforma Integrada de Monitoramento de Ilhas de Calor e Clima Urbano no Recife"
              width={180} height={64} loading="lazy" decoding="async" className="h-16 object-contain"
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
        <ReportsModal
          open={reportsModalOpen}
          onOpenChange={setReportsModalOpen}
        />
        <ClimaTourOverlay />
      </div>
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

function Kpis({ weather }: { weather?: RealtimeWeatherSnapshot | null }) {
  const avgTemp = weather?.cityAverageTemp
    ? weather.cityAverageTemp.toFixed(1).replace(".", ",")
    : "28,7";

  const avgFeels = weather?.cityAverageFeels
    ? weather.cityAverageFeels.toFixed(1).replace(".", ",")
    : (weather?.cityAverageTemp ? (weather.cityAverageTemp + 4.1).toFixed(1).replace(".", ",") : "32,8");

  const maxTempNum = weather?.cityMaxTemp !== undefined
    ? weather.cityMaxTemp
    : (weather?.cityAverageTemp ? Number((weather.cityAverageTemp + 2.4).toFixed(1)) : 33.2);

  const maxTempFormatted = maxTempNum.toFixed(1).replace(".", ",");
  const maxTempZone = weather?.cityMaxTempZone || "Santo Amaro";
  const maxTempHour = weather?.cityMaxTempHour ? ` (${weather.cityMaxTempHour})` : " (12h)";

  const isHighTemp = maxTempNum >= 32.0;
  const tempStatus = isHighTemp ? "Pico registrado hoje" : "Máxima até o momento";

  const critCount = weather?.criticalZonesCount !== undefined ? String(weather.criticalZonesCount) : "0";
  const totalCount = weather?.zones.length || 8;

  return (
    <section aria-label="Indicadores chave de desempenho térmico e vulnerabilidade do Recife" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-tour="kpi-macro">
      {/* 1. Temperatura Média e Sensação Térmica da Cidade */}
      <div className="panel p-4 flex flex-col justify-between min-h-[124px] transition-all hover:border-amber-500/40 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Temperatura média da cidade</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-amber-500">
                {avgTemp}
              </span>
              <span className="text-sm font-normal text-muted-foreground">°C</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="h-2.5 w-2.5" />
                -1,2°C
              </span>
            </div>
            {/* Sensação Térmica em Destaque Integrado */}
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-muted-foreground font-mono">Sensação:</span>
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {avgFeels} °C
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-500 shrink-0 shadow-xs">
              <Thermometer className="h-5 w-5" />
            </div>
            {/* Sparkline Sutil Âmbar */}
            <svg viewBox="0 0 50 16" className="w-14 h-4 overflow-visible">
              <path
                d="M 2 12 Q 14 4, 25 9 T 48 4"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 font-mono text-[10px] text-muted-foreground flex items-center justify-between">
          <span>On line · Open-Meteo API</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">apparent_temp</span>
        </div>
      </div>

      {/* 2. Maior Temperatura do Dia */}
      <div className="panel p-4 flex flex-col justify-between min-h-[124px] transition-all hover:border-rose-500/40 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Maior temperatura do dia</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold tracking-tight text-rose-500">
                {maxTempFormatted}
              </span>
              <span className="text-sm font-normal text-muted-foreground">°C</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              {tempStatus}
            </p>
            <p className="text-xs font-bold text-foreground">
              {maxTempZone}{maxTempHour}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-500 shrink-0 shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
            {/* Sparkline Vermelha */}
            <svg viewBox="0 0 50 16" className="w-14 h-4 overflow-visible">
              <path
                d="M 2 14 Q 15 12, 28 6 T 48 3"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 font-mono text-[10px] text-muted-foreground">
          <span>Estação Termométrica Urbana</span>
        </div>
      </div>

      {/* 3. Zonas em Criticidade */}
      <div className="panel p-4 flex flex-col justify-between min-h-[124px] transition-all hover:border-slate-500/40 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Zonas em criticidade</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold tracking-tight text-foreground">
                {critCount}
              </span>
              <span className="text-sm font-normal text-muted-foreground">de {totalCount}</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              Monitoramento contínuo
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/15 border border-slate-500/25 text-slate-400 dark:text-slate-300 shrink-0 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            {/* Mini gráfico de barras */}
            <div className="flex items-end gap-1 h-4">
              <span className="w-1.5 h-2 bg-slate-400/40 rounded-xs" />
              <span className="w-1.5 h-3 bg-slate-400/60 rounded-xs" />
              <span className="w-1.5 h-4 bg-primary/70 rounded-xs" />
              <span className="w-1.5 h-2.5 bg-slate-400/50 rounded-xs" />
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 font-mono text-[10px] text-muted-foreground">
          <span>Classes de Severidade D e E</span>
        </div>
      </div>

      {/* 4. População Exposta */}
      <div className="panel p-4 flex flex-col justify-between min-h-[124px] transition-all hover:border-cyan-500/40 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">População exposta</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
                318
              </span>
              <span className="text-sm font-normal text-muted-foreground">mil</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400">
                ↑ +12%
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              62% em alta vulnerabilidade
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-500 shrink-0 shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            {/* Indicador de densidade */}
            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-cyan-500 w-[62%]" />
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 font-mono text-[10px] text-muted-foreground">
          <span>Cruzamento Censo IBGE 2022</span>
        </div>
      </div>
    </section>
  );
}

function ThermalIndexTable({
  zonesList,
  selected,
  onSelect,
  onViewAll,
}: {
  zonesList: Zone[];
  selected: Zone;
  onSelect: (z: Zone) => void;
  onViewAll?: () => void;
}) {
  const sorted = [...zonesList].sort((a, b) => b.temp - a.temp);

  return (
    <section className="panel p-4 sm:p-5 flex flex-col justify-between h-full shadow-xs" data-tour="thermal-index">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Índice Térmico por bairro</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Classificação de calor e sensação térmica</p>
            </div>
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todos</span>
                <span>→</span>
              </button>
            )}
          </div>

          <div className="mt-2 overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[10px] font-mono uppercase text-muted-foreground">
                  <th className="py-2 px-2 font-normal">#</th>
                  <th className="py-2 px-2 font-normal">Bairro</th>
                  <th className="py-2 px-2 font-normal text-right">Temp. (°C)</th>
                  <th className="py-2 px-2 font-normal text-right">Sensação (°C)</th>
                  <th className="py-2 px-2 font-normal text-center">Classe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {sorted.map((z, idx) => {
                  const isSelected = z.id === selected.id;
                  const rColor = ratingDefinitions[z.rating]?.color || heatVar(z.temp);
                  return (
                    <tr
                      key={z.id}
                      onClick={() => onSelect(z)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-secondary/90 font-bold"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <td className="py-2.5 sm:py-3 px-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2.5 sm:py-3 px-2 font-sans font-medium text-foreground">
                        {z.name}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 text-right">{z.temp.toFixed(1).replace(".", ",")}</td>
                      <td className="py-2.5 sm:py-3 px-2 text-right text-muted-foreground">
                        {z.feels.toFixed(1).replace(".", ",")}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 text-center">
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-md font-display text-[11px] font-bold shadow-xs mx-auto"
                          style={{
                            background: `color-mix(in oklab, ${rColor} 20%, transparent)`,
                            color: rColor,
                            border: `1px solid color-mix(in oklab, ${rColor} 45%, transparent)`,
                          }}
                        >
                          {z.rating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé informativo preenchendo a base do bloco de forma harmoniosa */}
        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>{sorted.length} territórios monitorados</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Pico: <strong className="text-destructive font-bold">{sorted[0]?.name} ({sorted[0]?.temp.toFixed(1).replace(".", ",")} °C)</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

function TemperatureHistoryCard({
  zone,
  onOpenComparison,
}: {
  zone: Zone;
  onOpenComparison?: () => void;
}) {
  // Gera dados dos últimos 7 dias para a zona selecionada
  const historyData = [
    { date: "18/06", temp: Number((zone.temp - 1.8).toFixed(1)), feels: Number((zone.feels - 2.2).toFixed(1)) },
    { date: "19/06", temp: Number((zone.temp - 0.9).toFixed(1)), feels: Number((zone.feels - 1.1).toFixed(1)) },
    { date: "20/06", temp: Number((zone.temp - 1.4).toFixed(1)), feels: Number((zone.feels - 1.6).toFixed(1)) },
    { date: "21/06", temp: Number((zone.temp - 0.4).toFixed(1)), feels: Number((zone.feels - 0.5).toFixed(1)) },
    { date: "22/06", temp: Number((zone.temp + 1.2).toFixed(1)), feels: Number((zone.feels + 1.8).toFixed(1)), isPeak: true },
    { date: "23/06", temp: Number((zone.temp - 0.2).toFixed(1)), feels: Number((zone.feels - 0.3).toFixed(1)) },
    { date: "24/06", temp: Number(zone.temp.toFixed(1)), feels: Number(zone.feels.toFixed(1)) },
  ];

  const temps = historyData.map((d) => d.temp);
  const minVal = 24;
  const maxVal = 40;
  const range = maxVal - minVal;

  const pointsTemp = historyData
    .map((d, i) => {
      const x = (i / (historyData.length - 1)) * 100;
      const y = 100 - ((d.temp - minVal) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const pointsFeels = historyData
    .map((d, i) => {
      const x = (i / (historyData.length - 1)) * 100;
      const y = 100 - ((d.feels - minVal) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const avgTemp = Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));
  const maxTemp = Math.max(...temps);
  const peakItem = historyData.find((d) => d.isPeak) || historyData[4];

  return (
    <section className="panel p-4 sm:p-5 flex flex-col justify-between h-full shadow-xs" data-tour="history-card">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Cabeçalho limpo sem badge isolado */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                Histórico de temperatura — {zone.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Série temporal recente com curva de sensação térmica real
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-xs" />
                <span>Temperatura</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-xs" />
                <span>Sensação</span>
              </span>
            </div>
          </div>

          {/* Gráfico de Linhas Duplo com Grid Cartesiana expandido */}
          <div className="relative mt-4 h-48 sm:h-56 w-full">
            {/* Linhas de grade horizontal */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-foreground w-full" />
              <div className="border-b border-foreground w-full" />
              <div className="border-b border-foreground w-full" />
              <div className="border-b border-foreground w-full" />
            </div>

            {/* Marcadores do Eixo Y */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between font-mono text-[9px] text-muted-foreground pointer-events-none pr-1">
              <span>40°</span>
              <span>35°</span>
              <span>30°</span>
              <span>25°</span>
            </div>

            {/* SVG com curvas */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full pl-6 overflow-visible"
            >
              {/* Curva Sensação Térmica (Cyan) */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsFeels}
                className="drop-shadow-xs"
              />

              {/* Curva Temperatura (Amber/Orange) */}
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsTemp}
                className="drop-shadow-xs"
              />

              {/* Pontos da curva */}
              {historyData.map((d, i) => {
                const x = (i / (historyData.length - 1)) * 100;
                const yT = 100 - ((d.temp - minVal) / range) * 100;
                const yF = 100 - ((d.feels - minVal) / range) * 100;
                return (
                  <g key={i}>
                    <circle cx={x} cy={yF} r="2.2" fill="#06b6d4" className="stroke-background stroke-1" />
                    <circle cx={x} cy={yT} r="2.2" fill="#f97316" className="stroke-background stroke-1" />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip destacado no dia de pico */}
            {peakItem && (
              <div
                className="absolute -top-1 rounded-md bg-card/95 border border-border px-2 py-0.5 text-[10px] font-mono shadow-md backdrop-blur-xs pointer-events-none transform -translate-x-1/2"
                style={{ left: "68%" }}
              >
                <span className="font-bold text-amber-500">{peakItem.temp}°C</span>
                <span className="text-muted-foreground ml-1">({peakItem.date})</span>
              </div>
            )}
          </div>

          {/* Eixo X com as datas */}
          <div className="grid grid-cols-7 gap-1 text-center pl-6 pt-2 font-mono text-[10px] text-muted-foreground">
            {historyData.map((d, idx) => (
              <span key={idx} className={d.isPeak ? "font-bold text-amber-500" : ""}>
                {d.date}
              </span>
            ))}
          </div>
        </div>

        {/* Faixa inferior de resumo consolidado com bom espaçamento */}
        <div className="my-3 grid grid-cols-4 gap-2 border-y border-border/60 py-3 text-center font-mono bg-muted/20 rounded-xl">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Média</p>
            <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">{avgTemp.toFixed(1).replace(".", ",")} °C</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Máxima</p>
            <p className="text-xs sm:text-sm font-bold text-rose-500 mt-0.5">{maxTemp.toFixed(1).replace(".", ",")} °C</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Variação</p>
            <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">↑ 2,3 °C</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Tendência</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Estável</p>
          </div>
        </div>

        {/* Botão de consulta por período (7, 14 ou 30 dias) perfeitamente posicionado na base */}
        {onOpenComparison && (
          <div className="mt-auto pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onOpenComparison}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card/80 hover:bg-secondary hover:border-primary/50 py-2.5 px-3 text-xs font-semibold text-primary transition-all cursor-pointer shadow-xs group"
              title="Consultar histórico detalhado por período (7, 14 ou 30 dias) na tela Comparação & Histórico"
            >
              <CalendarRange className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span>Consultar por período (7, 14 ou 30 dias)</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        )}
      </div>
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    bairros: true,
    estacoes: true,
    ilhas: true,
    redeViaria: true,
    hidrografia: true,
  });

  const activeZones = zonesList || zones;

  const toggleLayer = (layerKey: keyof typeof visibleLayers) => {
    setVisibleLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const getZoneColor = (z: Zone) => {
    if (activeLayer === "calor") return ratingDefinitions[z.rating]?.color || heatVar(z.temp);
    if (activeLayer === "vegetal") return canopyVar(z.canopy);
    return vulnVar(z.vuln);
  };

  return (
    <section
      className={`panel overflow-hidden transition-all duration-300 ${
        isMaximized
          ? "fixed inset-4 z-50 shadow-2xl bg-background flex flex-col"
          : "relative"
      }`}
      data-tour="map-panel"
    >
      {/* Top Header of Map */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5 bg-card/40">
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">
            Mapa térmico real
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-normal leading-tight">
            {activeLayer === "calor" && "Anomalias de calor e ilhas térmicas"}
            {activeLayer === "vegetal" && "Copas arbóreas e refúgios térmicos"}
            {activeLayer === "vulnerabilidade" && "Vulnerabilidade social da população exposta"}
          </p>
        </div>

        {/* Barra homogênea de ferramentas alinhada à direita */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start xl:self-auto">
          {/* Seletor rápido de foco territorial */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs shadow-xs">
            <span className="text-muted-foreground text-[11px] font-medium">Bairro:</span>
            <select
              value={selected.id}
              onChange={(e) => {
                const found = activeZones.find((z) => z.id === e.target.value);
                if (found) onSelect(found);
              }}
              className="bg-transparent text-xs text-foreground font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {activeZones.map((z) => (
                <option key={z.id} value={z.id} className="bg-popover text-popover-foreground">
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lentes / Camadas do mapa com design unificado */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/70 shadow-xs" data-tour="map-layers">
            <button
              type="button"
              onClick={() => onChangeLayer("calor")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                activeLayer === "calor"
                  ? "bg-amber-500 text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Temperatura
            </button>
            <button
              type="button"
              onClick={() => onChangeLayer("vegetal")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                activeLayer === "vegetal"
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cobertura vegetal
            </button>
            <button
              type="button"
              onClick={() => onChangeLayer("vulnerabilidade")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === "vulnerabilidade"
                  ? "bg-rose-500 text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HeartPulse className="h-3 w-3" />
              <span>Vulnerabilidade</span>
            </button>
          </div>

          {/* Botão de maximizar / restaurar */}
          <button
            type="button"
            onClick={() => setIsMaximized((prev) => !prev)}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shadow-xs"
            title={isMaximized ? "Restaurar tamanho normal" : "Maximizar mapa para tela cheia"}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Viewport do Mapa Interativo */}
      <div
        className={`relative overflow-hidden ${
          isMaximized ? "flex-1 min-h-[500px]" : "h-[420px] sm:h-[490px]"
        }`}
      >
        {/* Controles de Zoom Flutuantes no Canto Superior Esquerdo */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1 rounded-lg border border-border/80 bg-card/90 p-1 backdrop-blur-md shadow-md">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            title="Aumentar zoom"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            title="Diminuir zoom"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              const santoAmaro = activeZones.find((z) => z.id === "santo-amaro");
              if (santoAmaro) onSelect(santoAmaro);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            title="Centralizar no Recife"
          >
            <Crosshair className="h-3.5 w-3.5 text-cyan-500" />
          </button>
        </div>

        {/* Card Flutuante de Legenda e Filtros de Camadas no Lado Direito */}
        <div className="absolute top-3.5 right-3.5 z-10 rounded-xl border border-border/80 bg-card/90 p-3 backdrop-blur-md shadow-lg max-w-[210px] text-xs">
          <div className="font-semibold text-[11px] text-foreground mb-2">
            Temperatura de superfície (°C)
          </div>

          {/* Barra Gradiente da Legenda Térmica */}
          <div
            className="h-2.5 w-full rounded-full shadow-inner"
            style={{
              background:
                "linear-gradient(90deg, #06b6d4 0%, #10b981 25%, #eab308 50%, #f97316 75%, #ef4444 100%)",
            }}
          />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground px-0.5">
            <span>28°</span>
            <span>32°</span>
            <span>36°</span>
            <span>40°</span>
            <span>45°</span>
          </div>

          {/* Checkboxes de Camadas Operacionais */}
          <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5 font-sans">
            {[
              { key: "bairros", label: "Bairros" },
              { key: "estacoes", label: "Estações meteorológicas" },
              { key: "ilhas", label: "Ilhas de calor" },
              { key: "redeViaria", label: "Rede viária" },
              { key: "hidrografia", label: "Hidrografia" },
            ].map(({ key, label }) => {
              const checked = visibleLayers[key as keyof typeof visibleLayers];
              return (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLayer(key as keyof typeof visibleLayers)}
                    className="rounded border-border text-cyan-600 focus:ring-0 cursor-pointer h-3.5 w-3.5 rounded-xs"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Rótulo Oceano Atlântico sobre a orla */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none text-[10px] sm:text-xs font-mono tracking-[0.25em] text-cyan-700/35 dark:text-cyan-400/30 uppercase font-semibold text-center leading-loose">
          OCEANO<br />ATLÂNTICO
        </div>

        {/* Escala Gráfica no Canto Inferior */}
        <div className="absolute bottom-3.5 right-28 z-10 font-mono text-[9px] text-muted-foreground/80 flex flex-col items-center pointer-events-none select-none">
          <div className="flex justify-between w-28 text-[9px]">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6 km</span>
          </div>
          <div className="w-28 h-1 border-b-2 border-l-2 border-r-2 border-muted-foreground/60 mt-0.5" />
        </div>

        {/* Canvas de Ruas e Camadas com escala de zoom */}
        <div
          className="absolute inset-0 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
        >
          {visibleLayers.redeViaria && (
            <RecifeStreetMesh className="absolute inset-0 h-full w-full" />
          )}

          {/* Mancha térmica / halos de calor suavizados no mapa */}
          {visibleLayers.ilhas && (
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <radialGradient id="heatHaloCentral" cx="47%" cy="38%" r="32%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
                  <stop offset="35%" stopColor="#f97316" stopOpacity="0.42" />
                  <stop offset="65%" stopColor="#eab308" stopOpacity="0.25" />
                  <stop offset="90%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatHaloSouth" cx="62%" cy="78%" r="20%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatHaloWest" cx="24%" cy="28%" r="20%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="47" cy="38" r="32" fill="url(#heatHaloCentral)" />
              <circle cx="62" cy="78" r="20" fill="url(#heatHaloSouth)" />
              <circle cx="24" cy="28" r="20" fill="url(#heatHaloWest)" />
            </svg>
          )}

          {/* Pinos de monitoramento nos bairros com anel concêntrico de destaque */}
          {visibleLayers.bairros &&
            activeZones.map((z) => {
              const active = z.id === selected.id;
              const color = getZoneColor(z);
              const isPeak = z.id === "santo-amaro" || z.temp >= 36;

              return (
                <div
                  key={z.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{ left: `${z.x}%`, top: `${z.y}%` }}
                >
                  {/* Círculo concêntrico pulsante para bairros críticos ou selecionado */}
                  {(active || isPeak) && (
                    <>
                      <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full border border-rose-500/50 animate-ping pointer-events-none"
                      />
                      <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-rose-500/60 pointer-events-none"
                      />
                    </>
                  )}

                  {/* Marcador em Botão com Tag e Temperatura */}
                  <button
                    onClick={() => onSelect(z)}
                    className={`group relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-md transition-all duration-150 cursor-pointer ${
                      active
                        ? "bg-slate-900 text-white ring-2 ring-rose-500 scale-105 shadow-xl"
                        : "bg-slate-900/85 text-white/90 hover:bg-slate-900 hover:scale-105 backdrop-blur-xs border border-white/20"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-sans font-medium text-[11px] whitespace-nowrap text-white">
                      {z.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      {z.temp.toFixed(1).replace(".", ",")}°
                    </span>
                  </button>
                </div>
              );
            })}
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
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-card/60 border border-border/70 shadow-xs min-w-0">
          <button
            type="button"
            onClick={() => setViewMode("ativos")}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] xl:text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${viewMode === "ativos"
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
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] xl:text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${viewMode === "historico"
              ? "bg-secondary text-foreground font-semibold shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <History className="h-3 w-3" />
            <span>Histórico


            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 rounded-lg bg-destructive px-2.5 py-1.5 text-[11px] xl:text-xs font-semibold text-destructive-foreground whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
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
          <div className="pt-2 flex items-center justify-center gap-2 w-full">
            <button
              onClick={() => setViewMode("historico")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] xl:text-xs font-semibold text-foreground whitespace-nowrap hover:bg-secondary hover:border-primary/40 transition-all cursor-pointer shadow-xs"
            >
              <History className="h-3.5 w-3.5 text-primary" />
              <span>Ver Histórico de Alertas ({historyAlerts.length})</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] xl:text-xs font-medium text-muted-foreground whitespace-nowrap hover:text-foreground transition-colors cursor-pointer"
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
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [checkWater, setCheckWater] = useState(false);
  const [checkAgents, setCheckAgents] = useState(false);
  const [actionConfirmed, setActionConfirmed] = useState(false);

  useEffect(() => {
    setShowValidationPanel(false);
    setCheckWater(false);
    setCheckAgents(false);
    setActionConfirmed(false);
  }, [zone.id]);

  const isChecklistComplete = checkWater && checkAgents;

  const handleConfirmOperationalAction = () => {
    if (!isChecklistComplete) return;
    setActionConfirmed(true);
    setShowValidationPanel(false);
    toast.success(`Ação preventiva confirmada para ${zone.name}!`, {
      description:
        "Validação operacional concluída e encaminhada à Defesa Civil e Secretaria de Saúde.",
    });
  };

  const ratingInfo = ratingDefinitions[zone.rating];
  const organRec = zoneOrganRecommendations[zone.id] || {
    organ: "Defesa Civil",
    urgency: "Alta",
    action: "Monitoramento contínuo e contingência de calor",
    description: "Acompanhamento em campo e prevenção de estresse térmico para pedestres.",
  };

  const rows = [
    { label: "Temperatura", value: `${zone.temp.toFixed(1).replace(".", ",")} °C`, icon: Thermometer, iconColor: "text-amber-500" },
    { label: "Sensação térmica", value: `${zone.feels.toFixed(1).replace(".", ",")} °C`, icon: Flame, iconColor: "text-rose-500" },
    { label: "Umidade relativa", value: `${zone.humidity}%`, icon: Droplets, iconColor: "text-sky-500" },
    { label: "Cobertura vegetal", value: `${zone.canopy}%`, icon: Trees, iconColor: "text-emerald-500" },
    { label: "Vulnerabilidade social", value: `${zone.vuln}/100`, icon: HeartPulse, iconColor: "text-rose-400" },
  ];

  return (
    <section className="panel p-4 sm:p-5 flex flex-col justify-between h-full shadow-xs" data-tour="zone-detail">
      <div>
        {/* Cabeçalho do Bairro Selecionado com Classificação em Destaque */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">{zone.name}</h2>
            <p className="font-mono text-[11px] text-muted-foreground">Microterritório selecionado no mapa</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: `color-mix(in oklab, ${ratingInfo.color} 18%, transparent)`,
                  color: ratingInfo.color,
                }}
              >
                Classe {zone.rating} · {ratingInfo.name}
              </span>
            </div>
          </div>

          {/* Badge Visual da Classificação + Significado abaixo */}
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
          <div className="mt-2.5 mb-2 space-y-1.5 rounded-lg border border-border/80 bg-background/80 p-2.5 text-xs shadow-inner">
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

        {/* Tabela de Indicadores com Ícones e Espaçamento Organizado */}
        <dl className="mt-2.5 divide-y divide-border/60">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center justify-between py-1.5 sm:py-2 text-xs sm:text-sm">
                <dt className="text-muted-foreground text-xs flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${r.iconColor || "text-muted-foreground"} shrink-0`} />
                  <span>{r.label}</span>
                </dt>
                <dd className="font-mono text-xs sm:text-sm font-semibold text-foreground">
                  {r.value}
                </dd>
              </div>
            );
          })}
        </dl>

        {/* ÁREA DE RECOMENDAÇÃO OPERACIONAL PARA ÓRGÃO PÚBLICO EM ALTO DESTAQUE */}
        <div className="mt-3 overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-card p-3 shadow-md relative">
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Recomendação Operacional
              </span>
            </div>
            <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-xs">
              AÇÃO PREVENTIVA
            </span>
          </div>

          <div className="mt-2.5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Truck className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Defesa Civil & Secretaria de Saúde
              </h4>
              <p className="text-[11px] font-medium text-foreground/90 leading-tight">
                Despacho de caminhões-pipa e agentes comunitários
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Priorizar o envio emergencial para áreas de baixa renda. Ações de suporte local e orientação sobre prevenção.
              </p>
            </div>
          </div>

          {/* Gatilho "Validar Operação" ou Bloco Expandido de Validação Operacional (Human-in-the-Loop) */}
          {!showValidationPanel ? (
            <div className="mt-3 pt-2.5 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => setShowValidationPanel(true)}
                className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                  actionConfirmed
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25"
                    : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs"
                }`}
              >
                {actionConfirmed ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Ação Confirmada · Rever Validação</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Validar Operação</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Checklist de Validação Operacional (Human-in-the-Loop) com Estética Glassmorphism */}
              <div className="mt-2.5 rounded-lg border border-border/60 dark:border-white/10 bg-background/60 dark:bg-slate-900/45 backdrop-blur-md p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Validação Operacional
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {(checkWater ? 1 : 0) + (checkAgents ? 1 : 0)}/2 verificados
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowValidationPanel(false)}
                      className="inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Recolher validação operacional"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Etapa 1 (Confirmar): Abastecimento de água */}
                <label
                  className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[11px] transition-all cursor-pointer select-none border ${
                    checkWater
                      ? "bg-cyan-500/10 border-cyan-500/40 text-foreground font-medium"
                      : "bg-card/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-card/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkWater}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCheckWater(checked);
                      if (!checked) {
                        setCheckAgents(false);
                        setActionConfirmed(false);
                      }
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all ${
                      checkWater
                        ? "bg-cyan-500 border border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.55)]"
                        : "border border-muted-foreground/50 bg-background/80"
                    }`}
                  >
                    {checkWater && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                  <span className="leading-snug">
                    1. Confirmar quebra no abastecimento de água local.
                  </span>
                </label>

                {/* Etapa 2 (Validar): Disponibilidade de agentes de saúde (habilitada após Etapa 1) */}
                <label
                  className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[11px] transition-all select-none border ${
                    !checkWater
                      ? "bg-card/20 border-transparent text-muted-foreground/50 cursor-not-allowed opacity-60"
                      : checkAgents
                        ? "bg-orange-500/10 border-orange-500/40 text-foreground font-medium cursor-pointer"
                        : "bg-card/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-card/70 cursor-pointer"
                  }`}
                  title={!checkWater ? "Confirme primeiro o item 1 acima para liberar a validação" : undefined}
                >
                  <input
                    type="checkbox"
                    disabled={!checkWater}
                    checked={checkAgents}
                    onChange={(e) => {
                      if (!checkWater) return;
                      setCheckAgents(e.target.checked);
                      if (!e.target.checked) setActionConfirmed(false);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all ${
                      checkAgents
                        ? "bg-orange-500 border border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.55)]"
                        : "border border-muted-foreground/50 bg-background/80"
                    }`}
                  >
                    {checkAgents && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                  <span className="leading-snug">
                    2. Validar disponibilidade de agentes de saúde na região.
                  </span>
                </label>
              </div>

              {/* Botão Principal de Ação Condicional no Rodapé do Card */}
              <div className="mt-2.5 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  disabled={!isChecklistComplete}
                  onClick={handleConfirmOperationalAction}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-bold transition-all ${
                    !isChecklistComplete
                      ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border border-border/60"
                      : actionConfirmed
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25 cursor-pointer"
                        : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/30 active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  {actionConfirmed ? (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Ação Confirmada</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Confirmar Ação</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
          <div className="hidden">
            <div>
              <p>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco Inferior de Botões de Ação Perfeitamente Alinhados */}
      <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2">
        {/* Ações de atalho direto para Cobertura Vegetal e Vulnerabilidade do Bairro */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenVegetalView && (
            <button
              id="zone-detail-vegetal-btn"
              onClick={onOpenVegetalView}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-canopy/40 bg-canopy/10 py-2 sm:py-2.5 px-2 text-xs font-semibold text-canopy hover:bg-canopy/20 transition-all cursor-pointer shadow-xs"
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
              className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 py-2 sm:py-2.5 px-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer shadow-xs"
              title={`Abrir Vulnerabilidade e Saúde para ${zone.name}`}
            >
              <HeartPulse className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Vulnerabilidade</span>
            </button>
          )}
        </div>

        {/* Ações Avançadas: Clima NASA POWER e Análise Ambiental */}
        <div className="grid grid-cols-2 gap-2">
          {onOpenNasaPower && (
            <button
              id="zone-detail-nasa-btn"
              onClick={onOpenNasaPower}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 py-2 px-2 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer shadow-xs"
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
              className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 py-2 px-2 text-xs font-medium text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-xs"
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
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card/80 hover:bg-secondary hover:border-primary/50 py-2 text-xs font-semibold text-primary transition-all cursor-pointer shadow-xs"
            title="Comparar este bairro com outro em gráfico temporal"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
            <span>Comparar este bairro com outro</span>
          </button>
        )}
      </div>
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
      icon: Trees,
      iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      title: "Disparidade de 13,2 °C entre bairros",
      desc: "A cobertura de copa em Dois Irmãos (64%) arrefece o microclima em 13,2 °C em relação ao solo impermeabilizado de Santo Amaro.",
      metric: "-2,1 °C a cada +10% de árvores",
    },
    {
      id: "janela-critica",
      tag: "Sobrecarga Humana",
      icon: Users,
      iconColor: "text-amber-500 bg-amber-500/15 border-amber-500/30",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      title: "Pico de exposição: 13h00 às 16h30",
      desc: "Cruzamento de radiação e baixa umidade relativa (58%) gera risco crítico de desidratação e estresse cardiovascular em pedestres expostos.",
      metric: "318 mil pessoas expostas",
    },
    {
      id: "brisa-costeira",
      tag: "Resiliência Marítima",
      icon: ShieldCheck,
      iconColor: "text-cyan-500 bg-cyan-500/15 border-cyan-500/30",
      badgeClass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      title: "Amortecimento microclimático litorâneo",
      desc: "Correntes de brisa marítima atenuam a sensação térmica na orla de Boa Viagem em até 3,4 °C em comparação à ilha impermeabilizada central.",
      metric: "-3,4 °C na faixa costeira",
    },
  ];

  return (
    <section className="panel p-4 shadow-xs" data-tour="insights-panel">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Insights & Inteligência Territorial</h2>
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              · Análise cruzada de sensores orbitais, dados meteorológicos e vulnerabilidade humana
            </span>
          </div>
          <button
            onClick={() =>
              toast.info("Insights & Inteligência Climática", {
                description:
                  "Exibindo correlações completas entre sensoriamento orbital Landsat 8/9, dados Open-Meteo e Censo IBGE.",
              })
            }
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border/70 bg-card/60 p-3.5 transition-all hover:bg-card hover:border-primary/40 shadow-xs flex items-start gap-3"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 mt-0.5 ${item.iconColor}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
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
                  <p className="text-xs font-bold text-foreground leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}