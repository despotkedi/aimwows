// --- DOM Elements ---
const tabs = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Calculator Elements
const speedInput = document.getElementById('target-speed');
const speedSlider = document.getElementById('speed-slider');
const distInput = document.getElementById('target-distance');
const distSlider = document.getElementById('dist-slider');
const angleSlider = document.getElementById('angle-slider');
const flightTimeInput = document.getElementById('flight-time');
const scaleInput = document.getElementById('scale-factor');
const resultValue = document.getElementById('result-value');
const attackerSelector = document.getElementById('attacker-selector');
const shipSelector = document.getElementById('ship-selector');

// Labels for values
const distValLabel = document.getElementById('dist-val');
const speedValLabel = document.getElementById('speed-val');
const angleValLabel = document.getElementById('angle-val');

// Timers
const smokeBtn = document.getElementById('smoke-timer-btn');
const spotterBtn = document.getElementById('spotter-timer-btn');

// Simulation Elements
const canvas = document.getElementById('aim-canvas');
const ctx = canvas.getContext('2d');
const startSimBtn = document.getElementById('start-sim-btn');
const resetSimBtn = document.getElementById('reset-sim-btn');
const toggleViewBtn = document.getElementById('toggle-view-btn');
const scoreEl = document.getElementById('sim-score');
const highScoreEl = document.getElementById('sim-high-score');
const missesEl = document.getElementById('sim-misses');
const feedbackEl = document.querySelector('.sim-feedback p');

// --- DATABASES ---
// shipDatabase & attackerDatabase are loaded from ships.js
// attackerDatabase ships.js dosyasından yüklenmektedir.


// Modal Elements
const filterModal = document.getElementById('filter-modal');
const openFilterBtn = document.getElementById('open-filter-btn');
const openAttackerFilterBtn = document.getElementById('open-attacker-filter-btn');
const closeFilterBtn = document.querySelector('.close-modal');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');

// FILTER STATE
const filterState = {
    target: { type: ["BB", "CA", "DD", "CV", "SUB"], nation: ["Japan", "USA", "Germany", "USSR", "UK", "France", "Italy", "Pan-Asia", "Other"], tier: ["11", "10", "9", "8", "Other"] },
    attacker: { type: ["BB", "CA", "DD", "CV", "SUB"], nation: ["Japan", "USA", "Germany", "USSR", "UK", "France", "Italy", "Pan-Asia", "Other"], tier: ["11", "10", "9", "8", "Other"] }
};

let currentFilterContext = 'target'; // 'target' or 'attacker'

// --- INITIALIZATION ---
function init() {
    initFilters();
    populateSelectors('target');
    populateSelectors('attacker');
    initSliders();
    initTimers();
    loadHighScore();
    calculateLead();
}

function initFilters() {
    openFilterBtn.onclick = () => openModal('target');
    openAttackerFilterBtn.onclick = () => openModal('attacker');

    closeFilterBtn.onclick = () => filterModal.style.display = "none";

    applyFiltersBtn.onclick = () => {
        saveFilters(currentFilterContext);
        populateSelectors(currentFilterContext);
        filterModal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target == filterModal) filterModal.style.display = "none";
    }
}

function openModal(context) {
    currentFilterContext = context;
    const filters = filterState[context];

    checkboxes.forEach(cb => {
        cb.checked = filters[cb.name].includes(cb.value);
    });

    document.querySelector('.modal-header h3').textContent =
        context === 'target' ? "🔍 Filtrele: Düşman Gemisi" : "🔍 Filtrele: Sizin Geminiz";

    filterModal.style.display = "block";
}

function saveFilters(context) {
    filterState[context] = { type: [], nation: [], tier: [] };
    checkboxes.forEach(cb => {
        if (cb.checked) filterState[context][cb.name].push(cb.value);
    });
}

