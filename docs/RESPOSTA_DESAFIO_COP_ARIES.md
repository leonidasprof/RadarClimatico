# O que só nós podemos fazer que a COP e a ARIES não conseguem?

> Resposta da equipe Arboris ao desafio do professor, apoiada em uma funcionalidade que **já está no MVP**: o módulo **Alerta de Calor** do Radar Climático.

---

## 1. A resposta em uma frase

> **"Para a chuva, o Recife tem quem avise e quem aja. Para o calor, não tinha quem avisasse. O Radar Climático é o sistema de alerta de calor do Recife: diz com 72 horas de antecedência onde o calor vai ficar perigoso, quem está em risco e o que cada secretaria deve fazer — e entrega isso pronto para o COP disparar."**

---

## 2. Entendendo o problema (explicado do zero)

### Como a cidade lida com a CHUVA hoje

Imagine uma chuva forte chegando ao Recife. Existe uma "corrente" de três elos:

```
  1. AVISAR                    2. AGIR                     3. PLANEJAR
  APAC / CEMADEN         →     COP coordena a resposta  →  Prefeitura e ARIES
  preveem a chuva e            (Defesa Civil, SMS,          planejam obras para o
  emitem o alerta              secretarias, equipes)        problema não se repetir
```

Cada elo tem um dono. Por isso a cidade consegue reagir à chuva.

### Como a cidade lida com o CALOR hoje

```
  1. AVISAR                    2. AGIR                     3. PLANEJAR
  ??? — ninguém avisa    →     O COP não tem o que      →  A ARIES não tem histórico
  por bairro                   coordenar                    para planejar
```

O INMET emite avisos de onda de calor, mas para **regiões inteiras** do estado. Ninguém diz:
- **qual bairro** do Recife vai ficar perigoso,
- **a que horas**,
- **quantas pessoas vulneráveis** moram lá,
- **o que cada secretaria deve fazer**.

E o calor é um **"desastre silencioso"**: não alaga rua, não derruba barreira, não aparece nas câmeras do COP. As pessoas passam mal dentro de casa, no ponto de ônibus, na escola — e isso só aparece depois, na fila da UPA.

**O elo 1 do calor está vazio. O Radar Climático ocupa exatamente esse lugar.**

---

## 3. Quem são o COP e a ARIES — e por que não fazem isso

| | **COP** — Centro de Operações do Recife | **ARIES** — Agência Recife para Inovação e Estratégia |
|---|---|---|
| **O que é** | Centro 24h da Prefeitura que reúne 13 secretarias para gerir crises e grandes eventos | Associação sem fins lucrativos parceira da Prefeitura, voltada à estratégia de longo prazo (Recife 500 Anos) |
| **Foco** | Chuva, alagamento, deslizamento, Carnaval, São João, câmeras | Planejamento, inovação, projetos com o Porto Digital |
| **Papel na corrente** | **AGIR** — recebe alertas de outros órgãos e coordena a resposta | **PLANEJAR** — define prioridades da cidade para os próximos anos |
| **Por que não faz alerta de calor** | Não é a missão dele produzir alertas (nem o de chuva é ele que produz) | Não opera no dia a dia; trabalha em ciclos longos |

> ⚠️ **Cuidado na apresentação:** não dizer "o COP é incapaz". O argumento certo é: **produzir alerta de calor não é a missão de nenhum dos dois — e por isso ninguém faz.** Nós não competimos com eles: **nós abastecemos os dois.**

| Para quem | O que o Radar entrega |
|---|---|
| **COP** | Alerta de calor por bairro com 72h de antecedência, protocolo de ação por secretaria, boletim e SMS prontos |
| **ARIES** | Histórico de dias de alerta, bairros mais atingidos e impacto na saúde — evidência para decidir onde investir (árvores, abrigos, pontos de resfriamento) |

---

## 4. A funcionalidade no MVP: módulo "Alerta de Calor"

Está no menu lateral, logo abaixo de **Tempo real**. Ela tem 6 partes:

### 4.1. Previsão de 72 horas para cada bairro
O Radar consulta a previsão **hora a hora** dos próximos 3 dias para **cada um dos 8 bairros** (uma coordenada por bairro, API Open-Meteo, gratuita). Sobre essa previsão, aplica o **ajuste de ilha de calor** de cada bairro (Santo Amaro, com muito asfalto e pouca árvore, é mais quente; Dois Irmãos, com mata, é mais fresco).

### 4.2. Índice de Calor — o que o corpo sente
O Recife é úmido. Com umidade alta, o suor não evapora e o corpo não consegue se resfriar. Por isso **33 °C no Recife podem ser sentidos como mais de 40 °C**.

O Radar usa a **fórmula oficial do Índice de Calor da NOAA** (agência de clima dos EUA), que combina **temperatura + umidade** em um único número: o calor que o corpo sente.

