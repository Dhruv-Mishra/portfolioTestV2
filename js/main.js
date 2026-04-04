/* ===================================================================
   HUNAR KAUR — Portfolio JavaScript
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initDynamicBackground();
  initCustomCursor();
  initNavigation();
  initScrollProgress();
  initRevealAnimations();
  initNavGrid();
  initMagneticButtons();
  initPageTransitions();
  initTerminal();
  initTimeGreeting();
  initMarquee();
  initThemeToggle();
  initHaptics();
});

/* ── Haptic Feedback (web-haptics library) ────────────────────────── */
function initHaptics() {
  // Dynamically import web-haptics from CDN
  import('https://esm.sh/web-haptics@0.0.6').then(({ WebHaptics }) => {
    if (!WebHaptics.isSupported) return;

    const haptics = new WebHaptics();

    // Light tap for buttons/links
    const tapSelector = 'a, button, .btn, .nav__link, .nav__toggle, .nav__grid-btn, .nav-grid__item, .project-card, .chat-welcome__suggestion, .social-link, .theme-toggle, [role="button"]';

    document.addEventListener('touchstart', (e) => {
      if (e.target.closest(tapSelector)) {
        haptics.trigger(10, { intensity: 0.3 }); // Ultra-light 10ms tap
      }
    }, { passive: true });

    // Nudge for theme toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => haptics.trigger('nudge', { intensity: 0.4 }));
    }

    // Success for form submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', () => haptics.trigger('success', { intensity: 0.5 }));
    }

    // Light tap for nav toggle
    const navToggle = document.querySelector('.nav__toggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => haptics.trigger('nudge', { intensity: 0.3 }));
    }
  }).catch(() => {
    // Silently fail — haptics are a progressive enhancement
  });
}

/* ── Theme Toggle ─────────────────────────────────────────────────── */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'hunar_theme';

  // Load saved theme
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Update icon based on current theme
  function updateIcon() {
    if (!toggle) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    // Sun icon for dark mode (click to switch to light), moon for light mode
    toggle.innerHTML = isLight
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  }

  updateIcon();

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEY, 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(STORAGE_KEY, 'light');
      }
      updateIcon();
    });
  }
}

