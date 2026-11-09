import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Siren,
  RefreshCw,
  Copy,
  MessageSquareText,
  ShieldCheck,
  Users,
  Clock,
  ClipboardCheck,
  HeartPulse,
  Info,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { zones, weeklyHealthCorrelation, type Zone } from "@/lib/radar-data";
import {
  HEAT_LEVELS,
  actionPriority,
  calibrateWithHealthData,
  fetchHeatForecast,
  type HeatForecastSnapshot,
  type HeatLevel,
  type HeatLevelId,
} from "@/lib/geo-services/heat-alert-service";

/**
 * Protocolo de ação por nível. Cada nível herda as ações dos níveis abaixo dele.
 * Os órgãos citados são os que já integram o COP do Recife.
 */
const PROTOCOL: Record<HeatLevelId, { orgao: string; acoes: string[] }[]> = {
  normal: [{ orgao: "Radar / COP", acoes: ["Monitoramento de rotina da previsão de 72h."] }],
  atencao: [
    {
      orgao: "Comunicação",
      acoes: [
        "Publicar orientação preventiva: hidratação, roupas leves, evitar sol das 11h às 15h.",
      ],
    },
    {
      orgao: "Saúde",
      acoes: ["Avisar UBS e agentes comunitários de saúde dos bairros em Atenção."],
    },
  ],
  alerta: [
    { orgao: "Defesa Civil", acoes: ["Disparar SMS de alerta (40199) para os bairros em Alerta."] },
    {
      orgao: "Saúde",
      acoes: [
        "Reforçar estoque de soro de reidratação nas UPAs de referência.",
        "Agentes de saúde visitam idosos que moram sozinhos e acamados.",
      ],
    },
    {
      orgao: "Educação",
      acoes: [
        "Suspender educação física e recreio ao sol entre 11h e 15h.",
        "Garantir água e ventilação nas salas.",
      ],
    },
    { orgao: "Assistência Social", acoes: ["Abordagem com água à população em situação de rua."] },
  ],
  perigo: [
    {
      orgao: "COP",
      acoes: [
        "Ativar sala de situação de calor com Saúde, Defesa Civil, Educação e Assistência Social.",
      ],
    },
    {
      orgao: "Assistência Social",
      acoes: [
        "Abrir pontos de resfriamento (equipamentos públicos climatizados) nos bairros em Perigo.",
      ],
    },
    {
      orgao: "EMLURB / Meio Ambiente",
      acoes: [
        "Irrigação de praças e regas emergenciais; pausa de obras de rua no horário de pico.",
      ],
    },
    {
      orgao: "Trabalho / Fiscalização",
      acoes: ["Recomendar pausas para trabalhadores ao ar livre (garis, ambulantes)."],
    },
  ],
  emergencia: [
    {
      orgao: "COP",
      acoes: [
        "Declarar emergência de calor e coordenar resposta 24h.",
        "Boletins a cada 6h para imprensa e população.",
      ],
    },
    {
      orgao: "Saúde",
      acoes: ["Plano de contingência hospitalar; ampliar leitos de observação nas UPAs."],
    },
    {
      orgao: "Educação",
      acoes: ["Avaliar suspensão de aulas no turno da tarde nos bairros em Emergência."],
    },
  ],
};

function protocolFor(level: HeatLevel) {
  const merged = new Map<string, string[]>();
  for (const l of HEAT_LEVELS) {
    if (l.rank > level.rank) break;
    for (const step of PROTOCOL[l.id]) {
      merged.set(step.orgao, [...(merged.get(step.orgao) ?? []), ...step.acoes]);
    }
  }
  return Array.from(merged.entries()).map(([orgao, acoes]) => ({ orgao, acoes }));
}

