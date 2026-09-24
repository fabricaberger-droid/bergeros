// @ts-check
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('site-nav');
  /** @param {boolean} open */
  function setMenu(open) {
    if (!(menuButton instanceof HTMLButtonElement) || !navigation) return;
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  }
  if (menuButton instanceof HTMLButtonElement && navigation) {
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
    });
    document.addEventListener('click', (event) => {
      if (event.target instanceof Node && !navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 851px)').addEventListener('change', () => setMenu(false));
  }
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = Array.from(document.querySelectorAll('[role="tab"]')).filter(
    /** @returns {el is HTMLButtonElement} */ (el) => el instanceof HTMLButtonElement
  );
  const mobileTabs = window.matchMedia('(max-width: 850px)');
  function setTabOrientation() { if (tablist) tablist.setAttribute('aria-orientation', 'horizontal'); }
  setTabOrientation();
  mobileTabs.addEventListener('change', setTabOrientation);
  /** @param {HTMLButtonElement} activeTab @param {boolean} [focus] */
  function selectTab(activeTab, focus = false) {
    tabs.forEach((tab) => {
      const active = tab === activeTab;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      const panelId = tab.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (panel) { panel.hidden = !active; if (active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) panel.animate([{opacity:0.4, transform:'translateY(5px)'},{opacity:1, transform:'translateY(0)'}], {duration:180,easing:'ease-out'}); }
    });
    if (focus) activeTab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      const nextKey = 'ArrowRight';
      const previousKey = 'ArrowLeft';
      let nextIndex = index;
      if (event.key === nextKey) nextIndex = (index + 1) % tabs.length;
      else if (event.key === previousKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault(); const nextTab = tabs[nextIndex]; if (nextTab) selectTab(nextTab, true);
    });
  });
  const dialog = document.getElementById('screen-dialog');
  const dialogImage = document.getElementById('dialog-image');
  const dialogTitle = document.getElementById('screen-dialog-title');
  const imageWrap = document.querySelector('.dialog-image-wrap');
  const dialogCrop = document.querySelector('.dialog-crop');
  const closeButton = document.getElementById('close-screen');
  const zoomButton = document.getElementById('toggle-image-size');
  /** @type {Record<string, {x:number,y:number,w:number,h:number,nw:number,nh:number}>} */
  const crops = {
    'assets/product/berger-pipeline.png': {x:0,y:0,w:3200,h:2000,nw:3200,nh:2000},
    'assets/product/berger-atendimento.png': {x:0,y:0,w:3200,h:2000,nw:3200,nh:2000},
    'assets/product/berger-automacao.png': {x:0,y:0,w:2880,h:1800,nw:2880,nh:1800},
    'assets/product/berger-autonomia.png': {x:0,y:0,w:2880,h:1800,nw:2880,nh:1800}
  };
  /** @type {HTMLElement | null} */ let imageTrigger = null;
  let activeAspect = 16 / 9;
  /** @param {boolean} zoomed */
  function setZoom(zoomed) {
    if (!imageWrap || !zoomButton) return;
    if (dialog instanceof HTMLDialogElement && dialog.open && dialogCrop instanceof HTMLElement) {
      const header=dialog.querySelector('.dialog-header');const footer=dialog.querySelector('.dialog-footer');
      const availableHeight=Math.max(80,window.innerHeight-64-(header?.getBoundingClientRect().height||0)-(footer?.getBoundingClientRect().height||0));
      dialogCrop.style.width=String(zoomed?Math.max(1800,dialog.clientWidth):Math.min(dialog.clientWidth-2,availableHeight*activeAspect))+'px';
    }
    imageWrap.classList.toggle('is-zoomed', zoomed); zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.textContent = zoomed ? 'Ajustar à janela' : 'Ampliar detalhe ⤢'; imageWrap.scrollTop = 0; imageWrap.scrollLeft = 0;
  }
  if (dialog instanceof HTMLDialogElement && dialogImage instanceof HTMLImageElement && dialogTitle) {
    document.querySelectorAll('.expand-screen').forEach((trigger) => {
      if (!(trigger instanceof HTMLButtonElement)) return;
      trigger.addEventListener('click', () => {
        const src = trigger.dataset.image; if (!src) return;
        const crop = crops[trigger.dataset.crop || src]; if (!crop || !(dialogCrop instanceof HTMLElement)) return;
        activeAspect=crop.w/crop.h;
        imageTrigger = trigger; const title = trigger.dataset.title || 'Visualização do produto';
        dialogCrop.style.aspectRatio = String(crop.w) + ' / ' + String(crop.h);
        dialogImage.style.width = String(crop.nw / crop.w * 100) + '%';
        dialogImage.style.left = String(-crop.x / crop.w * 100) + '%';
        dialogImage.style.transform = 'translateY(' + String(-crop.y / crop.nh * 100) + '%)';
        dialogImage.src = src; dialogImage.alt = title + '. Simulação visual do CRM com identidade Berger e dados fictícios.'; dialogTitle.textContent = title;
        dialog.showModal(); setZoom(false); document.body.classList.add('modal-open');
        if (closeButton instanceof HTMLButtonElement) closeButton.focus();
      });
    });
    if (closeButton) closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const b = dialog.getBoundingClientRect();
      if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); setZoom(false); if (imageTrigger) imageTrigger.focus(); });
    window.addEventListener('resize',()=>{if(dialog.open)setZoom(zoomButton?.getAttribute('aria-pressed')==='true');});
    if (zoomButton) zoomButton.addEventListener('click', () => setZoom(zoomButton.getAttribute('aria-pressed') !== 'true'));
  }
  /** @type {Record<string, {label:string, text:string}>} */
  const challenges = {
    geral: {label:'entender a operação comercial',text:'Vamos olhar para o caminho entre a primeira mensagem, a negociação e o relacionamento com o comprador.'},
    atendimento: {label:'organizar o atendimento',text:'Vamos olhar para os canais, o histórico disponível e a passagem do atendimento para o vendedor.'},
    negociacao: {label:'acompanhar visitas e negociações',text:'Vamos olhar para as visitas, os retornos combinados e as oportunidades que precisam de um próximo passo.'},
    carteira: {label:'retomar contatos com a base',text:'Vamos olhar para o pós-venda e para os compradores com quem sua loja pode voltar a conversar.'}
  };
  const challengeSelect = document.getElementById('challenge');
  const response = document.getElementById('challenge-response');
  const whatsapp = document.getElementById('contextual-whatsapp');
  /** @param {string} value */
  function selectChallenge(value) {
    const choice = challenges[value]; if (!choice || !response || !(whatsapp instanceof HTMLAnchorElement)) return;
    response.textContent = choice.text;
    const message = 'Olá, Raphael. Quero agendar uma conversa de diagnóstico para minha revenda de veículos. Minha prioridade é ' + choice.label + '.';
    whatsapp.href = 'https://wa.me/5547999122932?text=' + encodeURIComponent(message);
  }
  if (challengeSelect instanceof HTMLSelectElement) { challengeSelect.addEventListener('change', () => selectChallenge(challengeSelect.value)); selectChallenge(challengeSelect.value); }

  const revenueForm = document.getElementById('revenue-form');
  const revenueInputs = ['monthly-contacts','current-conversion','scenario-conversion','average-sale'].map(id => document.getElementById(id));
  const slider = document.getElementById('conversion-slider');
  const error = document.getElementById('calculator-error');
  const money = new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:0});
  const number = new Intl.NumberFormat('pt-BR', {maximumFractionDigits:2});
  /** @param {string} id @param {string} value */
  function put(id, value) { const el=document.getElementById(id); if(el) el.textContent=value; }
  function updateRevenue() {
    if (!(revenueForm instanceof HTMLFormElement) || !error) return;
    try {
      const values = revenueInputs.map(input => input instanceof HTMLInputElement ? input.valueAsNumber : NaN);
      revenueInputs.forEach(input=>{if(input instanceof HTMLInputElement)input.setAttribute('aria-invalid',String(!Number.isFinite(input.valueAsNumber)||input.valueAsNumber<Number(input.min)||input.valueAsNumber>Number(input.max)||(input.id==='monthly-contacts'&&!Number.isInteger(input.valueAsNumber))));});
      const result=calculateBergerRevenue(values[0],values[1],values[2],values[3]);
      error.hidden=true;
      put('revenue-delta',money.format(result.additionalRevenue));
      const amount=number.format(Math.abs(result.additionalSales));
      put('revenue-explanation',result.additionalSales===0 ? 'Sem mudança estimada no número de vendas.' : amount+' '+(Math.abs(result.additionalSales)===1?'venda estimada':'vendas estimadas')+(result.additionalSales>0?' a mais':' a menos')+' por mês.');
      put('revenue-current',money.format(result.currentRevenue));put('revenue-scenario',money.format(result.scenarioRevenue));
      const max=Math.max(result.currentRevenue,result.scenarioRevenue,1);
      for(const [id,value] of [['bar-current',result.currentRevenue],['bar-scenario',result.scenarioRevenue]]) {const bar=document.getElementById(String(id));if(bar)bar.style.width=String(Number(value)/max*100)+'%';}
      if(slider instanceof HTMLInputElement){slider.value=String(values[2]);slider.setAttribute('aria-valuetext',number.format(values[2])+' por cento');}
      put('slider-value',number.format(values[2])+'%');
    } catch(cause) {
      error.textContent=cause instanceof Error?cause.message:'Confira os valores informados.';error.hidden=false;
      put('revenue-delta','Revise os dados');put('revenue-explanation','Preencha os campos para atualizar a simulação.');
      put('revenue-current','Indisponível');put('revenue-scenario','Indisponível');
      for(const id of ['bar-current','bar-scenario']){const bar=document.getElementById(id);if(bar)bar.style.width='0%';}
    }
  }
  if(revenueForm instanceof HTMLFormElement){
    revenueForm.addEventListener('submit',event=>event.preventDefault());
    revenueInputs.forEach(input=>input?.addEventListener('input',updateRevenue));
    if(slider instanceof HTMLInputElement)slider.addEventListener('input',()=>{const scenario=revenueInputs[2];if(scenario instanceof HTMLInputElement)scenario.value=slider.value;updateRevenue();});
    document.getElementById('reset-calculator')?.addEventListener('click',()=>{revenueForm.reset();updateRevenue();});
    updateRevenue();
  }
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const channelMap=document.getElementById('channel-flow');
  const flowToggle=document.getElementById('toggle-flow-motion');
  const flowControls=document.querySelector('.flow-controls');
  const flowPaths=document.querySelector('.channel-paths');
  if(channelMap && flowToggle instanceof HTMLButtonElement && flowPaths && 'IntersectionObserver' in window){
    let flowVisible=false;
    let flowPaused=false;
    const syncFlow=()=>{
      channelMap.classList.toggle('flow-running',flowVisible && !flowPaused && !motionPreference.matches && !document.hidden);
      if(flowControls instanceof HTMLElement)flowControls.hidden=motionPreference.matches;
      flowToggle.setAttribute('aria-pressed',String(flowPaused));
      const label=flowToggle.querySelector('.motion-control-label');
      const icon=flowToggle.querySelector('.motion-control-icon');
      if(label)label.textContent=flowPaused?'Retomar animação':'Pausar animação';
      if(icon)icon.textContent=flowPaused?'▷':'Ⅱ';
    };
    const drawFlow=()=>{
      flowPaths.replaceChildren();
      if(window.innerWidth<=1100)return;
      const box=channelMap.getBoundingClientRect();
      const hub=channelMap.querySelector('.hub-drawing');
      if(!hub)return;
      const center=hub.getBoundingClientRect();
      flowPaths.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
      const left=center.left-box.left+center.width*.035;
      const right=center.right-box.left-center.width*.035;
      const y=center.top-box.top+center.height/2;
      const ns='http://www.w3.org/2000/svg';
      /** @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2 @param {number} delay */
      const connect=(x1,y1,x2,y2,delay)=>{
        const middle=(x1+x2)/2;
        const d=`M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}`;
        for(const kind of ['flow-track','flow-signal']){
          const path=document.createElementNS(ns,'path');
          path.setAttribute('d',d);path.setAttribute('class',kind);path.setAttribute('pathLength','1');
          path.style.animationDelay=`${delay}s`;
          flowPaths.append(path);
        }
      };
      channelMap.querySelectorAll('.channel-origins li').forEach((item,i)=>{
        const b=item.getBoundingClientRect();connect(b.right-box.left+7,b.top-box.top+b.height/2,left,y,i*.8);
      });
      channelMap.querySelectorAll('.channel-outcomes .icon-medallion').forEach((item,i)=>{
        const b=item.getBoundingClientRect();connect(right,y,b.left-box.left-9,b.top-box.top+b.height/2,5+i*.9);
      });
    };
    channelMap.classList.add('flow-enhanced');
    const flowObserver=new IntersectionObserver(entries=>{flowVisible=entries[0].isIntersecting;syncFlow();},{threshold:0.08});
    flowObserver.observe(channelMap);
    flowToggle.addEventListener('click',()=>{flowPaused=!flowPaused;syncFlow();});
    document.addEventListener('visibilitychange',syncFlow);
    motionPreference.addEventListener('change',syncFlow);
    window.addEventListener('resize',drawFlow,{passive:true});
    void document.fonts.ready.then(drawFlow);
    drawFlow();syncFlow();
  }
  if('IntersectionObserver' in window && !motionPreference.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}}),{threshold:0.08,rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.editorial-heading,.pain-scene,.channel-map,.solution-columns,.photo-journey article,.product-heading,.hero-proof,.calculator-heading,.revenue-calculator,.founder').forEach(el=>{el.setAttribute('data-reveal','');observer.observe(el);});
    document.body.classList.add('motion-ready');
    document.addEventListener('focusin',event=>{if(event.target instanceof Element)event.target.closest('[data-reveal]')?.classList.add('is-revealed');});
    motionPreference.addEventListener('change',()=>{if(motionPreference.matches){observer.disconnect();document.body.classList.remove('motion-ready');}});
  }
})();
