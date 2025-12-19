// DOM Elements
const attackerSelector = document.getElementById('attacker-selector');
const shipSelector = document.getElementById('ship-selector');
const distInput = document.getElementById('dist-slider');
const distValLabel = document.getElementById('dist-val');
const targetDistInput = document.getElementById('target-distance');
const speedInput = document.getElementById('target-speed');
const speedSlider = document.getElementById('speed-slider');
const speedValLabel = document.getElementById('speed-val');
const angleSlider = document.getElementById('angle-slider');
const angleValLabel = document.getElementById('angle-val');
const scaleInput = document.getElementById('scale-factor');
const flightTimeInput = document.getElementById('flight-time');
const resultValue = document.getElementById('result-value');
const openFilterBtn = document.getElementById('open-filter-btn');
const openAttackerFilterBtn = document.getElementById('open-attacker-filter-btn');
const modal = document.getElementById('filter-modal');
const closeModal = document.querySelector('.close-modal');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const filterCheckboxes = document.querySelectorAll('#filter-modal input[type="checkbox"]');
const langSelector = document.getElementById('lang-selector');

// Attacker Info Elements
const attackerShipImg = document.getElementById('attacker-ship-img');
const attackerPlaceholder = document.getElementById('attacker-ship-placeholder');
const attackerNameEl = document.getElementById('attacker-ship-name');
const attackerNationEl = document.getElementById('attacker-ship-nation');
const attackerTypeEl = document.getElementById('attacker-ship-type');
const attackerVelocityEl = document.getElementById('attacker-ship-velocity');

// Target Info Elements - RIGHT PANEL
const targetShipImg = document.getElementById('target-ship-img');
const targetPlaceholder = document.getElementById('target-ship-placeholder');
const targetNameEl = document.getElementById('target-ship-name');
const targetNationEl = document.getElementById('target-ship-nation');
const targetTypeEl = document.getElementById('target-ship-type');
const targetMaxSpeedEl = document.getElementById('target-ship-max-speed');

