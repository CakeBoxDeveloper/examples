/* Portfolio — app.js */

/* ── Scroll buttons ── */
document.getElementById('scrollBtn')?.addEventListener('click', () => {
  document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('orderBtn')?.addEventListener('click', () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
});

/* ═══════════════════════════════════════
   CASES CAROUSEL
═══════════════════════════════════════ */
(function () {
  const track = document.getElementById('casesTrack');
  if (!track) return;

  const origSlides = Array.from(track.querySelectorAll('.ck-slide'));
  const N = origSlides.length;
  if (N < 2) return;

  /* ── Бесконечная лента: 6 копий ── */
  const REPS = 6;
  const MID  = Math.floor(REPS / 2);
  track.innerHTML = '';
  for (let r = 0; r < REPS; r++) {
    origSlides.forEach((s, i) => {
      const c = s.cloneNode(true);
      c.dataset.realIdx = i;
      track.appendChild(c);
    });
  }

  const allSlides = Array.from(track.querySelectorAll('.ck-slide'));
  let curIdx  = MID * N;
  let busy    = false;        // блокируем повторные goTo во время анимации
  let timers  = [];           // все активные таймауты — чистим при rebalance

  const T = 400; // ms — единый тайминг

  /* ── Геометрия ── */
  function slideW() { return allSlides[0].offsetWidth; }
  function gapW()   { return parseFloat(getComputedStyle(track).gap) || 20; }
  function targetX(idx) {
    const cw = track.parentElement.offsetWidth;
    return idx * (slideW() + gapW()) - (cw - slideW()) / 2;
  }

  /* ── Слои: мгновенное состояние ── */
  function layerSet(slide, showContent) {
    const pre = slide.querySelector('.ck-preview');
    const con = slide.querySelector('.ck-content');
    if (!pre || !con) return;
    pre.style.transition = 'none';
    con.style.transition = 'none';
    if (showContent) {
      pre.style.opacity = '0'; pre.style.filter = 'blur(8px)';
      con.style.opacity = '1'; con.style.filter = 'blur(0px)';
    } else {
      pre.style.opacity = '1'; pre.style.filter = 'blur(0px)';
      con.style.opacity = '0'; con.style.filter = 'blur(8px)';
    }
  }

  /* ── Слои: анимированный переход ── */
  function layerAnim(slide, showContent, delayMs = 0) {
    const pre = slide.querySelector('.ck-preview');
    const con = slide.querySelector('.ck-content');
    if (!pre || !con) return;
    const d = delayMs / 1000;
    const tr = `opacity ${T/1000}s cubic-bezier(0.4,0,0.2,1) ${d}s, filter ${T/1000}s cubic-bezier(0.4,0,0.2,1) ${d}s`;
    pre.style.transition = tr;
    con.style.transition = tr;
    if (showContent) {
      pre.style.opacity = '0'; pre.style.filter = 'blur(8px)';
      con.style.opacity = '1'; con.style.filter = 'blur(0px)';
    } else {
      pre.style.opacity = '1'; pre.style.filter = 'blur(0px)';
      con.style.opacity = '0'; con.style.filter = 'blur(8px)';
    }
  }

  /* ── Позиция трека без анимации ── */
  function jumpTo(idx) {
    track.style.transition = 'none';
    track.style.transform  = `translateX(${-targetX(idx)}px)`;
  }

  /* ── Инит: всем слайдам правильное начальное состояние ── */
  function initAll() {
    allSlides.forEach((s, i) => {
      s.style.transition = 'none';
      s.style.opacity    = i === curIdx ? '1'        : '0.5';
      s.style.transform  = i === curIdx ? 'scale(1)' : 'scale(0.85)';
      s.classList.toggle('is-active', i === curIdx);
      layerSet(s, i === curIdx);
    });
  }

  /* ── Главный переход ── */
  function goTo(idx) {
    if (idx === curIdx || busy) return;
    busy = true;

    const outIdx = curIdx;
    const inIdx  = idx;
    curIdx = inIdx;

    const outSlide = allSlides[outIdx];
    const inSlide  = allSlides[inIdx];

    outSlide.classList.remove('is-active');
    inSlide.classList.add('is-active');

    const outPre = outSlide.querySelector('.ck-preview');
    const outCon = outSlide.querySelector('.ck-content');
    const inPre  = inSlide.querySelector('.ck-preview');
    const inCon  = inSlide.querySelector('.ck-content');

    /* Начальные состояния мгновенно */
    layerSet(outSlide, true);   // уходящий: контент виден
    layerSet(inSlide, false);   // входящий: превью видно, чёткое

    const trSlide = `transform ${T/1000}s cubic-bezier(0.4,0,0.2,1), opacity ${T/1000}s cubic-bezier(0.4,0,0.2,1)`;
    const trLayer = `opacity ${T/1000}s cubic-bezier(0.4,0,0.2,1), filter ${T/1000}s cubic-bezier(0.4,0,0.2,1)`;

    requestAnimationFrame(() => requestAnimationFrame(() => {

      /* ── Фаза 1: уходящий блюрит контент + входящий едет в центр (превью блюрится одновременно) ── */

      /* Уходящий: контент блюрится */
      if (outCon) { outCon.style.transition = trLayer; outCon.style.opacity = '0'; outCon.style.filter = 'blur(8px)'; }

      /* Трек едет */
      track.style.transition = `transform ${T/1000}s cubic-bezier(0.4,0,0.2,1)`;
      track.style.transform  = `translateX(${-targetX(inIdx)}px)`;

      /* Уходящий скейлится вниз */
      outSlide.style.transition = trSlide;
      outSlide.style.transform  = 'scale(0.85)';
      outSlide.style.opacity    = '0.5';

      /* Входящий скейлится вверх — превью одновременно блюрится и исчезает */
      inSlide.style.transition = trSlide;
      inSlide.style.transform  = 'scale(1)';
      inSlide.style.opacity    = '1';
      if (inPre) { inPre.style.transition = trLayer; inPre.style.opacity = '0'; inPre.style.filter = 'blur(8px)'; }

      /* ── Фаза 2 (после T): уходящий — превью; входящий — контент из блюра ── */
      const t1 = setTimeout(() => {

        /* Уходящий: превью появляется */
        if (outPre) { outPre.style.transition = trLayer; outPre.style.opacity = '1'; outPre.style.filter = 'blur(0px)'; }

        /* Входящий: контент появляется из блюра */
        if (inCon)  { inCon.style.transition  = trLayer; inCon.style.opacity  = '1'; inCon.style.filter  = 'blur(0px)'; }

        const t2 = setTimeout(() => {
          busy = false;
          initFade(inSlide);
          rebalance();
        }, T);
        timers.push(t2);
      }, T);

      timers.push(t1);
    }));
  }

  /* ── Rebalance: незаметный прыжок в центр ── */
  function rebalance() {
    if (curIdx < N || curIdx >= 2 * N) {
      const realIdx = ((curIdx % N) + N) % N;
      const newIdx  = N + realIdx;

      const from = allSlides[curIdx];
      const to   = allSlides[newIdx];

      /* Сначала копируем состояние на новый клон */
      ['ck-preview', 'ck-content'].forEach(cls => {
        const f = from.querySelector('.' + cls);
        const t = to.querySelector('.' + cls);
        if (!f || !t) return;
        t.style.transition = 'none';
        t.style.opacity    = f.style.opacity;
        t.style.filter     = f.style.filter;
      });
      to.style.transition = 'none';
      to.style.transform  = from.style.transform;
      to.style.opacity    = from.style.opacity;

      from.classList.remove('is-active');
      to.classList.add('is-active');
      jumpTo(newIdx);
      curIdx = newIdx;

      /* Потом сбрасываем все остальные клоны того же realIdx */
      allSlides.forEach((s, i) => {
        if (i === newIdx) return;
        if (parseInt(s.dataset.realIdx) === realIdx) {
          s.classList.remove('is-active');
          s.style.transition = 'none';
          s.style.transform  = 'scale(0.85)';
          s.style.opacity    = '0.5';
          layerSet(s, false);
        }
      });

      /* Гарантируем что активный показывает контент */
      layerSet(to, true);
    }
  }

  /* ── Drag ── */
  let dragStartX = null, dragDeltaX = 0, baseTranslate = 0;

  track.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragStartX    = e.clientX;
    dragDeltaX    = 0;
    baseTranslate = -targetX(curIdx);
    track.style.transition = 'none';
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if (dragStartX === null) return;
    dragDeltaX = e.clientX - dragStartX;
    track.style.transform = `translateX(${baseTranslate + dragDeltaX}px)`;
  });
  track.addEventListener('pointerup', () => {
    if (dragStartX === null) return;
    dragStartX = null;
    const threshold = slideW() * 0.2;
    if      (dragDeltaX < -threshold) goTo(curIdx + 1);
    else if (dragDeltaX >  threshold) goTo(curIdx - 1);
    else {
      track.style.transition = `transform ${T/1000}s cubic-bezier(0.4,0,0.2,1)`;
      track.style.transform  = `translateX(${-targetX(curIdx)}px)`;
    }
  });
  track.addEventListener('pointercancel', () => {
    dragStartX = null;
    track.style.transition = `transform ${T/1000}s cubic-bezier(0.4,0,0.2,1)`;
    track.style.transform  = `translateX(${-targetX(curIdx)}px)`;
  });

  allSlides.forEach((slide, i) => {
    slide.addEventListener('click', () => { if (i !== curIdx) goTo(i); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(curIdx - 1);
    if (e.key === 'ArrowRight') goTo(curIdx + 1);
  });

  /* ── Инит ── */
  requestAnimationFrame(() => {
    jumpTo(curIdx);
    initAll();
    initFade(allSlides[curIdx]);

    document.querySelectorAll('.card__wip').forEach((wipCard, i) => {
      const imgWrap = wipCard.closest('.card').querySelector('.card__img-wrap');
      if (imgWrap) {
        imgWrap.classList.add(i % 2 === 0 ? 'tape-pattern-1' : 'tape-pattern-2');
      }
    });
  });
})();

/* ═══════════════════════════════════════
   FADE для cases__list
═══════════════════════════════════════ */
function initFade(slideEl) {
  const list    = slideEl?.querySelector('.cases__list');
  const fadeTop = slideEl?.querySelector('.cases__fade-top');
  const fadeBot = slideEl?.querySelector('.cases__fade-bot');
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
