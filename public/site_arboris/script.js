/* ==========================================================================
   RADAR CLIMÁTICO - JAVASCRIPT PRINCIPAL
   Interações, Modo Escuro/Claro, Preloader, Modais e Telemetria
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     01. PRELOADER ANIMADO COM O CARANGUEJO
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderStatus = document.getElementById('preloaderStatus');

  const statusMessages = [
    'Conectando dataloggers RCW-800W...',
    'Mapeando microclima do Recife...',
    'Sincronizando Plataformas Móveis (Ônibus)...',
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

  // Verifica preferência salva ou do sistema
  const savedTheme = localStorage.getItem('radar_theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Padrão escuro como na imagem de referência do projeto
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
    // Efeito de scroll compacto
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Identificação da seção ativa no menu
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

    // Fecha ao clicar em algum link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });

    // Fecha ao clicar fora
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
    // Fallback caso navegador não suporte IntersectionObserver
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

  // Modal Alertas
  if (btnOpenAlerts) btnOpenAlerts.addEventListener('click', () => openModal(alertsModal));
  if (heroAlertsBtn) heroAlertsBtn.addEventListener('click', () => openModal(alertsModal));
  if (closeAlertsModal) closeAlertsModal.addEventListener('click', () => closeModal(alertsModal));

  // Modal Zoom Mapa
  if (mapMainImage) mapMainImage.addEventListener('click', () => openModal(mapZoomModal));
  if (closeMapZoomModal) closeMapZoomModal.addEventListener('click', () => closeModal(mapZoomModal));

  // Fechar ao clicar no backdrop
  [alertsModal, mapZoomModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Fechar com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(alertsModal);
      closeModal(mapZoomModal);
    }
  });


  /* ==========================================================================
     07. SELETOR INTERATIVO DE BAIRROS PILOTO & TELEMETRIA DA HERO
     ========================================================================== */
  const PILOT_NEIGHBORHOODS = {
    'boa-viagem': {
      name: 'Boa Viagem',
      peak: '34.2°C',
      temp: '34,2°C',
      baseTemp: 34.2,
      humidity: '45%',
      baseHum: 45,
      risk: 'ALTO',
      riskClass: 'val-danger',
      dotClass: 'dot-danger',
      iconBoxClass: 'orange-icon'
    },
    'imbiribeira': {
      name: 'Imbiribeira',
      peak: '33.8°C',
      temp: '33,8°C',
      baseTemp: 33.8,
      humidity: '48%',
      baseHum: 48,
      risk: 'ALTO',
      riskClass: 'val-danger',
      dotClass: 'dot-danger',
      iconBoxClass: 'orange-icon'
    },
    'sao-jose': {
      name: 'São José / Centro',
      peak: '33.1°C',
      temp: '33,1°C',
      baseTemp: 33.1,
      humidity: '52%',
      baseHum: 52,
      risk: 'ATENÇÃO',
      riskClass: 'val-warning',
      dotClass: 'dot-warning',
      iconBoxClass: 'amber-icon'
    },
    'madalena': {
      name: 'Madalena / Torre',
      peak: '31.6°C',
      temp: '31,6°C',
      baseTemp: 31.6,
      humidity: '64%',
      baseHum: 64,
      risk: 'MODERADO',
      riskClass: 'val-teal',
      dotClass: 'dot-teal',
      iconBoxClass: 'teal-icon'
    },
    'varzea': {
      name: 'Várzea',
      peak: '29.8°C',
      temp: '29,8°C',
      baseTemp: 29.8,
      humidity: '71%',
      baseHum: 71,
      risk: 'BAIXO',
      riskClass: 'val-safe',
      dotClass: 'dot-safe',
      iconBoxClass: 'green-icon'
    },
    'ibura': {
      name: 'Ibura',
      peak: '33.5°C',
      temp: '33,5°C',
      baseTemp: 33.5,
      humidity: '50%',
      baseHum: 50,
      risk: 'ALTO',
      riskClass: 'val-danger',
      dotClass: 'dot-danger',
      iconBoxClass: 'orange-icon'
    }
  };

  const heroBairroBadge = document.getElementById('heroBairroBadge');
  const bairroDropdownTrigger = document.getElementById('bairroDropdownTrigger');
  const bairrosDropdownMenu = document.getElementById('bairrosDropdownMenu');
  const heroBairroName = document.getElementById('heroBairroName');
  const heroPeakTemp = document.getElementById('heroPeakTemp');

  const liveTemp = document.getElementById('liveTemp');
  const liveHumidity = document.getElementById('liveHumidity');
  const liveRiskValue = document.getElementById('liveRiskValue');
  const liveRiskText = document.getElementById('liveRiskText');
  const liveRiskDot = document.getElementById('liveRiskDot');
  const liveRiskIconBox = document.getElementById('liveRiskIconBox');
  const bairroDropdownItems = document.querySelectorAll('.bairro-dropdown-item');

  let activeBaseTemp = 34.2;
  let activeBaseHum = 45;

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

  function triggerTelemetryFlash() {
    const elementsToFlash = [heroPeakTemp, liveTemp, liveHumidity, liveRiskValue];
    elementsToFlash.forEach(el => {
      if (el) {
        el.classList.remove('flash-update');
        void el.offsetWidth; // Force reflow
        el.classList.add('flash-update');
      }
    });
  }

  function selectNeighborhood(key) {
    const data = PILOT_NEIGHBORHOODS[key];
    if (!data) return;

    // Atualiza o card flutuante na Hero
    if (heroBairroName) heroBairroName.textContent = data.name;
    if (heroPeakTemp) heroPeakTemp.textContent = data.peak;

    // Atualiza os KPIs na Hero
    if (liveTemp) liveTemp.textContent = data.temp;
    if (liveHumidity) liveHumidity.textContent = data.humidity;
    if (liveRiskText) liveRiskText.textContent = data.risk;

    if (liveRiskValue) {
      liveRiskValue.className = `telemetry-value ${data.riskClass}`;
    }
    if (liveRiskDot) {
      liveRiskDot.className = `pulsing-mini-dot ${data.dotClass}`;
    }
    if (liveRiskIconBox) {
      liveRiskIconBox.className = `weather-icon-box ${data.iconBoxClass}`;
    }

    // Efeito visual sutil de atualização
    triggerTelemetryFlash();

    // Sincroniza estado ativo nos botões do dropdown
    bairroDropdownItems.forEach(item => {
      const isSelected = item.getAttribute('data-bairro') === key;
      item.classList.toggle('active', isSelected);
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    // Atualiza os valores base da simulação periódica
    activeBaseTemp = data.baseTemp;
    activeBaseHum = data.baseHum;

    // Fecha o dropdown com suavidade
    setDropdownOpen(false);
  }

  // Evento de clique para abrir/fechar o dropdown
  if (bairroDropdownTrigger && heroBairroBadge) {
    bairroDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = heroBairroBadge.classList.contains('dropdown-active');
      setDropdownOpen(!isOpen);
    });

    // Clique nas opções de bairros
    bairroDropdownItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bairroKey = btn.getAttribute('data-bairro');
        if (bairroKey) {
          selectNeighborhood(bairroKey);
        }
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!heroBairroBadge.contains(e.target)) {
        setDropdownOpen(false);
      }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    });
  }

  // Simulação contínua com oscilação calibrada em torno do bairro selecionado
  if (liveTemp && liveHumidity) {
    setInterval(() => {
      const variation = (Math.random() * 0.4 - 0.2).toFixed(1);
      const newTemp = (activeBaseTemp + parseFloat(variation)).toFixed(1).replace('.', ',');
      liveTemp.textContent = `${newTemp}°C`;

      const humVariation = Math.floor(Math.random() * 3) - 1;
      liveHumidity.textContent = `${activeBaseHum + humVariation}%`;
    }, 6000);
  }


  /* ==========================================================================
     08. FORMULÁRIO DE ALERTAS & NEWSLETTER
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
