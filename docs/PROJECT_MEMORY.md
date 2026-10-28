# Memória do Projeto (Project Memory) · Radar Climático Arboris
> **Documento:** `/docs/PROJECT_MEMORY.md`  
> **Classificação:** Corporativa / Enterprise Architecture  
> **Versão:** 1.0.0  
> **Data de Atualização:** 19/10/2026  
> **Status:** Ativo / Fonte Única de Verdade Arquitetural  
> **Público-Alvo:** Engenheiros de Software, Arquitetos, Liderança Técnica, Novos Integrantes (Onboarding)

---

## 1. Resumo Executivo

O **Radar Climático Arboris** é uma plataforma analítica e operacional B2G (*Business to Government*) projetada para mitigar os impactos do estresse térmico urbano e eventos climáticos extremos no Recife e na sua Região Metropolitana. O sistema cruza dados orbitais multiespectrais (Landsat 8/9, Sentinel-2), climatologia de superfície (NASA POWER, Open-Meteo), dados socioespaciais do Censo IBGE 2022 e atendimento hospitalar de emergência das UPAs metropolitanas.

Este documento consolida o histórico arquitetural, as decisões de design (ADRs), as regras de negócio biofísicas e os padrões de engenharia adotados na evolução do produto.

---

## 2. Visão do Produto & Personas

### 2.1 O Problema
Recife apresenta um dos maiores índices de vulnerabilidade climática da América Latina, combinando:
1. Elevada densidade populacional costeira em planície de maré;
2. Déficit histórico de arborização em bairros centrais e periferias (ex.: Santo Amaro com apenas 5% de copa, Ilha do Leite com alta impermeabilização);
3. Sobrecarga aguda na rede hospitalar (UPAs) em dias com temperaturas de superfície acima de 35 °C.

### 2.2 Personas Atendidas
- **Jorge Gonçalves (57 anos) – Coordenador da Defesa Civil (CODECIR):** Precisa identificar o pico térmico diário, monitorar anomalias de calor em tempo real e emitir despachos operacionais com um clique para equipes de campo.
- **Dra. Mariana Lins – Gestora de Vigilância em Saúde (Secretaria de Saúde do Recife):** Monitora a sobrecarga nas UPAs e correlaciona bairros com alto IVS com a demanda de hidratação venosa e internações hospitalares.
- **Carlos Eduardo – Engenheiro Florestal da EMLURB:** Utiliza o simulador de arrefecimento urbano para calcular quantas árvores precisam ser plantadas para atingir a meta municipal de 30% de copa contínua e qual o alívio térmico gerado em graus Celsius.

---

## 3. Registros de Decisões Arquiteturais (ADRs)

---

### `ADR-001`: Adoção do Meta-Framework TanStack Start + Nitro Engine
- **Status:** **Aprovado**
- **Contexto:** O projeto necessitava de uma infraestrutura full-stack moderna, com suporte a Server-Side Rendering (SSR), roteamento tipado de ponta a ponta e capacidade de deploy agnóstico de nuvem (Cloudflare Workers, Vercel Edge, Docker ou servidores locais).
- **Decisão:** Adotar **TanStack Start (`@tanstack/react-start`)** com motor de build **Vite 8** e runtime de servidor **Nitro**.
- **Consequências:**
  - *Positivas:* Roteamento 100% type-safe com geração automática de manifesto (`Route.createFileRoute`), build híbrido cliente/SSR extremamente rápido (< 5 segundos), compatibilidade nativa com edge computing.
  - *Mitigações:* Necessidade de garantir que módulos com acesso a APIs de navegador (`localStorage`, `window`) sejam protegidos ou isolados do ciclo de vida SSR.

---

### `ADR-002`: Eliminação de Dependências Tailwind Ad-Hoc em Favor de Design Tokens HSL/OKLCH
- **Status:** **Aprovado**
- **Contexto:** Estilos inline ou classes utilitárias dispersas sem semântica prejudicavam a manutenção do tema e a acessibilidade entre Light e Dark Mode.
- **Decisão:** Implementar uma matriz de design tokens semânticos no CSS global:
  - `--heat-1` até `--heat-5` para o gradiente térmico da superfície;
  - `--canopy` para o verde de copa florestal;
  - `--vuln` e `--destructive` para os alertas de vulnerabilidade social.