function populateSelectors(context) {
    const selector = context === 'target' ? shipSelector : attackerSelector;
    const database = context === 'target' ? shipDatabase : attackerDatabase;
    const filters = filterState[context];

    // Clear existing options
    if (context === 'target') {
        selector.innerHTML = '<option value="custom">DÜŞMAN GEMİSİNİ SEÇ</option>';
    } else {
        selector.innerHTML = '<option value="custom">GEMİNİ SEÇ</option>';
    }

    // Filter Logic
    const filteredShips = database.filter(ship => {
        // Safe check for missing properties (Attacker DB might be missing some initially, assumes all good now)
        if (!ship.type || !ship.nation || !ship.tier) return true;

        const typeMatch = filters.type.includes(ship.type);

        let validNation = filters.nation.includes(ship.nation);
        if (!validNation && filters.nation.includes('Other')) {
            const mainNations = ["Japan", "USA", "Germany", "USSR", "UK", "France", "Italy", "Pan-Asia"];
            if (!mainNations.includes(ship.nation)) validNation = true;
        }

        let validTier = filters.tier.includes(ship.tier);
        if (!validTier && filters.tier.includes('Other')) {
            if (!["11", "10", "9", "8"].includes(ship.tier)) validTier = true;
        }

        return typeMatch && validNation && validTier;
    });

    // Sort Alphabetically
    filteredShips.sort((a, b) => a.name.localeCompare(b.name));

    let count = 0;
    filteredShips.forEach(ship => {
        const option = document.createElement('option');
        if (context === 'target') {
            option.value = ship.speed;
            option.textContent = `[T${ship.tier} ${ship.type}] ${ship.name} - ${ship.speed} kts`;
        } else {
            option.value = ship.velocity;
            option.textContent = `[T${ship.tier} ${ship.type}] ${ship.name} (${ship.velocity} m/s)`;
        }
        selector.appendChild(option);
        count++;
    });

    if (count === 0) {
        const option = document.createElement('option');
        option.textContent = "-- Sonuç Bulunamadı --";
        option.disabled = true;
        selector.appendChild(option);
    }
}

// --- SLIDER LOGIC ---
function initSliders() {
    // Link Slider <-> Input (Distance)
    linkSliderInput(distSlider, distInput, distValLabel);

    // Link Slider <-> Input (Speed)
    linkSliderInput(speedSlider, speedInput, speedValLabel);

    // Angle Slider
    angleSlider.addEventListener('input', () => {
        angleValLabel.textContent = angleSlider.value;
        calculateLead();
    });
}

function linkSliderInput(slider, input, labelEntry) {
    slider.addEventListener('input', () => {
        input.value = slider.value;
        if (labelEntry) labelEntry.textContent = slider.value;
        updateFlightTime();
        calculateLead();
    });

    input.addEventListener('input', () => {
        slider.value = input.value;
        if (labelEntry) labelEntry.textContent = input.value;
        updateFlightTime();
        calculateLead();
    });
}

// --- CALCULATION LOGIC ---
function updateFlightTime() {
    const velocity = parseFloat(attackerSelector.value);
    const distanceKm = parseFloat(distInput.value);

    // Only auto-calc flight time if we have valid Attacker & Distance
    if (!isNaN(velocity) && !isNaN(distanceKm) && distanceKm > 0) {
        // Simple Physics Approximation (WoW constants varies, but k=430 is a good fit)
        const k = 430;
        const estimatedTime = (distanceKm * k) / velocity;
        flightTimeInput.value = estimatedTime.toFixed(2);

        // Visual flash
        flightTimeInput.style.backgroundColor = '#1e3a8a';
        setTimeout(() => flightTimeInput.style.backgroundColor = '#0f172a', 300);
    }
    calculateLead();
}

