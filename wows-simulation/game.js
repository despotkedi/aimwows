const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouseX = 0;
let mouseY = 0; // Track Y for crosshair
let score = 0;

// Game Objects
const turret = {
    angle: 0,
    len: 80
};

const projectiles = [];
const enemies = [];
const particles = [];
const islands = [];

// Map Depth & Range System
const MAP_DEPTH_KM = 40; // Total map depth: 40 km
const MAX_RANGE_KM = 20; // Max gun range: 20 km

// Horizon line (y position)
let horizonY;
let maxAimY; // Max Y coordinate we can aim at (20km line)

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    horizonY = height * 0.5;

    // Calculate max aimable Y (20km out of 40km)
    // horizonY = 40km, height = 0km, so 20km = halfway point
    maxAimY = horizonY + (1 - MAX_RANGE_KM / MAP_DEPTH_KM) * (height - horizonY);

    createIslands();
}

window.addEventListener('resize', resize);
// resize(); // Delayed to end

// Input
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;

    // Smart mouseY clamping
    let rawMouseY = e.clientY;

    if (isZoom) {
        // Zoom mode: allow going down to 1km minimum
        const minDistKm = 1;
        const minDistY = horizonY + ((MAP_DEPTH_KM - minDistKm) / MAP_DEPTH_KM) * (height - horizonY);
        mouseY = Math.min(rawMouseY, minDistY);
    } else {
        // Normal mode: clamp to 20km max range
        mouseY = Math.max(maxAimY, rawMouseY);
    }

    // Calculate angle based on mouse X relative to center
    const dx = mouseX - width / 2;
    const dy = height - 50; // Pivot point roughly near bottom
    // Constrain angle
    turret.angle = Math.atan2(dx, dy);
});

canvas.addEventListener('mousedown', (e) => {
    fire(e.clientX, e.clientY);
});

// Game classes
class Island {
    constructor() {
        // Random pos in lower half (sea)
        this.y = horizonY + Math.random() * (height - horizonY - 50);
        this.y = Math.min(this.y, height - 100); // Don't block player turret view too much

        const distRatio = (this.y - horizonY) / (height - horizonY);
        this.scale = 0.5 + distRatio * 1.5;

        this.width = (150 + Math.random() * 200) * this.scale;
        this.height = (40 + Math.random() * 40) * this.scale;

        // Random X
        this.x = Math.random() * width;

        // Shape Points (Rock-like)
        this.points = [];
        const segments = 8;
        for (let i = 0; i <= segments; i++) {
            const px = (i / segments) * this.width - this.width / 2;
            // Height varies to look like mountains/rocks
            const py = -Math.random() * this.height;
            this.points.push({ x: px, y: py });
        }

        this.color = '#3b3b3b'; // Rock dark grey
    }

    draw() {
        const s = this.scale;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0); // Bottom Left corner

        // Trace top points
        for (let p of this.points) {
            ctx.lineTo(p.x, p.y);
        }

        ctx.lineTo(this.width / 2, 0); // Bottom Right corner
        ctx.lineTo(-this.width / 2, 0); // Close loop at bottom
        ctx.fill();

        // Add some green moss/vegetation on top
        ctx.strokeStyle = '#2d4d20';
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        for (let i = 0; i < this.points.length - 1; i++) {
            if (Math.random() > 0.5) {
                ctx.moveTo(this.points[i].x, this.points[i].y);
                ctx.lineTo(this.points[i + 1].x, this.points[i + 1].y);
            }
        }
        ctx.stroke();

        ctx.restore();
    }
}

class Enemy {
    constructor() {
        this.y = horizonY + Math.random() * (height - horizonY - 100) + 20; // Distance logic
        // Z-depth simulation: Higher Y is "Closer"? No, in perspective:
        // Horizon is far (Z=Infinity). Bottom of screen is close (Z=0).
        // Let's map Y to Z.
        // y=horizon -> z=far. y=height -> z=close.

        // Actually simpler: Y is just screen Y. Scale depends on Y.
        // Closer to horizon (smaller Y) = smaller scale.

        const distRatio = (this.y - horizonY) / (height - horizonY); // 0 to 1 (Horizon to Bottom)

        this.scale = 0.5 + distRatio * 1.5; // Scale 0.5 to 2.0

        this.width = 100 * this.scale;
        this.height = 30 * this.scale;

        // Start off screen
        this.dir = Math.random() < 0.5 ? 1 : -1;
        this.x = this.dir === 1 ? -this.width : width + this.width;

        // Slower movement for better gameplay balance
        this.speed = (0.5 + Math.random() * 1.5) * this.scale; // Closer ships move visually faster

        this.hp = 100;
        this.dead = false;
        this.color = '#cc0000';
    }

