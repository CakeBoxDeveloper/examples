/* orbit3d.js — UMD, THREE r128 */
(async function () {
  if (typeof THREE === 'undefined') { console.warn('THREE not loaded'); return; }

  const BASE = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/';

  function isLight() {
    return document.body.classList.contains('theme-light');
  }

  function desaturate(color) {
    var c = color.clone();
    var hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    c.setHSL(hsl.h, 0, Math.min(hsl.l * 0.85 + 0.1, 0.75));
    return c;
  }

  function invertForLight(color) {
    // Для светлой темы: подложка → светло-серая, лого → тёмно-серое
    // meshIndex передаётся отдельно через colorForLight
    var c = color.clone();
    return c;
  }

  function colorForLight(color, meshIndex) {
    var c = color.clone();
    if (meshIndex === 0) {
      // Подложка — средне-серая
      c.setHSL(0, 0, 0.68);
    } else {
      // Логотип — тёмно-серый
      c.setHSL(0, 0, 0.32);
    }
    return c;
  }

  const PLATES = [
    { file: 'MSE.glb'    },
    { file: 'LC.glb'     },
    { file: 'TTM.glb'    },
    { file: 'Panacea.glb'},
    { file: 'Prism.glb'  },
    { file: 'Glitch.glb' },
    { file: 'Kremua.glb' },
  ];

  const COLS = 4, ROWS = 3;
  const ORBIT_R    = 40;
  const ORBIT_SPD  = 0.00035;
  const SWAY_AMP   = 38 * Math.PI / 180;
  const SWAY_SPD   = 0.0006;
  const TILT_AMP   = 48  * Math.PI / 180;
  const TILT_X_SPD = 0.00045;
  const TILT_Y_SPD = 0.00038;

  /* ── Загружаем GLB ── */
  function loadPlate(plate) {
    return new Promise(function(resolve) {
      if (typeof THREE.GLTFLoader === 'undefined') { resolve(null); return; }
      var loader = new THREE.GLTFLoader();

      function tryLoad(src, fallbackSrc) {
        loader.load(src, function(gltf) {
          var meshes = [];
          gltf.scene.updateMatrixWorld(true);
          gltf.scene.traverse(function(child) {
            if (!child.isMesh) return;
            var geom = child.geometry.clone();
            geom.applyMatrix4(child.matrixWorld);
            // Клонируем материал как есть — цвет из GLB сохраняется
            var mat = Array.isArray(child.material)
              ? child.material.map(function(m) { return m.clone(); })
              : child.material.clone();
            // Сохраняем оригинальный цвет в userData материала
            var mats = Array.isArray(mat) ? mat : [mat];
            mats.forEach(function(m) {
              m.userData.origColor = m.color.clone();
            });
            meshes.push({ geom: geom, mat: mat, name: child.name });
          });

          if (meshes.length === 0) { resolve(null); return; }

          // Общий bbox для нормализации
          var box = new THREE.Box3();
          meshes.forEach(function(item) {
            item.geom.computeBoundingBox();
            box.union(item.geom.boundingBox);
          });
          var center = new THREE.Vector3();
          box.getCenter(center);
          var size = new THREE.Vector3();
          box.getSize(size);
          var maxDim = Math.max(size.x, size.y, size.z) || 1;

          var tCenter = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z);
          var tScale  = new THREE.Matrix4().makeScale(1/maxDim, 1/maxDim, 1/maxDim);
          var final   = new THREE.Matrix4().multiplyMatrices(tScale, tCenter);

          var group = new THREE.Group();
          group.userData.maxDim = 1;
          meshes.forEach(function(item) {
            item.geom.applyMatrix4(final);
            var m = new THREE.Mesh(item.geom, item.mat);
            m.name = item.name;
            group.add(m);
          });

          resolve(group);
        }, null, function(err) {
          console.error('Failed to load:', src, err);
          if (fallbackSrc) tryLoad(fallbackSrc, null);
          else resolve(null);
        });
      }

      tryLoad(BASE + plate.file, './' + plate.file);
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
  var rim = new THREE.DirectionalLight(0x88ff99, 0.35);
  rim.position.set(-200, -100, 100);
  scene.add(rim);

  // В светлой теме убираем зелёный rim
  function updateLights() {
    rim.intensity = isLight() ? 0 : 0.35;
  }
  updateLights();
  new MutationObserver(function() { updateLights(); recolorAll(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* ── Загружаем GLB ── */
  var plateData = await Promise.all(PLATES.map(loadPlate));

  /* ── Строим плитки ── */
  var tiles = [];
  var plateIdx = 0;

  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      // Пропускаем центральные 2 ячейки средней строки
      if (row === 1 && (col === 1 || col === 2)) continue;

      var idx  = (plateIdx++) % PLATES.length;
      var data = plateData[idx];
      if (!data) {
        for (var fi = 0; fi < plateData.length; fi++) {
          if (plateData[fi]) { data = plateData[fi]; break; }
        }
      }
      if (!data) continue;

      var mesh = data.clone();
      mesh.castShadow = true;
      mesh.traverse(function(c) { if (c.isMesh) c.castShadow = true; });

      var z  = 0.3 + Math.random() * 0.7;
      var ts = 42 + z * 22;
      var md = (mesh.userData && mesh.userData.maxDim) ? mesh.userData.maxDim : 1;
      mesh.scale.set(ts / md, ts / md, ts / md);
      scene.add(mesh);

      tiles.push({
        mesh:       mesh,
        col:        col,
        row:        row,
        z:          z,
        baseRotX:   PLATES[idx].rotX !== undefined ? PLATES[idx].rotX : Math.PI,
        baseRotZ:   PLATES[idx].rotZ !== undefined ? PLATES[idx].rotZ : 0,
        phase:      Math.random() * Math.PI * 2,
        phaseRot:   (Math.random() - 0.5) * Math.PI / 18,
        swayPhase:  Math.random() * Math.PI * 2,
        tiltXPhase: Math.random() * Math.PI * 2,
        tiltYPhase: Math.random() * Math.PI * 2,
        orbitDir:   Math.random() < 0.5 ? 1 : -1,
      });
    }
  }

  /* ── Desaturate при смене темы ── */
  function recolorAll() {
    var light = isLight();
    tiles.forEach(function(t) {
      var meshIdx = 0;
      t.mesh.traverse(function(child) {
        if (!child.isMesh) return;
        var mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(function(m) {
          if (!m || !m.color) return;
          var orig = m.userData.origColor;
          if (!orig) return;
          m.color.copy(light ? colorForLight(orig, meshIdx) : orig);
        });
        meshIdx++;
      });
    });
  }

  recolorAll();

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
      t.mesh.rotation.z = t.baseRotZ + t.phaseRot + Math.sin(t.swayPhase) * SWAY_AMP;
      t.mesh.rotation.x = t.baseRotX + Math.sin(t.tiltXPhase) * TILT_AMP;
      t.mesh.rotation.y = Math.sin(t.tiltYPhase) * TILT_AMP;
    });

    renderer.render(scene, cam);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

})();