function calculateLead() {
    const speed = parseFloat(speedInput.value) || 0;
    const time = parseFloat(flightTimeInput.value) || 0;
    const scale = parseFloat(scaleInput.value) || 1.0;
    const angle = parseFloat(angleSlider.value) || 90;

    // Base Lead: Time * (Speed / 30)
    // Adjusted by Scale Factor
    let lead = time * (speed / 30) * scale;

    // Angle Correction: Lead * sin(Angle)
    // 90 deg -> sin(90) = 1 (Full Lead)
    // 0 deg -> sin(0) = 0 (No Lead)
    const angleRad = angle * (Math.PI / 180);
    lead = lead * Math.sin(angleRad);

    resultValue.textContent = lead.toFixed(2);

    // Visual Pulse
    resultValue.style.color = '#38bdf8';
    setTimeout(() => resultValue.style.color = '#38bdf8', 100);
}

// Event Listeners for Calculation
attackerSelector.addEventListener('change', updateFlightTime);
scaleInput.addEventListener('input', calculateLead);
flightTimeInput.addEventListener('input', calculateLead); // Manual overwrite

shipSelector.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'custom') {
        speedInput.value = val;
        speedSlider.value = val;
        speedValLabel.textContent = val;
        calculateLead();
    }
});

// --- TIMERS ---
function initTimers() {
    setupTimer(smokeBtn, 45);   // 45s Smoke
    setupTimer(spotterBtn, 60); // 60s Spotter
}

function setupTimer(btn, duration) {
    let timeLeft = duration;
    let timerId = null;
    const originalText = btn.textContent;

    btn.addEventListener('click', () => {
        if (timerId) {
            // Cancel Timer
            clearInterval(timerId);
            timerId = null;
            btn.textContent = originalText;
            btn.classList.remove('active');
        } else {
            // Start Timer
            timeLeft = duration;
            btn.classList.add('active');
            btn.textContent = `${originalText.split('(')[0]} (${timeLeft}s)`;

            timerId = setInterval(() => {
                timeLeft--;
                btn.textContent = `${originalText.split('(')[0]} (${timeLeft}s)`;

                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    btn.textContent = "Bitti!";
                    btn.classList.remove('active');
                    setTimeout(() => btn.textContent = originalText, 2000);
                }
            }, 1000);
        }
    });
}

// --- SIMULATION ---
let gameState = {
    isRunning: false,
    viewMode: 'side', // 'side' or 'top'
    score: 0,
    highScore: 0,
    misses: 0,
    ships: [],
    shots: [],
    lastTime: 0
};

function loadHighScore() {
    const saved = localStorage.getItem('wow_aim_highscore');
    if (saved) {
        gameState.highScore = parseInt(saved);
        highScoreEl.textContent = `En İyi: ${gameState.highScore}`;
    }
}

function saveHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('wow_aim_highscore', gameState.highScore);
        highScoreEl.textContent = `En İyi: ${gameState.highScore}`;
        highScoreEl.style.color = '#fff'; // Flash effect
        setTimeout(() => highScoreEl.style.color = '#f59e0b', 500);
    }
}

// Sim Helpers
class Ship {
    constructor() {
        this.width = 60;
        this.height = 15;
        this.y = Math.random() * (canvas.height - 100) + 50;
        this.speed = (Math.random() * 20 + 10);
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.x = this.direction === 1 ? -this.width : canvas.width + this.width;
        this.color = '#94a3b8';
    }

    update(dt) {
        const pxSpeed = this.speed * 3;
        this.x += this.direction * pxSpeed * dt;
    }

    draw(ctx, mode) {
        ctx.fillStyle = this.color;

        if (mode === 'top') {
            // Top-Down View (Arrow Shape)
            ctx.beginPath();
            if (this.direction === 1) {
                // Moving Right
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.lineTo(this.x + 10, this.y + this.height / 2);
            } else {
                // Moving Left
                ctx.moveTo(this.x + this.width, this.y);
                ctx.lineTo(this.x, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.lineTo(this.x + this.width - 10, this.y + this.height / 2);
            }
            ctx.fill();

            // Wake
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (this.direction === 1) {
                ctx.moveTo(this.x, this.y + this.height / 2);
                ctx.lineTo(this.x - 40, this.y - 10);
                ctx.moveTo(this.x, this.y + this.height / 2);
                ctx.lineTo(this.x - 40, this.y + 25);
            } else {
                ctx.moveTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width + 40, this.y - 10);
                ctx.moveTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width + 40, this.y + 25);
            }
            ctx.stroke();

        } else {
            // Side View (Rect)
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(this.x + (this.width * 0.3), this.y - 10, this.width * 0.4, 10);
        }
    }
}

