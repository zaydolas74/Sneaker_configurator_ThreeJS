import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as dat from "dat.gui";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/draco/"
);
dracoLoader.preload();

// GLTF loader
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let gltfScene; // Houd een verwijzing naar de geladen scene
loader.load("model/Shoe_compressed.glb", (gltf) => {
  gltfScene = gltf.scene; // Verwijzing opslaan
  gltfScene.scale.set(12, 12, 12); // Begin met een redelijke schaal
  scene.add(gltf.scene);
});

// RGBE loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load("envmap/urban.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.5); // Begin intensiteit is 0.5
light.position.set(0, 0, 5); // Positie van het licht
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Omgevingslicht
scene.add(ambientLight);

// Background color
scene.background = new THREE.Color("#D5DCDE");

// Camera position
camera.position.z = 5;
camera.position.y = 3;

// dat.GUI setup
const gui = new dat.GUI();
const settings = {
  lightIntensity: 0.5, // Begin intensiteit van het DirectionalLight
  modelX: 0, // X-positie van het model
  modelY: 0, // Y-positie van het model
  modelZ: 0, // Z-positie van het model
  modelScale: 10, // Schaal van het model
};

// Voeg schuifregelaars toe voor het licht en modelinstellingen
gui.add(settings, "lightIntensity", 0, 2).onChange((value) => {
  light.intensity = value; // Verander de intensiteit van het licht
});

gui.add(settings, "modelX", -10, 10).onChange((value) => {
  if (gltfScene) gltfScene.position.x = value; // Verander de X-positie van het model
});

gui.add(settings, "modelY", -10, 10).onChange((value) => {
  if (gltfScene) gltfScene.position.y = value; // Verander de Y-positie van het model
});

gui.add(settings, "modelZ", -10, 10).onChange((value) => {
  if (gltfScene) gltfScene.position.z = value; // Verander de Z-positie van het model
});

gui.add(settings, "modelScale", 1, 15).onChange((value) => {
  if (gltfScene) gltfScene.scale.set(value, value, value); // Verander de schaal van het model
});

//maak responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  if (gltfScene) {
    // Laat de camera altijd kijken naar het model
    camera.lookAt(gltfScene.position);
  }

  controls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
