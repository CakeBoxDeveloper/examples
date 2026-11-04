/* orbit3d.js — UMD, THREE r128 */
(async function () {
  if (typeof THREE === 'undefined') { console.warn('THREE not loaded'); return; }

  const BASE = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/';

  // Цвета: [фон (slot 0 — Base/Cube), лого (slot 1 — SVG/Logo)]
  // slot определяется порядком материала в массиве child.material[]
  // или по имени если меш один с мультиматериалом
  const PALETTE = {
    'MSE.glb':    { bg: '#0a0a0a', logo: '#ffffff' },
    'LC.glb':     { bg: '#0a0a0a', logo: '#f0c000' },
    'TTM.glb':    { bg: '#1a4a6b', logo: '#ffffff' },
    'Panacea.glb':{ bg: '#e8ddd0', logo: '#3d2a1a' },
    'Prism.glb':  { bg: '#2a0a10', logo: '#cc2233' },
    'Glitch.glb': { bg: '#0a1a3a', logo: '#ffffff' },
  };

  const PLATES = [
    { file: 'MSE.glb'     },
    { file: 'LC.glb'      },
    { file: 'TTM.glb'     },
    { file: 'Panacea.glb' },
    { file: 'Prism.glb'   },
    { file: 'Glitch.glb'  },
  ];

  const COLS = 4, ROWS = 3;
  const ORBIT_R    = 40;
  const ORBIT_SPD  = 0.00035;
  const SWAY_AMP   = 18 * Math.PI / 180;
  const SWAY_SPD   = 0.0006;
  const TILT_AMP   = 22  * Math.PI / 180;
  const TILT_X_SPD = 0.00045;
  const TILT_Y_SPD = 0.00038;

  // Применяем палитру к мешам группы
  // Логика: у каждой модели 2 меша (фон и лого), сортируем по bbox-площади:
  // больший меш = фон, меньший = лого
  function applyPalette(meshes, palette) {
    if (!palette || meshes.length === 0) return;

    // Считаем площадь bbox каждого меша
    var sized = meshes.map(function(item) {
      item.geom.computeBoundingBox();
      var s = new THREE.Vector3();
      item.geom.boundingBox.getSize(s);
      return { item: item, area: s.x * s.z };
    });
    sized.sort(function(a, b) { return b.area - a.area; });

    // Первый (большой) = фон, остальные = лого
    sized.forEach(function(entry, i) {
      var mats = Array.isArray(entry.item.mat) ? entry.item.mat : [entry.item.mat];
      var color = i === 0 ? palette.bg : palette.logo;
      mats.forEach(function(m) {
        if (!m) return;
        m.color.set(color);
        m.roughness = 0.88;
        m.metalness = 0.04;
      });
    });
  }

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
            if (child.isMesh) {
              var geom = child.geometry.clone();
              geom.applyMatrix4(child.matrixWorld);
              var mat;
              if (Array.isArray(child.material)) {
                mat = child.material.map(function(m) { return m.clone ? m.clone() : m; });
              } else {
                mat = child.material.clone ? child.material.clone() : child.material;
              }
              meshes.push({ geom: geom, mat: mat });
            }
          });

          if (meshes.length === 0) { resolve(null); return; }

          // Красим по палитре
          applyPalette(meshes, PALETTE[plate.file]);

          // Считаем общий bbox
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

          // Центрируем и нормализуем
          var tCenter = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z);
          var tScale  = new THREE.Matrix4().makeScale(1/maxDim, 1/maxDim, 1/maxDim);
          var final   = new THREE.Matrix4().multiply(tScale).multiply(tCenter);

          var group = new THREE.Group();
          meshes.forEach(function(item) {
            item.geom.applyMatrix4(final);
            var m = new THREE.Mesh(item.geom, item.mat);
            group.add(m);
          });

          group.userData.maxDim = 1;

          resolve(group);
        }, null, function() {
          if (fallbackSrc) tryLoad(fallbackSrc, null);
          else resolve(null);
        });
      }

      var remote = BASE + plate.file;
      var local  = './' + plate.file;
      tryLoad(remote, local);
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
        mesh = data.clone();
      } else {
        // Модель не загрузилась — берём MSE как fallback
        var fallbackData = plateData[0] || null;
        for (var fi = 0; fi < plateData.length; fi++) {
          if (plateData[fi]) { fallbackData = plateData[fi]; break; }
        }
        if (fallbackData) {
          mesh = fallbackData.clone();
        } else {
          continue;
        }
      }
      // baseRotX всегда -π/2 для GLB-плиток — независимо от источника клона
      mesh.castShadow = true;
      if (mesh.isGroup) {
        mesh.traverse(function(c) { if (c.isMesh) c.castShadow = true; });
      }

      var z  = 0.3 + Math.random() * 0.7;
      var ts = 42 + z * 22;
      var md = (mesh.userData && mesh.userData.maxDim) ? mesh.userData.maxDim : 1;
      var s  = ts / md;
      mesh.scale.set(s, s, s);
      scene.add(mesh);

      tiles.push({
        mesh: mesh, col: col, row: row, z: z,
        baseRotX:   -Math.PI / 2,
        phase:      Math.random() * Math.PI * 2,
        phaseRot:   (Math.random() - 0.5) * Math.PI / 18,
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
      t.mesh.rotation.x = t.baseRotX + Math.sin(t.tiltXPhase) * TILT_AMP;
      t.mesh.rotation.y = Math.sin(t.tiltYPhase) * TILT_AMP;
    });

    renderer.render(scene, cam);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

})();
