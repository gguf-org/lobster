import * as THREE from 'three';
import { Scene as GameScene } from './scene';
import { Lobster } from './lobster';
import { Counters } from './counters';
import { UI } from './ui';
import { InteractionSystem } from './interactionSystem';

class Game {
    private canvas: HTMLCanvasElement;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private sceneManager: GameScene;
    private lobster: Lobster;
    private counters: Counters;
    private ui: UI;
    private interactionSystem: InteractionSystem;
    
    private cameraDistance: number = 8;
    private cameraHeight: number = 5;
    private cameraAngle: number = 0;

    constructor() {
        const canvasElement = document.getElementById('game-canvas');
        if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error('Canvas element not found');
        }
        this.canvas = canvasElement;
        
        this.setupRenderer();
        this.setupCamera();
        
        // Initialize game
        this.initializeGame();
        
        // Mouse controls for camera
        this.setupMouseControls();
        
        // Start game loop
        this.animate();
    }

    private initializeGame(): void {
        // Initialize game systems
        this.sceneManager = new GameScene();
        this.scene = this.sceneManager.getScene();
        
        this.lobster = new Lobster(this.scene);
        this.counters = new Counters(this.scene, this.lobster);
        this.ui = new UI();
        this.interactionSystem = new InteractionSystem(this.counters, this.lobster, this.ui);
    }

    private setupRenderer(): void {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    private setupCamera(): void {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    private setupMouseControls(): void {
        let isDragging = false;
        let previousMouseX = 0;

        this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            isDragging = true;
            previousMouseX = e.clientX;
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMouseX;
                this.cameraAngle -= deltaX * 0.005;
                previousMouseX = e.clientX;
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            this.cameraDistance += e.deltaY * 0.01;
            this.cameraDistance = Math.max(4, Math.min(15, this.cameraDistance));
        });
    }

    private updateCamera(): void {
        const lobsterPos = this.lobster.getPosition();
        const lobsterRot = this.lobster.getRotation();
        
        // Calculate camera position behind and above the lobster
        const totalAngle = lobsterRot + this.cameraAngle;
        this.camera.position.x = lobsterPos.x - Math.sin(totalAngle) * this.cameraDistance;
        this.camera.position.y = lobsterPos.y + this.cameraHeight;
        this.camera.position.z = lobsterPos.z - Math.cos(totalAngle) * this.cameraDistance;
        
        // Look at lobster
        this.camera.lookAt(lobsterPos.x, lobsterPos.y + 1, lobsterPos.z);
    }

    private animate = (): void => {
        requestAnimationFrame(this.animate);

        // Update game systems
        this.lobster.update();
        
        const nearestCounter = this.counters.update();
        this.interactionSystem.update(nearestCounter);
        
        this.updateCamera();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    };
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
