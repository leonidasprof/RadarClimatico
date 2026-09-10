import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, type UserProfile } from "@/context/auth-context";
import { toast } from "sonner";
import { User, Mail, Phone, Briefcase, Building, CheckCircle2 } from "lucide-react";

interface UserContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserContactModal({ open, onOpenChange }: UserContactModalProps) {
  const { user, updateContact } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        department: user.department || "",
      });
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Por favor, preencha ao menos o nome e o e-mail.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      updateContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role.trim(),
        department: formData.department.trim(),
      });
      setIsSubmitting(false);
      toast.success("Informações de contato atualizadas com sucesso!");
      onOpenChange(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Informações de Contato
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Atualize seus canais de notificação e dados funcionais no Radar Climático.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/90">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Nome completo
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Jorge Gonçalves"
              className="bg-background/50 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/90">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              E-mail institucional
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu.nome@recife.pe.gov.br"
              className="bg-background/50 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/90">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Telefone / WhatsApp de Emergência
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(81) 98845-2104"
              className="bg-background/50 text-sm font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              Utilizado para o recebimento de alertas críticos de ondas de calor via SMS/WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/90">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Cargo / Função
              </label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Coordenador de Risco"
                className="bg-background/50 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/90">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                Órgão / Departamento
              </label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Ex: Defesa Civil / CODECIR"
                className="bg-background/50 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs bg-primary text-primary-foreground gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
