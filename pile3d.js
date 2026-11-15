/* Portfolio — pile3d.js
   3D куча моделей проектов в секции Cases
*/

(async function () {
  console.log('🟢 Pile3D script started!');
  
  if (window.innerWidth < 860) {
    console.log('⚠️ Mobile detected, pile3d disabled');
    return;
  }
  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    console.log('❌ THREE.js or GLTFLoader not loaded!');
    return;
  }

  const container = document.querySelector('.project-tiles-pile');
  if (!container) {
    console.log('❌ Container .project-tiles-pile not found!');
    return;
  }
  
  console.log('✅ Starting pile3d initialization...');

  // Используем ту же базу что и orbit3d.js
  const BASE = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/main/';

  function isLight() {
    return document.body.classList.contains('theme-light');
  }

  function colorForLight(color, meshIndex) {
    const c = color.clone();
    if (meshIndex === 0) {
      c.setHSL(0, 0, 0.68); // Подложка
    } else {
      c.setHSL(0, 0, 0.32); // Логотип
    }
    return c;
  }

  // ══════════════════════════════════════
  // Setup
  // ══════════════════════════════════════
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-700, 700, 350, -350, 1, 1000);
  camera.position.z = 500;

  const renderer = new THREE.WebGLRenderer({ 
    canvas: container.appendChild(document.createElement('canvas')),
    antialias: true, 
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ══════════════════════════════════════
  // Освещение (как в orbit3d)
  // ══════════════════════════════════════
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  
  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(200, 300, 400);
  dir.castShadow = true;
  scene.add(dir);
  
  const rim = new THREE.DirectionalLight(0x88ff99, 0.35);
  rim.position.set(-200, -100, 100);
  scene.add(rim);

  // ══════════════════════════════════════
  // Загрузка GLB моделей (копия из orbit3d.js)
  // ══════════════════════════════════════
  const MODELS = [
    { file: 'MSE.glb' },
    { file: 'LC.glb' },
    { file: 'TTM.glb' },
    { file: 'Panacea.glb' },
    { file: 'Prism.glb' },
    { file: 'Glitch.glb' },
    { file: 'Kremua.glb' },
  ];

  function loadModel(modelData) {
    return new Promise(function(resolve) {
      const loader = new THREE.GLTFLoader();
      
      function tryLoad(src, fallbackSrc) {
        loader.load(src, function(gltf) {
          const meshes = [];
          gltf.scene.updateMatrixWorld(true);
          gltf.scene.traverse(function(child) {
            if (!child.isMesh) return;
            const geom = child.geometry.clone();
            geom.applyMatrix4(child.matrixWorld);
            const mat = Array.isArray(child.material)
              ? child.material.map(function(m) { return m.clone(); })
              : child.material.clone();
            
            const mats = Array.isArray(mat) ? mat : [mat];
            mats.forEach(function(m) {
              m.userData.origColor = m.color.clone();
            });
            
            meshes.push({ geom: geom, mat: mat });
          });

          if (meshes.length === 0) {
            resolve(null);
            return;
          }

          const box = new THREE.Box3();
          meshes.forEach(function(item) {
            item.geom.computeBoundingBox();
            box.union(item.geom.boundingBox);
          });
          
          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;

          const tCenter = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z);
          const tScale = new THREE.Matrix4().makeScale(1/maxDim, 1/maxDim, 1/maxDim);
          const final = new THREE.Matrix4().multiplyMatrices(tScale, tCenter);

          const group = new THREE.Group();
          group.userData.maxDim = 1;
          meshes.forEach(function(item) {
            item.geom.applyMatrix4(final);
            const mesh = new THREE.Mesh(item.geom, item.mat);
            mesh.castShadow = true;
            group.add(mesh);
          });

          resolve(group);
        }, null, function(err) {
          console.warn('Failed to load:', src);
          if (fallbackSrc) tryLoad(fallbackSrc, null);
          else resolve(null);
        });
      }

      tryLoad(BASE + modelData.file, './' + modelData.file);
    });
  }

  // Загружаем модели
  console.log('📦 Loading', MODELS.length, 'models...');
  const loadedModels = await Promise.all(MODELS.map(loadModel));
  console.log('✅ Models loaded:', loadedModels.filter(m => m).length, 'successful,', loadedModels.filter(m => !m).length, 'failed');

  // ══════════════════════════════════════
  // Создание кучи моделей
  // ══════════════════════════════════════
  const pileModels = [];

  // Позиции для кучи (в координатах ортокамеры)
  const positions = [
    // Верхний ряд
    { x: -500, y: 200, z: 20, rx: -0.4, ry: 0.5, rz: 0.3, scale: 70 },
    { x: -300, y: 220, z: 15, rx: 0.3, ry: -0.4, rz: -0.2, scale: 65 },
    { x: -100, y: 210, z: 18, rx: -0.2, ry: 0.3, rz: 0.4, scale: 75 },
    { x: 100, y: 215, z: 16, rx: 0.4, ry: -0.2, rz: -0.3, scale: 68 },
    { x: 300, y: 212, z: 19, rx: -0.3, ry: 0.4, rz: 0.2, scale: 72 },
    { x: 500, y: 225, z: 14, rx: 0.2, ry: -0.3, rz: -0.1, scale: 66 },
    
    // Средний ряд
    { x: -550, y: 20, z: 30, rx: 0.3, ry: -0.5, rz: 0.2, scale: 68 },
    { x: -350, y: 30, z: 25, rx: -0.2, ry: 0.4, rz: -0.3, scale: 74 },
    { x: 350, y: 25, z: 28, rx: 0.4, ry: -0.3, rz: 0.2, scale: 70 },
    { x: 550, y: 35, z: 22, rx: -0.3, ry: 0.5, rz: -0.2, scale: 73 },
    
    // Нижний ряд
    { x: -500, y: -180, z: 40, rx: 0.2, ry: -0.4, rz: 0.3, scale: 78 },
    { x: -300, y: -190, z: 45, rx: -0.4, ry: 0.3, rz: -0.2, scale: 72 },
    { x: -100, y: -185, z: 42, rx: 0.3, ry: -0.2, rz: 0.4, scale: 80 },
    { x: 100, y: -195, z: 48, rx: -0.2, ry: 0.4, rz: -0.3, scale: 75 },
    { x: 300, y: -188, z: 43, rx: 0.4, ry: -0.3, rz: 0.2, scale: 70 },
    { x: 500, y: -192, z: 46, rx: -0.3, ry: 0.2, rz: -0.4, scale: 76 },
  ];

  positions.forEach(function(pos, i) {
    const modelIndex = i % loadedModels.length;
    const modelData = loadedModels[modelIndex];
    
    if (!modelData) return;

    const model = modelData.clone();
    model.position.set(pos.x, pos.y, pos.z);
    model.rotation.set(pos.rx, pos.ry, pos.rz);
    
    const ts = pos.scale;
    const md = model.userData.maxDim || 1;
    model.scale.set(ts / md, ts / md, ts / md);
    
    model.traverse(function(child) {
      if (child.isMesh) child.castShadow = true;
    });

    model.userData = {
      baseRotation: { x: pos.rx, y: pos.ry, z: pos.rz },
      floatOffset: Math.random() * Math.PI * 2,
    };

    scene.add(model);
    pileModels.push(model);
  });
  
  console.log('🎨 Added', pileModels.length, 'models to scene');
  
  // Показываем контейнер только когда модели готовы
  if (pileModels.length > 0) {
    container.classList.add('loaded');
    console.log('✅ Pile3D ready and visible!');
  }

  // ══════════════════════════════════════
  // Обновление цветов при смене темы
  // ══════════════════════════════════════
  function updateTheme() {
    const light = isLight();
    rim.intensity = light ? 0 : 0.35;
    
    pileModels.forEach(function(model) {
      let meshIdx = 0;
      model.traverse(function(child) {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(function(m) {
          if (!m || !m.color) return;
          const orig = m.userData.origColor;
          if (!orig) return;
          m.color.copy(light ? colorForLight(orig, meshIdx) : orig);
        });
        meshIdx++;
      });
    });
  }

  new MutationObserver(function() { updateTheme(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });
  updateTheme();

  // ══════════════════════════════════════
  // Resize
  // ══════════════════════════════════════
  function onResize() {
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    renderer.setSize(w, h);
    camera.left = -w/2;
    camera.right = w/2;
    camera.top = h/2;
    camera.bottom = -h/2;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // ══════════════════════════════════════
  // Animation loop
  // ══════════════════════════════════════
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.006;

    pileModels.forEach(function(model) {
      const offset = model.userData.floatOffset;
      const baseRot = model.userData.baseRotation;
      
      model.rotation.x = baseRot.x + Math.sin(time * 0.5 + offset) * 0.015;
      model.rotation.y = baseRot.y + Math.cos(time * 0.3 + offset) * 0.02;
      model.rotation.z = baseRot.z + Math.sin(time * 0.4 + offset) * 0.015;
    });

    renderer.render(scene, camera);
  }

  animate();

})();
