// Comprehensive Ship Database (Tier 8 - 11)
// Format: { name: "Name", speed: 30, type: "BB", nation: "Japan", tier: "10" }

const shipDatabase = [
    // --- SUPER SHIPS (★) ---
    { name: "Satsuma", speed: 27, type: "BB", nation: "Japan", tier: "11" },
    { name: "Hannover", speed: 30, type: "BB", nation: "Germany", tier: "11" },
    { name: "Conde", speed: 35, type: "CA", nation: "France", tier: "11" },
    { name: "Annapolis", speed: 35, type: "CA", nation: "USA", tier: "11" },
    { name: "Yamagiri", speed: 39, type: "DD", nation: "Japan", tier: "11" },
    { name: "Zorkiy", speed: 48, type: "DD", nation: "USSR", tier: "11" },
    { name: "United States", speed: 33, type: "CV", nation: "USA", tier: "11" },
    { name: "Eagle", speed: 32, type: "CV", nation: "UK", tier: "11" },

    // --- TIER 10 BATTLESHIPS (BB) ---
    { name: "Yamato", speed: 27, type: "BB", nation: "Japan", tier: "10" },
    { name: "Montana", speed: 30, type: "BB", nation: "USA", tier: "10" },
    { name: "Vermont", speed: 23, type: "BB", nation: "USA", tier: "10" },
    { name: "Ohio", speed: 28, type: "BB", nation: "USA", tier: "10" },
    { name: "Kremlin", speed: 30, type: "BB", nation: "USSR", tier: "10" },
    { name: "Slava", speed: 30, type: "BB", nation: "USSR", tier: "10" },
    { name: "Schlieffen", speed: 34.1, type: "BB", nation: "Germany", tier: "10" },
    { name: "Preussen", speed: 30, type: "BB", nation: "Germany", tier: "10" },
    { name: "GK (Kurfurst)", speed: 30, type: "BB", nation: "Germany", tier: "10" },
    { name: "Mecklenburg", speed: 32.5, type: "BB", nation: "Germany", tier: "10" },
    { name: "Conqueror", speed: 29.5, type: "BB", nation: "UK", tier: "10" },
    { name: "Thunderer", speed: 29.5, type: "BB", nation: "UK", tier: "10" },
    { name: "St. Vincent", speed: 32, type: "BB", nation: "UK", tier: "10" },
    { name: "Republique", speed: 30, type: "BB", nation: "France", tier: "10" },
    { name: "Bourgogne", speed: 32, type: "BB", nation: "France", tier: "10" },
    { name: "C. Colombo", speed: 29.8, type: "BB", nation: "Italy", tier: "10" },
    { name: "Shikishima", speed: 27, type: "BB", nation: "Japan", tier: "10" },

    // --- TIER 10 CRUISERS (CA/CL) ---
    { name: "Zao", speed: 34, type: "CA", nation: "Japan", tier: "10" },
    { name: "Yoshino", speed: 34, type: "CA", nation: "Japan", tier: "10" },
    { name: "Des Moines", speed: 30, type: "CA", nation: "USA", tier: "10" },
    { name: "Worcester", speed: 33, type: "CA", nation: "USA", tier: "10" },
    { name: "Salem", speed: 30, type: "CA", nation: "USA", tier: "10" },
    { name: "Puerto Rico", speed: 33, type: "CA", nation: "USA", tier: "10" },
    { name: "Petropavlovsk", speed: 32.5, type: "CA", nation: "USSR", tier: "10" },
    { name: "Moskva", speed: 30, type: "CA", nation: "USSR", tier: "10" },
    { name: "Stalingrad", speed: 35, type: "CA", nation: "USSR", tier: "10" },
    { name: "Nevsky", speed: 36, type: "CA", nation: "USSR", tier: "10" },
    { name: "Hindenburg", speed: 31, type: "CA", nation: "Germany", tier: "10" },
    { name: "Minotaur", speed: 33.5, type: "CA", nation: "UK", tier: "10" },
    { name: "Goliath", speed: 25.5, type: "CA", nation: "UK", tier: "10" },
    { name: "Henri IV", speed: 35, type: "CA", nation: "France", tier: "10" },
    { name: "Venezia", speed: 37, type: "CA", nation: "Italy", tier: "10" },
    { name: "Napoli", speed: 35.5, type: "CA", nation: "Italy", tier: "10" },
    { name: "Jinan", speed: 36, type: "CA", nation: "Pan-Asia", tier: "10" },
    { name: "Brisbane", speed: 33.5, type: "CA", nation: "UK", tier: "10" },

    // --- TIER 10 DESTROYERS (DD) ---
    { name: "Shimakaze", speed: 39, type: "DD", nation: "Japan", tier: "10" },
    { name: "Harugumo", speed: 35.7, type: "DD", nation: "Japan", tier: "10" },
    { name: "Hayate", speed: 37, type: "DD", nation: "Japan", tier: "10" },
    { name: "Gearing", speed: 36, type: "DD", nation: "USA", tier: "10" },
    { name: "Somers", speed: 38.6, type: "DD", nation: "USA", tier: "10" },
    { name: "F. Sherman", speed: 33.9, type: "DD", nation: "USA", tier: "10" },
    { name: "Grozovoi", speed: 39.5, type: "DD", nation: "USSR", tier: "10" },
    { name: "Khabarovsk", speed: 43, type: "DD", nation: "USSR", tier: "10" },
    { name: "Delny", speed: 43.5, type: "DD", nation: "USSR", tier: "10" },
    { name: "Z-52", speed: 37.5, type: "DD", nation: "Germany", tier: "10" },
    { name: "Elbing", speed: 36, type: "DD", nation: "Germany", tier: "10" },
    { name: "Daring", speed: 35, type: "DD", nation: "UK", tier: "10" },
    { name: "Kleber", speed: 44, type: "DD", nation: "France", tier: "10" },
    { name: "Marceau", speed: 55, type: "DD", nation: "France", tier: "10" },
    { name: "Halland", speed: 35, type: "DD", nation: "Other", tier: "10" },
    { name: "Ragnar", speed: 35, type: "DD", nation: "Other", tier: "10" },
    { name: "Yueyang", speed: 36.5, type: "DD", nation: "Pan-Asia", tier: "10" },

    // --- TIER 8/9 NOTABLE ---
    { name: "Bismark", speed: 31, type: "BB", nation: "Germany", tier: "8" },
    { name: "Tirpitz", speed: 30.5, type: "BB", nation: "Germany", tier: "8" },
    { name: "N. Carolina", speed: 27.5, type: "BB", nation: "USA", tier: "8" },
    { name: "Massachusetts", speed: 27, type: "BB", nation: "USA", tier: "8" },
    { name: "Vladivostok", speed: 29, type: "BB", nation: "USSR", tier: "8" },
    { name: "N. Cal.", speed: 27.5, type: "BB", nation: "USA", tier: "8" },
    { name: "Amagi", speed: 30, type: "BB", nation: "Japan", tier: "8" },
    { name: "Georgia", speed: 33, type: "BB", nation: "USA", tier: "9" },
    { name: "Musashi", speed: 27, type: "BB", nation: "Japan", tier: "9" },
    { name: "Pommern", speed: 31, type: "BB", nation: "Germany", tier: "9" },
    { name: "Jean Bart", speed: 30, type: "BB", nation: "France", tier: "9" },

    // --- CV & SUB ---
    { name: "Midway", speed: 33, type: "CV", nation: "USA", tier: "10" },
    { name: "Hakuryu", speed: 34, type: "CV", nation: "Japan", tier: "10" },
    { name: "Nakhimov", speed: 32, type: "CV", nation: "USSR", tier: "10" },
    { name: "M. Richthofen", speed: 32, type: "CV", nation: "Germany", tier: "10" },
    { name: "U-2501", speed: 27, type: "SUB", nation: "Germany", tier: "10" },
    { name: "Balao", speed: 30, type: "SUB", nation: "USA", tier: "10" }
];

