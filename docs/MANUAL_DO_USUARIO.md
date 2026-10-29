# Manual do Usuário · Radar Climático Arboris
> **Documento:** Guia Oficial de Operação e Uso do Sistema  
> **Versão:** 2.1.0  
> **Data:** 29 de Outubro de 2026  
> **Público-Alvo:** Gestores Públicos, Coordenadores da Defesa Civil (CODECIR), Agentes de Saúde Pública (UPAs), Técnicos da EMLURB, Planejadores Urbanos e Operadores do COP-ARIES.

---

## 1. Bem-vindo ao Radar Climático Arboris

O **Radar Climático Arboris** é uma plataforma B2G (*Business to Government*) de inteligência geoespacial e microclimática desenvolvida para auxiliar a administração pública e as defesas civis a **detectar, antecipar, comunicar e mitigar as ilhas de calor e eventos climáticos extremos no Recife**.

O sistema combina dados orbitais de satélites (NASA Landsat 8/9, ESA Sentinel-2), previsões meteorológicas públicas em tempo real (Open-Meteo), séries de radiação solar (NASA POWER), mapeamento de cobertura vegetal (MapBiomas Coleção 11), dados censitários (IBGE Censo 2022) e o fluxo de atendimentos das Unidades de Pronto Atendimento (UPAs).

Este manual foi elaborado para orientar você, passo a passo, sobre **o que cada menu, botão, checklist operacional, gráfico, mapa e assistente virtual faz**, permitindo tomar decisões rápidas, seguras e embasadas para proteger a população recifense.

---

## 2. Visão Geral da Interface

Ao acessar o sistema (após autenticar-se na **Central de Operações** em `/login`), a tela divide-se em cinco áreas principais:
1. **Barra Lateral Esquerda (`SidebarNav`):** Centro de comando com os 8 módulos da plataforma, minimapa geográfico de Pernambuco, status das APIs em tempo real e barra de rolagem sutil (`subtle-scrollbar`).
2. **Barra Superior (`TopHeader`):** Título oficial, barra de pesquisa de bairros com atalho `/`, quadrinho unificado de status (`On line` + hora + data + ícone climático dinâmico), alternador de tema Claro/Escuro e menu de perfil do operador.
3. **Área Central (KPIs, Mapa Térmico, Índice e Curva de 7 Dias):** Diagnóstico macro em 4 cartões, mapa interativo da RMR e quadros comparativos alinhados.
4. **Coluna Operacional Direita (`AlertsPanel` + `ZoneDetail`):** Central de Alertas do Dia/Histórico e ficha detalhada do microterritório com **Recomendação Operacional** e **Checklist de Validação (*Human-in-the-Loop*)**.
5. **Assistente Virtual `CLIMA` (Mascote Guia):** Caranguejo guardião interativo no canto inferior direito que conduz tours guiados passo a passo por toda a plataforma.

---

## 3. Barra Superior (`TopHeader`)

Localizada de forma fixa no topo do painel, a barra superior oferece contexto operacional imediato:

| Elemento | O que faz / Como usar |
|:---|:---|
| **Título & Slogan Institucional** | Exibe o título oficial **`SISTEMA DE MONITORAMENTO E ALERTA DE ILHAS DE CALOR`** e o lema **`MONITORAR HOJE, PROTEGER AMANHÃ`**. |
| **Barra de Busca Territorial (`/`)** | Permite pesquisar rapidamente qualquer bairro monitorado. Pressione a tecla **`/`** em qualquer momento para focar instantaneamente no campo de busca e selecionar o bairro desejado na lista suspensa (que já exibe temperatura e Classe A–E). |
| **Quadrinho Unificado: `● On line` + Hora + Data + Clima** | Exibe a pílula verde pulsante **`On line`**, o relógio em tempo real (`HH:mm`), a data atual por extenso e o ícone meteorológico dinâmico (Sol, Parcialmente Nublado, Nublado, Chuva ou Tempestade) sincronizado via API Open-Meteo. **Clique neste quadrinho** a qualquer momento para forçar uma nova sincronização imediata com as estações meteorológicas. |
| **Botão Alternar Modo Claro / Escuro (`Contrast`)** | Botão circular com ícone de contraste que alterna instantaneamente entre o **Modo Claro** (padrão diurno de alta legibilidade) e o **Modo Escuro** (ideal para salas de comando e operação noturna). |
| **Menu de Perfil do Operador** | Exibe as iniciais, nome e cargo do operador logado (ex.: *Jorge Gonçalves · Coordenador de Operações*). Ao clicar, abre o menu suspenso com o departamento (*Defesa Civil / CODECIR*), a opção **"Alterar dados de contato"** (abre modal para atualizar telefone/perfil) e **"Sair da conta"**. |

