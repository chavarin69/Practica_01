import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. ESCENA, CÁMARA Y RENDERIZADOR
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Habilitar sombras para realismo
document.body.appendChild(renderer.domElement);

// 2. ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Evita pasar por debajo del suelo

// 3. ILUMINACIÓN
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(5, 8, 5);
mainLight.castShadow = true;
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x4e9eff, 0.6, 10);
fillLight.position.set(-4, 3, -2);
scene.add(fillLight);

// Array para guardar los objetos interactivos para el Raycaster
const interactiveObjects = [];

// 4. AGREGAR GEOMETRÍAS BÁSICAS REQUERIDAS (Cubo, Esfera, Plano)

// Plano (Suelo)
const planeGeo = new THREE.PlaneGeometry(15, 15);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x2e2e4a, roughness: 0.8 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

// Cubo Animado
const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0xFA000C, roughness: 0.3, metalness: 0.2 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(-2, 0, 0);
cube.name = "Cubo de Rubí";
cube.castShadow = true;
scene.add(cube);
interactiveObjects.push(cube);

// Esfera Animada
const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, roughness: 0.1, metalness: 0.8 });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(2, 0, 0);
sphere.name = "Esfera de Plasma";
sphere.castShadow = true;
scene.add(sphere);
interactiveObjects.push(sphere);

// Rejilla de ayuda estética
const gridHelper = new THREE.GridHelper(15, 15, 0x4e9eff, 0x2b2b44);
gridHelper.position.y = -0.99;
scene.add(gridHelper);

// 5. CARGA DE MODELO 3D (.GLTF / .GLB)
const loader = new GLTFLoader();
// Cargamos un modelo de prueba público desde un CDN estable (el patito de goma estándar de Khronos)
const modelUrl = 'https://githubusercontent.com';

loader.load(
    modelUrl,
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, -1, 0); // Ajustar en el suelo
        model.scale.set(0.8, 0.8, 0.8);
        model.name = "Pato de Goma 3D (Cargado externamente)";
        
        // Hacer que los componentes del modelo hereden las propiedades de casteo de sombras e interactividad
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Guardamos la referencia del nombre del padre o del objeto en sí para el raycast
                child.userData.parentName = model.name;
                interactiveObjects.push(child);
            }
        });
        
        scene.add(model);
        console.log("✅ Modelo GLB cargado exitosamente.");
    },
    (xhr) => {
        console.log(`Cargando modelo: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (error) => {
        console.error("❌ Error al cargar el modelo:", error);
    }
);

// 6. IMPLEMENTACIÓN DE RAYCASTING PARA SELECCIÓN
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const selectionDisplay = document.getElementById('selection-display');

window.addEventListener('click', (event) => {
    // Calcular la posición del mouse en coordenadas normalizadas bidimensionales (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el rayo según la cámara y la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Calcular los objetos que intersectan el rayo
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        // Identificar el nombre (sea propio o asignado en el userData del modelo externo)
        const objectName = hitObject.userData.parentName || hitObject.name || "Objeto Desconocido";
        
        // ACCIÓN VISIBLE 1: Mostrar información en pantalla a través de la UI
        selectionDisplay.innerText = `Seleccionado: ${objectName}`;
        selectionDisplay.style.background = "rgba(0, 255, 200, 0.2)";
        selectionDisplay.style.borderLeftColor = "#00ffcc";
        selectionDisplay.style.color = "#00ffcc";

        // ACCIÓN VISIBLE 2: Imprimir información detallada en consola
        console.log(`🎯 ¡Objeto Seleccionado! Nombre: ${objectName}`, hitObject);

        // ACCIÓN VISIBLE 3: Flash de color de feedback interactivo temporal (Emissive)
        if (hitObject.material && hitObject.material.emissive) {
            const origColor = hitObject.material.emissive.getHex();
            hitObject.material.emissive.setHex(0x555555);
            setTimeout(() => {
                hitObject.material.emissive.setHex(origColor);
            }, 300);
        }
    }
});

// 7. CICLO DE ANIMACIÓN (requestAnimationFrame)
function animate() {
    requestAnimationFrame(animate);

    // Actualizar controles para el efecto Damping (frenado suave)
    controls.update();

    // Animación de las geometrías básicas
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Efecto flotante para la esfera usando funciones trigonométricas
    sphere.position.y = Math.sin(Date.now() * 0.0015) * 0.4 + 0.2;

    // Renderizar escena con la cámara activa
    renderer.render(scene, camera);
}

animate();

// 8. REDIMENSIÓN RESPONSIVE DE LA VENTANA
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// LÓGICA DE LA INTERFAZ DEL CUESTIONARIO (MODAL)
const modal = document.getElementById('quiz-modal');
const toggleBtn = document.getElementById('toggle-quiz-btn');
const closeBtn = document.getElementById('close-modal');

toggleBtn.addEventListener('click', () => {
    modal.classList.toggle('hidden');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
