# Changelog · Radar Climático Arboris

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.1.0] - 2026-10-29

### Adicionado
- **Validação Operacional *Human-in-the-Loop* no Card de Microterritório (`ZoneDetail`):**
  - Criação do bloco interno **"Validação Operacional"** com estética *glassmorphism* (`backdrop-blur-md`) abaixo da recomendação da Defesa Civil & Secretaria de Saúde.
  - Dois itens de checklist tático interativos:
    1. *"Confirmar quebra no abastecimento de água local."* (destaque interativo em **Cyan Neon**);
    2. *"Validar disponibilidade de agentes de saúde na região."* (destaque interativo em **Laranja Neon**).
  - Botão de ação condicional **"Confirmar Ação"** no rodapé do bloco: inicia bloqueado (`disabled`) e só adquire cor total e interatividade após o operador validar os dois itens do checklist, mudando para **"Ação Preventiva Confirmada"** após o envio.
  - Ajuste de coerência visual na tag de status: substituição da tag vermelha `"Despacho Imediato"` pela tag âmbar **`"AÇÃO PREVENTIVA"`** (`bg-amber-500`), preservando a altura exata do card.
- **Assistente Virtual e Tour Guiado Interativo (`CLIMA`):**
  - Implementação completa do mascote caranguejo cibernético **CLIMA** (`src/components/tour/ClimaMascot.tsx`, `ClimaTourOverlay.tsx`, `tourStepsData.ts` e `TourContext.tsx`) com síntese de áudio Web Audio API (com botão *Mute/Unmute*).
  - **Menu Principal do Tour** com duas trilhas: **Passo a Passo Geral (13 etapas)** e **Funcionalidades Internas (6 sub-funcionalidades)** que navegam automaticamente entre abas e modais.
  - Contorno de foco (*spotlight*) laranja com cantos retos (`rounded-none`) alinhado à geometria ortogonal dos painéis e barra de rolagem customizada (`clima-tour-scrollbar`).
- **Engenharia de SEO Técnico, Dados Estruturados (Schema.org) e Core Web Vitals:**
  - Implementação completa de Meta Tags (`<title>` otimizado para CTR, `description`, `keywords`, `canonical`, `robots`), Open Graph (`og:*`) e Twitter Cards (`twitter:*`) no MVP (`src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/login.tsx`) e no Portal Institucional (`public/site_arboris/index.html`).
  - Injeção de scripts **JSON-LD (`Schema.org`)** com grafos conectados para `Organization`, `WebSite`, `SoftwareApplication` e `WebApplication`.
  - Refatoração de **HTML5 Semântico** (`<header>`, `<aside>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`), hierarquia de headings com `<h1>` único por página e atributos **ARIA** completos para acessibilidade e rastreabilidade.
  - Otimização de **Core Web Vitals** (`preload` da imagem LCP, `loading="lazy"`, `decoding="async"`, `width`/`height` explícitos) e criação de `public/sitemap.xml` e `public/robots.txt`.
- **Gerador de Relatórios Executivos (`ReportsModal`) e Portal Institucional (`site_arboris`):**
  - Modal de exportação de dossiês técnicos na barra lateral com seleção de escopo, janela temporal e formato (`PDF Executivo` ou `Planilha CSV`).
  - Portal institucional em `public/site_arboris/index.html` com integração ao fórum de transparência e sugestões **Fider** (`arboris.fider.io`).

### Modificado
- **Cabeçalho da Central de Alertas (`AlertsPanel`):**
  - Alinhamento do botão **`+ Novo Alerta`** na mesma linha horizontal, posicionado imediatamente à direita da aba `Histórico`.
  - Remoção do contador numérico redundante ao lado do rótulo da aba `Histórico`.
- **Barras de Rolagem Customizadas (`src/styles.css`):**
  - Criação do utilitário `subtle-scrollbar` (linha cinza sutil) aplicado à `SidebarNav.tsx`.
  - Criação do utilitário `clima-tour-scrollbar` aplicado à janela do Menu Principal do Tour do mascote `CLIMA`.
- **Arquitetura de Layout Command Center (Sidebar + TopHeader + Grid 8x4):**
  - Migração da navegação para `SidebarNav` esquerda retrátil com minimapa `PernambucoMinimap`.
  - `TopHeader` com busca rápida (`/`) e quadrinho unificado (`On line` + hora/data ao vivo + ícone climático dinâmico WMO da Open-Meteo).

---

## [1.3.0] - 2026-10-19