---

## 4. Barra Lateral Esquerda (`SidebarNav`) e Módulos do Sistema

A barra lateral esquerda possui rolagem suave e discreta (linha cinza sutil) e organiza os **8 módulos principais** do Radar Climático, além do minimapa estadual e status das fontes de dados:

```text
[ Tempo real ]
[ Comparação & Histórico ]
[ Dashboard Verde ]
[ Clima NASA POWER ]
[ MapBiomas & Landsat ]
[ Alertas ]
[ Índice Térmico ]
[ Relatórios ]
```

### 4.1. Módulo `Tempo real` (Visão Operacional Padrão)
- **Cartões de Indicadores Estratégicos (KPIs Macro no Topo):**
  1. **Temperatura média da cidade & Sensação:** Exibe a temperatura média atual do Recife, a variação em relação à média e, logo abaixo em destaque, a **Sensação Térmica média (`apparent_temp`)** calculada pela API Open-Meteo.
  2. **Maior temperatura do dia:** Informa a máxima real registrada hoje nas horas já decorridas e o bairro recordista (ex.: *Santo Amaro (12h)*). Abaixo de 32 °C exibe *"Máxima até o momento"*; ao atingir ≥ 32 °C ativa o rótulo *"Pico registrado hoje"*.
  3. **Zonas em criticidade:** Quantidade de microterritórios operando nas classes severas **D** ou **E** em relação ao total monitorado.
  4. **População exposta:** Estimativa de moradores expostos ao estresse térmico cruzada com vulnerabilidade social (Censo IBGE 2022).
- **Grid Principal 8x4 Alinhada:**
  - **À esquerda (8 colunas):** Mapa Térmico Interativo no topo e, logo abaixo, dois painéis lado a lado: **Índice Térmico por Bairro** (tabela classificatória clicável) e **Histórico de Temperatura** (gráfico de curva dupla de 7 dias comparando Temperatura × Sensação Térmica, com botão inferior *"Consultar por período (7, 14 ou 30 dias)"*).
  - **À direita (4 colunas):** **Central de Alertas** no topo e **Detalhes do Microterritório (`ZoneDetail`)** abaixo.
  - **Base horizontal (12 colunas):** Painel de **Insights & Inteligência Territorial** cruzando cobertura arbórea, janela crítica de calor (13h às 16h30) e efeito da brisa marítima.

### 4.2. Módulo `Comparação & Histórico`
- **Finalidade:** Permite comparar lado a lado o comportamento térmico de dois bairros (**Bairro A × Bairro B**) em múltiplos níveis temporais (*Drill-down* por Ano, Mês e janelas de 3, 7, 14 ou 30 dias).
- **Como usar:** Escolha o Bairro A à esquerda e o Bairro B à direita para confrontar curvas históricas, amplitudes térmicas e disparidades de cobertura vegetal.

### 4.3. Módulo `Dashboard Verde`
- **Finalidade:** Painel de planejamento florestal urbano para a EMLURB e Secretaria de Meio Ambiente.
- **Como usar:** Identifique o maior refúgio térmico, a zona de maior déficit arbóreo e simule intervenções de plantio para atingir a meta de 30% de cobertura vegetal recomendada pela OMS.

### 4.4. Módulo `Clima NASA POWER`
- **Finalidade:** Monitora séries oficiais da NASA (*Langley Research Center*) para o Recife: Temperatura a 2m (`T2M`), Precipitação Corrigida (`PRECTOTCORR`), Velocidade do Vento a 10m (`WS10M`) e Pressão Atmosférica (`PS`).
- **Recurso especial:** Botão **"Exportar Dados Clima (.CSV)"** compatível com Excel, Python/Pandas e Google Colab para fundamentar termos de referência e relatórios públicos.

### 4.5. Módulo `MapBiomas & Landsat` (Análise Ambiental)
- **Finalidade:** Laboratório biofísico do Arboris que cruza a Coleção 11 do MapBiomas (25,13% de cobertura vegetal na RMR) com a radiometria termal do satélite Landsat 8/9 ($r = -0.638$), permitindo exportar a grade espacial de 1 km do Recife em `.CSV`.

