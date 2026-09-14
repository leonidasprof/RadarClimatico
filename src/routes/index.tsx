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
import { MapLayerSwitcher } from "@/components/dashboard/MapLayerSwitcher";
import { LoginPage } from "./login";
import { toast } from "sonner";
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

export type NavTab = "tempo-real" | "historico" | "verde" | "alertas" | "indice";

function Dashboard() {
  const [selected, setSelected] = useState<Zone>(zones[1]!);
  const [activeTab, setActiveTab] = useState<NavTab>("tempo-real");
  const [mapLayer, setMapLayer] = useState<"calor" | "vegetal" | "vulnerabilidade">("calor");
  const [alertsList, setAlertsList] = useState<AlertItem[]>(alerts);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();

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
    <div className="min-h-screen">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === "tempo-real") setMapLayer("calor");
        }}
        onOpenContactModal={() => setContactModalOpen(true)}
      />
      <main className="mx-auto grid max-w-[1500px] gap-4 px-4 pb-14 lg:grid-cols-12">
        {/* Visualização Padrão: Operação em Tempo Real (Mapa Térmico & Camadas) */}
        {activeTab === "tempo-real" && (
          <>
            {mapLayer === "calor" && (
              <>
                <div className="lg:col-span-8 space-y-4">
                  <Kpis />
                  <MapPanel
                    selected={selected}
                    onSelect={setSelected}
                    onOpenGreenDashboard={() => setActiveTab("verde")}
                    activeLayer={mapLayer}
                    onChangeLayer={setMapLayer}
                  />
                  {/* Linha 1 abaixo do mapa térmico: Índice Térmico e Histórico de Temperatura */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <RatingPanel onSelect={setSelected} selected={selected} />
                    <HistoryPanel
                      zone={selected}
                      onOpenComparison={() => setActiveTab("historico")}
                    />
                  </div>
                  {/* Linha 2 abaixo: Curva do Dia e Priorização de Infraestrutura Verde */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <HourlyPanel />
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
                  />
                  <InsightsPanel />
                </aside>
              </>
            )}

            {/* Visualização de Cobertura Vegetal integrada dentro do Mapa Térmico */}
            {mapLayer === "vegetal" && (
              <div className="lg:col-span-12">
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
              <div className="lg:col-span-12">
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
          <div className="lg:col-span-12">
            <ComparisonHistoryView
              initialZone={selected}
              onSelectZone={setSelected}
            />
          </div>
        )}

        {/* Dashboard Verde (Épico 1) */}
        {activeTab === "verde" && (
          <div className="lg:col-span-12">
            <GreenDashboardView
              onSelectZone={(z) => {
                setSelected(z);
                setActiveTab("tempo-real");
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
              <RatingPanel onSelect={(z) => { setSelected(z); setActiveTab("tempo-real"); }} selected={selected} />
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="flex flex-col items-center">
          <img
            src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
            alt="Logo Arboris"
            className="h-16 mb-2 object-contain"
          />
          <p>
            Radar Climático · Equipe Arboris · Mockup conceitual — dados ilustrativos
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
    </div>
  );
}

function Header({
  activeTab,
  onSelectTab,
  onOpenContactModal,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenContactModal: () => void;
}) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
    { id: "alertas", label: "Alertas" },
    { id: "indice", label: "Índice Térmico" },
  ];

  return (
    <header className="mx-auto mb-4 flex max-w-[1500px] flex-col gap-4 px-4 pt-6 pb-4">
      {/* Faixa superior */}
      <div className="flex items-center justify-between">
        {/* Logo maior à esquerda */}
        <img
          src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
          alt="Arboris Logo"
          className="h-16 w-auto object-contain"
        />

        {/* Texto principal + localização alinhados à esquerda da logo */}
        <div className="flex flex-col items-start ml-4">
          <h1 className="text-xl font-bold">
            SISTEMA DE MONITORAMENTO E ALERTA DE ILHAS DE CALOR
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Arboris · Recife / PE
          </p>
        </div>

        {/* Botões à direita */}
        <div className="flex items-center gap-3 ml-auto">
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

      {/* Faixa inferior: menus de navegação ampliados e sensores na MESMA linha */}
      <div className="flex items-center justify-between gap-3 flex-nowrap py-1 px-1">
        {/* Alerta piscando + navegação alinhados à esquerda */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40 ml-1">
            <span className="absolute inset-0 rounded-lg bg-primary/25 pulse-ring" />
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="8" className="text-primary" />
              <circle cx="12" cy="12" r="3.5" className="text-primary" />
              <path d="M12 4v16M4 12h16" className="text-primary/50" />
            </svg>
          </div>

          <nav className="flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={
                    "rounded-md px-3 py-1.5 transition-colors cursor-pointer text-xs sm:text-sm font-medium whitespace-nowrap " +
                    (isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40")
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Indicadores de sensores na mesma linha à direita */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-1.5 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-canopy shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">
              142 sensores online · atualizado há 48 min
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-1.5 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">
              8 sensores offline · último sinal há 12 min
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Kpis() {
  const items = [
    { label: "Temp. média da cidade", value: "34,1", unit: "°C", delta: "+2,3 vs média histórica", tone: "var(--heat-4)" },
    { label: "Sensação térmica máx.", value: "44,2", unit: "°C", delta: "Santo Amaro · 14h10", tone: "var(--heat-5)" },
    { label: "Zonas em criticidade", value: "4", unit: "de 12", delta: "2 novas nas últimas 6 h", tone: "var(--heat-4)" },
    { label: "População exposta", value: "318", unit: "mil", delta: "62% em alta vulnerabilidade", tone: "var(--accent)" },
  ];
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="panel p-4">
          <p className="text-xs text-muted-foreground">{k.label}</p>
          <p className="mt-2 flex items-baseline gap-1 font-display text-3xl font-semibold">
            <span style={{ color: k.tone }}>{k.value}</span>
            <span className="text-sm font-normal text-muted-foreground">{k.unit}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{k.delta}</p>
        </div>
      ))}
    </section>
  );
}

function MapPanel({
  selected,
  onSelect,
  onOpenGreenDashboard,
  activeLayer = "calor",
  onChangeLayer,
}: {
  selected: Zone;
  onSelect: (z: Zone) => void;
  onOpenGreenDashboard?: () => void;
  activeLayer: "calor" | "vegetal" | "vulnerabilidade";
  onChangeLayer: (layer: "calor" | "vegetal" | "vulnerabilidade") => void;
}) {
  const layers = [
    { id: "calor", label: "Calor" },
    { id: "vegetal", label: "Cobertura vegetal" },
    { id: "vulnerabilidade", label: "Vulnerabilidade" },
  ] as const;

  /**
   * Lógica de cálculo cromático por camada (Épico 1):
   * - Calor: gradiente térmico de azul/amarelo a vermelho rubro (heatVar)
   * - Vegetal: escala verde florestal (canopyVar)
   * - Vulnerabilidade: tonalidades de alerta social (vulnVar)
   */
  const getZoneColor = (z: Zone) => {
    if (activeLayer === "calor") return heatVar(z.temp);
    if (activeLayer === "vegetal") return canopyVar(z.canopy);
    return vulnVar(z.vuln);
  };

  const getZoneLabel = (z: Zone) => {
    if (activeLayer === "calor") return `${z.name} · ${z.temp.toFixed(1)}°`;
    if (activeLayer === "vegetal") return `${z.name} · ${z.canopy}% copa`;
    return `${z.name} · IVS ${z.vuln}`;
  };

  // Condição de pulso crítico: calor excessivo (>36°C), déficit de árvore (<=10%) ou altíssima vulnerabilidade (>=75)
  const shouldPulse = (z: Zone) => {
    if (activeLayer === "calor") return z.temp >= 36;
    if (activeLayer === "vegetal") return z.canopy <= 10;
    return z.vuln >= 75;
  };

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Mapa térmico · Região Metropolitana do Recife</h2>
          <p className="text-[11px] text-muted-foreground">
            {activeLayer === "calor" && "Exibindo anomalias de temperatura de superfície e ilhas de calor"}
            {activeLayer === "vegetal" && "Exibindo densidade de copa arbórea e refúgios térmicos"}
            {activeLayer === "vulnerabilidade" && "Exibindo Índice de Vulnerabilidade Social (IVS) da população exposta"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor rápido de foco territorial */}
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <span className="text-muted-foreground text-[11px]">Bairro:</span>
            <select
              value={selected.id}
              onChange={(e) => {
                const found = zones.find((z) => z.id === e.target.value);
                if (found) onSelect(found);
              }}
              className="rounded border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de camadas – exclui "Calor" pois já estamos nessa camada */}
          <MapLayerSwitcher activeLayer={activeLayer} onChangeLayer={onChangeLayer} excludeLayers={["calor"]} />
        </div>
      </div>

      <div className="relative h-[490px]">
        {/* malha viária esquemática do Recife */}
        <RecifeStreetMesh className="absolute inset-0 h-full w-full" />

        {zones.map((z) => {
          const active = z.id === selected.id;
          const color = getZoneColor(z);
          const isPulsing = shouldPulse(z);

          return (
            <button
              key={z.id}
              onClick={() => onSelect(z)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus:outline-none cursor-pointer"
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: z.size, height: z.size }}
              aria-label={z.name}
            >
              <span
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: `radial-gradient(circle, color-mix(in oklab, ${color} 70%, transparent) 0%, transparent 68%)`,
                }}
              />
              <span
                className="absolute inset-[38%] rounded-full"
                style={{
                  background: color,
                  boxShadow: active ? "0 0 0 3px var(--foreground)" : "none",
                  opacity: 0.9,
                }}
              />
              {isPulsing && (
                <span
                  className="absolute inset-[36%] rounded-full pulse-ring"
                  style={{ background: color }}
                />
              )}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-4 whitespace-nowrap font-mono text-[11px] text-foreground/90 font-medium">
                {getZoneLabel(z)}
              </span>
            </button>
          );
        })}

        {/* Legenda Dinâmica de Acordo com a Camada Ativa */}
        <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-background/85 p-3 backdrop-blur shadow-sm max-w-xs">
          {activeLayer === "calor" && (
            <>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Escala de sensação térmica
              </p>
              <div className="h-2 w-52 rounded-full heat-bar" />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>28°</span>
                <span>34°</span>
                <span>45°+</span>
              </div>
            </>
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

function HourlyPanel() {
  const max = 40;
  const pts = hourly
    .map((p, i) => `${(i / (hourly.length - 1)) * 100},${100 - (p.t / max) * 100}`)
    .join(" ");
  return (
    <section className="panel p-4">
      <h2 className="text-sm font-semibold">Curva térmica do dia</h2>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        Pico previsto 36,8 °C às 14h · limiar de alerta 35 °C
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
        {hourly.map((p) => (
          <span key={p.h}>{p.h}</span>
        ))}
      </div>
    </section>
  );
}

function PriorityPanel({ onOpenGreenDashboard }: { onOpenGreenDashboard?: () => void }) {
  return (
    <section className="panel p-4">
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
  const [filter, setFilter] = useState<"todos" | "critico" | "alto" | "moderado">("todos");

  // Filtro de severidade dos alertas
  const filteredAlerts = alertItems.filter((a) => {
    if (filter === "todos") return true;
    return a.level === filter;
  });

  const pendingCount = alertItems.filter((a) => !a.notified).length;

  const filterTabs = [
    {
      id: "todos",
      label: "Todos",
      count: alertItems.length,
      dotClass: "bg-foreground/50",
      activeClass: "bg-card text-foreground shadow-sm ring-1 ring-border",
    },
    {
      id: "critico",
      label: "Crítico",
      count: alertItems.filter((a) => a.level === "critico").length,
      dotClass: "bg-destructive",
      activeClass: "bg-destructive/15 text-destructive ring-1 ring-destructive/40 shadow-sm font-semibold",
    },
    {
      id: "alto",
      label: "Alto",
      count: alertItems.filter((a) => a.level === "alto").length,
      dotClass: "bg-orange-500",
      activeClass: "bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/40 shadow-sm font-semibold",
    },
    {
      id: "moderado",
      label: "Moderado",
      count: alertItems.filter((a) => a.level === "moderado").length,
      dotClass: "bg-amber-500",
      activeClass: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40 shadow-sm font-semibold",
    },
  ] as const;

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Alertas ativos</h2>
          <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[11px] text-destructive font-medium">
            {pendingCount} pendentes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Alerta</span>
          </button>
        </div>
      </div>

      {/* Filtros táteis e convidativos por severidade */}
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
          // Contorno inferior proporcional à severidade solicitada:
          // Crítico: 100% da linha inferior
          // Alto: 60% da linha inferior
          // Moderado: 30% da linha inferior
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

              {/* Contorno inferior proporcional à gravidade: 100% no crítico, 60% no alto, 30% no moderado */}
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

              {/* Brilho sutil na quina inferior esquerda integrando os contornos */}
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
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{a.time}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
              </div>

              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/40">
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  janela {a.eta}
                </span>

                {a.notified ? (
                  <span className="ml-auto flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-500">
                    <CheckCheck className="h-3 w-3" />
                    Notificado
                  </span>
                ) : (
                  <button
                    onClick={() => onDispatchAlert(a.id)}
                    className="ml-auto rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
                  >
                    Disparar notificação
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ZoneDetail({
  zone,
  onOpenComparison,
  onOpenVegetalView,
  onOpenVulnView,
}: {
  zone: Zone;
  onOpenComparison?: () => void;
  onOpenVegetalView?: () => void;
  onOpenVulnView?: () => void;
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
    <section className="panel p-4">
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

function RatingPanel({ selected, onSelect }: { selected: Zone; onSelect: (z: Zone) => void }) {
  const sorted = [...zones].sort((a, b) => b.feels - a.feels);
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
          {sorted.map((z) => (
            <li key={z.id}>
              <button
                onClick={() => onSelect(z)}
                className={
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors " +
                  (z.id === selected.id ? "bg-secondary" : "hover:bg-secondary/60")
                }
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: heatVar(z.temp) }} />
                <span className="text-sm">{z.name}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {z.feels.toFixed(1)}°
                </span>
                <span className="w-5 text-center font-display text-sm font-semibold" style={{ color: heatVar(z.temp) }}>
                  {z.rating}
                </span>
              </button>
            </li>
          ))}
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