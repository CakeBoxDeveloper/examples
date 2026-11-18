'use strict';

/* ══════════════════════════════════════
   LOADER + PROGRESS BAR
══════════════════════════════════════ */
(function () {
  const loader = document.getElementById('siteLoader');
  const bar    = document.getElementById('loaderBar');
  if (!loader || !bar) return;

  const MIN_SHOW_MS = 900;
  const startTime   = Date.now();
  let   progress    = 0;
  let   pageReady   = false;

  function setProgress(target) {
    if (target <= progress) return;
    progress = target;
    bar.style.width = progress + '%';
  }

  let phase1Done = false, phase1Val = 0;
  function phase1() {
    phase1Val += 2.5;
    setProgress(phase1Val);
    if (phase1Val < 30) { setTimeout(phase1, 60); }
    else { phase1Done = true; phase2(); }
  }

  let phase2Val = 30;
  function phase2() {
    const step = Math.max(0.3, (80 - phase2Val) * 0.04);
    phase2Val += step;
    setProgress(phase2Val);
    if (phase2Val < 80 && !pageReady) { setTimeout(phase2, 120); }
    else if (pageReady) { finish(); }
    else { setTimeout(phase2, 120); }
  }

  function finish() {
    setProgress(100);
    const elapsed = Date.now() - startTime;
    const delay   = Math.max(0, MIN_SHOW_MS - elapsed) + 280;
    setTimeout(() => {
      loader.classList.add('is-hidden');
      setTimeout(() => { 
        document.body.classList.add('hero-ready');
        // Dispatch custom event for confetti
        document.body.dispatchEvent(new CustomEvent('heroReady'));
      }, 600);
      setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
    }, delay);
  }

  // Hard fallback: if something delays loader logic, still set hero-ready after 4s
  setTimeout(() => { 
    document.body.classList.add('hero-ready');
    document.body.dispatchEvent(new CustomEvent('heroReady'));
  }, 4000);

  function onPageLoad() {
    if (pageReady) return;
    pageReady = true;
    finish(); // always finish when page is ready, regardless of phase
  }

  if (document.readyState === 'complete') { onPageLoad(); }
  else { window.addEventListener('load', onPageLoad, { once: true }); }

  const mv = document.querySelector('.loader__model-wrap model-viewer');
  if (mv) { mv.addEventListener('load', () => setProgress(Math.max(progress, 70)), { once: true }); }

  phase1();
})();

