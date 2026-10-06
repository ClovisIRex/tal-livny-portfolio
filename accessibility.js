'use strict';
(() => {
  const root = document.documentElement;
  const dialog = document.getElementById('accessibility-dialog');
  const opens = [...document.querySelectorAll('[data-accessibility-open]')];
  const text = document.getElementById('accessibility-text');
  const contrast = document.getElementById('accessibility-contrast');
  const links = document.getElementById('accessibility-links');
  const motion = document.getElementById('accessibility-motion');
  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaults = {text:'100', contrast:false, links:false, motion:false};
  let preferences = {...defaults};
  let opener = null;
  try {
    const saved = JSON.parse(localStorage.getItem('tal-portfolio-accessibility') || 'null');
    if (saved && ['100','125','150','200'].includes(String(saved.text))) {
      preferences = {text:String(saved.text), contrast:saved.contrast === true, links:saved.links === true, motion:saved.motion === true};
    }
  } catch { /* Preferences still work when storage is unavailable. */ }
  function apply() {
    root.style.fontSize = `${preferences.text}%`;
    root.classList.toggle('text-enlarged',preferences.text !== '100');
    root.classList.toggle('higher-contrast',preferences.contrast);
    root.classList.toggle('underline-links',preferences.links);
    root.classList.toggle('reduce-motion',preferences.motion || systemMotion.matches);
    text.value = preferences.text;
    contrast.checked = preferences.contrast;
    links.checked = preferences.links;
    motion.checked = preferences.motion || systemMotion.matches;
    motion.disabled = systemMotion.matches;
    document.getElementById('accessibility-motion-note').textContent = systemMotion.matches ? 'Reduced motion is enabled by your device and remains active.' : "Your device's reduced-motion preference is respected automatically.";
    window.dispatchEvent(new Event('accessibilitychange'));
  }
  function save() {
    preferences = {text:text.value, contrast:contrast.checked, links:links.checked, motion:motion.checked};
    try { localStorage.setItem('tal-portfolio-accessibility',JSON.stringify(preferences)); } catch {}
    apply();
  }
  opens.forEach(button => button.addEventListener('click',() => {
    opener = button;
    if (!dialog.open) dialog.showModal();
    opens.forEach(el => el.setAttribute('aria-expanded','true'));
  }));
  document.querySelector('[data-accessibility-close]').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => {
    opens.forEach(el => el.setAttribute('aria-expanded','false'));
    opener?.focus({preventScroll:true});
  });
  [text,contrast,links,motion].forEach(control => control.addEventListener('change',save));
  document.getElementById('accessibility-reset').addEventListener('click',() => {
    preferences = {...defaults};
    try { localStorage.removeItem('tal-portfolio-accessibility'); } catch {}
    apply();
  });
  systemMotion.addEventListener('change',apply);
  apply();
})();
