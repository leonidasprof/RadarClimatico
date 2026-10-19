# Changelog · Radar Climático Arboris

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