// Simulation Elements
const canvas = document.getElementById('aim-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('sim-score');
const highScoreEl = document.getElementById('sim-high-score');
const missesEl = document.getElementById('sim-misses');
const feedbackEl = document.querySelector('.sim-feedback p');
const startSimBtn = document.getElementById('start-sim-btn');
const resetSimBtn = document.getElementById('reset-sim-btn');
const toggleViewBtn = document.getElementById('toggle-view-btn');
const testShotBtn = document.getElementById('test-shot-btn');



// Tabs
const tabs = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// State
let currentFilterContext = 'target'; // 'attacker' or 'target'
let activeLanguage = 'en';

// Ship Data is in ships.js (assumed loaded before script.js)
// If not, we define empty fallback
if (typeof shipDatabase === 'undefined') {
    window.shipDatabase = [
        { id: "Yamato", name: "Yamato", speed: 27, type: "BB", nation: "Japan", tier: 10, image: "https://wows-gloss-icons.wgcdn.co/icons/vehicle/large/PJSB018_c89b782987.png" },
        { id: "Montana", name: "Montana", speed: 30, type: "BB", nation: "USA", tier: 10, image: "https://wows-gloss-icons.wgcdn.co/icons/vehicle/large/PASB017_b64e056972.png" },
        { id: "Shimakaze", name: "Shimakaze", speed: 39, type: "DD", nation: "Japan", tier: 10, image: "https://wows-gloss-icons.wgcdn.co/icons/vehicle/large/PJSD012_50c0598823.png" },
        { id: "Des Moines", name: "Des Moines", speed: 33, type: "CA", nation: "USA", tier: 10, image: "https://wows-gloss-icons.wgcdn.co/icons/vehicle/large/PASC020_034f0c0587.png" }
    ];
}

// Attacker Database - Enriching shipDatabase with velocity if possible, or separate.
if (typeof attackerDatabase === 'undefined') {
    window.attackerDatabase = [
        { id: "Yamato", name: "Yamato", velocity: 780, type: "BB", nation: "Japan", tier: 10 },
        { id: "Montana", name: "Montana", velocity: 762, type: "BB", nation: "USA", tier: 10 },
        { id: "Vermont", name: "Vermont", velocity: 701, type: "BB", nation: "USA", tier: 10 },
        { id: "Slava", name: "Slava", velocity: 870, type: "BB", nation: "USSR", tier: 10 },
        { id: "Shimakaze", name: "Shimakaze", velocity: 915, type: "DD", nation: "Japan", tier: 10 },
        { id: "Des Moines", name: "Des Moines", velocity: 823, type: "CA", nation: "USA", tier: 10 }
    ];
}

// Translations
const translations = {
    tr: {
        "app-title": "World of Warships Aim Calculator",
        "nav-calc": "Önleme (Lead) Hesaplayıcı",
        "nav-sim": "Eğitim Simülasyonu",
        "attacker-title": "🔵 Sizin Geminiz",
        "target-title": "🔴 Düşman Gemisi",
        "calc-title": "🎯 Mermi Uçuş Süresi Hesaplayıcı",
        "calc-desc": "Gemi hızı, mesafe ve açıya göre nişan noktasını hesaplar.",
        "label-select-ship": "Gemini Seç",
        "label-select-target": "Düşman Seç",
        "label-distance": "Mesafe",
        "label-scale": "Ölçek (Nişangah)",
        "label-speed": "Hız",
        "label-angle": "Açı",
        "label-flight-time": "⏱️ Uçuş Süresi:",
        "visualizer-title": "📊 Görsel Önleme Göstergesi",
        "interactive-mode": "İnteraktif Mod",
        "hide-helper": "👁️ Yardımcıyı Gizle",
        "show-helper": "👁️ Yardımcıyı Göster",
        "crosshair-helper": "Kırmızı nişangah yardımcısı",
        "canvas-shoot-here": "🎯 ATEŞ ET",
        "canvas-hits": "İsabet:",
        "canvas-ticks": "ticks",
        "result-title": "Nişan Alman Gereken Yer:",
        "unit-seconds": "saniye",
        "unit-tick": "Tick (Birim)",
        "unit-knot": "knot",
        "btn-filter": "🔍 Filtrele",
        "placeholder-search": "🔍 Ara...",
        "btn-test-shot": "🧪 Bu Atışı Test Et",
        "sim-instruction": "Önleme vererek ateş etmek için ekrana tıkla!",
        "footer-text": "WoW Aim Trainer - Eğitim Aracı",
        "label-nation": "Ülke:",
        "label-type": "Tip:",
        "label-velocity": "Mermi Hızı:",
        "label-max-speed": "Max Hız:",
        "text-select-ship": "Gemini Seç",
        "text-select-target": "Düşman Seç",
        "default-option-attacker": "GEMİNİ SEÇ",
        "default-option-target": "DÜŞMAN GEMİSİNİ SEÇ",
        "placeholder-calculating": "Hesaplanıyor...",
        "credits-pre": "Bu sayfa",
        "credits-post": "tarafından yapılmıştır. Geliştirilmeye devam etmektedir.",
        // SIMULATION UI
        "sim-task": "📋 GÖREV",
        "sim-distance": "🎯 Mesafe",
        "sim-speed": "🚄 Hız",
        "sim-time": "⏱️ Uçuş Süresi",
        "sim-hint": "Bu değerlere göre nişan al!",
        "sim-highscore": "En İyi:",
        "sim-score": "Puan:",
        "sim-misses": "Iskalar:",
        "btn-map": "🗺️ Harita",
        "btn-norm": "⚓ Normal Mod",
        "btn-start": "Başla",
        "btn-reset": "Sıfırla"
    },
    en: {
        "app-title": "WORLD OF WARSHIPS AIM CALCULATOR",
        "nav-calc": "Lead Calculator",
        "nav-sim": "Training Simulation",
        "attacker-title": "🔵 Your Ship",
        "target-title": "🔴 Enemy Ship",
        "calc-title": "🎯 Shell Flight Time & Lead Calculator",
        "calc-desc": "Calculates aim point based on ship speed, distance, and angle.",
        "label-select-ship": "Select Your Ship",
        "label-select-target": "Select Enemy Ship",
        "label-distance": "Distance",
        "label-scale": "Scale (Crosshair)",
        "label-speed": "Speed",
        "label-angle": "Angle",
        "label-flight-time": "⏱️ Flight Time:",
        "visualizer-title": "📊 Visual Lead Indicator",
        "interactive-mode": "Interactive Mode",
        "hide-helper": "👁️ Hide Helper",
        "show-helper": "👁️ Show Helper",
        "crosshair-helper": "Red crosshair helper",
        "canvas-shoot-here": "🎯 SHOOT HERE",
        "canvas-hits": "Hits:",
        "canvas-ticks": "ticks",
        "result-title": "Aim Point:",
        "unit-seconds": "seconds",
        "unit-tick": "Ticks",
        "unit-knot": "knots",
        "btn-filter": "🔍 Filter",
        "placeholder-search": "🔍 Search...",
        "btn-test-shot": "🧪 Test This Shot",
        "sim-instruction": "Click on screen to shoot with lead!",
        "footer-text": "WoW Aim Trainer - Educational Tool",
        "label-nation": "Nation:",
        "label-type": "Type:",
        "label-velocity": "Shell Velocity:",
        "label-max-speed": "Max Speed:",
        "text-select-ship": "Select Ship",
        "text-select-target": "Select Enemy",
        "default-option-attacker": "SELECT SHIP",
        "default-option-target": "SELECT ENEMY",
        "placeholder-calculating": "Calculating...",
        "credits-pre": "This page was made by",
        "credits-post": ". Development is ongoing.",
        // SIMULATION UI
        "sim-task": "📋 TASK",
        "sim-distance": "🎯 Distance",
        "sim-speed": "🚄 Speed",
        "sim-time": "⏱️ Flight Time",
        "sim-hint": "Aim based on these values!",
        "sim-highscore": "Best:",
        "sim-score": "Score:",
        "sim-misses": "Misses:",
        "btn-map": "🗺️ Map Mode",
        "btn-norm": "⚓ Normal Mode",
        "btn-start": "Start",
        "btn-reset": "Reset"
    },
    it: {
        "app-title": "Calcolatore di Tiro World of Warships",
        "nav-calc": "Calcolatore Anticipo",
        "nav-sim": "Simulazione Addestramento",
        "attacker-title": "🔵 La tua Nave",
        "target-title": "🔴 Nave Nemica",
        "calc-title": "🎯 Calcolatore Tempo di Volo & Anticipo",
        "calc-desc": "Calcola il punto di mira basandosi su velocità, distanza e angolo.",
        "label-select-ship": "Seleziona la tua Nave",
        "label-select-target": "Seleziona Nave Nemica",
        "label-distance": "Distanza",
        "label-scale": "Scala (Mirino)",
        "label-speed": "Velocità",
        "label-angle": "Angolo",
        "label-flight-time": "⏱️ Tempo di Volo:",
        "result-title": "Punto di Mira:",
        "unit-seconds": "secondi",
        "unit-tick": "Tacche",
        "unit-knot": "nodi",
        "btn-filter": "🔍 Filtra",
        "placeholder-search": "🔍 Cerca...",
        "btn-test-shot": "🧪 Prova Questo Colpo",
        "sim-instruction": "Clicca sullo schermo per sparare con anticipo!",
        "footer-text": "WoW Aim Trainer - Strumento Educativo",
        "label-nation": "Nazione:",
        "label-type": "Tipo:",
        "label-velocity": "Velocità Proiettile:",
        "label-max-speed": "Velocità Max:",
        "text-select-ship": "Seleziona Nave",
        "text-select-target": "Seleziona Nemico",
        "default-option-attacker": "SELEZIONA NAVE",
        "default-option-target": "SELEZIONA NEMICO",
        "placeholder-calculating": "Calcolo...",
        "credits-pre": "Questa pagina è stata creata da",
        "credits-post": ". Lo sviluppo è in corso.",
        // SIMULATION UI
        "sim-task": "📋 MISSIONE",
        "sim-distance": "🎯 Distanza",
        "sim-speed": "🚄 Velocità",
        "sim-time": "⏱️ Tempo Volo",
        "sim-hint": "Mira in base a questi valori!",
        "sim-highscore": "Migliore:",
        "sim-score": "Punteggio:",
        "sim-misses": "Errori:",
        "btn-map": "🗺️ Mappa",
        "btn-norm": "⚓ Normale",
        "btn-start": "Inizia",
        "btn-reset": "Resetta"
    },
    de: {
        "app-title": "World of Warships Zielrechner",
        "nav-calc": "Vorhalt-Rechner",
        "nav-sim": "Trainingssimulation",
        "attacker-title": "🔵 Dein Schiff",
        "target-title": "🔴 Gegnerschiff",
        "calc-title": "🎯 Flugzeit & Vorhalt Rechner",
        "calc-desc": "Berechnet den Zielpunkt basierend auf Schiffsgeschwindigkeit, Entfernung und Winkel.",
        "label-select-ship": "Wähle dein Schiff",
        "label-select-target": "Wähle Gegnerschiff",
        "label-distance": "Entfernung",
        "label-scale": "Skala (Fadenkreuz)",
        "label-speed": "Geschwindigkeit",
        "label-angle": "Winkel",
        "label-flight-time": "⏱️ Flugzeit:",
        "result-title": "Zielpunkt:",
        "unit-seconds": "Sekunden",
        "unit-tick": "Striche",
        "unit-knot": "Knoten",
        "btn-filter": "🔍 Filter",
        "placeholder-search": "🔍 Suche...",
        "sim-instruction": "Klicke auf den Bildschirm, um mit Vorhalt zu feuern!",
        "footer-text": "WoW Aim Trainer - Lehrmittel",
        "label-nation": "Nation:",
        "label-type": "Typ:",
        "label-velocity": "Mündungsgeschw.:",
        "label-max-speed": "Max Geschw.:",
        "text-select-ship": "Schiff Wählen",
        "text-select-target": "Gegner Wählen",
        "default-option-attacker": "SCHIFF WÄHLEN",
        "default-option-target": "GEGNER WÄHLEN",
        "placeholder-calculating": "Berechnung...",
        "credits-pre": "Diese Seite wurde von",
        "credits-post": "erstellt. Die Entwicklung dauert an.",
        // SIMULATION UI
        "sim-task": "📋 AUFGABE",
        "sim-distance": "🎯 Entfernung",
        "sim-speed": "🚄 Geschw.",
        "sim-time": "⏱️ Flugzeit",
        "sim-hint": "Ziele basierend auf diesen Werten!",
        "sim-highscore": "Highscore:",
        "sim-score": "Punkte:",
        "sim-misses": "Fehler:",
        "btn-map": "🗺️ Karte",
        "btn-norm": "⚓ Normal",
        "btn-start": "Start",
        "btn-reset": "Reset"
    },
    ru: {
        "app-title": "Калькулятор упреждения World of Warships",
        "nav-calc": "Калькулятор упреждения",
        "nav-sim": "Тренировочная симуляция",
        "attacker-title": "🔵 Ваш корабль",
        "target-title": "🔴 Корабль противника",
        "calc-title": "🎯 Калькулятор времени полета и упреждения",
        "calc-desc": "Рассчитывает точку прицеливания на основе скорости, дистанции и угла.",
        "label-select-ship": "Выберите ваш корабль",
        "label-select-target": "Выберите противника",
        "label-distance": "Дистанция",
        "label-scale": "Масштаб (Прицел)",
        "label-speed": "Скорость",
        "label-angle": "Угол",
        "label-flight-time": "⏱️ Время полета:",
        "result-title": "Точка прицеливания:",
        "unit-seconds": "секунд",
        "unit-tick": "Деления",
        "unit-knot": "узлов",
        "btn-filter": "🔍 Фильтр",
        "placeholder-search": "🔍 Поиск...",
        "sim-instruction": "Кликните по экрану для выстрела с упреждением!",
        "footer-text": "WoW Aim Trainer - Обучающий инструмент",
        "label-nation": "Нация:",
        "label-type": "Тип:",
        "label-velocity": "Скор. снаряда:",
        "label-max-speed": "Макс. скор.:",
        "text-select-ship": "Выберите Корабль",
        "text-select-target": "Выберите Противника",
        "default-option-attacker": "ВЫБЕРИТЕ КОРАБЛЬ",
        "default-option-target": "ВЫБЕРИТЕ ПРОТИВНИКА",
        "placeholder-calculating": "Расчет...",
        "credits-pre": "Эта страница была создана",
        "credits-post": ". Разработка продолжается.",
        // SIMULATION UI
        "sim-task": "📋 ЗАДАЧА",
        "sim-distance": "🎯 Дистанция",
        "sim-speed": "🚄 Скорость",
        "sim-time": "⏱️ Время полета",
        "sim-hint": "Цельтесь на основе этих значений!",
        "sim-highscore": "Рекорд:",
        "sim-score": "Очки:",
        "sim-misses": "Промахи:",
        "btn-map": "🗺️ Карта",
        "btn-norm": "⚓ Нормально",
        "btn-start": "Старт",
        "btn-reset": "Сброс"
    },
    ja: {
        "app-title": "World of Warships 偏差射撃計算機",
        "nav-calc": "偏差計算機",
        "nav-sim": "トレーニングシミュレーション",
        "attacker-title": "🔵 自艦",
        "target-title": "🔴 敵艦",
        "calc-title": "🎯 弾着時間＆偏差計算機",
        "calc-desc": "速度、距離、角度に基づいて照準点を計算します。",
        "label-select-ship": "自艦を選択",
        "label-select-target": "敵艦を選択",
        "label-distance": "距離",
        "label-scale": "スケール (照準)",
        "label-speed": "速度",
        "label-angle": "角度",
        "label-flight-time": "⏱️ 弾着時間:",
        "result-title": "照準点:",
        "unit-seconds": "秒",
        "unit-tick": "目盛り",
        "unit-knot": "ノット",
        "btn-filter": "🔍 フィルター",
        "placeholder-search": "🔍 検索...",
        "sim-instruction": "画面をクリックして偏差射撃！",
        "footer-text": "WoW Aim Trainer - 教育ツール",
        "label-nation": "国:",
        "label-type": "艦種:",
        "label-velocity": "初速:",
        "label-max-speed": "最大速度:",
        "text-select-ship": "艦船を選択",
        "text-select-target": "敵艦を選択",
        "default-option-attacker": "艦船を選択",
        "default-option-target": "敵艦を選択",
        "placeholder-calculating": "計算中...",
        "credits-pre": "このページは",
        "credits-post": "によって作成されました。開発は継続中です。",
        // SIMULATION UI
        "sim-task": "📋 ミッション",
        "sim-distance": "🎯 距離",
        "sim-speed": "🚄 速度",
        "sim-time": "⏱️ 飛行時間",
        "sim-hint": "これらの値に基づいて狙ってください！",
        "sim-highscore": "ベスト:",
        "sim-score": "スコア:",
        "sim-misses": "ミス:",
        "btn-map": "🗺️ マップモード",
        "btn-norm": "⚓ 通常モード",
        "btn-start": "開始",
        "btn-reset": "リセット"
    },
    zh: {
        "app-title": "战舰世界 瞄准计算器",
        "nav-calc": "提前量计算器",
        "nav-sim": "训练模拟",
        "attacker-title": "🔵 你的战舰",
        "target-title": "🔴 敌方战舰",
        "calc-title": "🎯 炮弹飞行时间 & 提前量计算器",
        "calc-desc": "基于速度、距离和角度计算瞄准点。",
        "label-select-ship": "选择你的战舰",
        "label-select-target": "选择敌方战舰",
        "label-distance": "距离",
        "label-scale": "刻度 (瞄准镜)",
        "label-speed": "速度",
        "label-angle": "角度",
        "label-flight-time": "⏱️ 飞行时间:",
        "result-title": "瞄准点:",
        "unit-seconds": "秒",
        "unit-tick": "格",
        "unit-knot": "节",
        "btn-filter": "🔍 筛选",
        "placeholder-search": "🔍 搜索...",
        "sim-instruction": "点击屏幕进行提前量射击！",
        "footer-text": "WoW Aim Trainer - 教学工具",
        "label-nation": "国家:",
        "label-type": "类型:",
        "label-velocity": "弹速:",
        "label-max-speed": "最大航速:",
        "text-select-ship": "选择战舰",
        "text-select-target": "选择敌人",
        "default-option-attacker": "选择战舰",
        "default-option-target": "选择敌人",
        "placeholder-calculating": "计算中...",
        "credits-pre": "此页面由",
        "credits-post": "制作。开发仍在继续。",
        // SIMULATION UI
        "sim-task": "📋 任务",
        "sim-distance": "🎯 距离",
        "sim-speed": "🚄 速度",
        "sim-time": "⏱️ 飞行时间",
        "sim-hint": "根据这些这只瞄准！",
        "sim-highscore": "最高分:",
        "sim-score": "得分:",
        "sim-misses": "失误:",
        "btn-map": "🗺️ 地图模式",
        "btn-norm": "⚓ 普通模式",
        "btn-start": "开始",
        "btn-reset": "重置"
    }
};

function init() {
    loadHighScore();
    populateSelectors('target');
    populateSelectors('attacker');
    setupEventListeners();
    setupSearchListeners();
    updateLanguage('en'); // Default EN

}

function updateLanguage(lang) {
    activeLanguage = lang;
    const t = translations[lang] || translations['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    // Refresh selectors to update default option text
    populateSelectors('attacker');
    populateSelectors('target');

    // Refresh ship display text if in default state (custom)
    if (attackerSelector.value === 'custom') updateShipDisplay('attacker', 'custom');
    if (shipSelector.value === 'custom') updateShipDisplay('target', 'custom');
}

// --- FILTERS ---
function openFilterModal(context) {
    currentFilterContext = context;
    modal.style.display = "block";
}

function applyFilters() {
    populateSelectors(currentFilterContext);
    modal.style.display = "none";
}

// --- SELECTORS ---
function populateSelectors(type) {
    const isAttacker = type === 'attacker';
    const selector = isAttacker ? attackerSelector : shipSelector;
    const db = isAttacker ? attackerDatabase : shipDatabase;
    const searchInput = isAttacker ? document.getElementById('attacker-search') : document.getElementById('target-search');
    const filterText = searchInput ? searchInput.value.toLowerCase() : '';

    // Update default option text based on language
    const defaultText = isAttacker ? translations[activeLanguage]['default-option-attacker'] : translations[activeLanguage]['default-option-target'];

    // Save current selection to restore if possible
    const currentSelection = selector.value;

    selector.innerHTML = '';

    // Default Option
    const defOpt = document.createElement('option');
    defOpt.value = 'custom';
    defOpt.textContent = defaultText;
    selector.appendChild(defOpt);

    db.sort((a, b) => a.name.localeCompare(b.name));

    const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value);
    const selectedNations = Array.from(document.querySelectorAll('input[name="nation"]:checked')).map(cb => cb.value);
    const selectedTiers = Array.from(document.querySelectorAll('input[name="tier"]:checked')).map(cb => cb.value);

    const seenNames = new Set();

    db.forEach(ship => {
        // Filter out test ships (names starting with '[') and duplicates
        if (ship.name.startsWith('[') || seenNames.has(ship.name)) {
            return;
        }

        const sType = ship.type;
        const sNation = ship.nation;
        const sTier = String(ship.tier);
        const nameMatch = ship.name.toLowerCase().includes(filterText);

        const typeMatch = selectedTypes.includes(sType);
        const nationMatch = selectedNations.includes(sNation) || (selectedNations.includes('Other') && !['Japan', 'USA', 'Germany', 'USSR', 'UK', 'France', 'Italy', 'Pan-Asia'].includes(sNation));
        const tierMatch = selectedTiers.includes(sTier) || (selectedTiers.includes('Other') && !['11', '10', '9', '8'].includes(sTier));

        if (nameMatch && typeMatch && nationMatch && tierMatch) {
            seenNames.add(ship.name);
            const option = document.createElement('option');
            option.value = ship.id || ship.name;
            if (isAttacker) {
                option.textContent = `[T${ship.tier} ${ship.type}] ${ship.name} (${ship.caliber || "?"}) (${ship.velocity} m/s)`;
            } else {
                option.textContent = `[T${ship.tier} ${ship.type}] ${ship.name} - ${ship.speed} kts`;
            }
            selector.appendChild(option);
        }
    });

    // Restore selection if it still exists
    if (currentSelection && Array.from(selector.options).some(o => o.value === currentSelection)) {
        selector.value = currentSelection;
    }
}

function setupSearchListeners() {
    const attSearch = document.getElementById('attacker-search');
    const trgSearch = document.getElementById('target-search');

    if (attSearch) {
        attSearch.addEventListener('input', () => populateSelectors('attacker'));
    }
    if (trgSearch) {
        trgSearch.addEventListener('input', () => populateSelectors('target'));
    }
}

function updateShipDisplay(type, val) {
    const isAttacker = type === 'attacker';
    const db = isAttacker ? attackerDatabase : shipDatabase;
    const imgEl = isAttacker ? attackerShipImg : targetShipImg;
    const placeholderEl = isAttacker ? attackerPlaceholder : targetPlaceholder;
    const nameEl = isAttacker ? attackerNameEl : targetNameEl;
    const nationEl = isAttacker ? attackerNationEl : targetNationEl;
    const typeEl = isAttacker ? attackerTypeEl : targetTypeEl;
    const velEl = isAttacker ? attackerVelocityEl : null;
    const speedEl = !isAttacker ? targetMaxSpeedEl : null;

    if (val === 'custom') {
        imgEl.style.display = 'none';
        placeholderEl.style.display = 'flex';
        nameEl.textContent = isAttacker ? translations[activeLanguage]['text-select-ship'] : translations[activeLanguage]['text-select-target'];
        nationEl.textContent = "-";
        typeEl.textContent = "-";
        if (velEl) velEl.textContent = "-";
        if (speedEl) speedEl.textContent = "-";
        return;
    }

    const ship = db.find(s => s.id === val || s.name === val);
    if (ship) {
        nameEl.textContent = ship.name;
        nationEl.textContent = ship.nation;
        typeEl.textContent = ship.type;
        if (velEl) velEl.textContent = ship.velocity;
        if (speedEl) speedEl.textContent = ship.speed;

        if (ship.image) {
            imgEl.src = ship.image;
            imgEl.style.display = 'block';
            placeholderEl.style.display = 'none';
        } else {
            imgEl.style.display = 'none';
            placeholderEl.style.display = 'flex';
        }
    }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    syncInputs(distInput, distValLabel, targetDistInput);
    syncInputs(speedSlider, speedValLabel, speedInput);

    angleSlider.addEventListener('input', () => {
        angleValLabel.textContent = angleSlider.value;
        calculateLead();
    });

    langSelector.addEventListener('change', (e) => updateLanguage(e.target.value));

    openFilterBtn.addEventListener('click', () => openFilterModal('target'));
    openAttackerFilterBtn.addEventListener('click', () => openFilterModal('attacker'));
    closeModal.addEventListener('click', () => modal.style.display = "none");
    window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = "none"; });
    applyFiltersBtn.addEventListener('click', applyFilters);

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            if (input.id === 'target-distance' || input.id === 'dist-slider' || input.id === 'attacker-selector') {
                updateFlightTime();
            } else {
                calculateLead();
            }
        });
        if (input.type === 'range') {
            input.addEventListener('input', () => {
                calculateLead();
            });
        }
    });

    distInput.addEventListener('input', updateFlightTime);
    targetDistInput.addEventListener('input', updateFlightTime);
    attackerSelector.addEventListener('change', updateFlightTime);
}

