/* Portfolio — app.js */

/* ── Scroll buttons ── */
document.getElementById('scrollBtn')?.addEventListener('click', () => {
  document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('orderBtn')?.addEventListener('click', () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
});

/* ═══════════════════════════════════════
   CASES CAROUSEL — Classic Club style
   All slides shift simultaneously by one position
═══════════════════════════════════════ */
(function () {
  const track = document.getElementById('casesTrack');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.ck-slide'));
  const total  = slides.length;
  let active   = 0;
  let animating = false;
  const DUR = 1050;

  /* ── FLIP: label и icon летят из превью в плашку ── */
  function flipExpand(slide) {
    const label  = slide.querySelector('[data-flip-label]');
    const icon   = slide.querySelector('[data-flip-icon]');
    const tLabel = slide.querySelector('[data-flip-target-label]');
    const tIcon  = slide.querySelector('[data-flip-target-icon]');

    if (!label || !tLabel) {
      slide.classList.add('ck-slide--expanded');
      initFade(slide);
      return;
    }

    /* FIRST — позиции ДО expand (плашка ещё не видна) */
    const r1L = label.getBoundingClientRect();
    const r1I = icon ? icon.getBoundingClientRect() : null;

    /* Добавляем expanded — плашка начинает рисоваться */
    requestAnimationFrame(() => {
      slide.classList.add('ck-slide--expanded');

      /* LAST — позиции ПОСЛЕ expand */
      const r2L = tLabel.getBoundingClientRect();
      const r2I = tIcon ? tIcon.getBoundingClientRect() : null;

      /* Скрываем targets пока летит клон */
      tLabel.style.opacity = '0';
      if (tIcon) tIcon.style.opacity = '0';

      const FLIP_DUR = 380;

      const makeGhost = (src, r1, r2) => {
        const el = src.cloneNode(true);
        const cs = getComputedStyle(src);
        Object.assign(el.style, {
          position: 'fixed',
          left: r1.left + 'px', top: r1.top + 'px',
          width: r1.width + 'px', height: r1.height + 'px',
          margin: '0', zIndex: '9999', pointerEvents: 'none',
          transition: 'none',
          fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color,
          transformOrigin: '0 0',
        });
        document.body.appendChild(el);

        requestAnimationFrame(() => requestAnimationFrame(() => {
          const dx = r2.left - r1.left;
          const dy = r2.top  - r1.top;
          const sx = r2.width  / r1.width;
          const sy = r2.height / r1.height;
          el.style.transition = `transform ${FLIP_DUR}ms cubic-bezier(0.4,0,0.2,1)`;
          el.style.transform  = `translate(${dx}px,${dy}px) scale(${sx},${sy})`;
          el.addEventListener('transitionend', () => {
            el.remove();
            tLabel.style.opacity = '';
            if (tIcon) tIcon.style.opacity = '';
          }, { once: true });
        }));
      };

      makeGhost(label, r1L, r2L);
      if (r1I && r2I) makeGhost(icon, r1I, r2I);

      initFade(slide);
    });
  }

  function expand(slide) { flipExpand(slide); }

  function collapse(slide) {
    slide.querySelectorAll('.case-item').forEach(el => { el.style.transitionDelay = '0s'; });
    slide.classList.remove('ck-slide--expanded');
    setTimeout(() => {
      slide.querySelectorAll('.case-item').forEach(el => { el.style.transitionDelay = ''; });
    }, 350);
  }

  /* positions[i] хранит текущую позицию каждого слайда: 0, 1, -1, 'hide' */
  const positions = slides.map((_, i) => {
    if (i === 0) return '0';
    if (i === 1) return '1';
    if (i === total - 1) return '-1';
    return 'hide';
  });

  function applyPositions(animate) {
    slides.forEach((slide, i) => {
      if (!animate) slide.style.transition = 'none';
      slide.setAttribute('data-pos', String(positions[i]));
    });
    if (!animate) {
      track.offsetHeight;
      slides.forEach(s => { s.style.transition = ''; });
    }
  }

  function shift(dir) {
    /* dir = +1 (→ следующий становится центром) или -1 (← предыдущий) */
    /* Кто сейчас center/left/right/hide */
    const centerIdx = positions.indexOf('0');
    const rightIdx  = positions.indexOf('1');
    const leftIdx   = positions.indexOf('-1');

    /* keep-visible чтобы не мигало при смене */
    slides.forEach(s => {
      if (s.getAttribute('data-pos') !== 'hide') s.classList.add('keep-visible');
    });

    /* Collapse current center */
    collapse(slides[centerIdx]);

    if (dir === 1) {
      /* → Нажали правый. Правый → центр, центр → лево, лево → hide, hide → право */
      const hideIdx = positions.findIndex((p, i) => p === 'hide' && i !== centerIdx && i !== rightIdx && i !== leftIdx);
      positions[centerIdx] = '-1';
      positions[rightIdx]  = '0';
      positions[leftIdx]   = 'hide';
      if (hideIdx !== -1) positions[hideIdx] = '1';
      active = rightIdx;
    } else {
      /* ← Нажали левый. Левый → центр, центр → право, право → hide, hide → лево */
      const hideIdx = positions.findIndex((p, i) => p === 'hide' && i !== centerIdx && i !== rightIdx && i !== leftIdx);
      positions[centerIdx] = '1';
      positions[leftIdx]   = '0';
      positions[rightIdx]  = 'hide';
      if (hideIdx !== -1) positions[hideIdx] = '-1';
      active = leftIdx;
    }

    applyPositions(true);

    animating = true;
    setTimeout(() => {
      slides.forEach(s => s.classList.remove('keep-visible'));
      expand(slides[active]);
      animating = false;
    }, DUR + 20);
  }

  function render(animate) {
    if (!animate) {
      applyPositions(false);
      expand(slides[active]);
    }
  }

  /* Click side slide */
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (animating) return;
      const pos = positions[i];
      if (pos === '1')  { shift(1);  return; }
      if (pos === '-1') { shift(-1); return; }
    });
  });

  /* Touch swipe */
  let tx = null, ty = null, t0 = 0;
  track.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; t0 = Date.now();
  }, { passive: true });
  track.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = tx - e.changedTouches[0].clientX;
    const dy = ty - e.changedTouches[0].clientY;
    if (!animating && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50 && Date.now() - t0 < 500) {
      shift(dx > 0 ? 1 : -1);
    }
    tx = null;
  }, { passive: true });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (animating) return;
    if (e.key === 'ArrowLeft')  shift(-1);
    if (e.key === 'ArrowRight') shift(1);
  });

  render(false);
})();

/* ═══════════════════════════════════════
   FADE for each cases__list
═══════════════════════════════════════ */
function initFade(slideEl) {
  const list    = slideEl?.querySelector('.cases__list');
  const fadeTop = slideEl?.querySelector('.cases__fade-top');
  const fadeBot = slideEl?.querySelector('.cases__fade-bot');
  if (!list || !fadeTop || !fadeBot) return;

  /* remove previous listener by cloning */
  const newList = list.cloneNode(true);
  list.parentNode.replaceChild(newList, list);

  function update() {
    const { scrollTop, scrollHeight, clientHeight } = newList;
    fadeTop.style.opacity = scrollTop > 4 ? '1' : '0';
    fadeBot.style.opacity = scrollTop + clientHeight >= scrollHeight - 4 ? '0' : '1';
  }

  newList.addEventListener('scroll', update, { passive: true });
  update();
}

/* Init fades for all slides on load */
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ck-slide').forEach(initFade);
});

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
  ['.hero__laptop-wrap', '.hero__title', '.hero__sub', '.btn--scroll'].forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.cssText += `opacity:0;transform:translateY(14px);transition:opacity .5s ease ${.1 + i * .1}s,transform .5s ease ${.1 + i * .1}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });
});
