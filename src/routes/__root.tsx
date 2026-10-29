import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

const ARBORIS_SCHEMA_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://radarclimatico.vercel.app/#organization",
      name: "Equipe Arboris — Radar Climático (CESAR / COP Recife)",
      url: "https://radarclimatico.vercel.app/",
      logo: {
        "@type": "ImageObject",
        url: "https://radarclimatico.vercel.app/logo-arboris.png",
        width: 512,
        height: 512,
      },
      email: "radarclimatico@recife.pe.gov.br",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Cais do Apolo, 925 - Bairro do Recife",
        addressLocality: "Recife",
        addressRegion: "PE",
        addressCountry: "BR",
      },
      sameAs: ["https://www.instagram.com/arboristeam/", "https://arboris.fider.io/"],
    },
    {
      "@type": "WebSite",
      "@id": "https://radarclimatico.vercel.app/#website",
      url: "https://radarclimatico.vercel.app/",
      name: "Radar Climático Recife — Plataforma Arboris",
      description:
        "Sistema B2G de monitoramento microclimático, detecção de ilhas de calor urbanas e alertas antecipados para Defesa Civil e gestão pública do Recife.",
      inLanguage: "pt-BR",
      publisher: {
        "@id": "https://radarclimatico.vercel.app/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://radarclimatico.vercel.app/#software",
      name: "Radar Climático — Arboris v2.0 MVP",
      applicationCategory: "GovernmentApplication, EnvironmentalMonitoringApplication",
      operatingSystem: "Web",
      url: "https://radarclimatico.vercel.app/",
      description:
        "Dashboard operacional B2G para monitoramento em tempo real de ilhas de calor urbano, vulnerabilidade social (IVS), simulação de plantio arbóreo e despacho de alertas no Recife.",
      author: {
        "@id": "https://radarclimatico.vercel.app/#organization",
      },
      areaServed: {
        "@type": "City",
        name: "Recife",
        containedInPlace: {
          "@type": "State",
          name: "Pernambuco",
        },
      },
      featureList: [
        "Monitoramento térmico hiperlocal em tempo real (Open-Meteo & Sensores IoT)",
        "Mapeamento de ilhas de calor via satélite Landsat 8/9 e MapBiomas Coleção 11",
        "Cruzamento de Vulnerabilidade Social (IVS) e cobertura vegetal (NDVI Sentinel-2)",
        "Simulador de infraestrutura verde e arborização urbana (EMLURB)",
        "Central de alertas antecipados de ondas de calor para a Defesa Civil (CODECIR)",
        "Séries climáticas oficiais NASA POWER com exportação CSV e relatórios executivos",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
      },
    },
  ],
};

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4" role="main">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida no Radar Climático.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao Painel Principal
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4" role="main">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro inesperado ao processar os dados. Tente atualizar ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "Radar Climático Recife | Monitoramento de Ilhas de Calor e Alertas B2G — Arboris",
      },
      {
        name: "description",
        content:
          "Sistema B2G de inteligência microclimática e alerta antecipado de ondas e ilhas de calor no Recife. Dados em tempo real via IoT, Landsat 8/9, MapBiomas e NASA POWER para Defesa Civil e EMLURB.",
      },
      {
        name: "keywords",
        content:
          "Radar Climático Recife, ilhas de calor Recife, monitoramento térmico urbano, ondas de calor Defesa Civil, infraestrutura verde EMLURB, arborização urbana, sensores IoT clima, MapBiomas Landsat Recife, NASA POWER clima, Arboris CESAR COP",
      },
      { name: "author", content: "Equipe Arboris (CESAR / COP Recife)" },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "theme-color", content: "#0f172a" },
      { name: "google", content: "notranslate" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Radar Climático — Arboris" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:url", content: "https://radarclimatico.vercel.app/" },
      {
        property: "og:title",
        content:
          "Radar Climático Recife | Monitoramento de Ilhas de Calor e Alertas B2G — Arboris",
      },
      {
        property: "og:description",
        content:
          "Monitorar hoje, proteger amanhã: painel de inteligência territorial e microclimática para detectar, comunicar e mitigar ilhas de calor no Recife.",
      },
      {
        property: "og:image",
        content: "https://radarclimatico.vercel.app/logo-arboris.png",
      },
      {
        property: "og:image:alt",
        content:
          "Logotipo do Radar Climático Arboris — Sistema de Monitoramento de Ilhas de Calor no Recife",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content:
          "Radar Climático Recife | Monitoramento de Ilhas de Calor e Alertas B2G — Arboris",
      },
      {
        name: "twitter:description",
        content:
          "Inteligência microclimática em tempo real, sensores IoT e satélites orbitais para mitigar ondas de calor e orientar o plantio urbano no Recife.",
      },
      {
        name: "twitter:image",
        content: "https://radarclimatico.vercel.app/logo-arboris.png",
      },
      {
        name: "twitter:image:alt",
        content:
          "Painel Operacional Radar Climático Arboris — Monitoramento de Ilhas de Calor no Recife",
      },
    ],
    links: [
      { rel: "canonical", href: "https://radarclimatico.vercel.app/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.open-meteo.com" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      {
        rel: "preload",
        as: "image",
        href: "/logo-arboris.png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/logo-arboris.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="notranslate" translate="no">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ARBORIS_SCHEMA_JSON_LD),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
