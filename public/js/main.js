/* ============================================================
   STATE
============================================================ */
let currentLang = 'ru';
let translations = {};

/* ============================================================
   LANGUAGE DETECTION & LOADING
============================================================ */
function detectLang() {
  const saved = localStorage.getItem('yf-lang');
  if (saved === 'et' || saved === 'ru') return saved;
  const browser = (navigator.language || '').substring(0, 2).toLowerCase();
  return browser === 'et' ? 'et' : 'ru';
}

async function loadLang(lang) {
  try {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) throw new Error('locale fetch failed');
    translations = await res.json();
    currentLang = lang;
    localStorage.setItem('yf-lang', lang);
    applyTranslations();
  } catch (e) {
    console.error('Failed to load locale:', lang, e);
  }
}

function applyTranslations() {
  const t = translations;
  document.documentElement.lang = currentLang;

  // Plain text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Placeholder attributes
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Logo text (same key in both locales, different value)
  const logoText = document.getElementById('logo-text');
  if (logoText && t.nav_logo) logoText.textContent = t.nav_logo;
  const footerLogoText = document.getElementById('footer-logo-text');
  if (footerLogoText && t.nav_logo) footerLogoText.textContent = t.nav_logo;

  // Meta title
  if (t.meta_title) document.title = t.meta_title;

  // Lang toggle button labels
  document.getElementById('lang-toggle').textContent   = currentLang === 'ru' ? 'ET' : 'RU';
  document.getElementById('mobile-lang-toggle').textContent =
    currentLang === 'ru' ? 'Eesti keeles' : 'На русском';

  // Dynamic sections
  renderStats(t.stats || []);
  renderServices(t.services || [], t.services_cta || '');
  renderTestimonials(t.testimonials || []);
  populateServiceSelect(t.services || [], t.form_service_default || '');

  // Result labels (hardcoded but language-aware)
  const resultLabels = document.querySelectorAll('.result-label');
  if (currentLang === 'et') {
    if (resultLabels[0]) resultLabels[0].textContent = 'Maria · −20+ kg';
    if (resultLabels[1]) resultLabels[1].textContent = 'Oksana · −20+ kg';
    if (resultLabels[2]) resultLabels[2].textContent = 'Andrei · Transformatsioon';
  } else {
    if (resultLabels[0]) resultLabels[0].textContent = 'Мария · −20+ кг';
    if (resultLabels[1]) resultLabels[1].textContent = 'Оксана · −20+ кг';
    if (resultLabels[2]) resultLabels[2].textContent = 'Андрей · Трансформация';
  }

  // Footer badges
  updateAboutBadges();
}

function updateAboutBadges() {
  const badgesEl = document.querySelector('.about-badges');
  if (!badgesEl) return;
  const badges = currentLang === 'et'
    ? ['Alates 2009', 'Men\'s Physique', 'Eesti meister', 'Sertifitseeritud', '1000+ klienti']
    : ['С 2009 года', 'Men\'s Physique', 'Чемпион Эстонии', 'Сертифицированный', '1000+ клиентов'];
  badgesEl.innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');
}

/* ============================================================
   RENDER: STATS
============================================================ */
function renderStats(stats) {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;
  grid.innerHTML = stats.map((s, i) => `
    <div class="stat-item" role="listitem">
      <span class="stat-number" data-target="${s.num}" data-suffix="${s.suffix}">
        ${s.num}${s.suffix}
      </span>
      <span class="stat-label">${s.label}</span>
    </div>
  `).join('');
  observeStats();
}

/* ============================================================
   RENDER: SERVICES
============================================================ */
const SERVICE_ICONS = ['🏋️', '📅', '📆', '👫', '👥', '💬', '💻', '📍', '🌐'];

