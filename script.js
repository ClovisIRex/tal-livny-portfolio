'use strict';
(() => {
  const root = document.documentElement;
  const content = window.PORTFOLIO_CONTENT;
  const languageButton = document.getElementById('language-toggle');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let language = 'he';
  const labels = {
    he: {menu:'פתיחת תפריט',nav:'ניווט ראשי',carousel:'פרויקטים נבחרים',previous:'הפרויקט הקודם',next:'הפרויקט הבא',title:'טל ליבני | Full-stack & SecOps',description:'טל ליבני | פיתוח Full-stack, אוטומציה ו-SecOps. ניסיון מקצועי, פרויקטים ופרטי קשר.'},
    en: {menu:'Toggle navigation',nav:'Main navigation',carousel:'Selected projects',previous:'Previous project',next:'Next project',title:'Tal Livny | Full-stack & SecOps',description:'Tal Livny | Full-stack development, automation and SecOps. Explore my experience, projects and contact details.'}
  };
  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'he';
    root.lang = language;
    root.dir = language === 'he' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = content[language][el.dataset.i18n];
      // All content is authored locally, never interpolated from visitor input.
      if (value !== undefined) el.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => el.alt = content[language][el.dataset.i18nAlt]);
    document.querySelectorAll('.resume-download').forEach(el => {
      el.href = `assets/resumes/tal-livny-${el.dataset.kind}-${language}.${el.dataset.format}`;
      const name = content[language][el.dataset.kind + 'Resume'];
      el.setAttribute('aria-label', `${name} · ${el.dataset.format.toUpperCase()} · ${language === 'he' ? 'עברית' : 'English'}`);
    });
    languageButton.textContent = language === 'he' ? 'EN' : 'עב';
    languageButton.setAttribute('aria-label', language === 'he' ? 'Switch to English' : 'מעבר לעברית');
    menuButton.setAttribute('aria-label', labels[language].menu);
    nav.setAttribute('aria-label', labels[language].nav);
    document.querySelector('.carousel').setAttribute('aria-label', labels[language].carousel);
    document.getElementById('previous-project').setAttribute('aria-label', labels[language].previous);
    document.getElementById('next-project').setAttribute('aria-label', labels[language].next);
    document.title = labels[language].title;
    document.querySelector('meta[name="description"]').content = labels[language].description;
    try { localStorage.setItem('tal-portfolio-language', language); } catch (_) { /* Private browsing still works. */ }
  }
  let initial = new URLSearchParams(location.search).get('lang');
  if (!initial) { try { initial = localStorage.getItem('tal-portfolio-language'); } catch (_) {} }
  setLanguage(initial || 'he');
  languageButton.addEventListener('click', () => setLanguage(language === 'he' ? 'en' : 'he'));
  function closeMenu() { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  const slides = [...document.querySelectorAll('.project-slide')];
  const dots = [...document.querySelectorAll('[data-slide]')];
  const carousel = document.querySelector('.carousel');
  let active = 0;
  function showSlide(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== active;
      slide.classList.remove('is-changing');
      if (i === active && !motion.matches) { void slide.offsetWidth; slide.classList.add('is-changing'); }
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    document.getElementById('slide-number').textContent = String(active + 1).padStart(2, '0');
  }
  document.getElementById('previous-project').addEventListener('click', () => showSlide(active - 1));
  document.getElementById('next-project').addEventListener('click', () => showSlide(active + 1));
  dots.forEach(dot => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slide))));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') showSlide(0);
    else if (event.key === 'End') showSlide(slides.length - 1);
    else showSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let touchStart = null;
  const viewport = document.querySelector('.carousel-viewport');
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = {x:event.clientX, y:event.clientY};
  }, {passive:true});
  viewport.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(active + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});
  viewport.addEventListener('pointercancel', () => { touchStart = null; }, {passive:true});
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    root.classList.add('js-motion');
  }
  const progress = document.querySelector('.scroll-progress');
  let ticking = false;
  function updateProgress() {
    const available = root.scrollHeight - root.clientHeight;
    progress.style.width = `${available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 0}%`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, {passive:true});
  window.addEventListener('resize', updateProgress, {passive:true});
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();
})();
