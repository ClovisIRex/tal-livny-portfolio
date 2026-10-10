'use strict';
(() => {
  const root = document.documentElement;
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => motion.matches || root.classList.contains('reduce-motion');
  const header = document.querySelector('.site-header');
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => root.style.setProperty('--header', `${Math.ceil(header.getBoundingClientRect().height)}px`)).observe(header);
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 961px)').addEventListener('change', closeMenu);
  function revealTarget(target) {
    for (let details = target.closest('details'); details; details = details.parentElement?.closest('details')) details.open = true;
  }
  function selectCategory(key, focusHeading = true) {
    document.querySelectorAll('.search-match').forEach(el => el.classList.remove('search-match'));
    const panel = document.getElementById(`panel-${key}`);
    if (!panel) return;
    revealTarget(panel);
    if (focusHeading) {
      const heading = document.getElementById(`heading-${key}`);
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll: true});
      panel.scrollIntoView({behavior: reduceMotion() ? 'instant' : 'smooth', block: 'start'});
    }
  }
  // Native anchors work without JavaScript. Enhancement opens tool details and moves focus.
  function navigateToHash(hash, updateHash = false) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    revealTarget(target);
    closeMenu();
    if (updateHash && location.hash !== hash) {
      try { history.pushState(null, '', hash); }
      catch { location.hash = hash; }
    }
    const focusTarget = target.matches('main, h1, h2, h3, h4, article') ? target : target.querySelector('h1, h2, h3') || target;
    if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({preventScroll: true});
    target.scrollIntoView({behavior: reduceMotion() ? 'instant' : 'smooth', block: 'start'});
    nav.querySelectorAll('a').forEach(link => {
      if (link.hash === hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(link.hash.slice(1))) return;
    event.preventDefault();
    navigateToHash(link.hash, true);
  }));
  window.addEventListener('hashchange', () => navigateToHash(location.hash));
  window.addEventListener('popstate', () => navigateToHash(location.hash || '#top'));
  // Build suggestions from the visible experience and the complete tool lists.
  const searchInput = document.getElementById('expertise-query');
  const searchShell = document.querySelector('.expertise-search');
  const searchDropdown = document.getElementById('search-suggestions');
  const searchList = document.getElementById('expertise-results');
  const searchEmpty = document.getElementById('search-empty');
  const searchClear = document.getElementById('search-clear');
  const searchAnnouncement = document.getElementById('search-announcement');
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim();
  const aliases = {
    'check point firewall': 'checkpoint firewall',
    'active directory': 'ad windows domain identity administration',
    'aws': 'amazon web services',
    'azure': 'microsoft azure cloud',
    'google cloud': 'gcp google cloud platform',
    'sysinternals suite': 'microsoft windows process monitor procmon process explorer procexp autoruns',
    'windows event viewer': 'event logs logging',
    'vmware': 'virtual machines virtualization',
    'soc siem': 'security operations center security information event management',
    'sentinelone edr': 'endpoint detection response sentinel one',
    'crowdstrike falcon': 'edr endpoint detection response',
    'ida': 'ida pro disassembler reverse engineering',
    'node js': 'node nodejs',
    'react': 'reactjs react js',
    'vs code': 'visual studio code vscode',
    'azure devops': 'microsoft azure devops cicd ci cd',
    'gitlab': 'git lab cicd ci cd',
    'github actions': 'github pipelines cicd ci cd',
    'neuroscience': 'brain sciences machine learning',
    'c#': 'csharp c sharp',
    'c++': 'cpp c plus plus'
  };
  const searchEntries = [];
  function indexEntry(target, label, context, extra = '') {
    const panel = target.closest('.category-panel');
    if (!panel) return;
    const key = panel.id.replace('panel-', '');
    const alias = aliases[normalize(label)] || '';
    const logo = target.querySelector('.tech-logo-well, .company-logo, .program-logo, .language-logo, .project-app-logo');
    searchEntries.push({target, label, context, key, logo, words: normalize(`${label} ${context} ${extra} ${alias}`)});
  }
  document.querySelectorAll('.tech-item').forEach(el => indexEntry(el, el.dataset.searchLabel || el.lastElementChild.textContent.trim(), el.closest('.tech-group').querySelector('h3').textContent.trim(), el.textContent));
  document.querySelectorAll('.capability-list span').forEach(el => indexEntry(el, el.textContent.trim(), 'Security & systems'));
  document.querySelectorAll('.education-card').forEach(el => indexEntry(el, el.querySelector('h3').textContent.trim(), `Education · ${el.querySelector('.education-institution p').textContent.trim()}`, el.textContent));
  document.querySelectorAll('.timeline-item').forEach(el => indexEntry(el, el.querySelector('h3,h4').textContent.trim(), `Experience · ${el.querySelector('.role').textContent.trim()}`, el.textContent));
  document.querySelectorAll('.language-grid li').forEach(el => indexEntry(el, el.querySelector('strong').textContent.trim(), `Languages · ${el.querySelector('small').textContent.trim()}`));
  const projectIdentity = document.querySelector('.project-identity');
  indexEntry(projectIdentity, projectIdentity.querySelector('strong').textContent.trim(), 'Projects', document.getElementById('panel-project').textContent);
  let searchMatches = [];
  let activeSuggestion = -1;
  function fitSuggestions() {
    if (searchDropdown.hidden) return;
    const parent = searchShell.getBoundingClientRect();
    const field = searchInput.parentElement.getBoundingClientRect();
    const visual = window.visualViewport;
    const viewTop = visual?.offsetTop || 0;
    const viewBottom = viewTop + (visual?.height || window.innerHeight);
    const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
    const below = viewBottom - field.bottom - 24;
    const above = field.top - Math.max(headerBottom, viewTop) - 24;
    const useAbove = below < 200 && above > below;
    const available = Math.max(48, useAbove ? above : below);
    const footer = searchDropdown.querySelector('.search-dropdown-note');
    footer.hidden = available < 140;
    const footerHeight = footer.hidden ? 0 : footer.getBoundingClientRect().height;
    searchDropdown.style.top = useAbove ? 'auto' : `${field.bottom - parent.top + 8}px`;
    searchDropdown.style.bottom = useAbove ? `${parent.bottom - field.top + 8}px` : 'auto';
    searchDropdown.style.maxHeight = `${available}px`;
    searchList.style.maxHeight = `${Math.max(24, Math.min(346, available - footerHeight - 2))}px`;
  }
  function hideSuggestions() {
    searchDropdown.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    activeSuggestion = -1;
  }
  function activateSuggestion(index) {
    activeSuggestion = index;
    [...searchList.children].forEach((option, i) => option.setAttribute('aria-selected', String(i === index)));
    if (index >= 0) {
      const option = searchList.children[index];
      searchInput.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({block:'nearest'});
    } else searchInput.removeAttribute('aria-activedescendant');
  }
  function renderSuggestions() {
    const query = normalize(searchInput.value);
    searchClear.hidden = !searchInput.value;
    searchList.replaceChildren();
    activeSuggestion = -1;
    searchInput.removeAttribute('aria-activedescendant');
    if (!query) { hideSuggestions(); searchAnnouncement.textContent = ''; return; }
    const tokens = query.split(' ');
    const ranked = searchEntries.filter(entry => tokens.every(token => entry.words.includes(token))).map(entry => {
      const label = normalize(entry.label);
      return {entry, rank:label === query ? 0 : label.startsWith(query) ? 1 : label.includes(query) ? 2 : 3};
    }).sort((a,b) => a.rank - b.rank || a.entry.label.localeCompare(b.entry.label));
    searchMatches = ranked.slice(0, 8).map(result => result.entry);
    searchMatches.forEach((entry, index) => {
      const option = document.createElement('li');
      option.id = `expertise-option-${index}`;
      option.className = 'search-option';
      option.setAttribute('role','option');
      option.setAttribute('aria-selected','false');
      option.dataset.index = index;
      if (entry.logo) {
        const logo = document.createElement('span');
        logo.innerHTML = entry.logo.innerHTML;
        logo.className = 'search-result-logo';
        logo.setAttribute('aria-hidden','true');
        logo.querySelectorAll('img').forEach(img => { img.alt = ''; img.loading = 'eager'; });
        option.append(logo);
      } else {
        const marker = document.createElement('span');
        marker.className = 'search-result-marker';
        marker.setAttribute('aria-hidden','true');
        marker.textContent = entry.key === 'security' ? 'S' : entry.key === 'education' ? 'E' : 'D';
        option.append(marker);
      }
      const copy = document.createElement('span');
      copy.className = 'search-result-copy';
      const title = document.createElement('strong');
      title.textContent = entry.label;
      const detail = document.createElement('small');
      detail.textContent = entry.context;
      copy.append(title,detail);
      const arrow = document.createElement('span');
      arrow.className = 'search-result-arrow';
      arrow.setAttribute('aria-hidden','true');
      arrow.textContent = '↗';
      option.append(copy,arrow);
      searchList.append(option);
    });
    searchEmpty.hidden = searchMatches.length > 0;
    searchDropdown.hidden = false;
    searchInput.setAttribute('aria-expanded','true');
    fitSuggestions();
    searchAnnouncement.textContent = searchMatches.length ? `${ranked.length} matching results. Use the arrow keys and Enter to explore.` : 'No matching keywords.';
  }
  function chooseSuggestion(index) {
    const entry = searchMatches[index];
    if (!entry) return;
    selectCategory(entry.key, false, true);
    hideSuggestions();
    entry.target.classList.add('search-match');
    if (!entry.target.hasAttribute('tabindex')) entry.target.setAttribute('tabindex','-1');
    entry.target.focus({preventScroll:true});
    entry.target.scrollIntoView({behavior:reduceMotion() ? 'instant' : 'smooth', block:'center'});
    searchAnnouncement.textContent = `Showing ${entry.label} in ${document.getElementById(`heading-${entry.key}`).textContent}.`;
  }
  searchInput.addEventListener('input',renderSuggestions);
  searchInput.addEventListener('focus',renderSuggestions);
  searchInput.addEventListener('keydown',event => {
    if (event.key === 'Escape') { hideSuggestions(); return; }
    if (event.key === 'Tab') { hideSuggestions(); return; }
    if (!['ArrowDown','ArrowUp','Enter'].includes(event.key)) return;
    if (searchDropdown.hidden && searchInput.value.trim()) renderSuggestions();
    if (!searchMatches.length || searchDropdown.hidden) return;
    event.preventDefault();
    if (event.key === 'Enter') chooseSuggestion(activeSuggestion < 0 ? 0 : activeSuggestion);
    else activateSuggestion(event.key === 'ArrowDown' ? (activeSuggestion+1)%searchMatches.length : (activeSuggestion < 0 ? searchMatches.length-1 : (activeSuggestion-1+searchMatches.length)%searchMatches.length));
  });
  searchList.addEventListener('pointerdown',event => event.preventDefault());
  searchList.addEventListener('click',event => {
    const option = event.target.closest('[role="option"]');
    if (option) chooseSuggestion(Number(option.dataset.index));
  });
  searchClear.addEventListener('click',() => {
    searchInput.value = '';
    document.querySelectorAll('.search-match').forEach(el => el.classList.remove('search-match'));
    renderSuggestions();
    searchInput.focus();
  });
  document.addEventListener('click',event => { if (!searchShell.contains(event.target)) hideSuggestions(); });
  window.addEventListener('resize',fitSuggestions,{passive:true});
  window.addEventListener('scroll',fitSuggestions,{passive:true});
  window.visualViewport?.addEventListener('resize',fitSuggestions,{passive:true});
  window.visualViewport?.addEventListener('scroll',fitSuggestions,{passive:true});
  const slides = [...document.querySelectorAll('.project-slide')];
  const dots = [...document.querySelectorAll('[data-slide]')];
  const carousel = document.querySelector('.carousel');
  let active = 1;
  function showSlide(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== active;
      slide.classList.remove('is-changing');
      if (i === active && !reduceMotion()) { void slide.offsetWidth; slide.classList.add('is-changing'); }
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    document.getElementById('slide-number').textContent = String(active + 1).padStart(2, '0');
    document.getElementById('carousel-status').textContent = `Screenshot ${active + 1} of ${slides.length}: ${slides[active].querySelector('h3').textContent}.`;
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
  window.addEventListener('accessibilitychange', fitSuggestions);
  showSlide(active);
  if (location.hash) navigateToHash(location.hash);
  document.getElementById('year').textContent = new Date().getFullYear();
})();