function LevelChip({ level, size = "sm" }: { level: HeatLevel; size?: "sm" | "lg" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[11px]"
      }`}
      style={{ background: level.softBg, color: level.color, border: `1px solid ${level.color}55` }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: level.color }} />
      {level.label}
    </span>
  );
}

interface HeatAlertViewProps {
  onSelectZone?: (zone: Zone) => void;
}

export function HeatAlertView({ onSelectZone }: HeatAlertViewProps) {
  const [snapshot, setSnapshot] = useState<HeatForecastSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("santo-amaro");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const load = async (force = false) => {
    setLoading(true);
    if (force) {
      try {
        localStorage.removeItem("arboris_heat_forecast_v1");
      } catch {
        // ignora
      }
    }
    const snap = await fetchHeatForecast(zones);
    setSnapshot(snap);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const dayRows = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.zones
      .map((zf) => {
        const zone = zones.find((z) => z.id === zf.zoneId)!;
        const day = zf.days[dayIndex] ?? zf.days[0]!;
        return {
          zone,
          day,
          priority: actionPriority(day.level, zone.vulnerableGroups, zone.vuln),
        };
      })
      .sort(
        (a, b) =>
          b.day.level.rank - a.day.level.rank ||
          b.priority - a.priority ||
          b.day.maxHeatIndex - a.day.maxHeatIndex,
      );
  }, [snapshot, dayIndex]);

  const dayLabels = snapshot?.zones[0]?.days.map((d) => d.label) ?? ["Hoje", "Amanhã", "Depois"];
  const cityLevel = dayRows.reduce<HeatLevel>(
    (acc, r) => (r.day.level.rank > acc.rank ? r.day.level : acc),
    HEAT_LEVELS[0]!,
  );
  const affected = dayRows.filter((r) => r.day.level.rank >= 2);
  const peopleAtRisk = affected.reduce((s, r) => s + r.zone.vulnerableGroups, 0);
  const protocol = protocolFor(cityLevel);

  const selectedForecast = snapshot?.zones.find((z) => z.zoneId === selectedZoneId);
  const chartData = (selectedForecast?.hours ?? []).map((h) => ({
    label: `${h.time.slice(8, 10)}/${h.time.slice(5, 7)} ${String(h.hour).padStart(2, "0")}h`,
    hi: h.heatIndex,
    temp: h.temp,
  }));
  const maxY = Math.max(50, ...chartData.map((d) => d.hi + 2));

  const calibration = useMemo(() => calibrateWithHealthData(weeklyHealthCorrelation), []);

  const dayLabelText = dayLabels[dayIndex] ?? "";
  const bulletin = useMemo(() => {
    if (!dayRows.length) return "";
    const lines: string[] = [];
    lines.push(`BOLETIM DE CALOR — RADAR CLIMÁTICO ARBORIS`);
    lines.push(
      `Referência: ${dayLabelText} (${dayRows[0]!.day.date.split("-").reverse().join("/")})`,
    );
    lines.push(`Nível máximo na cidade: ${cityLevel.label.toUpperCase()}`);
    lines.push("");
    for (const lvl of [...HEAT_LEVELS].reverse()) {
      const rows = dayRows.filter((r) => r.day.level.id === lvl.id);
      if (!rows.length || lvl.rank === 0) continue;
      lines.push(`${lvl.label.toUpperCase()}:`);
      for (const r of rows) {
        lines.push(
          `• ${r.zone.name} — índice de calor até ${r.day.maxHeatIndex.toFixed(0)} °C às ${r.day.peakHour}h` +
            (r.day.hoursAtOrAboveAlert
              ? ` (${r.day.hoursAtOrAboveAlert}h em nível ≥ Alerta)`
              : "") +
            ` · ${r.zone.vulnerableGroups.toLocaleString("pt-BR")} pessoas vulneráveis · ref. ${r.zone.upaReference}`,
        );
      }
      lines.push("");
    }
    lines.push("AÇÕES RECOMENDADAS:");
    for (const p of protocol) lines.push(`[${p.orgao}] ${p.acoes.join(" ")}`);
    lines.push("");
    lines.push(
      "Fonte: previsão Open-Meteo + ajuste de ilha de calor por bairro · Índice de Calor NOAA.",
    );
    return lines.join("\n");
  }, [dayRows, cityLevel, protocol, dayLabelText]);

  const sms = useMemo(() => {
    const names = affected.slice(0, 3).map((r) => r.zone.name);
    if (!names.length) {
      return `Recife ${dayLabelText}: calor dentro do habitual. Beba água e evite sol forte das 11h às 15h. Defesa Civil`;
    }
    const peak = affected[0]!.day.peakHour;
    const when = dayIndex < 2 ? dayLabelText.toLowerCase() : `na ${dayLabelText}`;
    const list =
      names.length > 1 ? `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}` : names[0];
    return `Defesa Civil: calor nível ${cityLevel.label.toUpperCase()} ${when} em ${list}. Pico às ${peak}h. Beba água, evite sol das 11h às 15h, cuide de idosos e crianças.`;
  }, [affected, cityLevel, dayLabelText, dayIndex]);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copiado`);
    } catch {
      toast.error("Não foi possível copiar automaticamente");
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-500 ring-1 ring-red-500/30">
            <Siren className="h-4.5 w-4.5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Alerta de Calor</h2>
              <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-red-500">
                Previsão 72h por bairro
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Avisa com antecedência onde o calor vai ficar perigoso, quem está em risco e o que
              cada secretaria deve fazer — pronto para o COP disparar.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border bg-card/60 px-2.5 py-1 font-mono text-[11px]">
            {loading
              ? "Carregando previsão…"
              : snapshot?.source === "fallback"
                ? "Sem conexão · curva de referência"
                : `Open-Meteo · ${new Date(snapshot!.generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
          </span>
          <button
            type="button"
            onClick={() => void load(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>
      </div>

      {/* Seletor de dia + resumo */}
      <div className="panel p-4 grid gap-4 md:grid-cols-12 items-center">
        <div className="md:col-span-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Dia da previsão
          </p>
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
            {dayLabels.slice(0, 3).map((l, i) => (
              <button
                key={l}
                type="button"
                onClick={() => setDayIndex(i)}
                className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer ${
                  dayIndex === i
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Nível máximo no Recife
          </p>
          <LevelChip level={cityLevel} size="lg" />
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Bairros ≥ Alerta
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {affected.length}
            <span className="text-sm text-muted-foreground font-normal"> / {dayRows.length}</span>
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Pessoas vulneráveis expostas
          </p>
          <p className="text-2xl font-bold tabular-nums flex items-center gap-1.5">
            <Users className="h-5 w-5 text-muted-foreground" />
            {peopleAtRisk.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Escala de níveis */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        {HEAT_LEVELS.map((l, i) => (
          <div
            key={l.id}
            className="rounded-lg border p-2.5"
            style={{ borderColor: `${l.color}55`, background: l.softBg }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: l.color }}>
                {l.label}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {i === 0
                  ? `< ${HEAT_LEVELS[1]!.min}°`
                  : i === HEAT_LEVELS.length - 1
                    ? `≥ ${l.min}°`
                    : `${l.min}–${HEAT_LEVELS[i + 1]!.min}°`}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{l.meaning}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Ranking: onde agir primeiro */}
        <div className="panel p-4 lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Onde agir primeiro — {dayLabelText}</h3>
            <span className="text-[10px] text-muted-foreground">
              ordem: nível do calor, depois vulneráveis e vulnerabilidade social
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-1.5 pr-2 font-medium">#</th>
                  <th className="py-1.5 pr-2 font-medium">Bairro</th>
                  <th className="py-1.5 pr-2 font-medium">Nível</th>
                  <th className="py-1.5 pr-2 font-medium text-right">Índ. calor</th>
                  <th className="py-1.5 pr-2 font-medium text-right">Pico</th>
                  <th className="py-1.5 pr-2 font-medium text-right">Horas ≥ Alerta</th>
                  <th className="py-1.5 font-medium text-right">Vulneráveis</th>
                </tr>
              </thead>
              <tbody>
                {dayRows.map((r, i) => (
                  <tr
                    key={r.zone.id}
                    onClick={() => setSelectedZoneId(r.zone.id)}
                    className={`border-b border-border/50 cursor-pointer hover:bg-muted/50 ${
                      selectedZoneId === r.zone.id ? "bg-muted/60" : ""
                    }`}
                  >
                    <td className="py-2 pr-2 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-2 font-medium">{r.zone.name}</td>
                    <td className="py-2 pr-2">
                      <LevelChip level={r.day.level} />
                    </td>
                    <td className="py-2 pr-2 text-right font-mono tabular-nums">
                      {r.day.maxHeatIndex.toFixed(1)}°
                    </td>
                    <td className="py-2 pr-2 text-right font-mono tabular-nums">
                      {r.day.peakHour}h
                    </td>
                    <td className="py-2 pr-2 text-right font-mono tabular-nums">
                      {r.day.hoursAtOrAboveAlert}h
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {r.zone.vulnerableGroups.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      Calculando previsão por bairro…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Curva 72h do bairro selecionado */}
        <div className="panel p-4 lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">
              Próximas 72h — {selectedForecast?.zoneName ?? "…"}
            </h3>
            {onSelectZone && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                onClick={() => {
                  const z = zones.find((zz) => zz.id === selectedZoneId);
                  if (z) onSelectZone(z);
                }}
              >
                Ver no mapa <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                {HEAT_LEVELS.slice(1).map((l, i) => (
                  <ReferenceArea
                    key={`area-${l.id}`}
                    y1={l.min}
                    y2={HEAT_LEVELS[i + 2]?.min ?? maxY}
                    fill={l.color}
                    fillOpacity={0.07}
                    ifOverflow="hidden"
                  />
                ))}
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={11} />
                <YAxis domain={[20, maxY]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v: number, name: string) => [
                    `${v.toFixed(1)} °C`,
                    name === "hi" ? "Índice de calor" : "Temperatura",
                  ]}
                />
                {HEAT_LEVELS.slice(2).map((l) => (
                  <ReferenceLine
                    key={`line-${l.id}`}
                    y={l.min}
                    stroke={l.color}
                    strokeDasharray="4 3"
                    strokeOpacity={0.6}
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#64748b"
                  fill="transparent"
                  strokeWidth={1.2}
                />
                <Area
                  type="monotone"
                  dataKey="hi"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Linha vermelha: índice de calor (o que o corpo sente). Linha cinza: temperatura do ar.
            Faixas coloridas = níveis.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Protocolo */}
        <div className="panel p-4 lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4" /> Protocolo de ação — nível {cityLevel.label}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              {Object.values(done).filter(Boolean).length} ações concluídas
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {protocol.map((p) => (
              <div key={p.orgao} className="rounded-lg border border-border p-3">
                <p className="text-xs font-bold mb-1.5">{p.orgao}</p>
                <ul className="space-y-1.5">
                  {p.acoes.map((a) => {
                    const key = `${dayIndex}:${p.orgao}:${a}`;
                    return (
                      <li key={a}>
                        <label className="flex items-start gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-emerald-600"
                            checked={!!done[key]}
                            onChange={(e) => setDone((d) => ({ ...d, [key]: e.target.checked }))}
                          />
                          <span className={done[key] ? "line-through text-muted-foreground" : ""}>
                            {a}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            As ações se acumulam: no nível Perigo, valem também as de Atenção e Alerta. O protocolo
            é uma proposta inicial para ser validada com o COP e as secretarias.
          </p>
        </div>

        {/* Boletim e SMS */}
        <div className="panel p-4 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Boletim pronto para o COP</h3>
            <button
              type="button"
              onClick={() => void copy(bulletin, "Boletim")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" /> Copiar
            </button>
          </div>
          <pre className="max-h-56 overflow-auto subtle-scrollbar whitespace-pre-wrap rounded-lg bg-muted/50 p-3 font-mono text-[10.5px] leading-relaxed">
            {bulletin || "Aguardando previsão…"}
          </pre>
          <div className="rounded-lg border border-border p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <MessageSquareText className="h-3.5 w-3.5" /> SMS para a população
              </span>
              <span
                className={`font-mono text-[10px] ${sms.length > 160 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {sms.length}/160
              </span>
            </div>
            <p className="text-xs">{sms}</p>
            <button
              type="button"
              onClick={() => void copy(sms, "SMS")}
              className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline cursor-pointer"
            >
              <Copy className="h-3 w-3" /> Copiar SMS
            </button>
          </div>
        </div>
      </div>

      {/* Calibração local + método */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-red-500" /> Calor × saúde no Recife
          </h3>
          {calibration && (
            <p className="text-xs leading-relaxed">
              Na série de atendimentos nas UPAs usada pelo projeto, cada{" "}
              <b>+1 °C de sensação térmica</b> veio acompanhado de cerca de{" "}
              <b>+{calibration.slope} atendimentos</b> por desidratação/insolação (correlação r ={" "}
              {calibration.r}). É com esse tipo de dado local que os limites dos níveis serão
              recalibrados para a população do Recife.
            </p>
          )}
        </div>
        <div className="panel p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            <Info className="h-4 w-4" /> Como o nível é calculado
          </h3>
          <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-0.5 text-muted-foreground">
            <li>Previsão horária de temperatura e umidade (Open-Meteo) para cada bairro.</li>
            <li>Ajuste de ilha de calor do bairro (asfalto, pouca árvore, distância do mar).</li>
            <li>Índice de Calor NOAA: combina temperatura e umidade no que o corpo sente.</li>
            <li>
              Nível do dia = pior hora do dia; ordem: nível do calor, depois vulneráveis e vulnerabilidade social.
            </li>
          </ol>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" /> Atualiza a cada 30 min. Quando os sensores fixos chegarem,
            passam a corrigir o ajuste de cada bairro.
          </p>
        </div>
      </div>
    </div>
  );
}
