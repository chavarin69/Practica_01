import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. ESCENA, CÁMARA Y RENDERER (Puntos 1, 2, 3)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12131C);
scene.fog = new THREE.FogExp2(0x12131C, 0.03);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 4, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ==========================================
// 2. CONTROLES DE ÓRBITA (Punto 7)
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01;

// ==========================================
// 3. ILUMINACIÓN (Punto 6)
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x00f2fe, 2, 10);
pointLight.position.set(-3, 2, -1);
scene.add(pointLight);

// ==========================================
// 4. GEOMETRÍAS Y MATERIALES (Puntos 4 y 5)
// ==========================================
const interactableObjects = [];

// A) Plano (Suelo)
const planeGeo = new THREE.PlaneGeometry(20, 20);
const planeMat = new THREE.MeshStandardMaterial({
    color: 0x1e202e,
    roughness: 0.8,
    metalness: 0.2
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const gridHelper = new THREE.GridHelper(20, 20, 0x4facfe, 0x2a2d3d);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// B) Cubo
const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMat = new THREE.MeshStandardMaterial({
    color: 0x4facfe,
    roughness: 0.2,
    metalness: 0.5
});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(-2.5, 0.75, 0);
cube.castShadow = true;
cube.receiveShadow = true;
cube.name = "Cubo Azul";
scene.add(cube);
interactableObjects.push(cube);

// C) Esfera
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xff0844,
    roughness: 0.1,
    metalness: 0.8
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(2.5, 1, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
sphere.name = "Esfera Roja";
scene.add(sphere);
interactableObjects.push(sphere);

// D) Torus Knot (Objeto decorativo)
const torusGeo = new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16);
const torusMat = new THREE.MeshStandardMaterial({
    color: 0xffb199,
    roughness: 0.3,
    metalness: 0.7
});
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.position.set(0, 1.2, 2.5);
torus.castShadow = true;
torus.name = "Torus Knot Dorado";
scene.add(torus);
interactableObjects.push(torus);

// ==========================================
// 5. CARGAR MODELO 3D (.glb / .gltf) (Punto 9)
// ==========================================
const loader = new GLTFLoader();
loader.load(
    'models/robot.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, -2);
        model.scale.set(0.8, 0.8, 0.8);
        model.name = "Modelo 3D Cargar (.glb)";

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.name = child.name || "Parte del Modelo 3D";
            }
        });

        scene.add(model);
        interactableObjects.push(model);
        console.log("¡Modelo 3D cargado con éxito!", gltf);
    },
    (xhr) => {
        if (xhr.lengthComputable) {
            console.log(`Cargando modelo: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
        }
    },
    (error) => {
        console.warn("Asegúrate de colocar tu archivo .glb dentro de la carpeta 'models/'", error);
    }
);

// ==========================================
// 6. RAYCASTING Y SELECCIÓN (Puntos 10 y 11)
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoText = document.getElementById('info-text');
const objectDetails = document.getElementById('object-details');
const detailName = document.getElementById('detail-name');

let selectedObject = null;
let originalColor = new THREE.Color();

window.addEventListener('pointerdown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, true);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;

        // Si hacemos clic en el mismo objeto que ya está seleccionado, no hacemos nada
        if (selectedObject === hitObject) return;

        // Restaurar color del objeto anteriormente seleccionado
        if (selectedObject && selectedObject.material && selectedObject.material.color) {
            selectedObject.material.color.copy(originalColor);
        }

        selectedObject = hitObject;

        // Resaltado: Guardar color original y cambiar a amarillo visiblemente
        if (selectedObject.material && selectedObject.material.color) {
            originalColor.copy(selectedObject.material.color);
            selectedObject.material.color.setHex(0xffea00); // Amarillo de selección
        }

        let objName = selectedObject.name;
        if ((!objName || objName.includes("Parte")) && selectedObject.parent && selectedObject.parent.name) {
            objName = selectedObject.parent.name;
        }

        infoText.innerText = "¡Objeto detectado por Raycasting!";
        detailName.innerText = objName || "Objeto 3D";
        objectDetails.classList.remove('hidden');

        console.log("----------------------------------------");
        console.log("[Raycaster] Objeto Seleccionado:", objName);
        console.log("Coordenadas de impacto:", intersects[0].point);
        console.log("----------------------------------------");
    } else {
        if (selectedObject && selectedObject.material && selectedObject.material.color) {
            selectedObject.material.color.copy(originalColor);
        }
        selectedObject = null;
        infoText.innerText = "Haz clic en un objeto para seleccionarlo";
        objectDetails.classList.add('hidden');
    }
});

// Ajuste responsive
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 7. BUCLE DE ANIMACIÓN (Punto 8)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animación de rotación y movimiento
    cube.rotation.x = elapsedTime * 0.5;
    cube.rotation.y = elapsedTime * 0.7;

    sphere.position.y = 1 + Math.sin(elapsedTime * 2) * 0.3;

    torus.rotation.x = elapsedTime * 0.4;
    torus.rotation.z = elapsedTime * 0.3;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// ==========================================
// 8. LÓGICA DE LA VENTANA FLOTANTE (Modal)
// ==========================================
const btnRespuestas = document.getElementById('btn-respuestas');
const modalRespuestas = document.getElementById('modal-respuestas');
const closeModal = document.getElementById('close-modal');

btnRespuestas.addEventListener('click', () => {
    modalRespuestas.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    modalRespuestas.classList.add('hidden');
});

window.addEventListener('click', (event) => {
    if (event.target === modalRespuestas) {
        modalRespuestas.classList.add('hidden');
    }
});