class Shot {
    constructor(tx, ty) {
        this.tx = tx;
        this.ty = ty;
        this.flightTime = 3.0;
        this.timer = 3.0;
    }

    update(dt) {
        this.timer -= dt;
        return this.timer <= 0;
    }

    draw(ctx) {
        if (this.timer > 0) {
            ctx.beginPath();
            ctx.arc(this.tx, this.ty, 5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 0, ${this.timer / 3})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(this.timer.toFixed(1), this.tx + 8, this.ty - 8);
        }
    }
}

// Sim Loop
function startSimulation() {
    if (gameState.isRunning) return;
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.misses = 0;

    // Clean old
    gameState.ships = [];
    gameState.shots = [];

    updateScore();
    feedbackEl.textContent = "Dikkat: Gemiler farklı hızlarda hareket ediyor!";
    loop(0);
}

function stopSimulation() {
    gameState.isRunning = false;
}

function updateScore() {
    scoreEl.textContent = `Puan: ${gameState.score}`;
    missesEl.textContent = `Iskalar: ${gameState.misses}`;
}

// Canvas Interaction
canvas.addEventListener('mousedown', (e) => {
    if (!gameState.isRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gameState.shots.push(new Shot(x, y));
});

function checkCollisions(shot) {
    let hit = false;
    // Splash
    createExplosion(shot.tx, shot.ty, false); // Water splash always

    gameState.ships.forEach(ship => {
        if (
            shot.tx >= ship.x &&
            shot.tx <= ship.x + ship.width &&
            shot.ty >= ship.y - 10 && // Allow hitting superstructure
            shot.ty <= ship.y + ship.height + 10
        ) {
            hit = true;
            ship.x = -999; // Kill
            createExplosion(shot.tx, shot.ty, true); // Fire explosion
        }
    });

    if (hit) {
        gameState.score++;
        saveHighScore();
    } else {
        gameState.misses++;
    }
    updateScore();
}

let explosions = [];
function createExplosion(x, y, isHit) {
    explosions.push({ x, y, life: 1.0, isHit });
}

function drawCrosshair(ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    for (let i = 1; i < 20; i++) {
        let x = (canvas.width / 2) + (i * 40);
        // Draw tick
        ctx.beginPath();
        ctx.moveTo(x, (canvas.height / 2) - 5);
        ctx.lineTo(x, (canvas.height / 2) + 5);
        ctx.stroke();

        // Mirror
        x = (canvas.width / 2) - (i * 40);
        ctx.beginPath();
        ctx.moveTo(x, (canvas.height / 2) - 5);
        ctx.lineTo(x, (canvas.height / 2) + 5);
        ctx.stroke();
    }
}

function loop(timestamp) {
    if (!gameState.isRunning) return;
    const dt = (timestamp - gameState.lastTime) / 1000 || 0;
    gameState.lastTime = timestamp;

    // Clear & BG
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background Grid if Map Mode
    if (gameState.viewMode === 'top') {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for (let i = 0; i < canvas.height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();
    } else {
        drawCrosshair(ctx);
    }

    // Logic
    if (Math.random() < 0.01 && gameState.ships.length < 4) gameState.ships.push(new Ship());

    // Ships
    for (let i = gameState.ships.length - 1; i >= 0; i--) {
        const s = gameState.ships[i];
        s.update(dt);
        s.draw(ctx, gameState.viewMode);
        if (s.x < -100 || s.x > canvas.width + 100) gameState.ships.splice(i, 1);
    }

    // Shots
    for (let i = gameState.shots.length - 1; i >= 0; i--) {
        const s = gameState.shots[i];
        if (s.update(dt)) {
            checkCollisions(s);
            gameState.shots.splice(i, 1);
        } else {
            s.draw(ctx);
        }
    }

    // Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.life -= dt * 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, (1.0 - e.life) * 30, 0, Math.PI * 2);
        ctx.fillStyle = e.isHit ? `rgba(255, 100, 0, ${e.life})` : `rgba(200, 200, 255, ${e.life * 0.5})`;
        ctx.fill();
        if (e.life <= 0) explosions.splice(i, 1);
    }

    requestAnimationFrame(loop);
}

// Toggle View
toggleViewBtn.addEventListener('click', () => {
    gameState.viewMode = gameState.viewMode === 'side' ? 'top' : 'side';
    toggleViewBtn.textContent = gameState.viewMode === 'side' ? "🗺️ Harita Modu" : "⚓ Normal Mod";
});

// Controls
startSimBtn.addEventListener('click', () => {
    gameState.lastTime = performance.now();
    startSimulation();
});

resetSimBtn.addEventListener('click', () => {
    stopSimulation();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameState.score = 0;
    gameState.misses = 0;
    updateScore();
    feedbackEl.textContent = "Simülasyon sıfırlandı.";
});

// Tab Switch
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        tabContents.forEach(c => {
            c.classList.remove('active');
            if (c.id === targetId) c.classList.add('active');
        });
        if (targetId !== 'simulation') stopSimulation();
    });
});