const attackerDatabase = [
    // BB
    { name: "Yamato (460mm)", velocity: 780, type: "BB", nation: "Japan", tier: "10" },
    { name: "Montana (406mm)", velocity: 762, type: "BB", nation: "USA", tier: "10" },
    { name: "Vermont (457mm)", velocity: 732, type: "BB", nation: "USA", tier: "10" },
    { name: "Kremlin (457mm)", velocity: 800, type: "BB", nation: "USSR", tier: "10" },
    { name: "Slava (406mm)", velocity: 825, type: "BB", nation: "USSR", tier: "10" },
    { name: "Thunderer (457mm)", velocity: 762, type: "BB", nation: "UK", tier: "10" },
    { name: "Republique (431mm)", velocity: 840, type: "BB", nation: "France", tier: "10" },
    { name: "Schlieffen (420mm)", velocity: 800, type: "BB", nation: "Germany", tier: "10" },
    // CA
    { name: "Des Moines (203mm)", velocity: 823, type: "CA", nation: "USA", tier: "10" },
    { name: "Zao (203mm)", velocity: 920, type: "CA", nation: "Japan", tier: "10" },
    { name: "Hindenburg (203mm)", velocity: 925, type: "CA", nation: "Germany", tier: "10" },
    { name: "Moskva (220mm)", velocity: 985, type: "CA", nation: "USSR", tier: "10" },
    { name: "Petropavlovsk (220mm)", velocity: 995, type: "CA", nation: "USSR", tier: "10" },
    { name: "Stalingrad (305mm)", velocity: 950, type: "CA", nation: "USSR", tier: "10" },
    { name: "Venezia (203mm)", velocity: 950, type: "CA", nation: "Italy", tier: "10" },
    { name: "Minotaur (152mm)", velocity: 768, type: "CA", nation: "UK", tier: "10" },
    // DD
    { name: "Shimakaze (127mm)", velocity: 915, type: "DD", nation: "Japan", tier: "10" },
    { name: "Gearing (127mm)", velocity: 792, type: "DD", nation: "USA", tier: "10" },
    { name: "Kleber (139mm)", velocity: 840, type: "DD", nation: "France", tier: "10" },
    { name: "Elbing (150mm)", velocity: 960, type: "DD", nation: "Germany", tier: "10" },
    { name: "Harugumo (100mm)", velocity: 1000, type: "DD", nation: "Japan", tier: "10" }
];