function renderServices(services, ctaText) {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = services.map((s, i) => `
    <div class="service-card reveal" role="listitem">
      <div class="service-icon" aria-hidden="true">${SERVICE_ICONS[i] || '⚡'}</div>
      <h3 class="service-name">${s.name}</h3>
      <p class="service-desc">${s.desc}</p>
      <div class="service-footer">
        <span class="service-price">${s.price}</span>
        <a href="#contact" class="service-btn">${ctaText}</a>
      </div>
    </div>
  `).join('');
  // Re-observe newly inserted elements
  observeRevealElements();
}

/* ============================================================
   RENDER: TESTIMONIALS
============================================================ */
function renderTestimonials(testimonials) {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  const initials = ['М', 'О', 'А'];
  const initialsEt = ['M', 'O', 'A'];
  const inits = currentLang === 'et' ? initialsEt : initials;

  grid.innerHTML = testimonials.map((t, i) => `
    <div class="testimonial-card reveal" role="listitem">
      <div class="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar" aria-hidden="true"
             style="background:var(--yellow);color:var(--black);font-family:var(--font-display);font-size:20px;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;flex-shrink:0;">
          ${inits[i] || t.name[0]}
        </div>
        <span class="testimonial-name">${t.name}</span>
      </div>
    </div>
  `).join('');
  observeRevealElements();
}

/* ============================================================
   RENDER: SERVICE SELECT OPTIONS
============================================================ */
function populateServiceSelect(services, defaultText) {
  const select = document.getElementById('f-service');
  if (!select) return;
  // Clear dynamic options
  select.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
  const defaultOpt = select.querySelector('option[value=""]');
  if (defaultOpt && defaultText) defaultOpt.textContent = defaultText;
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = `${s.name} — ${s.price}`;
    select.appendChild(opt);
  });
}

/* ============================================================
   NAVBAR
============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll behaviour
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile menu toggle
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Language toggles
  document.getElementById('lang-toggle').addEventListener('click', toggleLang);
  document.getElementById('mobile-lang-toggle').addEventListener('click', () => {
    toggleLang();
    mobileMenu.classList.remove('open');
    menuBtn.classList.remove('open');
  });
}

function toggleLang() {
  const next = currentLang === 'ru' ? 'et' : 'ru';
  loadLang(next);
}

/* ============================================================
   SCROLL REVEAL
============================================================ */
let revealObserver;

function observeRevealElements() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ============================================================
   STATS COUNTER ANIMATION
============================================================ */
function observeStats() {
  const statsBar = document.getElementById('stats-bar');
  if (!statsBar) return;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
      statsObserver.disconnect();
    }
  }, { threshold: 0.4 });

  statsObserver.observe(statsBar);
}

function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const rawTarget = el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const target = parseInt(rawTarget, 10);
    if (isNaN(target)) return;

    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

/* ============================================================
   CONTACT FORM
============================================================ */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successEl.className = 'form-message';
    errorEl.className   = 'form-message';

    const name    = form.querySelector('#f-name').value.trim();
    const contact = form.querySelector('#f-contact').value.trim();
    const service = form.querySelector('#f-service').value;
    const message = form.querySelector('#f-message').value.trim();

    // Client-side validation
    if (!name) {
      showFormError(errorEl, translations.form_error || 'Please enter your name.');
      form.querySelector('#f-name').focus();
      return;
    }
    if (!contact) {
      showFormError(errorEl, translations.form_error || 'Please enter email or phone.');
      form.querySelector('#f-contact').focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '...';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, service, message }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        successEl.textContent = translations.form_success || 'Message sent!';
        successEl.className = 'form-message success';
        form.reset();
      } else {
        showFormError(errorEl, translations.form_error || 'Something went wrong.');
      }
    } catch {
      showFormError(errorEl, translations.form_error || 'Something went wrong.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = translations.form_submit || originalText;
    }
  });
}

function showFormError(el, msg) {
  el.textContent = msg;
  el.className = 'form-message error';
}

/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initForm();

  const lang = detectLang();
  loadLang(lang).then(() => {
    observeRevealElements();
  });

  // Make hero elements visible on load (they animate in via CSS)
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
});