### 4.6. Módulo `Alertas` (Visão Expandida)
- **Finalidade:** Abre a Central de Alertas em tela cheia (grade de 3 colunas) para gerenciamento massivo de ocorrências pela Defesa Civil.

### 4.7. Módulo `Índice Térmico`
- **Finalidade:** Exibe a matriz completa de classificação microclimática (**Classes A a E**) de todos os bairros monitorados do Recife.

### 4.8. Módulo `Relatórios` (`ReportsModal`)
- **Finalidade:** Abre o gerador de **Relatórios Executivos e Técnicos** da plataforma, permitindo exportar sínteses gerenciais para a Defesa Civil, EMLURB e Secretaria de Saúde.

---

## 5. O Mapa Térmico e Seletores de Camadas

No cabeçalho do **Mapa térmico real**, você dispõe de uma barra de ferramentas unificada à direita:
1. **Seletor Rápido `Bairro:`** Menu suspenso para focar diretamente em qualquer bairro monitorado.
2. **Seletor de Lentes / Camadas:**
   ```text
   [ Temperatura ]  [ Cobertura vegetal ]  [ Vulnerabilidade ]
   ```
3. **Botão Maximizar / Tela Cheia (`⛶`):** Expande o mapa sobre toda a tela para análise detalhada em salas de situação.
4. **Controles Flutuantes do Mapa:**
   - **Canto superior esquerdo:** Botões de Zoom (`+`, `-`) e botão **Centralizar no Recife (`⌖`)**.
   - **Canto superior direito:** Card flutuante com a barra gradiente de **Temperatura de superfície (28° a 45°)** e **5 checkboxes de camadas operacionais** (*Bairros*, *Estações meteorológicas*, *Ilhas de calor*, *Rede viária* e *Hidrografia*) que podem ser ligados ou desligados individualmente.

---

## 6. Módulo de Vulnerabilidade Social (IVS)

Ao clicar na lente **"Vulnerabilidade"** (no topo do mapa ou nos botões de atalho do bairro), o sistema abre o **Mapa Territorial de Vulnerabilidade Social e Saúde**.

### 6.1. Fixação Automática do Bairro Principal (Bairro A) e Comparação Direta (Bairro B)
1. O bairro selecionado na tela principal torna-se automaticamente o **Bairro Fixado (A)**.
2. **Clique em qualquer outro bairro no mapa** para defini-lo como **Bairro Comparado (B)**.
3. Uma **linha pontilhada luminosa em ciano** conecta instantaneamente o Bairro A ao Bairro B, enquanto a tabela lateral calcula a disparidade de IVS, atendimentos nas UPAs e população exposta.
4. Use o botão **Inverter Bairros (`⇄`)** caso deseje permutar o Bairro A pelo Bairro B.

---

## 7. Módulo de Cobertura Vegetal & Simulador de Plantio

Ao selecionar a lente **"Cobertura vegetal"**, você acessa o mosaico de dossel arbóreo (baseado no satélite Sentinel-2 com resolução de 10m) e o **Simulador Interativo de Arrefecimento**:
- Arraste o controle deslizante **"Acréscimo de Arborização"** de **0% a +40%** para calcular em tempo real:
  - **Queda na Temperatura de Superfície (°C)** e **Alívio na Sensação Térmica (°C)**;
  - **Quantidade de Mudas Nativas Necessárias**;
  - **Área de Sombra Nova ($m^2$)** e **Sequestro Anual de $\text{CO}_2$ (ton/ano)**.

---

## 8. Central de Alertas Operacionais (`AlertsPanel`)

Localizada no topo da coluna direita da tela principal (e também disponível em tela cheia no menu `Alertas`), a Central de Alertas possui cabeçalho compacto em linha única:

```text
[ ● Alertas do dia (N) | 🕒 Histórico ]          [ + Novo Alerta ]
```

### 8.1. Aba "Alertas do dia" e Filtros de Severidade
- Exibe o contador de ocorrências ativas pendentes de despacho.
- Quando há alertas ativos, você pode filtrá-los rapidamente pelas pílulas **Todos**, **Crítico**, **Alto** ou **Moderado**.
- Cada cartão de alerta exibe o bairro, o horário da detecção, o comparativo entre a temperatura do disparo e a temperatura atual, a janela de risco (ex.: `janela 13h20–16h00`) e o botão **"Disparar notificação"**.
- Ao clicar em **"Disparar notificação"**, o alerta é transmitido às equipes de campo e movido automaticamente para a aba **Histórico**.

