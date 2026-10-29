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
      {
        title:
          "Acesso Operacional | Radar Climático Recife — Central de Monitoramento Térmico Arboris",
      },
      {
        name: "description",
        content:
          "Portal de autenticação para operadores da Defesa Civil e gestores públicos do Recife no sistema de monitoramento de ilhas de calor e alertas climáticos Arboris.",
      },
      {
        property: "og:title",
        content:
          "Acesso Operacional | Radar Climático Recife — Central de Monitoramento Térmico Arboris",
      },
      {
        property: "og:description",
        content:
          "Central de comando B2G para monitoramento de ondas de calor, vulnerabilidade térmica e infraestrutura verde na cidade do Recife.",
      },
      {
        name: "twitter:title",
        content:
          "Acesso Operacional | Radar Climático Recife — Arboris",
      },
      {
        name: "twitter:description",
        content:
          "Autenticação institucional no painel de monitoramento de ilhas de calor e alertas antecipados do Recife.",
      },
    ],
  }),
  component: LoginPage,
});

export function LoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void } = {}) {
  const { isAuthenticated, login, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("jorge.goncalves@recife.pe.gov.br");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redireciona para a raiz se já estiver logado (ao acessar /login diretamente)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate({ to: "/" });
      }
    }
  }, [isAuthenticated, isLoading, navigate, onLoginSuccess]);

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
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate({ to: "/" });
      }
    } else {
      toast.error(res.error || "Falha na autenticação.");
    }
  };

  return (
    <main
      role="main"
      aria-label="Autenticação na Central de Operações do Radar Climático Recife"
      className="relative flex min-h-screen flex-col items-center justify-center p-4"
    >
      {/* Botão de alternância de tema no topo direito */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur transition-colors hover:bg-card focus:outline-none"
          aria-label="Alternar tema claro/escuro"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" aria-hidden="true" />
          )}
        </button>
      </div>

      <article className="w-full max-w-[400px]" aria-label="Formulário de login institucional">
        {/* Card Principal */}
        <div className="panel overflow-hidden p-6 sm:p-7 backdrop-blur-md shadow-xl border-border/80">
          {/* Cabeçalho da Marca */}
          <header className="flex flex-col items-center text-center">
            <div className="relative flex justify-center w-full py-1">
              <img
                src={isDark ? "/logo-arboris.png" : "/logo-arboris2.png"}
                alt="Logotipo Arboris — Radar Climático de Monitoramento de Ilhas de Calor no Recife"
                width={240}
                height={96}
                fetchPriority="high"
                decoding="async"
                className="h-20 sm:h-24 w-auto max-w-[260px] object-contain transition-all duration-200"
              />
            </div>

            <h1 className="mt-4 text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Central de Operações — Radar Climático Recife
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Sistema de Monitoramento e Alerta de Ondas de Calor
            </p>
          </header>

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="mt-5 space-y-3.5" aria-label="Credenciais de acesso institucional">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-foreground/90 block">
                E-mail institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@recife.pe.gov.br"
                  className="pl-9 bg-background/60 text-sm h-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-foreground/90 block">
                Senha de acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-9 bg-background/60 text-sm font-mono h-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-primary text-primary-foreground font-medium text-sm gap-2 shadow-md hover:opacity-95 cursor-pointer mt-1"
            >
              {submitting ? "Autenticando..." : "Entrar no Radar Climático"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          {/* Aviso Institucional */}
          <div className="mt-5 rounded-lg border border-border/60 bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-center justify-center gap-2 text-center">
            <ShieldAlert className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>
              Ambiente de validação COP e CESAR School.
            </span>
          </div>
        </div>

        {/* Rodapé da Tela */}
        <p className="mt-3 text-center text-[11px] text-muted-foreground font-mono">
          Radar Climático v2.0 MVP · Recife
        </p>
      </article>
    </main>
  );
}
