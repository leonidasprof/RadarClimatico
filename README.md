<div align="center">
  <img src="public/fundo_escuro.png" alt="Logo Arboris - Radar Climático" width="350" />

  **Inteligência territorial e microclimática para detectar, comunicar e mitigar ondas de calor.**

  [![Acesso ao MVP](https://img.shields.io/badge/🚀_Acessar-MVP_Interativo-00E5FF?style=for-the-badge&logoColor=black)](https://human-eye-mockup.lovable.app/)
</div>

<br>

O **Radar Climático** é um projeto de inovação tecnológica focado na detecção, monitoramento e mitigação de ilhas de calor urbano no Recife[cite: 2]. Desenvolvido sob o modelo B2G (Business to Government), o sistema visa auxiliar gestores públicos e órgãos de defesa civil na tomada de decisões estratégicas em tempo real[cite: 2].

🤝 **Parceria Institucional:** Desenvolvido por estudantes da **CESAR School** em parceria com a **Prefeitura do Recife** e **COP-ARIES** (Centro de Operações do Recife / Agência Recife para Inovação e Estratégia)[cite: 2].

---

## 👁️ Protótipo Funcional (MVP)
Você pode interagir e testar a interface do nosso painel de controle diretamente pelo navegador. O ambiente simula o dashboard de operações com os dados mapeados.

👉 **[Clique aqui para acessar o MVP do Radar Climático](https://human-eye-mockup.lovable.app/)**

---

## 🎯 O Desafio
Recife é uma cidade vulnerável a eventos climáticos extremos[cite: 2]. A falta de ferramentas integradas para detecção e alerta antecipado de picos de calor prejudica a saúde pública, especialmente de populações vulneráveis e trabalhadores expostos, além de dificultar o direcionamento preciso de verbas para arborização e infraestrutura verde[cite: 2].

**Persona Principal:** Jorge Gonçalves (57 anos) – Defesa Civil do Recife. Necessita cruzar dados de ilhas de calor com densidade populacional para identificar zonas críticas e otimizar intervenções públicas.

---

## 🚀 Funcionalidades Principais
* **Mapa Térmico Interativo:** Renderização vetorial da malha viária do Recife com zonas de calor sobrepostas (Heatmaps).
* **Indicadores de Criticidade:** Cruzamento de temperatura, umidade, vulnerabilidade social e cobertura vegetal.
* **Painel de Alertas:** Sistema de notificação antecipada de anomalias térmicas para envio à população.
* **Curva Horária:** Projeção diária da temperatura e sensação térmica baseada no pico histórico.
* **Priorização de Intervenções:** Ranking de áreas com maior urgência para implantação de infraestrutura verde.

---

## ⚙️ Arquitetura e Tecnologias

### Frontend
* **Framework:** React 18
* **Build Tool:** Vite
* **Linguagem:** TypeScript
* **Roteamento:** TanStack Router
* **Estilização:** Tailwind CSS (Arquitetura de Design *Dark Tech*)
* **Gráficos:** SVG Nativo (Alta performance, zero dependências)

### Integração IoT (Hardware)
O monitoramento de campo é realizado através de malhas de sensores distribuídos de forma estratégica[cite: 1]:
* **Datalogger Elitech RCW-800W TDE (WiFi):** Acoplados em plataformas móveis (ônibus de linha) para varredura territorial dinâmica e captação de dados em ambiente externo[cite: 1].
* **Datalogger Elitech RCW-800W THE (WiFi):** Fixados em abrigos, terminais e zonas de controle para monitoramento estático constante[cite: 1].

---

## 🗺️ Roadmap de Processos e Jornada do Usuário

A evolução do projeto segue jornadas definidas para a gestão pública e para a população, estruturadas em fases:

**Release 1 (Fase Atual / MVP)**
* Preenchimento de informações e visualização completa do dashboard interativo.
* Seleção e recorte por bairros para cruzamento analítico de parâmetros (temperatura, índice de arborização, índice de vulnerabilidade e sensação térmica).
* Acesso ao mapa de calor interativo e verificação de áreas verdes.
* Consulta de tendências climáticas e histórico de dados.
* Geração, parametrização e exportação de relatórios gerais de gestão.
* Emissão e reporte local de alertas por região crítica.

**Futuras Ideias (Próximos Passos)**
* Integração direta com o aplicativo *Conecta Recife* para consulta pública da população.
* Cálculo, formulação e disponibilização de um *Life Quality Index* (LQI) detalhado.
* Geração de recomendações públicas de horários mais confortáveis para locomoção e saída às ruas.
* Sensoriamento e exibição da temperatura interna dos transportes públicos da cidade.
* Integração de dados de impacto ambiental voltado para a proteção de animais de rua.
* Parcerias de incentivo cultural aliadas a protocolos de segurança climática para eventos.

---

## 👥 Equipe Arboris
Nós somos uma equipe multidisciplinar formada por alunos de Tecnologia[cite: 2]:

* **Odir Gonçalves de Albuquerque Filho** (Gestor de Projetos • GTI) – ogaf@cesar.school[cite: 2]
* **Leonardo Maranhão Aureliano** (Tech Líder / Dev • GTI) – lma@cesar.school[cite: 2]
* **Leônidas Leandro** (Designer / Dev • GTI) – lls@cesar.school[cite: 2]
* **Thais Soares** (Designer / Dev • GTI) – tsbs@cesar.school[cite: 2]
* **Patrick Cruz** (Dados • Banco de Dados) – pjmc@cesar.school[cite: 2]
* **Ariely Dias** (Designer • GTI) – adt@cesar.school[cite: 2]

<br>

<div align="center">
  <p><i>Projeto acadêmico concebido com foco em Inovação Urbana e Governança Climática.</i></p>
  <br>
  <img src="https://www.cesar.school/wp-content/themes/alfama/assets/img/logo_cesar.png" alt="CESAR School" width="120" />
</div>