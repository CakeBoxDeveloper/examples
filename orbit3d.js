/* orbit3d.js — UMD, THREE r128, каждый GLB со своей текстурой */
(async function () {
  if (typeof THREE === 'undefined') { console.warn('THREE not loaded'); return; }

  /* Каждый GLB содержит запечённую текстуру */
  const PLATES = [
    'Plate_panacea.glb',
    'Plate_ttm.glb',
    'Plate_prism.glb',
    'Plate_lacar.glb',
    'Plate_glitch.glb',
    'Plate_mse.glb',
  ];

  const COLS = 4, ROWS = 3;
  const ORBIT_R    = 40;
  const ORBIT_SPD  = 0.00035;
  const SWAY_AMP   = 12 * Math.PI / 180;
  const SWAY_SPD   = 0.0007;
  const TILT_AMP   = 8  * Math.PI / 180;
  const TILT_X_SPD = 0.0005;
  const TILT_Y_SPD = 0.00043;

  /* ── Загружаем GLB, возвращаем { geom, mat } ── */
  function loadPlate(url) {
    return new Promise(function(resolve) {
      if (typeof THREE.GLTFLoader === 'undefined') { resolve(null); return; }
      var loader = new THREE.GLTFLoader();
      loader.load(url, function(gltf) {
        var result = null;
        gltf.scene.traverse(function(child) {
          if (!result && child.isMesh) {
            var geom = child.geometry.clone();
            var mat  = child.material.clone ? child.material.clone() : child.material;

            /* Нормализуем геометрию */
            geom.computeBoundingBox();
            var box    = geom.boundingBox;
            var center = new THREE.Vector3(); box.getCenter(center);
            var size   = new THREE.Vector3(); box.getSize(size);
            var maxDim = Math.max(size.x, size.y, size.z) || 1;
            geom.translate(-center.x, -center.y, -center.z);
            geom.scale(1/maxDim, 1/maxDim, 1/maxDim);

            /* Поворачиваем лицом к камере */
            geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

            result = { geom: geom, mat: mat };
          }
        });
        resolve(result);
      }, null, function(err) {
        console.warn('Failed to load', url, err);
        resolve(null);
      });
    });
  }

  /* Фоллбэк материал если GLB не загрузился */
  function fallbackMat(idx) {
    var colors = [0xe8ddd0, 0x3d0f1a, 0x1a0505, 0x000000, 0x0000ff, 0x000000];
    return new THREE.MeshStandardMaterial({
      color: colors[idx % colors.length],
      roughness: 0.3, metalness: 0.1
    });
  }

  /* ── Ждём DOM ── */
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r));
  }

  var canvas = document.getElementById('orbitCanvas');
  if (!canvas) return;
  var sec = canvas.parentElement;

  /* ── Renderer ── */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.setSize(sec.offsetWidth, sec.offsetHeight);

  /* ── Ортокамера ── */
  var W = sec.offsetWidth, H = sec.offsetHeight;
  var cam = new THREE.OrthographicCamera(-W/2, W/2, H/2, -H/2, 1, 1000);
  cam.position.z = 500;

  /* ── Сцена + свет ── */
  var scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  var dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(200, 300, 400);
  dir.castShadow = true;
  dir.shadow.mapSize.set(512, 512);
  scene.add(dir);

  var rim = new THREE.DirectionalLight(0x8899ff, 0.35);
  rim.position.set(-200, -100, 100);
  scene.add(rim);

  /* ── Загружаем все GLB параллельно ── */
  var plateData = await Promise.all(PLATES.map(loadPlate));

  /* ── Фоллбэк геометрия ── */
  var fallbackGeom = new THREE.BoxGeometry(1, 0.12, 1);

  /* ── Строим плитки ── */
  var tiles = [];
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var idx  = (row * COLS + col) % PLATES.length;
      var data = plateData[idx];

      var geom = data ? data.geom.clone() : fallbackGeom.clone();
      var mat  = data ? data.mat         : fallbackMat(idx);

      var mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;

      var z  = 0.3 + Math.random() * 0.7;
      var ts = 42 + z * 22;
      mesh.scale.set(ts, ts, ts);
      scene.add(mesh);

      tiles.push({
        mesh: mesh, col: col, row: row, z: z,
        phase:      Math.random() * Math.PI * 2,
        phaseRot:   (Math.random() - 0.5) * Math.PI / 6,
        swayPhase:  Math.random() * Math.PI * 2,
        tiltXPhase: Math.random() * Math.PI * 2,
        tiltYPhase: Math.random() * Math.PI * 2,
        orbitDir:   Math.random() < 0.5 ? 1 : -1,
      });
    }
  }

  /* ── Resize ── */
  window.addEventListener('resize', function() {
    var w = sec.offsetWidth, h = sec.offsetHeight;
    renderer.setSize(w, h);
    cam.left = -w/2; cam.right  =  w/2;
    cam.top  =  h/2; cam.bottom = -h/2;
    cam.updateProjectionMatrix();
  });

  /* ── Анимация ── */
  var lastTs = null;
  function animate(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = Math.min(ts - lastTs, 50);
    lastTs = ts;

    var W2 = sec.offsetWidth, H2 = sec.offsetHeight;
    var cellW = W2 / COLS, cellH = H2 / ROWS;

    tiles.forEach(function(t) {
      t.phase      += ORBIT_SPD  * dt * t.orbitDir;
      t.swayPhase  += SWAY_SPD   * dt;
      t.tiltXPhase += TILT_X_SPD * dt;
      t.tiltYPhase += TILT_Y_SPD * dt;

      var cx = cellW * t.col + cellW * 0.5 - W2 / 2;
      var cy = H2 / 2 - (cellH * t.row + cellH * 0.5);
      var r  = ORBIT_R * (0.6 + t.z * 0.7);

      t.mesh.position.set(
        cx + Math.cos(t.phase) * r,
        cy + Math.sin(t.phase) * r,
        t.z * 20 - 10
      );
      t.mesh.rotation.z = t.phaseRot + Math.sin(t.swayPhase)  * SWAY_AMP;
      t.mesh.rotation.x = Math.sin(t.tiltXPhase) * TILT_AMP;
      t.mesh.rotation.y = Math.sin(t.tiltYPhase) * TILT_AMP;
    });

    renderer.render(scene, cam);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

})();
