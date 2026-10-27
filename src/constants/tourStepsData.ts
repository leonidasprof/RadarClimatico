export type TourCategory =
  | "geral"
  | "sensores"
  | "kpis"
  | "mapa"
  | "camadas"
  | "alertas"
  | "detalhes"
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
      "Epa! Tudo bem, operador? Eu sou o CLIMA, o caranguejo guardião do Recife! 🦀💧 Minha missão é traduzir satélites espaciais, sensores de rua e asfalto quente em decisões práticas para proteger a nossa gente dos extremos de temperatura. Vem comigo conhecer os cantos do sistema!",
    climaMood: "waving",
    positionPreference: "bottom",
  },
  {
    id: "sensors-status",
    category: "sensores",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Sensores e IoT ao Vivo",
    badgeLabel: "Conexões em Campo",
    targetTourId: "sensors-status",
    title: "Nossos Termômetros Urbanos Conectados",
    climaSpeech:
      "Essas luzinhas verdes são os nossos postos avançados nos bairros! Funcionam como termômetros urbanos conectados 24h por dia. Se a temperatura der um salto em Santo Amaro ou no Ibura, a gente fica sabendo no mesmo instante, sem ter que adivinhar!",
    climaMood: "explaining",
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
    title: "A 'Febre' da Cidade em 4 Números",
    climaSpeech:
      "Olha só que prático: aqui você bate o olho e vê a temperatura média da cidade, o recorde máximo registrado hoje, quantos microterritórios estão sufocando de calor e a quantidade de cidadãos expostos ao risco térmico. É a febre urbana medida em segundos!",
    climaMood: "happy",
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
      "Este é o mapa do Recife como você nunca viu! Áreas azuis são refrescadas pela brisa e sombras; áreas em amarelo e vermelho-escuro viram frigideiras urbanas por causa do concreto e falta de árvores. Clique em qualquer bairro para focar a análise nele!",
    climaMood: "explaining",
    positionPreference: "top",
  },
  {
    id: "map-layers",
    category: "camadas",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Lentes e Camadas do Mapa",
    badgeLabel: "Filtros Estratégicos",
    targetTourId: "map-layers",
    title: "Troque as Lentes de Investigação",
    climaSpeech:
      "Aqui você ganha superpoderes! Alterne entre a lente de Calor (temperatura), Cobertura Vegetal (onde temos dossel de árvores) e Vulnerabilidade Social (onde vivem idosos e famílias que mais sofrem sem refrigeração). O cruzamento perfeito para políticas públicas!",
    climaMood: "explaining",
    positionPreference: "bottom",
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
      "Alerta ligado salva vidas! Quando a sensação térmica ferve acima do limite aceitável da Defesa Civil, este painel acende. Com um clique em 'Disparar notificação', o alerta vai direto para o rádio das equipes de campo e aplicativo oficial!",
    climaMood: "alert",
    positionPreference: "left",
  },
  {
    id: "zone-detail",
    category: "detalhes",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Recomendações por Órgão Público",
    badgeLabel: "Plano de Ação",
    targetTourId: "zone-detail",
    title: "Ação Sob Medida para Cada Secretaria",
    climaSpeech:
      "Saber que tá quente é bom, mas agir é melhor ainda! Aqui eu mastigo as ordens de serviço: Defesa Civil distribui água, EMLURB irriga praças, CTTU alivia semáforos para motociclistas não cozinharem no sol e a Saúde coloca as UPAs de sobreaviso!",
    climaMood: "happy",
    positionPreference: "left",
  },
  {
    id: "hourly-curve",
    category: "curva",
    requiredTab: "tempo-real",
    requiredLayer: "calor",
    menuTitle: "Curva do Dia & Horário de Pico",
    badgeLabel: "Previsão Diurna",
    targetTourId: "hourly-curve",
    title: "A Montanha-Russa Térmica do Dia",
    climaSpeech:
      "Aqui você vê a escalada do sol hora a hora. Dá pra antecipar em que momento a cidade vai bater o pico da tarde e quando a brisa da noite vai começar a aliviar. Perfeito para programar rondas e operações externas!",
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
