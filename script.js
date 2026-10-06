'use strict';
(() => {
  const root = document.documentElement;
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  const categoryButtons = [...document.querySelectorAll('[data-category]')];
  const panels = [...document.querySelectorAll('.category-panel')];
  let selectedCategory = null;
  function selectCategory(key, focusHeading = true) {
    selectedCategory = key === selectedCategory ? null : key;
    categoryButtons.forEach(button => button.setAttribute('aria-expanded', String(button.dataset.category === selectedCategory)));
    panels.forEach(panel => { panel.hidden = panel.id !== `panel-${selectedCategory}`; });
    if (selectedCategory && focusHeading) {
      const heading = document.getElementById(`heading-${selectedCategory}`);
      heading.focus({preventScroll:true});
      document.getElementById('categories').scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth',block:'start'});
    }
    updateProgress();
  }
  categoryButtons.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.category)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
    const previous = selectedCategory;
    selectCategory(previous, false);
    categoryButtons.find(button => button.dataset.category === previous)?.focus({preventScroll:true});
  }));
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

