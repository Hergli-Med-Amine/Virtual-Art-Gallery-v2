// Lighting system management
import * as THREE from 'three';

export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
    }

    setupLighting() {
        // Lighting configuration - easily adjustable
        const config = {
            ambient: {
                color: 0xffffff,
                intensity: 0.5
            },
            directional: {
                color: 0xffffff,
                intensity: 0
            },
            fill: {
                color: 0xffffff,
                intensity: 0.2
            },
            point: {
                color: 0xffffff,
                intensity: 10
            }
        };

        // Ambient light
        const ambientLight = new THREE.AmbientLight(config.ambient.color, config.ambient.intensity);
        this.scene.add(ambientLight);
        this.lights.push({ type: 'ambient', light: ambientLight });

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(config.directional.color, config.directional.intensity);
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
        this.scene.add(directionalLight);
        this.lights.push({ type: 'directional', light: directionalLight });

        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(config.fill.color, config.fill.intensity);
        fillLight1.position.set(-10, 10, 5);
        this.scene.add(fillLight1);
        this.lights.push({ type: 'fill', light: fillLight1 });

        const fillLight2 = new THREE.DirectionalLight(config.fill.color, config.fill.intensity);
        fillLight2.position.set(5, 10, -10);
        this.scene.add(fillLight2);
        this.lights.push({ type: 'fill', light: fillLight2 });

        // Point lights for interior
        // const pointLight1 = new THREE.PointLight(config.point.color, config.point.intensity, 20);
        // pointLight1.position.set(0, 8, 0);
        // this.scene.add(pointLight1);
        // this.lights.push({ type: 'point', light: pointLight1 });

        // const pointLight2 = new THREE.PointLight(config.point.color, config.point.intensity, 20);
        // pointLight2.position.set(10, 6, 10);
        // this.scene.add(pointLight2);
        // this.lights.push({ type: 'point', light: pointLight2 });

        // const pointLight3 = new THREE.PointLight(config.point.color, config.point.intensity, 20);
        // pointLight3.position.set(-10, 6, -10);
        // this.scene.add(pointLight3);
        // this.lights.push({ type: 'point', light: pointLight3 });

        console.log('Basic lighting setup complete');
        
        // Add circular point lights around the center
        this.createCircularPointLights(
            12,         // Number of lights
            6.65,         // Radius from center
            5,          // Light intensity
            0xffffff,   // White color
            3         // Height above ground
        );
    }

    createCircularPointLights(numberOfLights = 8, radius = 10, intensity = 5, color = 0xffffff, height = 8) {
        // Circular Point Lights Configuration
        const circularConfig = {
            numberOfLights: numberOfLights,    // Number of lights around the circle
            radius: radius,                    // Radius of the circle (distance from center)
            intensity: intensity,              // Light intensity for each point light
            color: color,                      // Light color (hex format)
            height: height,                    // Height position of the lights            distance: 25,                      // How far each light reaches
            decay: 2,                          // Light decay rate (2 = realistic)
            enableShadows: false,              // Shadows disabled for performance
            pointDown: true,                   // Make lights point downward
            showHelpers: true,                 // Show arrow helpers for light visualization
            helperSize: 1,                     // Size of the arrow helpers
            helperColor: 0xffff00              // Color of the arrow helpers (yellow)
        };

        console.log(`Creating ${circularConfig.numberOfLights} circular point lights at radius ${circularConfig.radius}`);

        // Create lights distributed equally around the circle
        for (let i = 0; i < circularConfig.numberOfLights; i++) {
            // Calculate angle for equal distribution
            const angle = (i / circularConfig.numberOfLights) * Math.PI * 2;
            
            // Calculate position on the circle
            const x = Math.cos(angle) * circularConfig.radius;
            const z = Math.sin(angle) * circularConfig.radius;
            
            // Create point light
            const circularLight = new THREE.PointLight(
                circularConfig.color, 
                circularConfig.intensity, 
                circularConfig.distance,
                circularConfig.decay
            );
            
            // Position the light
            circularLight.position.set(x, circularConfig.height, z);
              // Shadows disabled for performance as requested
            circularLight.castShadow = circularConfig.enableShadows;
            
            // Add arrow helper to visualize light position and direction
            if (circularConfig.showHelpers) {
                // Create arrow pointing downward from light position
                const direction = new THREE.Vector3(0, -1, 0); // Point downward
                const origin = new THREE.Vector3(x, circularConfig.height, z);
                const length = circularConfig.helperSize;
                
                const arrowHelper = new THREE.ArrowHelper(
                    direction,              // Direction vector (downward)
                    origin,                 // Starting position
                    length,                 // Length of arrow
                    circularConfig.helperColor,  // Color of arrow
                    length * 0.3,           // Head length (30% of total)
                    length * 0.2            // Head width (20% of total)
                );
                
                // Add helper to scene
                this.scene.add(arrowHelper);
                
                // Store reference to helper for potential removal later
                circularLight.helper = arrowHelper;
            }
            
            // Make light point downward if specified
            if (circularConfig.pointDown) {
                // Point lights don't have direction, but we can add a target helper
                // This is mainly for visual reference - point lights radiate in all directions
                circularLight.target = new THREE.Vector3(x, 0, z); // Point toward ground
            }
            
            // Add to scene and track
            this.scene.add(circularLight);
            this.lights.push({ 
                type: 'circular', 
                light: circularLight,
                index: i,
                angle: angle,
                config: circularConfig
            });
        }
        
        console.log(`Circular lighting setup complete - ${circularConfig.numberOfLights} lights created`);
        console.log(`Radius: ${circularConfig.radius}, Height: ${circularConfig.height}, Intensity: ${circularConfig.intensity}`);
        console.log(`Shadows: ${circularConfig.enableShadows ? 'Enabled' : 'Disabled (for performance)'}`);
        
        return this.lights.filter(lightObj => lightObj.type === 'circular');
    }

    // Method to adjust light intensity by type
    adjustLightIntensity(type, intensity) {
        this.lights.forEach(lightObj => {
            if (lightObj.type === type) {
                lightObj.light.intensity = intensity;
            }
        });
    }

    // Get all lights of a specific type
    getLightsByType(type) {
        return this.lights.filter(lightObj => lightObj.type === type);
    }

    // Method to toggle light helpers visibility
    toggleLightHelpers(type = 'circular', visible = true) {
        this.lights.forEach(lightObj => {
            if (lightObj.type === type && lightObj.light.helper) {
                lightObj.light.helper.visible = visible;
            }
        });
        console.log(`Light helpers for ${type} lights: ${visible ? 'Visible' : 'Hidden'}`);
    }

    // Method to remove all light helpers
    removeLightHelpers(type = 'circular') {
        this.lights.forEach(lightObj => {
            if (lightObj.type === type && lightObj.light.helper) {
                this.scene.remove(lightObj.light.helper);
                lightObj.light.helper = null;
            }
        });
        console.log(`Light helpers removed for ${type} lights`);
    }
}
