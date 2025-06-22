// Main Virtual Art Gallery Application
import { SceneManager } from './js/SceneManager.js';
import { LightingManager } from './js/LightingManager.js';
import { MovementController } from './js/MovementController.js';
import { ArtLoader } from './js/ArtLoader.js';
import { UIManager } from './js/UIManager.js';
import { ArtworkController } from './js/ArtworkController.js';
import { InspectionMode } from './js/InspectionMode.js';

class VirtualArtGallery {
    constructor() {
        this.sceneManager = null;
        this.lightingManager = null;        this.movementController = null;
        this.artLoader = null;
        this.uiManager = null;
        this.artworkController = null;
        this.inspectionMode = null;
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
              this.uiManager = new UIManager();            // Initialize artwork controller for interactive positioning
            this.artworkController = new ArtworkController(
                this.sceneManager.scene,
                this.sceneManager.camera,
                this.sceneManager.renderer,
                this.artLoader
            );            // Initialize inspection mode for detailed viewing
            this.inspectionMode = new InspectionMode(
                this.sceneManager.renderer,
                this.artLoader,
                this.sceneManager,
                this.artworkController
            );

            // Set up bidirectional reference
            this.artworkController.setInspectionMode(this.inspectionMode);
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
          // Check if we're in inspection mode
        const isInspecting = this.inspectionMode?.isActive || false;
        
        if (isInspecting) {
            // Inspection mode - update and render inspection scene
            this.inspectionMode.update();
            this.inspectionMode.render();
        } else {
            // Normal gallery mode - update movement and render main scene
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
            
            // Render main scene
            this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
        }
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


