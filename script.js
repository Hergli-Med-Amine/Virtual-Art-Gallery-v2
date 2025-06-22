import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
let scene, camera, renderer, controls;
let gallery, mixer;
let clock = new THREE.Clock();

// FPS tracking
let frameCount = 0;
let lastTime = 0;
let fps = 0;

// Movement variables
const moveSpeed = 5.0;
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
};

init();
animate();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    scene.fog = new THREE.Fog(0x222222, 50, 200);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    document.getElementById('container').appendChild(renderer.domElement);    // Create controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI;
    
    // Disable orbit controls for WASD movement (we'll handle movement manually)
    controls.enableKeys = false;

    // Add lights
    setupLighting();

    // Load GLB model
    loadGallery();    // Setup event listeners
    setupEventListeners();

    // Hide loading
    document.getElementById('loading').style.display = 'none';
}

function setupLighting() {

    var ambientLightColor = 0xffffff; 
    var ambientLightIntensity = 2; 

    var directionalLightColor = 0xffffff; 
    var directionalLightIntensity = 0; 

    var fillLightColor = 0xffffff; 
    var fillLightIntensity = 0.2; 

    var pointLightColor = 0xffffff; 
    var pointLightIntensity = 5; 

    // Ambient light
    const ambientLight = new THREE.AmbientLight(ambientLightColor, ambientLightIntensity);
    scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(directionalLightColor, directionalLightIntensity);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Additional fill lights
    const fillLight1 = new THREE.DirectionalLight(fillLightColor, fillLightIntensity);
    fillLight1.position.set(-10, 10, 5);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(fillLightColor, fillLightIntensity);
    fillLight2.position.set(5, 10, -10);
    scene.add(fillLight2);

    // Point lights for interior
    const pointLight1 = new THREE.PointLight(pointLightColor, pointLightIntensity, 20);
    pointLight1.position.set(0, 8, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(pointLightColor, pointLightIntensity, 20);
    pointLight2.position.set(10, 6, 10);
    scene.add(pointLight2);  
    
    const pointLight3 = new THREE.PointLight(pointLightColor, pointLightIntensity, 20);
    pointLight3.position.set(-10, 6, -10);
    scene.add(pointLight3);
    
}



function loadGallery() {
    const loader = new GLTFLoader();
    
    loader.load(
        'assets/models/art_gallery.glb',
        function(gltf) {
            gallery = gltf.scene;
            
            // Traverse and optimize the model
            gallery.traverse(function(node) {
                if (node.isMesh) {
                    // Enable shadows
                    node.castShadow = true;
                    node.receiveShadow = true;
                    
                    // Ensure proper material properties
                    if (node.material) {
                        if (Array.isArray(node.material)) {
                            node.material.forEach(mat => {
                                optimizeMaterial(mat);
                            });
                        } else {
                            optimizeMaterial(node.material);
                        }
                    }
                }
                
                // Handle lights in the model
                if (node.isLight) {
                    node.intensity *= 2; // Boost baked lights
                    node.castShadow = true;
                }
            });

            // Scale and position the model if needed
            gallery.scale.setScalar(1);
            gallery.position.set(0, 0, 0);
            
            scene.add(gallery);
            
            // Setup animations if any
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(gallery);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }            // Auto-frame the model and set center spawn
            const box = new THREE.Box3().setFromObject(gallery);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
              // Position camera at the center of the gallery at human height
            camera.position.set(center.x, center.y -1, center.z);
            camera.lookAt(center.x, center.y -1, center.z + 1);
            
            // Update controls target to be at eye level
            controls.target.set(center.x, center.y -1, center.z + 1);
            controls.update();
            
            console.log('Gallery loaded successfully!');
            console.log('Spawned at center:', center);
            updateStats();
        },
        function(progress) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            document.getElementById('loading').textContent = `Loading Art Gallery... ${percent}%`;
        },
        function(error) {
            console.error('Error loading gallery:', error);
            document.getElementById('loading').textContent = 'Error loading gallery. Please check the console.';
        }
    );
}

function optimizeMaterial(material) {
    // Ensure proper rendering
    if (material.map) {
        material.map.encoding = THREE.sRGBEncoding;
    }
    if (material.emissiveMap) {
        material.emissiveMap.encoding = THREE.sRGBEncoding;
    }
    if (material.normalMap) {
        material.normalScale.setScalar(1);
    }
    
    // Enable transparency if needed
    if (material.transparent || material.opacity < 1) {
        material.transparent = true;
    }
    
    // Ensure materials are updated
    material.needsUpdate = true;
}

function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function onKeyDown(event) {
    switch(event.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.backward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Space':
            keys.up = true;
            event.preventDefault();
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keys.down = true;
            break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.backward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'Space':
            keys.up = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keys.down = false;
            break;
    }
}

function handleMovement() {
    const delta = clock.getDelta();
    const moveDistance = moveSpeed * delta;

    // Get the camera's current direction vectors
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    // Get forward direction (where camera is looking)
    camera.getWorldDirection(forward);
    
    // Get right direction (perpendicular to forward and up)
    right.crossVectors(forward, up).normalize();
    
    // Movement vectors
    const moveVector = new THREE.Vector3();

    if (keys.forward) {
        moveVector.add(forward.clone().multiplyScalar(moveDistance));
    }
    if (keys.backward) {
        moveVector.add(forward.clone().multiplyScalar(-moveDistance));
    }
    if (keys.left) {
        moveVector.add(right.clone().multiplyScalar(-moveDistance));
    }
    if (keys.right) {
        moveVector.add(right.clone().multiplyScalar(moveDistance));
    }
    if (keys.up) {
        moveVector.y += moveDistance;
    }
    if (keys.down) {
        moveVector.y -= moveDistance;
    }

    // Apply movement to both camera and controls target
    if (moveVector.length() > 0) {
        camera.position.add(moveVector);
        controls.target.add(moveVector);
        controls.update();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateStats() {
    if (gallery) {
        let triangles = 0;
        gallery.traverse(function(node) {
            if (node.isMesh && node.geometry) {
                if (node.geometry.index) {
                    triangles += node.geometry.index.count / 3;
                } else {
                    triangles += node.geometry.attributes.position.count / 3;
                }
            }
        });
        document.getElementById('triangles').textContent = `Triangles: ${Math.floor(triangles).toLocaleString()}`;
    }
}

function updateFPS(currentTime) {
    frameCount++;
    
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        document.getElementById('fps').textContent = `FPS: ${fps}`;
        frameCount = 0;
        lastTime = currentTime;
    }
}

function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    // Update FPS counter
    updateFPS(currentTime);
    
    // Handle keyboard movement
    handleMovement();
    
    // Update controls
    controls.update();
    
    // Update animations
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    
    // Render
    renderer.render(scene, camera);
}
