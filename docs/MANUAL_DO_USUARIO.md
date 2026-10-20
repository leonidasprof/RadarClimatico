# Manual do Usuário · Radar Climático Arboris
> **Documento:** Guia Oficial de Operação e Uso do Sistema  
> **Versão:** 1.3.0  
> **Data:** Outubro de 2026  
> **Público-Alvo:** Gestores Públicos, Coordenadores da Defesa Civil (CODECIR), Agentes de Saúde Pública (UPAs), Técnicos da EMLURB, Planejadores Urbanos e Operadores do COP-ARIES.

---

## 1. Bem-vindo ao Radar Climático Arboris

O **Radar Climático Arboris** é uma plataforma de inteligência geoespacial e microclimática desenvolvida para auxiliar a administração pública e as defesas civis a **detectar, antecipar, comunicar e mitigar as ilhas de calor e eventos climáticos extremos no Recife**.

O sistema combina dados orbitais de satélites (NASA Landsat 8/9, ESA Sentinel-2), previsões meteorológicas públicas em tempo real (Open-Meteo), séries de radiação solar (NASA POWER), dados censitários (IBGE) e o fluxo de atendimentos das Unidades de Pronto Atendimento (UPAs).

Este manual foi elaborado para orientar você, passo a passo, sobre **o que cada menu, botão, gráfico e mapa faz**, permitindo que você tome decisões rápidas e embasadas para proteger a população recifense.

---

## 2. Visão Geral da Interface

Ao acessar o sistema, a tela divide-se em quatro grandes áreas visuais:
1. **Barra Superior (Header):** Controle de sessão, relógio de tempo real, status dos sensores e alternância de tema visual.
2. **Menu Principal de Navegação (Abas):** Acesso aos diferentes módulos especializados do sistema.
3. **Área Central (Mapas e Gráficos):** Monitoramento térmico espacial, simulações de plantio de árvores e curvas diárias.
4. **Painel Lateral Direito (Ações Operacionais):** Detalhamento instantâneo do bairro selecionado e central de alertas de ondas de calor.

---

## 3. Barra Superior (Header)

Localizada no topo de todas as páginas, a barra superior oferece contexto operacional imediato:

| Elemento | O que faz / Como usar |
|:---|:---|
| **Logo Arboris & Brasão do Recife** | Identificação institucional do projeto em parceria com a Prefeitura do Recife e CESAR School. |
| **Relógio "Ao vivo · HH:MM"** | Exibe a hora local exata e reativa do Recife, confirmando que o sistema está em monitoramento contínuo. |
| **Indicadores "8 online" e "0 offline"** | Exibem a quantidade de sensores e dataloggers IoT ativos em campo ou indisponíveis (correspondentes aos bairros estudados), com leitura operacional direta e sem carimbo de minutos. |
| **Botão Modo Claro / Modo Escuro (Sol/Lua)** | Alterna entre o tema escuro (ideal para centros de operações noturnos ou baixa luminosidade) e o tema claro (otimizado para ambientes iluminados e relatórios diurnos). |
| **Botão de Contato / Suporte** | Abre canal direto com os desenvolvedores e suporte técnico da plataforma. |
| **Perfil do Operador & Sair** | Mostra o usuário logado (ex.: Coordenador da Defesa Civil) e permite encerrar a sessão com segurança. |

---

## 4. Menu Principal de Navegação (Abas Superiores)

O sistema conta com 7 módulos de trabalho selecionáveis a qualquer momento:

```
[ Tempo Real ]  [ Histórico ]  [ Dashboard Verde ]  [ Clima NASA ]  [ Análise Ambiental ]  [ Alertas ]  [ Índice ]
```