/* ── Dynamic Background ───────────────────────────────────────────── */
function initDynamicBackground() {
  const canvas = document.createElement('canvas');
  canvas.className = 'dynamic-bg';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  const BLOB_COUNT = isMobile ? 6 : 10;

  let w, h;
  let mouseX = -9999, mouseY = -9999;
  let blobs = [];
  let animId;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  let lastMouseTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMouseTime < 50) return;
    lastMouseTime = now;
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Color palette — adapts to theme
  const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
  const palette = isLightTheme ? [
    { r: 120, g: 20, b: 160 },     // deep purple
    { r: 180, g: 30, b: 60 },      // crimson red
    { r: 30, g: 80, b: 180 },      // royal blue
    { r: 90, g: 10, b: 150 },      // dark violet
    { r: 200, g: 40, b: 80 },      // ruby
    { r: 40, g: 60, b: 200 },      // cobalt blue
    { r: 140, g: 25, b: 130 },     // dark magenta
    { r: 60, g: 30, b: 170 },      // indigo
    { r: 170, g: 35, b: 100 },     // deep rose
    { r: 25, g: 100, b: 190 },     // ocean blue
  ] : [
    { r: 255, g: 120, b: 80 },     // bright coral
    { r: 220, g: 150, b: 50 },     // warm amber
    { r: 80, g: 160, b: 240 },     // bright blue
    { r: 200, g: 80, b: 140 },     // hot rose
    { r: 100, g: 210, b: 180 },    // bright teal
    { r: 240, g: 180, b: 50 },     // bright gold
    { r: 160, g: 100, b: 230 },    // bright lavender
    { r: 255, g: 160, b: 120 },    // bright peach
  ];

  class Blob {
    constructor(i, total) {
      // Distribute blobs evenly across the viewport using grid seeding
      const cols = Math.ceil(Math.sqrt(total * (w / h)));
      const rows = Math.ceil(total / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = w / cols;
      const cellH = h / rows;
      this.x = cellW * (col + 0.2 + Math.random() * 0.6);
      this.y = cellH * (row + 0.2 + Math.random() * 0.6);

      const minDim = Math.min(w, h);
      this.baseRadius = minDim * (isLightTheme ? (0.12 + Math.random() * 0.16) : (0.1 + Math.random() * 0.14));
      this.radius = this.baseRadius;
      // Ensure non-zero velocity with minimum speed
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = palette[i % palette.length];
      this.phase = Math.random() * Math.PI * 2;
      this.breathSpeed = 0.003 + Math.random() * 0.004;
      this.wobbleAmp = 0.08 + Math.random() * 0.06;
      this.opacity = isLightTheme ? (0.35 + Math.random() * 0.2) : (0.09 + Math.random() * 0.06);
    }

    update(time) {
      // Gentle breathing
      this.radius = this.baseRadius * (1 + Math.sin(time * this.breathSpeed + this.phase) * this.wobbleAmp);

      // Mouse influence — gentle attraction
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 400 && dist > 0) {
        const force = (400 - dist) / 400 * 0.008;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Damping
      this.vx *= 0.995;
      this.vy *= 0.995;

      this.x += this.vx;
      this.y += this.vy;

      // Soft bounds — bounce gently
      const margin = this.radius * 0.3;
      if (this.x < -margin) { this.x = -margin; this.vx = Math.abs(this.vx) * 0.5 + 0.05; }
      if (this.x > w + margin) { this.x = w + margin; this.vx = -Math.abs(this.vx) * 0.5 - 0.05; }
      if (this.y < -margin) { this.y = -margin; this.vy = Math.abs(this.vy) * 0.5 + 0.05; }
      if (this.y > h + margin) { this.y = h + margin; this.vy = -Math.abs(this.vy) * 0.5 - 0.05; }
    }
  }

  for (let i = 0; i < BLOB_COUNT; i++) {
    blobs.push(new Blob(i, BLOB_COUNT));
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);

    // Update all blobs
    for (let i = 0; i < blobs.length; i++) {
      blobs[i].update(time);
    }

    // Draw blobs with radial gradients — layered for glass effect
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const { r, g, a } = b.color;

      // Outer glow layer
      const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      gradient.addColorStop(0, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity})`);
      gradient.addColorStop(0.35, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity * 0.7})`);
      gradient.addColorStop(0.65, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, 0)`);
      gradient.addColorStop(1, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

    }

    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);
}

/* ── Custom Cursor ────────────────────────────────────────────────── */
function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor || window.matchMedia('(max-width: 768px)').matches) return;

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  let firstMove = true;
  let animating = false;

  // Hide cursor until first mouse move
  cursor.style.opacity = '0';

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (firstMove) {
      // Snap to position immediately on first move
      cursorX = mouseX;
      cursorY = mouseY;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      cursor.style.opacity = '1';
      document.body.classList.add('cursor-active');
      firstMove = false;
    }

    if (!animating) {
      animating = true;
      animate();
    }
  });

  // Hide cursor when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorX = mouseX;
    cursorY = mouseY;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursor.style.opacity = '1';
  });

  function animate() {
    if (Math.abs(mouseX - cursorX) < 0.5 && Math.abs(mouseY - cursorY) < 0.5) {
      cursorX = mouseX;
      cursorY = mouseY;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      animating = false;
      return;
    }
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animate);
  }

  // Hover states — event delegation for performance and dynamic elements
  const hoverSelector = 'a, button, .btn, .project-card, .skill-card, .nav-grid__item, input, textarea, .chat-welcome__suggestion, .social-link, .philosophy-card, .oss-card, .timeline__item, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) cursor.classList.add('hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) cursor.classList.remove('hovering');
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
}

/* ── Navigation ───────────────────────────────────────────────────── */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');

  // Scroll effect — RAF batched
  let navScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!navScrollTicking) {
      navScrollTicking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        navScrollTicking = false;
      });
    }
  }, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    function openNav() {
      links.classList.add('open');
      toggle.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      links.classList.remove('open');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      links.classList.contains('open') ? closeNav() : openNav();
    });

    // Close on link click
    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on backdrop click (the ::before pseudo-element area)
    links.addEventListener('click', (e) => {
      if (e.target === links) closeNav();
    });
  }

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Scroll Progress ──────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  let progressTicking = false;
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        bar.style.transform = `scaleX(${progress})`;
        progressTicking = false;
      });
    }
  }, { passive: true });
}

/* ── Reveal Animations ────────────────────────────────────────────── */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ── Navigation Grid Menu ─────────────────────────────────────────── */
function initNavGrid() {
  const grid = document.getElementById('navGrid');
  if (!grid) return;

  const backdrop = grid.querySelector('.nav-grid__backdrop');
  const gridBtn = document.querySelector('.nav__grid-btn');

  function open() {
    grid.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    grid.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggle() {
    grid.classList.contains('open') ? close() : open();
  }

  if (gridBtn) gridBtn.addEventListener('click', toggle);
  if (backdrop) backdrop.addEventListener('click', close);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && grid.classList.contains('open')) close();
  });

  // Close on link click inside grid
  grid.querySelectorAll('.nav-grid__item').forEach(item => {
    item.addEventListener('click', () => {
      // Let external links open normally
      if (!item.getAttribute('target')) close();
    });
  });
}

/* ── Magnetic Buttons ─────────────────────────────────────────────── */
function initMagneticButtons() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/* ── Page Transitions ─────────────────────────────────────────────── */
let isNavigating = false;

function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Overlay starts visible (opacity:1 in CSS) — covers raw page load.
  // Once DOM is ready, fade it out to reveal the page.
  requestAnimationFrame(() => {
    overlay.classList.add('hidden');
  });

  // Intercept local links via event delegation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
    if (link.getAttribute('target')) return;

    e.preventDefault();
    navigateTo(href);
  });
}

function navigateTo(url) {
  if (isNavigating) return;
  isNavigating = true;

  const overlay = document.querySelector('.page-transition');
  if (!overlay) {
    window.location.href = url;
    return;
  }

  // Show overlay (remove hidden class → opacity transitions to 1)
  overlay.classList.remove('hidden');

  // Navigate after overlay fully covers
  setTimeout(() => {
    window.location.href = url;
  }, 350);
}

/* ── Terminal ─────────────────────────────────────────────────────── */
function initTerminal() {
  const terminal = document.querySelector('.terminal');
  if (!terminal) return;

  const body = terminal.querySelector('.terminal__body');
  const input = terminal.querySelector('.terminal__input');
  if (!input) return;

  const commands = {
    help: () => [
      'Available commands:',
      '  whoami       — About Hunar',
      '  skills       — Technical skills',
      '  education    — Academic background',
      '  experience   — Work experience',
      '  contact      — Contact info',
      '  home         — Go to home page',
      '  about        — Go to about page',
      '  projects     — Go to projects page',
      '  chat         — Open chat',
      '  quote        — Random dev quote',
      '  clear        — Clear terminal',
      '  help         — Show this message',
    ],
    whoami: () => [
      'Hunar Kaur',
      'Software Engineer 1 @ PayPal',
      'IIIT Delhi Alumna (CS & Applied Mathematics)',
      '',
      'Building reliable backend systems that power',
      'seamless digital experiences. Passionate about',
      'scalable architecture and clean code.',
    ],
    skills: () => [
      '── Languages ──────────────',
      '  Java · Python',
      '',
      '── Backend ────────────────',
      '  Spring Boot · REST APIs · Caching Strategies',
      '  Low-Latency API Optimization · Scalability',
      '',
      '── Data & Tools ───────────',
      '  Jupyter Notebook · Recommender Systems · DBMS',
      '',
      '── Design ─────────────────',
      '  Figma · Canva · UI/UX Prototyping',
    ],
    education: () => [
      '🎓 IIIT Delhi',
      '   B.Tech in Computer Science & Applied Mathematics',
      '   Graduated 2024',
      '',
      '   Blended CS coursework with advanced',
      '   mathematical optimization and modeling.',
    ],
    experience: () => [
      '── Current ────────────────',
      '  Software Engineer 1 @ PayPal',
      '  Jul 2024 – Present · Bengaluru',
      '  Communications Hub — Java/Spring Boot',
      '',
      '── Previous ───────────────',
      '  SWE Intern @ PayPal',
      '  May – Jul 2023 · Bengaluru',
      '  API latency reduction & caching',
      '',
      '  UI Designer Intern @ ScrapUncle',
      '  Jun – Aug 2022 · New Delhi',
      '  Figma prototyping & UX design',
    ],
    contact: () => [
      '�  linkedin.com/in/hunar-kaur-229067242',
      '🐙  github.com/HunarKaur25',
      '📍  Bengaluru, India',
    ],
    projects: () => [
      'Redirecting to projects page...',
    ],
    home: () => [
      'Redirecting to home page...',
    ],
    about: () => [
      'Redirecting to about page...',
    ],
    chat: () => [
      'Redirecting to chat...',
    ],
    contact: () => [
      'Redirecting to contact page...',
    ],
    quote: () => {
      const quotes = [
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"The best error message is the one that never shows up." — Thomas Fuchs',
        '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
        '"Simplicity is the soul of efficiency." — Austin Freeman',
        '"Make it work, make it right, make it fast." — Kent Beck',
      ];
      return [quotes[Math.floor(Math.random() * quotes.length)]];
    },
    clear: () => 'CLEAR',
  };

  const TERMINAL_STORAGE_KEY = 'hunar_terminal_history';
  let terminalHistory = []; // {text, type} entries

  // Restore terminal history from sessionStorage (survives page switch, not refresh)
  function restoreTerminalHistory() {
    try {
      const raw = sessionStorage.getItem(TERMINAL_STORAGE_KEY);
      if (!raw) return;
      const entries = JSON.parse(raw);
      if (!Array.isArray(entries)) return;
      terminalHistory = entries;
      entries.forEach(entry => addLine(entry.text, entry.type));
      body.scrollTop = body.scrollHeight;
    } catch (e) {
      sessionStorage.removeItem(TERMINAL_STORAGE_KEY);
    }
  }

  function saveTerminalHistory() {
    try {
      sessionStorage.setItem(TERMINAL_STORAGE_KEY, JSON.stringify(terminalHistory));
    } catch (e) { /* storage full */ }
  }

  function addLine(text, type = 'output') {
    const line = document.createElement('div');
    line.className = 'terminal__line';
    if (type === 'command') {
      line.innerHTML = `<span class="terminal__prompt">hunar@portfolio ~$</span> <span class="terminal__command">${escapeHtml(text)}</span>`;
    } else {
      line.innerHTML = `<span class="terminal__output">${escapeHtml(text)}</span>`;
    }
    const inputLine = body.querySelector('.terminal__input-line');
    body.insertBefore(line, inputLine);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      if (!cmd) return;

      addLine(cmd, 'command');
      terminalHistory.push({ text: cmd, type: 'command' });
      input.value = '';

      if (commands[cmd]) {
        const result = commands[cmd]();
        if (result === 'CLEAR') {
          const inputLine = body.querySelector('.terminal__input-line');
          while (body.firstChild !== inputLine) {
            body.removeChild(body.firstChild);
          }
          terminalHistory = [];
        } else if (['projects', 'home', 'about', 'chat', 'contact'].includes(cmd)) {
          addLine(result[0]);
          terminalHistory.push({ text: result[0], type: 'output' });
          saveTerminalHistory();
          const pageMap = { projects: 'projects.html', home: 'index.html', about: 'about.html', chat: 'chat.html', contact: 'contact.html' };
          setTimeout(() => navigateTo(pageMap[cmd]), 800);
        } else {
          result.forEach(line => {
            addLine(line);
            terminalHistory.push({ text: line, type: 'output' });
          });
        }
      } else {
        const errText = `Command not found: ${cmd}. Type 'help' for available commands.`;
        addLine(errText);
        terminalHistory.push({ text: errText, type: 'output' });
      }

      saveTerminalHistory();
      body.scrollTop = body.scrollHeight;
    }
  });

  // Restore history on init
  restoreTerminalHistory();

  // Focus terminal on click
  terminal.addEventListener('click', () => input.focus());
}

/* ── Time-based Greeting ──────────────────────────────────────────── */
function initTimeGreeting() {
  const el = document.querySelector('.hero__greeting');
  if (!el) return;

  const taglines = [
    'Backend Engineer',
    'Java & Spring Boot',
    'Building at Scale',
    'IIIT Delhi Alumna',
    'Notification Systems',
    'API Architect',
    'PayPal Comms Hub',
  ];

  let currentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentText = '';

  function type() {
    const target = taglines[currentIndex];

    if (!isDeleting) {
      currentText = target.substring(0, charIndex + 1);
      charIndex++;
    } else {
      currentText = target.substring(0, charIndex - 1);
      charIndex--;
    }

    el.textContent = currentText;

    let delay;

    if (!isDeleting && charIndex === target.length) {
      // Pause at full text
      delay = 3000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Move to next tagline
      isDeleting = false;
      currentIndex = (currentIndex + 1) % taglines.length;
      delay = 500;
    } else {
      delay = isDeleting ? 40 : 80 + Math.random() * 40;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ── Marquee ──────────────────────────────────────────────────────── */
function initMarquee() {
  const marquee = document.querySelector('.marquee__inner');
  if (!marquee) return;

  // Clone items for seamless loop
  const content = marquee.innerHTML;
  marquee.innerHTML = content + content;
}

/* ── Toast Notification ───────────────────────────────────────────── */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ── Konami Code Easter Egg ───────────────────────────────────────── */
(function() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        activateEasterEgg();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function activateEasterEgg() {
    document.documentElement.style.setProperty('--accent', '#FF2D95');
    showToast('🎉 Easter egg unlocked! You found the Konami code!');

    // Create confetti
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: hsl(${Math.random() * 360}, 80%, 60%);
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 999999;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }

    // Add confetti animation
    if (!document.querySelector('#confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Reset accent after 5 seconds
    setTimeout(() => {
      document.documentElement.style.setProperty('--accent', '#FF764D');
    }, 5000);
  }
})();
