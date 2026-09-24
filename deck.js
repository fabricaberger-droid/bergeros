// @ts-check
(() => {
  const slides = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.slide')));
  const stage = /** @type {HTMLElement} */ (document.querySelector('.deck-stage'));
  const shell = /** @type {HTMLElement} */ (document.querySelector('.deck-shell'));
  const counter = /** @type {HTMLElement} */ (document.querySelector('.counter'));
  const progress = /** @type {HTMLElement} */ (document.querySelector('.progress'));
  const live = /** @type {HTMLElement} */ (document.getElementById('slide-status'));
  const contents = /** @type {HTMLElement} */ (document.getElementById('contents'));
  const menu = /** @type {HTMLButtonElement} */ (document.getElementById('menu'));
  const items = /** @type {HTMLElement} */ (document.querySelector('.contents-grid'));
  let current = 0;
  let reading = window.innerWidth <= 700;
  const readButton = /** @type {HTMLButtonElement} */ (document.getElementById('reading'));
  /** @param {boolean} value */
  function setReading(value) {
    reading = value;
    document.body.classList.toggle('reading', value);
    readButton.setAttribute('aria-pressed', String(value));
    readButton.textContent = value ? 'Modo slides' : 'Modo leitura';
    slides.forEach((slide,index)=>{slide.hidden=!value && index!==current;slide.setAttribute('aria-hidden',String(!value && index!==current));});
    fit();
  }
  readButton.addEventListener('click',()=>setReading(!reading));
  /** @param {number} number */
  function show(number) {
    current = Math.max(0, Math.min(slides.length - 1, number));
    slides.forEach((slide, index) => { slide.hidden = !reading && index !== current; slide.setAttribute('aria-hidden', String(!reading && index !== current)); });
    (/** @type {HTMLButtonElement} */ (document.getElementById('prev'))).disabled = current === 0;
    (/** @type {HTMLButtonElement} */ (document.getElementById('next'))).disabled = current === slides.length - 1;
    if(reading) slides[current].scrollIntoView({block:'start'});
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    live.textContent = `Slide ${current + 1}: ${slides[current].dataset.title}`;
    try { history.replaceState(null, '', `#slide-${current + 1}`); } catch { /* file:// mantém navegação sem histórico */ }
  }
  function fit() { if(reading) { stage.style.transform='none'; return; } stage.style.transform = `scale(${Math.min(shell.clientWidth / 1600, shell.clientHeight / 900)})`; }
  /** @param {boolean} open */
  function setMenu(open) {
    contents.hidden = !open;
    menu.setAttribute('aria-expanded', String(open));
    if(open) contents.querySelector('button')?.focus(); else menu.focus();
  }
  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    const number = document.createElement('span'); number.className = 'contents-number'; number.textContent = String(index + 1).padStart(2, '0');
    button.append(number, document.createTextNode(slide.dataset.title || 'Slide'));
    button.addEventListener('click', () => { show(index); setMenu(false); });
    items.append(button);
  });
  document.getElementById('prev')?.addEventListener('click', () => show(current - 1));
  document.getElementById('next')?.addEventListener('click', () => show(current + 1));
  menu.addEventListener('click', () => setMenu(contents.hidden));
  document.getElementById('close-menu')?.addEventListener('click', () => setMenu(false));
  document.getElementById('print')?.addEventListener('click', () => window.print());
  async function fullscreen() {
    try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { live.textContent = 'Use o modo de tela cheia do navegador.'; }
  }
  document.getElementById('fullscreen')?.addEventListener('click', fullscreen);
  document.addEventListener('keydown', event => {
    if(!contents.hidden) {
      if(event.key === 'Escape') { event.preventDefault(); setMenu(false); }
      if(event.key === 'Tab') {
        const focusables = Array.from(contents.querySelectorAll('button'));
        const first = focusables[0]; const last = focusables[focusables.length - 1];
        if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if(reading || event.ctrlKey || event.metaKey || event.altKey) return;
    if(['ArrowRight','PageDown'].includes(event.key)) { event.preventDefault(); show(current + 1); }
    if(['ArrowLeft','PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
    if(event.key === 'Home') { event.preventDefault(); show(0); }
    if(event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    if(event.key.toLowerCase() === 'f') fullscreen();
  });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => { const match = location.hash.match(/^#slide-(\d+)$/); if(match) show(Number(match[1]) - 1); });
  const initial = location.hash.match(/^#slide-(\d+)$/);
  setReading(reading);
  show(initial ? Number(initial[1]) - 1 : 0); fit();
  let wasReading = false;
  window.addEventListener('beforeprint',()=>{wasReading=reading;if(reading)setReading(false);});
  window.addEventListener('afterprint',()=>{if(wasReading)setReading(true);});
})();
