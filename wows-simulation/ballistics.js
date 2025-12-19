import * as THREE from 'three';

export const GRAVITY = 9.81;
export const SCALE = 1; // 1 unit = 1 meter

export function calculateLaunchVelocity(startPos, targetPos, speed) {
    // Basic ballistic calculation
    // This is a simplified "aim at spot" logic. 
    // In reality, we need elevation angle.
    // For now, let's just make the shell fly towards the target with a fixed arc?
    // Or better: Player provides angle (elevation) or we calculate it.

    // Let's implement: Aim at point -> Calculate required Elevation for specific V0 (speed)
    // R = (v^2 * sin(2*theta)) / g
    // sin(2*theta) = (R * g) / v^2

    const dist = startPos.distanceTo(targetPos);
    const val = (dist * GRAVITY) / (speed * speed);

    // If target is too far for speed, clamp or just shoot at max range (45 deg)
    let angle = 0;
    if (val > 1) {
        angle = Math.PI / 4;
    } else {
        angle = 0.5 * Math.asin(val);
    }

    // Now construct velocity vector
    // Direction on XZ plane
    const dir = new THREE.Vector3().subVectors(targetPos, startPos);
    dir.y = 0;
    dir.normalize();

    // Vo components
    const vy = speed * Math.sin(angle);
    const vh = speed * Math.cos(angle); // horizontal speed

    dir.multiplyScalar(vh);
    dir.y = vy;

    return dir;
}
