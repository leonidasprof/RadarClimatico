import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { Activity, Flame, Hospital, Sigma, TrendingUp } from "lucide-react";
import { weeklyHealthCorrelation, type WeeklyHealthData } from "@/lib/radar-data";

const HEAT_THRESHOLD = 35;

const COLORS = {
  temp: "var(--destructive)",
  feels: "var(--heat-4)",
  upa: "var(--accent)",
  admissions: "var(--primary)",
};

/** Coeficiente de correlação de Pearson entre duas séries. */
function pearson(a: number[], b: number[]) {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i]! - ma) * (b[i]! - mb);
    da += (a[i]! - ma) ** 2;
    db += (b[i]! - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload as WeeklyHealthData;
  const rows: [string, string, string][] = [
    ["Temp. máxima", `${fmt(d.temp)} °C`, COLORS.temp],
    ["Sensação térmica", `${fmt(d.feels)} °C`, COLORS.feels],
    ["Atendimentos UPA", `${d.upaVisits}`, COLORS.upa],
    ["Internações", `${d.hospitalAdmissions}`, COLORS.admissions],
  ];
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between gap-4 font-semibold text-foreground">
        <span>
          {d.day} · {d.date}
        </span>
        {d.criticalHeat && (
          <span className="rounded bg-destructive/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-destructive">
            Pico crítico
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {rows.map(([label, value, color]) => (
          <div key={label} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
              {label}
            </span>
            <span className="font-mono font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HealthCorrelationChartProps {
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

export function HealthCorrelationChart({
  activeDayIndex,
  onSelectDay,
}: HealthCorrelationChartProps) {
  const data = weeklyHealthCorrelation;
  const activeDay = data[activeDayIndex]!;

  const r = pearson(
    data.map((d) => d.temp),
    data.map((d) => d.upaVisits),
  );
  const totalUpa = data.reduce((s, d) => s + d.upaVisits, 0);
  const totalAdm = data.reduce((s, d) => s + d.hospitalAdmissions, 0);
  const peak = data.reduce((p, d) => (d.upaVisits > p.upaVisits ? d : p), data[0]!);
  const hotDays = data.filter((d) => d.temp >= HEAT_THRESHOLD);
  const avgHot = hotDays.length ? hotDays.reduce((s, d) => s + d.upaVisits, 0) / hotDays.length : 0;
  const cool = data.filter((d) => d.temp < HEAT_THRESHOLD);
  const avgCool = cool.length ? cool.reduce((s, d) => s + d.upaVisits, 0) / cool.length : 0;
  const hotIncrease = avgCool ? Math.round((avgHot / avgCool - 1) * 100) : 0;

  const stats = [
    {
      icon: Sigma,
      label: "Correlação temp. × UPA",
      value: `r = ${fmt(r, 2)}`,
      hint: r >= 0.7 ? "Correlação forte" : r >= 0.4 ? "Correlação moderada" : "Correlação fraca",
      color: "text-destructive",
    },
    {
      icon: Flame,
      label: `Dias ≥ ${HEAT_THRESHOLD} °C`,
      value: `${hotDays.length} de ${data.length}`,
      hint: hotIncrease > 0 ? `+${hotIncrease}% atendimentos nesses dias` : "Sem dias críticos",
      color: "text-amber-500",
    },
    {
      icon: Hospital,
      label: "Atendimentos UPA (semana)",
      value: totalUpa.toLocaleString("pt-BR"),
      hint: `Pico: ${peak.day} (${peak.upaVisits})`,
      color: "text-accent",
    },
    {
      icon: Activity,
      label: "Internações (semana)",
      value: totalAdm.toLocaleString("pt-BR"),
      hint: `${fmt((totalAdm / totalUpa) * 100)}% dos atendimentos`,
      color: "text-primary",
    },
  ];

  return (
    <div className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-destructive" />
            Correlação Epidemiológica: Calor × Atendimentos de Saúde
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Temperatura máxima e sensação térmica diárias (linhas) contra atendimentos nas UPAs e
            internações (barras) na Região Metropolitana. Clique em um dia para ver o diagnóstico.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <Legend color={COLORS.temp} label="Temp. máxima (°C)" line />
          <Legend color={COLORS.feels} label="Sensação (°C)" line dashed />
          <Legend color={COLORS.upa} label="Atendimentos UPA" />
          <Legend color={COLORS.admissions} label="Internações" />
        </div>
      </div>

      {/* Resumo estatístico */}
      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border/60 bg-background/70 p-2.5">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <s.icon className={`h-3 w-3 ${s.color}`} />
              {s.label}
            </span>
            <p className={`mt-0.5 font-display text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 4, bottom: 0, left: -8 }}
            barGap={2}
            onClick={(state) => {
              const idx = state?.activeTooltipIndex;
              if (typeof idx === "number") onSelectDay(idx);
            }}
            className="cursor-pointer"
          >
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              yAxisId="temp"
              domain={[28, 46]}
              ticks={[28, 31, 34, 37, 40, 43, 46]}
              tickFormatter={(v: number) => `${v}°`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--destructive)", fontSize: 10, fontFamily: "monospace" }}
              width={40}
            />
            <YAxis
              yAxisId="cases"
              orientation="right"
              domain={[0, 150]}
              ticks={[0, 25, 50, 75, 100, 125, 150]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--accent)", fontSize: 10, fontFamily: "monospace" }}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />

            <ReferenceLine
              yAxisId="temp"
              y={HEAT_THRESHOLD}
              stroke="var(--destructive)"
              strokeDasharray="6 4"
              strokeOpacity={0.6}
              label={{
                value: `Limiar de risco sanitário · ${HEAT_THRESHOLD} °C`,
                position: "insideTopLeft",
                fill: "var(--destructive)",
                fontSize: 10,
              }}
            />

            <Bar
              yAxisId="cases"
              dataKey="upaVisits"
              name="Atendimentos UPA"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.day}
                  fill={COLORS.upa}
                  fillOpacity={i === activeDayIndex ? 0.95 : 0.4}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="cases"
              dataKey="hospitalAdmissions"
              name="Internações"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.day}
                  fill={COLORS.admissions}
                  fillOpacity={i === activeDayIndex ? 0.95 : 0.4}
                />
              ))}
            </Bar>

            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="feels"
              name="Sensação"
              stroke={COLORS.feels}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              name="Temp. máxima"
              stroke={COLORS.temp}
              strokeWidth={3}
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                const { cx, cy, index } = props;
                if (cx == null || cy == null) return <g key={index} />;
                const on = index === activeDayIndex;
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={on ? 6 : 3.5}
                    fill={COLORS.temp}
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6, stroke: "var(--card)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Seletor de dia (acessível por teclado) */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {data.map((d, i) => {
          const on = i === activeDayIndex;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => onSelectDay(i)}
              className={`flex flex-col items-center rounded-md px-1 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                on
                  ? "bg-secondary font-bold text-foreground ring-1 ring-primary/40"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                {d.criticalHeat && <span className="h-1.5 w-1.5 rounded-full bg-destructive" />}
                {d.day}
              </span>
              <span className="text-[9px] font-normal">{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* Diagnóstico do dia */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border/80 bg-background/70 p-3.5 shadow-inner sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 font-mono text-sm font-bold text-destructive">
            {activeDay.day}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Diagnóstico de {activeDay.date}
              </span>
              {activeDay.criticalHeat && (
                <span className="animate-pulse rounded bg-destructive/20 px-2 py-0.5 font-mono text-[10px] font-bold text-destructive">
                  Pico Crítico de Sobrecarga
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeDay.note || "Monitoramento regular sem saturação na rede"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4 font-mono text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground">Temp. Máx / Sensação</span>
            <span className="text-sm font-bold text-destructive">
              {fmt(activeDay.temp)}°C · {fmt(activeDay.feels)}°C
            </span>
          </div>
          <div className="h-7 w-px bg-border/80" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground">
              Atendimentos UPA / Internações
            </span>
            <span className="text-sm font-bold text-accent">
              {activeDay.upaVisits} atend. · {activeDay.hospitalAdmissions} intern.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  line,
  dashed,
}: {
  color: string;
  label: string;
  line?: boolean;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {line ? (
        <svg width="18" height="6" aria-hidden>
          <line
            x1="0"
            y1="3"
            x2="18"
            y2="3"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={dashed ? "4 3" : undefined}
          />
        </svg>
      ) : (
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}
