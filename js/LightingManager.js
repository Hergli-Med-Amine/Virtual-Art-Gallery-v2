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
        const pointLight1 = new THREE.PointLight(config.point.color, config.point.intensity, 20);
        pointLight1.position.set(0, 8, 0);
        this.scene.add(pointLight1);
        this.lights.push({ type: 'point', light: pointLight1 });

        const pointLight2 = new THREE.PointLight(config.point.color, config.point.intensity, 20);
        pointLight2.position.set(10, 6, 10);
        this.scene.add(pointLight2);
        this.lights.push({ type: 'point', light: pointLight2 });

        const pointLight3 = new THREE.PointLight(config.point.color, config.point.intensity, 20);
        pointLight3.position.set(-10, 6, -10);
        this.scene.add(pointLight3);
        this.lights.push({ type: 'point', light: pointLight3 });

        console.log('Basic lighting setup complete');
    }

    createRingLight() {
        // Ring Light Parameters - Modify these values to customize the ring
        const ringRadius = 8;           // Radius of the ring (distance from center)
        const ringThickness = 1.5;      // Thickness of the ring (how spread out the lights are)
        const lightIntensity = 3.0;     // Intensity of each light in the ring (increased since we have fewer lights)
        const numberOfLights = 8;       // Number of lights around the ring (reduced to avoid texture unit limit)
        const ringHeight = 6;           // Height of the ring above ground
        const lightColor = 0xffffff;    // Color of the ring lights (hex color)
        const lightDistance = 30;       // How far each light reaches (increased to compensate)
        const enableShadows = true;      // Toggle shadows on/off for performance
        
        // Create lights around the ring
        for (let i = 0; i < numberOfLights; i++) {
            const angle = (i / numberOfLights) * Math.PI * 2;
            
            // Main ring position
            const x = Math.cos(angle) * ringRadius;
            const z = Math.sin(angle) * ringRadius;
            
            // Add some variation for thickness (random offset within thickness range)
            const thicknessOffset = (Math.random() - 0.5) * ringThickness;
            const finalX = x + Math.cos(angle + Math.PI/2) * thicknessOffset;
            const finalZ = z + Math.sin(angle + Math.PI/2) * thicknessOffset;
            
            // Create point light
            const ringLight = new THREE.PointLight(lightColor, lightIntensity, lightDistance);
            ringLight.position.set(finalX, ringHeight, finalZ);
            
            // Only enable shadows for some lights to avoid texture unit limit
            if (enableShadows && i % 2 === 0) { // Only every other light casts shadows
                ringLight.castShadow = true;
                
                // Optimize shadow settings for performance
                ringLight.shadow.mapSize.width = 256;  // Reduced from 512
                ringLight.shadow.mapSize.height = 256; // Reduced from 512
                ringLight.shadow.camera.near = 0.5;
                ringLight.shadow.camera.far = lightDistance * 0.8; // Slightly reduced range
            }
            
            this.scene.add(ringLight);
            this.lights.push({ type: 'ring', light: ringLight });
        }
        
        console.log(`Ring light created with ${numberOfLights} lights at radius ${ringRadius}`);
        console.log(`Shadow-casting lights: ${Math.ceil(numberOfLights/2)} (every other light)`);
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
}
