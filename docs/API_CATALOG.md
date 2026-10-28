# Catálogo de APIs · Radar Climático Arboris
> **Documento:** `/docs/API_CATALOG.md`  
> **Classificação:** Corporativa / Enterprise  
> **Versão:** 1.0.0  
> **Última Validação Operacional:** 19/10/2026  
> **Público-Alvo:** Desenvolvedores, Arquitetos de Software, Engenheiros Geoespaciais, DevOps, Auditoria Técnica

---

## 1. Resumo Executivo

O **Catálogo de APIs do Arboris** consolida a especificação exaustiva de todas as interfaces de comunicação externa e serviços públicos integrados à plataforma. O sistema emprega uma arquitetura híbrida de dados:
1. **Aquisição Dinâmica em Tempo Real:** Chamadas REST client-side e server-side (Open-Meteo, NASA POWER).
2. **Modelagem Biofísica Offline-First:** Camadas analíticas pré-processadas derivadas de missões orbitais (Landsat 8/9, Sentinel-2, MapBiomas 11).
3. **Resiliência e Continuidade Operacional:** Mecanismos de cache local (`localStorage` com TTL), fallbacks paramétricos e mitigação de indisponibilidade com zero interrupção para o usuário final.

---

## 2. Matriz Geral de Interfaces

| ID | API / Serviço | Fornecedor | Tipo | Status | Autenticação | Rate Limit |
|:---|:---|:---|:---|:---|:---|:---|
| `API-001` | **Open-Meteo Weather Forecast** | Open-Meteo GmbH | REST / JSON | **Ativa** | Nenhuma (Open Access) | 10.000 req/dia |
| `API-002` | **NASA POWER API (Hourly/Daily)** | NASA Langley Research Center | REST / JSON | **Ativa** | Nenhuma (Open Science) | ~30 req/min |
| `API-003` | **USGS Landsat 8/9 TIRS (ST_B10)** | USGS / NASA | GeoTIFF / STAC | **Ativa (Pipeline)** | NASA Earthdata / GEE | Sem rate limit no client |
| `API-004` | **ESA Copernicus Sentinel-2 MSI** | Agência Espacial Europeia (ESA) | OGC WMS / STAC | **Ativa (Mosaico)** | Copernicus Hub / GEE | Sem rate limit no client |
| `API-005` | **MapBiomas Brasil (Coleção 11)** | Observatório do Clima | WMS / GeoTIFF | **Ativa (Biofísica)** | API MapBiomas (Pública) | Sem restrição severa |
| `API-006` | **IBGE SIDRA & Censo Demográfico** | Instituto Brasileiro de Geografia e Estatística | REST / JSON | **Ativa (Tabelas)** | Pública | 60 req/min |
| `API-007` | **Elitech Cloud IoT API** | Elitech Technology Inc. | REST / Webhook | **Experimental (Hardware)** | Bearer Token / API Key | Conforme plano |

---

## 3. Especificação Detalhada das APIs

---

### `API-001`: Open-Meteo Weather Forecast API

#### Identificação & Governança
- **Nome:** Open-Meteo Free Weather API
- **Descrição:** Serviço meteorológico global de alta resolução que sintetiza previsões numéricas dos modelos ECMWF IFS, GFS, DWD ICON e Météo-France.
- **Finalidade:** Fornecer leituras ao vivo de temperatura do ar (°C), sensação térmica da cidade (`apparent_temperature` em °C), umidade relativa (%), código de tempo da Organização Meteorológica Mundial (`weather_code` WMO para ícone dinâmico do clima), status dia/noite (`is_day`), velocidade do vento (km/h) e curva horária para a latitude/longitude central do Recife (-8.0578, -34.8829).
- **Fornecedor:** Open-Meteo GmbH (Alemanha)
- **Link Oficial:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Versão da API:** `v1`
- **Status:** **Ativa (Produção)**
- **Última Validação:** 28/10/2026

