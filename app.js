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
  const DUR = 500;

  function render(animate) {
    /* Перед сменой позиций — все текущие видимые слайды помечаем keep-visible */
    if (animate) {
      slides.forEach(s => {
        if (s.getAttribute('data-pos') !== 'hide') s.classList.add('keep-visible');
      });
    }

    slides.forEach((slide, i) => {
      if (!animate) slide.style.transition = 'none';

      let d = i - active;
      if (d >  total / 2) d -= total;
      if (d < -total / 2) d += total;

      slide.classList.remove('is-leaving');

      if      (d ===  0) slide.setAttribute('data-pos', '0');
      else if (d ===  1) slide.setAttribute('data-pos', '1');
      else if (d === -1) slide.setAttribute('data-pos', '-1');
      else               slide.setAttribute('data-pos', 'hide');
    });

    if (!animate) {
      track.offsetHeight; /* force reflow */
      slides.forEach(s => { s.style.transition = ''; });
      initFade(slides[active]);
    } else {
      animating = true;
      setTimeout(() => {
        slides.forEach(s => s.classList.remove('keep-visible'));
        animating = false;
        initFade(slides[active]);
      }, DUR + 20);
    }
  }

  /* Click any slide → it becomes active, everyone shifts */
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (animating || i === active) return;
      active = i;
      render(true);
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
      active = ((active + (dx > 0 ? 1 : -1)) + total) % total;
      render(true);
    }
    tx = null;
  }, { passive: true });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (animating) return;
    if (e.key === 'ArrowLeft')  { active = (active - 1 + total) % total; render(true); }
    if (e.key === 'ArrowRight') { active = (active + 1) % total;         render(true); }
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
