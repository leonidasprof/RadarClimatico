# Fontes de Dados · Radar Climático Arboris
> **Documento:** `/docs/DATA_SOURCES.md`  
> **Classificação:** Corporativa / Enterprise  
> **Versão:** 1.0.0  
> **Data de Atualização:** 19/10/2026  
> **Público-Alvo:** Engenheiros Geoespaciais, Cientistas de Dados, Arquitetos de Software, Gestores Públicos

---

## 1. Resumo Executivo

O **Radar Climático Arboris** opera através de um ecossistema integrado de fontes de dados geoespaciais, climatológicas, epidemiológicas e biofísicas. O objetivo primário é quantificar o microclima urbano com precisão centimétrica ou métrica, correlacionar o estresse térmico com a vulnerabilidade socioespacial e simular cenários de mitigação bioclimática com embasamento científico irrefutável.

---

## 2. Matriz Geral de Fontes de Dados

| Fonte | Tipo | Resolução Espacial | Frequência Temporal | Cobertura | Confiabilidade |
|:---|:---|:---|:---|:---|:---|
| **Google Earth Engine (GEE)** | Plataforma de Processamento em Nuvem | 10 m a 1 km | Diária / Sob demanda | Global (Foco RMR) | 99.9% |
| **MapBiomas Brasil (Coleção 11)** | Mapeamento Anual de Cobertura/Solo | 30 m | Anual (1985–2024) | Brasil | 98.5% |
| **NASA POWER** | Climatologia e Radiação Superficial | 0.5° × 0.625° (~50 km) | Horária / Diária | Global | 99.0% |
| **Landsat 8 (OLI/TIRS)** | Sensoriamento Remoto Termal/Óptico | 30 m (óptico) / 100 m (termal reamostrado para 30 m) | 16 dias | Global | 99.5% |
| **Landsat 9 (OLI-2/TIRS-2)** | Sensoriamento Remoto Termal de 14 bits | 30 m / 100 m | 16 dias (8 dias combinado com L8) | Global | 99.8% |
| **ESA WorldCover** | Cobertura do Solo Global Sentinel-1/2 | 10 m | Anual | Global | 97.5% |
| **IBGE (Censo Demográfico 2022 / SIDRA)** | Dados Demográficos e Socioeconômicos | Setores Censitários (~100–300 domicílios) | Decenal / Contínua | Brasil | 99.9% (Oficial) |
| **FAO GAUL** | Limites Administrativos Globais | Vetorial (Polígonos Municipais) | Estática / Revisada | Global | 99.0% |
| **Kaggle Datasets (Arboris Benchmark)** | Dados de Calibração Térmica e Saúde | Granularidade por Bairro / UPA | Estática de Calibração | Recife / RMR | 95.0% |
| **APIs Futuras (INMET, CEMADEN, ERA5-Land)** | Meteorologia de Superfície e Alertas | Estações Pontuais / 9 km | Horária / Tempo Real | Nacional | Alta |

---

## 3. Especificação Detalhada por Fonte de Dados

---

### 1. Google Earth Engine (GEE)
- **Objetivo:** Orquestrar o processamento biofísico de larga escala para extração de LST (Temperatura da Superfície Terrestre), NDVI e índices espectrais sem necessidade de download massivo de cenas brutas.
- **Origem dos Dados:** Infraestrutura de computação em nuvem do Google contendo os catálogos públicos da NASA, USGS, ESA e NOAA.
- **Periodicidade de Atualização:** Ingestão contínua com latência de poucas horas após a passagem orbital dos satélites.
- **Cobertura Geográfica:** Global; delimitada na plataforma Arboris para as coordenadas da Região Metropolitana do Recife (`BoundingBox`: Lat -8.35 a -7.75, Lon -35.25 a -34.80).
- **Variáveis Utilizadas:**
  - `LANDSAT/LC08/C02/T1_L2` (Bandas SR_B4, SR_B5, ST_B10)
  - `COPERNICUS/S2_SR_HARMONIZED` (Bandas B4, B8, QA60)
  - Filtro de nebulosidade: `< 20% cloud cover`.
- **Método de Consumo:** Scripts biofísicos baseados no notebook `ProjetoArborisAV1i.pynb` executados via Python API / exportação para GeoJSON vetorial e tabelas paramétricas servidas no frontend.
- **Limitações Conhecidas:** Presença frequente de nuvens cumulus na costa de Pernambuco durante os meses chuvosos (abril a julho), exigindo composição temporal multiespectral.
- **Plano de Fallback:** Uso de mosaicos medianos sazonais e interpolação por regressão linear calibrada.
- **Confiabilidade:** Altíssima (padrão-ouro em sensoriamento remoto mundial).
- **Módulos que Utilizam:** `arboris-geodata.ts`, `EnvironmentalAnalysisView.tsx`.

---

