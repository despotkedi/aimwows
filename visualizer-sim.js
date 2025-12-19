// ===== INTERACTIVE VISUALIZER SIMULATION =====
let vizState = {
    running: false,
    ship: null,
    shells: [],
    lastTime: 0,
    animationId: null,
    showLeadIndicator: true // Toggle for lead indicator visibility
};

const vizStartBtn = document.getElementById('viz-start-btn');
const vizResetBtn = document.getElementById('viz-reset-btn');
const toggleLeadBtn = document.getElementById('toggle-lead-indicator');
const vizCanvas = document.getElementById('visualizer-canvas');
const vizCtx = vizCanvas ? vizCanvas.getContext('2d') : null;

function initializeVisualizerShip() {
    const leadTicks = parseFloat(document.getElementById('result-value').textContent) || 0;
    const speed = parseInt(speedInput.value) || 30;
    const flightTime = parseFloat(flightTimeInput.value) || 8;

    const centerX = vizCanvas.width / 2;
    const centerY = vizCanvas.height / 2;
    const pxPerTick = 15; // 1 tick = 15 pixels on screen

    // REALISTIC VELOCITY CALCULATION:
    // Lead (ticks) = Ship Speed (m/s) * Flight Time (s) / Tick Width (m)
    // Tick Width in game is typically ~7.62m (25 feet)
    // So: Ship velocity in pixels/second = (speed in knots * 0.5144 m/s) * (pxPerTick / 7.62m)

    const speedMs = speed * 0.5144; // knots to m/s
    const tickWidthMeters = 7.62; // Standard WoWs tick width
    const shipVelocityPxPerSec = speedMs * (pxPerTick / tickWidthMeters);

    // Ship starts on the LEFT side of the screen
    // Position it so it will reach center after moving for some time
    const startX = 100; // Start 100px from left edge

    vizState.ship = {
        x: startX, // Start from left side
        y: centerY,
        speedKnots: speed,
        speedMs: speedMs,
        velocity: shipVelocityPxPerSec, // pixels per second (realistic scale)
        flightTime: flightTime,
        width: 120,
        height: 60
    };

    console.log(`Ship initialized: ${speed} knots = ${speedMs.toFixed(2)} m/s = ${shipVelocityPxPerSec.toFixed(2)} px/s, starting at x=${startX}`);
}

function drawVisualizerBackground() {
    const width = vizCanvas.width;
    const height = vizCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const pxPerTick = 15;

    // Clear
    vizCtx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = vizCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(0.5, '#475569');
    gradient.addColorStop(1, '#0f172a');
    vizCtx.fillStyle = gradient;
    vizCtx.fillRect(0, 0, width, height);

    // Crosshair
    vizCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    vizCtx.lineWidth = 2;
    vizCtx.beginPath();
    vizCtx.moveTo(0, centerY);
    vizCtx.lineTo(width, centerY);
    vizCtx.stroke();

    // Ticks
    vizCtx.font = '10px Roboto';
    vizCtx.textAlign = 'center';
    vizCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (let t = -40; t <= 40; t++) {
        if (t === 0) continue;
        const x = centerX + (t * pxPerTick);

        let tickHeight = 5;
        if (t % 5 === 0) tickHeight = 10;
        if (t % 10 === 0) tickHeight = 15;

        vizCtx.beginPath();
        vizCtx.moveTo(x, centerY - tickHeight);
        vizCtx.lineTo(x, centerY + tickHeight);
        vizCtx.stroke();

        if (t % 5 === 0) {
            vizCtx.fillText(Math.abs(t), x, centerY + tickHeight + 12);
        }
    }

    // Center triangle
    vizCtx.fillStyle = '#fff';
    vizCtx.beginPath();
    vizCtx.moveTo(centerX, centerY - 20);
    vizCtx.lineTo(centerX - 6, centerY - 28);
    vizCtx.lineTo(centerX + 6, centerY - 28);
    vizCtx.fill();
}