/* ══════════════════════════════════════════════
   CERT CAROUSEL — single card flip
══════════════════════════════════════════════ */
(function () {
  const flipWrap  = document.getElementById('certFlipWrap');
  const giftBlock = document.getElementById('certGiftBlock');
  const priceEl   = document.getElementById('certPrice');
  const buyBtn    = document.getElementById('certBuyBtn');
  const tabsEl    = document.getElementById('certTabs');
  if (!flipWrap) return;
  const mv = null; // all certs are now PNG images, no model-viewer

  let activeIndex = 0;
  let flipping = false;

  // Cert data
  const certData = [
    {
      price: '2 500 ₴', bg: '#7d5c5b', fg: '#f5d9d5', border: '#d4a9a6',
      name: 'Какао',
      src: null,
      img: 'https://github.com/CakeBoxDeveloper/timetome/blob/main/ChockoMin_1.png?raw=true',
      desc: 'М\'який старт — зняти напругу, відпочити та відчути перші результати від комплексного догляду.',
      rows: [
        ['1', 'Aroma Relax + терапія червоним світлом',        '90 хв', '900 ₴'],
        ['2', 'Масаж голови + дарсонваль з насадкою-гребінцем','60 хв', '750 ₴'],
        ['3', 'Масаж ніг + масаж стоп з гарячими камінням',   '75 хв', '850 ₴'],
      ],
    },
    {
      price: '5 000 ₴', bg: '#780115', fg: '#f7b638', border: '#c88020',
      name: 'Бамбл',
      src: null,
      img: 'https://github.com/CakeBoxDeveloper/timetome/blob/main/MustMin_1.png?raw=true',
      desc: 'Повноцінний курс для тіла — відновлення м\'язів, зняття хронічної втоми та покращення кровообігу.',
      rows: [
        ['1', 'Загальний класичний масаж + масаж голови',      '90 хв', '1 100 ₴'],
        ['2', 'Масаж спини + терапія червоним світлом',        '75 хв', '1 150 ₴'],
        ['3', 'Масаж спини + баночний масаж',                  '75 хв', '1 200 ₴'],
        ['4', 'Масаж ніг + масаж стоп з гарячими камінням',   '75 хв',   '850 ₴'],
      ],
    },
    {
      price: '7 500 ₴', bg: '#383f0c', fg: '#c4d18b', border: '#8fa055',
      name: 'Матча',
      src: null,
      img: 'https://github.com/CakeBoxDeveloper/timetome/blob/main/MatchaMin_1.png?raw=true',
      desc: 'Глибока робота з тілом — вогняне відновлення, стоун і сухі голки для тих, хто хоче відчути реальний результат.',
      rows: [
        ['1', 'Вогняне відновлення',                           '90 хв', '1 500 ₴'],
        ['2', 'Загальний масаж + масаж голови',                '90 хв', '1 100 ₴'],
        ['3', 'Stone Massage всього тіла',                     '90 хв', '1 800 ₴'],
        ['4', 'Масаж спини + сухі голки',                     '75 хв', '1 350 ₴'],
        ['5', 'Aroma Relax + терапія червоним світлом',        '90 хв',   '900 ₴'],
      ],
    },
    {
      price: '9 000 ₴', bg: '#3730a2', fg: '#c8bbe7', border: '#8a7fc4',
      name: 'Айс-латте',
      src: null,
      img: 'https://github.com/CakeBoxDeveloper/timetome/blob/main/BlueMin_1.png?raw=true',
      desc: 'Максимальна програма відновлення — від вогняного масажу до стретчингу та аромарелаксу.',
      rows: [
        ['1', 'Вогняне відновлення',                           '90 хв', '1 500 ₴'],
        ['2', 'Загальний масаж + масаж голови',                '90 хв', '1 100 ₴'],
        ['3', 'Stone Massage всього тіла',                     '90 хв', '1 800 ₴'],
        ['4', 'Stretch Release Massage',                       '75 хв', '1 200 ₴'],
        ['5', 'Масаж спини + баночний масаж',                  '75 хв', '1 200 ₴'],
        ['6', 'Aroma Relax + терапія червоним світлом',        '90 хв',   '900 ₴'],
      ],
    },
  ];

  // Preload all cert images — keep references to prevent GC
  const _preloadedImgs = certData
    .filter(d => d.img)
    .map(d => { const img = new Image(); img.src = d.img; return img; });

  const tabs      = tabsEl ? Array.from(tabsEl.querySelectorAll('.cert-tab')) : [];
  const nameEl    = document.getElementById('certName');
  const descEl    = document.getElementById('certDesc');
  const tableBody = document.getElementById('certTableBody');
  const toggle    = document.getElementById('certProgramToggle');
  const tableWrap = document.getElementById('certProgramTable');

  if (toggle && tableWrap) {
    toggle.addEventListener('click', () => {
      const open = tableWrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // ── PNG cert shimmer border ──
  let _certImgShimmerRaf = null;
  function _certImgShimmer(canvas, streakColor) {
    if (!canvas) return;
    if (_certImgShimmerRaf) cancelAnimationFrame(_certImgShimmerRaf);
    const ctx = canvas.getContext('2d');
    let t = 0;
    const R = 20;
    const SPEED = 0.018;
    const color = streakColor || '#ffffff';

    function point(rect, pct) {
      const {x,y,w,h,r} = rect;
      const arc = (Math.PI/2)*r;
      const segs = [w-2*r, arc, h-2*r, arc, w-2*r, arc, h-2*r, arc];
      const total = segs.reduce((a,b)=>a+b,0);
      let dist = (((pct%1)+1)%1)*total;
      // top-left arc
      let s=arc; if(dist<s){const a=Math.PI+(dist/s)*(Math.PI/2);return{x:x+r+r*Math.cos(a),y:y+r+r*Math.sin(a)};} dist-=s;
      // top
      s=w-2*r; if(dist<s) return{x:x+r+dist,y:y}; dist-=s;
      // top-right arc
      s=arc; if(dist<s){const a=-Math.PI/2+(dist/s)*(Math.PI/2);return{x:x+w-r+r*Math.cos(a),y:y+r+r*Math.sin(a)};} dist-=s;
      // right
      s=h-2*r; if(dist<s) return{x:x+w,y:y+r+dist}; dist-=s;
      // bottom-right arc
      s=arc; if(dist<s){const a=(dist/s)*(Math.PI/2);return{x:x+w-r+r*Math.cos(a),y:y+h-r+r*Math.sin(a)};} dist-=s;
      // bottom
      s=w-2*r; if(dist<s) return{x:x+w-r-dist,y:y+h}; dist-=s;
      // bottom-left arc
      s=arc; if(dist<s){const a=Math.PI/2+(dist/s)*(Math.PI/2);return{x:x+r+r*Math.cos(a),y:y+h-r+r*Math.sin(a)};} dist-=s;
      return{x:x,y:y+h-r-dist};
    }

    function rr(c,x,y,w,h,r){
      c.beginPath();
      c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
      c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
      c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();
    }

    let last = 0;
    function draw(ts) {
      if (!canvas.isConnected) return; // stop if removed from DOM
      const dt = Math.min((ts-last)/1000, 0.05); last = ts;
      t = (t + dt*SPEED) % 1;
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      if (!cw||!ch){_certImgShimmerRaf=requestAnimationFrame(draw);return;}
      if (canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
      ctx.clearRect(0,0,cw,ch);
      const pad=1, rect={x:pad,y:pad,w:cw-pad*2,h:ch-pad*2,r:R};
      // static border — cert fg color
      ctx.strokeStyle = color + '55'; ctx.lineWidth=1.5;
      rr(ctx,rect.x,rect.y,rect.w,rect.h,rect.r);ctx.stroke();
      // shimmer streak
      const gLen=0.18;
      const pt1=point(rect,((t-gLen/2)+1)%1);
      const pt2=point(rect,(t+gLen/2)%1);
      const grd=ctx.createLinearGradient(pt1.x,pt1.y,pt2.x,pt2.y);
      grd.addColorStop(0, color + '00');
      grd.addColorStop(0.3, color + 'bb');
      grd.addColorStop(0.5, color + 'ff');
      grd.addColorStop(0.7, color + 'bb');
      grd.addColorStop(1, color + '00');
      ctx.strokeStyle=grd;ctx.lineWidth=2.5;
      rr(ctx,rect.x,rect.y,rect.w,rect.h,rect.r);ctx.stroke();
      _certImgShimmerRaf=requestAnimationFrame(draw);
    }
    _certImgShimmerRaf=requestAnimationFrame(draw);
  }

  function applyData(i) {
    const d = certData[i];
    if (giftBlock) giftBlock.style.borderRadius = '0 0 var(--r) var(--r)';
    if (window.setCertGlowColor) window.setCertGlowColor(d.bg, d.fg);

    const wrap = flipWrap;
    wrap.style.position = 'relative';

    // Reuse existing card — just swap img src, don't recreate
    let card  = document.getElementById('certImgCard');
    let imgEl = document.getElementById('certImgEl');
    let inner = document.getElementById('certImgInner');

    if (!card) {
      // First time — create structure
      card = document.createElement('div');
      card.id = 'certImgCard';
      card.className = 'cert-img-card';
      card.innerHTML =
        `<div class="cert-img-card__inner" id="certImgInner">` +
        `<img src="" class="cert-img-card__img" id="certImgEl" alt="Сертифікат" />` +
        `<div class="cert-img-card__sheen"></div>` +
        `<canvas class="cert-img-card__shimmer" id="certImgShimmer"></canvas>` +
        `</div>`;
      wrap.appendChild(card);
      imgEl = document.getElementById('certImgEl');
      inner = document.getElementById('certImgInner');

      // Start shimmer once — it runs continuously
      requestAnimationFrame(() => _certImgShimmer(document.getElementById('certImgShimmer'), d.fg));
    } else {
      // Update shimmer color only
      _certImgShimmer(document.getElementById('certImgShimmer'), d.fg);
    }

    // Swap image — if already cached browser shows instantly
    if (imgEl.src !== d.img) {
      imgEl.src = d.img;
    }

    // Sync size
    function syncSize() {
      const w = imgEl.naturalWidth, h = imgEl.naturalHeight;
      if (!w || !h) return;
      const ratio = w / h;
      inner.style.width  = (360 * ratio) + 'px';
      inner.style.height = '360px';
    }
    if (imgEl.complete && imgEl.naturalWidth) syncSize();
    else imgEl.addEventListener('load', syncSize, { once: true });
    // Info block
    if (giftBlock) {
      giftBlock.style.background  = d.bg;
      giftBlock.style.borderColor = d.bg;
      giftBlock.style.color       = d.fg;
    }
    if (nameEl)  nameEl.textContent  = d.name;
    if (descEl)  descEl.textContent  = d.desc;
    if (priceEl) priceEl.textContent = d.price;
    if (buyBtn) {
      buyBtn.style.background    = d.fg;
      buyBtn.style.color         = d.bg;
    }
    if (tableBody) {
      tableBody.innerHTML = d.rows.map(([day, proc, time, sum]) =>
        `<tr><td>${day}</td><td>${proc}</td><td>${time}</td><td>${sum}</td></tr>`
      ).join('');
    }
    // Tabs
    tabs.forEach((t, ti) => {
      t.classList.toggle('is-active', ti === i);
      t.style.background = ti === i ? d.bg : 'rgba(255,255,255,0.08)';
      t.style.color      = ti === i ? d.fg : 'rgba(255,255,255,0.45)';
      if (ti === i) t.style.setProperty('--active-bg', d.bg);
    });
  }

  function switchTo(i) {
    if (i === activeIndex || flipping) return;
    flipping = true;

    if (tableWrap && tableWrap.classList.contains('is-open')) {
      tableWrap.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    }

    // PRE-LOAD: swap image src BEFORE animation starts so it's ready at scaleX=0
    const nextImg = document.getElementById('certImgEl');
    if (nextImg && certData[i].img && nextImg.src !== certData[i].img) {
      nextImg.src = certData[i].img;
    }

    // Phase 1: flip out — double spin on desktop, single on mobile
    flipWrap.classList.add('is-flipping-out');

    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    const swapAt  = isMobile ? 180 : 180;  // midpoint of first half-rotation
    const phase2At = isMobile ? 360 : 360; // total animation duration

    // Swap at midpoint of first rotation
    setTimeout(() => {
      activeIndex = i;
      applyData(i);
    }, swapAt);

    // Phase 2: flip in
    setTimeout(() => {
      flipWrap.classList.remove('is-flipping-out');
      flipWrap.classList.add('is-flipping-in');
      setTimeout(() => {
        flipWrap.classList.remove('is-flipping-in');
        flipping = false;
      }, 360);
    }, phase2At);
  }

  // Tab clicks
  tabs.forEach((tab, i) => tab.addEventListener('click', () => switchTo(i)));

  // Init
  applyData(0);
})();

/* ══════════════════════════════════════
   SERVICES SNAP DOTS
══════════════════════════════════════ */
(function () {
  function initSnapDots(trackId, dotsId) {
    const track  = document.getElementById(trackId);
    const dotsEl = document.getElementById(dotsId);
    if (!track || !dotsEl) return;
    const inner = track.querySelector('.snap-inner');
    if (!inner) return;
    const cards = Array.from(inner.children);
    dotsEl.innerHTML = '';
    const dots = cards.map((card, i) => {
      const d = document.createElement('span');
      d.className = 'snap-dot' + (i === 0 ? ' is-active' : '');
      d.addEventListener('click', () => {
        track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
      });
      dotsEl.appendChild(d);
      return d;
    });
    let raf;
    let userScrolled = false;
    let programmaticScroll = false; // flag to ignore our own instant scroll

    track.addEventListener('scroll', () => {
      if (programmaticScroll) return; // ignore initial center scroll
      // Stop hint animation on first user scroll
      if (!userScrolled) {
        userScrolled = true;
        inner.classList.remove('snap-hint');
        inner.style.animation = 'none';
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0, minDist = Infinity;
        cards.forEach((card, i) => {
          const d = Math.abs(center - (card.offsetLeft + card.offsetWidth / 2));
          if (d < minDist) { minDist = d; closest = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('is-active', i === closest));
      });
    }, { passive: true });

    requestAnimationFrame(() => {
      const mid = Math.floor(cards.length / 2);
      const midCard = cards[mid];
      programmaticScroll = true;
      track.scrollTo({ left: midCard.offsetLeft - (track.clientWidth - midCard.offsetWidth) / 2, behavior: 'instant' });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === mid));
      // Allow scroll events again after a tick
      requestAnimationFrame(() => { programmaticScroll = false; });

      // Start hint sway animation after short delay
      setTimeout(() => {
        if (!userScrolled) inner.classList.add('snap-hint');
      }, 1200);
    });
  }
  initSnapDots('servicesTrack', 'servicesDots');

  // Desktop: click on side cards scrolls to them
  (function () {
    const track = document.getElementById('servicesTrack');
    if (!track) return;
    const inner = track.querySelector('.snap-inner');
    if (!inner) return;
    inner.addEventListener('click', (e) => {
      const card = e.target.closest('.service-card');
      if (!card) return;
      // if button inside card clicked — let it handle itself
      if (e.target.closest('button, a')) return;
      track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
    });
  })();
})();

/* ══════════════════════════════════════
   LOTTERY — tilt + shimmer border + scratch + bot code
══════════════════════════════════════ */
(function () {

  /* ── Canvas shimmer border ── */
  (function shimmerBorder() {
    const wrap   = document.getElementById('lotTiltWrap');
    const canvas = document.getElementById('lotShimmerCanvas');
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    let shimmerT = 0;
    const SPEED = 0.04; // ~25s full cycle
    const R = 16;

    function shimmerPoint(rect, t) {
      const { x, y, w, h, r } = rect;
      const sTop = w-2*r, sRight = h-2*r, sBot = w-2*r, sLeft = h-2*r;
      const arc = (Math.PI/2)*r;
      const total = sTop+arc+sRight+arc+sBot+arc+sLeft+arc;
      let dist = (((t%1)+1)%1)*total;
      let seg;
      seg=arc;    if(dist<seg){const a=Math.PI+(dist/seg)*(Math.PI/2); return{x:x+r+r*Math.cos(a),y:y+r+r*Math.sin(a)};} dist-=seg;
      seg=sTop;   if(dist<seg) return{x:x+r+dist,y};                                                                      dist-=seg;
      seg=arc;    if(dist<seg){const a=-Math.PI/2+(dist/seg)*(Math.PI/2); return{x:x+w-r+r*Math.cos(a),y:y+r+r*Math.sin(a)};} dist-=seg;
      seg=sRight; if(dist<seg) return{x:x+w,y:y+r+dist};                                                                  dist-=seg;
      seg=arc;    if(dist<seg){const a=(dist/seg)*(Math.PI/2); return{x:x+w-r+r*Math.cos(a),y:y+h-r+r*Math.sin(a)};}     dist-=seg;
      seg=sBot;   if(dist<seg) return{x:x+w-r-dist,y:y+h};                                                                dist-=seg;
      seg=arc;    if(dist<seg){const a=Math.PI/2+(dist/seg)*(Math.PI/2); return{x:x+r+r*Math.cos(a),y:y+h-r+r*Math.sin(a)};} dist-=seg;
      return{x,y:y+h-r-dist};
    }

    function rr(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
      c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
      c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y); c.closePath();
    }

    let last = 0;
    function draw(ts) {
      const delta = Math.min((ts-last)/1000, 0.05); last = ts;
      shimmerT = (shimmerT + delta*SPEED) % 1;

      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      if (!cw || !ch) { requestAnimationFrame(draw); return; }
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.clearRect(0, 0, cw, ch);

      const pad = 0;
      const rect = { x:pad, y:pad, w:cw-pad*2, h:ch-pad*2, r:R };

      // Static base border — gold
      ctx.strokeStyle = 'rgba(200,160,0,0.35)';
      ctx.lineWidth = 1.5;
      rr(ctx, rect.x, rect.y, rect.w, rect.h, rect.r);
      ctx.stroke();

      // Animated shimmer streak — bright yellow
      const gLen = 0.20;
      const pt1 = shimmerPoint(rect, ((shimmerT - gLen/2)+1)%1);
      const pt2 = shimmerPoint(rect, (shimmerT + gLen/2)%1);
      const grd = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
      grd.addColorStop(0,    'rgba(255,210,0,0.00)');
      grd.addColorStop(0.25, 'rgba(255,220,0,0.70)');
      grd.addColorStop(0.5,  'rgba(255,245,80,1.00)');
      grd.addColorStop(0.75, 'rgba(255,220,0,0.70)');
      grd.addColorStop(1,    'rgba(255,210,0,0.00)');
      ctx.strokeStyle = grd;
      ctx.lineWidth   = 2.8;
      rr(ctx, rect.x, rect.y, rect.w, rect.h, rect.r);
      ctx.stroke();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ── Tilt ── */
  (function tilt() {
    const wrap = document.getElementById('lotTiltWrap');
    if (!wrap) return;
    // Passive idle sway: CSS animation handles it, no mouse tracking
    // Keep animation duration from CSS (8s), don't override it
    // wrap.style.animation = 'lotSway 8s ease-in-out infinite';
  })();

  /* ── Scratch card ── */
  const canvas     = document.getElementById('scratchCanvas');
  const valEl      = document.getElementById('lotValue');
  const botAction  = document.getElementById('lotBotAction');
  if (!canvas) return;

  const STORAGE_KEY   = 'ttm_scratch_date';
  const today         = new Date().toISOString().slice(0, 10);
  const alreadyPlayed = localStorage.getItem(STORAGE_KEY) === today;

  // Bot-verifiable code: TTM + day_hex2 + mon_hex2 + checksum + rand5
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function genCode() {
    const d = new Date();
    const day = d.getDate(), mon = d.getMonth() + 1;
    const chk = CHARS[(day ^ mon ^ 0x5A) % 32];
    let rand = '';
    for (let i = 0; i < 5; i++) rand += CHARS[Math.floor(Math.random() * 32)];
    return 'TTM' + day.toString(16).toUpperCase().padStart(2,'0') +
                   mon.toString(16).toUpperCase().padStart(2,'0') + chk + rand;
  }
  const botCode = genCode();

  if (valEl) {
    valEl.textContent         = botCode;
    valEl.style.fontFamily    = 'monospace';
    valEl.style.fontSize      = 'clamp(14px, 4vw, 18px)';
    valEl.style.fontWeight    = '700';
    valEl.style.letterSpacing = '0.10em';
    valEl.style.color         = '#7a4e00';
  }

  const ctx = canvas.getContext('2d');
  let drawing = false, revealed = false;

  function drawLayer() {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    const cx2 = W*0.5, cy2 = H*0.5;
    for (let i = 1; i <= 14; i++) {
      const r = (i/14)*Math.max(W,H)*0.7;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI*2; a += 0.06) {
        const wb = 1 + 0.04*Math.sin(a*6+i*1.3);
        const x = cx2 + Math.cos(a)*r*wb, y = cy2 + Math.sin(a)*r*wb*0.55;
        a === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 0.5;
    for (let y = 2; y < H; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y+Math.sin(y*0.4)*1.5);
      for (let x = 0; x <= W; x += 3) ctx.lineTo(x, y+Math.sin(y*0.4+x*0.05)*1.5);
      ctx.stroke();
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = r.width  || canvas.offsetWidth  || canvas.clientWidth;
    const h = r.height || canvas.offsetHeight || canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = w; canvas.height = h;
    if (!revealed) drawLayer();
    const prize = document.getElementById('lotPrize');
    if (prize) prize.style.visibility = 'visible';
  }

  function erase(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // +30% larger erase area
    ctx.ellipse(x, y, 13+Math.random()*8, 8+Math.random()*5, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fill();
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(x+(Math.random()-0.5)*18, y+(Math.random()-0.5)*10, 3+Math.random()*6, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    checkReveal();
  }

  function checkReveal() {
    if (revealed) return;
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let t = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 128) t++;
    if (t / (canvas.width * canvas.height) > 0.65) { revealed = true; showBotLink(); }
  }

  function showBotLink() {
    if (!botAction) return;
    const botUsername = 'pro_telo_niko_bot';
    const url = `https://t.me/${botUsername}?start=${botCode}`;

    // Telegram icon — img with white filter, same as contacts block
    const tgSvg =
      `<img src="https://www.svgrepo.com/show/388724/telegram.svg" alt="" ` +
      `style="width:20px;height:20px;filter:brightness(0) invert(1);flex-shrink:0;" />`;

    botAction.innerHTML =
      `<a href="${url}" target="_blank" rel="noopener" class="lot-door-flap">` +
      `<span>Дізнайся бонус у нашому Telegram-боті</span>` +
      tgSvg +
      `</a>`;

    // Trigger animation on next frame so CSS transition kicks in
    requestAnimationFrame(() => {
      const flap = botAction.querySelector('.lot-door-flap');
      if (flap) {
        requestAnimationFrame(() => flap.classList.add('is-open'));
      }
    });
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect(), s = e.touches ? e.touches[0] : e;
    return [s.clientX - r.left, s.clientY - r.top];
  }

  canvas.addEventListener('mousedown', e => {
    if (alreadyPlayed) return; drawing = true; erase(...pos(e));
    localStorage.setItem(STORAGE_KEY, today);
  });
  canvas.addEventListener('touchstart', e => {
    if (alreadyPlayed) return;
    // Ensure canvas is sized before first touch
    if (!canvas.width || !canvas.height) resize();
    e.preventDefault();
    drawing = true;
    erase(...pos(e));
    localStorage.setItem(STORAGE_KEY, today);
  }, { passive: false });
  document.addEventListener('mousemove', e => { if (drawing) erase(...pos(e)); });
  document.addEventListener('touchmove', e => { if (!drawing) return; e.preventDefault(); erase(...pos(e)); }, { passive: false });
  document.addEventListener('mouseup',  () => drawing = false);
  document.addEventListener('touchend', () => drawing = false);

  if (alreadyPlayed && botAction) {
    // Show "already played" note inside card
    const playedNote = document.getElementById('lotPlayedNote');
    if (playedNote) playedNote.style.display = 'block';
  }

  if (document.readyState === 'complete') setTimeout(resize, 100);
  else window.addEventListener('load', () => setTimeout(resize, 100));
  window.addEventListener('resize', () => { if (!revealed) resize(); });

  // Trigger resize when canvas scrolls into view (fixes mobile first-touch issue)
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && (!canvas.width || !canvas.height)) {
        resize();
      }
    }, { threshold: 0.1 });
    obs.observe(canvas);
  }
})();

/* ══════════════════════════════════════
   FLOATING NAVBAR — vertical ad carousel + book btn
══════════════════════════════════════ */
(function () {
  const fnav    = document.getElementById('floatCta');
  const track   = document.getElementById('fnavTrack');
  const indEl   = document.getElementById('fnavIndicator');
  const bookBtn = document.getElementById('fnavBook');
  if (!fnav || !track) return;

  // Detect if we're on the main page
  const isMain = !window.location.pathname.split('/').pop().includes('.html')
              || window.location.pathname.endsWith('index.html')
              || window.location.pathname.endsWith('/');

  // ── Scroll helpers ──

  // Smoothly scroll element into view with optional offset
  function scrollTo(el, block) {
    el.scrollIntoView({ behavior: 'smooth', block: block || 'start' });
  }

  // Center a specific service card in the snap-track and optionally click its CTA
  function openServiceCard(cardIndex, clickDetailBtn) {
    const svcSection = document.getElementById('services');
    if (!svcSection) return;
    scrollTo(svcSection, 'start');

    setTimeout(() => {
      const track = document.getElementById('servicesTrack');
      if (!track) return;
      const inner = track.querySelector('.snap-inner');
      if (!inner) return;
      const cards = Array.from(inner.children);
      const card  = cards[cardIndex];
      if (!card) return;

      // Scroll card to center
      const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left, behavior: 'smooth' });

      if (clickDetailBtn) {
        // Wait for scroll animation to finish, then navigate
        setTimeout(() => {
          const detailLink = card.querySelector('a.btn--outline');
          if (detailLink) detailLink.click();
        }, 1000);
      }
    }, 900);
  }

  // Scroll to cert section and open toggle for given cert tab index
  function openCertificate(tabIndex) {
    const certSection = document.getElementById('certificates');
    if (!certSection) return;
    scrollTo(certSection, 'start');
    setTimeout(() => {
      // Switch cert tab if needed
      if (tabIndex != null) {
        const tabs = document.querySelectorAll('#certTabs .cert-tab');
        if (tabs[tabIndex]) tabs[tabIndex].click();
      }
      // Open program toggle after tab flip animation settles
      setTimeout(() => {
        const toggle    = document.getElementById('certProgramToggle');
        const tableWrap = document.getElementById('certProgramTable');
        if (toggle && tableWrap && !tableWrap.classList.contains('is-open')) {
          tableWrap.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        }
        // Scroll again to show toggle content
        const certSection2 = document.getElementById('certificates');
        if (certSection2) scrollTo(certSection2, 'start');
      }, 700);
    }, 900);
  }

  // Navigate away from a service page, passing action as hash
  function gotoMain(hash) {
    window.location.href = 'index.html' + hash;
  }

  // ── Actions per slide (0-indexed, matches HTML slide order) ──
  // New order: light, needle, stone, perc, cert, lottery, fire
  const SERVICE_CARD_IDX = {
    light:  5,  // Терапія червоним світлом
    needle: 4,  // Dry Needling
    stone:  3,  // Стоун
    perc:   2,  // Глибокий тканинний (перкусія)
    fire:   6,  // СПА-програма (closest to вогняне)
  };

  function handleSlide(slideKey) {
    switch (slideKey) {
      case 'light':
        window.location.href = 'red-light.html';
        break;
      case 'needle':
        window.location.href = 'dry-needling.html';
        break;
      case 'stone':
        window.location.href = 'stone.html';
        break;
      case 'perc':
        window.location.href = 'deep-tissue.html';
        break;
      case 'cert':
        if (isMain) { openCertificate(0); }
        else { gotoMain('#action=cert'); }
        break;
      case 'lottery':
        if (isMain) {
          const lot = document.getElementById('lottery');
          if (lot) scrollTo(lot, 'center');
        } else { gotoMain('#action=lottery'); }
        break;
      case 'fire':
        window.location.href = 'spa.html';
        break;
    }
  }

  // Map slide elements to their keys — must match HTML slide order
  // Current order: fire, cert, needle, stone, light, perc, lottery
  const slideKeys = ['fire', 'cert', 'needle', 'stone', 'light', 'perc', 'lottery'];

  // Attach click handlers
  track.querySelectorAll('.fnav__slide').forEach((slide, i) => {
    slide.style.cursor = 'pointer';
    slide.addEventListener('click', () => handleSlide(slideKeys[i]));
  });

  // Show/hide on scroll — on service pages show after any scroll, on main after hero
  function updateVisibility() {
    const hero = document.querySelector('.hero');
    if (hero) {
      fnav.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.6);
    } else {
      // Service pages — show after scrolling 80px
      fnav.classList.toggle('is-visible', window.scrollY > 80);
    }
  }
  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();

  // Book button → Telegram bot always
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      window.open('https://t.me/dailyprize_bot', '_blank', 'noopener');
    });
  }

  // Build indicator dots (only if indicator element exists)
  const slides  = Array.from(track.querySelectorAll('.fnav__slide'));
  const total   = slides.length;
  const dots    = [];
  slides.forEach((_, i) => {
    if (!indEl) return; // indicator commented out — skip
    const d = document.createElement('div');
    d.className = 'fnav__indicator-dot' + (i === 0 ? ' is-active' : '');
    indEl.appendChild(d);
    dots.push(d);
  });

  let current   = 0;
  let autoTimer = null;
  const SLIDE_H = 58;
  const AUTO_MS = 3200;

  function goTo(idx, animated) {
    if (animated === undefined) animated = true;
    current = ((idx % total) + total) % total;
    track.style.transition = animated
      ? 'transform 0.42s cubic-bezier(0.4,0,0.2,1)'
      : 'none';
    track.style.transform = `translateY(-${current * SLIDE_H}px)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  goTo(0, false);
  startAuto();

  // Pause on hover (desktop)
  fnav.addEventListener('mouseenter', stopAuto);
  fnav.addEventListener('mouseleave', startAuto);
})();

/* ══════════════════════════════════════
   PRICE ACCORDION
══════════════════════════════════════ */
(function () {
  document.querySelectorAll('.price-acc__group').forEach(group => {
    const body = group.querySelector('.price-acc__body');
    const more = group.querySelector('.price-acc__more');
    if (!body || !more) return;

    function toggle() {
      const open = body.classList.toggle('is-open');
      if (more) more.textContent = open ? 'Згорнути ↑' : 'Показати більше ↓';
    }

    // Only "Показати більше" button toggles — NOT the head
    more.addEventListener('click', toggle);
  });
})();

/* ── Lottery rays — yellow ── */
(function() {
  const canvas = document.getElementById('lotRaysCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const RAY_COUNT = 18;
  let t = 0;
  let lastTs = 0;

  function draw(ts) {
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    t += dt * 0.001;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    if (!w || !h) { requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < RAY_COUNT; i++) {
      const baseAngle = (i / RAY_COUNT) * Math.PI * 2;
      const wave = 0.04 * Math.sin(t * 0.9 + i * 1.3);
      const angle = baseAngle + wave;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.8);
      const len = (0.30 + 0.08 * pulse) * Math.max(w, h);
      const halfW = (3 + 7 * Math.sin(Math.PI * i / RAY_COUNT)) * (0.7 + 0.3 * pulse);
      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;
      const nxNear =  Math.sin(angle) * 1;
      const nyNear = -Math.cos(angle) * 1;
      const nxFar  =  Math.sin(angle) * halfW;
      const nyFar  = -Math.cos(angle) * halfW;
      const alpha = 0.12 + 0.096 * pulse;
      const grad = ctx.createLinearGradient(cx, cy, ex, ey);
      grad.addColorStop(0,    `rgba(200,160,0,0)`);
      grad.addColorStop(0.25, `rgba(200,160,0,${alpha * 0.6})`);
      grad.addColorStop(0.6,  `rgba(220,180,0,${alpha})`);
      grad.addColorStop(0.85, `rgba(200,160,0,${alpha * 0.4})`);
      grad.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.moveTo(cx + nxNear, cy + nyNear);
      ctx.lineTo(ex + nxFar, ey + nyFar);
      ctx.lineTo(ex - nxFar, ey - nyFar);
      ctx.lineTo(cx - nxNear, cy - nyNear);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
document.querySelectorAll('.cert-buy-btn, .svc-book-btn').forEach(btn => {
  btn.addEventListener('click', () => window.open('https://t.me/dailyprize_bot', '_blank', 'noopener'));
});

/* ══════════════════════════════════════
   HERO MODEL — idle orbit animation
══════════════════════════════════════ */

/* ══════════════════════════════════════
   SVC LIST ACCORDION
══════════════════════════════════════ */
(function () {
  const list = document.getElementById('svcList');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('.svc-item'));
  let expandedCard = null;

  function getCardHTML(item) {
    const body = item.querySelector('.svc-item__body');
    if (!body) return '';
    const inner = body.querySelector('.svc-item__card');
    if (!inner) return '';

    const header = inner.querySelector('.svc-item__card-header')?.outerHTML || '';
    const tags   = inner.querySelector('.service-card__tags')?.outerHTML || '';
    const desc   = inner.querySelector('.service-card__desc')?.outerHTML || '';
    const detailLink = inner.querySelector('.svc-detail-btn');
    const hook   = detailLink?.dataset.hook || '';
    const url    = detailLink?.href || '#';

    const spoilerHTML = hook ? `
      <div class="svc-read-more">
        <a href="${url}" class="svc-read-more__toggle">
          <span class="svc-read-more__label">читати статтю повністю</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      </div>` : '';

    return `
      <button class="svc-expanded-card__back">← до інших видів послуг</button>
      <div class="svc-expanded-card__content">
        ${header}
        ${tags}
        ${desc}
        ${spoilerHTML}
      </div>
      <div class="svc-expanded-card__footer">
        <button class="btn btn--accent btn--full svc-book-btn">Записатись</button>
      </div>
    `;
  }

  function open(item) {
    if (expandedCard) removeCard(false);

    // Measure row position relative to list
    const listRect = list.getBoundingClientRect();
    const rowRect = item.querySelector('.svc-item__row').getBoundingClientRect();
    const originY = rowRect.top - listRect.top;
    const originH = rowRect.height;

    // Create overlay card
    expandedCard = document.createElement('div');
    expandedCard.className = 'svc-expanded-card';
    expandedCard.style.setProperty('--svc-origin-y', originY + 'px');
    expandedCard.style.setProperty('--svc-origin-bottom', (originY + originH) + 'px');
    expandedCard.innerHTML = getCardHTML(item);

    // Wire close button
    const closeBtn = expandedCard.querySelector('.svc-expanded-card__back');
    if (closeBtn) closeBtn.addEventListener('click', () => removeCard(true));

    // Wire book buttons
    expandedCard.querySelectorAll('.svc-book-btn').forEach(btn => {
      btn.addEventListener('click', () => window.open('https://t.me/dailyprize_bot', '_blank', 'noopener'));
    });

    list.appendChild(expandedCard);
    item.classList.add('is-open');
  }

  function removeCard(animate) {
    if (!expandedCard) return;
    const card = expandedCard;
    expandedCard = null;
    items.forEach(i => i.classList.remove('is-open'));

    if (animate) {
      card.classList.add('is-closing');
      card.addEventListener('animationend', () => card.remove(), { once: true });
    } else {
      card.remove();
    }
  }

  items.forEach(item => {
    item.querySelector('.svc-item__row').addEventListener('click', () => {
      item.classList.contains('is-open') ? removeCard(true) : open(item);
    });
  });
})();

/* All booking buttons → Telegram Bot */

/* ══════════════════════════════════════
   CERT DEEP-LINK — index.html?cert=N
   Opens main page, scrolls to cert section, selects tab N (0-based)
══════════════════════════════════════ */
(function () {
  const params = new URLSearchParams(window.location.search);
  const certIdx = parseInt(params.get('cert'), 10);
  if (isNaN(certIdx)) return;

  // Remove param from URL without reload
  const url = new URL(window.location.href);
  url.searchParams.delete('cert');
  window.history.replaceState({}, '', url);

  function openCert() {
    const certSection = document.getElementById('certificates');
    if (!certSection) return;
    certSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const tabs = document.querySelectorAll('#certTabs .cert-tab');
      if (tabs[certIdx]) tabs[certIdx].click();
    }, 700);
  }

  // Wait for page to be ready before scrolling
  if (document.readyState === 'complete') {
    setTimeout(openCert, 300);
  } else {
    window.addEventListener('load', () => setTimeout(openCert, 300), { once: true });
  }
})();


/* ══════════════════════════════════════
   MOBILE ANIMATION FIX
   Ensure animations run at correct speed on mobile devices
══════════════════════════════════════ */
(function () {
  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || window.innerWidth <= 768;
  
  if (!isMobile) return;
  
  // Function to fully reset animation to ensure proper playback
  function resetAnimationCompletely(selector, animationName, duration, timingFunction, iterationCount) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Remove animation temporarily
      const oldAnimation = el.style.animation;
      el.style.animation = 'none';
      
      // Force reflow
      void el.offsetHeight;
      
      // Reapply with explicit values
      el.style.animationName = animationName;
      el.style.animationDuration = duration;
      el.style.animationTimingFunction = timingFunction || 'ease-in-out';
      el.style.animationIterationCount = iterationCount || 'infinite';
      el.style.animationPlayState = 'running';
      el.style.animationFillMode = 'none';
      
      console.log(`Reset animation for ${selector}: ${animationName} ${duration}`);
    });
  }
  
  // Wait for page to load and animations to be applied
  function applyFixes() {
    // Fix certificate animations with full reset
    resetAnimationCompletely('.cert-img-card', 'certImgSway', '6s', 'ease-in-out', 'infinite');
    resetAnimationCompletely('.cert-img-card__sheen', 'certImgSheen', '4s', 'ease-in-out', 'infinite');
    
    // Fix lottery animations with full reset
    resetAnimationCompletely('.lot-tilt-wrap', 'lotSway', '8s', 'ease-in-out', 'infinite');
    
    // For ::before pseudo-element, we need to target the parent
    const lotCards = document.querySelectorAll('.lot-card');
    lotCards.forEach(card => {
      // Force re-render of ::before
      card.style.setProperty('--force-rerender', Math.random());
    });
    
    console.log('Mobile animation fixes applied completely');
  }
  
  // Apply fixes after page load and after a short delay
  if (document.readyState === 'complete') {
    setTimeout(applyFixes, 100);
  } else {
    window.addEventListener('load', () => setTimeout(applyFixes, 100));
  }
  
  // Also apply on window resize (orientation change)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyFixes, 250);
  });
})();


/* ══════════════════════════════════════
   TELEGRAM-STYLE ANIMATED BUTTONS
   Click-only logic with "Show All" button
══════════════════════════════════════ */
(function () {
  const box = document.getElementById('tgContacts');
  const btn = document.getElementById('tgToggle');
  const containers = document.querySelectorAll('.tg-tooltip-container');
  
  if (!box || !btn || !containers.length) return;

  // Click on individual button
  containers.forEach(container => {
    const icon = container.querySelector('.tg-icon');
    const profile = container.querySelector('.tg-profile');
    
    if (!icon) return;

    icon.addEventListener('click', (e) => {
      const isActive = container.classList.contains('active');
      
      if (isActive) {
        // Second click - allow link to work (don't prevent)
        // But if clicking on icon again (not profile link), toggle off
        if (!e.target.closest('.tg-profile')) {
          e.preventDefault();
          container.classList.remove('active');
        }
      } else {
        // First click - open this tooltip, close others
        e.preventDefault();
        
        // Close all others
        containers.forEach(other => {
          if (other !== container) {
            other.classList.remove('active');
          }
        });
        
        // Open this one
        container.classList.add('active');
      }
    });
  });

  // "Show All" / "Hide All" button
  btn.addEventListener('click', () => {
    const isOpen = box.classList.toggle('open');
    
    containers.forEach(container => {
      container.classList.toggle('active', isOpen);
    });
    
    btn.textContent = isOpen ? 'Сховати контакти' : 'Показати всі контакти';
  });

  // Close tooltips when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.telegram-contacts')) {
      containers.forEach(container => {
        container.classList.remove('active');
      });
      box.classList.remove('open');
      btn.textContent = 'Показати всі контакти';
    }
  });
})();


/* ══════════════════════════════════════════════
   FLIP CARD — WebM animation + contacts
   - Animation: 6 sec, flip at 5.5s to hide end
   - Video restarts on every flip to front
   - Front shown 5.5s, back shown 5s
   - Click on front: flip to back, disable auto-flip
   - Click on back: flip to front, then auto-flip back after 5.5s
   - Always flip clockwise (continuous cycle effect)
   
   iOS DEBUG: Comprehensive logging with download button
══════════════════════════════════════════════ */
(function() {
  const card = document.getElementById('heroFlipCard');
  const inner = card?.querySelector('.hero__flip-inner');
  const video = document.getElementById('heroFlipVideo');
  if (!card || !inner || !video) return;

  // ═══════════════════════════════════════════
  // iOS DEBUG LOGGING SYSTEM
  // ═══════════════════════════════════════════
  const logs = [];
  function log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}`;
    logs.push(entry);
    console.log('[FLIP DEBUG]', message);
  }

  // Log initial state
  log('=== FLIP CARD INIT ===');
  log(`User Agent: ${navigator.userAgent}`);
  log(`Platform: ${navigator.platform}`);
  log(`Video element exists: ${!!video}`);
  log(`Video readyState: ${video.readyState}`);
  log(`Video paused: ${video.paused}`);
  log(`Video muted: ${video.muted}`);
  log(`Video autoplay: ${video.autoplay}`);
  log(`Video playsinline: ${video.playsInline}`);
  log(`Video currentSrc: ${video.currentSrc}`);
  log(`Video networkState: ${video.networkState}`);
  log(`Document hidden: ${document.hidden}`);
  log(`Window innerWidth: ${window.innerWidth}`);
  log(`Window innerHeight: ${window.innerHeight}`);

  // Create debug button (mobile only)
  if (window.innerWidth < 768) {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '📋 Копіювати лог';
    debugBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      padding: 12px 16px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      border: 2px solid white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    `;
    
    debugBtn.addEventListener('click', async () => {
      const content = logs.join('\n');
      try {
        // Modern Clipboard API (iOS Safari 13.4+)
        await navigator.clipboard.writeText(content);
        debugBtn.textContent = '✅ Скопійовано!';
        debugBtn.style.background = 'rgba(0, 200, 0, 0.8)';
        log('Debug log copied to clipboard');
        
        setTimeout(() => {
          debugBtn.textContent = '📋 Копіювати лог';
          debugBtn.style.background = 'rgba(255, 0, 0, 0.8)';
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        log(`Clipboard API failed: ${err.message}, trying fallback`);
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For iOS
        
        try {
          document.execCommand('copy');
          debugBtn.textContent = '✅ Скопійовано!';
          debugBtn.style.background = 'rgba(0, 200, 0, 0.8)';
          log('Debug log copied via execCommand');
          
          setTimeout(() => {
            debugBtn.textContent = '📋 Копіювати лог';
            debugBtn.style.background = 'rgba(255, 0, 0, 0.8)';
          }, 2000);
        } catch (err2) {
          debugBtn.textContent = '❌ Помилка';
          log(`Copy failed: ${err2.message}`);
          
          setTimeout(() => {
            debugBtn.textContent = '📋 Копіювати лог';
          }, 2000);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    });
    
    document.body.appendChild(debugBtn);
    log('Debug button created (clipboard copy)');
  }

  // Monitor video events
  video.addEventListener('loadstart', () => log('VIDEO: loadstart'));
  video.addEventListener('loadedmetadata', () => {
    log(`VIDEO: loadedmetadata (duration: ${video.duration})`);
    log(`VIDEO: Using source - ${video.currentSrc}`);
    log(`VIDEO: Video size: ${video.videoWidth}x${video.videoHeight}`);
  });
  video.addEventListener('loadeddata', () => log(`VIDEO: loadeddata (readyState: ${video.readyState})`));
  video.addEventListener('canplay', () => log('VIDEO: canplay'));
  video.addEventListener('canplaythrough', () => log('VIDEO: canplaythrough'));
  video.addEventListener('play', () => log(`VIDEO: play event (currentTime: ${video.currentTime})`));
  video.addEventListener('playing', () => log(`VIDEO: playing (currentTime: ${video.currentTime})`));
  video.addEventListener('pause', () => log('VIDEO: pause'));
  video.addEventListener('waiting', () => log('VIDEO: waiting'));
  video.addEventListener('stalled', () => log('VIDEO: stalled'));
  video.addEventListener('suspend', () => log('VIDEO: suspend'));
  
  // Log only first 3 timeupdate events to avoid spam
  let timeupdateCount = 0;
  video.addEventListener('timeupdate', () => {
    if (timeupdateCount < 3) {
      log(`VIDEO: timeupdate #${++timeupdateCount} - currentTime: ${video.currentTime.toFixed(3)}s`);
    }
  });
  
  video.addEventListener('error', (e) => {
    log(`VIDEO: error - ${video.error?.code} ${video.error?.message}`);
    if (video.error) {
      const errorCodes = ['', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'];
      log(`VIDEO: error code meaning - ${errorCodes[video.error.code] || 'UNKNOWN'}`);
    }
  });

  // Monitor visibility changes
  document.addEventListener('visibilitychange', () => {
    log(`Document visibility changed: hidden=${document.hidden}`);
  });

  // ═══════════════════════════════════════════
  // FLIP CARD LOGIC
  // ═══════════════════════════════════════════
  let rotationCount = 0;
  let autoFlipEnabled = true;
  let autoFlipTimer = null;
  let isPageVisible = !document.hidden;
  
  const ANIMATION_DURATION = 6000;
  const FLIP_BEFORE_END = 500;
  const BACK_DISPLAY_TIME = 5000;

  inner.style.transform = 'rotateY(0deg)';
  log('Initial transform set to 0deg');

  function isShowingFront() {
    return rotationCount % 2 === 0;
  }

  function flipClockwise() {
    rotationCount++;
    const degrees = rotationCount * 180;
    inner.style.transform = `rotateY(${degrees}deg)`;
    log(`Flip to ${degrees}deg (showing ${isShowingFront() ? 'front' : 'back'})`);
    
    if (isShowingFront()) {
      log(`Restarting video (currentTime: ${video.currentTime} -> 0)`);
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => log('VIDEO: play() promise resolved'))
          .catch(err => log(`VIDEO: play() promise rejected - ${err.name}: ${err.message}`));
      } else {
        log('VIDEO: play() returned undefined (no promise)');
      }
    }
  }

  function scheduleAutoFlip() {
    if (!autoFlipEnabled || !isPageVisible) {
      log(`Auto-flip not scheduled (enabled: ${autoFlipEnabled}, visible: ${isPageVisible})`);
      return;
    }
    clearTimeout(autoFlipTimer);
    
    if (isShowingFront()) {
      const delay = ANIMATION_DURATION - FLIP_BEFORE_END;
      log(`Scheduling auto-flip in ${delay}ms (front -> back)`);
      autoFlipTimer = setTimeout(() => {
        if (isPageVisible) {
          flipClockwise();
          scheduleAutoFlip();
        }
      }, delay);
    } else {
      log(`Scheduling auto-flip in ${BACK_DISPLAY_TIME}ms (back -> front)`);
      autoFlipTimer = setTimeout(() => {
        if (isPageVisible) {
          flipClockwise();
          scheduleAutoFlip();
        }
      }, BACK_DISPLAY_TIME);
    }
  }

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    
    if (isPageVisible) {
      log('Page became visible');
      if (autoFlipEnabled) {
        scheduleAutoFlip();
      }
      if (isShowingFront()) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => log('VIDEO: resumed on visibility'))
            .catch(err => log(`VIDEO: resume failed - ${err.name}: ${err.message}`));
        }
      }
    } else {
      log('Page became hidden');
      clearTimeout(autoFlipTimer);
      video.pause();
    }
  });

  card.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.closest('a')) return;
    
    if (isShowingFront()) {
      log('User clicked front - disabling auto-flip');
      autoFlipEnabled = false;
      clearTimeout(autoFlipTimer);
      flipClockwise();
    } else {
      log('User clicked back - enabling auto-flip');
      flipClockwise();
      autoFlipEnabled = true;
      clearTimeout(autoFlipTimer);
      scheduleAutoFlip();
    }
  });

  // Initial play attempt
  log('Attempting initial video.play()');
  const initialPlay = video.play();
  if (initialPlay !== undefined) {
    initialPlay
      .then(() => {
        log('VIDEO: Initial play() SUCCESS');
        scheduleAutoFlip();
      })
      .catch(err => {
        log(`VIDEO: Initial play() FAILED - ${err.name}: ${err.message}`);
        log('This is expected on iOS - autoplay requires user interaction');
        // Schedule auto-flip anyway - video will play on first user interaction
        scheduleAutoFlip();
      });
  } else {
    log('VIDEO: Initial play() returned undefined');
    scheduleAutoFlip();
  }

  // Log final readyState after a delay
  setTimeout(() => {
    log(`Video state after 1s: readyState=${video.readyState}, paused=${video.paused}, currentTime=${video.currentTime}`);
  }, 1000);

  setTimeout(() => {
    log(`Video state after 3s: readyState=${video.readyState}, paused=${video.paused}, currentTime=${video.currentTime}`);
    
    // WORKAROUND: If video is "playing" but stuck at 0, force restart
    if (!video.paused && video.currentTime === 0 && video.readyState >= 2) {
      log('WORKAROUND: Video stuck at 0 - forcing restart');
      video.pause();
      video.currentTime = 0.01; // Tiny offset to unstick
      setTimeout(() => {
        video.play()
          .then(() => log('WORKAROUND: Restart successful'))
          .catch(err => log(`WORKAROUND: Restart failed - ${err.message}`));
      }, 100);
    }
  }, 3000);

  setTimeout(() => {
    log(`Video state after 5s: readyState=${video.readyState}, paused=${video.paused}, currentTime=${video.currentTime}`);
  }, 5000);
})();