### 2. MapBiomas Brasil (Coleção 11)
- **Objetivo:** Estabelecer a linha de base histórica da cobertura vegetal nativa e antropização da Região Metropolitana do Recife, fundamentando o simulador de plantio de árvores urbanas.
- **Origem dos Dados:** Rede MapBiomas (Observatório do Clima, ISA, Imazon, Lapig).
- **Periodicidade de Atualização:** Lançamento anual de coleções consolidadas.
- **Cobertura Geográfica:** Todo o território brasileiro; no Arboris, focado nos 14 municípios da RMR.
- **Variáveis Utilizadas:**
  - Classe 3: Formação Florestal
  - Classe 4: Formação Savânica
  - Classe 11: Área Urbana / Infraestrutura
  - Percentual histórico de cobertura vegetal da RMR: **25,13%**.
- **Método de Consumo:** Ingestão de tabelas estatísticas estruturadas no módulo `arboris-geodata.ts`.
- **Limitações Conhecidas:** Resolução nativa de 30 metros não detecta arborização de calçada isolada (árvores únicas).
- **Plano de Fallback:** Complementação com o índice NDVI do Sentinel-2 (resolução de 10 metros).
- **Confiabilidade:** 98,5% de acurácia global atestada por validação estatística independente.
- **Módulos que Utilizam:** `arboris-geodata.ts`, `EnvironmentalAnalysisView.tsx`, `PriorityPanel.tsx`.

---

### 3. NASA POWER (Prediction of Worldwide Energy Resources)
- **Objetivo:** Alimentar a análise climatológica do Recife com dados diários e horários de radiação solar global e variáveis meteorológicas de superfície.
- **Origem dos Dados:** Modelos assimilados GMAO MERRA-2 e observações radiométricas CERES da NASA.
- **Periodicidade de Atualização:** Atualizações diárias com latência de 2 a 3 dias.
- **Cobertura Geográfica:** Global com grade regular de 0.5° × 0.625°.
- **Variáveis Utilizadas:**
  - `T2M`: Temperatura do ar a 2 metros (°C)
  - `T2M_MAX` / `T2M_MIN`: Máximas e mínimas diárias (°C)
  - `RH2M`: Umidade relativa do ar (%)
  - `ALLSKY_SFC_SW_DWN`: Radiação solar incidente de ondas curtas ($MJ/m^2/dia$ ou $W/m^2$)
  - `WS10M`: Velocidade do vento a 10 metros de altura ($m/s$)
  - `PS`: Pressão atmosférica na superfície ($kPa$)
  - `PRECTOTCORR`: Precipitação acumulada ($mm/dia$)
- **Método de Consumo:** Requisições REST assíncronas via `fetch` pelo serviço `nasa-power-service.ts`, com armazenamento em `localStorage` (TTL 12 horas) e exportação em CSV para relatórios operacionais.
- **Limitações Conhecidas:** Resolução espacial regional (~50 km) não distingue microclimas intra-urbanos de bairro para bairro.
- **Plano de Fallback:** Série histórica sintética local baseada nas normais de 30 anos do Recife.
- **Confiabilidade:** 99.0% para estudos de balanço de radiação e energia.
- **Módulos que Utilizam:** `nasa-power-service.ts`, `NasaPowerDashboardView.tsx`.

---

### 4. Landsat 8 & Landsat 9 (USGS / NASA)
- **Objetivo:** Gerar mapas de calor com cálculo de Temperatura de Superfície Terrestre (LST) por radiometria termal calibrada.
- **Origem dos Dados:** Satélites Landsat 8 (lançado em 2013) e Landsat 9 (lançado em 2021).
- **Periodicidade de Atualização:** Passagem orbital a cada 8 dias (constelação combinada L8 + L9).
- **Cobertura Geográfica:** Passagem de órbita WRS-2 Path 214, Row 065 (abrangendo Recife e Litoral Sul/Norte de PE).
- **Variáveis Utilizadas:**
  - Banda 10 (ST_B10 - Thermal Infrared Sensor): Radiância termal de topo da atmosfera ($W/(m^2 \cdot sr \cdot \mu m)$).
  - Bandas 4 e 5: Infravermelho próximo e vermelho para cálculo de $NDVI$ e emissividade ($\varepsilon$).
- **Método de Consumo:** Modelo matemático calibrado do Projeto Arboris:
  $$r = -0.638, \quad R^2 = 40.7\%$$
  $$LST = -0.11 \cdot (NDVI \times 100) + 36.8$$
- **Limitações Conhecidas:** Resolução espacial termal nativa de 100 m reamostrada para 30 m pela USGS.
- **Plano de Fallback:** Interpolação ponderada com o histórico de 10 anos de medições de verão da RMR.
- **Confiabilidade:** 99.5% de consistência radiométrica internacional.
- **Módulos que Utilizam:** `arboris-geodata.ts`, `climate-analytics.ts`, `MapPanel.tsx`.

---