    update() {
        this.x += this.speed * this.dir;

        // Spawn Smoke from Funnel
        if (Math.random() < 0.3) {
            // Funnel position roughly center-offset
            const funnelX = this.x + 5 * this.scale;
            const funnelY = this.y - 25 * this.scale;
            particles.push(new Particle(funnelX, funnelY, 'rgba(50, 50, 50, 0.5)', Math.random() * 3 * this.scale));
        }

        // Remove if out of bounds
        if ((this.dir === 1 && this.x > width + 100) || (this.dir === -1 && this.x < -100)) {
            this.dead = true;
        }
    }

    draw() {
        const w = this.width;
        const h = this.height;
        const s = this.scale;

        ctx.save();

        // Flip if moving left
        if (this.dir === -1) {
            ctx.translate(this.x, this.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, -this.y);
        }

        // Hull Color
        ctx.fillStyle = '#4a4a4a'; // Dark Grey Hull

        // Hull Shape (Detailed)
        ctx.beginPath();
        ctx.moveTo(this.x - w / 2, this.y); // Stern Top
        ctx.lineTo(this.x + w / 2, this.y); // Bow Top
        // Bow curve
        ctx.bezierCurveTo(this.x + w / 2 + 10 * s, this.y + h * 0.5, this.x + w / 2 - 10 * s, this.y + h, this.x + w / 3, this.y + h);
        ctx.lineTo(this.x - w / 3, this.y + h); // Bottom flat
        // Stern curve
        ctx.lineTo(this.x - w / 2, this.y);
        ctx.fill();

        // Deck Details (Superstructure)
        ctx.fillStyle = '#7a7a7a'; // Light Grey

        // Main Tower (Bridge)
        ctx.fillRect(this.x - 15 * s, this.y - 20 * s, 20 * s, 20 * s);
        // Mast
        ctx.beginPath();
        ctx.moveTo(this.x - 5 * s, this.y - 20 * s);
        ctx.lineTo(this.x - 5 * s, this.y - 40 * s);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2 * s;
        ctx.stroke();

        // Funnel
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x + 5 * s, this.y - 25 * s, 10 * s, 25 * s);

        // Turrets
        ctx.fillStyle = '#333';
        // Front Turret
        ctx.beginPath();
        ctx.arc(this.x + 25 * s, this.y - 2 * s, 6 * s, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(this.x + 25 * s + 2 * s, this.y - 4 * s, 10 * s, 2 * s); // Barrel

        // Rear Turret
        ctx.beginPath();
        ctx.arc(this.x - 30 * s, this.y - 2 * s, 6 * s, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(this.x - 30 * s - 12 * s, this.y - 4 * s, 10 * s, 2 * s); // Barrel pointing back

        // Waterline Stripe
        ctx.fillStyle = '#800000';
        ctx.fillRect(this.x - w / 2.2, this.y + h - 5 * s, w * 0.8, 4 * s);

        ctx.restore();
    }
}

class Projectile {
    constructor(targetX, targetY) {
        this.startX = width / 2;
        this.startY = height;
        this.x = this.startX;
        this.y = this.startY;

        const dx = targetX - this.startX;
        const dy = targetY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Constant ground speed
        this.speed = 10;

        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;

        // Calculate flight time to reach target
        const flightTime = distance / this.speed;

        // Calculate required Arc velocity to land at exactly flightTime
        // 0 = v0*t - 0.5*g*t^2  => v0 = 0.5 * g * t
        this.gravity = 0.15;
        this.arcY = 0;
        this.vArc = 0.5 * this.gravity * flightTime;

        this.scale = 1;
        this.dead = false;
    }

    update() {
        // Move in 'world' X/Z
        this.x += this.vx;
        this.y += this.vy;

        // Fake gravity arc
        this.arcY += this.vArc;
        this.vArc -= this.gravity; // Gravity

        // Scale decreases as it goes "away" (up the screen)
        // Simple mapping:
        this.scale = Math.max(0.1, (this.y - horizonY) / (height - horizonY));

        // Hit water logic
        // When arc comes back down to 0, it hits the water at current x,y
        if (this.arcY <= 0) {
            this.dead = true;
            this.checkCollision();
        }
    }