/* ══════════════════════════════════════════════
   HERO SCROLL DOWN BUTTON
══════════════════════════════════════════════ */
(function() {
  // Ждём полной загрузки DOM
  function initScrollButton() {
    const scrollBtn = document.getElementById('heroScrollBtn');
    const scrollContainer = document.getElementById('heroScrollDown');
    const heroSection = document.querySelector('section.hero');
    
    console.log('Scroll button init:', {scrollBtn, scrollContainer, heroSection});
    
    if (!scrollBtn || !scrollContainer || !heroSection) {
      console.warn('Scroll button elements not found');
      return;
    }
    
    let hidden = false;
    
    function hideButton() {
      if (hidden) return;
      hidden = true;
      scrollContainer.classList.add('hidden');
      console.log('Button hidden');
    }
    
    // Скрыть при клике
    scrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Button clicked');
      hideButton();
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({behavior:'smooth'});
      }
    });
    
    // Скрыть при скролле за пределы hero секции
    let rafId;
    window.addEventListener('scroll', () => {
      if (hidden) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const threshold = window.innerHeight * 0.3;
        if (heroBottom < threshold) {
          hideButton();
        }
      });
    }, { passive: true });
    
    console.log('Scroll button initialized');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollButton);
  } else {
    initScrollButton();
  }
})();

