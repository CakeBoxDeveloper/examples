/**
 * 3D-Common Library
 * Holographic cards + rays animations + tiles for 3D project portfolio pages
 */

// ============================================================================
// HSL to RGB Color Converter
// sat and l are 0-100 (percentages), h is 0-360 (degrees)
// ============================================================================
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100; // Convert to 0-1
  l = Math.max(0, Math.min(100, l)) / 100; // Convert to 0-1
  
  const hNorm = h / 360;
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    r = hueToRgb(p, q, hNorm + 1/3);
    g = hueToRgb(p, q, hNorm);
    b = hueToRgb(p, q, hNorm - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    hex: '#' + [r, g, b].map(x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')
  };
}

// ============================================================================
// RAYS ANIMATION
// ============================================================================
function initRays(canvasId, targetId, hue) {
  const canvas = document.getElementById(canvasId);
  const wrap = document.getElementById(targetId);
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const RAY_COUNT = 18;
  let t = 0, lastTs = 0;
  
  const color = hslToRgb(hue, 100, 95);
  const R = color.r;
  const G = color.g;
  const B = color.b;
  
  let dprApplied = false;

  function positionCanvas() {
    const rect = wrap.getBoundingClientRect();
    const heroRect = wrap.closest('.hero').getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.4;
    const cx = rect.left - heroRect.left + rect.width / 2;
    const cy = rect.top - heroRect.top + rect.height / 2;
    
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.style.left = (cx - size / 2) + 'px';
    canvas.style.top = (cy - size / 2) + 'px';
    
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(size * dpr);
    const h = Math.round(size * dpr);
    
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      dprApplied = false;
    }
    if (!dprApplied) {
      ctx.scale(dpr, dpr);
      dprApplied = true;
    }
  }

  window.addEventListener('resize', () => {
    dprApplied = false;
    positionCanvas();
  });
  
  positionCanvas();

  function draw(ts) {
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    t += dt * 0.001;
    
    const size = parseFloat(canvas.style.width) || canvas.offsetWidth;
    if (!size) {
      requestAnimationFrame(draw);
      return;
    }
    
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2 + 0.04 * Math.sin(t * 0.9 + i * 1.3);
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.8);
      const len = (0.21 + 0.05 * pulse) * size;
      const halfW = (6.24 + 12.48 * Math.sin(Math.PI * i / RAY_COUNT)) * (0.7 + 0.3 * pulse);
      
      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;
      const nx = Math.sin(angle);
      const ny = -Math.cos(angle);
      
      const alpha = (0.22 + 0.15 * pulse) * 0.14;
      const grad = ctx.createLinearGradient(cx, cy, ex, ey);
      grad.addColorStop(0, `rgba(${R},${G},${B},0)`);
      grad.addColorStop(0.2, `rgba(${R},${G},${B},${(alpha * 0.5).toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(${R},${G},${B},${alpha.toFixed(3)})`);
      grad.addColorStop(1, `rgba(${R},${G},${B},0)`);
      
      ctx.beginPath();
      ctx.moveTo(cx + nx, cy + ny);
      ctx.lineTo(ex + nx * halfW, ey + ny * halfW);
      ctx.lineTo(ex - nx * halfW, ey - ny * halfW);
      ctx.lineTo(cx - nx, cy - ny);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// ============================================================================