- **Consequências:**
  - Transição de tema instantânea e harmoniosa sem quebras de layout.

---

### `ADR-003`: Resiliência Offline-First & Camadas de Fallback para APIs Públicas
- **Status:** **Aprovado**
- **Contexto:** Gestores públicos e defesas civis frequentemente operam sob instabilidade de rede ou durante desastres que comprometem a conectividade.
- **Decisão:** Toda chamada a APIs externas (Open-Meteo, NASA POWER) deve possuir:
  1. Timeout rígido (8s a 12s via AbortController);
  2. Cache persistente em `localStorage` com TTL;
  3. Snapshot biofísico de contingência embutido em código TypeScript para garantir 100% de disponibilidade em caso de falha de terceiros.
- **Consequências:**
  - A interface nunca entra em estado de tela branca ou trava por falha de API externa.

---

### `ADR-004`: Mecanismo de Fixação e Comparação Territorial Vetorial (Traço Pontilhado)
- **Status:** **Aprovado (Refinado em 19/10/2026)**
- **Contexto:** Na análise de vulnerabilidade social, o usuário escolhe um bairro prioritário na tela principal (ex.: Santo Amaro ou Ibura) e necessita comparar os indicadores desse bairro fixado contra qualquer outro território do Recife sem perder o ponto de referência. Anteriormente, o traço conectava-se incorretamente a Boa Viagem por um default hardcoded.
- **Decisão:**
  - O bairro de entrada (`initialZone`) é fixado estritamente como **Bairro A (Origem)** e sincronizado via `useEffect`.
  - Clicar em qualquer outro bairro no mapa via `onSelectComparisonZone` atualiza dinamicamente o **Bairro B (Destino)** sem alterar o bairro A fixado.
  - O traço SVG pontilhado é renderizado entre $(A.x, A.y)$ e $(B.x, B.y)$ com halo de alto contraste e ponto pulsante de fluxo.
  - A legenda IVS foi deslocada para uma barra inferior dedicada, ampliando a altura do mapa para 520px e eliminando sobreposição visual sobre os bairros do sul.

---

### `ADR-005`: Ingestão Científica do Projeto Arboris (Landsat 8/9 ST_B10 + MapBiomas 11)
- **Status:** **Aprovado**
- **Contexto:** O protótipo continha dados mockados sem fundamentação científica explícita.
- **Decisão:** Incorporar integralmente as equações biofísicas do arquivo `ProjetoArborisAV1i.pynb`:
  - Modelo de regressão de arrefecimento: $LST = -0.11 \cdot Copa\% + 36.8$ ($r = -0.638, R^2 = 40.7\%$);
  - Cobertura de referência MapBiomas 11 para a RMR: $25.13\%$;
  - Dados dos 14 municípios da RMR catalogados com latitude, longitude e metas de plantio.

---

### `ADR-006`: Fidelidade Cromática dos Círculos do Mapa Térmico às Classes Bioclimáticas (A a E)
- **Status:** **Aprovado**
- **Contexto:** Na tela inicial, os círculos dos bairros no Mapa Térmico utilizavam a função estática `heatVar(temp)` com faixas genéricas (>36°, >34°, >32°, >30°), o que fazia todos os bairros ficarem azuis (`--heat-1`) em temperaturas amenas como 27,5 °C, divergindo da classificação bioclimática exibida no card de detalhe territorial (onde Ibura exibia Classe B com cor verde-limão, mas a bolinha no mapa ficava azul).
- **Decisão:**
  - O cálculo da cor da camada de calor no mapa (`getZoneColor`) passa a adotar prioritariamente as cores oficiais das classes bioclimáticas (`ratingDefinitions[z.rating].color`).
  - Cada círculo no mapa agora exibe a letra da classe (A a E) com alto contraste no seu núcleo interno.
  - A etiqueta dos bairros passa a incluir temperatura e classe (ex.: `Ibura · 28,5° (B)`) com fundo legível.
  - A legenda da camada térmica foi atualizada para exibir os 5 blocos cromáticos das classes A a E com os limiares de sensação térmica (≤32°, ≤35°, ≤38,5°, ≤42°, >42°).
  - O painel `RatingPanel` e o comparativo `ComparisonHistoryView` foram sincronizados para utilizar `ratingDefinitions[rating].color`.