function syncInputs(slider, label, numberInput) {
    slider.addEventListener('input', () => {
        label.textContent = slider.value;
        numberInput.value = slider.value;
    });
    numberInput.addEventListener('input', () => {
        let val = parseFloat(numberInput.value);
        if (val > parseFloat(slider.max)) val = slider.max;
        if (val < parseFloat(slider.min)) val = slider.min;
        slider.value = val;
        label.textContent = val;
    });
}

// --- CALCULATION LOGIC ---
const PHYSICS_CONSTANT = 430;
const TICK_WIDTH_METERS = 7.62; // Standard WoWs tick width (25 feet)

function getAttackerVelocity() {
    const val = attackerSelector.value;
    if (val === 'custom') return 800;
    const ship = attackerDatabase.find(s => s.id === val || s.name === val);
    if (ship) return ship.velocity;
    return parseFloat(val) || 800;
}

function calculateFlightTimeVal(distanceKm, velocity) {
    if (!velocity || velocity <= 0) return 0;
    return (distanceKm * PHYSICS_CONSTANT) / velocity;
}

function updateFlightTime() {
    const velocity = getAttackerVelocity();
    const distanceKm = parseFloat(distInput.value) || 0;
    if (velocity > 0 && distanceKm > 0) {
        const estimatedTime = calculateFlightTimeVal(distanceKm, velocity);
        flightTimeInput.value = estimatedTime.toFixed(2);
    }
    calculateLead();
}

