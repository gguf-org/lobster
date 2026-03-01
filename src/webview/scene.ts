import * as THREE from 'three';

export class Scene {
    private scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 80, 150);
        
        this.setupLighting();
        this.createOfficeEnvironment();
        this.createFurniture();
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

    private createFurniture(): void {
        // Chair
        this.createChair(new THREE.Vector3(-10, 0, -5), 0);
        
        // Table
        const tablePos = new THREE.Vector3(-10, 0, -10);
        this.createTable(tablePos);
        
        // Laptop on table
        this.createLaptop(new THREE.Vector3(tablePos.x, 1.5, tablePos.z));
        
        // Sofa
        this.createSofa(new THREE.Vector3(10, 0, 5), Math.PI);
    }

    private createChair(position: THREE.Vector3, rotation: number): void {
        const chairGroup = new THREE.Group();
        
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.1, 1),
            woodMaterial
        );
        seat.position.y = 1;
        seat.castShadow = true;
        seat.receiveShadow = true;
        chairGroup.add(seat);
        
        // Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 0.1),
            woodMaterial
        );
        backrest.position.set(0, 1.5, -0.45);
        backrest.castShadow = true;
        chairGroup.add(backrest);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
        const legPositions = [
            [-0.4, 0.5, -0.4],
            [0.4, 0.5, -0.4],
            [-0.4, 0.5, 0.4],
            [0.4, 0.5, 0.4]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            chairGroup.add(leg);
        });
        
        chairGroup.position.copy(position);
        chairGroup.rotation.y = rotation;
        this.scene.add(chairGroup);
    }

    private createTable(position: THREE.Vector3): void {
        const tableGroup = new THREE.Group();
        
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0xA0826D,
            roughness: 0.6,
            metalness: 0.2
        });
        
        // Tabletop
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.15, 2),
            woodMaterial
        );
        top.position.y = 1.5;
        top.castShadow = true;
        top.receiveShadow = true;
        tableGroup.add(top);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5);
        const legPositions = [
            [-1.3, 0.75, -0.8],
            [1.3, 0.75, -0.8],
            [-1.3, 0.75, 0.8],
            [1.3, 0.75, 0.8]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            tableGroup.add(leg);
        });
        
        tableGroup.position.copy(position);
        this.scene.add(tableGroup);
    }

    private createLaptop(position: THREE.Vector3): void {
        const laptopGroup = new THREE.Group();
        
        const laptopMaterial = new THREE.MeshStandardMaterial({
            color: 0x2C3E50,
            roughness: 0.4,
            metalness: 0.6
        });
        
        // Base (keyboard)
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.05, 0.6),
            laptopMaterial
        );
        base.position.y = 0.025;
        base.castShadow = true;
        laptopGroup.add(base);
        
        // Screen
        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.05),
            laptopMaterial
        );
        screen.position.set(0, 0.35, -0.28);
        screen.rotation.x = -0.3;
        screen.castShadow = true;
        laptopGroup.add(screen);
        
        // Screen display (glowing)
        const displayMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A90E2,
            emissive: 0x4A90E2,
            emissiveIntensity: 0.5
        });
        const display = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.55, 0.01),
            displayMaterial
        );
        display.position.set(0, 0.35, -0.255);
        display.rotation.x = -0.3;
        laptopGroup.add(display);
        
        laptopGroup.position.copy(position);
        this.scene.add(laptopGroup);
    }

    private createSofa(position: THREE.Vector3, rotation: number): void {
        const sofaGroup = new THREE.Group();
        
        const fabricMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E4057,
            roughness: 0.9,
            metalness: 0.0
        });
        
        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.5, 1.5),
            fabricMaterial
        );
        seat.position.y = 0.8;
        seat.castShadow = true;
        seat.receiveShadow = true;
        sofaGroup.add(seat);
        
        // Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1.2, 0.3),
            fabricMaterial
        );
        backrest.position.set(0, 1.4, -0.6);
        backrest.castShadow = true;
        sofaGroup.add(backrest);
        
        // Left armrest
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 1.5),
            fabricMaterial
        );
        leftArm.position.set(-1.35, 1.0, 0);
        leftArm.castShadow = true;
        sofaGroup.add(leftArm);
        
        // Right armrest
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 1.5),
            fabricMaterial
        );
        rightArm.position.set(1.35, 1.0, 0);
        rightArm.castShadow = true;
        sofaGroup.add(rightArm);
        
        // Cushions
        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: 0x3D5A80,
            roughness: 0.8
        });
        
        for (let i = -1; i <= 1; i++) {
            const cushion = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.2, 0.8),
                cushionMaterial
            );
            cushion.position.set(i * 0.9, 1.15, 0);
            cushion.castShadow = true;
            sofaGroup.add(cushion);
        }
        
        // Legs
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x1A1A1A,
            roughness: 0.7
        });
        
        const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
        const legPositions = [
            [-1.2, 0.25, -0.5],
            [1.2, 0.25, -0.5],
            [-1.2, 0.25, 0.5],
            [1.2, 0.25, 0.5]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            sofaGroup.add(leg);
        });
        
        sofaGroup.position.copy(position);
        sofaGroup.rotation.y = rotation;
        this.scene.add(sofaGroup);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }
}