// HOLOGRAPHIC CARD
// ============================================================================
function initHoloCard(wrapId, logoUrl, hue) {
  function init() {
    const wrap = document.getElementById(wrapId);
    if (!wrap || typeof THREE === 'undefined') return;

    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;
    if (!W || !H) {
      requestAnimationFrame(init);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 6.5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const mainL = new THREE.DirectionalLight(0xffffff, 2.0);
    mainL.position.set(5, 5, 8);
    scene.add(mainL);
    const sideL = new THREE.DirectionalLight(0xeeeeee, 1.0);
    sideL.position.set(-5, -3, 4);
    scene.add(sideL);

    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1365;
    const ctx = cvs.getContext('2d');

    const holoCvs = document.createElement('canvas');
    holoCvs.width = 1024;
    holoCvs.height = 1365;
    const holoCtx = holoCvs.getContext('2d');

    const patCvs = document.createElement('canvas');
    patCvs.width = 1024;
    patCvs.height = 1365;
    const patCtx = patCvs.getContext('2d');

    const tex = new THREE.CanvasTexture(cvs);
    tex.anisotropy = 16;
    const holoTex = new THREE.CanvasTexture(holoCvs);
    holoTex.anisotropy = 16;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;
    let svgLoaded = false;

    class Sparkle {
      constructor() { this.reset(); }
      reset() {
        const pad = 60;
        this.x = pad + Math.random() * (cvs.width - pad * 2);
        this.y = pad + Math.random() * (cvs.height - pad * 2);
        this.maxR = 8 + Math.random() * 10;
        this.progress = 0;
        this.speed = 0.008 + Math.random() * 0.01;
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.015;
        this.delay = Math.random() * 180;
      }
      update() {
        if (this.delay > 0) { this.delay--; return; }
        this.progress += this.speed;
        this.rotation += this.rotSpeed;
        if (this.progress >= 1) this.reset();
      }
      draw(ctx) {
        if (this.delay > 0 || this.progress <= 0) return;
        const scale = Math.sin(this.progress * Math.PI);
        const r = this.maxR * scale;
        const ir = r * 0.22;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, -ir, r, 0);
        ctx.quadraticCurveTo(0, ir, 0, r);
        ctx.quadraticCurveTo(0, ir, -r, 0);
        ctx.quadraticCurveTo(0, -ir, 0, -r);
        ctx.closePath();
        const colHighlight = hslToRgb(hue, 100, 95);
        ctx.fillStyle = `rgb(${colHighlight.r},${colHighlight.g},${colHighlight.b})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, ir * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fill();
        ctx.restore();
      }
    }

    const sparkles = Array.from({ length: 5 }, () => new Sparkle());

    let patternReady = false;
    let shimmerOffset = -1.0;

    function drawBase() {
      if (!patternReady) return;
      const w = cvs.width;
      const h = cvs.height;

      const baseBg = hslToRgb(hue, 31, 9);
      ctx.fillStyle = `rgb(${baseBg.r},${baseBg.g},${baseBg.b})`;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.drawImage(patCvs, 0, 0);
      ctx.restore();

      ctx.save();
      const cr = 30;
      ctx.beginPath();
      ctx.moveTo(cr, 0);
      ctx.lineTo(w - cr, 0);
      ctx.quadraticCurveTo(w, 0, w, cr);
      ctx.lineTo(w, h - cr);
      ctx.quadraticCurveTo(w, h, w - cr, h);
      ctx.lineTo(cr, h);
      ctx.quadraticCurveTo(0, h, 0, h - cr);
      ctx.lineTo(0, cr);
      ctx.quadraticCurveTo(0, 0, cr, 0);
      ctx.closePath();
      ctx.clip();

      ctx.translate(0, h);
      ctx.rotate((-30 * Math.PI) / 180);
      const sW = w * 3;
      const cur = shimmerOffset * w * 3;
      const sg = ctx.createLinearGradient(cur - sW / 2, 0, cur + sW / 2, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.05)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(-w * 3, -h * 3, w * 7, h * 7);
      ctx.restore();

      sparkles.forEach((s) => { s.update(); s.draw(ctx); });
      tex.needsUpdate = true;
    }

    function updateHolo(rX, rY) {
      if (!svgLoaded) return;
      const w = holoCvs.width;
      const h = holoCvs.height;
      holoCtx.clearRect(0, 0, w, h);

      if (Math.hypot(rX, rY) < 0.001) {
        holoTex.needsUpdate = true;
        return;
      }

      const sp = document.createElement('canvas');
      sp.width = w;
      sp.height = h;
      const sc = sp.getContext('2d');
      sc.drawImage(patCvs, 0, 0);

      const shift = (rX * 0.5) % 1;
      const lg = sc.createLinearGradient(0, 0, w, h);
      [0, 45, 90, 135, 180].forEach((o, i) => {
        const col = hslToRgb(hue, 55, 70 + i * 5, (shift * 360 + o) % 360);
        lg.addColorStop(i / 4, `rgb(${col.r},${col.g},${col.b})`);
      });
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = lg;
      sc.fillRect(0, 0, w, h);

      const wvCvs = document.createElement('canvas');
      wvCvs.width = w;
      wvCvs.height = h;
      const wvCtx = wvCvs.getContext('2d');
      wvCtx.save();
      wvCtx.translate(w / 2, h / 2);
      wvCtx.rotate((45 * Math.PI) / 180);
      wvCtx.strokeStyle = 'rgba(220,220,220,0.8)';
      wvCtx.lineWidth = 2.5;
      const wSpc = 20;
      const rX2 = w * 2.5;
      const rY2 = h * 2.5;
      for (let yp = -rY2; yp < rY2; yp += wSpc) {
        wvCtx.beginPath();
        for (let xp = -rX2; xp < rX2; xp += 15) {
          const yo = Math.sin(xp / 30 + rX * 3) * 8;
          if (xp === -rX2) wvCtx.moveTo(xp, yp + yo);
          else wvCtx.lineTo(xp, yp + yo);
        }
        wvCtx.stroke();
      }
      wvCtx.restore();

      const waveShift = (-rY * 0.6) % 1;
      const wg = wvCtx.createLinearGradient(w, 0, 0, h);
      [[0, 0], [0.3, 40], [0.6, 90], [1.0, 140]].forEach(([s, o]) => {
        const dyn = (((waveShift + o / 360) % 1 + 1) % 1) * 360;
        const col = hslToRgb(hue, 55, 75 + s * 10, 60 + dyn);
        wg.addColorStop(s, `rgb(${col.r},${col.g},${col.b})`);
      });
      wvCtx.globalCompositeOperation = 'source-in';
      wvCtx.fillStyle = wg;
      wvCtx.fillRect(0, 0, w, h);

      holoCtx.save();
      holoCtx.globalAlpha = 0.25;
      holoCtx.drawImage(wvCvs, 0, 0);
      holoCtx.restore();

      holoCtx.save();
      holoCtx.globalAlpha = 0.7;
      holoCtx.drawImage(sp, 0, 0);
      holoCtx.restore();
      holoCtx.drawImage(sp, 0, 0);

      const lx = w * (0.5 + rX * 0.55);
      const ly = h * (0.5 + rY * 0.55);
      const rg = holoCtx.createRadialGradient(lx, ly, 0, lx, ly, w * 1.15);
      rg.addColorStop(0, 'rgba(255,255,255,1)');
      rg.addColorStop(0.3, 'rgba(255,255,255,0.7)');
      rg.addColorStop(0.6, 'rgba(255,255,255,0.3)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      holoCtx.globalCompositeOperation = 'destination-in';
      holoCtx.fillStyle = rg;
      holoCtx.fillRect(0, 0, w, h);

      const cr = 30;
      holoCtx.globalCompositeOperation = 'destination-in';
      holoCtx.beginPath();
      holoCtx.moveTo(cr, 0);
      holoCtx.lineTo(w - cr, 0);
      holoCtx.quadraticCurveTo(w, 0, w, cr);
      holoCtx.lineTo(w, h - cr);
      holoCtx.quadraticCurveTo(w, h, w - cr, h);
      holoCtx.lineTo(cr, h);
      holoCtx.quadraticCurveTo(0, h, 0, h - cr);
      holoCtx.lineTo(0, cr);
      holoCtx.quadraticCurveTo(0, 0, cr, 0);
      holoCtx.closePath();
      holoCtx.fill();
      holoCtx.globalCompositeOperation = 'source-over';
      holoTex.needsUpdate = true;
    }

    const cW = 2.4;
    const cH = 3.2;
    const depth = 0.08;
    const cr = 0.08;
    const shape = new THREE.Shape();
    const sx = -cW / 2;
    const sy = -cH / 2;

    shape.moveTo(sx + cr, sy);
    shape.lineTo(sx + cW - cr, sy);
    shape.quadraticCurveTo(sx + cW, sy, sx + cW, sy + cr);
    shape.lineTo(sx + cW, sy + cH - cr);
    shape.quadraticCurveTo(sx + cW, sy + cH, sx + cW - cr, sy + cH);
    shape.lineTo(sx + cr, sy + cH);
    shape.quadraticCurveTo(sx, sy + cH, sx, sy + cH - cr);
    shape.lineTo(sx, sy + cr);
    shape.quadraticCurveTo(sx, sy, sx + cr, sy);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015
    });

    geo.center();
    geo.computeBoundingBox();

    const bbox = geo.boundingBox;
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);

    for (let i = 0; i < pos.count; i++) {
      uvs[i * 2] = (pos.getX(i) - bbox.min.x) / (bbox.max.x - bbox.min.x);
      uvs[i * 2 + 1] = (pos.getY(i) - bbox.min.y) / (bbox.max.y - bbox.min.y);
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const baseCol = hslToRgb(hue, 35, 9);
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`rgb(${baseCol.r},${baseCol.g},${baseCol.b})`),
      roughness: 0.6,
      metalness: 0.1
    });
    const frontMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.9,
      metalness: 0.0
    });

    const card = new THREE.Mesh(geo, [frontMat, baseMat]);
    scene.add(card);

    const holoGeo = new THREE.PlaneGeometry(cW + 0.03, cH + 0.03);
    const holoMat = new THREE.MeshBasicMaterial({
      map: holoTex,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    const holoMesh = new THREE.Mesh(holoGeo, holoMat);
    holoMesh.position.z = depth / 2 + 0.016;
    card.add(holoMesh);

    img.onload = function () {
      svgLoaded = true;

      const w = patCvs.width;
      const h = patCvs.height;
      patCtx.clearRect(0, 0, w, h);
      patCtx.save();
      patCtx.translate(w / 2, h / 2);
      patCtx.rotate((-30 * Math.PI) / 180);

      const cell = 180;
      const nw = img.naturalWidth || cell;
      const nh = img.naturalHeight || cell;
      const ratio = nw / nh;
      const iW = ratio >= 1 ? cell : cell * ratio;
      const iH = ratio >= 1 ? cell / ratio : cell;
      const gX = 280;
      const gY = 280;

      for (let r = -15; r < 15; r++) {
        for (let c = -12; c < 12; c++) {
          const offX = r % 2 !== 0 ? gX / 2 : 0;
          patCtx.drawImage(img, c * gX + offX - iW / 2, r * gY - iH / 2, iW, iH);
        }
      }
      patCtx.restore();

      patCtx.save();
      patCtx.globalCompositeOperation = 'source-in';
      patCtx.fillStyle = 'white';
      patCtx.fillRect(0, 0, w, h);
      patCtx.restore();

      patternReady = true;
      drawBase();

      const loader = new THREE.SVGLoader();
      loader.load(logoUrl, (data) => {
        const logoGroup = new THREE.Group();
        const logoCol = hslToRgb(hue, 100, 95);
        const logoMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`rgb(${logoCol.r},${logoCol.g},${logoCol.b})`),
          metalness: 0.75,
          roughness: 0.2,
          side: THREE.DoubleSide
        });

        data.paths.forEach((path) => {
          THREE.SVGLoader.createShapes(path).forEach((shape) => {
            const g = new THREE.ExtrudeGeometry(shape, {
              depth: 40,
              bevelEnabled: true,
              bevelSegments: 4,
              steps: 2,
              bevelSize: 3,
              bevelThickness: 3
            });
            g.computeVertexNormals();
            logoGroup.add(new THREE.Mesh(g, logoMat));
          });
        });

        const box = new THREE.Box3().setFromObject(logoGroup);
        const center = box.getCenter(new THREE.Vector3());
        logoGroup.children.forEach((c) => c.geometry.translate(-center.x, -center.y, -center.z));

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y) || 1;
        const targetSize = 1.1;
        const s = targetSize / maxDim;

        logoGroup.scale.set(s * 1.3, -s * 1.3, s * 1.3);
        logoGroup.position.set(0, 0.12, depth / 2 + 0.04);
        card.add(logoGroup);
      });
    };

    const MAX_ROT = 0.75;
    let isDrag = false;
    let tRX = 0;
    let tRY = 0;
    let cRX = 0;
    let cRY = 0;
    let idle = 0;

    function onDown() { isDrag = true; }
    function onMove(e) {
      if (!isDrag) return;
      const cx = e.clientX || (e.touches && e.touches[0].clientX);
      const cy = e.clientY || (e.touches && e.touches[0].clientY);
      const rect = wrap.getBoundingClientRect();

      if (cx !== undefined) {
        tRY = Math.max(-MAX_ROT, Math.min(MAX_ROT, ((cx - rect.left) / rect.width - 0.5) * 2 * 1.0));
        tRX = Math.max(-MAX_ROT, Math.min(MAX_ROT, ((cy - rect.top) / rect.height - 0.5) * 2 * 0.9));
      }
    }
    function onUp() { isDrag = false; tRX = 0; tRY = 0; }

    wrap.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    wrap.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    function animate() {
      requestAnimationFrame(animate);

      shimmerOffset += 0.012;
      if (shimmerOffset > 2.0) shimmerOffset = -1.0;

      drawBase();
      const baseBg = hslToRgb(hue, 35, 9);
      baseMat.color.set(`rgb(${baseBg.r},${baseBg.g},${baseBg.b})`);

      idle += 0.015;
      const atX = isDrag ? tRX : Math.sin(idle * 0.8) * 0.12;
      const atY = isDrag ? tRY : Math.cos(idle * 0.6) * 0.18;
      const lf = isDrag ? 0.15 : 0.05;

      cRX += (atX - cRX) * lf;
      cRY += (atY - cRY) * lf;

      cRX = Math.max(-MAX_ROT, Math.min(MAX_ROT, cRX));
      cRY = Math.max(-MAX_ROT, Math.min(MAX_ROT, cRY));

      card.rotation.x = cRX;
      card.rotation.y = cRY;

      updateHolo(cRY / 1.0, cRX / 0.9);

      renderer.render(scene, camera);
    }

    animate();
  }

  requestAnimationFrame(init);
}

// ============================================================================
// ORBITING TILES
// ============================================================================
function initTiles(canvasId, configs) {
  if (typeof THREE === 'undefined') {
    console.error('THREE not defined for tiles');
    return;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error('Canvas not found:', canvasId);
    return;
  }

  const hero = canvas.closest('.hero');
  if (!hero) {
    console.error('Hero section not found');
    return;
  }

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    camera.left = -canvas.width / 2;
    camera.right = canvas.width / 2;
    camera.top = canvas.height / 2;
    camera.bottom = -canvas.height / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  camera.position.z = 500;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 1.6);
  dir.position.set(200, 300, 400);
  scene.add(dir);

  const rim = new THREE.DirectionalLight(0xeeeeee, 0.3);
  rim.position.set(-200, -100, 100);
  scene.add(rim);

  resize();
  window.addEventListener('resize', resize);

  const TILE_S = 70;
  const DEPTH = 8;
  const COUNT = 8;

  function makeTileGeo(size, r, d) {
    const hw = size / 2;
    const shape = new THREE.Shape();

    shape.moveTo(-hw + r, -hw);
    shape.lineTo(hw - r, -hw);
    shape.quadraticCurveTo(hw, -hw, hw, -hw + r);
    shape.lineTo(hw, hw - r);
    shape.quadraticCurveTo(hw, hw, hw - r, hw);
    shape.lineTo(-hw + r, hw);
    shape.quadraticCurveTo(-hw, hw, -hw, hw - r);
    shape.lineTo(-hw, -hw + r);
    shape.quadraticCurveTo(-hw, -hw, -hw + r, -hw);

    return new THREE.ExtrudeGeometry(shape, {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 1.5,
      bevelThickness: 1.5
    });
  }

  const tileGeo = makeTileGeo(TILE_S, 10, DEPTH);

  const logoMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffffff),
    metalness: 0.6,
    roughness: 0.2,
    side: THREE.DoubleSide
  });

  const tiles = [];
  let loadedCount = 0;

  function buildTiles() {
    for (let i = 0; i < COUNT * 2; i++) {
      const cfg = configs[Math.floor(i / 2) % configs.length];
      const tile = new THREE.Group();

      const bodyCol = hslToRgb(cfg.hue, 35, 8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`rgb(${bodyCol.r},${bodyCol.g},${bodyCol.b})`),
        roughness: 0.5,
        metalness: 0.15
      });

      const body = new THREE.Mesh(tileGeo.clone(), bodyMat);
      body.position.z = 0;
      tile.add(body);

      const side = i < COUNT ? -1 : 1;
      tile.userData = {
        side,
        phase: Math.random() * Math.PI * 2,
        swayPhase: Math.random() * Math.PI * 2,
        tiltX: Math.random() * Math.PI * 2,
        tiltY: Math.random() * Math.PI * 2,
        orbitDir: Math.random() < 0.5 ? 1 : -1,
        z: 0.3 + Math.random() * 0.7
      };

      scene.add(tile);
      tiles.push(tile);
    }
  }

  // Load SVG logos
  const loader = new THREE.SVGLoader();
  let logoGroups = {};

  configs.forEach((cfg, idx) => {
    if (logoGroups[cfg.hue]) return; // Already loaded
    
    loader.load(cfg.svgUrl, (data) => {
      const grp = new THREE.Group();
      const logoCol = hslToRgb(cfg.hue, 100, 55);
      const colorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`rgb(${logoCol.r},${logoCol.g},${logoCol.b})`),
        metalness: 0.6,
        roughness: 0.2,
        side: THREE.DoubleSide
      });

      data.paths.forEach((path) => {
        THREE.SVGLoader.createShapes(path).forEach((shape) => {
          const g = new THREE.ExtrudeGeometry(shape, {
            depth: 12,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 2,
            bevelThickness: 2
          });
          g.computeVertexNormals();
          grp.add(new THREE.Mesh(g, colorMat));
        });
      });

      const box = new THREE.Box3().setFromObject(grp);
      const ctr = box.getCenter(new THREE.Vector3());
      const sz = new THREE.Vector3();
      box.getSize(sz);

      grp.children.forEach((c) => c.geometry.translate(-ctr.x, -ctr.y, -ctr.z));

      const maxD = Math.max(sz.x, sz.y) || 1;
      const s = (TILE_S * 0.6) / maxD;
      grp.scale.set(s, -s, s);
      grp.position.z = DEPTH + 2;

      logoGroups[cfg.hue] = grp;
      loadedCount++;

      if (loadedCount === new Set(configs.map(c => c.hue)).size) {
        // All unique hues loaded
        tiles.forEach((tile, idx) => {
          const cfg = configs[Math.floor(idx / 2) % configs.length];
          const logo = logoGroups[cfg.hue];
          if (logo) tile.add(logo.clone());
        });
      }
    });
  });

  buildTiles();

  const ORBIT_R = 28;
  const ORBIT_SPD = 0.00035;
  const SWAY_AMP = (48 * Math.PI) / 180;
  const SWAY_SPD = 0.0006;
  const TILT_AMP = (48 * Math.PI) / 180;
  const TILT_SPD = 0.00042;

  let last = null;

  function animate(ts) {
    requestAnimationFrame(animate);

    if (!last) last = ts;
    const dt = Math.min(ts - last, 50);
    last = ts;

    const W = canvas.width;
    const H = canvas.height;
    const centerW = W / 3;
    const sideW = (W - centerW) / 2;
    const PAD_X = TILE_S * 0.7;
    const PAD_Y = TILE_S * 1.2;
    const cols = 2;
    const rows = 3;
    const cellW = (sideW - PAD_X * 2) / cols;
    const cellH = (H - PAD_Y * 2) / rows;

    tiles.forEach((tile, idx) => {
      const d = tile.userData;
      d.phase += ORBIT_SPD * dt * d.orbitDir;
      d.swayPhase += SWAY_SPD * dt;
      d.tiltX += TILT_SPD * dt;
      d.tiltY += TILT_SPD * 0.9 * dt;

      const localIdx = idx % COUNT;
      const col = localIdx % cols;
      const row = Math.floor(localIdx / cols);

      let cx, cy;
      if (d.side === -1) {
        cx = -(W / 2) + PAD_X + col * cellW + cellW / 2;
      } else {
        cx = centerW / 2 + PAD_X + col * cellW + cellW / 2;
      }

      cy = H / 2 - PAD_Y - row * cellH - cellH / 2;

      const r = ORBIT_R * (0.6 + d.z * 0.7);
      tile.position.x = cx + Math.cos(d.phase) * r;
      tile.position.y = cy + Math.sin(d.phase) * r;
      tile.position.z = d.z * 20 - 10;

      tile.rotation.z = Math.sin(d.swayPhase) * SWAY_AMP;
      tile.rotation.x = Math.sin(d.tiltX) * TILT_AMP;
      tile.rotation.y = Math.sin(d.tiltY) * TILT_AMP;
    });

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

// ============================================================================
// LOTTIE + PAGE UTILITIES
// ============================================================================
function initLottie(topbarLottieId, loaderLottieId, animationUrl) {
  if (typeof lottie === 'undefined') return;

  lottie.loadAnimation({
    container: document.getElementById(topbarLottieId),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationUrl
  });

  lottie.loadAnimation({
    container: document.getElementById(loaderLottieId),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationUrl
  });
}

function initPageLoader(loaderId) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById(loaderId);
      if (loader) loader.classList.add('is-hidden');
    }, 500);
  });
}

function initTopbarScroll(topbarId) {
  const topbar = document.getElementById(topbarId);
  if (!topbar) return;

  let lastY = 0;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y > lastY && y > 60) {
        topbar.classList.add('is-hidden');
      } else {
        topbar.classList.remove('is-hidden');
      }
      lastY = y;
    },
    { passive: true }
  );
}
