/* Portfolio — app.js */

/* ── Scroll buttons ── */
document.getElementById('scrollBtn')?.addEventListener('click', () => {
  document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('orderBtn')?.addEventListener('click', () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
});

/* ═══════════════════════════════════════
   CASES FOLDER TABS
═══════════════════════════════════════ */
(function () {
  const tabs  = Array.from(document.querySelectorAll('#casesFolderTabs .cases-folder__tab'));
  const pages = Array.from(document.querySelectorAll('.cases-folder__page'));
  if (!tabs.length || !pages.length) return;

  function switchTo(idx) {
    tabs.forEach((t, i)  => t.classList.toggle('is-active', i === idx));
    pages.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    // инициализируем fade для новой страницы
    initFade({ querySelector: (s) => pages[idx].querySelector(s) });
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => switchTo(i)));

  // Инит
  switchTo(0);
})();

/* ═══════════════════════════════════════
   FADE для cases__list
═══════════════════════════════════════ */
function initFade(pageEl) {
  const list    = pageEl?.querySelector('.cases__list');
  const fadeTop = pageEl?.querySelector('.cases__fade-top');
  const fadeBot = pageEl?.querySelector('.cases__fade-bot');
  if (!list || !fadeTop || !fadeBot) return;

  function update() {
    const { scrollTop, scrollHeight, clientHeight } = list;
    fadeTop.style.opacity = scrollTop > 4 ? '1' : '0';
    fadeBot.style.opacity = scrollTop + clientHeight >= scrollHeight - 4 ? '0' : '1';
  }

  list.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Form toggle ── */
document.querySelectorAll('.cform__check input').forEach((input) => {
  input.closest('.cform__check').classList.toggle('is-checked', input.checked);
  input.addEventListener('change', () => {
    if (input.type === 'radio') {
      document.querySelectorAll(`.cform__check input[name="${input.name}"]`).forEach((r) => {
        r.closest('.cform__check').classList.toggle('is-checked', r === input);
      });
    } else {
      input.closest('.cform__check').classList.toggle('is-checked', input.checked);
    }
  });
});

/* ── Hero fade-in ── */
window.addEventListener('DOMContentLoaded', () => {
  ['.hero__laptop-wrap', '.hero__title', '.hero__sub'].forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.cssText += `opacity:0;transform:translateY(14px);transition:opacity .5s ease ${.1 + i * .1}s,transform .5s ease ${.1 + i * .1}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });
});

/* ── Wire canvas ── */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('wireCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const target = document.getElementById('wireTarget');
  const dots   = Array.from(document.querySelectorAll('.hero .wire-dot'));

  function resize() {
    const hero = canvas.parentElement;
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function getCenter(el) {
    const heroRect = canvas.parentElement.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - heroRect.left + r.width  / 2,
      y: r.top  - heroRect.top  + r.height / 2,
    };
  }

  /* Hex → rgba с alpha */
  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!target) { requestAnimationFrame(draw); return; }

    const T = getCenter(target);

    dots.forEach(dot => {
      const heroRect = canvas.parentElement.getBoundingClientRect();
      const r = dot.getBoundingClientRect();
      /* Точка привязки — верх карточки, по центру */
      const D = {
        x: r.left - heroRect.left + r.width / 2,
        y: r.top  - heroRect.top  + r.height / 2,
      };
      const color = dot.dataset.wireColor || '#4d8cff';

      const plugH = 20;
      const plugW = 8;

      /* Низ штекера — откуда начинается провод */
      const wireStart = { x: D.x, y: D.y + plugH };

      const dx   = T.x - wireStart.x;
      const sagY = Math.abs(dx) * 0.65 + 100;

      const cx1 = wireStart.x;        // вертикально вниз от штекера
      const cy1 = wireStart.y + sagY; // далеко вниз

      const cx2 = T.x;                // вертикально над целью
      const cy2 = T.y - sagY * 0.6;  // далеко вверх от цели

      /* Градиент */
      const grad = ctx.createLinearGradient(wireStart.x, wireStart.y, T.x, T.y);
      grad.addColorStop(0,   hexAlpha(color, 0.95));
      grad.addColorStop(0.5, hexAlpha(color, 0.6));
      grad.addColorStop(1,   hexAlpha(color, 0.2));

      /* Провод */
      ctx.beginPath();
      ctx.moveTo(wireStart.x, wireStart.y);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, T.x, T.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 4.5;
      ctx.lineCap     = 'round';
      ctx.stroke();

      /* Штекер — прямоугольник вертикально вниз от верха карточки */
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(D.x - plugW / 2, D.y, plugW, plugH, 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
});

/* ── Lottie ── */
const LOTTIE_URL = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/Scroll%20down.json';
window.addEventListener('DOMContentLoaded', () => {
  ['lottieArrow1L','lottieArrow1R','lottieArrow2L','lottieArrow2R'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || typeof lottie === 'undefined') return;
    lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: LOTTIE_URL });
  });
});

/* ═══════════════════════════════════════
   CONTACT STACK — веер по бокам
═══════════════════════════════════════ */
(function () {
  const stack = document.querySelector('.cstack');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.cstack__card'));
  if (cards.length < 2) return;

  // Порядок позиций при activeIdx:
  // 3 карточки: [0,1,2] — одна center, одна left, одна right
  // При смене активной — анимируем как тасование

  let order = [0, 1, 2]; // order[0]=left, order[1]=center, order[2]=right
  // Изначально карточка с --active — center
  const initActive = cards.findIndex(c => c.classList.contains('cstack__card--active'));
  // Строим order: center = initActive
  if (initActive === 0)      order = [1, 0, 2];
  else if (initActive === 1) order = [0, 1, 2];
  else                       order = [0, 2, 1];

  const POS = ['left', 'center', 'right'];

  function applyLayout() {
    order.forEach((cardIdx, posIdx) => {
      const card = cards[cardIdx];
      card.dataset.pos = POS[posIdx];
      card.classList.toggle('cstack__card--active', POS[posIdx] === 'center');
    });
  }

  function updateHeight() { /* высота фиксирована в CSS */ }

  // Клик по левой — она едет в центр, центральная → right, правая → left
  // Клик по правой — она едет в центр, центральная → left, левая → right
  cards.forEach((card) => {
    card.addEventListener('click', function () {
      const pos = this.dataset.pos;
      if (pos === 'center') return;

      if (pos === 'left') {
        // left→center, center→right, right→left
        order = [order[2], order[0], order[1]];
      } else {
        // right→center, center→left, left→right
        order = [order[1], order[2], order[0]];
      }
      applyLayout();
      setTimeout(updateHeight, 520);
    });
  });

  // Свайп на мобиле (pointer events)
  (function () {
    let startX = null, dx = 0;
    stack.addEventListener('pointerdown', function (e) {
      // только на мобиле
      if (window.innerWidth > 860) return;
      startX = e.clientX;
      dx = 0;
      stack.setPointerCapture(e.pointerId);
    });
    stack.addEventListener('pointermove', function (e) {
      if (startX === null) return;
      dx = e.clientX - startX;
    });
    stack.addEventListener('pointerup', function () {
      if (startX === null) return;
      startX = null;
      const threshold = window.innerWidth * 0.25;
      if (dx < -threshold) {
        // свайп влево — правая карточка в центр
        const rightCardIdx = order[2];
        const rightCard = cards[rightCardIdx];
        if (rightCard) rightCard.click();
      } else if (dx > threshold) {
        // свайп вправо — левая карточка в центр
        const leftCardIdx = order[0];
        const leftCard = cards[leftCardIdx];
        if (leftCard) leftCard.click();
      }
    });
    stack.addEventListener('pointercancel', function () { startX = null; });
  })();

  // Копирование реквизитов
  stack.addEventListener('click', function (e) {
    const btn = e.target.closest('.donate__copy');
    if (!btn) return;
    e.stopPropagation();
    const text = btn.dataset.copy;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
    });
  });

  // Инициализация
  window.addEventListener('load', () => { applyLayout(); updateHeight(); });
  window.addEventListener('resize', updateHeight);
  applyLayout();
  setTimeout(updateHeight, 100);
})();

/* ═══════════════════════════════════════
   LACAR DRIVE — партикли от логотипа
═══════════════════════════════════════ */
(function () {
  const wrap = document.querySelector('.card__img-wrap--lacar');
  if (!wrap) return;

  const COUNT = 18;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'lacar-particle';

    // Размер 1.8–4.2px (на 40% меньше исходных 3–7px)
    const size = 1.8 + Math.random() * 2.4;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';

    // Стартовая позиция — рядом с центром (±15%)
    const sx = 42 + Math.random() * 16; // 42–58%
    const sy = 42 + Math.random() * 16;
    p.style.left = sx + '%';
    p.style.top  = sy + '%';
    p.style.transform = 'translate(-50%, -50%)';

    // Направление полёта — в любую сторону, 40–110px
    const angle = Math.random() * Math.PI * 2;
    const dist  = 40 + Math.random() * 70;
    p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

    // Скорость и задержка — на 30% медленнее
    const dur   = 3.25 + Math.random() * 3.25;
    const delay = Math.random() * dur;
    p.style.setProperty('--dur',   dur   + 's');
    p.style.setProperty('--delay', delay + 's');

    wrap.appendChild(p);
  }
})();



/* ── Theme toggle ── */
(function () {
  const btn  = document.getElementById('themeToggle');
  const body = document.body;
  const KEY  = 'portfolio-theme';

  // Иконки: солнце (светлая) и луна (тёмная)
  const SUN  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;

  function apply(theme) {
    // Отключаем все transitions на время смены темы
    document.documentElement.classList.add('theme-switching');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-switching');
    }));

    if (theme === 'light') {
      body.classList.add('theme-light');
      if (btn) { btn.innerHTML = MOON; btn.title = 'Тёмная тема'; }
    } else {
      body.classList.remove('theme-light');
      if (btn) { btn.innerHTML = SUN; btn.title = 'Светлая тема'; }
    }
    // Синхронно обновляем кнопки День/Ночь в чате
    var dayBtn   = document.getElementById('chatModeDay');
    var nightBtn = document.getElementById('chatModeNight');
    if (dayBtn && nightBtn) {
      dayBtn.classList.toggle('hero__chat-mode-btn--active',   theme === 'light');
      nightBtn.classList.toggle('hero__chat-mode-btn--active', theme !== 'light');
    }
  }

  const saved = localStorage.getItem(KEY) || 'dark';
  apply(saved);

  if (btn) {
    btn.addEventListener('click', () => {
      const next = body.classList.contains('theme-light') ? 'dark' : 'light';
      localStorage.setItem(KEY, next);
      apply(next);
    });
  }

  // Кнопки День/Ночь в чате — используют ту же apply
  var dayBtn   = document.getElementById('chatModeDay');
  var nightBtn = document.getElementById('chatModeNight');
  if (dayBtn)   dayBtn.addEventListener('click',   function () { localStorage.setItem(KEY, 'light'); apply('light'); });
  if (nightBtn) nightBtn.addEventListener('click', function () { localStorage.setItem(KEY, 'dark');  apply('dark');  });
})();


/* ═══════════════════════════════════════
   MATRIX CODE RAIN — hero background
   Алгоритм по мотивам BambuFarm/rain.py
═══════════════════════════════════════ */
(function () {
  const root = document.querySelector('.hero');
  const cv   = document.getElementById('matrixCanvas');
  if (!root || !cv) return;
  const ctx  = cv.getContext('2d');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Символы как в rain.py
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$&*+-=/<>|ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'.split('');

  const CELL    = 26;         // размер ячейки px
  const COL_GAP = CELL * 2;   // шаг колонок — каждая вторая, не накладываются
  const FPS     = 20;         // ~как sleep(0.05) в rain.py
  const STEP    = 1000 / FPS;

  // Цвета зависят от темы
  function getTheme() {
    return document.body.classList.contains('theme-light') ? 'light' : 'dark';
  }

  function palette() {
    if (getTheme() === 'light') return {
      bg:     'rgba(240,241,245,0.25)', // светлый fade
      white:  'rgba(60,60,70,1.0)',     // голова — тёмно-серая
      bright: 'rgba(90,95,110,0.85)',
      mid:    'rgba(130,135,150,0.6)',
      dim:    'rgba(170,175,185,0.35)',
    };
    return {
      bg:     'rgba(8,9,15,0.2)',
      white:  'rgba(230,255,240,1.0)',
      bright: 'rgba(0,255,100,0.9)',
      mid:    'rgba(0,200,70,0.65)',
      dim:    'rgba(0,120,40,0.35)',
    };
  }

  let w = 0, h = 0, dpr = 1, cols = 0, drops = [];
  let raf = 0, live = false, last = 0;

  const pick = () => CHARS[(Math.random() * CHARS.length) | 0];
  const rows = () => Math.ceil(h / CELL);

  function makeCol(x) {
    const r = rows();
    return {
      x,
      head:   -(Math.random() * r | 0),
      length: 6 + (Math.random() * Math.max(1, r / 2) | 0),
      speed:  Math.random() < 0.75 ? 1 : 2,  // 75% = speed 1, 25% = speed 2
      chars:  Array.from({ length: r + 4 }, pick),
      tick:   0,
    };
  }

  function size() {
    const r = root.getBoundingClientRect();
    w = r.width; h = r.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width  = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font         = 'bold ' + CELL + 'px ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'top';
    cols  = Math.ceil(w / COL_GAP);
    drops = Array.from({ length: cols }, (_, i) => makeCol(i * COL_GAP));
    // Заливаем фон
    ctx.fillStyle = '#08090f';
    ctx.fillRect(0, 0, w, h);
  }

  function stepCol(d) {
    d.tick++;
    if (d.tick < d.speed) return;
    d.tick = 0;
    d.head++;
    // 12% шанс мутации случайного символа в хвосте (как в rain.py)
    if (Math.random() < 0.12) {
      const ri = Math.random() * d.chars.length | 0;
      d.chars[ri] = pick();
    }
    // Сброс колонки
    const r = rows();
    if (d.head - d.length > r) {
      d.head   = -(Math.random() * r / 2 | 0);
      d.length = 6 + (Math.random() * Math.max(1, r / 2) | 0);
      d.speed  = Math.random() < 0.75 ? 1 : 2;
      d.chars  = Array.from({ length: r + 4 }, pick);
    }
  }

  function drawCol(d) {
    const r = rows();
    const p = palette();
    for (let row = 0; row < r; row++) {
      const dist = d.head - row;
      const y    = row * CELL;
      const ch   = d.chars[row] || ' ';

      if (dist === 0) {
        ctx.fillStyle = p.white;
        ctx.fillText(ch, d.x, y);
      } else if (dist > 0 && dist <= 2) {
        ctx.fillStyle = p.bright;
        ctx.fillText(ch, d.x, y);
      } else if (dist > 0 && dist <= d.length / 2) {
        ctx.fillStyle = p.mid;
        ctx.fillText(ch, d.x, y);
      } else if (dist > 0 && dist <= d.length) {
        ctx.fillStyle = p.dim;
        ctx.fillText(ch, d.x, y);
      }
    }
  }

  function draw() {
    const p = palette();
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
    for (const d of drops) {
      stepCol(d);
      drawCol(d);
    }
  }

  function frame(now) {
    if (now - last >= STEP) { last = now; draw(); }
    if (live) raf = requestAnimationFrame(frame);
  }

  const start = () => { if (!live && !calm) { live = true; raf = requestAnimationFrame(frame); } };
  const stop  = () => { live = false; cancelAnimationFrame(raf); };

  size();
  if (calm) { for (let i = 0; i < 30; i++) draw(); }
  else new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(root);

  let t;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { size(); }, 180);
  });
})();

/* ── APNG loop fallback ── */
(function () {
  const img = document.querySelector('.hero__laptop');
  if (!img) return;
  const src = img.src;
  // Перезагружаем src каждые N мс — грубо но работает для APNG без loop
  // Лучше всего задать loop прямо в APNG-файле
  // Этот код только как fallback если файл не зациклен
  // img.addEventListener('load', ...) не стреляет повторно для APNG
  // Поэтому просто убеждаемся что src валиден
  img.src = src;
})();

/* ═══════════════════════════════════════
   HERO CHAT — Lottie typing indicator
   ВРЕМЕННО ЗАКОММЕНТИРОВАНО — идёт работа над анимацией
═══════════════════════════════════════ */
/*
(function () {
  var el = document.getElementById('heroLottie');
  if (!el || typeof lottie === 'undefined') return;
  lottie.loadAnimation({
    container: el,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/Edelweiss.json',
  });
})();
*/





/* ═══════════════════════════════════════
   CONTACT FOLDER TABS (mobile)
═══════════════════════════════════════ */
(function () {
  if (window.innerWidth > 860) return;

  var folder = document.getElementById('contactFolder');
  var tabs   = Array.from(document.querySelectorAll('#contactFolderTabs .contact-folder__tab'));
  var pages  = Array.from(document.querySelectorAll('#contactFolderPanel .contact-folder__page'));
  var cards  = Array.from(document.querySelectorAll('.cstack .cstack__card'));
  if (!folder || !tabs.length || !cards.length) return;

  // Клонируем содержимое каждой карточки в соответствующую страницу
  cards.forEach(function(card, i) {
    var page = pages[i];
    if (!page) return;
    var wrap = card.querySelector('.cform__wrap');
    if (wrap) {
      var clone = wrap.cloneNode(true);
      // Убираем border-radius у header
      var header = clone.querySelector('.cform__header');
      if (header) header.style.borderRadius = '0';
      page.appendChild(clone);
    }
  });

  function switchTo(idx) {
    tabs.forEach(function(t, i)  { t.classList.toggle('is-active', i === idx); });
    pages.forEach(function(p, i) { p.classList.toggle('is-active', i === idx); });
  }

  tabs.forEach(function(tab, i) {
    tab.addEventListener('click', function() { switchTo(i); });
  });

  switchTo(0);
})();
