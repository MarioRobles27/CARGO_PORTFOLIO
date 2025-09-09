// ===== Barra de progreso =====
(function(){
  const progress = document.getElementById('progress');
  function onScroll(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop)/(h.scrollHeight - h.clientHeight);
    if(progress) progress.style.width = (scrolled*100) + '%';
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// ===== Reveal on scroll =====
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.18});
  els.forEach(el=>io.observe(el));
})();

// ===== Cursor seguidor =====
(function(){
  const cursor = document.getElementById('cursor');
  if(!cursor) return;
  let cx=0, cy=0, tx=0, ty=0;
  const lerp=(a,b,n)=>a+(b-a)*n;
  function raf(){
    cx=lerp(cx,tx,.18);
    cy=lerp(cy,ty,.18);
    cursor.style.transform = `translate(${cx-7}px, ${cy-7}px)`;
    requestAnimationFrame(raf);
  }
  window.addEventListener('pointermove',(e)=>{
    tx=e.clientX; ty=e.clientY;
    document.documentElement.style.setProperty('--mx', e.clientX+'px');
    document.documentElement.style.setProperty('--my', e.clientY+'px');
  },{passive:true});
  requestAnimationFrame(raf);
})();

// ===== Parallax fondo HERO =====
(function(){
  const bg = document.getElementById('bg');
  if(!bg) return;
  window.addEventListener('pointermove',(e)=>{
    const x = e.clientX / window.innerWidth - .5;
    const y = e.clientY / window.innerHeight - .5;
    bg.style.transform = `translate(${x*10}px, ${y*10}px)`;
  },{passive:true});
})();