---

### `ADR-007`: Inversão de Tema Padrão para Modo Claro e Redimensionamento da Tela de Login
- **Status:** **Aprovado (28/10/2026)**
- **Contexto:** Pesquisas de usabilidade com os usuários finais indicaram preferência majoritária pelo tema claro durante o uso diurno nos centros de operações. Além disso, o card de autenticação (`LoginPage`) exibia proporções excessivas (`max-w-lg`, logo de 420px) e utilizava assets de baixa legibilidade em fundos claros (`fundo_claro.png`).
- **Decisão:**
  - O tema padrão da aplicação foi alterado para **Modo Claro (`light`)** em `theme-context.tsx`, com chave de cache `arboris_theme_v2` preservando a opção de alternância manual para o modo escuro a critério do usuário.
  - O card de login foi redimensionado para uma escala compacta e equilibrada (`max-w-[400px]`, `p-6 sm:p-7`).
  - A logo da tela de login foi substituída pelos assets oficiais vetorizados de alto contraste: `/logo-arboris2.png` (com tipografia marinho de alta visibilidade para fundo claro) e `/logo-arboris.png` (com tipografia branca luminescente para o modo escuro), com altura contida (`h-20 sm:h-24`).

---

### `ADR-008`: Redesenho do Layout com Sidebar Lateral, Mapa de PE, Sensação Térmica Open-Meteo e Grid 8x4 Alinhada
- **Status:** **Aprovado (28/10/2026)**
- **Contexto:** Necessidade de redistribuição das informações para eliminar áreas vazias, maximizar o aproveitamento horizontal do dashboard e conferir alinhamento perfeito de todos os quadros (conforme mockup operacional de referência). Requerimento de inclusão de Sensação Térmica da Cidade a partir de API aberta, mapa estadual de Pernambuco localizando o Recife, status "On line" em destaque no modo claro com relógio, data e ícone meteorológico dinâmico automático.
- **Decisão:**
  1. **Sidebar Lateral Esquerda (`SidebarNav`):**
     - Logo oficial da Arboris adaptativa ao tema (`/logo-arboris2.png` em modo claro e `/logo-arboris.png` em modo escuro).
     - Menus verticais: `Tempo real`, `Comparação & Histórico`, `Dashboard Verde`, `Clima NASA POWER`, `MapBiomas & Landsat`, `Alertas`, `Índice Térmico` e `Relatórios` (com modal interativo de exportação).
     - Componente `PernambucoMinimap`: silhueta SVG do Estado de Pernambuco com ponto pulsante com brilho e anel de radar ciano demarcando a localização litorânea exata do Recife (8.05° S, 34.88° O).
     - Bloco `Dados atualizados`: horário real do carimbo de medição (`↳ HH:mm`) e lista de fontes ativas (`Open-Meteo API`, `Landsat 8/9`, `MapBiomas · NASA POWER`).
     - Rodapé de versão da plataforma: `v1.0 MVP · Radar Climático · Plataforma Arboris Integrada`.
  2. **Barra Superior (`TopHeader`):**
     - Título institucional: `SISTEMA DE MONITORAMENTO E ALERTA DE ILHAS DE CALOR`, subtítulo `RECIFE / PE · PLATAFORMA ARBORIS` e slogan em destaque `“MONITORAR HOJE, PROTEGER AMANHÃ”`.
     - Barra de pesquisa territorial com atalho de teclado `/` e seleção de bairros.
     - Indicador de status em alto contraste no tema claro: pílula esmeralda `● On line`.
     - Relógio digital em tempo real e data do dia gerada automaticamente em português (`Seg, 24 de jun de 2024`).
     - Ícone de tempo dinâmico automático (Sol, Chuva, Nublado, Tempestade) derivado da tabela de códigos WMO (`weather_code`) da API pública Open-Meteo.
     - Central de notificações, alternador de modo claro/escuro e menu do operador logado.
  3. **Sensação Térmica da Cidade (`apparent_temperature`):**
     - Integração do parâmetro aberto `apparent_temperature` da Open-Meteo API ao serviço `realtime-weather-service.ts`.
     - Exibição destacada no KPI de Temperatura Média da Cidade e na tabela de bairros.
  4. **Layout Alinhado em Grid 8x4:**
     - **Coluna Esquerda (8 colunas):**
       - `Mapa térmico — Região Metropolitana do Recife`: botões de camadas (`Temperatura`, `Cobertura vegetal`, `Vulnerabilidade`), maximizar/restaurar, controles de zoom flutuantes (`+`, `-`, `⌖`), texto sobre o mar `OCEANO ATLÂNTICO`, escala gráfica (`0 2 4 6 km`) e card flutuante de legenda (`28° a 45°`) com checkboxes de camadas (`Bairros`, `Estações meteorológicas`, `Ilhas de calor`, `Rede viária`, `Hidrografia`).
       - Linha inferior abaixo do mapa: dois quadros perfeitamente alinhados lado a lado: `Índice Térmico por bairro` (tabela ordenada com classes) e `Histórico de temperatura` (gráfico de linhas duplas com curva de temperatura laranja e curva de sensação térmica ciano, com barra de métricas Média, Máxima, Variação e Tendência).
     - **Coluna Direita (4 colunas):**
       - `Alertas do dia` com alternância para Histórico, botão `Novo Alerta` e card de conformidade da Defesa Civil.
       - Detalhe territorial do bairro selecionado (`ZoneDetail`) com badge de classificação A-E, indicadores biofísicos, caixa de Recomendação Operacional com ícone de caminhão-pipa da Defesa Civil e botões de atalho.
       - Painel de `Insights` com botão `Ver todos →`, ícones representativos (Árvore esmeralda e Usuários âmbar) e métricas consolidadas.
  5. **Responsividade & Mascote CLIMA:**
     - Gaveta lateral retrátil no mobile e tablet acionada pelo menu hambúrguer.
     - Preservação dos seletores `data-tour` para garantir a funcionalidade ininterrupta do mascote CLIMA.

