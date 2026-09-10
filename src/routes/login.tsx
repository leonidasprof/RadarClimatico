import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ShieldAlert,
  Sun,
  Moon,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso ao Radar Climático — Arboris" },
      {
        name: "description",
        content:
          "Autenticação no painel de controle de monitoramento térmico e ondas de calor no Recife.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("jorge.goncalves@recife.pe.gov.br");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redireciona para a raiz se já estiver logado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Por favor, preencha o e-mail institucional.");
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success("Acesso concedido com sucesso!", {
        description: `Bem-vindo ao Radar Climático.`,
      });
      navigate({ to: "/" });
    } else {
      toast.error(res.error || "Falha na autenticação.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Botão de alternância de tema no topo direito */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur transition-colors hover:bg-card focus:outline-none"
          aria-label="Alternar tema claro/escuro"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>

      <div className="w-full max-w-lg">
        {/* Card Principal */}
        <div className="panel overflow-hidden p-6 sm:p-8 backdrop-blur-md shadow-2xl border-border/80">
          {/* Cabeçalho da Marca */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex justify-center w-full">
              <img
                src={isDark ? "/fundo_escuro.png" : "/fundo_claro.png"}
                alt="Logo Arboris - Radar Climático"
                className="w-full max-w-[420px] h-auto object-contain drop-shadow-md transition-all duration-200"
              />
            </div>

            <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Central de Operações
            </h1>
          </div>

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                E-mail institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@recife.pe.gov.br"
                  className="pl-9 bg-background/50 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/90 block">
                Senha de acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-9 bg-background/50 text-sm font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-primary text-primary-foreground font-medium text-sm gap-2 shadow-md hover:opacity-95 cursor-pointer"
            >
              {submitting ? "Autenticando..." : "Entrar no Radar Climático"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Aviso Institucional */}
          <div className="mt-6 rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center justify-center gap-2 text-center">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
            <span>
              Ambiente de validação COP e CESAR School.
            </span>
          </div>
        </div>

        {/* Rodapé da Tela */}
        <p className="mt-4 text-center text-xs text-muted-foreground font-mono">
          Radar Climático v1.0 MVP
        </p>
      </div>
    </div>
  );
}