    checkCollision() {
        // AOE Splash Radius
        const hitRadius = 20 * this.scale;
        let hitSomething = false;

        // 1. Check Islands (Blocker)
        for (let island of islands) {
            // Visual Occlusion Check
            // If landing spot (x, y) is visually covered by the island's sprite.
            if (this.x > island.x - island.width / 2 && this.x < island.x + island.width / 2) {
                // Check if Y is behind base but above top
                if (this.y < island.y && this.y > island.y - island.height) {
                    createIslandHit(this.x, this.y, this.scale);
                    return; // Blocked!
                }
                // Base direct hit
                if (Math.abs(this.y - island.y) < 10) {
                    createIslandHit(this.x, this.y, this.scale);
                    return;
                }
            }
        }

        // 2. Check Enemies
        for (let e of enemies) {
            // Check intersection + simple radius forgiveness
            if (this.x > e.x - e.width / 2 - hitRadius && this.x < e.x + e.width / 2 + hitRadius &&
                this.y > e.y - hitRadius && this.y < e.y + e.height + hitRadius) {

                createExplosion(this.x, this.y, e.scale);
                e.dead = true;
                score += 100;
                document.getElementById('score').innerText = 'Score: ' + score;
                hitSomething = true;
                break;
            }
        }

        if (!hitSomething) {
            createSplash(this.x, this.y, this.scale);
        }
    }

    draw() {
        // Shadow (on water)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5 * this.scale, 0, Math.PI * 2);
        ctx.fill();

        // Shell (in air - offset by arcY)
        const visualY = this.y - this.arcY;

        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(this.x, visualY, 4 * this.scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Visual Effects
class Particle {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.life = 1.0;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 2;
        // If smoke (greyish), float up. If splash (white), explode.
        if (color.includes('50, 50, 50')) {
            this.vy = -1 - Math.random(); // Float up
        } else {
            this.vy = (Math.random() - 0.5) * 5; // Explode
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02; // Slower fade
    }

    draw() {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function createSplash(x, y, scale) {
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y, 'white', 5 * scale));
    }
}

function createExplosion(x, y, scale) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, 'orange', 10 * scale));
    }
}

function createIslandHit(x, y, scale) {
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, '#5a4d41', 6 * scale)); // Dirt/brown particles
    }
}


function fire(tx, ty) {
    projectiles.push(new Projectile(tx, ty));
}

function spawnEnemy() {
    // Reduced spawn rate drastically (0.001) for much fewer ships
    if (Math.random() < 0.001) { // Spawn chance
        enemies.push(new Enemy());
    }
}

function createIslands() {
    islands.length = 0;
    const count = 5;
    for (let i = 0; i < count; i++) {
        islands.push(new Island());
    }
}

// Main Loop
let isZoom = false;

// Zoom Settings
const ZOOM_LEVELS = [1.5, 2, 3, 5, 10];
let zoomIndex = 2;

window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        isZoom = !isZoom;
        document.getElementById('scope-overlay').classList.toggle('active', isZoom);
    }
});

// Wheel to adjust zoom
window.addEventListener('wheel', (e) => {
    if (!isZoom) return; // Only adjust when zoomed

    if (e.deltaY < 0) { // Scroll Up
        zoomIndex = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1);
    } else { // Scroll Down
        zoomIndex = Math.max(zoomIndex - 1, 0);
    }
});