---

## 4. Regras de Negócio Biofísicas e Equações

### 4.1 Cálculo da Temperatura de Superfície Terrestre (LST)
A partir da banda 10 do sensor TIRS do Landsat 8/9:
$$LST = \frac{T_B}{1 + \left(\frac{\lambda \cdot T_B}{\rho}\right) \cdot \ln(\varepsilon)}$$
Onde:
- $T_B$: Temperatura de brilho do topo da atmosfera;
- $\lambda = 10.895\ \mu\text{m}$;
- $\rho = \frac{h \cdot c}{\sigma} \approx 1.438 \times 10^{-2}\ \text{m}\cdot\text{K}$;
- $\varepsilon$: Emissividade superficial estimada pelo método de Sobrino et al. baseado na proporção de vegetação ($P_v$).

### 4.2 Projeção do Impacto de Arborização Urbana
A simulação calcula o alívio térmico baseado na taxa de resfriamento evapotranspirativo da Mata Atlântica:
$$\Delta T = -0.11 \cdot \Delta\text{Copa}_{\%}$$
$$\Delta\text{Sensação} = \Delta T \times 1.25 \quad (\text{efeito combinado de sombreamento e retenção de umidade})$$
$$\text{Mudas Necessárias} = \frac{\text{Área Bairro} \cdot \Delta\text{Copa}_{\%}}{\text{Área Copa Média por Árvore}\ (35\ m^2)}$$
$$\text{Sequestro } \text{CO}_2\ (\text{ton/ano}) = \text{Mudas} \times 0.022\ \text{ton/ano/árvore}$$

---

## 5. Padrões de Código e Diretrizes de Engenharia

1. **Imutabilidade e Tipagem Estrita:** Toda estrutura de dados deve possuir tipo explícito no TypeScript (`Zone`, `AlertItem`, `RealtimeWeatherSnapshot`).
2. **Zero Poluição de Código:** Não deixar comentários inúteis ou trechos de código comentados. Preservar rigorosamente a documentação existente.
3. **Verificação de Build Obrigatória:** Nenhuma alteração é finalizada sem validação prévia de compilação via `npm run build` (Client + SSR + Nitro).
4. **Sincronização Contínua de Documentação:** Alterações de regras de negócio, endpoints ou arquitetura exigem atualização imediata dos arquivos de `/docs/`.
