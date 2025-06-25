// Gallery and artwork loading system
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ArtLoader {
    constructor(scene, camera, controls) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.gallery = null;
        this.mixer = null;
        this.artworks = [];
        this.sculptures = [];
        this.loadedArtCount = 0;
    }

    async loadGallery() {
        const loader = new GLTFLoader();
        
        return new Promise((resolve, reject) => {
            loader.load(
                'assets/models/art_gallery.glb',
                (gltf) => {
                    this.gallery = gltf.scene;
                    
                    // Traverse and optimize the model
                    this.gallery.traverse((node) => {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                            
                            if (node.material) {
                                if (Array.isArray(node.material)) {
                                    node.material.forEach(mat => {
                                        this.optimizeMaterial(mat);
                                    });
                                } else {
                                    this.optimizeMaterial(node.material);
                                }
                            }
                        }
                        
                        if (node.isLight) {
                            node.intensity *= 2;
                            node.castShadow = true;
                        }
                    });

                    this.gallery.scale.setScalar(1);
                    this.gallery.position.set(0, 0, 0);
                    this.scene.add(this.gallery);
                    
                    // Setup animations if any
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.gallery);
                        gltf.animations.forEach((clip) => {
                            this.mixer.clipAction(clip).play();
                        });
                    }                    // Set camera position at center
                    this.setCenterSpawn();
                    
                    // Create statue base
                    this.createStatueBase();
                    
                    console.log('Gallery loaded successfully!');
                    resolve(this.gallery);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    document.getElementById('loading').textContent = `Loading Art Gallery... ${percent}%`;
                },
                (error) => {
                    console.error('Error loading gallery:', error);
                    document.getElementById('loading').textContent = 'Error loading gallery. Please check the console.';
                    reject(error);
                }
            );
        });
    }

    setCenterSpawn() {
        const box = new THREE.Box3().setFromObject(this.gallery);
        const center = box.getCenter(new THREE.Vector3());
        
        // Position camera to the left of the center of the gallery at human height
        this.camera.position.set(center.x - 4, center.y - 1, center.z);
        this.camera.lookAt(center.x, center.y - 1, center.z + 1);
        
        // Update controls target to be at eye level
        this.controls.target.set(center.x, center.y - 1, center.z + 1);
        this.controls.update();
        
        console.log('Spawned to the left of center:', center);
    }

    async loadArtworks() {
        try {
            const [paintingsResponse, sculpturesResponse] = await Promise.all([
                fetch('assets/data/paintings.json'),
                fetch('assets/data/sculptures.json')
            ]);
            
            const paintings = await paintingsResponse.json();
            const sculptures = await sculpturesResponse.json();
            
            console.log('Loaded artwork data:', { 
                paintings: paintings.length, 
                sculptures: sculptures.length 
            });
            
            // Load sculptures first (only the first one for now)
            if (sculptures.length > 0) {
                await this.loadSculpture(sculptures[0]);
            }
            
            // Load paintings
            paintings.forEach((painting, index) => {
                this.loadPainting(painting, index);
            });
            
        } catch (error) {
            console.error('Error loading artwork data:', error);
        }
    }

    async loadSculpture(sculptureData) {
        const loader = new GLTFLoader();
        
        console.log('Loading sculpture:', sculptureData.title);
        
        return new Promise((resolve, reject) => {
            loader.load(
                sculptureData.modelUrl,
                (gltf) => {
                    const sculpture = gltf.scene;
                    
                    sculpture.position.set(
                        sculptureData.position.x,
                        sculptureData.position.y,
                        sculptureData.position.z
                    );
                    
                    sculpture.scale.set(
                        sculptureData.scale.x,
                        sculptureData.scale.y,
                        sculptureData.scale.z
                    );
                    
                    if (sculptureData.color) {
                        sculpture.traverse((node) => {
                            if (node.isMesh) {
                                if (node.material) {
                                    if (Array.isArray(node.material)) {
                                        node.material.forEach(mat => {
                                            mat.color.setHex(sculptureData.color);
                                        });
                                    } else {
                                        node.material.color.setHex(sculptureData.color);
                                    }
                                }
                                node.castShadow = true;
                                node.receiveShadow = true;
                            }
                        });
                    }
                    
                    this.scene.add(sculpture);
                    this.sculptures.push({
                        object: sculpture,
                        data: sculptureData
                    });
                    
                    console.log(`Sculpture "${sculptureData.title}" loaded successfully`);
                    resolve(sculpture);
                },
                (progress) => {
                    console.log('Sculpture loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
                },
                (error) => {
                    console.error('Error loading sculpture:', error);
                    reject(error);
                }
            );
        });
    }

    loadPainting(paintingData, index) {
        const textureLoader = new THREE.TextureLoader();
        
        console.log('Loading painting:', paintingData.title);
        
        textureLoader.load(
            paintingData.imageUrl,
            (texture) => {
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshLambertMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
                
                const painting = new THREE.Mesh(geometry, material);
                
                painting.position.set(
                    paintingData.position.x,
                    paintingData.position.y,
                    paintingData.position.z
                );
                
                painting.rotation.set(
                    paintingData.rotation.x,
                    paintingData.rotation.y,
                    paintingData.rotation.z
                );
                
                painting.scale.set(
                    paintingData.scale.x,
                    paintingData.scale.y,
                    paintingData.scale.z
                );
                
                painting.castShadow = true;
                painting.receiveShadow = true;
                
                this.scene.add(painting);
                
                this.artworks.push({
                    object: painting,
                    data: paintingData
                });
                
                this.loadedArtCount++;
                console.log(`Painting "${paintingData.title}" loaded (${this.loadedArtCount})`);
            },
            undefined,
            (error) => {
                console.error(`Error loading painting "${paintingData.title}":`, error);
            }
        );
    }

    optimizeMaterial(material) {
        if (material.map) {
            material.map.encoding = THREE.sRGBEncoding;
        }
        if (material.emissiveMap) {
            material.emissiveMap.encoding = THREE.sRGBEncoding;
        }
        if (material.normalMap) {
            material.normalScale.setScalar(1);
        }
        
        if (material.transparent || material.opacity < 1) {
            material.transparent = true;
        }
        
        material.needsUpdate = true;
    }

    getArtworkInfo(object) {
        const painting = this.artworks.find(art => art.object === object);
        if (painting) return painting.data;
        
        const sculpture = this.sculptures.find(art => art.object === object);
        if (sculpture) return sculpture.data;
        
        return null;
    }

    updateAnimations(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    getGallery() { return this.gallery; }
    getArtworks() { return this.artworks; }
    getSculptures() { return this.sculptures; }

    createStatueBase() {
        // Statue base configuration - easily customizable
        const baseConfig = {
            radius: 1.49,              // Base radius (larger = wider base)
            height: 0.45,            // Base height (higher = taller base)
            radialSegments: 32,     // Circle smoothness (higher = smoother)
            heightSegments: 1,      // Height segments (usually 1 is enough)
            color: 0xf0ede7,       // Light grey color (hex format)
            roughness: 0,         // Material roughness (0 = mirror, 1 = rough)
            metalness: 0.1,         // Material metalness (0 = non-metal, 1 = metal)
            position: {
                x: 0,               // X position (0 = center)
                y: 0,               // Y position (0 = ground level)
                z: 0                // Z position (0 = center)
            }
        };

        // Create cylinder geometry
        const geometry = new THREE.CylinderGeometry(
            baseConfig.radius,          // Top radius
            baseConfig.radius,          // Bottom radius  
            baseConfig.height,          // Height
            baseConfig.radialSegments,  // Radial segments
            baseConfig.heightSegments   // Height segments
        );

        // Create material with customizable properties
        const material = new THREE.MeshStandardMaterial({
            color: baseConfig.color,
            roughness: baseConfig.roughness,
            metalness: baseConfig.metalness
        });

        // Create the base mesh
        const statueBase = new THREE.Mesh(geometry, material);
        
        // Position the base
        statueBase.position.set(
            baseConfig.position.x,
            baseConfig.position.y + baseConfig.height / 2, // Center vertically
            baseConfig.position.z
        );

        // Enable shadows
        statueBase.castShadow = true;
        statueBase.receiveShadow = true;

        // Add to scene
        this.scene.add(statueBase);

        console.log('Statue base created at center with radius:', baseConfig.radius);
        return statueBase;
    }
}
