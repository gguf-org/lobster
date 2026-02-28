import * as THREE from 'three';

export class Scene {
    private scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 80, 150);
        
        this.setupLighting();
        this.createOfficeEnvironment();
    }

    private setupLighting(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        const pointLights = [
            new THREE.Vector3(-20, 5, -20),
            new THREE.Vector3(20, 5, 20),
            new THREE.Vector3(-20, 5, 20),
            new THREE.Vector3(20, 5, -20)
        ];

        pointLights.forEach(pos => {
            const light = new THREE.PointLight(0xffffff, 0.3, 30);
            light.position.copy(pos);
            this.scene.add(light);
        });
    }

    private createOfficeEnvironment(): void {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.3,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(100, 100);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 8;
        this.scene.add(ceiling);

        // Transparent glass walls
        this.createGlassWalls();

        // Grid helper
        const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    private createGlassWalls(): void {
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.9,
            thickness: 0.5
        });

        const walls = [
            { pos: new THREE.Vector3(0, 4, -45), rot: 0 },
            { pos: new THREE.Vector3(0, 4, 45), rot: Math.PI },
            { pos: new THREE.Vector3(-45, 4, 0), rot: Math.PI / 2 },
            { pos: new THREE.Vector3(45, 4, 0), rot: -Math.PI / 2 }
        ];

        walls.forEach(({ pos, rot }) => {
            const wall = new THREE.Mesh(
                new THREE.PlaneGeometry(90, 8),
                glassMaterial
            );
            wall.position.copy(pos);
            wall.rotation.y = rot;
            this.scene.add(wall);
        });
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }
}
