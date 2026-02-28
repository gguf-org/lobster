import * as THREE from 'three';
import { Lobster } from './lobster';

export interface Counter {
    name: string;
    position: THREE.Vector3;
    color: number;
    description: string;
    commands: string[] | { [key: string]: string };
    group: THREE.Group;
    ring: THREE.Mesh;
    label: THREE.Mesh;
}

export class Counters {
    private scene: THREE.Scene;
    private lobster: Lobster;
    private counters: Counter[] = [];
    private interactionRange: number = 3.0;

    constructor(scene: THREE.Scene, lobster: Lobster) {
        this.scene = scene;
        this.lobster = lobster;
        
        this.createCounters();
    }

    private createCounters(): void {
        const counterData = [
            {
                name: 'Dashboard',
                position: new THREE.Vector3(-20, 0, -15),
                color: 0x29abe2,
                description: 'Open OpenClaw Dashboard',
                commands: ['openclaw dashboard']
            },
            {
                name: 'Checker',
                position: new THREE.Vector3(20, 0, -15),
                color: 0x9c27b0,
                description: 'Check OpenClaw Package',
                commands: ['check-package']
            },
            {
                name: 'Setup',
                position: new THREE.Vector3(-20, 0, 15),
                color: 0xff6b35,
                description: 'Setup and Configuration',
                commands: {
                    'Onboard': 'openclaw onboard',
                    'Pair up': 'pairing-menu',
                    'Doctor': 'openclaw doctor',
                    'Fix': 'openclaw doctor --fix',
                    'Console': 'openclaw tui'
                }
            },
            {
                name: 'Gateway',
                position: new THREE.Vector3(20, 0, 15),
                color: 0x00c853,
                description: 'Gateway Management',
                commands: {
                    'Run': 'openclaw gateway run',
                    'Status': 'openclaw gateway status',
                    'Start': 'openclaw gateway start',
                    'Stop': 'openclaw gateway stop',
                    'Restart': 'openclaw gateway restart'
                }
            },
            {
                name: 'Terminal',
                position: new THREE.Vector3(0, 0, -5),
                color: 0xffd700,
                description: 'Open Magnet Terminal',
                commands: ['ggc oc']
            }
        ];

        counterData.forEach(data => {
            const counter = this.createCounter(data);
            this.counters.push(counter);
        });
    }

    private createCounter(data: any): Counter {
        const counterGroup = new THREE.Group();

        // Counter base
        const baseGeometry = new THREE.BoxGeometry(3, 1.5, 2);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.5
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.75;
        base.castShadow = true;
        counterGroup.add(base);

        // Counter top (colored)
        const topGeometry = new THREE.BoxGeometry(3.2, 0.2, 2.2);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.3,
            metalness: 0.5
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1.6;
        top.castShadow = true;
        counterGroup.add(top);

        // Glowing indicator
        const indicatorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1);
        const indicatorMaterial = new THREE.MeshStandardMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.5
        });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.y = 1.75;
        counterGroup.add(indicator);

        // Point light for glow
        const pointLight = new THREE.PointLight(data.color, 1, 10);
        pointLight.position.y = 2;
        counterGroup.add(pointLight);

        // Animated ring
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        counterGroup.add(ring);

        // Label - larger and double-sided for visibility from any angle
        const labelGeometry = new THREE.PlaneGeometry(4, 1);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#' + data.color.toString(16).padStart(6, '0');
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name, 512, 128);
        
        const labelTexture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: labelTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, 3.5, 0);
        counterGroup.add(label);

        counterGroup.position.copy(data.position);
        this.scene.add(counterGroup);

        return {
            name: data.name,
            position: data.position,
            color: data.color,
            description: data.description,
            commands: data.commands,
            group: counterGroup,
            ring: ring,
            label: label
        };
    }

    public update(): Counter | null {
        const lobsterPos = this.lobster.getPosition();
        let nearestCounter = null;
        let minDistance = Infinity;

        this.counters.forEach(counter => {
            const distance = lobsterPos.distanceTo(counter.position);
            
            // Animate ring
            counter.ring.rotation.z += 0.01;
            counter.ring.position.y = 0.1 + Math.sin(Date.now() * 0.002) * 0.2;
            
            // Slowly rotate label for visibility from any angle
            counter.label.rotation.y += 0.005;

            if (distance < this.interactionRange) {
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCounter = counter;
                }
            }
        });

        return nearestCounter;
    }

    public getCounters(): Counter[] {
        return this.counters;
    }
}
