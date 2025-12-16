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

    // API Call
    // fetchShipsFromAPI(); // Disabled in favor of static ships.js which includes AttackerDB

    initLanguage();
}

const translations = {
    tr: {
        "app-title": "⚓ Mermi Uçuş Süresi Hesaplayıcı",
        "nav-calc": "Önleme (Lead) Hesaplayıcı",
        "nav-sim": "Eğitim Simülasyonu",
        "calc-title": "🎯 Mermi Uçuş Süresi Hesaplayıcı",
        "calc-desc": "Gemi hızı, mesafe ve açıya göre nişan noktasını hesaplar.",
        "attacker-title": "🔵 Sizin Geminiz",
        "label-select-ship": "Gemini Seç",
        "btn-filter": "🔍 Filtrele",
        "label-distance": "Mesafe",
        "label-scale": "Ölçek (Nişangah)",
        "target-title": "🔴 Düşman Gemisi",
        "label-select-target": "Düşman Seç",
        "label-speed": "Hız",
        "label-angle": "Açı",
        "label-flight-time": "⏱️ Uçuş Süresi:",
        "unit-seconds": "saniye",
        "result-title": "Nişan Alman Gereken Yer:",
        "unit-tick": "Tick (Birim)",
        "timers-title": "⏱️ Taktik Zamanlayıcılar",
        "btn-smoke": "💨 Duman (45s)",
        "btn-spotter": "✈️ Uçak (60s)",
        "sim-instruction": "Önleme vererek ateş etmek için ekrana tıkla!",
        "footer-text": "WoW Aim Trainer - Eğitim Aracı",
        "default-attacker": "GEMİNİ SEÇ",
        "default-target": "DÜŞMAN GEMİSİNİ SEÇ",
        "filter-modal-title-target": "🔍 Filtrele: Düşman Gemisi",
        "filter-modal-title-attacker": "🔍 Filtrele: Sizin Geminiz",
        "btn-apply-close": "Uygula ve Kapat",
        "footer-credits": "Bu sayfa <a href='https://wows-numbers.com/player/563017661,DespoticCAT/' target='_blank' class='credit-link'>DespoticCAT</a> tarafından yapılmıştır. Geliştirilmeye devam etmektedir."
    },
    en: {
        "app-title": "⚓ Shell Flight Time Calculator",
        "nav-calc": "Lead Calculator",
        "nav-sim": "Training Simulation",
        "calc-title": "🎯 Shell Flight Time Calculator",
        "calc-desc": "Calculates aim point based on ship speed, distance, and angle.",
        "attacker-title": "🔵 Your Ship",
        "label-select-ship": "Select Ship",
        "btn-filter": "🔍 Filter",
        "label-distance": "Distance",
        "label-scale": "Scale (Crosshair)",
        "target-title": "🔴 Enemy Ship",
        "label-select-target": "Select Enemy",
        "label-speed": "Speed",
        "label-angle": "Angle",
        "label-flight-time": "⏱️ Flight Time:",
        "unit-seconds": "seconds",
        "result-title": "Aim Point:",
        "unit-tick": "Ticks",
        "timers-title": "⏱️ Tactical Timers",
        "btn-smoke": "💨 Smoke (45s)",
        "btn-spotter": "✈️ Spotter (60s)",
        "sim-instruction": "Click screen to fire with lead!",
        "footer-text": "WoW Aim Trainer - Training Tool",
        "default-attacker": "SELECT YOUR SHIP",
        "default-target": "SELECT ENEMY SHIP",
        "filter-modal-title-target": "🔍 Filter: Enemy Ship",
        "filter-modal-title-attacker": "🔍 Filter: Your Ship",
        "btn-apply-close": "Apply & Close",
        "footer-credits": "This page was made by <a href='https://wows-numbers.com/player/563017661,DespoticCAT/' target='_blank' class='credit-link'>DespoticCAT</a>. Work in progress."
    },
    it: {
        "app-title": "⚓ Calcolatore Tempo di Volo",
        "nav-calc": "Calcolatore Anticipo",
        "nav-sim": "Simulazione Addestramento",
        "calc-title": "🎯 Calcolatore Tempo di Volo",
        "calc-desc": "Calcola il punto di mira in base a velocità nave, distanza e angolo.",
        "attacker-title": "🔵 La Tua Nave",
        "label-select-ship": "Seleziona Nave",
        "btn-filter": "🔍 Filtra",
        "label-distance": "Distanza",
        "label-scale": "Scala (Mirino)",
        "target-title": "🔴 Nave Nemica",
        "label-select-target": "Seleziona Nemico",
        "label-speed": "Velocità",
        "label-angle": "Angolo",
        "label-flight-time": "⏱️ Tempo di Volo:",
        "unit-seconds": "secondi",
        "result-title": "Punto di Mira:",
        "unit-tick": "Tacche",
        "timers-title": "⏱️ Timer Tattici",
        "btn-smoke": "💨 Fumo (45s)",
        "btn-spotter": "✈️ Ricognitore (60s)",
        "sim-instruction": "Clicca per sparare con l'anticipo!",
        "footer-text": "WoW Aim Trainer - Strumento di Addestramento",
        "default-attacker": "SELEZIONA LA TUA NAVE",
        "default-target": "SELEZIONA NAVE NEMICA",
        "filter-modal-title-target": "🔍 Filtra: Nave Nemica",
        "filter-modal-title-attacker": "🔍 Filtra: La Tua Nave",
        "btn-apply-close": "Applica e Chiudi",
        "footer-credits": "Questa pagina è stata creata da <a href='https://wows-numbers.com/player/563017661,DespoticCAT/' target='_blank' class='credit-link'>DespoticCAT</a>. Lavori in corso."
    },
    de: {
        "app-title": "⚓ Flugzeit-Rechner",
        "nav-calc": "Vorhalte-Rechner",
        "nav-sim": "Trainings-Simulation",
        "calc-title": "🎯 Flugzeit-Rechner",
        "calc-desc": "Berechnet den Zielpunkt basierend auf Schiffsgeschwindigkeit, Entfernung und Winkel.",
        "attacker-title": "🔵 Dein Schiff",
        "label-select-ship": "Schiff Wählen",
        "btn-filter": "🔍 Filter",
        "label-distance": "Entfernung",
        "label-scale": "Skala (Fadenkreuz)",
        "target-title": "🔴 Gegnerschiff",
        "label-select-target": "Gegner Wählen",
        "label-speed": "Geschwindigkeit",
        "label-angle": "Winkel",
        "label-flight-time": "⏱️ Flugzeit:",
        "unit-seconds": "Sekunden",
        "result-title": "Zielpunkt:",
        "unit-tick": "Ticks",
        "timers-title": "⏱️ Taktische Timer",
        "btn-smoke": "💨 Nebel (45s)",
        "btn-spotter": "✈️ Aufklärer (60s)",
        "sim-instruction": "Klicke um mit Vorhalt zu feuern!",
        "footer-text": "WoW Aim Trainer - Trainings-Tool",
        "default-attacker": "WÄHLE DEIN SCHIFF",
        "default-target": "WÄHLE GEGNERSCHIFF",
        "filter-modal-title-target": "🔍 Filter: Gegnerschiff",
        "filter-modal-title-attacker": "🔍 Filter: Dein Schiff",
        "btn-apply-close": "Anwenden & Schließen",
        "footer-credits": "Diese Seite wurde von <a href='https://wows-numbers.com/player/563017661,DespoticCAT/' target='_blank' class='credit-link'>DespoticCAT</a> erstellt. Noch in Entwicklung."
    },
    ru: {
        "app-title": "⚓ Калькулятор Времени Полета",
        "nav-calc": "Калькулятор Упреждения",
        "nav-sim": "Тренировочная Симуляция",
        "calc-title": "🎯 Калькулятор Времени Полета",
        "calc-desc": "Рассчитывает точку прицеливания на основе скорости корабля, дистанции и угла.",
        "attacker-title": "🔵 Ваш Корабль",
        "label-select-ship": "Выбрать Корабль",
        "btn-filter": "🔍 Фильтр",
        "label-distance": "Дистанция",
        "label-scale": "Масштаб (Прицел)",
        "target-title": "🔴 Корабль Противника",
        "label-select-target": "Выбрать Противника",
        "label-speed": "Скорость",
        "label-angle": "Угол",
        "label-flight-time": "⏱️ Время Полета:",
        "unit-seconds": "сек",
        "result-title": "Точка Прицеливания:",
        "unit-tick": "Тики",
        "timers-title": "⏱️ Тактические Таймеры",
        "btn-smoke": "💨 Дым (45с)",
        "btn-spotter": "✈️ Корректировщик (60с)",
        "sim-instruction": "Нажми на экран, чтобы выстрелить с упреждением!",
        "footer-text": "WoW Aim Trainer - Инструмент Тренировки",
        "default-attacker": "ВЫБЕРИТЕ ВАШ КОРАБЛЬ",
        "default-target": "ВЫБЕРИТЕ ПРОТИВНИКА",
        "filter-modal-title-target": "🔍 Фильтр: Корабль Противника",
        "filter-modal-title-attacker": "🔍 Фильтр: Ваш Корабль",
        "btn-apply-close": "Применить и Закрыть",
        "footer-credits": "Эта страница создана <a href='https://wows-numbers.com/player/563017661,DespoticCAT/' target='_blank' class='credit-link'>DespoticCAT</a>. Разработка продолжается."
    }
};