function drawLeadIndicator() {
    // Check if lead indicator should be shown
    if (!vizState.showLeadIndicator) return;
    if (!vizState.ship) return;

    const ship = vizState.ship;
    const pxPerTick = 15;

    // Get calculated lead from result
    const leadTicks = parseFloat(document.getElementById('result-value').textContent) || 0;

    // Lead indicator position: ship.x + (leadTicks * pxPerTick)
    // This moves WITH the ship, always staying leadTicks ahead
    const leadX = ship.x + (leadTicks * pxPerTick);
    const leadY = ship.y;

    // Pulsing effect
    const time = Date.now() / 1000;
    const pulse = 0.7 + Math.sin(time * 3) * 0.3;

    // Draw pulsing red crosshair at lead position
    vizCtx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
    vizCtx.lineWidth = 3;

    // Vertical line
    vizCtx.beginPath();
    vizCtx.moveTo(leadX, leadY - 40);
    vizCtx.lineTo(leadX, leadY + 40);
    vizCtx.stroke();

    // Horizontal line
    vizCtx.beginPath();
    vizCtx.moveTo(leadX - 40, leadY);
    vizCtx.lineTo(leadX + 40, leadY);
    vizCtx.stroke();

    // Circle around aim point
    vizCtx.strokeStyle = `rgba(255, 100, 100, ${pulse * 0.8})`;
    vizCtx.lineWidth = 2;
    vizCtx.beginPath();
    vizCtx.arc(leadX, leadY, 25, 0, Math.PI * 2);
    vizCtx.stroke();

    // "SHOOT HERE" text above indicator
    vizCtx.font = 'bold 14px Arial';
    vizCtx.textAlign = 'center';
    vizCtx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
    vizCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    vizCtx.lineWidth = 3;

    // Get translated text
    const shootText = translations[activeLanguage]?.['canvas-shoot-here'] || '🎯 ATEŞ ET';
    const ticksText = translations[activeLanguage]?.['canvas-ticks'] || 'ticks';

    vizCtx.strokeText(shootText, leadX, leadY - 50);
    vizCtx.fillText(shootText, leadX, leadY - 50);

    // Lead value text below indicator
    vizCtx.font = 'bold 12px Arial';
    vizCtx.fillStyle = `rgba(255, 200, 0, ${pulse})`;
    vizCtx.strokeText(`${leadTicks.toFixed(1)} ${ticksText}`, leadX, leadY + 65);
    vizCtx.fillText(`${leadTicks.toFixed(1)} ${ticksText}`, leadX, leadY + 65);
}

function drawVisualizerShip() {
    if (!vizState.ship) return;

    const ship = vizState.ship;
    const imgEl = document.getElementById('target-ship-img');

    // Draw ship - CHECK IF IMAGE IS LOADED
    const imageReady = imgEl && imgEl.src && imgEl.complete && imgEl.naturalWidth > 0 && imgEl.style.display !== 'none';

    if (imageReady) {
        vizCtx.globalAlpha = 0.9;
        // Draw ship facing right (no flip needed)
        vizCtx.drawImage(imgEl, ship.x - (ship.width / 2), ship.y - (ship.height / 2), ship.width, ship.height);
        vizCtx.globalAlpha = 1.0;
    } else {
        // Fallback: Draw ship shape pointing right
        vizCtx.fillStyle = '#22c55e';
        vizCtx.beginPath();
        vizCtx.moveTo(ship.x + 45, ship.y); // Bow (front) pointing right
        vizCtx.lineTo(ship.x - 45, ship.y - 15); // Port side
        vizCtx.lineTo(ship.x - 60, ship.y); // Stern (back)
        vizCtx.lineTo(ship.x - 45, ship.y + 15); // Starboard side
        vizCtx.closePath();
        vizCtx.fill();
    }

    // Highlight circle
    vizCtx.strokeStyle = '#38bdf8';
    vizCtx.lineWidth = 3;
    vizCtx.beginPath();
    vizCtx.arc(ship.x, ship.y, 8, 0, Math.PI * 2);
    vizCtx.stroke();
}

function drawVisualizerShells() {
    vizCtx.fillStyle = '#ff6b6b';
    vizCtx.strokeStyle = '#ff3333';
    vizCtx.lineWidth = 2;

    vizState.shells.forEach(shell => {
        // Draw shell trajectory
        vizCtx.globalAlpha = 0.3;
        vizCtx.beginPath();
        vizCtx.moveTo(shell.startX, shell.startY);
        vizCtx.lineTo(shell.x, shell.y);
        vizCtx.stroke();
        vizCtx.globalAlpha = 1.0;

        // Draw shell
        vizCtx.beginPath();
        vizCtx.arc(shell.x, shell.y, 5, 0, Math.PI * 2);
        vizCtx.fill();

        // Draw countdown timer
        const remainingTime = shell.flightTime - shell.time;
        if (remainingTime > 0) {
            vizCtx.save();
            vizCtx.font = 'bold 16px Arial';
            vizCtx.textAlign = 'center';
            vizCtx.textBaseline = 'bottom';

            // Background for better readability
            const timerText = remainingTime.toFixed(1) + 's';
            const textWidth = vizCtx.measureText(timerText).width;
            vizCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            vizCtx.fillRect(shell.x - textWidth / 2 - 4, shell.y - 30, textWidth + 8, 20);

            // Timer text
            vizCtx.fillStyle = '#ffff00'; // Yellow
            vizCtx.strokeStyle = '#ff6600'; // Orange outline
            vizCtx.lineWidth = 2;
            vizCtx.strokeText(timerText, shell.x, shell.y - 12);
            vizCtx.fillText(timerText, shell.x, shell.y - 12);

            vizCtx.restore();
        }
    });
}