#### Especificação Técnica
- **URL Base:** `https://api.open-meteo.com/v1`
- **Endpoint Utilizado:** `/forecast`
- **Método HTTP:** `GET`
- **Headers:** `Accept: application/json`
- **Autenticação:** Não requer chave de API (Tier não comercial / open access).
- **Timeouts:** 8.000 ms (AbortController).
- **Rate Limits:** Até 10.000 requisições diárias por IP; 100 requisições/minuto.
- **Estratégia de Cache:** Cache em memória durante o ciclo da sessão + revalidação manual via interface ou disparada a cada 15 minutos.
- **Políticas de Retry:** 1 tentativa imediata com fallback gracioso para modelagem biofísica interna.
- **Plano de Contingência (Fallback):** Caso a API esteja inacessível ou o cliente esteja sem conectividade, o módulo `realtime-weather-service.ts` carrega automaticamente o snapshot de contingência calibrado (`RECIFE_FALLBACK_WEATHER`).

#### Parâmetros de Requisição
```http
GET /v1/forecast?latitude=-8.0578&longitude=-34.8829&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,relative_humidity_2m&timezone=America/Recife&forecast_days=1 HTTP/1.1
Host: api.open-meteo.com
Accept: application/json
```

#### Amostra de Resposta Retornada
```json
{
  "latitude": -8.06,
  "longitude": -34.88,
  "generationtime_ms": 0.082,
  "utc_offset_seconds": -10800,
  "timezone": "America/Recife",
  "timezone_abbreviation": "-03",
  "elevation": 10.0,
  "current": {
    "time": "2026-10-19T18:00",
    "interval": 900,
    "temperature_2m": 31.8,
    "relative_humidity_2m": 68,
    "apparent_temperature": 36.4,
    "is_day": 0,
    "precipitation": 0.0,
    "weather_code": 1,
    "wind_speed_10m": 14.8
  },
  "hourly": {
    "time": ["2026-10-19T00:00", "2026-10-19T01:00", "..."],
    "temperature_2m": [25.4, 25.1, "..."],
    "apparent_temperature": [27.2, 26.8, "..."]
  }
}
```

#### Transformações Aplicadas
1. **Calibração Microclimática por Bairro:** A temperatura de referência central ($T_{ref}$) é ajustada para cada um dos 8 bairros do Recife através de deltas termo-espaciais baseados no NDVI e albedo do Projeto Arboris:
   $$T_{bairro} = T_{ref} + \Delta T_{LST}$$
2. **Cálculo de Sensação Térmica Aparente:** Harmonização com o índice de calor Steadman / Heat Index para condições tropicais de alta umidade.
3. **Curva Diária de 24 Horas:** Mapeamento do vetor horário para geração do gráfico SVG responsivo de pico térmico diário.

#### Consumidores no Código
- [`src/lib/geo-services/realtime-weather-service.ts`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/lib/geo-services/realtime-weather-service.ts)
- [`src/routes/index.tsx`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/routes/index.tsx) (Hook `syncWeather`, painéis `Kpis`, `HourlyPanel`, `ZoneDetail`, `MapPanel`).

---

### `API-002`: NASA POWER Climatology & Solar API

