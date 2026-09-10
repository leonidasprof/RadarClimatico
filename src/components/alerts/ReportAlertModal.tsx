import { useState } from "react";
import { zones, type AlertItem, type AlertLevel } from "@/lib/radar-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Send, MapPin, Clock, ShieldAlert } from "lucide-react";

interface ReportAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAlert: (alert: AlertItem) => void;
}

/**
 * Modal do Módulo de Alertas (Épico 1)
 * Permite que a Defesa Civil ou gestores operacionais emitam alertas territoriais
 * de ondas de calor imediatas para bairros específicos da Região Metropolitana do Recife.
 */
export function ReportAlertModal({
  open,
  onOpenChange,
  onAddAlert,
}: ReportAlertModalProps) {
  // Estado inicial do formulário pré-selecionando o bairro de maior criticidade
  const [selectedZone, setSelectedZone] = useState<string>(zones[1]?.name || "Santo Amaro");
  const [level, setLevel] = useState<AlertLevel>("critico");
  const [title, setTitle] = useState("Onda de calor crítica detectada");
  const [detail, setDetail] = useState(
    "Sensores registraram temperatura de superfície acima de 36 °C com umidade relativa em queda e alto tráfego de pedestres sem cobertura arbórea."
  );
  const [eta, setEta] = useState("13h30 – 16h30");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !detail.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Regra de negócio: criar o novo alerta com carimbo de tempo imediato
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      level,
      zone: selectedZone,
      title: title.trim(),
      detail: detail.trim(),
      time: "agora mesmo",
      eta: eta.trim() || "Próximas 3 horas",
      notified: true,
    };

    onAddAlert(newAlert);
    onOpenChange(false);

    toast.success("Alerta emitido com sucesso!", {
      description: `Alerta nível ${level.toUpperCase()} para ${selectedZone} despachado aos canais operacionais da Defesa Civil.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <DialogTitle className="text-base font-semibold">
              Reportar Zona de Calor & Emitir Alerta Regional
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Disparo de contingência microclimática para acionamento de frotas, bebedouros móveis e comunicados à população.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Seletor de Bairro e Nível */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Bairro / Região
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name} ({z.temp}°C · Rating {z.rating})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                Severidade do Alerta
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AlertLevel)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="critico">Crítico (Vermelho · Acima de 36°C)</option>
                <option value="alto">Alto (Laranja · Acima de 34°C)</option>
                <option value="moderado">Moderado (Amarelo · Acima de 32°C)</option>
              </select>
            </div>
          </div>

          {/* Janela de Previsão */}
          <div>
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Janela de Previsão / Vigência (ETA)
            </label>
            <input
              type="text"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              placeholder="Ex: 13h30 – 16h30 ou Próximas 4 horas"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Título do Alerta */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Título do Alerta
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ilha de calor severa em corredor comercial"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Detalhes operacionais */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Detalhamento Operacional & Recomendações
            </label>
            <textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Descreva a situação em solo, áreas sem sombra e orientações para agentes."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3.5 py-2 text-xs font-medium text-destructive-foreground transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Emitir Alerta Imediato
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
