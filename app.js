/* Portfolio — app.js */

/* ── Scroll buttons ── */
document.getElementById('scrollBtn')?.addEventListener('click', () => {
  document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('orderBtn')?.addEventListener('click', () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
});

/* ═══════════════════════════════════════
   CASES CAROUSEL — infinite loop без рывков
   6 повторений × N слайдов. Стартуем в центральной группе.
   Перебалансировка происходит пока трек стоит — незаметно.
   Анимация expand запускается после того как трек доехал.
═══════════════════════════════════════ */
(function () {
  const track = document.getElementById('casesTrack');
  if (!track) return;

  const origSlides = Array.from(track.querySelectorAll('.ck-slide'));
  const N = origSlides.length;
  if (N < 2) return;

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
  let curIdx = MID * N;
  let pendingExpand = null; // слайд ожидающий expand после transitionend

  function slideW()  { return allSlides[0].offsetWidth; }
  function gapW()    { return parseFloat(getComputedStyle(track).gap) || 20; }
  function targetX(idx) {
    const cw = track.parentElement.offsetWidth;
    return idx * (slideW() + gapW()) - (cw - slideW()) / 2;
  }

  function jumpTo(idx) {
    track.style.transition = 'none';
    track.style.transform = `translateX(${-targetX(idx)}px)`;
    allSlides.forEach(s => s.style.transition = '');
  }
  
  function slideTo(idx) {
    track.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    track.style.transform = `translateX(${-targetX(idx)}px)`;
  }

  /* Сбросить анимацию предыдущего активного */
  function collapse(slide) {
    slide.classList.remove('ck-slide--expanded');
    slide.querySelectorAll('.case-item').forEach(el => {
      el.style.transitionDelay = '0s';
    });
    setTimeout(() => {
      slide.querySelectorAll('.case-item').forEach(el => {
        el.style.transitionDelay = '';
      });
    }, 300);
  }

  /* expand — чистый CSS, никакого FLIP */
  function expand(slide) {
    slide.classList.add('ck-slide--expanded');
    initFade(slide);
  }

  function setActive(idx, doExpand = false) {
    /* collapse предыдущего */
    const prev = allSlides.find(s => s.classList.contains('is-active'));
    if (prev && prev !== allSlides[idx]) {
      collapse(prev);
    }

    allSlides.forEach(s => s.classList.remove('is-active'));
    allSlides[idx].classList.add('is-active');
    curIdx = idx;

    if (doExpand) {
      expand(allSlides[idx]);
    } else {
      pendingExpand = allSlides[idx];
    }
  }

  let animating = false;

  track.addEventListener('transitionend', e => {
    if (e.propertyName !== 'transform') return;
    if (e.target !== track) return;
    
    animating = false;

    if (pendingExpand) {
      expand(pendingExpand);
      pendingExpand = null;
    }

    rebalance();
  });

  function rebalance() {
    if (animating) return;
    if (curIdx < N || curIdx >= 2 * N) {
      const realIdx = ((curIdx % N) + N) % N;
      const newIdx  = N + realIdx;
      /* перед прыжком — переносим expand на новый слайд если нужно */
      const wasExpanded = allSlides[curIdx].classList.contains('ck-slide--expanded');
      allSlides[curIdx].classList.remove('is-active', 'ck-slide--expanded');
      allSlides[newIdx].classList.add('is-active');
      if (wasExpanded) allSlides[newIdx].classList.add('ck-slide--expanded');
      jumpTo(newIdx);
      curIdx = newIdx;
    }
  }

  function goTo(idx, animated = true) {
    if (animated) { animating = true; slideTo(idx); } else jumpTo(idx);
    setActive(idx, !animated);
  }

  function prev() { goTo(curIdx - 1); }
  function next() { goTo(curIdx + 1); }

  /* Drag */
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
    if      (dragDeltaX < -threshold) next();
    else if (dragDeltaX >  threshold) prev();
    else goTo(curIdx, true);
  });
  track.addEventListener('pointercancel', () => {
    dragStartX = null; goTo(curIdx, true);
  });

  allSlides.forEach((slide, i) => {
    slide.addEventListener('click', () => { if (i !== curIdx) goTo(i); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* Инит — expand сразу без ожидания трека */
  requestAnimationFrame(() => {
    jumpTo(curIdx);
    setActive(curIdx, true);
    
    /* Применяем ленту для карточек "в разработке" */
    document.querySelectorAll('.card__wip').forEach(wipCard => {
      const imgWrap = wipCard.closest('.card').querySelector('.card__img-wrap');
      if (imgWrap) {
        imgWrap.classList.add('tape-pattern-1');
      }
    });
  });
})();

/* ═══════════════════════════════════════
   FADE для cases__list (градиент при скролле)
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

/* ── Lottie ── */
const LOTTIE_URL = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/Scroll%20down.json';
window.addEventListener('DOMContentLoaded', () => {
  ['lottieArrow1L','lottieArrow1R','lottieArrow2L','lottieArrow2R'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || typeof lottie === 'undefined') return;
    lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: LOTTIE_URL });
  });
});