### 4.1. Aba `Tempo Real` (Visão Central Padrão)
- **Finalidade:** É o centro de comando do operador. Exibe os 4 cartões de KPIs macro da cidade, o mapa de calor com manchas térmicas dinâmicas, a curva de pico horário do dia, a central de alertas do dia e o painel de recomendações operacionais por órgão municipal.
- **Cartões de Indicadores Estratégicos (KPIs):**
  1. **Temp. média da cidade:** Média aritmética ponderada da temperatura em tempo real obtida via API pública do Open-Meteo.
  2. **Maior temperatura do dia:** Durante as 24 horas do dia, este bloco informa a temperatura real mais alta registrada na cidade até o momento (ex.: Santo Amaro). Avalia estritamente as horas já decorridas hoje e as leituras em tempo real, sem antecipar previsões de horários futuros. Pela manhã ou em períodos com temperaturas amenas/moderadas (< 32 °C), o sistema não rotula como pico, exibindo o status de "Máxima até o momento". O termo "Pico registrado hoje" só é ativado caso a temperatura alcance patamares elevados (≥ 32 °C). Caso a temperatura caia no decorrer da noite, o valor mais alto alcançado à tarde permanece gravado até as 23:59. À meia-noite (00:00), o marcador reseta para o novo ciclo diário.
  3. **Zonas em criticidade:** Quantidade de microterritórios monitorados operando nas classes D ou E de estresse térmico.
  4. **População exposta:** Estimativa de cidadãos residentes em áreas críticas com alta vulnerabilidade social associada.
- **Quando usar:** No dia a dia de monitoramento e durante a tomada de decisões imediatas de despacho de equipes.

### 4.2. Aba `Histórico` (Séries Temporais e Comparação)
- **Finalidade:** Permite comparar o comportamento térmico de dois bairros ao longo de diferentes períodos (últimos 3 dias, 7 dias, 14 dias ou 30 dias).
- **Como usar:** Selecione o Bairro A no menu à esquerda e o Bairro B à direita. O sistema confronta as curvas de temperatura, o déficit de sombra e as anomalias registradas.

### 4.3. Aba `Dashboard Verde` (Infraestrutura Urbana)
- **Finalidade:** Painel voltado aos técnicos de meio ambiente e EMLURB para priorizar ações de plantio e arborização viária.
- **Como usar:** Visualize quais bairros estão mais distantes da meta da Organização Mundial da Saúde (OMS) de 30% de copa contínua e planeje intervenções de mitigação.

### 4.4. Aba `Clima NASA` (NASA POWER Dashboard)
- **Finalidade:** Consulta dados consolidados da agência espacial americana (NASA) sobre radiação solar incidente ($MJ/m^2/dia$), pressão barométrica, umidade do ar e vento a 10 metros de altitude.
- **Recurso especial:** Botão **"Exportar Dados Clima (.CSV)"** para baixar a planilha oficial para estudos acadêmicos ou relatórios de governo.

### 4.5. Aba `Análise Ambiental` (MapBiomas & Biofísica)
- **Finalidade:** Apresenta a modelagem científica do Projeto Arboris. Mostra a taxa de cobertura vegetal da Região Metropolitana do Recife (25,13% segundo a Coleção 11 do MapBiomas) e o modelo de regressão linear que correlaciona a densidade de copas com a queda na temperatura de superfície ($r = -0.638$).

### 4.6. Aba `Alertas` (Visão Expandida)
- **Finalidade:** Abre a central de despacho operacional em tela cheia para coordenadores da Defesa Civil gerenciarem todas as ocorrências de calor da cidade.

### 4.7. Aba `Índice` (Matriz Classificatória A a E)
- **Finalidade:** Tabela técnica que explica o que significa cada classificação bioclimática (de "Classe A - Excelente conforto térmico" até "Classe E - Emergência / Risco Crítico de insolação").

---

## 5. O Mapa Térmico e Seletores de Camadas

O mapa central é totalmente interativo. No canto superior direito do mapa, você encontra três camadas estratégicas:

```
[ Calor ]  [ Cobertura vegetal ]  [ Vulnerabilidade ]
```

### 5.1. Camada "Calor" (Mapa Térmico Padrão)
- **O que exibe:** Círculos representativos dos bairros com cores térmicas (azul para áreas frescas, amarelo para moderadas e vermelho-escuro pulsante para picos de calor excessivo).
- **Como interagir:** Clique em qualquer círculo de bairro (ex.: Santo Amaro ou Boa Viagem). O painel lateral direito e as recomendações se ajustam imediatamente para o bairro clicado.

---

## 6. Módulo de Vulnerabilidade Social (IVS)

Ao clicar no botão **"Vulnerabilidade"** (no seletor de camadas do mapa ou no detalhe do bairro), o sistema carrega o **Mapa Territorial de Vulnerabilidade Social e Saúde**.