function calculateLead() {
    const dist = parseFloat(distInput.value) || 0;
    const speedKnots = parseFloat(speedInput.value) || 0;
    const angle = parseInt(angleSlider.value) || 90;
    const scale = parseFloat(scaleInput.value) || 1.0;
    const velocity = getAttackerVelocity();

    const time = calculateFlightTimeVal(dist, velocity);
    flightTimeInput.value = time.toFixed(2);

    // Convert knots to m/s: 1 knot = 0.5144 m/s
    const speedMs = speedKnots * 0.5144;

    // Lead (ticks) = (Speed (m/s) × Flight Time (s)) / Tick Width (m)
    const lead = (time * speedMs) / TICK_WIDTH_METERS;
    const angleRad = (angle * Math.PI) / 180;
    const finalLead = lead * Math.sin(angleRad);

    resultValue.textContent = (finalLead / scale).toFixed(2);

    resultValue.style.color = '#38bdf8';
    setTimeout(() => resultValue.style.color = '#fff', 100);

    drawVisualizer(finalLead / scale);
}

// --- VISUALIZER CANAVAS ---
function drawVisualizer(leadTicks) {
    const vCanvas = document.getElementById('visualizer-canvas');
    if (!vCanvas) return;
    const vCtx = vCanvas.getContext('2d');
    const width = vCanvas.width;
    const height = vCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    vCtx.clearRect(0, 0, width, height);

    // Background Gradient (Water/Sky suggestion)
    const gradient = vCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e293b'); // Sky dark
    gradient.addColorStop(0.5, '#475569'); // Horizon
    gradient.addColorStop(1, '#0f172a'); // Water dark
    vCtx.fillStyle = gradient;
    vCtx.fillRect(0, 0, width, height);

    // Draw Ticks (Static Crosshair)
    // 600px / 40 ticks = 15 px per tick standard
    const pxPerTick = 15;

    vCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    vCtx.lineWidth = 2;
    vCtx.beginPath();
    vCtx.moveTo(0, centerY);
    vCtx.lineTo(width, centerY);
    vCtx.stroke();

    vCtx.font = '10px Roboto';
    vCtx.textAlign = 'center';
    vCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    // Major Ticks: Extended range for longer crosshair
    for (let t = -40; t <= 40; t++) {
        if (t === 0) continue;
        const x = centerX + (t * pxPerTick);

        let tickHeight = 5;
        if (t % 5 === 0) tickHeight = 10;
        if (t % 10 === 0) tickHeight = 15;

        vCtx.beginPath();
        vCtx.moveTo(x, centerY - tickHeight);
        vCtx.lineTo(x, centerY + tickHeight);
        vCtx.stroke();

        if (t % 5 === 0) {
            vCtx.fillText(Math.abs(t), x, centerY + tickHeight + 12);
        }
    }

    // Center Triangle (The "0" mark / Crosshair Center)
    vCtx.fillStyle = '#fff';
    vCtx.beginPath();
    vCtx.moveTo(centerX, centerY - 20); // Top caret
    vCtx.lineTo(centerX - 6, centerY - 28);
    vCtx.lineTo(centerX + 6, centerY - 28);
    vCtx.fill();

    // DRAW SHIP at the Calculated Tick Position
    if (!isNaN(leadTicks)) {
        const shipX = centerX + (leadTicks * pxPerTick);
        const shipY = centerY;

        const imgEl = document.getElementById('target-ship-img');

        // Draw ship image if loaded, otherwise draw fallback shape
        const imageReady = imgEl && imgEl.src && imgEl.complete && imgEl.naturalWidth > 0 && imgEl.style.display !== 'none';

        if (imageReady) {
            const sWidth = 120; // BIGGER ship
            const sHeight = 60; // BIGGER ship
            vCtx.globalAlpha = 0.9;

            // Draw ship facing right (no flip)
            vCtx.drawImage(imgEl, shipX - (sWidth / 2), shipY - (sHeight / 2), sWidth, sHeight);

            vCtx.globalAlpha = 1.0;
        } else {
            // Draw ship shape pointing right (left to right motion) - BIGGER
            vCtx.fillStyle = '#22c55e'; // Green ship
            vCtx.beginPath();
            vCtx.moveTo(shipX + 45, shipY); // Bow (front) pointing right
            vCtx.lineTo(shipX - 45, shipY - 15); // Port side
            vCtx.lineTo(shipX - 60, shipY); // Stern (back)
            vCtx.lineTo(shipX - 45, shipY + 15); // Starboard side
            vCtx.closePath();
            vCtx.fill();
        }

        // Highlight circle - BIGGER
        vCtx.strokeStyle = '#38bdf8'; // Cyan highlight
        vCtx.lineWidth = 3;
        vCtx.beginPath();
        vCtx.arc(shipX, shipY, 8, 0, Math.PI * 2);
        vCtx.stroke();
    }
}

