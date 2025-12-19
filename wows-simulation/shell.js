import * as THREE from 'three';
import { GRAVITY } from './ballistics.js';

export class Shell extends THREE.Mesh {
    constructor(position, velocity) {
        // Tracer visual: Long, thin, glowing cylinder
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 10, 8); // Long tracer
        geometry.rotateX(Math.PI / 2); // Align with Z axis (forward)

        const material = new THREE.MeshBasicMaterial({
            color: 0xffaa00, // Orange/Yellow
            blending: THREE.AdditiveBlending, // Glow effect
            transparent: true,
            opacity: 0.8
        });

        super(geometry, material);

        this.position.copy(position);
        this.velocity = velocity;
        this.active = true;
    }

    update(dt) {
        if (!this.active) return;

        // Save old position for orientation
        const oldPos = this.position.clone();

        // Apply Gravity
        this.velocity.y -= GRAVITY * dt * 5;

        // Move
        const step = this.velocity.clone().multiplyScalar(dt);
        this.position.add(step);

        // Orient shell to face direction of travel
        this.lookAt(this.position.clone().add(this.velocity));

        // Check Water Collision
        if (this.position.y <= 0) {
            this.active = false;
            this.visible = false;
            // TODO: Trigger Splash Effect
            console.log("Splash!");
        }
    }
}