### 4.3. Cinco níveis de alerta — no mesmo formato que o COP já usa para chuva

| Nível | Índice de calor | O que significa |
|---|---|---|
| 🟢 **Normal** | abaixo de 32 °C | Calor habitual do Recife. Rotina normal. |
| 🟡 **Atenção** | 32 a 37 °C | Fadiga com exposição prolongada ao sol. Comunicação preventiva. |
| 🟠 **Alerta** | 37 a 41 °C | Risco de cãibras e exaustão. Grupos vulneráveis precisam de cuidado ativo. |
| 🔴 **Perigo** | 41 a 46 °C | Exaustão provável, insolação possível. Mobilização das secretarias. |
| 🟣 **Emergência** | acima de 46 °C | Risco alto de insolação e mortes evitáveis. Resposta coordenada pelo COP. |

O nível do dia de cada bairro é o da **pior hora** do dia. A tela mostra também **quantas horas** o bairro passa em nível Alerta ou acima.

### 4.4. "Onde agir primeiro" — quem está em risco, não só onde está quente
Calor igual não é risco igual. Um bairro com 18 mil idosos e crianças pequenas precisa de mais atenção do que um com 3 mil.

A tabela ordena os bairros **pelo nível do calor** e, em empate, **por quem tem mais pessoas vulneráveis** (crianças < 5 anos e idosos > 65 anos), e mostra a **UPA de referência** de cada bairro.

### 4.5. Protocolo de ação por secretaria — o grande diferencial
Para cada nível, o Radar mostra **o que cada órgão deve fazer**, com caixas de seleção para marcar o que já foi feito. As ações **se acumulam**: no nível Perigo valem também as de Atenção e Alerta.

| Nível | Exemplos de ações |
|---|---|
| **Atenção** | Comunicação publica orientações · Saúde avisa UBS e agentes comunitários |
| **Alerta** | Defesa Civil dispara SMS (40199) · Saúde reforça soro nas UPAs e visita idosos sozinhos · Educação suspende educação física ao sol das 11h às 15h · Assistência Social leva água à população de rua |
| **Perigo** | COP ativa sala de situação de calor · Assistência Social abre pontos de resfriamento · EMLURB irriga praças e pausa obras no pico · pausas para garis e ambulantes |
| **Emergência** | COP declara emergência de calor e coordena 24h · plano de contingência hospitalar · avaliar suspensão de aulas à tarde |

### 4.6. Boletim e SMS prontos para disparar
Com um clique em **Copiar**, o COP recebe:
- um **boletim completo** (nível da cidade, bairros por nível, horário de pico, pessoas vulneráveis, UPA de referência e ações recomendadas);
- um **SMS para a população** já dentro do limite de 160 caracteres.

**O COP não recebe um número. Recebe uma decisão pronta.**

### 4.7. Calor × saúde: a calibração local
A tela mostra a relação entre sensação térmica e atendimentos nas UPAs por desidratação/insolação, calculada pelo próprio Radar a partir da série de saúde do projeto. É com esse tipo de dado local que os limites dos níveis serão **recalibrados para a população do Recife**.

---

## 5. "Mas isso é replicável" — a resposta ao professor

O professor está certo em uma coisa: **o código é replicável**, e as APIs são públicas. Por isso o nosso diferencial **não é o código**. É o que se acumula em volta dele:

| O que não se copia | Por quê |
|---|---|
| **1. Limiares calibrados para o Recife** | Os limites da NOAA foram feitos para os EUA. Quem vive no Recife é aclimatado ao calor. Descobrir **a partir de que índice os atendimentos nas UPAs disparam aqui** é trabalho científico local, com dados locais. |
| **2. Protocolo construído junto com o COP** | Já temos diálogo com o COP. Quando o protocolo entra na rotina deles, trocar de ferramenta custa caro — é o mesmo motivo pelo qual ninguém troca de sistema de alerta de chuva toda semana. |
| **3. Histórico** | Cada verão gera um registro de alertas, bairros atingidos e impacto na saúde. Quem copiar o software no ano que vem começa com histórico zero. |
| **4. Sensores fixos (quando chegarem)** | Vão medir o calor real em pontos do bairro e **corrigir o ajuste de cada bairro** com dado próprio, que nenhuma API tem. |

E sobre os sensores: depois da conversa com o COP, abandonamos a ideia dos ônibus e vamos para **pontos fixos**. Uma proposta forte é instalar em **escolas municipais**: existem em todos os bairros, têm energia, internet e vigilância — e os próprios alunos podem acompanhar os dados.

---

## 6. Pitch de 30 segundos

