// Main Virtual Art Gallery Application
import { SceneManager } from './js/SceneManager.js';
import { LightingManager } from './js/LightingManager.js';
import { MovementController } from './js/MovementController.js';
import { ArtLoader } from './js/ArtLoader.js';
import { UIManager } from './js/UIManager.js';

class VirtualArtGallery {
    constructor() {
        this.sceneManager = null;
        this.lightingManager = null;
        this.movementController = null;
        this.artLoader = null;
        this.uiManager = null;
        this.isLoading = true;
    }

    async init() {
        try {
            // Show loading screen
            document.getElementById('loading').style.display = 'flex';
            
            // Initialize core managers
            this.sceneManager = new SceneManager();
            this.sceneManager.init();
            
            this.lightingManager = new LightingManager(this.sceneManager.scene);
            this.lightingManager.setupLighting();
            
            this.movementController = new MovementController(
                this.sceneManager.camera, 
                this.sceneManager.controls
            );
            
            this.artLoader = new ArtLoader(
                this.sceneManager.scene,
                this.sceneManager.camera,
                this.sceneManager.controls
            );
            
            this.uiManager = new UIManager();
              // Load all content
            console.log('Loading gallery model...');
            await this.artLoader.loadGallery();
            
            console.log('Loading artworks...');
            await this.artLoader.loadArtworks();
            
            // Hide loading screen
            this.isLoading = false;
            document.getElementById('loading').style.display = 'none';
            
            console.log('Gallery loaded successfully!');
            
        } catch (error) {
            console.error('Error initializing gallery:', error);
            document.getElementById('loading').innerHTML = '<p>Error loading gallery. Please refresh.</p>';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isLoading) return;
        
        const deltaTime = this.sceneManager.clock.getDelta();
        const currentTime = performance.now();
          // Update movement
        this.movementController.handleMovement(deltaTime);
        
        // Update controls
        this.sceneManager.controls.update();
        
        // Update mixer for animations
        if (this.artLoader.mixer) {
            this.artLoader.mixer.update(deltaTime);
        }
        
        // Update UI
        this.uiManager.updateFPS(currentTime);
        this.uiManager.updateTriangleCount(this.artLoader.gallery);
        
        // Render
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    }

    // Public API for external access
    getScene() { return this.sceneManager?.scene; }
    getCamera() { return this.sceneManager?.camera; }
    getRenderer() { return this.sceneManager?.renderer; }
}

// Create and start the gallery
const gallery = new VirtualArtGallery();
gallery.init().then(() => {
    gallery.animate();
});

// Export for external access
window.gallery = gallery;


