/* orbit3d.js — UMD, THREE r128 */
(async function () {
  if (typeof THREE === 'undefined') { console.warn('THREE not loaded'); return; }

  const BASE = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/';

  const PLATES = [
    { file: 'MSE.glb',    rotX:  Math.PI/2,  rotY: 0 },
    { file: 'MSE.glb',    rotX: -Math.PI/2,  rotY: 0 },
    { file: 'MSE.glb',    rotX:  Math.PI/2,  rotY: Math.PI },
    { file: 'MSE.glb',    rotX: -Math.PI/2,  rotY: Math.PI },
    { file: 'Glitch.glb', rotX: -Math.PI/2,  rotY: 0 },
    { file: 'Prism.glb',  rotX: -Math.PI/2,  rotY: 0 },
  ];

  const COLS = 4, ROWS = 3;
  const ORBIT_R    = 40;
  const ORBIT_SPD  = 0.00035;
  const SWAY_AMP   = 12 * Math.PI / 180;
  const SWAY_SPD   = 0.0007;
  const TILT_AMP   = 8  * Math.PI / 180;
  const TILT_X_SPD = 0.0005;
  const TILT_Y_SPD = 0.00043;

  /* ── Загружаем GLB — берём первый меш, нормализуем геометрию ── */
  function loadPlate(plate) {
    return new Promise(function(resolve) {
      if (typeof THREE.GLTFLoader === 'undefined') { resolve(null); return; }
      var loader = new THREE.GLTFLoader();

      function tryLoad(src, fallbackSrc) {
        loader.load(src, function(gltf) {
          var result = null;
          gltf.scene.traverse(function(child) {
            if (!result && child.isMesh) {
              var geom = child.geometry.clone();
              var mat  = child.material.clone ? child.material.clone() : child.material;

              // Центрируем
              geom.computeBoundingBox();
              var center = new THREE.Vector3();
              geom.boundingBox.getCenter(center);
              geom.translate(-center.x, -center.y, -center.z);

              // Нормализуем в единичный куб
              geom.computeBoundingBox();
              var size = new THREE.Vector3();
              geom.boundingBox.getSize(size);
              var maxDim = Math.max(size.x, size.y, size.z) || 1;
              geom.scale(1/maxDim, 1/maxDim, 1/maxDim);

              // Поворот
              geom.applyMatrix4(new THREE.Matrix4().makeRotationX(plate.rotX));
              if (plate.rotY) geom.applyMatrix4(new THREE.Matrix4().makeRotationY(plate.rotY));

              result = { geom: geom, mat: mat };
            }
          });
          resolve(result);
        }, null, function() {
          if (fallbackSrc) tryLoad(fallbackSrc, null);
          else resolve(null);
        });
      }

      var remote = BASE + plate.file;
      tryLoad(remote, null);
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

  /* ── Загружаем GLB ── */
  var plateData = await Promise.all(PLATES.map(loadPlate));

  /* ── Строим плитки ── */
  var tiles = [];
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var idx  = (row * COLS + col) % PLATES.length;
      var data = plateData[idx];

      var mesh;
      if (data) {
        mesh = new THREE.Mesh(data.geom.clone(), data.mat);
      } else {
        var colors = [0x111111, 0x3d0f1a, 0x1a0505, 0x000000, 0x0000ff, 0x000000];
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.12, 1),
          new THREE.MeshStandardMaterial({ color: colors[idx % colors.length] })
        );
      }
      mesh.castShadow = true;

      var z  = 0.3 + Math.random() * 0.7;
      var ts = 42 + z * 22; // размер в px (ортокамера 1unit=1px)
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
      t.mesh.rotation.z = t.phaseRot + Math.sin(t.swayPhase) * SWAY_AMP;
      t.mesh.rotation.x = Math.sin(t.tiltXPhase) * TILT_AMP;
      t.mesh.rotation.y = Math.sin(t.tiltYPhase) * TILT_AMP;
    });

    renderer.render(scene, cam);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

})();

/* DEBUG — удали после настройки */
window._debugPlate = function() {
  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') return;
  new THREE.GLTFLoader().load('https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/MSE.glb', function(gltf) {
    gltf.scene.traverse(function(child) {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        var b = child.geometry.boundingBox;
        var s = new THREE.Vector3(); b.getSize(s);
        var c = new THREE.Vector3(); b.getCenter(c);
        console.log('MSE.glb mesh:', child.name);
        console.log('  size:', s.x.toFixed(3), s.y.toFixed(3), s.z.toFixed(3));
        console.log('  center:', c.x.toFixed(3), c.y.toFixed(3), c.z.toFixed(3));
      }
    });
  });
};
