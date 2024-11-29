import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { gsap } from "gsap";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
//import * as dat from "dat.gui";

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
renderer.setPixelRatio(3);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

// Texture loader
const textureLoader = new THREE.TextureLoader();

const materials = {
  rubber: {
    normal: textureLoader.load("textures/rubber1/Rubber_Sole_002_normal.jpg"),
    height: textureLoader.load("textures/rubber1/Rubber_Sole_002_height.jpg"),
  },
};

// GLTF loader
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let model;
loader.load("model/Shoe_compressed.glb", (gltf) => {
  model = gltf.scene;
  model.scale.set(14, 14, 14);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.material.envMapIntensity = 20;
      child.material.needsUpdate = true;
    }
  });
  scene.add(model);
});

//plane voor schaduw
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.ShadowMaterial({
  opacity: 0.5,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2;
plane.receiveShadow = true;
scene.add(plane);

//functie kleurenverandering
function changeLaces(color) {
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
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        if (
          child.material.name === "mat_outside_1" ||
          child.material.name === "mat_outside_2" ||
          child.material.name === "mat_outside_3"
        ) {
          child.material.color.set(color);
        }
      }
    });
  }
}

function changeMaterialSoles(material) {
  if (!model) return; // Stop als het model niet beschikbaar is

  model.traverse((child) => {
    if (child.isMesh && child.material.name === "mat_sole_bottom") {
      // Reset de maps als "none" is geselecteerd
      if (material === "none") {
        child.material.normalMap = null;
        child.material.aoMap = null;
        child.material.displacementMap = null;
      } else if (materials[material]) {
        // Pas de geselecteerde material maps toe
        child.material.normalMap = materials[material].normal;
        child.material.aoMap = materials[material].ambientOcclusion;
        child.material.displacementMap = materials[material].height;
      } else {
        console.warn(`Materiaal "${material}" niet gevonden.`);
      }

      // Forceer een update van het materiaal
      child.material.needsUpdate = true;
    }
  });
}

window.changeLaces = changeLaces;
window.changeSoles = changeSoles;
window.changeOutside = changeOutside;
window.changeMaterialSoles = changeMaterialSoles;

//raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//mouse event
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let isAnimating = false;
//click event
window.addEventListener("click", () => {
  if (isAnimating) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstIntersect = intersects[0];

  if (firstIntersect) {
    if (firstIntersect.object.material.name === "mat_laces") {
      goToSlide(0);
      isAnimating = true;
      gsap.to(firstIntersect.object.material.emissive, {
        duration: 0.5,
        r: 1,
        g: 1,
        b: 1,
        repeat: 1,
        yoyo: true,
        onComplete: () => {
          firstIntersect.object.material.emissive.set(0x000000);
          isAnimating = false;
        },
      });
      gsap.to(camera.position, {
        duration: 1,
        y: 5,
        z: 4,
        x: 0,
      });
    }
    if (
      firstIntersect.object.material.name === "mat_sole_top" ||
      firstIntersect.object.material.name === "mat_sole_bottom"
    ) {
      model.traverse((child) => {
        if (child.isMesh) {
          if (
            child.material.name === "mat_sole_top" ||
            child.material.name === "mat_sole_bottom"
          ) {
            goToSlide(1);
            isAnimating = true;
            gsap.to(child.material.emissive, {
              duration: 0.5,
              r: 1,
              g: 1,
              b: 1,
              repeat: 1,
              yoyo: true,
              onComplete: () => {
                firstIntersect.object.material.emissive.set(0x000000);
                isAnimating = false;
              },
            });
          }
        }
      });
      gsap.to(camera.position, {
        duration: 1,
        y: 0,
        z: 1,
        x: 6,
      });
    }

    if (
      firstIntersect.object.material.name === "mat_outside_1" ||
      firstIntersect.object.material.name === "mat_outside_2" ||
      firstIntersect.object.material.name === "mat_outside_3"
    ) {
      model.traverse((child) => {
        if (child.isMesh) {
          if (
            child.material.name === "mat_outside_1" ||
            child.material.name === "mat_outside_2" ||
            child.material.name === "mat_outside_3"
          ) {
            goToSlide(2);
            isAnimating = true;
            gsap.to(child.material.emissive, {
              duration: 0.5,
              r: 1,
              g: 1,
              b: 1,
              repeat: 1,
              yoyo: true,
              onComplete: () => {
                firstIntersect.object.material.emissive.set(0x000000);
                isAnimating = false;
              },
            });
          }
        }
      });
      gsap.to(camera.position, {
        duration: 1,
        y: 0,
        z: 1,
        x: -6,
      });
    }
  }
});

//Go to slide
function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  updateCarousel();
}

const fileInput = document.getElementById("logoUpload");
const logoPreview = document.getElementById("logoPreview");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const imageURL = URL.createObjectURL(file);
    logoPreview.src = imageURL;
    logoPreview.style.display = "block";
  }
});

function applyLogo() {
  if (!logoPreview.src) {
    alert("Please upload a logo first!");
    return;
  }

  console.log(logoPreview.src);

  const logoTexture = textureLoader.load(logoPreview.src);

  const logoGeometry = new THREE.PlaneGeometry(0.5, 0.5);
  const logoMaterial = new THREE.MeshBasicMaterial({
    map: logoTexture,
    transparent: true,
  });

  const logo = new THREE.Mesh(logoGeometry, logoMaterial);

  logo.position.set(2, 2, 2);
  scene.add(logo);
}

window.applyLogo = applyLogo;

// RGBE loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load("envmap/urban.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.2);
light.position.set(0, 10, 5);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -5;
light.shadow.camera.right = 5;
light.shadow.camera.top = 5;
light.shadow.camera.bottom = -5;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Background color
scene.background = new THREE.Color("#D5DCDE");

// Camera position
camera.position.z = 5;
camera.position.y = 3;

/* dat.GUI setup
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
});*/

//maak responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  controls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