function updateVisualizerSimulation(dt) {
    if (!vizState.ship) return;

    // Move ship
    vizState.ship.x += vizState.ship.velocity * dt;

    // Wrap ship around
    if (vizState.ship.x > vizCanvas.width + 100) {
        vizState.ship.x = -100;
    }

    // Update shells
    for (let i = vizState.shells.length - 1; i >= 0; i--) {
        const shell = vizState.shells[i];
        shell.time += dt;

        const progress = shell.time / shell.flightTime;

        if (progress >= 1.0) {
            // Shell landed
            const hitDist = Math.abs(shell.targetX - vizState.ship.x);
            const isHit = hitDist < 60; // Increased hit radius

            if (isHit) {
                // Hit!
                createVisualizerExplosion(shell.targetX, shell.targetY, true);
                createHitText(shell.targetX, shell.targetY, "HIT!", true);
                if (!vizState.hits) vizState.hits = 0;
                vizState.hits++; // Increment hit counter
            } else {
                // Miss
                createVisualizerExplosion(shell.targetX, shell.targetY, false);
                createHitText(shell.targetX, shell.targetY, "MISS", false);
            }
            vizState.shells.splice(i, 1);
        } else {
            // Update shell position (parabolic arc)
            shell.x = shell.startX + (shell.targetX - shell.startX) * progress;
            const arc = Math.sin(progress * Math.PI) * 100; // Increased arc height
            shell.y = shell.startY - arc;
        }
    }

    // Update explosions
    if (!vizState.explosions) vizState.explosions = [];
    for (let i = vizState.explosions.length - 1; i >= 0; i--) {
        const exp = vizState.explosions[i];
        exp.life -= dt * 1.5; // Slower fade
        if (exp.life <= 0) {
            vizState.explosions.splice(i, 1);
        }
    }

    // Update hit texts
    if (!vizState.hitTexts) vizState.hitTexts = [];
    for (let i = vizState.hitTexts.length - 1; i >= 0; i--) {
        const txt = vizState.hitTexts[i];
        txt.life -= dt * 1.2;
        txt.y -= dt * 30; // Float upward
        if (txt.life <= 0) {
            vizState.hitTexts.splice(i, 1);
        }
    }
}