/* ══════════════════════════════════════════════
   BODY BACKGROUND FADE ON SCROLL
══════════════════════════════════════════════ */
(function() {
  function initBodyBackgroundFade() {
    const heroSection = document.querySelector('section.hero');
    if (!heroSection) return;
    
    let rafId;
    
    function updateBodyBackground() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;
        
        if (heroHeight === 0) return;
        
        const transitionStart = heroHeight * 0.2;
        const transitionEnd = heroHeight * 1.2;
        
        let progress = 0;
        if (scrollY > transitionStart) {
          progress = Math.min(1, (scrollY - transitionStart) / (transitionEnd - transitionStart));
        }
        
        // Interpolate RGB: светлый серый -> темно-синий
        // #d8dae5 (216, 218, 229) -> #0c0e1a (12, 14, 26)
        const r = Math.round(216 - 204 * progress);  // 216 -> 12
        const g = Math.round(218 - 204 * progress);  // 218 -> 14
        const b = Math.round(229 - 203 * progress);  // 229 -> 26
        
        document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      });
    }
    
    window.addEventListener('scroll', updateBodyBackground, { passive: true });
    updateBodyBackground();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBodyBackgroundFade);
  } else {
    initBodyBackgroundFade();
  }
})();



/* ══════════════════════════════════════════════
   CONFETTI EXPLOSION (синхронно з вильотом карток)
══════════════════════════════════════════════ */
(function() {
  const PALETTE = ['#42A5F5', '#F05537', '#FBC02D', '#8DC68F', '#797A9E', '#F4B3A8'];
  
  function createRng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function computeBallisticKeyframes(name, params) {
    const {vx0, vy0, drag, vTerminal, swayAmp, swayFreq, swayPhase, rotSpeed, rot0, flipFreq, flipPhase, maxOp, totalTime} = params;
    const steps = 22;
    const subSteps = 6;
    const dtTotal = totalTime / steps;
    const dtSub = dtTotal / subSteps;

    let t = 0, x = 0, y = 0;
    let frames = [];

    for (let i = 0; i <= steps; i++) {
      const pct = ((i / steps) * 100).toFixed(1).replace(/\.0$/, '');
      const rot = (rot0 + rotSpeed * t).toFixed(1);
      const scaleIntro = i === 0 ? 0.2 : Math.min(1, 0.2 + (t / 0.14) * 0.8);
      const sy = (Math.cos(flipFreq * t + flipPhase) * scaleIntro).toFixed(3);
      const sx = scaleIntro.toFixed(3);

      let opacity = maxOp;
      if (i === 0) opacity = 0;
      else if (t < 0.08) opacity = +(maxOp * (t / 0.08)).toFixed(2);
      else if (i === steps) opacity = 0;

      frames.push(`  ${pct}% { opacity: ${opacity}; transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot}deg) scale(${sx}, ${sy}); }`);

      if (i < steps) {
        for (let s = 0; s < subSteps; s++) {
          const tMid = t + dtSub * 0.5;
          const decay = Math.exp(-drag * tMid);
          const vx = vx0 * decay + swayAmp * Math.sin(swayFreq * tMid + swayPhase);
          const vy = (vy0 - vTerminal) * decay + vTerminal;
          x += vx * dtSub;
          y += vy * dtSub;
          t += dtSub;
        }
      }
    }
    return `@keyframes ${name} {\n${frames.join('\n')}\n}`;
  }

  function generateConfetti() {
    const rng = createRng(42077);
    const vw = Math.max(window.innerWidth, 375);
    const vh = Math.max(window.innerHeight, 667);
    const originX = vw / 2;
    const originY = vh / 2;
    
    // Зменшуємо кількість частинок на mobile для продуктивності
    const isMobile = window.innerWidth < 768;
    const countMultiplier = isMobile ? 0.5 : 1;

    const layers = [
      {id: 'layer-far-bg', filter: 'url(#dof-bg)', count: Math.round(42 * countMultiplier), wRange: [13, 21], ratioRange: [1.75, 2.3], speedRange: [950, 2150], dragRange: [2.7, 3.4], vTermRange: [340, 440], swayRange: [18, 42], opacity: 0.65},
      {id: 'layer-mid-sharp', filter: 'url(#dof-mid)', count: Math.round(66 * countMultiplier), wRange: [18, 46], ratioRange: [1.8, 2.45], speedRange: [1150, 2750], dragRange: [2.3, 3.0], vTermRange: [440, 580], swayRange: [25, 58], opacity: 0.98},
      {id: 'layer-foreground-bokeh', filter: 'url(#dof-fg)', count: Math.round(18 * countMultiplier), wRange: [88, 134], ratioRange: [1.8, 2.25], speedRange: [1450, 2950], dragRange: [1.95, 2.55], vTermRange: [560, 740], swayRange: [20, 48], opacity: 0.85}
    ];

    let groupsMarkup = '';
    let keyframesList = [];
    let particleIndex = 0;

    layers.forEach((layer) => {
      let rects = '';
      for (let i = 0; i < layer.count; i++) {
        particleIndex++;
        const animName = `cb-${particleIndex}`;
        const color = PALETTE[Math.floor(rng() * PALETTE.length)];
        const width = Math.round(layer.wRange[0] + rng() * (layer.wRange[1] - layer.wRange[0]));
        const ratio = layer.ratioRange[0] + rng() * (layer.ratioRange[1] - layer.ratioRange[0]);
        const height = Math.round(width * ratio);

        const baseAngle = (i / layer.count) * Math.PI * 2;
        const jitterAngle = (rng() - 0.5) * ((Math.PI * 2) / layer.count) * 0.85;
        const angle = baseAngle + jitterAngle;

        const radialFactor = 0.25 + Math.pow(rng(), 0.72) * 0.75;
        const speed = layer.speedRange[0] + radialFactor * (layer.speedRange[1] - layer.speedRange[0]);
        const vx0 = Math.cos(angle) * speed;
        const vy0 = Math.sin(angle) * speed - (Math.sin(angle) < 0 ? 180 : 0);

        const drag = layer.dragRange[0] + rng() * (layer.dragRange[1] - layer.dragRange[0]);
        const vTerminal = layer.vTermRange[0] + rng() * (layer.vTermRange[1] - layer.vTermRange[0]);
        const swayAmp = layer.swayRange[0] + rng() * (layer.swayRange[1] - layer.swayRange[0]);
        const swayFreq = 2.6 + rng() * 2.4;
        const swayPhase = rng() * Math.PI * 2;

        const rot0 = Math.round(rng() * 360);
        const rotSpeed = (rng() > 0.5 ? 1 : -1) * (160 + rng() * 260);
        const flipFreq = 4.5 + rng() * 5.0;
        const flipPhase = rng() * Math.PI * 2;

        const impulseOffset = (vy0 - vTerminal) / drag;
        const targetDy = vh * 0.6; // Використовуємо vh замість window.innerHeight
        const exactDuration = Math.max(2.1, (targetDy - impulseOffset) / vTerminal) / 2; // Вдвічі швидше
        const durStr = exactDuration.toFixed(2);

        const kfCss = computeBallisticKeyframes(animName, {vx0, vy0, drag, vTerminal, swayAmp, swayFreq, swayPhase, rotSpeed, rot0, flipFreq, flipPhase, maxOp: layer.opacity, totalTime: exactDuration});
        keyframesList.push(kfCss);

        const x = originX - Math.round(width / 2);
        const y = originY - Math.round(height / 2);

        rects += `      <rect class="confetti-piece" x="${x}" y="${y}" width="${width}" height="${height}" rx="1.5" fill="${color}" style="--anim-name:${animName};--dur:${durStr}s;" />\n`;
      }

      const filterAttr = layer.filter ? ` filter="${layer.filter}"` : '';
      groupsMarkup += `    <g id="${layer.id}"${filterAttr}>\n${rects}    </g>\n`;
    });

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="xMidYMid slice" class="confetti-svg">
  <defs>
    <filter id="dof-bg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id="dof-mid" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.6" /></filter>
    <filter id="dof-fg" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="13" /></filter>
  </defs>
${groupsMarkup}</svg>`;

    return { svgMarkup, keyframesCss: keyframesList.join('\n') };
  }

  function initConfetti() {
    const stageEl = document.getElementById('confettiStage');
    const keyframesEl = document.getElementById('confettiKeyframes');
    
    if (!stageEl || !keyframesEl) return;

    const { svgMarkup, keyframesCss } = generateConfetti();
    keyframesEl.textContent = keyframesCss;
    stageEl.innerHTML = svgMarkup;

    let hasPlayed = false; // Прапорець щоб конфетті запустилось тільки один раз

    // Запускаємо confetti синхронно з карточками (0.6s delay після hero-ready)
    document.body.addEventListener('heroReady', () => {
      if (hasPlayed) return; // Якщо вже грало - не запускаємо знову
      hasPlayed = true;
      
      setTimeout(() => {
        stageEl.classList.add('is-playing');
        // Прибираємо confetti через 2 секунди (вдвічі швидше)
        setTimeout(() => {
          stageEl.classList.remove('is-playing');
          setTimeout(() => {
            stageEl.style.opacity = '0';
          }, 300);
        }, 2000); // Було 4000, стало 2000
      }, 600); // Синхронно з delay карточок
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfetti);
  } else {
    initConfetti();
  }
})();