> "Quando vem chuva forte, o Recife sabe quem avisa e quem age. Quando vem calor extremo, ninguém avisa por bairro — e o calor mata em silêncio, longe das câmeras. O Radar Climático é o sistema de alerta de calor do Recife: prevê as próximas 72 horas em cada bairro, combina temperatura e umidade no que o corpo sente, classifica em cinco níveis, mostra onde estão as pessoas mais vulneráveis e entrega ao COP o protocolo de cada secretaria e o SMS prontos para disparar. O COP coordena, a ARIES planeja — e nós somos o elo que faltava entre os dois."

---

## 7. Perguntas difíceis que podem aparecer

**"O COP pode fazer isso sozinho."**
Pode, mas não é a missão dele — nem o alerta de chuva é ele que produz. E contratar uma ferramenta exige licitação e tempo. Nós já entregamos funcionando; o caminho natural é o COP **usar** o alerta, não reconstruí-lo.

**"A previsão é de uma API gratuita. Qualquer um tem."**
A previsão é matéria-prima. O valor está no que fazemos com ela: índice de calor por bairro, níveis, prioridade por vulnerabilidade, protocolo e boletim. Ninguém entrega isso hoje ao COP.

**"Os limiares (32, 37, 41, 46 °C) são confiáveis?"**
São uma proposta inicial baseada na escala da NOAA. O próximo passo do roadmap é recalibrá-los com dados reais de atendimento das UPAs do Recife — e isso é justamente o que nos diferencia.

**"Qual o valor para a ARIES?"**
O histórico: quantos dias de alerta por bairro, quanto tempo em Perigo, quantas pessoas expostas. Isso responde perguntas de planejamento: onde plantar árvores primeiro, onde criar pontos de resfriamento, quais escolas precisam de climatização.

**"E se a internet cair?"**
O módulo guarda a última previsão por 30 minutos e, sem conexão, mostra uma curva de referência sinalizada como tal no topo da tela.

---

## 8. Limitações honestas (para não sermos pegos de surpresa)

- O **ajuste de ilha de calor** de cada bairro ainda é uma estimativa fixa do projeto; os sensores fixos vão corrigi-lo.
- A **série de saúde** (atendimentos nas UPAs) e os números de **pessoas vulneráveis** por bairro são os dados de demonstração do MVP; precisam ser substituídos por dados oficiais da Secretaria de Saúde e do Censo IBGE 2022.
- O **protocolo de ação** é uma proposta da equipe e deve ser validado com o COP e as secretarias.
- Não encontramos um protocolo de calor público do COP, mas isso não prova que ele não exista. **Pergunta para a próxima reunião com o COP:** *"Vocês têm níveis de alerta para calor, como têm para chuva?"* Se a resposta for não, a ideia está validada pelo próprio cliente.

---

## 9. Arquivos da funcionalidade (para quem for mexer no código)

| Arquivo | O que faz |
|---|---|
| `src/lib/geo-services/heat-alert-service.ts` | Busca a previsão de 72h, calcula o Índice de Calor, define os níveis, resume os dias e calcula a calibração com saúde |
| `src/components/dashboard/HeatAlertView.tsx` | Tela do módulo: resumo, níveis, ranking, gráfico, protocolo, boletim e SMS |
| `src/components/dashboard/SidebarNav.tsx` | Item de menu "Alerta de Calor" |
| `src/constants/tourStepsData.ts` | Passo do tour do CLIMA explicando o módulo |

---

## Fontes

- [COP do Recife no São João 2026 — Diario de Pernambuco](https://www.diariodepernambuco.com.br/vida-urbana/2026/06/11716104-sao-joao-do-recife-tera-monitoramento-por-296-cameras-em-tempo-real-segundo-o-cop.html)
- [COP emite alerta máximo por chuvas — Folha de Pernambuco](https://www.folhape.com.br/colunistas/blogdafolha/chuvas-no-recife-cop-emite-alerta-maximo-e-aulas-da-rede-municipal-sao-suspensas/48976/)
- [ARIES no Mapa das OSCs — IPEA](https://mapaosc.ipea.gov.br/detalhar/1261274)
- [Plano Recife 500 Anos — CEPE](https://acervo.cepe.com.br/pdfs/20260205-110337-recife-500-anos-plano-estrategico-desenvolvimento.pdf)
- [Toró de Ideias (ARIES, Porto Digital) — Folha de Pernambuco](https://www.folhape.com.br/noticias/recife-lanca-maratona-de-ideias-que-premiara-propostas-para/235726/)
- [Diagnóstico de ilhas de calor no Recife — UFPE](https://ead.ufpe.br/documents/616030/847061/Diagnostico_de_intensidade_das_ilhas_de_calor_em_recife.pdf)
- [Índice de Calor — NOAA / National Weather Service](https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml)
- [API de previsão Open-Meteo](https://open-meteo.com/en/docs)