### 5. ESA WorldCover (10m)
- **Objetivo:** Validar a tipologia de superfícies impermeáveis versus áreas arborizadas na escala de quadras e eixos viários do Recife.
- **Origem dos Dados:** Consórcio liderado pela VITO Remote Sensing com dados dos satélites Sentinel-1 e Sentinel-2 da ESA.
- **Periodicidade de Atualização:** Mapeamentos consolidados anuais.
- **Cobertura Geográfica:** Global (10 m de resolução espacial).
- **Variáveis Utilizadas:**
  - Tree cover (Classe 10)
  - Built-up / Urban (Classe 50)
  - Water bodies (Classe 80)
- **Método de Consumo:** Cruzamento matricial vetorial com as manchas urbanas do Recife.
- **Limitações Conhecidas:** Atualização anual não captura podas ou cortes recentes em tempo real.
- **Plano de Fallback:** Dataloggers IoT Elitech e vistorias de campo municipais.
- **Confiabilidade:** 97.5%.
- **Módulos que Utilizam:** `VegetationCoverView.tsx`, `PriorityPanel.tsx`.

---

### 6. IBGE (Censo Demográfico 2022 & SIDRA)
- **Objetivo:** Fornecer os dados demográficos oficiais e calcular o Índice de Vulnerabilidade Social (IVS) dos bairros do Recife.
- **Origem dos Dados:** Instituto Brasileiro de Geografia e Estatística (IBGE).
- **Periodicidade de Atualização:** Resultados do Censo 2022 / Agregados por Setores Censitários.
- **Cobertura Geográfica:** Recife e Região Metropolitana.
- **Variáveis Utilizadas:**
  - População total residente;
  - População em domicílios de baixa renda (< 0.5 salário mínimo per capita);
  - Crianças menores de 5 anos e idosos maiores de 65 anos;
  - Taxa de déficit de saneamento básico e esgotamento sanitário.
- **Método de Consumo:** Ingestão estruturada no dataset `zones` em `radar-data.ts`.
- **Limitações Conhecidas:** Periodicidade decenal do Censo, complementada por estimativas populacionais contínuas.
- **Plano de Fallback:** CadÚnico municipal e dados da Secretaria de Saúde do Recife.
- **Confiabilidade:** 99.9% (Estatística Oficial de Estado).
- **Módulos que Utilizam:** `radar-data.ts`, `SocialVulnerabilityView.tsx`, `RecifeSatelliteMap.tsx`.

---

### 7. FAO GAUL (Global Administrative Unit Layers)
- **Objetivo:** Fornecer a malha vetorial padronizada internacional dos limites municipais dos 14 municípios da Região Metropolitana do Recife.
- **Origem dos Dados:** Organização das Nações Unidas para a Alimentação e a Agricultura (FAO).
- **Periodicidade de Atualização:** Estável / Geometrias consolidadas.
- **Cobertura Geográfica:** Global.
- **Variáveis Utilizadas:** Geometrias de nível administrativo 2 (Municípios: Recife, Jaboatão, Olinda, Paulista, Camaragibe, etc.).
- **Método de Consumo:** Vetores GeoJSON e bounding boxes em `arboris-geodata.ts`.
- **Confiabilidade:** 99.0%.
- **Módulos que Utilizam:** `arboris-geodata.ts`.

---

### 8. Kaggle Datasets (Recife Urban Heat & Health Benchmark)
- **Objetivo:** Benchmark comparativo inicial e matriz de validação cruzada entre anomalias térmicas e atendimentos em UPAs do Recife durante o verão de 2023/2024.
- **Origem dos Dados:** Conjunto de dados curado no Kaggle para pesquisa de eventos climáticos extremos no Nordeste brasileiro.
- **Periodicidade de Atualização:** Estático (base de treinamento e calibragem).
- **Variáveis Utilizadas:**
  - Séries temporais de atendimentos por desidratação nas UPAs da Imbiribeira, Torrões e Olinda;
  - Correlação epidemiológica de pico térmico ($r = 0.81$ nos dias com $T > 35 \text{ °C}$).
- **Método de Consumo:** Mapeado no array `weeklyHealthCorrelation` em `radar-data.ts`.
- **Confiabilidade:** 95.0% para fins de modelagem de demonstração e calibração de alertas.
- **Módulos que Utilizam:** `radar-data.ts`, `SocialVulnerabilityView.tsx`.

---

### 9. Fontes Futuras em Processo de Integração (Roadmap 2026/2027)

1. **INMET (Instituto Nacional de Meteorologia - API de Estações Automáticas):**
   - Estação Recife (A301 - Curado): Validação in-situ da temperatura do ar e rajadas de vento em tempo real.
2. **CEMADEN (Centro Nacional de Monitoramento e Alertas de Desastres Naturais):**
   - Pluviômetros automáticos e alertas de risco hidrológico/geotécnico nas encostas do Ibura e Casa Amarela.
3. **ECMWF ERA5-Land Reanalysis:**
   - Série de reanálise horária com resolução de 9 km para modelos de inteligência artificial de previsão de ondas de calor com até 7 dias de antecedência.
