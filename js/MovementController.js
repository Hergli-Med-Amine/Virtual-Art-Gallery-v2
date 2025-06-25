// Movement and controls system
import * as THREE from 'three';

export class MovementController {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        this.moveSpeed = 5.0;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.up = true;
                event.preventDefault();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.down = true;
                break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.up = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.down = false;
                break;
        }
    }

    handleMovement(deltaTime) {
        const moveDistance = this.moveSpeed * deltaTime;

        // Get the camera's current direction vectors
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);

        // Get forward direction (where camera is looking)
        this.camera.getWorldDirection(forward);
        
        // Get right direction (perpendicular to forward and up)
        right.crossVectors(forward, up).normalize();
        
        // Movement vectors
        const moveVector = new THREE.Vector3();

        if (this.keys.forward) {
            moveVector.add(forward.clone().multiplyScalar(moveDistance));
        }
        if (this.keys.backward) {
            moveVector.add(forward.clone().multiplyScalar(-moveDistance));
        }
        if (this.keys.left) {
            moveVector.add(right.clone().multiplyScalar(-moveDistance));
        }
        if (this.keys.right) {
            moveVector.add(right.clone().multiplyScalar(moveDistance));
        }
        if (this.keys.up) {
            moveVector.y += moveDistance;
        }
        if (this.keys.down) {
            moveVector.y -= moveDistance;
        }

        // Apply movement to both camera and controls target
        if (moveVector.length() > 0) {
            this.camera.position.add(moveVector);
            this.controls.target.add(moveVector);
            this.controls.update();
        }
    }

    // Method to change movement speed
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }

    // Method to get current movement speed
    getMoveSpeed() {
        return this.moveSpeed;
    }
}