function loop() {
    ctx.clearRect(0, 0, width, height);

    ctx.save(); // Start Zoom Transform

    if (isZoom) {
        // Zoom Logic: Camera follows Mouse Position
        // This keeps crosshair centered while allowing vertical aiming
        const zoomLevel = ZOOM_LEVELS[zoomIndex];

        ctx.translate(width / 2, height / 2); // 1. Move to Screen Center
        ctx.scale(zoomLevel, zoomLevel);  // 2. Scale
        ctx.translate(-mouseX, -mouseY);  // 3. Center on Mouse (both X and Y)
    }

    // Draw Horizon (Visual Only)
    // Canvas background handles gradient.

    // Update & Draw Enemies
    spawnEnemy();

    // Sort logic for occlusion: mix enemies and islands
    // Combine list references for sorting/drawing (painter's algo)
    const renderList = [];
    for (let e of enemies) renderList.push({ type: 'enemy', obj: e, y: e.y });
    for (let i of islands) renderList.push({ type: 'island', obj: i, y: i.y });

    renderList.sort((a, b) => a.y - b.y);

    for (let item of renderList) {
        item.obj.draw(); // Both Island and Enemy have draw()
        if (item.type === 'enemy') {
            item.obj.update();
            if (item.obj.dead) {
                const idx = enemies.indexOf(item.obj);
                if (idx > -1) enemies.splice(idx, 1);
            }
        }
    }

    // Update & Draw Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update();
        projectiles[i].draw();
        if (projectiles[i].dead) projectiles.splice(i, 1);
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Draw Crosshair INSIDE the transformed world
    // In zoom mode, camera is centered at height/2
    // Draw crosshair at camera center so it appears at screen center
    if (isZoom) {
        drawCrosshair(mouseX, mouseY, true);
    }

    ctx.restore(); // End Zoom Transform

    // Draw Overlay Elements (Screen Space, No Zoom)

    // Draw Player Turret (Only if NOT zoomed)
    if (!isZoom) {
        ctx.save();
        ctx.translate(width / 2, height); // Pivot at bottom center
        ctx.rotate(turret.angle);

        // Barrels
        ctx.fillStyle = '#333';
        ctx.fillRect(-10, -turret.len, 8, turret.len);
        ctx.fillRect(2, -turret.len, 8, turret.len);

        // Turret House
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(0, 0, 40, Math.PI, 0); // Semicircle
        ctx.fill();
        ctx.restore();
    } else {
        // Draw Zoom Level Text (Screen Space)
        ctx.fillStyle = 'white';
        ctx.font = '16px bold sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('x' + ZOOM_LEVELS[zoomIndex], width - 20, height - 50);
    }

    requestAnimationFrame(loop);
}

function drawCrosshair(x, y, zoomed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    // Scale line width inversely with zoom so it doesn't look too chunky? 
    // Actually keep it consistent.
    ctx.lineWidth = 1 / (zoomed ? (ZOOM_LEVELS[zoomIndex] * 0.5) : 1);
    ctx.font = (10 / (zoomed ? (ZOOM_LEVELS[zoomIndex] * 0.3) : 1)) + 'px sans-serif';
    ctx.textAlign = 'center';

    // Center Chevron
    const s = zoomed ? (1 / (ZOOM_LEVELS[zoomIndex] * 0.5)) : 1; // Scale factor for UI size

    ctx.beginPath();
    ctx.moveTo(-10 * s, -10 * s); ctx.lineTo(0, 0); ctx.lineTo(10 * s, -10 * s);
    ctx.stroke();

    // Horizontal Line - Very Long
    ctx.beginPath();
    ctx.moveTo(-2000, 0); ctx.lineTo(2000, 0);
    ctx.stroke();

    // Ticks
    const tickSpacing = 20; // World Units
    const tickCount = 50; // Many ticks for panning

    for (let i = 1; i <= tickCount; i++) {
        // Right side
        let tx = i * tickSpacing;
        let h = (i % 5 === 0) ? 10 * s : 5 * s;

        ctx.beginPath();
        ctx.moveTo(tx, -h / 2); ctx.lineTo(tx, h / 2);
        ctx.stroke();

        if (i % 5 === 0 && i % 2 !== 0) { // Number 5, 15, 25
            ctx.fillText(i, tx, -10 * s);
        } else if (i % 10 === 0) { // Number 10, 20
            ctx.fillText(i, tx, -10 * s);
        }

        // Left side
        tx = -i * tickSpacing;
        ctx.beginPath();
        ctx.moveTo(tx, -h / 2); ctx.lineTo(tx, h / 2);
        ctx.stroke();
        if (i % 5 === 0 && i % 2 !== 0) {
            ctx.fillText(i, tx, -10 * s);
        } else if (i % 10 === 0) {
            ctx.fillText(i, tx, -10 * s);
        }
    }

    // Distance Indicator (WoWS Style)
    if (zoomed) {
        // Calculate distance based on Y coordinate
        // horizonY = 40km, height = 0km
        const distRatio = (y - horizonY) / (height - horizonY); // 0 to 1
        const distanceKm = (1 - distRatio) * MAP_DEPTH_KM;

        // Display distance to the right of crosshair
        ctx.font = (16 / (ZOOM_LEVELS[zoomIndex] * 0.4)) + 'px bold sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const offsetX = 30 * s;
        ctx.fillText(distanceKm.toFixed(1) + ' km', offsetX, 0);
    }

    ctx.restore();
}


resize(); // Initialize inputs and islands now that classes are defined
loop();