#### Identificação & Governança
- **Nome:** NASA Prediction of Worldwide Energy Resources (POWER) API
- **Descrição:** Serviço científico da NASA que disponibiliza conjuntos globais de dados meteorológicos e de fluxo de radiação solar derivados dos modelos GMAO MERRA-2 e satélites CERES.
- **Finalidade:** Monitorar o histórico e o comportamento diário de radiação superficial, velocidade do vento, pressão barométrica e anomalias de temperatura para Recife e os 14 municípios da Região Metropolitana.
- **Fornecedor:** NASA Langley Research Center (Hampton, VA, EUA)
- **Link Oficial:** [https://power.larc.nasa.gov/docs/](https://power.larc.nasa.gov/docs/)
- **Versão da API:** `v2.4.0`
- **Status:** **Ativa (Produção)**
- **Última Validação:** 19/10/2026

#### Especificação Técnica
- **URL Base:** `https://power.larc.nasa.gov/api/temporal`
- **Endpoints Utilizados:**
  - `/daily/point` (Médias diárias consolidadas)
  - `/hourly/point` (Dados horários de alta precisão)
- **Método HTTP:** `GET`
- **Headers:** `Accept: application/json`
- **Autenticação:** Aberta ao público (Open Science).
- **Timeouts:** 12.000 ms.
- **Rate Limits:** Aproximadamente 30 requisições simultâneas por minuto.
- **Estratégia de Cache:** Cache local com TTL de **12 horas** em `localStorage` (chave `arboris_nasa_power_recife_*`), reduzindo o overhead de rede para zero durante o uso contínuo.
- **Políticas de Retry:** 1 tentativa com backoff de 1.500 ms.
- **Plano de Contingência (Fallback):** Caso a API esteja em manutenção ou fora do ar, o sistema injeta a série sintética baseada nas normas climatológicas de 30 anos do INMET/MERRA-2 para o Recife.

#### Parâmetros de Requisição
```http
GET /api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,ALLSKY_SFC_SW_DWN,WS10M,PS,PRECTOTCORR&community=AG&longitude=-34.8829&latitude=-8.0578&start=20261012&end=20261018&format=JSON HTTP/1.1
Host: power.larc.nasa.gov
Accept: application/json
```

#### Amostra de Resposta Retornada
```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [-34.8829, -8.0578, 10.0] },
  "properties": {
    "parameter": {
      "T2M": { "20261012": 28.4, "20261013": 29.1, "...": "..." },
      "ALLSKY_SFC_SW_DWN": { "20261012": 21.4, "20261013": 22.8, "...": "..." },
      "PRECTOTCORR": { "20261012": 0.0, "20261013": 1.2, "...": "..." }
    }
  },
  "messages": []
}
```

#### Consumidores no Código
- [`src/lib/geo-services/nasa-power-service.ts`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/lib/geo-services/nasa-power-service.ts)
- [`src/components/dashboard/NasaPowerDashboardView.tsx`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/components/dashboard/NasaPowerDashboardView.tsx)

---

### `API-003`: USGS / Landsat 8 & 9 Thermal Infrared Sensor (TIRS / ST_B10)

#### Identificação & Governança
- **Nome:** Landsat 8 OLI/TIRS & Landsat 9 TIRS-2 Surface Temperature
- **Descrição:** Conjunto orbital multiespectral operado pela NASA e USGS. O sensor TIRS opera nas bandas termais de infravermelho (10.60 µm – 12.51 µm) permitindo o cálculo absoluto da Temperatura da Superfície Terrestre (LST).
- **Finalidade:** Fornecer anomalias absolutas de temperatura de superfície para cálculo dos pontos críticos das ilhas de calor do Recife.
- **Fornecedor:** United States Geological Survey (USGS) & NASA
- **Link Oficial:** [https://www.usgs.gov/landsat-missions/landsat-surface-temperature](https://www.usgs.gov/landsat-missions/landsat-surface-temperature)
- **Status:** **Ativa (Pipeline Modelado)**

#### Formulação Biofísica Integrada no Código
O Arboris incorpora a calibração de radiância para temperatura de brilho da banda 10:
$$L_{\lambda} = M_L \cdot Q_{cal} + A_L$$
$$T_B = \frac{K_2}{\ln\left(\frac{K_1}{L_{\lambda}} + 1\right)}$$
$$LST = \frac{T_B}{1 + \left(\lambda \cdot \frac{T_B}{\rho}\right) \cdot \ln(\varepsilon)}$$
Onde:
- $K_1 = 774.8853$, $K_2 = 1321.0789$
- $\lambda = 10.895\ \mu\text{m}$ (comprimento de onda central da banda 10)
- $\rho = 1.438 \times 10^{-2}\ \text{m}\cdot\text{K}$
- $\varepsilon$: emissividade da superfície obtida via proporção de vegetação ($P_v$) do NDVI.

#### Consumidores no Código
- [`src/lib/geo-services/arboris-geodata.ts`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/lib/geo-services/arboris-geodata.ts)
- [`src/lib/geo-services/climate-analytics.ts`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/lib/geo-services/climate-analytics.ts)

---

### `API-004`: ESA Copernicus Sentinel-2 MSI (NDVI & Copa)

#### Identificação & Governança
- **Nome:** Copernicus Sentinel-2 MultiSpectral Instrument (MSI)
- **Descrição:** Constelação europeia de observação da Terra com resolução espacial de 10 metros nas bandas ópticas (B2, B3, B4, B8).
- **Finalidade:** Cálculo da densidade de copa contínua e índice de vegetação por diferença normalizada (NDVI).
- **Fornecedor:** Agência Espacial Europeia (ESA) / União Europeia
- **Link Oficial:** [https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2](https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2)
- **Fórmula de Cálculo:**
  $$NDVI = \frac{B8\ (NIR) - B4\ (Red)}{B8\ (NIR) + B4\ (Red)}$$
- **Status:** **Ativa (Mosaico Vetorial e Simulação)**

#### Consumidores no Código
- [`src/components/dashboard/VegetationCoverView.tsx`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/components/dashboard/VegetationCoverView.tsx)
- [`src/components/dashboard/RecifeSatelliteMap.tsx`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/components/dashboard/RecifeSatelliteMap.tsx)

---

### `API-005`: MapBiomas Brasil (Coleção 11)

#### Identificação & Governança
- **Nome:** Mapeamento Anual de Cobertura e Uso da Terra no Brasil (MapBiomas)
- **Descrição:** Iniciativa multi-institucional que processa pixel a pixel todas as transformações de uso do solo no Brasil desde 1985.
- **Finalidade:** Fornecer o baseline de referência territorial de cobertura arbórea da RMR (25,13% de floresta/formação savânica) para fundamentar as metas municipais e o simulador de arrefecimento urbano.
- **Fornecedor:** Observatório do Clima / Imazon / Lapig / Google
- **Link Oficial:** [https://brasil.mapbiomas.org/](https://brasil.mapbiomas.org/)
- **Status:** **Ativa (Base Analítica)**

#### Consumidores no Código
- [`src/lib/geo-services/arboris-geodata.ts`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/lib/geo-services/arboris-geodata.ts)
- [`src/components/dashboard/EnvironmentalAnalysisView.tsx`](file:///c:/Users/SEDUC/Desktop/ARBORIS/Arboris/src/components/dashboard/EnvironmentalAnalysisView.tsx)

---

## 4. Custos e Licenciamento das APIs

| API | Modelo de Cobrança | Custo Atual | Custo Projetado (100k usuários/mês) | Restrições |
|:---|:---|:---|:---|:---|
| **Open-Meteo** | Open Access (Creative Commons CC BY 4.0) | R$ 0,00 | R$ 0,00 (Tier público até 10k req/dia) ou € 29/mês (Commercial API) | Requer atribuição clara |
| **NASA POWER** | Open Science Data Policy (NASA) | R$ 0,00 | R$ 0,00 (Gratuito irrestrito) | Respeitar rate limit razoável |
| **USGS / Landsat** | Dados Públicos Federais dos EUA | R$ 0,00 | R$ 0,00 | Livre redistribuição |
| **ESA Sentinel** | Copernicus Open Access Policy | R$ 0,00 | R$ 0,00 | Livre redistribuição |
| **MapBiomas** | Creative Commons Attribution-ShareAlike | R$ 0,00 | R$ 0,00 | Atribuição institucional |

---

## 5. Diretrizes de Adição de Novas APIs

Qualquer integração de nova API no código-fonte do Arboris deve obrigatoriamente cumprir o seguinte ciclo de homologação:

1. **Validação de SLA e Resiliência:** Testar tempo de resposta abaixo de 2.000 ms e comportamento offline.
2. **Implementação de Cache Local:** Definir TTL compatível com a volatilidade dos dados.
3. **Mecanismo de Fallback:** Garantir que o sistema opere com dados padrão caso a API caia.
4. **Registro Imediato neste Catálogo:** Documentar todos os 27 campos técnicos em `/docs/API_CATALOG.md`.
