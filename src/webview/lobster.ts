import * as THREE from 'three';

export class Lobster {
    private scene: THREE.Scene;
    private position: THREE.Vector3;
    private rotation: number;
    private speed: number;
    private rotationSpeed: number;
    private lobsterGroup: THREE.Group;
    private keys: {
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
        interact: boolean;
    };

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 1, 0);
        this.rotation = 0;
        this.speed = 0.1;
        this.rotationSpeed = 0.05;
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            interact: false
        };
        
        this.createLobster();
        this.setupControls();
    }

    private createLobster(): void {
        this.lobsterGroup = new THREE.Group();
        
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4500,
            roughness: 0.5,
            metalness: 0.2
        });

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.8, 2),
            bodyMaterial
        );
        body.position.y = 0.4;
        body.castShadow = true;
        this.lobsterGroup.add(body);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            bodyMaterial
        );
        head.position.set(0, 0.6, 1.2);
        head.scale.set(1, 0.8, 1);
        head.castShadow = true;
        this.lobsterGroup.add(head);

        // Tail segments
        for (let i = 0; i < 3; i++) {
            const tailSegment = new THREE.Mesh(
                new THREE.BoxGeometry(1.2 - i * 0.2, 0.6 - i * 0.1, 0.5),
                bodyMaterial
            );
            tailSegment.position.set(0, 0.3, -1.5 - i * 0.6);
            tailSegment.castShadow = true;
            this.lobsterGroup.add(tailSegment);
        }

        // Claws
        const clawMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc3300,
            roughness: 0.6
        });

        // Left claw
        const leftClawArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.2),
            clawMaterial
        );
        leftClawArm.position.set(-0.9, 0.5, 0.5);
        leftClawArm.rotation.z = -Math.PI / 4;
        this.lobsterGroup.add(leftClawArm);

        const leftClaw = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.6),
            clawMaterial
        );
        leftClaw.position.set(-1.5, 0.5, 1);
        this.lobsterGroup.add(leftClaw);

        // Right claw
        const rightClawArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.2),
            clawMaterial
        );
        rightClawArm.position.set(0.9, 0.5, 0.5);
        rightClawArm.rotation.z = Math.PI / 4;
        this.lobsterGroup.add(rightClawArm);

        const rightClaw = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.6),
            clawMaterial
        );
        rightClaw.position.set(1.5, 0.5, 1);
        this.lobsterGroup.add(rightClaw);

        // Legs
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.08, 0.8),
                    clawMaterial
                );
                leg.position.set(
                    side * 0.8,
                    0.1,
                    0.5 - i * 0.6
                );
                leg.rotation.z = side * Math.PI / 6;
                this.lobsterGroup.add(leg);
            }
        }

        // Eyes
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            eyeMaterial
        );
        leftEye.position.set(-0.3, 0.8, 1.5);
        this.lobsterGroup.add(leftEye);

        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            eyeMaterial
        );
        rightEye.position.set(0.3, 0.8, 1.5);
        this.lobsterGroup.add(rightEye);

        this.lobsterGroup.position.copy(this.position);
        this.scene.add(this.lobsterGroup);
    }

    private setupControls(): void {
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = true;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = true;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = true;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = true;
                    break;
                case 'e':
                    this.keys.interact = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = false;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = false;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = false;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = false;
                    break;
                case 'e':
                    this.keys.interact = false;
                    break;
            }
        });
    }

    public update(): void {
        // Rotation
        if (this.keys.left) {
            this.rotation += this.rotationSpeed;
        }
        if (this.keys.right) {
            this.rotation -= this.rotationSpeed;
        }

        // Movement
        let moved = false;
        if (this.keys.forward) {
            this.position.x += Math.sin(this.rotation) * this.speed;
            this.position.z += Math.cos(this.rotation) * this.speed;
            moved = true;
        }
        if (this.keys.backward) {
            this.position.x -= Math.sin(this.rotation) * this.speed;
            this.position.z -= Math.cos(this.rotation) * this.speed;
            moved = true;
        }

        // Boundary checking
        this.position.x = Math.max(-44, Math.min(44, this.position.x));
        this.position.z = Math.max(-44, Math.min(44, this.position.z));

        // Update lobster position and rotation
        this.lobsterGroup.position.copy(this.position);
        this.lobsterGroup.rotation.y = this.rotation;

        // Simple walking animation
        if (moved) {
            const bobAmount = Math.sin(Date.now() * 0.01) * 0.05;
            this.lobsterGroup.position.y = this.position.y + bobAmount;
        }
    }

    public getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    public getRotation(): number {
        return this.rotation;
    }

    public isInteracting(): boolean {
        return this.keys.interact;
    }

    public resetInteract(): void {
        this.keys.interact = false;
    }
}