### 6.1. Como funciona a Fixação do Bairro Principal (Bairro A)
1. **Fixação Automática:** O bairro que você estava visualizando na tela principal (por exemplo, **Santo Amaro**) torna-se automaticamente o **Bairro Fixado (A)**.
2. O sistema exibe um badge identificador: `Vulnerabilidade Social · Santo Amaro [Bairro Fixado]`.
3. Todos os cartões de indicadores do topo (IVS, atendimentos de emergência nas UPAs, população de baixa renda em risco e internações) passam a refletir os dados deste bairro fixado.

### 6.2. Como Fazer Comparações Diretas pelo Mapa
1. O mapa territorial exibe a malha viária, os rios e os pinos de todos os bairros.
2. **Clique em qualquer outro bairro no mapa** (por exemplo, clique em **Casa Forte**, **Dois Irmãos** ou **Boa Viagem**).
3. **O que acontece:**
   - O bairro fixado (A) permanece fixo no lugar;
   - O bairro que você clicou torna-se o **Bairro Comparado (B)**;
   - Uma **linha pontilhada luminosa (ciano com ponto pulsante)** sairá do bairro fixado (A) apontando diretamente para o bairro que você clicou (B);
   - A tabela lateral de contraste social e saúde compara instantaneamente a diferença de vulnerabilidade entre eles (ex.: Santo Amaro IVS 76 vs Casa Forte IVS 24, indicando uma disparidade de +52 pontos).

### 6.3. Botão Inverter Bairros (`⇄`)
- Caso queira transformar o Bairro B em bairro principal fixado, clique no botão **`⇄`** ao lado dos seletores de bairro. As posições e indicadores serão invertidos na mesma hora.

### 6.4. Legenda da Escala IVS
- Para não cobrir os bairros do sul da cidade (como Ibura e Boa Viagem), a **Escala de Vulnerabilidade (0 a 100)** fica posicionada em uma barra limpa **diretamente abaixo do mapa**:
  - `0 a 39 (Ciano):` Baixa vulnerabilidade social (infraestrutura adequada e refúgio térmico);
  - `40 a 69 (Amarelo):` Vulnerabilidade moderada (requer atenção preventiva);
  - `70 a 100 (Vermelho):` Vulnerabilidade crítica / emergencial (alto déficit de saneamento, aglomerações e população exposta ao calor).

---

## 7. Módulo de Cobertura Vegetal & Simulador de Arrefecimento

Ao selecionar a camada **"Cobertura vegetal"**, você acessa a ferramenta de planejamento ambiental baseada no satélite Sentinel-2.

### 7.1. O que você visualiza
- O mapa exibe as **manchas verdes de dossel arbóreo** (NDVI orbital com resolução de 10 metros).
- Áreas como o Parque Estadual de Dois Irmãos e Poço da Panela aparecem em verde denso, enquanto Santo Amaro e Centro aparecem em tons claros indicando deserto verde.

### 7.2. Como usar o Simulador de Plantio de Árvores
1. Na coluna lateral direita, localize o controle deslizante **"Acréscimo de Arborização"**.
2. Arraste o cursor de **0%** até **+40%**.
3. **Resultados calculados em tempo real:**
   - **Queda de Temperatura de Superfície:** Redução estimada em graus Celsius (ex.: $-2.4\text{ °C}$);
   - **Alívio na Sensação Térmica:** Queda percebida pelos pedestres (ex.: $-3.0\text{ °C}$);
   - **Mudas Necessárias:** Quantidade de árvores nativas que a EMLURB precisa plantar naquele território;
   - **Sombreamento Criado:** Área de sombra contínua gerada em metros quadrados ($m^2$);
   - **Sequestro de Carbono:** Volume anual estimado de $\text{CO}_2$ absorvido (toneladas/ano).

---

## 8. Central de Alertas Operacionais

A **Central de Alertas** foi desenhada para operação ágil pela Defesa Civil (CODECIR) e órgãos de resgate.

