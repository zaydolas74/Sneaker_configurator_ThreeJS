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

let model; // Houd een verwijzing naar de geladen scene
loader.load("model/Shoe_compressed.glb", (gltf) => {
  model = gltf.scene; // Verwijzing opslaan
  model.scale.set(12, 12, 12); // Begin met een redelijke schaal

  model.traverse((child) => {
    if (child.isMesh) {
      console.log(child.material.name);
      child.material.envMapIntensity = 20; // Verhoog de intensiteit van de omgevingskaart
      child.material.needsUpdate = true; // Update de materialen
    }
  });
  scene.add(model);
});

//functie kleurenverandering
function changeLaces(color) {
  console.log(color);
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.material.name === "mat_laces") {
          child.material.color.set(color);
        }
      }
    });
  }
}

function changeSoles(color) {
  console.log(color);
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        if (
          child.material.name === "mat_sole_top" ||
          child.material.name === "mat_sole_bottom"
        ) {
          child.material.color.set(color);
        }
      }
    });
  }
}

function changeOutside(color) {
  console.log(color);
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.material.name === "mat_outside_1") {
          child.material.color.set(color);
        }
      }
    });
  }
}

window.changeLaces = changeLaces;
window.changeSoles = changeSoles;
window.changeOutside = changeOutside;

// RGBE loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load("envmap/urban.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 0, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Background color
scene.background = new THREE.Color("#D5DCDE");

// Camera position
camera.position.z = 5;
camera.position.y = 3;

// dat.GUI setup
const gui = new dat.GUI();
const settings = {
  lightIntensity: 0.5,
  modelX: 0,
  modelY: 0,
  modelZ: 0,
  modelScale: 10,
};

gui.add(settings, "lightIntensity", 0, 2).onChange((value) => {
  light.intensity = value; // Verander de intensiteit van het licht
});

gui.add(settings, "modelX", -10, 10).onChange((value) => {
  if (model) model.position.x = value; // Verander de X-positie van het model
});

gui.add(settings, "modelY", -10, 10).onChange((value) => {
  if (model) model.position.y = value; // Verander de Y-positie van het model
});

gui.add(settings, "modelZ", -10, 10).onChange((value) => {
  if (model) model.position.z = value; // Verander de Z-positie van het model
});

gui.add(settings, "modelScale", 1, 15).onChange((value) => {
  if (model) model.scale.set(value, value, value); // Verander de schaal van het model
});

//maak responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  if (model) {
    // Laat de camera altijd kijken naar het model
    camera.lookAt(model.position);
  }

  controls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