function drawVisualizerExplosions() {
    if (!vizState.explosions) return;

    vizState.explosions.forEach(exp => {
        const radius = (1.0 - exp.life) * 80; // Larger explosions

        // Outer glow
        vizCtx.beginPath();
        vizCtx.arc(exp.x, exp.y, radius * 1.5, 0, Math.PI * 2);
        const gradient = vizCtx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, radius * 1.5);

        if (exp.isHit) {
            gradient.addColorStop(0, `rgba(255, 200, 0, ${exp.life * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 100, 0, ${exp.life * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        } else {
            gradient.addColorStop(0, `rgba(100, 150, 255, ${exp.life * 0.6})`);
            gradient.addColorStop(0.5, `rgba(50, 100, 200, ${exp.life * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 50, 150, 0)`);
        }

        vizCtx.fillStyle = gradient;
        vizCtx.fill();

        // Inner core
        vizCtx.beginPath();
        vizCtx.arc(exp.x, exp.y, radius * 0.6, 0, Math.PI * 2);
        vizCtx.fillStyle = exp.isHit
            ? `rgba(255, 255, 200, ${exp.life})`
            : `rgba(200, 220, 255, ${exp.life * 0.7})`;
        vizCtx.fill();
    });
}

function createHitText(x, y, text, isHit) {
    if (!vizState.hitTexts) vizState.hitTexts = [];
    vizState.hitTexts.push({
        x: x,
        y: y - 40,
        text: text,
        isHit: isHit,
        life: 1.0
    });
}

function drawHitTexts() {
    if (!vizState.hitTexts) return;

    vizState.hitTexts.forEach(txt => {
        vizCtx.save();
        vizCtx.font = 'bold 32px Arial';
        vizCtx.textAlign = 'center';
        vizCtx.textBaseline = 'middle';

        // Shadow for better visibility
        vizCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        vizCtx.shadowBlur = 10;
        vizCtx.shadowOffsetX = 2;
        vizCtx.shadowOffsetY = 2;

        if (txt.isHit) {
            vizCtx.fillStyle = `rgba(255, 215, 0, ${txt.life})`; // Gold
            vizCtx.strokeStyle = `rgba(255, 100, 0, ${txt.life})`;
        } else {
            vizCtx.fillStyle = `rgba(150, 180, 255, ${txt.life})`; // Light blue
            vizCtx.strokeStyle = `rgba(50, 100, 200, ${txt.life})`;
        }

        vizCtx.lineWidth = 3;
        vizCtx.strokeText(txt.text, txt.x, txt.y);
        vizCtx.fillText(txt.text, txt.x, txt.y);

        vizCtx.restore();
    });
}

function createVisualizerExplosion(x, y, isHit) {
    if (!vizState.explosions) vizState.explosions = [];
    vizState.explosions.push({ x, y, life: 1.0, isHit });
}

function visualizerLoop(currentTime) {
    if (!vizState.running) return;

    const dt = vizState.lastTime ? (currentTime - vizState.lastTime) / 1000 : 0;
    vizState.lastTime = currentTime;

    // Clear and draw
    vizCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);
    drawVisualizerBackground();
    updateVisualizerSimulation(dt);
    drawVisualizerShip();
    drawLeadIndicator(); // Draw moving lead indicator
    drawVisualizerShells();
    drawVisualizerExplosions();
    drawHitTexts(); // Draw hit/miss text
    drawScore(); // Draw score

    vizState.animationId = requestAnimationFrame(visualizerLoop);
}

function drawScore() {
    // Check if hits is defined (it can be 0)
    if (vizState.hits === undefined) return;

    vizCtx.save();
    vizCtx.font = 'bold 20px Arial';
    vizCtx.textAlign = 'left';
    vizCtx.fillStyle = '#22c55e';
    vizCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    vizCtx.shadowBlur = 5;

    // Get translated text
    const hitsText = translations[activeLanguage]?.['canvas-hits'] || 'İsabet:';
    vizCtx.fillText(`${hitsText} ${vizState.hits}`, 20, 30);
    vizCtx.restore();
}

function startVisualizerSimulation() {
    if (vizState.running) return;

    initializeVisualizerShip();
    vizState.running = true;
    vizState.lastTime = null;
    vizState.shells = [];
    vizState.explosions = [];
    vizState.hitTexts = [];
    vizState.hits = 0; // Changed from vizState.score

    if (vizStartBtn) vizStartBtn.textContent = '⏸️ Durdur';
    visualizerLoop(performance.now());
}

function stopVisualizerSimulation() {
    vizState.running = false;
    if (vizState.animationId) {
        cancelAnimationFrame(vizState.animationId);
    }
    if (vizStartBtn) vizStartBtn.textContent = '▶️ Başlat';
}

function resetVisualizerSimulation() {
    stopVisualizerSimulation();
    vizState.ship = null;
    vizState.shells = [];
    vizState.explosions = [];
    vizState.hitTexts = [];
    vizState.hits = 0; // Changed from vizState.score
    vizCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);
    drawVisualizerBackground();

    // Auto-start after reset
    setTimeout(() => {
        startVisualizerSimulation();
    }, 100);
}

// Event Listeners
if (vizStartBtn) {
    vizStartBtn.addEventListener('click', () => {
        if (vizState.running) {
            stopVisualizerSimulation();
        } else {
            startVisualizerSimulation();
        }
    });
}

if (vizResetBtn) {
    vizResetBtn.addEventListener('click', resetVisualizerSimulation);
}

// Toggle Lead Indicator
if (toggleLeadBtn) {
    toggleLeadBtn.addEventListener('click', () => {
        vizState.showLeadIndicator = !vizState.showLeadIndicator;

        const span = toggleLeadBtn.querySelector('span');
        if (vizState.showLeadIndicator) {
            if (span) {
                span.setAttribute('data-i18n', 'hide-helper');
                span.textContent = '👁️ Yardımcıyı Gizle'; // Will be translated
            }
            toggleLeadBtn.style.background = '#f59e0b'; // Orange
        } else {
            if (span) {
                span.setAttribute('data-i18n', 'show-helper');
                span.textContent = '👁️ Yardımcıyı Göster'; // Will be translated
            }
            toggleLeadBtn.style.background = '#64748b'; // Gray
        }

        // Re-apply translations
        if (typeof applyTranslations === 'function') {
            applyTranslations(activeLanguage);
        }
    });
}

if (vizCanvas) {
    vizCanvas.addEventListener('click', (e) => {
        if (!vizState.running || !vizState.ship) return;

        const rect = vizCanvas.getBoundingClientRect();
        const scaleX = vizCanvas.width / rect.width;
        const scaleY = vizCanvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        const flightTime = parseFloat(flightTimeInput.value) || 8;
        const centerY = vizCanvas.height / 2;

        // Fire shell
        vizState.shells.push({
            startX: vizCanvas.width / 2,
            startY: centerY - 30,
            targetX: clickX,
            targetY: centerY,
            x: vizCanvas.width / 2,
            y: centerY - 30,
            time: 0,
            flightTime: flightTime
        });
    });
}