### 8.2. Estado Seguro ("Nenhum alerta crítico no dia de hoje")
- Quando não há alertas pendentes (`Alertas do dia 0`), o painel exibe o card verde de conformidade da Defesa Civil com dois botões alinhados lado a lado na base:
  - **`Ver Histórico de Alertas (N)`**: alterna imediatamente para os alertas já despachados.
  - **`+ Registrar Alerta`**: abre o modal para cadastro manual de uma nova ocorrência.

### 8.3. Botão "+ Novo Alerta"
- Posicionado sempre à direita da aba **Histórico**, permite registrar a qualquer momento uma nova ocorrência ou anomalia térmica observada em campo.

---

## 9. Detalhes do Microterritório & Validação Operacional (*Human-in-the-Loop*)

Logo abaixo da Central de Alertas, o painel **Detalhes do Microterritório (`ZoneDetail`)** apresenta o diagnóstico completo do bairro selecionado:

### 9.1. Cabeçalho Classificatório e Indicadores Biofísicos
- Exibe o nome do bairro, a pílula `Classe [A–E] · [Nível]` e o selo quadrado com a letra da classe.
- Clique em **`ⓘ significado`** abaixo do selo para expandir ou recolher a matriz explicativa completa das Classes **A** a **E**.
- Lista os 5 indicadores vitais do bairro: **Temperatura (°C)**, **Sensação térmica (°C)**, **Umidade relativa (%)**, **Cobertura vegetal (%)** e **Vulnerabilidade social (0–100)**.

### 9.2. Bloco "Recomendação Operacional" com Tag `AÇÃO PREVENTIVA`
- Destaca a diretriz recomendada para a **Defesa Civil & Secretaria de Saúde** (ex.: *Despacho de caminhões-pipa e agentes comunitários*), acompanhada no canto superior direito pela tag âmbar **`AÇÃO PREVENTIVA`**, garantindo coerência visual com o protocolo de atenção e prevenção territorial.

### 9.3. Botão "Validar Operação" e Checklist de "Validação Operacional" (*Human-in-the-Loop*)
Por padrão, o bloco exibe a recomendação operacional explicada de forma limpa e apresenta abaixo o botão **`Validar Operação`**. Ao clicar em **`Validar Operação`**, abre-se o sub-bloco translúcido (*glassmorphism*) **Validação Operacional (`0/2 verificados`)** em duas etapas sequenciais:
1. **Etapa 1 — Confirmar (Destaque Cyan Neon):** *"1. Confirmar quebra no abastecimento de água local."*
2. **Etapa 2 — Validar (Destaque Laranja Neon, liberada após confirmar a Etapa 1):** *"2. Validar disponibilidade de agentes de saúde na região."*

### 9.4. Botão Condicional "Confirmar Ação"
- Dentro da **Validação Operacional** expandida, o botão **`Confirmar Ação`** inicia **desabilitado (bloqueado e com opacidade reduzida)**.
- **Regra de Liberação:** O operador precisa primeiro **confirmar** o item 1 e depois **validar** o item 2 (`2/2 verificados`) para que o botão **`Confirmar Ação`** adquira sua cor total de destaque e fique clicável.
- Ao clicar em **`Confirmar Ação`**, o sistema registra a validação humana, exibe uma notificação de confirmação, recolhe o checklist e altera o estado do botão principal para **`✓ Ação Confirmada · Rever Validação`** (em verde esmeralda).
- Sempre que você seleciona outro bairro no mapa, o fluxo é reiniciado automaticamente para uma nova validação independente.

### 9.5. Botões de Atalho Rápido (Rodapé do Card)
Na base do card do microterritório, 5 botões dão acesso instantâneo às lentes analíticas daquele bairro:
- **`Cobertura vegetal`** | **`Vulnerabilidade`**
- **`Clima NASA`** | **`MapBiomas`**
- **`⇄ Comparar este bairro com outro`**

---

## 10. Assistente Virtual `CLIMA` (Tour Guiado Interativo)

O **CLIMA** é o caranguejo guardião do Recife e assistente virtual integrado ao Radar Climático para guiar novos operadores e gestores:

1. **Botão Flutuante ("Falar com o CLIMA"):** Sempre disponível no canto inferior direito da tela. Clique nele a qualquer momento para iniciar ou retomar a apresentação guiada.
2. **Convite Inicial:** Ao entrar no sistema, o CLIMA pergunta se você deseja conhecer o Radar Climático (*"Vamos"* ou *"Não, explorar sozinho"*).
3. **Spotlight Retangular Preciso & Pop-up Laranja:** Durante o tour, o sistema ilumina exatamente o painel explicado com um contorno laranja retangular nítido (alinhado ao formato dos blocos) e exibe o balão explicativo do CLIMA com botões **`Voltar`**, **`Próximo`** e **`Menu Principal`**.
4. **Menu Principal do Tour:** Ao clicar em **`Menu Principal`** no balão do CLIMA, abre-se uma janela escura gamificada (com barra de rolagem estilizada no tema da janela) contendo duas abas:
   - **`Passo a Passo Geral (13)`:** Navegue diretamente para qualquer um dos 13 pontos da visão em tempo real (Boas-vindas, Sidebar, Minimapa PE, Fontes de Dados, Status On line/Tema/Perfil, KPIs, Mapa Térmico, Camadas, Índice Térmico, Histórico 7 Dias, Central de Alertas, Detalhes do Microterritório e Insights).
   - **`Funcionalidades Internas (6)`:** Salte diretamente para os módulos avançados (MapBiomas & Landsat, Dashboard Verde, Clima NASA POWER, Comparação & Histórico, Vulnerabilidade Social IVS e Cobertura Arbórea NDVI).
5. **Efeitos Sonoros:** No rodapé do Menu Principal do Tour, você pode alternar entre **`Efeitos sonoros: Ativados`** e **`Efeitos sonoros: Mudos`**.

---

## 11. Portal Institucional (`site_arboris`) e Comunidade Fider

No rodapé do painel principal, o botão **`Acessar Portal Radar Climático`** abre o site institucional do projeto (`/site_arboris/index.html`), que apresenta:
- O contexto urbano das ilhas de calor no Recife e os 6 bairros piloto (*Boa Viagem, Imbiribeira, São José/Centro, Madalena/Torre, Várzea e Ibura*);
- A especificação de hardware dos **Dataloggers IoT RCW-800W (TDE móvel em ônibus e THE fixo em paradas)**;
- O acesso ao **Portal da Comunidade no Fider (`https://arboris.fider.io/`)**, onde gestores e cidadãos podem sugerir melhorias, relatar problemas e votar nas próximas funcionalidades do roadmap;
- A seção de **Últimas Notícias**, cadastro de alertas via WhatsApp/e-mail e botão flutuante de contato direto no WhatsApp.

---

## 12. Perguntas Frequentes (FAQ)

### P: Por que o botão "Confirmar Ação" no detalhe do bairro está desabilitado?
**R:** Por segurança operacional (*Human-in-the-Loop*). Para habilitar o botão **"Confirmar Ação"**, marque primeiro as duas caixas de verificação da **Validação Operacional** (*"Confirmar quebra no abastecimento de água local"* e *"Validar disponibilidade de agentes de saúde na região"*).

### P: Os dados de temperatura do mapa são atualizados automaticamente?
**R:** Sim. O sistema consulta automaticamente a API meteorológica pública Open-Meteo e calibra os valores para cada bairro de acordo com sua densidade vegetal e albedo. Você também pode clicar no quadrinho **`On line · HH:mm`** no topo direito para sincronizar manualmente.

### P: O sistema funciona se a internet cair temporariamente?
**R:** Sim. O Radar Climático Arboris possui arquitetura *Offline-First*. Se a conexão oscilar, o sistema permanece 100% funcional utilizando os snapshots biofísicos calibrados e o cache local.

---

## 13. Contatos e Suporte Técnico

Para dúvidas operacionais, solicitação de treinamento ou reporte de instabilidades no sistema:

- **Central COP-ARIES / Defesa Civil:** Canal direto via painel de administração (`radarclimatico@recife.pe.gov.br`).
- **Equipe de Engenharia Arboris (CESAR School):**
  - Gestão e Operações: `ogaf@cesar.school` (Odir Gonçalves)
  - Liderança Técnica: `lma@cesar.school` (Leonardo Maranhão)
  - Dev, Design e Experiência do Usuário: `lls@cesar.school` (Leônidas Leandro)
  - Pesquisa e Dados: `adt@cesar.school` (Ariely Dias) · `pjmc@cesar.school` (Patrick Cruz)
  - Análise Financeira B2G: `tsbs@cesar.school` (Thaís Soares)
