import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { gsap } from "gsap";

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

function updateModelScale() {
  const screenWidth = window.innerWidth;

  // Pas de schaal aan op basis van de schermbreedte
  let scaleFactor = (screenWidth / 1000) * 12; // Kies een geschikte verhouding
  if (scaleFactor < 10) scaleFactor = 10; // Minimale schaal
  if (scaleFactor > 12) scaleFactor = 12; // Maximale schaal

  if (model) {
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
}

loader.load("model/Shoe_compressed.glb", (gltf) => {
  model = gltf.scene;
  updateModelScale();

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.material.envMapIntensity = 20;
      child.material.needsUpdate = true;
    }
  });

  scene.add(model);

  window.addEventListener("resize", updateModelScale);
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

let solesMaterial = "none";
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
        solesMaterial = material;
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

function prevSlide() {
  nextArrow.style.opacity = "1";
  if (currentSlide > 0) {
    currentSlide--;
    updateCarousel();
  }
  if (currentSlide != 0) {
    document.querySelector(".material-options").style.display = "none";
  } else {
    document.querySelector(".material-options").style.display = "flex";
  }

  if (currentSlide === 0) {
    prevArrow.style.opacity = "0.3";
    const timeline = gsap.timeline();

    timeline.to(camera.position, {
      duration: 0.5,
      y: 2,
      z: 4,
      x: 0,
    });

    timeline.to(
      camera.position,
      {
        duration: 0.5,
        y: 0,
        z: 1,
        x: 6,
      },
      "-=0.1"
    );
  }
  if (currentSlide === 1) {
    gsap.to(camera.position, {
      duration: 1,
      y: 0,
      z: 1,
      x: -6,
    });
  }
  if (currentSlide === 2) {
    gsap.to(camera.position, {
      duration: 1,
      y: 5,
      z: 4,
      x: 0,
    });
  }
}

function nextSlide() {
  prevArrow.style.opacity = "1";
  const totalSlides = document.querySelectorAll(
    ".customization-section"
  ).length;
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateCarousel();
  }
  if (currentSlide != 0) {
    document.querySelector(".material-options").style.display = "none";
  }

  if (currentSlide === 1) {
    const timeline = gsap.timeline();

    timeline.to(camera.position, {
      duration: 0.5,
      y: 2,
      z: 4,
      x: 0,
    });

    timeline.to(camera.position, {
      duration: 1,
      y: 0,
      z: 1,
      x: -6,
    });
  }
  if (currentSlide === 2) {
    gsap.to(camera.position, {
      duration: 1,
      y: 5,
      z: 4,
      x: 0,
    });
  }
  if (currentSlide === 3) {
    nextArrow.style.opacity = "0.3";
    gsap.to(camera.position, {
      duration: 1,
      y: 5,
      z: 0,
      x: 0,
    });
  }
}

window.changeLaces = changeLaces;
window.changeSoles = changeSoles;
window.changeOutside = changeOutside;
window.changeMaterialSoles = changeMaterialSoles;

window.prevSlide = prevSlide;
window.nextSlide = nextSlide;

//raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//mouse event
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let isAnimating = false;
let popupActive = false;

//click event
window.addEventListener("click", () => {
  if (isAnimating || popupActive) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstIntersect = intersects[0];

  if (firstIntersect) {
    if (firstIntersect.object.material.name === "mat_laces") {
      prevArrow.style.opacity = "1";
      nextArrow.style.opacity = "1";
      goToSlide(2);
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
            goToSlide(0);
            getShoeInformation("mat_sole_bottom");
            document.querySelector(".material-options").style.display = "flex";
            prevArrow.style.opacity = "0.3";
            nextArrow.style.opacity = "1";
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
      const timeline = gsap.timeline();

      timeline.to(camera.position, {
        duration: 0.5,
        y: 2,
        z: 4,
        x: 0,
      });
      timeline.to(camera.position, {
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
            getShoeInformation("mat_outside_3");
            prevArrow.style.opacity = "1";
            nextArrow.style.opacity = "1";
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
      const timeline = gsap.timeline();

      timeline.to(camera.position, {
        duration: 0.5,
        y: 2,
        z: 4,
        x: 0,
      });
      timeline.to(camera.position, {
        duration: 1,
        y: 0,
        z: 1,
        x: -6,
      });
    }
  }
});

//mouse hover
let lastIntersected = null; // Houd het laatst gehighlighte object bij
/*
window.addEventListener("mousemove", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstIntersect = intersects[0];

  if (firstIntersect) {
    if (
      firstIntersect.object.material.name === "mat_laces" ||
      firstIntersect.object.material.name === "mat_sole_top" ||
      firstIntersect.object.material.name === "mat_sole_bottom" ||
      firstIntersect.object.material.name === "mat_outside_1" ||
      firstIntersect.object.material.name === "mat_outside_2" ||
      firstIntersect.object.material.name === "mat_outside_3"
    ) {
      // Reset emissive kleur van het vorige object
      if (lastIntersected && lastIntersected !== firstIntersect.object) {
        lastIntersected.material.emissive.set(0x000000);
      }

      // Highlight het huidige object
      firstIntersect.object.material.emissive.set("white");

      // Update het laatst gehighlighte object
      lastIntersected = firstIntersect.object;
    }
  } else {
    // Reset emissive kleur als er geen intersecties meer zijn
    if (lastIntersected) {
      lastIntersected.material.emissive.set(0x000000);
      lastIntersected = null; // Reset lastIntersected om toekomstige updates mogelijk te maken
    }
  }
});*/

//Go to slide
function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  updateCarousel();
}

const fileInput = document.getElementById("logoUpload");
let imageURL = null;

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  imageURL = URL.createObjectURL(file);

  const logoTexture = textureLoader.load(imageURL);

  const logoGeometry = new THREE.PlaneGeometry(0.5, 0.5);
  const logoMaterial = new THREE.MeshBasicMaterial({
    map: logoTexture,
    transparent: true,
  });

  const logo = new THREE.Mesh(logoGeometry, logoMaterial);

  logo.position.set(0, 0.2, -0.5);
  logo.rotation.x = -Math.PI / 2; // 90 graden naar beneden

  scene.add(logo);
});

