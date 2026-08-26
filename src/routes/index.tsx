import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { zones, alerts, hourly, priorities, heatVar, zoneHistory, type Zone } from "@/lib/radar-data";
import { RecifeStreetMesh } from "@/components/RecifeStreetMesh";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar Climático | Monitoramento de ilhas de calor no Recife" },
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

function Dashboard() {
  const [selected, setSelected] = useState<Zone>(zones[1]!);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-[1500px] gap-4 px-4 pb-14 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <Kpis />
          <MapPanel selected={selected} onSelect={setSelected} />
          <div className="grid gap-4 md:grid-cols-2">
            <HourlyPanel />
            <PriorityPanel />
          </div>
        </div>
        <aside className="lg:col-span-4 space-y-4">
          <AlertsPanel />
          <ZoneDetail zone={selected} />
          <HistoryPanel zone={selected} />
          <RatingPanel onSelect={setSelected} selected={selected} />
        </aside>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Radar Climático · Equipe Arboris · Mockup conceitual — dados ilustrativos
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="mx-auto mb-4 flex max-w-[1500px] flex-wrap items-center gap-4 px-4 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
          <span className="absolute inset-0 rounded-lg bg-primary/25 pulse-ring" />
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8" className="text-primary" />
            <circle cx="12" cy="12" r="3.5" className="text-primary" />
            <path d="M12 4v16M4 12h16" className="text-primary/50" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-none">Radar Climático</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Arboris · Recife / PE
          </p>
        </div>
      </div>

      <nav className="hidden gap-1 rounded-lg border border-border bg-card/60 p-1 text-sm md:flex">
        {["Tempo real", "Histórico", "Índice Térmico", "Alertas"].map((item, i) => (
          <button
            key={item}
            className={
              "rounded-md px-3 py-1.5 transition-colors " +
              (i === 0
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-canopy" />
            <span className="font-mono text-xs text-muted-foreground">
              142 sensores online · atualizado há 90 s
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="font-mono text-xs text-muted-foreground">
              8 sensores inativos/offline · último sinal há 12 min
            </span>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mono text-xs">
          EM
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

function MapPanel({ selected, onSelect }: { selected: Zone; onSelect: (z: Zone) => void }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold">Mapa térmico · Região Metropolitana do Recife</h2>
        <div className="ml-auto flex gap-1 rounded-md border border-border p-0.5 text-xs">
          {["Calor", "Cobertura vegetal", "Vulnerabilidade"].map((l, i) => (
            <button
              key={l}
              className={
                "rounded px-2.5 py-1 transition-colors " +
                (i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[420px]">
        {/* malha viária esquemática do Recife */}
        <RecifeStreetMesh className="absolute inset-0 h-full w-full" />


        {zones.map((z) => {
          const active = z.id === selected.id;
          return (
            <button
              key={z.id}
              onClick={() => onSelect(z)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus:outline-none"
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: z.size, height: z.size }}
              aria-label={z.name}
            >
              <span
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: `radial-gradient(circle, color-mix(in oklab, ${heatVar(z.temp)} 70%, transparent) 0%, transparent 68%)`,
                }}
              />
              <span
                className="absolute inset-[38%] rounded-full"
                style={{
                  background: heatVar(z.temp),
                  boxShadow: active ? "0 0 0 3px var(--foreground)" : "none",
                  opacity: 0.9,
                }}
              />
              {z.temp >= 36 && (
                <span
                  className="absolute inset-[36%] rounded-full pulse-ring"
                  style={{ background: heatVar(z.temp) }}
                />
              )}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-4 whitespace-nowrap font-mono text-[11px] text-foreground/90">
                {z.name} · {z.temp.toFixed(1)}°
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-background/80 p-3 backdrop-blur">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Escala de sensação térmica
          </p>
          <div className="h-2 w-52 rounded-full heat-bar" />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>28°</span>
            <span>34°</span>
            <span>45°+</span>
          </div>
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

function PriorityPanel() {
  return (
    <section className="panel p-4">
      <h2 className="text-sm font-semibold">Priorização de infraestrutura verde</h2>
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

function AlertsPanel() {
  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Alertas ativos</h2>
        <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[11px] text-destructive">
          3 abertos
        </span>
      </div>
      <ul className="mt-3 space-y-3">
        {alerts.map((a) => {
          const s = levelStyles[a.level];
          return (
            <li
              key={a.id}
              className="rounded-lg border border-border/80 bg-background/40 p-3"
              style={{ borderLeft: `3px solid ${s.color}` }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: s.color }}>
                  {s.label}
                </span>
                <span className="text-xs text-muted-foreground">· {a.zone}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">{a.time}</span>
              </div>
              <p className="mt-1 text-sm font-medium">{a.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  janela {a.eta}
                </span>
                <button className="ml-auto rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  Disparar notificação
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ZoneDetail({ zone }: { zone: Zone }) {
  const rows = [
    { label: "Temperatura", value: `${zone.temp.toFixed(1)} °C` },
    { label: "Sensação térmica", value: `${zone.feels.toFixed(1)} °C` },
    { label: "Umidade relativa", value: `${zone.humidity}%` },
    { label: "Cobertura vegetal", value: `${zone.canopy}%` },
    { label: "Vulnerabilidade social", value: `${zone.vuln}/100` },
  ];
  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{zone.name}</h2>
          <p className="font-mono text-[11px] text-muted-foreground">Zona selecionada no mapa</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg font-display text-xl font-bold"
          style={{ background: `color-mix(in oklab, ${heatVar(zone.temp)} 22%, transparent)`, color: heatVar(zone.temp) }}
        >
          {zone.rating}
        </div>
      </div>
      <dl className="mt-3 divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-2 text-sm">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-mono">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function HistoryPanel({ zone }: { zone: Zone }) {
  const [open, setOpen] = useState(true);
  const data = zoneHistory(zone);
  const temps = data.map((d) => d.t);
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  const trend = temps[temps.length - 1]! - temps[0]!;

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Histórico de temperatura</h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            {zone.name} · máximas dos últimos 7 dias
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? "Ocultar" : "Ver histórico"}
        </button>
      </div>

      {open && (
        <>
          <div className="mt-4 flex h-32 items-end gap-2">
            {data.map((d) => {
              const h = ((d.t - min) / (max - min)) * 100;
              return (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{d.t.toFixed(1)}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t"
                      style={{ height: `${Math.max(h, 6)}%`, background: heatVar(d.t), opacity: 0.9 }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Média</p>
              <p className="font-display text-sm font-semibold">{avg.toFixed(1)} °C</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Máxima</p>
              <p className="font-display text-sm font-semibold" style={{ color: heatVar(Math.max(...temps)) }}>
                {Math.max(...temps).toFixed(1)} °C
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tendência</p>
              <p className="font-display text-sm font-semibold">
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)} °C
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function RatingPanel({ selected, onSelect }: { selected: Zone; onSelect: (z: Zone) => void }) {
  const sorted = [...zones].sort((a, b) => b.feels - a.feels);
  return (
    <section className="panel p-4">
      <h2 className="text-sm font-semibold">Índice Térmico por bairro</h2>
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
    </section>
  );
}
