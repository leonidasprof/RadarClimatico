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
     07. SIMULAÇÃO DE TELEMETRIA AO VIVO (MICROCROSSING EM TEMPO REAL)
     ========================================================================== */
  const liveTemp = document.getElementById('liveTemp');
  const liveHumidity = document.getElementById('liveHumidity');

  if (liveTemp && liveHumidity) {
    setInterval(() => {
      // Pequena oscilação realista nos décimos de temperatura
      const baseTemp = 34.2;
      const variation = (Math.random() * 0.4 - 0.2).toFixed(1);
      const newTemp = (baseTemp + parseFloat(variation)).toFixed(1).replace('.', ',');
      liveTemp.textContent = `${newTemp}°C`;

      // Pequena oscilação de umidade
      const baseHum = 45;
      const humVariation = Math.floor(Math.random() * 3) - 1;
      liveHumidity.textContent = `${baseHum + humVariation}%`;
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