// ===== Efecto magnético =====
(function(){
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('mousemove',(e)=>{
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width/2);
      const y = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${x*.12}px, ${y*.12}px)`;
    });
    el.addEventListener('mouseleave',()=>{ el.style.transform='translate(0,0)'; });
  });
})();

// ===== Glow =====
(function(){
  document.querySelectorAll('.skill, .proj .thumb, .work-tile').forEach(el=>{
    el.addEventListener('mousemove',(e)=>{
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx',(e.clientX-r.left)+'px');
      el.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
  });
})();

// ===== Tilt =====
(function(){
  document.querySelectorAll('.tilt').forEach(el=>{
    el.addEventListener('mousemove',(e)=>{
      const r = el.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;
      el.style.transform = `rotateY(${px*10}deg) rotateX(${-py*10}deg)`;
    });
    el.addEventListener('mouseleave',()=>{ el.style.transform='rotateY(0) rotateX(0)'; });
  });
})();

// ===== Split text H1 (robusto para 1 solo H1 con data-split) =====
(function(){
  const el = document.querySelector('[data-split]');
  if(!el) return;
  if(el.dataset.splitDone === '1') return;              // evita doble ejecución
  const raw = el.textContent || el.innerText || '';
  const text = raw.trim().replace(/\s+/g,' ');
  if(!text) return;
  el.setAttribute('aria-label', text);
  let i = 0;
  const html = text.split(' ').map((w, wi) => {
    const letters = Array.from(w).map(ch => {
      const out = `<span class="char" style="display:inline-block;transform:translateY(30px);opacity:0;transition:transform .6s ${i*12}ms, opacity .6s ${i*12}ms">${ch}</span>`;
      i++; return out;
    }).join('');
    i++;
    return `<span class="word" style="white-space:nowrap;display:inline-block">${letters}</span>${wi < text.split(' ').length-1 ? ' ' : ''}`;
  }).join('');
  el.innerHTML = html;
  el.dataset.splitDone = '1';
  requestAnimationFrame(()=>{
    el.querySelectorAll('.char').forEach(s=>{
      s.style.transform='translateY(0)';
      s.style.opacity='1';
    });
  });
})();

// ===== Smooth anchor focus (ignora #! y anchors sin destino) =====
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',(ev)=>{
      const href = a.getAttribute('href');
      if(href === '#!' || href === '#') return; // no interferir con subitems
      const id = href.slice(1);
      const target = document.getElementById(id);
      if(target){
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
        setTimeout(()=>target.removeAttribute('tabindex'),500);
      }
    });
  });
})();

// ===== Galería: filtros + modal (si existen) =====
(function(){
  const pills = document.querySelectorAll('.pill');
  const projs = document.querySelectorAll('.proj');
  function setFilter(tag){
    pills.forEach(p=>p.setAttribute('aria-pressed', p.dataset.filter===tag ? 'true' : 'false'));
    projs.forEach(card=>{
      if(tag==='all'){ card.style.display='block'; return; }
      const tags = (card.dataset.tags||'').toLowerCase();
      card.style.display = tags.includes(tag.toLowerCase()) ? 'block' : 'none';
    });
  }
  if(pills.length){ pills.forEach(p=>p.addEventListener('click',()=>setFilter(p.dataset.filter))); setFilter('all'); }

  const modal=document.getElementById('modal');
  if(!modal) return;
  const mTitle=document.getElementById('mTitle');
  const mHero =document.getElementById('mHero');
  const mDesc =document.getElementById('mDesc');
  const mLink =document.getElementById('mLink');
  const mClose=document.getElementById('mClose');

  function openModal(card){
    mTitle.textContent = card.dataset.title || 'Proyecto';
    mDesc.textContent  = card.dataset.desc  || '';
    mLink.href         = card.dataset.link  || '#';
    const thumb = card.querySelector('.thumb');
    const cs = thumb ? getComputedStyle(thumb) : null;
    const bgImg = cs ? cs.backgroundImage : 'none';
    const bgCol = cs ? cs.backgroundColor : '#141414';
    mHero.style.backgroundColor = bgCol || '#141414';
    if(bgImg && bgImg!=='none'){ mHero.style.backgroundImage = bgImg; } else { mHero.style.backgroundImage = 'none'; }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  projs.forEach(card=>{
    card.addEventListener('click',()=>openModal(card));
    card.addEventListener('keypress',(e)=>{ if(e.key==='Enter') openModal(card); });
  });
  if(mClose) mClose.addEventListener('click', closeModal);
  modal.addEventListener('click',(e)=>{ if(e.target===modal) closeModal(); });
  window.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });
})();

// ===== Tipografía: tester =====
(function(){
  const specimen = document.getElementById('specimen');
  if(!specimen) return;
  const fontSel  = document.getElementById('fontSel');
  const size     = document.getElementById('size');
  const track    = document.getElementById('track');
  const leading  = document.getElementById('leading');
  const sval     = document.getElementById('sval');
  const tval     = document.getElementById('tval');
  const lval     = document.getElementById('lval');

  function applyType(){
    specimen.style.fontFamily    = fontSel.value;
    specimen.style.fontWeight    = 400;
    specimen.style.fontSize      = size.value + 'px';
    specimen.style.letterSpacing = track.value + 'px';
    specimen.style.lineHeight    = leading.value;
    if(sval) sval.textContent = size.value;
    if(tval) tval.textContent = track.value;
    if(lval) lval.textContent = leading.value;
  }
  [fontSel, size, track, leading].forEach(el=>el && el.addEventListener('input', applyType));
  applyType();

  document.querySelectorAll('.swatches button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(btn.dataset.scheme==='light'){
        document.documentElement.style.setProperty('--bg','#f6f6f6');
        document.documentElement.style.setProperty('--fg','#111');
      }else{
        document.documentElement.style.setProperty('--bg','#0b0b0b');
        document.documentElement.style.setProperty('--fg','#eaeaea');
      }
      document.body.style.background='var(--bg)'; 
      document.body.style.color='var(--fg)';
    });
  });
})();

// ===== Menú responsive (hamburguesa) =====
(function(){
  function wireMenu(){
    const btn  = document.querySelector('.nav-toggle');
    const menu = document.getElementById('siteMenu') || document.querySelector('.nav .menu') || document.querySelector('.menu');
    if(!btn || !menu) return false;
    if(btn.dataset.wired) return true;

    const closeBtn = menu.querySelector('.nav-close');

    const openMenu = ()=>{
      menu.classList.add('open');
      btn.setAttribute('aria-expanded','true');
      btn.setAttribute('aria-label','Cerrar menú');
      document.body.classList.add('menu-open');
      const first = menu.querySelector('a'); if(first) first.focus();
    };
    const closeMenu = ()=>{
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-label','Abrir menú');
      document.body.classList.remove('menu-open');
    };
    const toggleMenu = ()=> (menu.classList.contains('open') ? closeMenu() : openMenu());

    btn.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', (e)=>{ e.stopPropagation(); closeMenu(); });
    menu.addEventListener('click', closeMenu);
    window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenu(); });

    const mq = window.matchMedia('(min-width: 961px)');
    const mqHandler = e => { if(e.matches) closeMenu(); };
    if(mq.addEventListener){ mq.addEventListener('change', mqHandler); }
    else if(mq.addListener){  mq.addListener(mqHandler); }

    btn.dataset.wired = '1';
    return true;
  }

  if(!wireMenu()){
    const mo = new MutationObserver(()=>{ if(wireMenu()) mo.disconnect(); });
    mo.observe(document.documentElement, {childList:true, subtree:true});
    window.addEventListener('DOMContentLoaded', wireMenu, {once:true});
    window.addEventListener('load', wireMenu, {once:true});
  }
})();

// ===== TRABAJOS: acordeón + detalle + carruseles =====
(function(){
  const hub = document.getElementById('workHub');
  if(!hub) return;

  const groups = [...hub.querySelectorAll('.work-group')];
  const TRANSITION_MS = 480;
  const DETAIL_MS = 620;

  const openPanel = (panel)=>{
    panel.hidden = false;
    requestAnimationFrame(()=>{
      panel.style.pointerEvents = 'auto';
      panel.style.opacity = '1';
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  };
  const closePanel = (panel)=>{
    panel.style.opacity = '0';
    panel.style.maxHeight = '0px';
    panel.style.pointerEvents = 'none';
    setTimeout(()=>{ panel.hidden = true; }, TRANSITION_MS);
  };
  const closeAllGroups = (except=null)=>{
    groups.forEach(g=>{
      if(g!==except && g.classList.contains('open')){
        const b = g.querySelector('.work-tile');
        const p = g.querySelector('.submenu');
        g.classList.remove('open');
        if(b) b.setAttribute('aria-expanded','false');
        if(p) closePanel(p);
      }
    });
  };

  groups.forEach(group=>{
    const btn   = group.querySelector('.work-tile');
    const panel = group.querySelector('.submenu');
    if(!btn || !panel) return;

    panel.hidden = true;
    panel.style.maxHeight = '0px';
    panel.style.opacity   = '0';
    panel.style.pointerEvents = 'none';
    btn.setAttribute('aria-expanded','false');

    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const isOpen = group.classList.contains('open');
      if(isOpen){
        group.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        closePanel(panel);
      }else{
        closeAllGroups(group);
        group.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        openPanel(panel);
      }
    });

    group._closeGroup = ()=>{
      if(group.classList.contains('open')){
        group.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        closePanel(panel);
      }
    };
  });

  const details = document.querySelectorAll('.work-detail');
  const measure = (el)=>{ el.style.setProperty('--detail-h', (el.scrollHeight||0) + 'px'); };

  const closeDetails = (except=null)=>{
    details.forEach(d=>{
      if(d!==except){
        d.classList.remove('fluid');
        measure(d);
        requestAnimationFrame(()=>{
          d.classList.remove('open');
          d.style.setProperty('--detail-h','0px');
          d.setAttribute('aria-hidden','true');
        });
        if(d._ro){ try{ d._ro.disconnect(); }catch(_){} d._ro=null; }
      }
    });
  };

  function openOrToggleDetail(link){
    const id = link.dataset.target;
    if(!id) return;
    const detail = document.getElementById('detail-'+id);
    if(!detail) return;

    const group   = link.closest('.work-group');
    const submenu = group?.querySelector('.submenu');

    if(submenu && detail.previousElementSibling !== submenu){
      submenu.insertAdjacentElement('afterend', detail);
    }

    if(detail.classList.contains('open')){
      detail.classList.remove('fluid');
      measure(detail);
      requestAnimationFrame(()=>{
        detail.classList.remove('open');
        detail.style.setProperty('--detail-h','0px');
        detail.setAttribute('aria-hidden','true');
      });
      if(detail._ro){ try{ detail._ro.disconnect(); }catch(_){} detail._ro = null; }
      if(group && group._closeGroup) group._closeGroup();
      return;
    }

    closeDetails(detail);
    detail.classList.remove('fluid');
    detail.classList.add('open');
    detail.setAttribute('aria-hidden','false');

    const ro = new ResizeObserver(()=> measure(detail));
    ro.observe(detail);
    detail._ro = ro;

    requestAnimationFrame(()=>{
      measure(detail);
      detail.scrollIntoView({behavior:'smooth', block:'start'});
    });

    setTimeout(()=>{ detail.classList.add('fluid'); }, DETAIL_MS + 60);

    detail.querySelectorAll('img,video').forEach(el=>{
      if(el.complete || (el.readyState>=2)) return;
      el.addEventListener('load', ()=> measure(detail), {once:true});
      el.addEventListener('loadeddata', ()=> measure(detail), {once:true});
    });

    const onResize = ()=> measure(detail);
    window.addEventListener('resize', onResize, {passive:true});
    detail._offResize = onResize;
  }

  hub.querySelectorAll('.subitem[data-target]').forEach(link=>{
    link.addEventListener('click', (e)=>{
      e.preventDefault();
      openOrToggleDetail(link);
    });
  });

  window.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeDetails(); });

  // ===== Carruseles (drag + flechas + snap 1 slide) =====
  document.querySelectorAll('.carousel').forEach(carousel=>{
    const track = carousel.querySelector('.track');
    if(!track) return;

    const slides = Array.from(track.children).filter(c => c.classList.contains('item'));
    const slideW       = ()=> track.clientWidth;
    const maxIndex     = ()=> Math.max(0, slides.length - 1);
    const currentIndex = ()=> Math.round(track.scrollLeft / slideW());

    const updateDisabled = (i=currentIndex())=>{
      const prev = carousel.querySelector('.nav.prev');
      const next = carousel.querySelector('.nav.next');
      if(prev) prev.disabled = (i <= 0);
      if(next) next.disabled = (i >= maxIndex());
    };

    const goTo = (i)=>{
      i = Math.max(0, Math.min(i, maxIndex()));
      track.scrollTo({ left: i * slideW(), behavior: 'smooth' });
      setTimeout(()=> updateDisabled(i), 250);
    };

    const snapToNearest = ()=> goTo(currentIndex());

    // Arrastre
    let isDown=false, startX=0, startLeft=0;
    const down=(e)=>{
      isDown = true;
      carousel.classList.add('dragging');
      startX = ('touches' in e ? e.touches[0].pageX : e.pageX);
      startLeft = track.scrollLeft;
      e.preventDefault();
    };
    const move=(e)=>{
      if(!isDown) return;
      const x = ('touches' in e ? e.touches[0].pageX : e.pageX);
      const dx = x - startX;
      track.scrollLeft = startLeft - dx;
    };
    const up=()=>{
      if(!isDown) return;
      isDown = false;
      carousel.classList.remove('dragging');
      snapToNearest();
    };

    track.addEventListener('mousedown', down);
    track.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    track.addEventListener('touchstart', down, {passive:false});
    track.addEventListener('touchmove',  move, {passive:false});
    window.addEventListener('touchend',  up);
    track.querySelectorAll('img').forEach(img=> img.draggable=false);

    // Flechas
    const prev = carousel.querySelector('.nav.prev');
    const next = carousel.querySelector('.nav.next');
    if(prev) prev.addEventListener('click', ()=> goTo(currentIndex()-1));
    if(next) next.addEventListener('click', ()=> goTo(currentIndex()+1));

    // Mantén snap/botones correctos
    track.addEventListener('scroll', ()=> updateDisabled());
    window.addEventListener('resize', ()=> goTo(currentIndex()));

    // Alinear primer slide
    goTo(0);
    updateDisabled(0);
  });
})();