let currentLang = 'tr';

function initLanguage() {
    const selector = document.getElementById('lang-selector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
        // Set initial based on selector
        setLanguage(selector.value);
    }
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update dynamic elements (dropdown defaults)
    updateDynamicText(lang);
}

function updateDynamicText(lang) {
    const t = translations[lang];

    // Update Selector Defaults
    const attackerOpt = document.querySelector('#attacker-selector option[value="custom"]');
    if (attackerOpt) attackerOpt.textContent = t["default-attacker"];

    const targetOpt = document.querySelector('#ship-selector option[value="custom"]');
    if (targetOpt) targetOpt.textContent = t["default-target"];

    // Update Modal Titles if open (or static text)
    // Note: Modal titles are dynamic in openModal(), we need to update that function too or just handle it here?
    // Let's update openModal to use translation.

    // Update Filter Button Text (Apply)
    const applyBtn = document.getElementById('apply-filters-btn');
    if (applyBtn) applyBtn.textContent = t["btn-apply-close"];
}

const API_APP_ID = "958ff05fbaa850b4c2bd0d171eb7e9cc";
const API_BASE_URL = "https://api.worldofwarships.eu/wows/encyclopedia/ships/";

async function fetchShipsFromAPI() {
    console.log("Fetching ships from Wargaming API...");
    // Update UI to show loading state if you want, or just log

    let allShips = [];
    let pageNo = 1;
    const limit = 100;

    try {
        while (true) {
            const url = `${API_BASE_URL}?application_id=${API_APP_ID}&limit=${limit}&page_no=${pageNo}&fields=name,tier,type,nation,default_profile.speed_in_knots,default_profile.mobility.speed,images.small,is_premium,is_special`;

            const response = await fetch(url);
            if (!response.ok) {
                console.error("API Request Failed:", response.status, response.statusText);
                break;
            }

            const data = await response.json();

            if (data.status !== "ok" || !data.data) {
                console.error("API Error:", data.error);
                break;
            }

            const pageShips = Object.values(data.data);
            if (pageShips.length === 0) break; // No more data

            allShips = allShips.concat(pageShips);

            // Check meta for total pages if available, or just rely on empty count
            if (data.meta && data.meta.page_total && pageNo >= data.meta.page_total) {
                break;
            }

            pageNo++;
        }

        console.log(`Fetched ${allShips.length} ships from API.`);

        // Transform and Update Database
        if (allShips.length > 0) {
            const transformedShips = allShips.map(ship => {
                // Determine Speed
                // API 1: default_profile.speed_in_knots (deprecated or specific)
                // API 2: default_profile.mobility.speed
                // Fallback to 30 if null (common for submarines/cvs sometimes not fully profiled in basic endpoint)
                let speed = 0;
                if (ship.default_profile && ship.default_profile.mobility) {
                    speed = ship.default_profile.mobility.speed;
                }

                // Map API Types to Our Types
                // API: "Destroyer", "Cruiser", "Battleship", "AirCarrier", "Submarine"
                // Our: "DD", "CA", "BB", "CV", "SUB"
                const typeMap = {
                    "Destroyer": "DD",
                    "Cruiser": "CA",
                    "Battleship": "BB",
                    "AirCarrier": "CV",
                    "Submarine": "SUB"
                };

                let myType = typeMap[ship.type] || "Other";

                // Map Nations (Capitalize 1st letter usually works, but ensure match)
                // API: "japan", "usa", "ussr", "germany", "uk", "france", "italy", "pan_asia", "commonwealth", "pan_america", "europe", "netherlands", "spain"
                // Our Filter: ["Japan", "USA", "Germany", "USSR", "UK", "France", "Italy", "Pan-Asia", "Other"]
                // We should format nation to Title Case.
                let nation = ship.nation.charAt(0).toUpperCase() + ship.nation.slice(1);
                if (nation === "Usa") nation = "USA";
                if (nation === "Ussr") nation = "USSR";
                if (nation === "Uk") nation = "UK";
                if (nation === "Pan_asia") nation = "Pan-Asia";

                return {
                    name: ship.name,
                    speed: speed,
                    type: myType,
                    nation: nation,
                    tier: String(ship.tier), // API returns number, we use string in filters sometimes
                    is_premium: ship.is_premium || ship.is_special
                };
            }).filter(s => s.speed > 0); // Filter out entities with no speed (like auxiliary or error)

            // Update Global Database
            // Optional: Merge with existing or Replace?
            // Strategy: Replace the static list entirely with the API list for "live" data.
            // But let's keep the custom ones? For now, let's just REPLACE `shipDatabase` content but keep reference.

            // Clear existing static data (optional, maybe we want to keep it if API fails? But here we are in success block)
            shipDatabase.length = 0;
            transformedShips.forEach(s => shipDatabase.push(s));

            // Also populate AttackerDB? 
            // AttackerDB needs 'velocity' (shell velocity), which is NOT in the basic ship info.
            // Getting shell velocity requires querying 'artillery' module details which is a deep separate call per ship.
            // For now, we ONLY update target ships (shipDatabase) as requested.

            // Re-populate Selectors
            populateSelectors('target');

            console.log("Database updated.");

            // Provide visual feedback
            const countStr = `API'den ${transformedShips.length} gemi yüklendi.`;
            const header = document.querySelector('.modal-header h3');
            if (header) header.setAttribute('title', countStr); // subtly add info

            // Or use a toast? For now console is fine + UI update.
            // Maybe update the "Custom" option text to show total count?
            const defaultOpt = shipSelector.querySelector('option[value="custom"]');
            if (defaultOpt) defaultOpt.textContent = `DÜŞMAN GEMİSİNİ SEÇ (${transformedShips.length})`;
        }

    } catch (err) {
        console.error("Failed to fetch ships:", err);
    }
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

    const t = translations[currentLang];
    document.querySelector('.modal-header h3').textContent =
        context === 'target' ? t["filter-modal-title-target"] : t["filter-modal-title-attacker"];

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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
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