// Init
init();

// --- CUSTOM SHIP LOGIC ---
const addShipModal = document.getElementById('add-ship-modal');
const openAddShipBtn = document.getElementById('open-add-ship-btn');
const closeAddModalBtn = document.querySelector('.close-add-modal');
const saveNewShipBtn = document.getElementById('save-new-ship-btn');

function initCustomShipLogic() {
    openAddShipBtn.onclick = () => addShipModal.style.display = "block";
    closeAddModalBtn.onclick = () => addShipModal.style.display = "none";

    saveNewShipBtn.onclick = () => {
        const name = document.getElementById('new-ship-name').value;
        const speed = parseFloat(document.getElementById('new-ship-speed').value);
        const type = document.getElementById('new-ship-type').value;
        const nation = document.getElementById('new-ship-nation').value;
        const tier = document.getElementById('new-ship-tier').value;

        if (!name || isNaN(speed)) {
            alert("Lütfen geçerli bir isim ve hız giriniz.");
            return;
        }

        const newShip = { name: name, speed: speed, type: type, nation: nation, tier: tier };

        // Add to global DB
        shipDatabase.push(newShip);

        // Save to LocalStorage for persistence
        saveCustomShip(newShip);

        // Refresh Selectors if context is 'target' (as we only added to shipDatabase for now)
        // Note: Currently we only support adding Target ships via UI. 
        // To support Attacker, we'd need a switcher or Assume custom ships are for Target.
        // Let's assume Target for now as it's the primary use case.
        if (currentFilterContext === 'target') {
            populateSelectors('target');
        }

        // Close Modal & Clear Inputs
        addShipModal.style.display = "none";
        document.getElementById('new-ship-name').value = "";
        document.getElementById('new-ship-speed').value = "";
        alert(`${name} başarıyla eklendi!`);
    };

    window.onclick = (event) => {
        if (event.target == addShipModal) addShipModal.style.display = "none";
    }

    loadCustomShips();
}

function saveCustomShip(ship) {
    let customShips = JSON.parse(localStorage.getItem('customShips')) || [];
    customShips.push(ship);
    localStorage.setItem('customShips', JSON.stringify(customShips));
}

function loadCustomShips() {
    let customShips = JSON.parse(localStorage.getItem('customShips')) || [];
    customShips.forEach(ship => {
        shipDatabase.push(ship);
    });
}

// Call Init Logic
initCustomShipLogic();
