// UI and statistics management
export class UIManager {
    constructor() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
    }

    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = `FPS: ${this.fps}`;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    updateTriangleCount(gallery) {
        if (gallery) {
            let triangles = 0;
            gallery.traverse((node) => {
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

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showLoading(text = 'Loading...') {
        const loadingElement = document.getElementById('loading');
        loadingElement.textContent = text;
        loadingElement.style.display = 'block';
    }

    updateLoadingProgress(percent, text = 'Loading') {
        document.getElementById('loading').textContent = `${text}... ${percent}%`;
    }

    // Method to add custom UI elements
    addInfoPanel(artwork) {
        // This could be expanded to show artwork information
        console.log('Selected artwork:', artwork);
    }

    // Method to toggle UI visibility
    toggleControls() {
        const controls = document.getElementById('controls');
        controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
    }

    toggleStats() {
        const stats = document.getElementById('stats');
        stats.style.display = stats.style.display === 'none' ? 'block' : 'none';
    }
}