### 8.1. Modo "Alertas do Dia"
- Exibe as **ocorrências do dia em aberto** geradas dinamicamente via limiares térmicos ou registradas manualmente.
- Cada alerta informa:
  - Severidade: **Crítico** (vermelho), **Alto** (laranja) ou **Moderado** (amarelo);
  - Bairro afetado, data e horário da detecção (carimbo temporal);
  - Temperatura no momento do disparo vs. temperatura atual (com aviso de alteração brusca de tempo);
  - Janela de risco operacional (ex.: janela 13h20 – 16h00);
  - Botão **"Disparar notificação"**.

### 8.2. Como Despachar um Alerta
1. Localize o alerta crítico pendente.
2. Clique no botão azul **"Disparar notificação"**.
3. O sistema despacha a mensagem para o rádio da Defesa Civil e o aplicativo operacional, marcando o alerta com o selo verde **"Despachado"**.
4. O alerta despachado sai automaticamente da lista do dia e é transferido para o **Histórico**.

### 8.3. Tela "Nenhum alerta crítico no dia de hoje"
- Quando todos os alertas forem atendidos ou a cidade estiver em condições normais de conforto térmico, o painel exibirá uma mensagem clara de tranquilidade:
  - Ícone de escudo verde: **"Nenhum alerta crítico no dia de hoje"**;
  - Texto informativo: *"Todas as estações e microterritórios do Recife estão operando dentro dos limiares térmicos toleráveis da Defesa Civil."*;
  - Botão de acesso rápido: **"Ver Histórico de Alertas"**.

### 8.4. Modo "Histórico de Alertas"
- Clique no botão **"Histórico"** no cabeçalho dos alertas.
- Aqui ficam arquivadas todas as ocorrências despachadas nas últimas 24 horas, permitindo auditoria, controle de tempo de resposta e relatórios operacionais.

### 8.5. Como Registrar um Novo Alerta Manualmente
- Clique no botão vermelho **"+ Novo Alerta"** no topo da lista.
- Uma janela se abrirá para você escolher o bairro, a severidade e digitar as observações de campo dos agentes ou denúncias de cidadãos.

---

## 9. Painel Lateral: Recomendações por Órgão Público

Ao selecionar qualquer bairro, o painel lateral direito sintetiza recomendações operacionais dedicadas para cada órgão municipal:

- **Defesa Civil (CODECIR):** Monitoramento de pedestres vulneráveis, instalação de pontos de hidratação e rondas com viaturas em áreas sem sombra.
- **EMLURB:** Priorização de arborização de calçadas, manutenção de canteiros e irrigação de praças em horários de menor evaporação.
- **CTTU:** Ajuste de tempos semafóricos em cruzamentos críticos para reduzir o tempo de exposição de pedestres e motociclistas sob sol direto.
- **Secretaria de Saúde:** Alerta de prontidão nas UPAs de referência territorial para casos de síncope, desidratação e pico hipertensivo associado ao estresse térmico.

---

## 10. Perguntas Frequentes (FAQ)

### P: Os dados de temperatura do mapa são atualizados automaticamente?
**R:** Sim. O sistema consulta automaticamente a API meteorológica pública a cada ciclo e calibra os valores para cada bairro de acordo com sua densidade vegetal e albedo. Você também pode clicar no botão de recarregar clima caso deseje forçar uma sincronização manual.

### P: O sistema funciona se a internet cair temporariamente?
**R:** Sim. O Radar Climático Arboris possui tecnologia *Offline-First*. Se a conexão cair, o sistema continuará operando utilizando os dados em cache e os modelos biofísicos armazenados no navegador.

### P: Como faço para emitir um relatório para a imprensa ou secretarias?
**R:** Você pode acessar a aba **"Clima NASA"** e clicar em **"Exportar Dados Clima (.CSV)"** para obter as planilhas consolidadas, ou capturar telas diretamente dos módulos de Vulnerabilidade e Dashboard Verde.

---

## 11. Contatos e Suporte Técnico

Para dúvidas operacionais, solicitação de treinamento ou reporte de instabilidades no sistema:

- **Central COP-ARIES / Defesa Civil:** Canal direto via painel de administração.
- **Equipe de Engenharia Arboris (CESAR School):**
  - Gestão e Operações: `ogaf@cesar.school`
  - Liderança Técnica: `lma@cesar.school`
  - Dev, Design e Experiência do Usuário: `lls@cesar.school`