// Event Listeners for Calculation
scaleInput.addEventListener('input', calculateLead);
flightTimeInput.addEventListener('input', calculateLead);

attackerSelector.addEventListener('change', () => {
    const val = attackerSelector.value;
    updateShipDisplay('attacker', val);
    calculateLead();
});

shipSelector.addEventListener('change', () => {
    const val = shipSelector.value;
    updateShipDisplay('target', val);

    if (val !== 'custom') {
        const ship = shipDatabase.find(s => s.id === val || s.name === val);
        if (ship) {
            speedInput.value = ship.speed;
            speedSlider.value = ship.speed;
            speedValLabel.textContent = ship.speed;
        }
    }
    calculateLead();
});



// --- SIMULATION ---
// --- SIMULATION ---
let gameState = {
    isRunning: false,
    viewMode: 'side',
    score: 0,
    highScore: 0,
    misses: 0,
    ships: [],
    shots: [],
    lastTime: 0,
    // Scenario Props
    isTestMode: false,
    scenarioDistance: 15.0,
    scenarioSpeed: 30,
    scenarioFlightTime: 5.0
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
        highScoreEl.textContent = `${translations[activeLanguage]['sim-highscore']} ${gameState.highScore}`;
        highScoreEl.style.color = '#fff';
        setTimeout(() => highScoreEl.style.color = '#f59e0b', 500);
    }
}

