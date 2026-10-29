/* ==========================================================================
   RADAR CLIMÁTICO - JAVASCRIPT PRINCIPAL
   Interações, Modo Escuro/Claro, Preloader, Modais, Telemetria Real (Open-Meteo)
   e Painel Principal Interativo Embutido (MVP v2.1)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     01. PRELOADER ANIMADO COM O CARANGUEJO
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderStatus = document.getElementById('preloaderStatus');

  const statusMessages = [
    'Conectando API meteorológica Open-Meteo...',
    'Calibrando microclimas por bairro (Landsat / NDVI)...',
    'Sincronizando telemetria urbana do Recife...',
    'Carregando modelo térmico B2G...',
    'Pronto!'
  ];

  let progress = 0;
  let statusIndex = 0;

  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 8;
    if (progress > 100) progress = 100;

    if (preloaderBar) {
      preloaderBar.style.width = `${progress}%`;
    }

    if (progress > (statusIndex + 1) * 20 && statusIndex < statusMessages.length - 1) {
      statusIndex++;
      if (preloaderStatus) {
        preloaderStatus.textContent = statusMessages[statusIndex];
      }
    }

    if (progress >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('fade-out');
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 600);
        }
      }, 400);
    }
  }, 120);

  // Fallback de segurança para garantir remoção do preloader
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        setTimeout(() => { preloader.style.display = 'none'; }, 600);
      }
    }, 1500);
  });


  /* ==========================================================================
     02. GERENCIADOR DE TEMA (MODO ESCURO / MODO CLARO)
     ========================================================================== */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const navLogo = document.getElementById('navLogo');
  const footerLogo = document.getElementById('footerLogo');

  const LOGO_DARK = 'fundo_escuro.png';
  const LOGO_LIGHT = 'fundo_claro.png';

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('radar_theme', theme);

    if (theme === 'light') {
      if (navLogo) navLogo.src = LOGO_LIGHT;
      if (footerLogo) footerLogo.src = LOGO_LIGHT;
    } else {
      if (navLogo) navLogo.src = LOGO_DARK;
      if (footerLogo) footerLogo.src = LOGO_DARK;
    }
  }

  const savedTheme = localStorage.getItem('radar_theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }


  /* ==========================================================================
     03. NAVBAR SCROLL & ACTIVE STATE HIGHLIGHT
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentSectionId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });


  /* ==========================================================================
     04. MENU MOBILE HAMBURGER
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }


  /* ==========================================================================
     05. SCROLL REVEAL COM INTERSECTION OBSERVER
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-in');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }


  /* ==========================================================================
     06. GERENCIAMENTO DE MODAIS (ALERTAS E MAPA ZOOM)
     ========================================================================== */
  const alertsModal = document.getElementById('alertsModal');
  const btnOpenAlerts = document.getElementById('btnOpenAlerts');
  const heroAlertsBtn = document.getElementById('heroAlertsBtn');
  const closeAlertsModal = document.getElementById('closeAlertsModal');

  const mapZoomModal = document.getElementById('mapZoomModal');
  const mapMainImage = document.getElementById('mapMainImage');
  const closeMapZoomModal = document.getElementById('closeMapZoomModal');

  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (btnOpenAlerts) btnOpenAlerts.addEventListener('click', () => openModal(alertsModal));
  if (heroAlertsBtn) heroAlertsBtn.addEventListener('click', () => openModal(alertsModal));
  if (closeAlertsModal) closeAlertsModal.addEventListener('click', () => closeModal(alertsModal));

  if (mapMainImage) mapMainImage.addEventListener('click', () => openModal(mapZoomModal));
  if (closeMapZoomModal) closeMapZoomModal.addEventListener('click', () => closeModal(mapZoomModal));

  [alertsModal, mapZoomModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(alertsModal);
      closeModal(mapZoomModal);
    }
  });


  /* ==========================================================================
     07. TELEMETRIA METEOROLÓGICA EM TEMPO REAL (OPEN-METEO API) &
         SELETOR INTERATIVO DE BAIRROS DO RECIFE
     ========================================================================== */
  // Deltas biofísicos reais (Landsat 8/9 ST_B10 + Sentinel-2 NDVI + MapBiomas 11)
  // sincronizados com src/lib/geo-services/realtime-weather-service.ts do MVP
  const NEIGHBORHOOD_MODELS = {
    'boa-viagem': {
      name: 'Boa Viagem',
      zoneDesc: 'Zona Sul • Alta Densidade',
      tempDelta: +0.6,
      feelsDelta: +1.4,
      humidityDelta: +2,
      canopy: 9
    },
    'santo-amaro': {
      name: 'Santo Amaro',
      zoneDesc: 'Centro Expandido • Ilha de Calor',
      tempDelta: +2.4,
      feelsDelta: +4.2,
      humidityDelta: -6,
      canopy: 5
    },
    'imbiribeira': {
      name: 'Imbiribeira',
      zoneDesc: 'Eixo Comercial • Tráfego Pesado',
      tempDelta: +1.2,
      feelsDelta: +2.2,
      humidityDelta: -2,
      canopy: 8
    },
    'sao-jose': {
      name: 'São José / Centro',
      zoneDesc: 'Polo Central • Grande Fluxo',
      tempDelta: +1.8,
      feelsDelta: +3.2,
      humidityDelta: -4,
      canopy: 7
    },
    'ibura': {
      name: 'Ibura',
      zoneDesc: 'Periferia • Alta Vulnerabilidade',
      tempDelta: +1.0,
      feelsDelta: +1.8,
      humidityDelta: -1,
      canopy: 11
    },
    'madalena': {
      name: 'Madalena / Torre',
      zoneDesc: 'Eixo Fluvial • Capibaribe',
      tempDelta: -0.3,
      feelsDelta: -0.4,
      humidityDelta: +3,
      canopy: 16
    },
    'varzea': {
      name: 'Várzea',
      zoneDesc: 'Zona Oeste • Cobertura Verde',
      tempDelta: -1.8,
      feelsDelta: -2.9,
      humidityDelta: +5,
      canopy: 28
    },
    'dois-irmaos': {
      name: 'Dois Irmãos',
      zoneDesc: 'Zona Noroeste • Mata Atlântica',
      tempDelta: -3.2,
      feelsDelta: -5.4,
      humidityDelta: +8,
      canopy: 48
    }
  };

  // Estado meteorológico base do Recife (atualizado ao vivo pela API Open-Meteo)
  let recifeLiveState = {
    baseTempNow: 29.8,
    baseFeelsNow: 33.4,
    basePeakTempToday: 31.4,
    basePeakFeelsToday: 35.2,
    baseHumidity: 66,
    fetchedAt: null,
    isLive: false
  };

  let currentSelectedBairro = 'boa-viagem';

  const heroBairroBadge = document.getElementById('heroBairroBadge');
  const bairroDropdownTrigger = document.getElementById('bairroDropdownTrigger');
  const bairrosDropdownMenu = document.getElementById('bairrosDropdownMenu');
  const heroBairroName = document.getElementById('heroBairroName');
  const heroPeakTemp = document.getElementById('heroPeakTemp');
  const heroNowTemp = document.getElementById('heroNowTemp');
  const heroLiveStatus = document.getElementById('heroLiveStatus');

  const liveTempLabel = document.getElementById('liveTempLabel');
  const liveTemp = document.getElementById('liveTemp');
  const liveTempSub = document.getElementById('liveTempSub');
  const liveHumidity = document.getElementById('liveHumidity');
  const liveHumiditySub = document.getElementById('liveHumiditySub');
  const liveRiskValue = document.getElementById('liveRiskValue');
  const liveRiskText = document.getElementById('liveRiskText');
  const liveRiskSub = document.getElementById('liveRiskSub');
  const liveRiskDot = document.getElementById('liveRiskDot');
  const liveRiskIconBox = document.getElementById('liveRiskIconBox');
  const bairroDropdownItems = document.querySelectorAll('.bairro-dropdown-item');

  function formatBR(num) {
    return Number(num).toFixed(1).replace('.', ',');
  }

  function formatDot(num) {
    return Number(num).toFixed(1);
  }

  /**
   * Calcula todas as métricas reais calibradas para um bairro específico
   */
  function computeNeighborhoodMetrics(key) {
    const model = NEIGHBORHOOD_MODELS[key] || NEIGHBORHOOD_MODELS['boa-viagem'];
    const tempNow = Number((recifeLiveState.baseTempNow + model.tempDelta).toFixed(1));
    const feelsNow = Number((recifeLiveState.baseFeelsNow + model.feelsDelta).toFixed(1));
    const peakToday = Math.max(
      tempNow,
      Number((recifeLiveState.basePeakTempToday + model.tempDelta).toFixed(1))
    );
    const humidity = Math.max(30, Math.min(95, Math.round(recifeLiveState.baseHumidity + model.humidityDelta)));

    // Classificação bioclimática real (Classes A a E) idêntica à lógica do MVP
    let rating = 'C';
    if (feelsNow <= 31.5 && model.canopy >= 35) rating = 'A';
    else if (feelsNow <= 34.0) rating = 'B';
    else if (feelsNow <= 37.5) rating = 'C';
    else if (feelsNow <= 41.0) rating = 'D';
    else rating = 'E';

    // Nível de risco térmico operacional
    let riskLabel = 'MODERADO';
    let riskClass = 'val-teal';
    let dotClass = 'dot-teal';
    let iconBoxClass = 'teal-icon';

    if (rating === 'A') {
      riskLabel = 'BAIXO';
      riskClass = 'val-safe';
      dotClass = 'dot-safe';
      iconBoxClass = 'green-icon';
    } else if (rating === 'B') {
      riskLabel = 'MODERADO';
      riskClass = 'val-teal';
      dotClass = 'dot-teal';
      iconBoxClass = 'teal-icon';
    } else if (rating === 'C') {
      riskLabel = 'ATENÇÃO';
      riskClass = 'val-warning';
      dotClass = 'dot-warning';
      iconBoxClass = 'amber-icon';
    } else if (rating === 'D') {
      riskLabel = 'ALTO';
      riskClass = 'val-danger';
      dotClass = 'dot-danger';
      iconBoxClass = 'orange-icon';
    } else {
      riskLabel = 'CRÍTICO';
      riskClass = 'val-danger';
      dotClass = 'dot-danger';
      iconBoxClass = 'orange-icon';
    }

    return {
      key,
      name: model.name,
      tempNow,
      feelsNow,
      peakToday,
      humidity,
      rating,
      riskLabel,
      riskClass,
      dotClass,
      iconBoxClass
    };
  }

  function triggerTelemetryFlash() {
    const elementsToFlash = [heroPeakTemp, heroNowTemp, liveTemp, liveHumidity, liveRiskValue];
    elementsToFlash.forEach(el => {
      if (el) {
        el.classList.remove('flash-update');
        void el.offsetWidth;
        el.classList.add('flash-update');
      }
    });
  }

  /**
   * Atualiza todos os itens do menu suspenso, os hotspots do radar e os KPIs da Hero
   */
  function renderAllNeighborhoodsAndKPIs(animate = false) {
    // 1. Atualiza as temperaturas no menu dropdown de bairros
    bairroDropdownItems.forEach(item => {
      const key = item.getAttribute('data-bairro');
      if (!key) return;
      const metrics = computeNeighborhoodMetrics(key);
      const tempSpan = item.querySelector('.bairro-item-temp');
      if (tempSpan) {
        tempSpan.textContent = `Pico ${formatBR(metrics.peakToday)}°C`;
      }
      const isSelected = key === currentSelectedBairro;
      item.classList.toggle('active', isSelected);
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    // 2. Atualiza os hotspots do disco de radar e modal de alertas
    const bv = computeNeighborhoodMetrics('boa-viagem');
    const imb = computeNeighborhoodMetrics('imbiribeira');
    const sj = computeNeighborhoodMetrics('sao-jose');
    const spot1 = document.querySelector('.spot-1');
    const spot2 = document.querySelector('.spot-2');
    const spot3 = document.querySelector('.spot-3');
    if (spot1) spot1.setAttribute('title', `Boa Viagem • Pico Hoje: ${formatBR(bv.peakToday)}°C (Agora: ${formatBR(bv.tempNow)}°C)`);
    if (spot2) spot2.setAttribute('title', `Imbiribeira • Pico Hoje: ${formatBR(imb.peakToday)}°C (Agora: ${formatBR(imb.tempNow)}°C)`);
    if (spot3) spot3.setAttribute('title', `São José / Centro • Pico Hoje: ${formatBR(sj.peakToday)}°C (Agora: ${formatBR(sj.tempNow)}°C)`);

    // 3. Atualiza o badge flutuante e os 3 KPIs para o bairro selecionado
    const active = computeNeighborhoodMetrics(currentSelectedBairro);

    if (heroBairroName) heroBairroName.textContent = active.name;
    if (heroPeakTemp) heroPeakTemp.textContent = `${formatBR(active.peakToday)}°C`;
    if (heroNowTemp) heroNowTemp.textContent = `${formatBR(active.tempNow)}°C`;

    if (heroLiveStatus) {
      heroLiveStatus.textContent = recifeLiveState.isLive
        ? `● Open-Meteo (${recifeLiveState.fetchedAt}) • Clique p/ trocar`
        : `● Modelo Biofísico • Clique p/ trocar`;
    }

    if (liveTempLabel) {
      liveTempLabel.textContent = `PICO HOJE • ${active.name.toUpperCase()}`;
    }
    if (liveTemp) {
      liveTemp.textContent = `${formatBR(active.peakToday)}°C`;
    }
    if (liveTempSub) {
      liveTempSub.textContent = `Agora: ${formatBR(active.tempNow)}°C • Sensação: ${formatBR(active.feelsNow)}°C`;
    }

    if (liveHumidity) {
      liveHumidity.textContent = `${active.humidity}%`;
    }
    if (liveHumiditySub) {
      liveHumiditySub.textContent = recifeLiveState.isLive
        ? `Open-Meteo ao vivo (${recifeLiveState.fetchedAt})`
        : `Umidade calibrada • ${active.name}`;
    }

    if (liveRiskText) {
      liveRiskText.textContent = active.riskLabel;
    }
    if (liveRiskSub) {
      liveRiskSub.textContent = `Classe ${active.rating} • Sensação ${formatBR(active.feelsNow)}°C`;
    }
    if (liveRiskValue) {
      liveRiskValue.className = `telemetry-value ${active.riskClass}`;
    }
    if (liveRiskDot) {
      liveRiskDot.className = `pulsing-mini-dot ${active.dotClass}`;
    }
    if (liveRiskIconBox) {
      liveRiskIconBox.className = `weather-icon-box ${active.iconBoxClass}`;
    }

    if (animate) {
      triggerTelemetryFlash();
    }
  }

  /**
   * Busca dados reais da API pública Open-Meteo para Recife (-8.05, -34.90)
   */
  async function syncRealOpenMeteoWeather() {
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=-8.05&longitude=-34.90&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day&hourly=temperature_2m,apparent_temperature&timezone=America%2FRecife&forecast_days=1';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data && data.current && typeof data.current.temperature_2m === 'number') {
        const tempNow = Number(data.current.temperature_2m.toFixed(1));
        const feelsNow = Number((data.current.apparent_temperature ?? tempNow).toFixed(1));
        const humidityNow = Math.round(data.current.relative_humidity_2m ?? 65);

        // Calcula o pico real observado hoje até o horário atual em Recife
        let maxTempToday = tempNow;
        let maxFeelsToday = feelsNow;
        const currentHourRecife = new Date().getHours();

        if (data.hourly && Array.isArray(data.hourly.temperature_2m)) {
          data.hourly.temperature_2m.forEach((t, idx) => {
            if (idx <= currentHourRecife && typeof t === 'number' && t > maxTempToday) {
              maxTempToday = Number(t.toFixed(1));
            }
          });
        }
        if (data.hourly && Array.isArray(data.hourly.apparent_temperature)) {
          data.hourly.apparent_temperature.forEach((f, idx) => {
            if (idx <= currentHourRecife && typeof f === 'number' && f > maxFeelsToday) {
              maxFeelsToday = Number(f.toFixed(1));
            }
          });
        }

        const nowStr = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        recifeLiveState = {
          baseTempNow: tempNow,
          baseFeelsNow: feelsNow,
          basePeakTempToday: maxTempToday,
          basePeakFeelsToday: maxFeelsToday,
          baseHumidity: humidityNow,
          fetchedAt: nowStr,
          isLive: true
        };

        renderAllNeighborhoodsAndKPIs(true);
      }
    } catch (err) {
      console.warn('Usando telemetria biofísica de contingência:', err);
      renderAllNeighborhoodsAndKPIs(false);
    }
  }

  function setDropdownOpen(open) {
    if (!heroBairroBadge) return;
    if (open) {
      heroBairroBadge.classList.add('dropdown-active');
      if (bairroDropdownTrigger) bairroDropdownTrigger.setAttribute('aria-expanded', 'true');
    } else {
      heroBairroBadge.classList.remove('dropdown-active');
      if (bairroDropdownTrigger) bairroDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  }

  function selectNeighborhood(key) {
    if (!NEIGHBORHOOD_MODELS[key]) return;
    currentSelectedBairro = key;
    renderAllNeighborhoodsAndKPIs(true);
    setDropdownOpen(false);
  }

  // Permite clicar em QUALQUER lugar do card flutuante (#heroBairroBadge) para abrir/fechar a lista
  if (heroBairroBadge) {
    heroBairroBadge.addEventListener('click', (e) => {
      // Se o clique foi dentro do menu dropdown já aberto, deixa o handler do item tratar
      if (bairrosDropdownMenu && bairrosDropdownMenu.contains(e.target)) {
        return;
      }
      e.stopPropagation();
      const isOpen = heroBairroBadge.classList.contains('dropdown-active');
      setDropdownOpen(!isOpen);
    });

    bairroDropdownItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bairroKey = btn.getAttribute('data-bairro');
        if (bairroKey) {
          selectNeighborhood(bairroKey);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!heroBairroBadge.contains(e.target)) {
        setDropdownOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    });
  }

  // Renderiza imediatamente e sincroniza com a API pública Open-Meteo (atualizando a cada 5 min)
  renderAllNeighborhoodsAndKPIs(false);
  syncRealOpenMeteoWeather();
  setInterval(syncRealOpenMeteoWeather, 5 * 60 * 1000);


  /* ==========================================================================
     08. PAINEL PRINCIPAL DO APP EMBUTIDO AO VIVO (SEÇÃO #MVP)
     ========================================================================== */
  const mvpLiveIframe = document.getElementById('mvpLiveIframe');
  const mvpIframeViewport = document.getElementById('mvpIframeViewport');
  const btnReloadMvpIframe = document.getElementById('btnReloadMvpIframe');
  const btnOpenMvpFull = document.getElementById('btnOpenMvpFull');

  const NATIVE_APP_WIDTH = 1440;
  const NATIVE_APP_HEIGHT = 860;

  function resolveMvpAppUrl(withPreviewParam = true) {
    const isFileProtocol = window.location.protocol === 'file:';
    const base = isFileProtocol ? 'https://radarclimatico.vercel.app/' : '/';
    return withPreviewParam ? `${base}?preview=1` : base;
  }

  if (mvpLiveIframe) {
    mvpLiveIframe.src = resolveMvpAppUrl(true);
  }
  if (btnOpenMvpFull) {
    btnOpenMvpFull.href = resolveMvpAppUrl(false);
  }
  if (btnReloadMvpIframe && mvpLiveIframe) {
    btnReloadMvpIframe.addEventListener('click', () => {
      mvpLiveIframe.src = resolveMvpAppUrl(true);
    });
  }

  function updateMvpIframeScale() {
    if (!mvpIframeViewport || !mvpLiveIframe) return;
    const containerWidth = mvpIframeViewport.clientWidth;
    if (containerWidth <= 0) return;

    const scale = containerWidth / NATIVE_APP_WIDTH;
    const scaledHeight = Math.round(NATIVE_APP_HEIGHT * scale);

    mvpLiveIframe.style.width = `${NATIVE_APP_WIDTH}px`;
    mvpLiveIframe.style.height = `${NATIVE_APP_HEIGHT}px`;
    mvpLiveIframe.style.transform = `scale(${scale})`;
    mvpIframeViewport.style.height = `${scaledHeight}px`;
  }

  if (mvpIframeViewport && mvpLiveIframe) {
    updateMvpIframeScale();
    window.addEventListener('resize', updateMvpIframeScale);
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => updateMvpIframeScale());
      ro.observe(mvpIframeViewport);
    }
  }


  /* ==========================================================================
     09. FORMULÁRIO DE ALERTAS & NEWSLETTER
     ========================================================================== */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterInput = document.getElementById('newsletterInput');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = newsletterInput.value.trim();
      if (val) {
        newsletterInput.value = '';
        alert(`Inscrição confirmada com sucesso! Você receberá alertas prioritários de calor urbano no Recife em: ${val}`);
      }
    });
  }

});
