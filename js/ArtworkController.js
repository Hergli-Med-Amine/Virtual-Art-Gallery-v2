// Interactive artwork positioning controller
import * as THREE from 'three';

export class ArtworkController {
    constructor(scene, camera, renderer, artLoader) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.artLoader = artLoader;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedArtwork = null;
        this.controlPanel = null;
        this.inspectionMode = null;  // Reference to inspection mode
        // Mode control: false = inspection mode, true = positioning mode
        this.isPositioningMode = false;

        console.log(`🎮 ArtworkController initialized - starting in ${this.isPositioningMode ? 'Positioning' : 'Inspection'} mode`);

        this.setupEventListeners();
            this.createControlPanel();
        
    }
    // Check if positioning mode is active
    get isPositioning() {
        return this.selectedArtwork !== null && this.isPositioningMode;
    }

    // Toggle between positioning and inspection modes
    togglePositioningMode() {
        this.isPositioningMode = !this.isPositioningMode;
        this.updateModeButton();

        // Deselect any currently selected artwork when switching modes
        if (this.selectedArtwork) {
            this.deselectArtwork();
        }

        console.log(`Mode switched to: ${this.isPositioningMode ? 'Positioning' : 'Inspection'}`);
        return this.isPositioningMode;
    }
    // Get current mode as string
    getCurrentMode() {
        return this.isPositioningMode ? 'Positioning' : 'Inspection';
    }

    // Set the inspection mode reference
    setInspectionMode(inspectionMode) {
        this.inspectionMode = inspectionMode;
    }

    setupEventListeners() {
        // Mouse click event for handling both positioning and inspection
        this.renderer.domElement.addEventListener('click', (event) => {
            console.log(`🎯 Canvas clicked - isPositioningMode: ${this.isPositioningMode}`);

            if (this.isPositioningMode) {
                // In positioning mode - handle positioning clicks
                console.log('📍 Calling positioning click handler');
                this.onMouseClick(event);
            } else {
                // In inspection mode - delegate to inspection mode if available
                console.log('🔍 Calling inspection click handler');
                if (this.inspectionMode && !this.inspectionMode.isActive) {
                    this.handleInspectionClick(event);
                } else if (!this.inspectionMode) {
                    console.log('❌ No inspection mode reference available');
                } else if (this.inspectionMode.isActive) {
                    console.log('❌ Inspection mode is already active');
                }
            }
        });

        // Escape key to deselect
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                this.deselectArtwork();
            }
        });
    }

    handleInspectionClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get all artwork objects
        const artworkObjects = [];
        this.artLoader.artworks.forEach(artwork => {
            artworkObjects.push(artwork.object);
        });
        this.artLoader.sculptures.forEach(sculpture => {
            artworkObjects.push(sculpture.object);
        });

        // Check for intersections
        const intersects = this.raycaster.intersectObjects(artworkObjects, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Find the artwork data
            let artworkData = null;

            // Check paintings
            for (let artwork of this.artLoader.artworks) {
                if (artwork.object === clickedObject) {
                    artworkData = artwork;
                    break;
                }
            }

            // Check sculptures
            if (!artworkData) {
                for (let sculpture of this.artLoader.sculptures) {
                    if (sculpture.object === clickedObject ||
                        sculpture.object.children.includes(clickedObject)) {
                        artworkData = sculpture;
                        break;
                    }
                }
            } if (artworkData && this.inspectionMode) {
                console.log('🔍 In inspection mode - entering inspection for:', artworkData.data.title);
                console.log('🔍 Making sure positioning panel is hidden');
                this.hideControlPanel(); // Ensure positioning panel is hidden
                this.inspectionMode.enter(artworkData);
            }
        }
    }

    onMouseClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get all artwork objects
        const artworkObjects = [];
        this.artLoader.artworks.forEach(artwork => {
            artworkObjects.push(artwork.object);
        });
        this.artLoader.sculptures.forEach(sculpture => {
            artworkObjects.push(sculpture.object);
        });

        // Check for intersections
        const intersects = this.raycaster.intersectObjects(artworkObjects, true);

        if (intersects.length > 0) {
            // Find the artwork data for the clicked object
            let clickedArtwork = null;
            const clickedObject = intersects[0].object;

            // Check if it's a painting
            for (let artwork of this.artLoader.artworks) {
                if (artwork.object === clickedObject || artwork.object.children.includes(clickedObject)) {
                    clickedArtwork = artwork;
                    break;
                }
            }

            // Check if it's a sculpture
            if (!clickedArtwork) {
                for (let sculpture of this.artLoader.sculptures) {
                    if (sculpture.object === clickedObject || sculpture.object.children.includes(clickedObject)) {
                        clickedArtwork = sculpture;
                        break;
                    }
                }
            }

            if (clickedArtwork) {
                this.selectArtwork(clickedArtwork);
            }
        } else {
            this.deselectArtwork();
        }
    } 
    
    selectArtwork(artwork) {
        // Only allow artwork selection in positioning mode
        if (!this.isPositioningMode) {
            console.log('❌ Cannot select artwork - not in positioning mode');
            return;
        }

        this.selectedArtwork = artwork;
        this.showControlPanel(artwork);

        // Add visual indicator (optional - you can customize this)
        this.addSelectionIndicator(artwork.object);

        console.log('Selected artwork:', artwork.data.title);
    }    deselectArtwork() {
        if (this.selectedArtwork) {
            this.removeSelectionIndicator();
            this.selectedArtwork = null;
            // Only hide control panel if we're in positioning mode
            if (this.isPositioningMode) {
                this.hideControlPanel();
            }
            console.log('Deselected artwork');
        }
    }

    addSelectionIndicator(object) {
        // Remove previous indicator
        this.removeSelectionIndicator();

        // Create a wireframe box around the selected object
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const geometry = new THREE.BoxGeometry(size.x * 1.1, size.y * 1.1, size.z * 1.1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });

        this.selectionIndicator = new THREE.Mesh(geometry, material);
        this.selectionIndicator.position.copy(center);
        this.scene.add(this.selectionIndicator);
    }

    removeSelectionIndicator() {
        if (this.selectionIndicator) {
            this.scene.remove(this.selectionIndicator);
            this.selectionIndicator = null;
        }
    }

    createControlPanel() {
        // Create mode toggle button first
        this.createModeToggleButton();

        const panel = document.createElement('div');
        panel.id = 'artwork-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        panel.innerHTML = `
            <h3 style="margin-top: 0; color: #4CAF50;">Artwork Controller</h3>
            <div id="artwork-title" style="margin-bottom: 15px; font-weight: bold; color: #FFC107;"></div>
              <div style="margin-bottom: 10px;">
                <strong>Position:</strong>
                <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
                    <label style="width: 20px;">X:</label>
                    <input type="range" id="pos-x" min="-20" max="20" step="0.01" style="flex: 1;">
                    <input type="number" id="pos-x-input" step="0.01" style="width: 60px; padding: 2px;">
                    <span id="pos-x-value" style="width: 40px; text-align: right;">0</span>
                </div>
                <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
                    <label style="width: 20px;">Y:</label>
                    <input type="range" id="pos-y" min="-5" max="10" step="0.01" style="flex: 1;">
                    <input type="number" id="pos-y-input" step="0.01" style="width: 60px; padding: 2px;">
                    <span id="pos-y-value" style="width: 40px; text-align: right;">0</span>
                </div>
                <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
                    <label style="width: 20px;">Z:</label>
                    <input type="range" id="pos-z" min="-20" max="20" step="0.01" style="flex: 1;">
                    <input type="number" id="pos-z-input" step="0.01" style="width: 60px; padding: 2px;">
                    <span id="pos-z-value" style="width: 40px; text-align: right;">0</span>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Rotation:</strong>
                <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
                    <label style="width: 20px;">X:</label>
                    <input type="range" id="rot-x" min="-180" max="180" step="0.1" style="flex: 1;">
                    <input type="number" id="rot-x-input" step="0.1" style="width: 60px; padding: 2px;">
                    <span id="rot-x-value" style="width: 40px; text-align: right;">0°</span>
                </div>
                <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
                    <label style="width: 20px;">Y:</label>
                    <input type="range" id="rot-y" min="-360" max="360" step="0.1" style="flex: 1;">
                    <input type="number" id="rot-y-input" step="0.1" style="width: 60px; padding: 2px;">
                    <span id="rot-y-value" style="width: 40px; text-align: right;">0°</span>
                </div>
                <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
                    <label style="width: 20px;">Z:</label>
                    <input type="range" id="rot-z" min="-180" max="180" step="0.1" style="flex: 1;">
                    <input type="number" id="rot-z-input" step="0.1" style="width: 60px; padding: 2px;">
                    <span id="rot-z-value" style="width: 40px; text-align: right;">0°</span>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                <strong>JSON Coordinates:</strong>
                <div id="json-output" style="font-family: monospace; font-size: 10px; margin-top: 5px; white-space: pre-wrap;"></div>
            </div>
            
            <div style="margin-top: 15px;">
                <button id="copy-json" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Copy JSON</button>
                <button id="reset-position" style="padding: 8px 16px; background: #FF5722; color: white; border: none; border-radius: 4px; cursor: pointer;">Reset</button>
            </div>
        `;

        document.body.appendChild(panel);
        this.controlPanel = panel;

        // Setup slider event listeners
        this.setupSliderListeners();
    }

    createModeToggleButton() {
        this.modeButton = document.createElement('button');
        this.modeButton.id = 'mode-toggle-button';
        this.modeButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 12px 20px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;

        this.modeButton.addEventListener('click', () => {
            this.togglePositioningMode();
        });

        this.modeButton.addEventListener('mouseenter', () => {
            this.modeButton.style.transform = 'scale(1.05)';
        });

        this.modeButton.addEventListener('mouseleave', () => {
            this.modeButton.style.transform = 'scale(1)';
        });

        document.body.appendChild(this.modeButton);
        this.updateModeButton();
    }

    updateModeButton() {
        if (this.modeButton) {
            if (this.isPositioningMode) {
                this.modeButton.textContent = '🎨 Positioning Mode';
                this.modeButton.style.background = '#4CAF50';
                console.log('🔄 Button updated to: Positioning Mode (green)');
            } else {
                this.modeButton.textContent = '🔍 Inspection Mode';
                this.modeButton.style.background = '#2196F3';
                console.log('🔄 Button updated to: Inspection Mode (blue)');
            }
        }
    } setupSliderListeners() {
        const controls = [
            { id: 'pos-x', inputId: 'pos-x-input', property: 'position', axis: 'x', valueId: 'pos-x-value' },
            { id: 'pos-y', inputId: 'pos-y-input', property: 'position', axis: 'y', valueId: 'pos-y-value' },
            { id: 'pos-z', inputId: 'pos-z-input', property: 'position', axis: 'z', valueId: 'pos-z-value' },
            { id: 'rot-x', inputId: 'rot-x-input', property: 'rotation', axis: 'x', valueId: 'rot-x-value', isDegrees: true },
            { id: 'rot-y', inputId: 'rot-y-input', property: 'rotation', axis: 'y', valueId: 'rot-y-value', isDegrees: true },
            { id: 'rot-z', inputId: 'rot-z-input', property: 'rotation', axis: 'z', valueId: 'rot-z-value', isDegrees: true }
        ];

        controls.forEach(control => {
            const sliderElement = document.getElementById(control.id);
            const inputElement = document.getElementById(control.inputId);
            const valueElement = document.getElementById(control.valueId);

            // Slider event listener
            sliderElement.addEventListener('input', (event) => {
                const value = parseFloat(event.target.value);
                this.updateArtworkTransform(control, value, inputElement, valueElement);
            });

            // Number input event listener
            inputElement.addEventListener('input', (event) => {
                const value = parseFloat(event.target.value) || 0;
                // Update slider to match input
                sliderElement.value = value;
                this.updateArtworkTransform(control, value, inputElement, valueElement);
            });

            // Handle Enter key and blur for number inputs
            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    inputElement.blur();
                }
            });

            inputElement.addEventListener('blur', (event) => {
                const value = parseFloat(event.target.value) || 0;
                // Clamp value to slider limits
                const min = parseFloat(sliderElement.min);
                const max = parseFloat(sliderElement.max);
                const clampedValue = Math.max(min, Math.min(max, value));

                if (clampedValue !== value) {
                    inputElement.value = clampedValue;
                    sliderElement.value = clampedValue;
                    this.updateArtworkTransform(control, clampedValue, inputElement, valueElement);
                }
            });
        });

        // Copy JSON button
        document.getElementById('copy-json').addEventListener('click', () => {
            this.copyJSONToClipboard();
        });

        // Reset button
        document.getElementById('reset-position').addEventListener('click', () => {
            this.resetArtworkPosition();
        });
    }

    updateArtworkTransform(control, value, inputElement, valueElement) {
        if (!this.selectedArtwork) return;

        const displayValue = control.isDegrees ? value.toFixed(1) : value.toFixed(3);

        // Update display value
        valueElement.textContent = control.isDegrees ? `${displayValue}°` : displayValue;

        // Update number input if it wasn't the source of the change
        if (parseFloat(inputElement.value) !== value) {
            inputElement.value = displayValue;
        }

        // Apply transformation to artwork
        if (control.property === 'position') {
            this.selectedArtwork.object[control.property][control.axis] = value;
        } else if (control.property === 'rotation') {
            this.selectedArtwork.object[control.property][control.axis] = THREE.MathUtils.degToRad(value);
        }

        this.updateJSONDisplay();
    } showControlPanel(artwork) {
        // Only show control panel in positioning mode
        if (!this.isPositioningMode) {
            console.log('❌ Cannot show control panel - not in positioning mode');
            return;
        }

        this.controlPanel.style.display = 'block';

        // Update title
        document.getElementById('artwork-title').textContent = artwork.data.title;

        // Update slider and input values
        const pos = artwork.object.position;
        const rot = artwork.object.rotation;

        // Position controls
        document.getElementById('pos-x').value = pos.x;
        document.getElementById('pos-x-input').value = pos.x.toFixed(3);
        document.getElementById('pos-y').value = pos.y;
        document.getElementById('pos-y-input').value = pos.y.toFixed(3);
        document.getElementById('pos-z').value = pos.z;
        document.getElementById('pos-z-input').value = pos.z.toFixed(3);

        // Rotation controls
        const rotXDeg = THREE.MathUtils.radToDeg(rot.x);
        const rotYDeg = THREE.MathUtils.radToDeg(rot.y);
        const rotZDeg = THREE.MathUtils.radToDeg(rot.z);

        document.getElementById('rot-x').value = rotXDeg;
        document.getElementById('rot-x-input').value = rotXDeg.toFixed(1);
        document.getElementById('rot-y').value = rotYDeg;
        document.getElementById('rot-y-input').value = rotYDeg.toFixed(1);
        document.getElementById('rot-z').value = rotZDeg;
        document.getElementById('rot-z-input').value = rotZDeg.toFixed(1);

        // Update value displays
        document.getElementById('pos-x-value').textContent = pos.x.toFixed(3);
        document.getElementById('pos-y-value').textContent = pos.y.toFixed(3);
        document.getElementById('pos-z-value').textContent = pos.z.toFixed(3);

        document.getElementById('rot-x-value').textContent = `${rotXDeg.toFixed(1)}°`;
        document.getElementById('rot-y-value').textContent = `${rotYDeg.toFixed(1)}°`;
        document.getElementById('rot-z-value').textContent = `${rotZDeg.toFixed(1)}°`;

        this.updateJSONDisplay();
    }    hideControlPanel() {
        if (this.controlPanel) {
            this.controlPanel.style.display = 'none';
            console.log('🚫 Control panel hidden');
        }
    }

    updateJSONDisplay() {
        if (!this.selectedArtwork) return;

        const pos = this.selectedArtwork.object.position;
        const rot = this.selectedArtwork.object.rotation;

        const jsonData = {
            position: {
                x: parseFloat(pos.x.toFixed(3)),
                y: parseFloat(pos.y.toFixed(3)),
                z: parseFloat(pos.z.toFixed(3))
            },
            rotation: {
                x: parseFloat(rot.x.toFixed(6)),
                y: parseFloat(rot.y.toFixed(6)),
                z: parseFloat(rot.z.toFixed(6))
            }
        };

        document.getElementById('json-output').textContent = JSON.stringify(jsonData, null, 2);
    }

    copyJSONToClipboard() {
        const jsonText = document.getElementById('json-output').textContent;
        navigator.clipboard.writeText(jsonText).then(() => {
            console.log('JSON coordinates copied to clipboard!');

            // Visual feedback
            const button = document.getElementById('copy-json');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#4CAF50';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#4CAF50';
            }, 1000);
        });
    }

    resetArtworkPosition() {
        if (!this.selectedArtwork) return;

        // Reset to original position from JSON data
        const originalData = this.selectedArtwork.data;

        this.selectedArtwork.object.position.set(
            originalData.position.x,
            originalData.position.y,
            originalData.position.z
        );

        this.selectedArtwork.object.rotation.set(
            originalData.rotation.x,
            originalData.rotation.y,
            originalData.rotation.z
        );

        // Update the control panel
        this.showControlPanel(this.selectedArtwork);

        console.log('Reset artwork to original position');
    }    // Cleanup method
    destroy() {
        this.removeSelectionIndicator();
        if (this.controlPanel) {
            document.body.removeChild(this.controlPanel);
        }
        if (this.modeButton) {
            document.body.removeChild(this.modeButton);
        }
    }
}
