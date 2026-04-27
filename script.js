/* ============================================================
   Portfolio — main.js
   Handles: custom cursor, theme toggle, nav scroll state,
            active nav highlighting, scroll-reveal
   ============================================================ */

(function () {
  'use strict';

  /* ── THEME ──────────────────────────────────────────────── */
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Init on load
  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', toggleTheme);

  // Sync with OS changes if no preference saved
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });


  /* ── CUSTOM CURSOR ──────────────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Lerp ring for smooth lag effect
  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateRing() {
    ringX = lerp(ringX, mouseX, 0.14);
    ringY = lerp(ringY, mouseY, 0.14);
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }

  animateRing();

  // Grow ring on interactive elements
  const interactives = document.querySelectorAll('a, button');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity     = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity     = '1';
    cursorRing.style.opacity = null; // let CSS handle
  });


  /* ── NAV SCROLL STATE ───────────────────────────────────── */
  const nav = document.getElementById('nav');

  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    highlightActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ── ACTIVE NAV LINK ────────────────────────────────────── */
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = Array.from(document.querySelectorAll('.nav-links a'));

  function highlightActiveNav() {
    const scrollMid = window.scrollY + window.innerHeight / 2;

    let activeId = sections[0]?.id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollMid) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === '#' + activeId) {
        link.style.color = 'var(--fg)';
      } else {
        link.style.color = '';
      }
    });
  }

  highlightActiveNav();


  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  // Lightweight reveal: elements slide up + fade in as they enter the viewport.
  // Add class .reveal to any element you want animated. We'll auto-add it here.
  const revealTargets = [
    '.section-header',
    '.about-grid',
    '.project-card',
    '.exp-row',
    '.contact-block',
  ];

  const revealStyle = document.createElement('style');
  revealStyle.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(revealStyle);

  const revealEls = [];

  revealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 0.08) + 's';
      revealEls.push(el);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));


  /* ── SMOOTH SCROLL FOR NAV LINKS ────────────────────────── */
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = nav.offsetHeight + 16;
          const top    = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });


  /* ── HERO CTA SMOOTH SCROLL ─────────────────────────────── */
  const heroCta = document.querySelector('.hero-bottom .btn-primary');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#work');
      if (target) {
        const offset = nav.offsetHeight + 16;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }


  /* ── CLEANUP ─────────────────────────────────────────────── */
  // Cancel rAF loop when page is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animateRing();
    }
  });

})();