class Ship {
    constructor() {
        this.width = 60;
        this.height = 15;
        this.width = 60;
        this.height = 15;
        // Center on Y-Axis
        this.y = (canvas.height / 2) - (this.height / 2);
        // USE SCENARIO SPEED
        this.speed = gameState.scenarioSpeed; // Use global scenario speed
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
            ctx.beginPath();
            if (this.direction === 1) {
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.lineTo(this.x + 10, this.y + this.height / 2);
            } else {
                ctx.moveTo(this.x + this.width, this.y);
                ctx.lineTo(this.x, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.lineTo(this.x + this.width - 10, this.y + this.height / 2);
            }
            ctx.fill();

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
        this.flightTime = parseFloat(gameState.scenarioFlightTime);
        this.timer = this.flightTime;
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

function startSimulation() {
    if (gameState.isRunning) return;
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.misses = 0;
    gameState.ships = [];
    gameState.ships = [];
    gameState.shots = [];
    // Force spawn immediately
    gameState.ships.push(new Ship());

    // GENERATE SCENARIO
    generateScenario();

    updateScore();
    feedbackEl.textContent = "Verilen değerlere göre hesapla ve ateş et!";
    loop(0);
}

// GENERATE SCENARIO
// If test mode is active, we don't randomize, we just use existing values
// BUT if ship dies in test mode, do we want to Respawn with SAME values? Yes.
function generateScenario() {
    if (gameState.isTestMode) {
        // KEEP EXISTING VALUES (Test Loop)
    } else {
        // RANDOMIZE
        // 1. Random Distance (10 - 20 km)
        gameState.scenarioDistance = (Math.random() * 10 + 10).toFixed(1);

        // 2. Random Speed (20 - 40 kts)
        gameState.scenarioSpeed = Math.floor(Math.random() * 20 + 20);

        // 3. Calculate Flight Time
        const velocity = 800; // Average
        gameState.scenarioFlightTime = (gameState.scenarioDistance * 430 / velocity).toFixed(2);
    }

    // UPDATE UI
    document.getElementById('scenario-info').style.display = 'block';
    document.getElementById('sc-dist').textContent = gameState.scenarioDistance;
    document.getElementById('sc-speed').textContent = gameState.scenarioSpeed;
    document.getElementById('sc-time').textContent = gameState.scenarioFlightTime;

    // Update Feedback Text
    if (gameState.isTestMode) {
        feedbackEl.textContent = `TEST MODU: ${gameState.scenarioSpeed} kts, ${gameState.scenarioDistance} km`;
    } else {
        feedbackEl.textContent = "Verilen değerlere göre hesapla ve ateş et!";
    }
}

function stopSimulation() {
    gameState.isRunning = false;
    document.getElementById('scenario-info').style.display = 'none';
}

function updateScore() {
    scoreEl.textContent = `${translations[activeLanguage]['sim-score']} ${gameState.score}`;
    missesEl.textContent = `${translations[activeLanguage]['sim-misses']} ${gameState.misses}`;
}

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
    createExplosion(shot.tx, shot.ty, false);

    gameState.ships.forEach(ship => {
        if (
            shot.tx >= ship.x &&
            shot.tx <= ship.x + ship.width &&
            shot.ty >= ship.y - 10 &&
            shot.ty <= ship.y + ship.height + 10
        ) {
            hit = true;
            ship.x = -999;
            createExplosion(shot.tx, shot.ty, true);
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
    const centerY = canvas.height / 2;
    const centerX = canvas.width / 2;

    // Main Line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // DYNAMIC TICKS (Seconds)
    // 1 Second = speed * 3 pixels
    const speed = gameState.scenarioSpeed || 30; // Fallback
    const pxPerSec = speed * 3;

    ctx.font = '12px Roboto'; // Bigger font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw Ticks for up to 15 seconds
    for (let t = 1; t <= 15; t++) {
        const isMajor = t % 5 === 0;

        // Right Side
        let x = centerX + (t * pxPerSec);
        if (x < canvas.width) {
            // Tick
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.moveTo(x, centerY - (isMajor ? 8 : 4));
            ctx.lineTo(x, centerY + (isMajor ? 8 : 4));
            ctx.stroke();

            // Label
            // Show every second, but major ones slightly bigger/different?
            // User requested seeing numbers.
            // Let's show every second if possible, but minimal
            // If pxPerSec is small (slow speed), it might crowd.
            // Safety check: if pxPerSec < 15, maybe skip odd numbers

            if (pxPerSec > 15 || isMajor || t % 2 === 0) {
                ctx.fillStyle = '#ffffff';
                // Text Shadow for visibility
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.lineWidth = 3;

                ctx.fillText(`${t}`, x, centerY + 12);

                // Reset shadow
                ctx.shadowBlur = 0;
            }
        }

        // Left Side
        x = centerX - (t * pxPerSec);
        if (x > 0) {
            // Tick
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.moveTo(x, centerY - (isMajor ? 8 : 4));
            ctx.lineTo(x, centerY + (isMajor ? 8 : 4));
            ctx.stroke();

            if (pxPerSec > 15 || isMajor || t % 2 === 0) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;

                ctx.fillText(`${t}`, x, centerY + 12);

                ctx.shadowBlur = 0;
            }
        }
    }

    // Center Mark
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
}

function loop(timestamp) {
    if (!gameState.isRunning) return;
    const dt = (timestamp - gameState.lastTime) / 1000 || 0;
    gameState.lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.viewMode === 'top') {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for (let i = 0; i < canvas.height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();
    } else {
        drawCrosshair(ctx);
    }

    // Check for scenario ship respawn
    if (gameState.ships.length === 0) {
        // Prepare new scenario delay? Or instant?
        // Let's do instant for now but maybe 1s delay
        generateScenario();
        gameState.ships.push(new Ship());
    }

    for (let i = gameState.ships.length - 1; i >= 0; i--) {
        const s = gameState.ships[i];
        s.update(dt);
        s.draw(ctx, gameState.viewMode);
        // If ship goes off screen, just remove it. Loop will respawn new one next frame
        if (s.x < -100 || s.x > canvas.width + 100) {
            gameState.ships.splice(i, 1);
            gameState.misses++;
            updateScore();
        }
    }

    for (let i = gameState.shots.length - 1; i >= 0; i--) {
        const s = gameState.shots[i];
        if (s.update(dt)) {
            checkCollisions(s);
            gameState.shots.splice(i, 1);
        } else {
            s.draw(ctx);
        }
    }

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

toggleViewBtn.addEventListener('click', () => {
    gameState.viewMode = gameState.viewMode === 'side' ? 'top' : 'side';
    toggleViewBtn.textContent = gameState.viewMode === 'side' ? translations[activeLanguage]['btn-map'] : translations[activeLanguage]['btn-norm'];
});

// START STANDARD DRILL
startSimBtn.addEventListener('click', () => {
    gameState.isTestMode = false;
    gameState.lastTime = performance.now();
    startSimulation();
});

// START// Test Shot Button - Auto-start simulation
if (testShotBtn) {
    testShotBtn.addEventListener('click', () => {
        // Calculate lead first
        calculateLead();

        // Scroll to visualizer with smooth animation
        const visualizerPanel = document.querySelector('.visualizer-panel');
        if (visualizerPanel) {
            visualizerPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Flash effect
            visualizerPanel.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
            setTimeout(() => {
                visualizerPanel.style.boxShadow = '';
            }, 500);
        }

        // Auto-start simulation after scroll
        setTimeout(() => {
            if (typeof startVisualizerSimulation === 'function') {
                startVisualizerSimulation();
            }
        }, 600);
    });
}
resetSimBtn.addEventListener('click', () => {
    stopSimulation();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameState.score = 0;
    gameState.misses = 0;
    updateScore();
    feedbackEl.textContent = "Simülasyon sıfırlandı.";
});

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

        shipDatabase.push(newShip);
        saveCustomShip(newShip);

        if (currentFilterContext === 'target') {
            populateSelectors('target');
        }

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

initCustomShipLogic();
window.onload = init;