### Adicionado
- **Padrão Corporativo Enterprise de Documentação:**
  - Criado [`/docs/API_CATALOG.md`](docs/API_CATALOG.md) documentando exaustivamente todas as APIs (Open-Meteo, NASA POWER, Landsat 8/9, Sentinel-2, MapBiomas 11, IBGE, Elitech IoT) com 27 campos técnicos estruturados.
  - Criado [`/docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) com análise detalhada das fontes orbitais, biofísicas e censitárias (GEE, MapBiomas, NASA, Landsat, Sentinel, IBGE, Kaggle).
  - Criado [`/docs/DEPENDENCY_MAP.md`](docs/DEPENDENCY_MAP.md) com diagrama Mermaid de rastreabilidade completa (Serviço → API → Módulo → Dashboard → Usuário).
  - Criado [`/docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) contendo o registro de decisões de arquitetura (ADRs 001 a 005) e formulações biofísicas do Projeto Arboris.
- **Manual Oficial do Usuário (`/docs/MANUAL_DO_USUARIO.md`):**
  - Guia didático e operacional completo para gestores municipais, operadores da Defesa Civil e técnicos de saúde pública cobrindo todos os menus, mapas e ferramentas do Radar Climático.
- **Central de Alertas Operacionais Dinâmica & Menos Artificial:**
  - Separação entre a visão de **Alertas Ativos** (ocorrências em aberto) e **Histórico de Alertas** (ocorrências despachadas).
  - Estado vazio inteligente: quando não houver ocorrências críticas em andamento, exibe mensagem clara de segurança ("Nenhum alerta crítico ativo no momento") com botão direto para "Ver Histórico de Alertas".
  - Despacho em tempo real que move alertas atendidos automaticamente para a aba de histórico.
- **Barra de Legenda Dedicada no Mapa IVS:**
  - Deslocamento da legenda da escala de vulnerabilidade social para uma barra horizontal estruturada abaixo do mapa, eliminando qualquer sobreposição visual sobre os bairros do sul (Ibura, Boa Viagem, Imbiribeira).
  - Aumento da altura útil do mapa para `h-[520px]`.

### Corrigido
- **Fixação e Projeção da Comparação Territorial de Vulnerabilidade:**
  - Corrigido o bug onde todas as conexões pontilhadas saíam de Boa Viagem por padrão.
  - Implementada sincronização reativa `useEffect` no `SocialVulnerabilityView` para fixar o bairro selecionado na tela principal (`zoneA`).
  - O clique em qualquer outro bairro no mapa agora atualiza o bairro comparado (`zoneB`) mantendo o bairro principal fixado, com projeção imediata do traço pontilhado ciano e botão de inversão (`⇄`).

---

## [1.2.0] - 2026-10-19

### Adicionado
- **Integração com APIs Públicas em Tempo Real:**
  - Módulo `realtime-weather-service.ts` conectado à API pública da Open-Meteo com calibração microclimática baseada em NDVI para os 8 bairros do Recife.
  - Módulo `nasa-power-service.ts` com ingestão de climatologia de superfície da NASA POWER, cache local com TTL de 12 horas e exportação para CSV.
- **Novos Dashboards Especializados:**
  - `NasaPowerDashboardView.tsx`: Painel de radiação solar, pressão atmosférica e vento.
  - `EnvironmentalAnalysisView.tsx`: Análise geoespacial com dados de referência MapBiomas 11 (25,13% de cobertura vegetal da RMR) e regressão biofísica Landsat ($r = -0.638$).

### Modificado
- Refinamento do Header com contadores diretos de sensores online e offline vinculados aos bairros estudados (sem carimbo de minutos).

---

## [1.1.0] - 2026-10-18

### Adicionado
- **Módulo de Vulnerabilidade Social & Saúde Pública:**
  - Gráfico epidemiológico de curva cruzada (temperatura máxima semanal × admissões nas UPAs).
  - KPIs de população de baixa renda em risco crítico e faixas etárias vulneráveis.
- **Módulo de Cobertura Vegetal & Simulador:**
  - Simulador de plantio de árvores com cálculo de alívio térmico (°C) e sequestro de $\text{CO}_2$.
  - Mosaico orbital com manchas verdes (NDVI) com base no Sentinel-2.

---

## [1.0.0] - 2026-10-14

### Adicionado
- Lançamento inicial do MVP Radar Climático Arboris.
- Mapa térmico vetorial com visualização de calor, vegetação e vulnerabilidade.
- Central de despacho operacional de alertas para a Defesa Civil do Recife.
- Autenticação e perfil de operador governamental.
