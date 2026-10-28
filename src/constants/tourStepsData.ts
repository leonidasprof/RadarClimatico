export type TourCategory =
  | "geral"
  | "sidebar"
  | "minimap"
  | "fontes"
  | "sensores"
  | "kpis"
  | "mapa"
  | "camadas"
  | "indice"
  | "historico"
  | "alertas"
  | "detalhes"
  | "insights"
  | "curva"
  | "sub-mapbiomas"
  | "sub-verde"
  | "sub-nasa"
  | "sub-historico"
  | "sub-vulnerabilidade"
  | "sub-vegetacao";

export interface TourStep {
  id: string;
  category: TourCategory;
  isSubFeature?: boolean;
  requiredTab?: "tempo-real" | "historico" | "verde" | "clima-nasa" | "analise-ambiental" | "alertas" | "indice";
  requiredLayer?: "calor" | "vegetal" | "vulnerabilidade";
  menuTitle: string;
  badgeLabel: string;
  targetTourId: string;
  targetSelector?: string;
  title: string;
  climaSpeech: string;
  climaMood: "waving" | "explaining" | "alert" | "happy";
  positionPreference: "bottom" | "top" | "left" | "right" | "center";
}

export const CLIMA_TOUR_STEPS: TourStep[] = [
  // ─── TOUR GERAL: VISÃO OPERACIONAL EM TEMPO REAL ──────────────────────────
  {
    id: "welcome-hero",
    category: "geral",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Boas-vindas ao Radar",
    badgeLabel: "Apresentação",
    targetTourId: "header-title",
    title: "Olá! Bem-vindo ao Radar Climático",
    climaSpeech:
      "Epa! Tudo bem, gestor e operador? Eu sou o CLIMA, o caranguejo guardião do Recife! 🦀💧 Minha missão é traduzir satélites espaciais, sensores de rua e asfalto quente em decisões práticas para proteger a nossa gente dos extremos de temperatura. Vem comigo conhecer todos os módulos da plataforma!",
    climaMood: "waving",
    positionPreference: "bottom",
  },
  {
    id: "sidebar-nav",
    category: "sidebar",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Menus & Navegação do Sistema",
    badgeLabel: "Menu Lateral",
    targetTourId: "sidebar-nav",
    title: "Navegação Completa da Plataforma",
    climaSpeech:
      "Aqui na barra lateral esquerda você tem acesso direto a todos os nossos centros de comando: Operação em Tempo Real, Comparação & Histórico detalhado, Dashboard Verde com simulador de plantio, Clima NASA POWER oficial, Análise Ambiental MapBiomas, Central de Alertas com contador em tempo real e Emissão de Relatórios Executivos!",
    climaMood: "explaining",
    positionPreference: "right",
  },
  {
    id: "sidebar-minimap",
    category: "minimap",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Recife no Mapa de Pernambuco",
    badgeLabel: "Localização Geográfica",
    targetTourId: "sidebar-minimap",
    title: "Nosso Polo de Monitoramento",
    climaSpeech:
      "Este é o mapa geográfico real do Estado de Pernambuco! O ponto pulsante em ciano marca exatamente as coordenadas da nossa capital (8.05° S, 34.88° O). O Radar Climático cobre toda a Região Metropolitana a partir do coração do litoral pernambucano!",
    climaMood: "happy",
    positionPreference: "right",
  },
  {
    id: "sidebar-sources",
    category: "fontes",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Fontes de Dados & APIs ao Vivo",
    badgeLabel: "Engenharia de Dados",
    targetTourId: "sidebar-sources",
    title: "Sincronização Contínua Multi-Sensor",
    climaSpeech:
      "Olha que transparência: aqui você confere a hora exata da última atualização e as APIs integradas que alimentam nossos algoritmos em tempo real — Open-Meteo para dados atmosféricos ao vivo, satélites orbitais Landsat 8/9, Coleção 11 do MapBiomas e a agência espacial NASA POWER!",
    climaMood: "explaining",
    positionPreference: "right",
  },
  {
    id: "sensors-status",
    category: "sensores",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Status On line, Tema & Perfil",
    badgeLabel: "Controles do Sistema",
    targetTourId: "sensors-status",
    title: "Status On line, Modo Claro/Escuro & Perfil",
    climaSpeech:
      "Aqui no topo você acompanha a rede 100% On line com relógio, data e clima ao vivo! Logo ao lado, aquele botão redondo com contraste alterna instantaneamente entre Modo Claro e Modo Escuro (conforme você preferir trabalhar). E no menu com o seu nome, você pode alterar seus dados de contato e sair do sistema com segurança!",
    climaMood: "happy",
    positionPreference: "bottom",
  },
  {
    id: "kpis-macro",
    category: "kpis",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Painel de Indicadores (KPIs)",
    badgeLabel: "Diagnóstico Rápido",
    targetTourId: "kpi-macro",
    title: "A 'Febre' da Cidade em Tempo Real",
    climaSpeech:
      "Diagnóstico em 4 cartões: Temperatura média da cidade, a Sensação Térmica média em destaque logo abaixo, o pico máximo registrado hoje com o bairro recordista, e o número de cidadãos recifenses em situação de risco térmico cruzado com o Censo IBGE!",
    climaMood: "explaining",
    positionPreference: "bottom",
  },
  {
    id: "map-panel",
    category: "mapa",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Mapa Térmico Espacial",
    badgeLabel: "Visão Territorial",
    targetTourId: "map-panel",
    title: "O Raio-X do Calor nas Ruas",
    climaSpeech:
      "O mapa interativo da RMR! Áreas azuis são refrescadas pela brisa e dossel verde; manchas amarelas e vermelhas representam ilhas de calor severas provocadas pelo asfalto e concreto. Clique em qualquer bairro para focar a análise territorial imediata!",
    climaMood: "explaining",
    positionPreference: "top",
  },
  {
    id: "map-layers",
    category: "camadas",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Lentes & Controles do Mapa",
    badgeLabel: "Camadas & Zoom",
    targetTourId: "map-layers",
    title: "Filtros Estratégicos & Tela Cheia",
    climaSpeech:
      "No topo do mapa, você seleciona o bairro no menu rápido e troca as lentes entre Temperatura (anomalia de calor), Cobertura Vegetal (copas e refúgios) e Vulnerabilidade Social (população exposta). Use o botão no canto direito para expandir o mapa em tela cheia!",
    climaMood: "explaining",
    positionPreference: "bottom",
  },
  {
    id: "thermal-index",
    category: "indice",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Índice Térmico por Bairro",
    badgeLabel: "Ranking Municipal",
    targetTourId: "thermal-index",
    title: "Matriz Comparativa dos Bairros",
    climaSpeech:
      "Esta tabela classifica todos os microterritórios do Recife pelo nível térmico. Você confere a temperatura do ar, a sensação térmica calculada e a letra de risco de A a E. Clique em qualquer linha para selecionar o bairro instantaneamente!",
    climaMood: "happy",
    positionPreference: "top",
  },
  {
    id: "history-card",
    category: "historico",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Histórico de Temperatura",
    badgeLabel: "Curva dos 7 Dias",
    targetTourId: "history-card",
    title: "Tendência Térmica & Consulta por Período",
    climaSpeech:
      "Aqui você acompanha a curva dupla dos últimos 7 dias: a linha laranja mostra a temperatura e a linha ciano mostra a sensação térmica real com o dia de pico destacado. Quer analisar períodos maiores? Basta clicar no botão inferior para abrir a tela de Comparação & Histórico de 7, 14 ou 30 dias!",
    climaMood: "explaining",
    positionPreference: "top",
  },
  {
    id: "alerts-panel",
    category: "alertas",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Central de Alertas Operacionais",
    badgeLabel: "Despacho Imediato",
    targetTourId: "alerts-panel",
    title: "Linha Direta com o Socorro",
    climaSpeech:
      "Alerta ligado salva vidas! Quando a sensação térmica ferve acima do limite da Defesa Civil, este painel acende com as ocorrências do dia. Com um toque em 'Disparar notificação', o plano de contingência é acionado para as equipes de campo!",
    climaMood: "alert",
    positionPreference: "left",
  },
  {
    id: "zone-detail",
    category: "detalhes",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Detalhes do Microterritório",
    badgeLabel: "Plano de Contingência",
    targetTourId: "zone-detail",
    title: "Diagnóstico & Recomendações Operacionais",
    climaSpeech:
      "Este bloco detalha o bairro selecionado: classificação de risco térmico de A a E (com botão para ver o significado), indicadores de umidade e vulnerabilidade, além da Recomendação Operacional para envio emergencial de caminhões-pipa e agentes de saúde da Prefeitura!",
    climaMood: "happy",
    positionPreference: "left",
  },
  {
    id: "insights-panel",
    category: "insights",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Insights & Inteligência Territorial",
    badgeLabel: "Cruzamento Científico",
    targetTourId: "insights-panel",
    title: "Ciência Aplicada à Gestão Pública",
    climaSpeech:
      "Este painel horizontal cruza inteligência biofísica: comprova que cada 10% a mais de copas de árvores arrefece o bairro em até 2,1 °C, identifica o horário de sobrecarga humana (13h às 16h30) e demonstra o papel protetor da brisa marítima costeira!",
    climaMood: "explaining",
    positionPreference: "top",
  },

  // ─── SUB-FUNCIONALIDADES INTERNAS (MÓDULOS ESPECIALIZADOS) ────────────────
  {
    id: "sub-mapbiomas",
    category: "sub-mapbiomas",
    isSubFeature: true,
    requiredTab: "analise-ambiental",
    menuTitle: "MapBiomas & Landsat 8/9",
    badgeLabel: "Biofísica Orbital",
    targetTourId: "sub-mapbiomas-view",
    title: "Ciência de Ponta: MapBiomas & Landsat",
    climaSpeech:
      "Entramos no laboratório científico do Arboris! 🛰️ Aqui cruzamos a Coleção 11 do MapBiomas (que aponta 25,13% de vegetação na RMR) com o sensor termal do Landsat. Nosso modelo matemático comprova: cada 10% a mais de copas de árvores derruba a temperatura urbana em 0,7 °C!",
    climaMood: "explaining",
    positionPreference: "bottom",
  },
  {
    id: "sub-verde",
    category: "sub-verde",
    isSubFeature: true,
    requiredTab: "verde",
    menuTitle: "Dashboard Verde & Simulador",
    badgeLabel: "Planejamento Urbano",
    targetTourId: "sub-green-view",
    title: "A Calculadora de Sombra da EMLURB",
    climaSpeech:
      "Bem-vindo ao centro de reflorestamento urbano! 🌳 Aqui os engenheiros e a EMLURB arrastam o controle deslizante para simular o plantio de mudas. O sistema calcula na hora a queda na sensação térmica, metros quadrados de sombra nova e toneladas de CO₂ sequestradas!",
    climaMood: "happy",
    positionPreference: "bottom",
  },
  {
    id: "sub-nasa",
    category: "sub-nasa",
    isSubFeature: true,
    requiredTab: "clima-nasa",
    menuTitle: "Clima NASA POWER & CSV",
    badgeLabel: "Satélites da NASA",
    targetTourId: "sub-nasa-view",
    title: "Dados Oficiais da Agência Espacial (NASA)",
    climaSpeech:
      "Direto da NASA para a Prefeitura do Recife! ☀️ Aqui você monitora a radiação solar incidente, ventos a 10 metros e umidade do ar. O melhor: use o botão 'Exportar Dados Clima (.CSV)' para baixar planilhas completas e embasar termos de referência e políticas públicas!",
    climaMood: "waving",
    positionPreference: "bottom",
  },
  {
    id: "sub-historico",
    category: "sub-historico",
    isSubFeature: true,
    requiredTab: "historico",
    menuTitle: "Comparação & Histórico de Bairros",
    badgeLabel: "Séries Temporais",
    targetTourId: "sub-history-view",
    title: "Lente Comparativa Bairro a Bairro",
    climaSpeech:
      "Quer tirar uma prova real? ⚖️ Escolha o Bairro A à esquerda e o Bairro B à direita. O sistema compara as curvas dos últimos 3, 7, 14 ou 30 dias, revelando disparidades térmicas de até 8 °C entre um bairro arborizado e outro impermeabilizado!",
    climaMood: "explaining",
    positionPreference: "bottom",
  },
  {
    id: "sub-vulnerabilidade",
    category: "sub-vulnerabilidade",
    isSubFeature: true,
    requiredTab: "tempo-real",
    requiredLayer: "vulnerabilidade",
    menuTitle: "Mapa de Vulnerabilidade Social (IVS)",
    badgeLabel: "Saúde & UPAs",
    targetTourId: "sub-vuln-view",
    title: "Onde o Calor Encontra a Desigualdade",
    climaSpeech:
      "Esta lente territorial é crucial para a Defesa Civil e Saúde Pública! Ela cruza o Índice de Vulnerabilidade Social (IVS) com os atendimentos por insolação nas UPAs de referência. Clique em bairros diferentes para traçar a linha pontilhada luminosa de disparidade!",
    climaMood: "alert",
    positionPreference: "bottom",
  },
  {
    id: "sub-vegetacao",
    category: "sub-vegetacao",
    isSubFeature: true,
    requiredTab: "tempo-real",
    requiredLayer: "vegetal",
    menuTitle: "Lente de Cobertura Arbórea (NDVI)",
    badgeLabel: "Satélite Sentinel-2",
    targetTourId: "sub-vegetal-view",
    title: "O Escudo Verde do Recife em 10 Metros",
    climaSpeech:
      "Aqui o satélite Sentinel-2 enxerga cada copa de árvore com resolução de 10 metros! As manchas verde-escuras mostram nossos oásis naturais, enquanto o cinza expõe onde o asfalto precisa urgentemente de novas mudas e canteiros ecológicos.",
    climaMood: "happy",
    positionPreference: "bottom",
  },
];