//Carousel camera follow
//window.prevSlide = prevslide;
//window.nextSlide = nextSlide;

// RGBE loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load("envmap/urban.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  //scene.background = texture;
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

document.getElementById("closeButton").addEventListener("click", function () {
  document.getElementById("popUp").style.display = "none";
  popupActive = false;
});

document
  .getElementById("closeConfirmation")
  .addEventListener("click", function () {
    document.getElementById("popUp").style.display = "none";
    popupActive = false;
  });

document.getElementById("button-Finish").addEventListener("click", function () {
  document.getElementById("popUp").style.display = "flex";
  document.getElementById("shoeForm").style.display = "flex";
  document.getElementById("confirmation").style.display = "none";
  popupActive = true;
});

//Send to API
document.getElementById("shoeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const size = document.getElementById("shoeSize").value;
  const amount = document.getElementById("amount").value;
  const email = document.getElementById("email").value;

  const lacesColor = getShoeInformation("mat_laces").color;
  const solesColor = getShoeInformation("mat_sole_bottom").color;
  const solesMaterial = getShoeInformation("mat_sole_bottom").texture;
  const outsideColor = getShoeInformation("mat_outside_3").color;

  const logo = imageURL ? imageURL : null;

  console.log(logo);

  let logoURL = null;

  if (logo) {
    console.log("Uploading logo to Cloudinary...");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 512;
    canvas.height = 512;

    const img = new Image();
    img.src = logo;

    img.onload = async () => {
      ctx.drawImage(img, 0, 0, 512, 512);
      logoURL = canvas.toDataURL("image/png");

      try {
        const cloudinaryResponse = await uploadToCloudinary(logoURL);
        const cloudinaryUrl = cloudinaryResponse.secure_url;

        const payload = {
          size,
          amount,
          email,
          lacesColor,
          soleColor: solesColor,
          solesMaterial,
          outsideColor,
          logo: cloudinaryUrl,
          status: "Processing", // Default status
          date: new Date().toISOString().split("T")[0],
        };

        // Send the data to the API
        const response = await fetch(
          "https://sneaker-configurator-api.onrender.com/api/v1/orders",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error("Error uploading logo to Cloudinary:", error);
      }
    };
  } else {
    const placeholderLogoUrl =
      "https://via.placeholder.com/512x512.png?text=No+Logo+Selected";
    console.log("No logo uploaded");
    const payload = {
      size,
      amount,
      email,
      lacesColor,
      soleColor: solesColor,
      solesMaterial,
      outsideColor,
      logo: placeholderLogoUrl,
      status: "Processing", // Default status
      date: new Date().toISOString().split("T")[0],
    };

    // Send the data to the API
    fetch("https://sneaker-configurator-api.onrender.com/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error("Error:", error));
  }

  //display none form
  document.getElementById("shoeForm").style.display = "none";
  document.getElementById("confirmation").style.display = "block";
});

// Function to upload image to Cloudinary
async function uploadToCloudinary(base64Image) {
  const cloudName = "dpglweuvj"; // Replace with your Cloudinary cloud name
  const uploadPreset = "shoeslogo"; // Replace with your upload preset (set up on Cloudinary)

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload to Cloudinary");
  }

  return response.json();
}

//get shoe Information
function getShoeInformation(materialName) {
  if (!model) return;

  const materials = Array.isArray(materialName) ? materialName : [materialName];

  let shoeInformation = { color: null, texture: null };

  model.traverse((child) => {
    if (child.isMesh) {
      if (materials.includes(child.material.name)) {
        shoeInformation.color = child.material.color.getStyle();
        if (child.material.name === "mat_sole_bottom") {
          shoeInformation.texture = solesMaterial;
        }
      }
    }
  });

  return shoeInformation;
}

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
