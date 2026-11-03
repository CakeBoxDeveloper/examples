/* orbit3d.js — model-viewer плитки, работает через file:// */
(function () {

  const LOGOS = [
    { color: '#e8ddd0', logo: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/acdb4a50ed9862af719e764b04472ec7fbfaa33f/PanCardSVG.svg',          filter: '' },
    { color: '#3d0f1a', logo: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/efd780e6770ae3863fe1730147c932a43819eaff/TTM%20Logo%20Isolate.svg', filter: 'brightness(0) saturate(100%) invert(80%) sepia(30%) saturate(400%) hue-rotate(300deg) brightness(110%)' },
    { color: '#1a0505', logo: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/2899a3df08be0d88fa4d4afd0d7e053b8ead27f1/PrismLogo2.svg',           filter: 'brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(800%) hue-rotate(340deg) brightness(130%)' },
    { color: '#000000', logo: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/2899a3df08be0d88fa4d4afd0d7e053b8ead27f1/LC.svg',                   filter: 'brightness(0) saturate(100%) invert(85%) sepia(60%) saturate(600%) hue-rotate(5deg) brightness(105%)' },
    { color: '#0000ff', logo: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/efd780e6770ae3863fe1730147c932a43819eaff/Glitch.svg',               filter: 'brightness(0) invert(1)' },
    { color: '#000000', logo: 'https://raw.githubusercontent.com/CakeBoxDeveloper/MSE/c3a01dd59275d25a96184e99df50a8dc3dd27667/MSESVG.svg',                   filter: 'brightness(0) invert(1)' },
  ];

  const COLS       = 4;
  const ROWS       = 3;
  const TILE_SIZE  = 68;
  const ORBIT_R    = 32;
  const ORBIT_SPD  = 0.00035;
  const SWAY_AMP   = 12;
  const SWAY_SPD   = 0.0007;
  const TILT_AMP   = 8;
  const TILT_X_SPD = 0.0005;
  const TILT_Y_SPD = 0.00043;

  const GLB = 'Plate.glb';

  function init() {
    const container = document.getElementById('orbitTiles');
    if (!container) return;
    buildTiles(container);
  }

  function buildTiles(container) {
    const tiles = [];
    let idx = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const logo = LOGOS[idx % LOGOS.length];

        /* Обёртка — даёт перспективу для CSS 3D */
        const wrap = document.createElement('div');
        wrap.style.cssText = [
          'position:absolute',
          'width:'  + TILE_SIZE + 'px',
          'height:' + TILE_SIZE + 'px',
          'transform-style:preserve-3d',
          'will-change:transform',
          'border-radius:12px',
          'overflow:hidden',
          'box-shadow:0 8px 24px rgba(0,0,0,0.5)',
        ].join(';');

        /* model-viewer — 3D форма плитки */
        const mv = document.createElement('model-viewer');
        mv.setAttribute('src', GLB);
        mv.setAttribute('alt', '');
        /* phi=90deg — смотрим строго спереди */
        mv.setAttribute('camera-orbit',      '0deg 90deg 105%');
        mv.setAttribute('field-of-view',     '22deg');
        mv.setAttribute('environment-image', 'neutral');
        mv.setAttribute('exposure',          '1.5');
        mv.setAttribute('shadow-intensity',  '0');
        mv.setAttribute('interaction-prompt','none');
        mv.setAttribute('disable-zoom',      '');
        mv.style.cssText = [
          'position:absolute',
          'inset:0',
          'width:100%',
          'height:100%',
          'background:' + logo.color,
          '--progress-bar-height:0px',
          '--progress-bar-color:transparent',
        ].join(';');

        /* Красим материал под цвет карточки после загрузки */
        mv.addEventListener('load', (function(color) {
          return function() {
            try {
              var model = this.model;
              if (!model) return;
              var hex = color.replace('#','');
              var r = parseInt(hex.slice(0,2),16)/255;
              var g = parseInt(hex.slice(2,4),16)/255;
              var b = parseInt(hex.slice(4,6),16)/255;
              model.materials.forEach(function(mat) {
                mat.pbrMetallicRoughness.setBaseColorFactor([r,g,b,1]);
                mat.pbrMetallicRoughness.setRoughnessFactor(0.25);
                mat.pbrMetallicRoughness.setMetallicFactor(0.1);
              });
            } catch(e) {}
          };
        })(logo.color));

        /* SVG-логотип поверх */
        const img = document.createElement('img');
        img.src = logo.logo;
        img.crossOrigin = 'anonymous';
        img.style.cssText = [
          'position:absolute',
          'inset:0',
          'width:64%',
          'height:64%',
          'margin:auto',
          'top:0','left:0','right:0','bottom:0',
          'object-fit:contain',
          'pointer-events:none',
          'z-index:2',
          logo.filter ? 'filter:' + logo.filter : '',
        ].join(';');

        wrap.appendChild(mv);
        wrap.appendChild(img);
        container.appendChild(wrap);

        const z = 0.3 + Math.random() * 0.7;
        tiles.push({
          el:         wrap,
          mv:         mv,
          col, row, z,
          baseScale:  0.65 + z * 0.5,
          phase:      Math.random() * Math.PI * 2,
          baseRotZ:   (Math.random() - 0.5) * 20,
          swayPhase:  Math.random() * Math.PI * 2,
          tiltXPhase: Math.random() * Math.PI * 2,
          tiltYPhase: Math.random() * Math.PI * 2,
          orbitDir:   Math.random() < 0.5 ? 1 : -1,
        });
        idx++;
      }
    }

    animate(container, tiles);
  }

  function animate(container, tiles) {
    let lastTs = null;
    const half = TILE_SIZE / 2;

    function tick(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      const W = container.offsetWidth  || 800;
      const H = container.offsetHeight || 600;
      const cellW = W / COLS;
      const cellH = H / ROWS;

      tiles.forEach(t => {
        t.phase      += ORBIT_SPD  * dt * t.orbitDir;
        t.swayPhase  += SWAY_SPD   * dt;
        t.tiltXPhase += TILT_X_SPD * dt;
        t.tiltYPhase += TILT_Y_SPD * dt;

        const cx = cellW * t.col + cellW * 0.5;
        const cy = cellH * t.row + cellH * 0.5;
        const r  = ORBIT_R * (0.6 + t.z * 0.7);

        const px = cx + Math.cos(t.phase) * r - half;
        const py = cy + Math.sin(t.phase) * r - half;

        const rotZ = t.baseRotZ + Math.sin(t.swayPhase)  * SWAY_AMP;
        const rotX = Math.sin(t.tiltXPhase) * TILT_AMP;
        const rotY = Math.sin(t.tiltYPhase) * TILT_AMP;
        const sc   = t.baseScale;

        t.el.style.left      = px.toFixed(1) + 'px';
        t.el.style.top       = py.toFixed(1) + 'px';
        t.el.style.zIndex    = Math.round(t.z * 9);
        t.el.style.transform = `scale(${sc}) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`;

        /* Двигаем камеру model-viewer для живого 3D:
           theta — горизонтальный поворот (Y), phi — вертикальный (X)
           база phi=90deg (смотрим спереди), отклоняем на ±TILT_AMP */
        t.mv.cameraOrbit = `${rotY.toFixed(2)}deg ${(90 - rotX).toFixed(2)}deg 105%`;
      });

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
