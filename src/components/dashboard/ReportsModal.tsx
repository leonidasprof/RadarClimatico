import { FileText, Download, CheckCircle2, ShieldCheck, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportsModal({ open, onOpenChange }: ReportsModalProps) {
  const reports = [
    {
      id: "boletim-diario",
      title: "Boletim Operacional de Estresse Térmico",
      desc: "Resumo executivo consolidado com picos de calor, anomalias e ações da Defesa Civil nas últimas 24h.",
      format: "PDF",
      date: new Date().toLocaleDateString("pt-BR"),
      size: "1.4 MB",
    },
    {
      id: "vulnerabilidade-ivs",
      title: "Diagnóstico Socioespacial & Microterritórios",
      desc: "Cruzamento do Índice de Vulnerabilidade Social (IVS Censo 2022) com ilhas de calor e sobrecarga de UPAs.",
      format: "PDF",
      date: "Outubro / 2026",
      size: "3.2 MB",
    },
    {
      id: "dados-brutos-csv",
      title: "Base Histórica Bruta de Monitoramento (CSV)",
      desc: "Dados horários de temperatura, sensação térmica, umidade e vento para modelagem e auditoria pública.",
      format: "CSV",
      date: "2022 - 2026",
      size: "820 KB",
    },
  ];

  const handleDownload = (title: string, format: string) => {
    toast.success(`Download iniciado: ${title}`, {
      description: `Arquivo pronto para geração e auditoria no formato ${format}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Central de Relatórios Operacionais
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Exportação de relatórios executivos para a Defesa Civil, EMLURB e Secretaria de Saúde
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-xl border border-border/80 bg-background/50 p-3.5 transition-all hover:bg-muted/40 hover:border-primary/40 flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/20 text-primary font-mono text-[10px] font-bold px-1.5 py-0.2">
                    {rep.format}
                  </span>
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {rep.title}
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {rep.desc}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" />
                    {rep.date}
                  </span>
                  <span>·</span>
                  <span>{rep.size}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(rep.title, rep.format)}
                className="shrink-0 h-8 text-xs gap-1.5 border-border hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Baixar</span>
              </Button>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Dados chancelados pelo Sistema Municipal de Defesa Civil</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
