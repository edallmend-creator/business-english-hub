// ================================================================
// BUSINESS ENGLISH COACH v10.1
// Komplett neu - sauber, durchdacht, dokumentiert
// ================================================================
// Autor: Business English Coach Team
// Datum: 2026-03-10
// Didaktik: SRS + Dual Coding + Active Recall
// ================================================================

'use strict';

console.log('🚀 Coach v17.0 - MULTI-DECK lädt...');
console.log('📍 Script geladen, DOM ready:', document.readyState);
console.log('📍 PapaParse verfügbar:', typeof Papa !== 'undefined');

// ================================================================
// CONFIGURATION
// ================================================================

const CONFIG = {
    version: '17.0',
    decksPath: 'data/decks.json',
    maxEmojis: 3,
    emojis: [
        // Gesichter & Emotionen (15)
        '😃','😄','😁','🥳','😍','🤩','😎','🤓',
        '😇','🥰','😊','😏','🤔','🤨','😬',
        
        // Handgesten (10)
        '👍','👎','👌','✌️','🤞','🤘','🤙','👏',
        '🙌','🤝',
        
        // Objekte & Symbole (15)
        '💡','🔥','⚡','✨','🌟','💫','🎯','🎸',
        '🚀','💰','💎','🏆','🎓','📊','📈',
        
        // Weird aber universal (10)
        '🦄','🌈','🍕','🎭','🎨','🎪','🎢','🎡',
        '🌺','🦋'
    ],
    timer: {
        enabled: true,
        auto_reveal: true
    },
    srs_intervals: [1, 2, 7, 14, 28], // SRS Intervalle in Tagen
    praise_messages: [
        'Perfekt getippt!',
        'Exakt richtig!',
        'Sehr gut!',
        'Korrekt!',
        'Ausgezeichnet!',
        'Hervorragend!'
    ],
    supabase: {
        enabled: true,
        url: 'https://fivbdhzndmitngwpaece.supabase.co',
        anonKey: 'sb_secret_9BzwLysm-pim-31uwHAv-w_jiNVMZ_q'
    },
    audio: {
        enabled: true,
        basePath: 'audio/', // Lokaler Pfad im Hub
        defaultAccent: 'us', // 'us' or 'uk'
        defaultSpeed: 1.0,
        speedOptions: [
            { value: 0.75, label: '🐢 Langsam' },
            { value: 1.0, label: '▶️ Normal' }
        ]
    }
};

// ================================================================
// GLOBAL STATE
// ================================================================

const App = {
    // Deck management
    availableDecks: [],
    currentDeck: null,
    
    // Core data
    cards: [],
    currentIndex: 0,
    
    // Session state
    revealed: false,
    userAnswer: '',
    sessionStart: null,
    showHelp: false,
    showDeckSelection: true, // NEW: Start with deck selection
    
    // Timer state
    timerActive: false,
    timerSeconds: 0,
    timerInterval: null,
    timerExpired: false,
    
    // Audio state
    currentAccent: localStorage.getItem('be4w_accent') || CONFIG.audio.defaultAccent,
    audioSpeed: parseFloat(localStorage.getItem('be4w_audio_speed')) || CONFIG.audio.defaultSpeed,
    currentAudio: null, // Current playing audio element
    audioCache: {}, // Cache for loaded file IDs
    
    // Statistics
    stats: {
        correct: 0,
        wrong: 0,
        streak: 0,
        maxStreak: 0,
        perfect_typed: 0  // Für perfekt getippte Phrasen
    },
    
    // User settings
    settings: {
        typing: true,
        emoji: true,
        timer: false,         // Wird ab Woche 2 verfügbar
        interleaving: true,   // Shuffle - User kann deaktivieren!
        timer_duration: 30    // Einheitliche Timer-Dauer (User-einstellbar)
    },
    
    // Data caches
    srsCache: {},
    dcData: {},
    
    // External services
    supabase: null,
    currentUser: null
};

// ================================================================
// SUPABASE INITIALIZATION
// ================================================================

/**
 * Initialisiert Supabase Client
 * @returns {boolean} Success status
 */
function initSupabase() {
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase SDK nicht geladen');
            return false;
        }
        
        App.supabase = window.supabase.createClient(
            CONFIG.supabase.url,
            CONFIG.supabase.anonKey
        );
        
        console.log('✅ Supabase initialisiert');
        return true;
    } catch (error) {
        console.error('❌ Supabase Init Fehler:', error);
        return false;
    }
}

/**
 * Lädt User-Session
 * @returns {Promise<Object|null>} User object or null
 */
async function loadUser() {
    if (!App.supabase) return null;
    
    try {
        const { data: { user }, error } = await App.supabase.auth.getUser();
        
        if (error) {
            console.warn('⚠️ Auth Fehler:', error.message);
            return null;
        }
        
        if (user) {
            console.log('✅ User eingeloggt:', user.email);
            App.currentUser = user;
            return user;
        }
        
        console.log('ℹ️ Kein User eingeloggt (Offline-Modus)');
        return null;
    } catch (error) {
        console.error('❌ User Load Fehler:', error);
        return null;
    }
}

// ================================================================
// SETTINGS MANAGEMENT
// ================================================================

/**
 * Lädt Setting aus LocalStorage
 * @param {string} key - Setting key
 * @param {*} fallback - Default value
 * @returns {*} Setting value
 */
function getSetting(key, fallback) {
    try {
        const userPrefix = App.currentUser ? `${App.currentUser}_` : '';
        const storageKey = `${userPrefix}coach_${key}`;
        const value = localStorage.getItem(storageKey);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        console.error(`❌ getSetting(${key}) Fehler:`, error);
        return fallback;
    }
}

/**
 * Speichert Setting in LocalStorage
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
function saveSetting(key, value) {
    try {
        const userPrefix = App.currentUser ? `${App.currentUser}_` : '';
        const storageKey = `${userPrefix}coach_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
        App.settings[key] = value;
        console.log(`💾 Setting gespeichert: ${key} = ${value}`);
    } catch (error) {
        console.error(`❌ saveSetting(${key}) Fehler:`, error);
    }
}

/**
 * Lädt alle Settings
 */
function loadSettings() {
    App.settings.typing = getSetting('typing', true);
    App.settings.emoji = getSetting('emoji', true);
    App.settings.timer = getSetting('timer', false);
    App.settings.interleaving = getSetting('interleaving', true);
    App.settings.timer_duration = getSetting('timer_duration', 30);
    console.log('✅ Settings geladen:', App.settings);
}

// ================================================================
// DUAL CODING DATA MANAGEMENT
// ================================================================

/**
 * Lädt Dual Coding Data aus LocalStorage
 * @returns {Object} DC data object
 */
function getDCData() {
    try {
        const userPrefix = App.currentUser ? `${App.currentUser}_` : '';
        const data = localStorage.getItem(`${userPrefix}dc_data`);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('❌ getDCData Fehler:', error);
        return {};
    }
}

/**
 * Speichert Dual Coding Data
 * @param {Object} data - DC data object
 */
function saveDCData(data) {
    try {
        const userPrefix = App.currentUser ? `${App.currentUser}_` : '';
        localStorage.setItem(`${userPrefix}dc_data`, JSON.stringify(data));
        App.dcData = data;
        console.log('💾 DC Data gespeichert');
    } catch (error) {
        console.error('❌ saveDCData Fehler:', error);
    }
}

/**
 * Holt Emojis für eine Phrase
 * @param {string} phrase - Deutsche Phrase
 * @returns {Array<string>} Array of emojis
 */
function getDCEmojis(phrase) {
    const data = getDCData();
    return data[phrase] || [];
}

/**
 * Fügt Emoji zu Phrase hinzu
 * @param {string} phrase - Deutsche Phrase
 * @param {string} emoji - Emoji to add
 * @returns {boolean} Success status
 */
function addDCEmoji(phrase, emoji) {
    try {
        const data = getDCData();
        const current = data[phrase] || [];
        
        // Check if max reached (allow duplicates!)
        if (current.length >= CONFIG.maxEmojis) {
            console.log(`ℹ️ Max ${CONFIG.maxEmojis} Emojis erreicht`);
            return false;
        }
        
        // Add emoji (even if duplicate!)
        data[phrase] = [...current, emoji];
        saveDCData(data);
        console.log(`✅ Emoji hinzugefügt: ${emoji} → "${phrase}" (${current.length + 1}/${CONFIG.maxEmojis})`);
        return true;
    } catch (error) {
        console.error('❌ addDCEmoji Fehler:', error);
        return false;
    }
}

// ================================================================
// SRS DATA MANAGEMENT
// ================================================================

/**
 * Lädt SRS Cache aus LocalStorage
 * @returns {Object} SRS cache object
 */
function getSRSCache() {
    try {
        const data = localStorage.getItem('srs_cache');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('❌ getSRSCache Fehler:', error);
        return {};
    }
}

/**
 * Speichert SRS Cache
 * @param {Object} cache - SRS cache object
 */
function saveSRSCache(cache) {
    try {
        localStorage.setItem('srs_cache', JSON.stringify(cache));
        App.srsCache = cache;
        console.log('💾 SRS Cache gespeichert');
    } catch (error) {
        console.error('❌ saveSRSCache Fehler:', error);
    }
}

/**
 * Zeichnet SRS-Review auf
 * @param {string} cardId - Card ID
 * @param {number} rating - Rating (0-3)
 */
function recordSRS(cardId, rating) {
    try {
        const deckId = App.currentDeck?.meta?.id || 'w1_core';
        const srs = getSRSForDeck(deckId);
        
        const existing = srs[cardId] || {
            correct_count: 0,
            wrong_count: 0,
            last_review: null
        };
        
        // Update counts
        if (rating >= 2) {
            existing.correct_count++;
        } else {
            existing.wrong_count++;
            existing.correct_count = Math.max(0, existing.correct_count - 1);
        }
        
        existing.last_review = new Date().toISOString();
        existing.next_review = calculateNextReview(existing.correct_count);
        
        // Save
        saveSRSForDeck(deckId, cardId, existing);
        
        const days = CONFIG.srs_intervals[Math.min(existing.correct_count, 5) - 1] || 0;
        console.log(`📊 SRS: ${cardId} → Level ${existing.correct_count} → +${days}d`);
        
    } catch (error) {
        console.error('❌ recordSRS Fehler:', error);
    }
}

/**
 * Synct SRS-Daten zu Supabase
 * @param {string} cardId - Card ID
 * @param {Object} data - SRS data
 * @returns {Promise<void>}
 */
async function syncSRSToSupabase(cardId, data) {
    if (!App.supabase || !App.currentUser) {
        return;
    }
    
    try {
        const { error } = await App.supabase
            .from('card_reviews')
            .upsert({
                user_id: App.currentUser.id,
                card_id: cardId,
                deck: CONFIG.deckName,
                correct_count: data.correct_count || 0,
                wrong_count: data.wrong_count || 0,
                again_count: data.again_count || 0,
                last_review: data.last_review,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,card_id'
            });
        
        if (error) {
            console.warn('⚠️ Supabase Upsert Warnung:', error.message);
        } else {
            console.log('☁️ SRS zu Supabase synct');
        }
    } catch (error) {
        console.error('❌ Supabase Sync Fehler:', error);
    }
}

// ================================================================
// CSV LOADING
// ================================================================

/**
 * Lädt CSV-Datei
 * @returns {Promise<Array>} Array of cards
 */
async function loadCSV() {
    try {
        console.log(`📥 Lade CSV: ${CONFIG.csvPath}`);
        
        if (!window.Papa) {
            throw new Error('Papa Parse nicht geladen!');
        }
        
        // Fetch CSV
        const response = await fetch(CONFIG.csvPath);
        if (!response.ok) {
            throw new Error(`CSV nicht gefunden: ${CONFIG.csvPath}`);
        }
        
        const csvText = await response.text();
        
        // Parse with PapaParse
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        if (!results.data || results.data.length === 0) {
                            reject(new Error('Keine Daten in CSV'));
                            return;
                        }
                        
                        // Map CSV to cards
                        const cards = results.data.map((row, index) => {
                            // Support both german/deutsch and english/englisch
                            const german = row.german || row.deutsch || '';
                            const english = row.english || row.englisch || '';
                            const example = row.example || row.beispiel || '';
                            
                            if (!german || !english) {
                                console.warn(`⚠️ Zeile ${index + 2}: Fehlende Daten`, row);
                            }
                            
                            return {
                                a: german.trim(),   // Deutsche Phrase
                                q: english.trim(),  // Englische Phrase
                                example: example.trim()
                            };
                        }).filter(card => card.a && card.q); // Remove empty cards
                        
                        console.log(`✅ ${cards.length} Phrasen geladen`);
                        resolve(cards);
                    } catch (error) {
                        reject(error);
                    }
                },
                error: (error) => {
                    reject(new Error(`CSV Parse Fehler: ${error.message}`));
                }
            });
        });
    } catch (error) {
        console.error('❌ CSV Laden fehlgeschlagen:', error);
        throw error;
    }
}

// ================================================================
// UI FUNCTIONS
// ================================================================

/**
 * Zeigt Status-Nachricht
 * @param {string} message - Status message
 * @param {string} type - Message type (info, success, error)
 */
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    
    // Set color based on type
    if (type === 'success') {
        statusEl.style.color = 'var(--green)';
    } else if (type === 'error') {
        statusEl.style.color = 'var(--red)';
    } else {
        statusEl.style.color = 'var(--text)';
    }
}

/**
 * Öffnet Modal
 */
function openModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.add('open');
    }
}

/**
 * Schließt Modal
 */
function closeModal() {
    resetTimer();
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
    }
    console.log('🚪 Modal geschlossen');
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Fisher-Yates Shuffle für Interleaving
 * @param {Array} array - Array zum Mischen
 * @returns {Array} Gemischtes Array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Prüft ob Antwort exakt richtig ist (für Lob)
 * @param {string} userAnswer - User Eingabe
 * @param {string} correctAnswer - Richtige Antwort
 * @returns {boolean} Exakt richtig?
 */
/**
 * Prüft ob Antwort richtig ist (für Lob) - TOLERANT!
 * @param {string} userAnswer - User Eingabe
 * @param {string} correctAnswer - Richtige Antwort
 * @returns {boolean} Richtig genug?
 */
function isExactMatch(userAnswer, correctAnswer) {
    const normalize = (str) => str
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:'"„"'']/g, '')  // Alle Satzzeichen & Quotes weg
        .replace(/\s+/g, ' ')             // Mehrere Leerzeichen → eins
        .replace(/\s*-\s*/g, '-')         // Leerzeichen um Bindestriche
        .replace(/'/g, "'")               // Verschiedene Apostrophe normalisieren
        .replace(/…/g, '...')             // Ellipsis normalisieren
        .replace(/\s+$/g, '')             // Trailing spaces
        .replace(/^\s+/g, '');            // Leading spaces
    
    const userNorm = normalize(userAnswer);
    const correctNorm = normalize(correctAnswer);
    
    // Exakt gleich?
    if (userNorm === correctNorm) return true;
    
    // Levenshtein Distance für kleine Tippfehler
    const distance = levenshteinDistance(userNorm, correctNorm);
    const maxDistance = Math.max(2, Math.floor(correctNorm.length * 0.20)); // 20% Fehlertoleranz, min. 2
    
    console.log(`📊 Match-Check: "${userNorm}" vs "${correctNorm}" → Distance: ${distance}/${maxDistance}`);
    
    return distance <= maxDistance;
}

/**
 * Berechnet Levenshtein Distance (Edit Distance)
 * @param {string} a - String 1
 * @param {string} b - String 2
 * @returns {number} Anzahl Änderungen nötig
 */
function levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // Ersetzung
                    matrix[i][j - 1] + 1,     // Einfügung
                    matrix[i - 1][j] + 1      // Löschung
                );
            }
        }
    }
    
    return matrix[b.length][a.length];
}

// ================================================================
// DECK MANAGEMENT
// ================================================================

/**
 * Lädt Deck-Registry aus JSON
 * @returns {Promise<Array>} Liste der Decks
 */
async function loadDeckRegistry() {
    try {
        const response = await fetch(CONFIG.registryPath);
        const data = await response.json();
        const enabled = data.decks.filter(d => d.enabled);
        console.log(`📚 ${enabled.length} Decks geladen`);
        return enabled;
    } catch (error) {
        console.error('❌ Deck Registry laden fehlgeschlagen:', error);
        // Fallback auf W1 Core
        return [{
            id: 'w1_core',
            name: 'Woche 1: Core Phrases',
            description: 'Grundlegende Business-Phrasen',
            csvPath: 'data/week1-core.csv',
            category: 'builtin',
            week: 1,
            enabled: true,
            color: '#0066CC'
        }];
    }
}

/**
 * Lädt CSV für ein Deck
 * @param {string} csvPath - Pfad zur CSV
 * @returns {Promise<Array>} Karten-Array
 */
async function loadDeckCSV(csvPath) {
    try {
        const response = await fetch(csvPath);
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    console.log(`✅ CSV geladen: ${results.data.length} Karten aus ${csvPath}`);
                    resolve(results.data);
                },
                error: (error) => {
                    console.error('❌ CSV Parse Fehler:', error);
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`❌ CSV laden fehlgeschlagen: ${csvPath}`, error);
        throw error;
    }
}

/**
 * Lädt komplettes Deck (Metadaten + CSV)
 * @param {string} deckId - Deck ID
 * @returns {Promise<Object>} {meta, cards}
 */
async function loadDeck(deckId) {
    const deck = App.decks.find(d => d.id === deckId);
    
    if (!deck) {
        throw new Error(`Deck nicht gefunden: ${deckId}`);
    }
    
    const csvData = await loadDeckCSV(deck.csvPath);
    
    const cards = csvData.map((row, index) => ({
        originalIndex: index, // CSV-Zeilen-Index (für Audio-Mapping!)
        q: row.englisch,
        q_uk: row.englisch_uk || row.englisch, // Fallback to US if no UK variant
        a: row.deutsch,
        example: row.beispiel || '',
        notes: row.notizen || '',
        wrong: row.wrong || '' // For False Friends
    }));
    
    console.log(`✅ Deck geladen: ${deck.name} (${cards.length} Karten)`);
    
    return {
        meta: deck,
        cards: cards
    };
}

/**
 * Gibt SRS-Daten für ein Deck zurück
 * @param {string} deckId - Deck ID
 * @returns {Object} SRS data
 */
function getSRSDataForDeck(deckId) {
    const key = `srs_${deckId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

/**
 * Speichert SRS-Daten für ein Deck
 * @param {string} deckId - Deck ID
 * @param {Object} data - SRS data
 */
function saveSRSDataForDeck(deckId, data) {
    const key = `srs_${deckId}`;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Berechnet nächstes Review-Datum basierend auf SRS-Intervallen
 * @param {number} correctCount - Anzahl richtige Antworten
 * @param {Date} lastReview - Letztes Review-Datum
 * @returns {Date} Nächstes Review-Datum
 */
function calculateNextReview(correctCount, lastReview) {
    const intervals = CONFIG.srs_intervals; // [1, 2, 7, 14, 28]
    const level = Math.min(correctCount, intervals.length);
    const days = intervals[level - 1] || 0;
    
    const next = new Date(lastReview);
    next.setDate(next.getDate() + days);
    
    return next;
}

/**
 * Gibt Tage bis zum Review zurück (negativ = überfällig)
 * @param {Date|string} reviewDate - Review-Datum
 * @returns {number} Tage (negativ = überfällig)
 */
function getDaysUntil(reviewDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const target = new Date(reviewDate);
    target.setHours(0, 0, 0, 0);
    
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
}

/**
 * Gibt Deck-Statistiken zurück
 * @param {string} deckId - Deck ID
 * @returns {Object} Stats
 */
function getDeckStats(deckId) {
    const srsData = getSRSDataForDeck(deckId);
    const cards = Object.values(srsData);
    const now = new Date();
    
    return {
        total: cards.length,
        new: cards.filter(c => !c.last_review).length,
        learning: cards.filter(c => c.last_review && c.correct_count > 0 && c.correct_count < 5).length,
        mastered: cards.filter(c => c.correct_count >= 5).length,
        due: cards.filter(c => c.next_review && new Date(c.next_review) <= now).length
    };
}

/**
 * Berechnet Ähnlichkeit zwischen zwei Strings (0-1)
 * @param {string} a - String 1
 * @param {string} b - String 2
 * @returns {number} Ähnlichkeit (0 = komplett anders, 1 = identisch)
 */
function getSimilarity(a, b) {
    const normalize = (str) => str.toLowerCase().trim().replace(/[.,!?;:'"]/g, '');
    const normA = normalize(a);
    const normB = normalize(b);
    
    const maxLen = Math.max(normA.length, normB.length);
    if (maxLen === 0) return 1;
    
    const distance = levenshteinDistance(normA, normB);
    return 1 - (distance / maxLen);
}

// ================================================================
// DECK MANAGEMENT
// ================================================================

/**
 * Lädt Deck-Liste
 */
async function loadDecks() {
    try {
        const response = await fetch(CONFIG.decksPath);
        const data = await response.json();
        App.availableDecks = data.decks.filter(d => d.enabled);
        console.log(`📚 ${App.availableDecks.length} Decks geladen`);
        return App.availableDecks;
    } catch (error) {
        console.error('❌ Decks laden fehlgeschlagen:', error);
        return [{
            id: 'w1_core',
            name: 'Woche 1: Core',
            csvPath: 'data/week1-core.csv',
            enabled: true,
            color: '#0066CC'
        }];
    }
}

/**
 * Lädt ein spezifisches Deck
 */
async function loadDeck(deckId) {
    const deck = App.availableDecks.find(d => d.id === deckId);
    if (!deck) throw new Error(`Deck ${deckId} nicht gefunden`);
    
    const response = await fetch(deck.csvPath);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Filter first, then assign originalIndex
                const cards = results.data
                    .filter(row => row.deutsch && row.englisch) // Filter empty rows first
                    .map((row, index) => ({
                        originalIndex: index, // Index AFTER filtering!
                        a: (row.deutsch || '').trim(),
                        q: (row.englisch || '').trim(),
                        q_uk: (row.englisch_uk || row.englisch || '').trim(), // UK variant
                        example: (row.beispiel || '').trim(),
                        wrong: (row.wrong || '').trim() // For False Friends
                    }));
                
                App.currentDeck = { meta: deck, cards };
                console.log(`✅ Deck: ${deck.name} (${cards.length} Karten)`);
                resolve(App.currentDeck);
            },
            error: reject
        });
    });
}

/**
 * SRS-Daten für Deck
 */
function getSRSForDeck(deckId) {
    // Scope mit User-Code falls vorhanden
    const userPrefix = App.currentUser ? `${App.currentUser}_` : '';
    const key = `${userPrefix}srs_${deckId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

function saveSRSForDeck(deckId, cardId, srsData) {
    // Scope mit User-Code falls vorhanden
    const userPrefix = App.currentUser ? `${App.currentUser}_` : '';
    const key = `${userPrefix}srs_${deckId}`;
    const all = getSRSForDeck(deckId);
    all[cardId] = srsData;
    localStorage.setItem(key, JSON.stringify(all));
}

/**
 * Berechnet nächstes Review (1,2,7,14,28 Tage)
 */
function calculateNextReview(correctCount) {
    const intervals = CONFIG.srs_intervals;
    const level = Math.min(correctCount, intervals.length);
    const days = intervals[level - 1] || 0;
    const next = new Date();
    next.setDate(next.getDate() + days);
    return next.toISOString();
}

/**
 * Gibt zufällige Lob-Nachricht
 * @returns {string} Lob-Text
 */
function getRandomPraise() {
    const messages = CONFIG.praise_messages;
    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Startet Timer
 */
function startTimer() {
    if (!CONFIG.timer.enabled || !App.settings.timer) return;
    
    // WICHTIG: Stoppe alte Timer zuerst!
    stopTimer();
    
    // Nutze User-eingestellte Dauer (egal ob Tippen oder nicht!)
    const duration = App.settings.timer_duration;
    
    App.timerSeconds = duration;
    App.timerActive = true;
    App.timerExpired = false;
    
    console.log(`⏱️ Timer gestartet: ${duration} Sekunden`);
    
    // Timer Interval
    App.timerInterval = setInterval(() => {
        App.timerSeconds--;
        
        // Update UI
        const timerEl = document.getElementById('timer-display');
        if (timerEl) {
            timerEl.textContent = App.timerSeconds;
            
            // Farbe ändern wenn Zeit knapp wird
            if (App.timerSeconds <= 5) {
                timerEl.style.color = 'var(--red)';
            } else if (App.timerSeconds <= 10) {
                timerEl.style.color = 'var(--accent)';
            }
        }
        
        // Zeit abgelaufen
        if (App.timerSeconds <= 0) {
            stopTimer();
            if (CONFIG.timer.auto_reveal && !App.revealed) {
                App.timerExpired = true;
                revealAnswer();
            }
        }
    }, 1000);
}

/**
 * Stoppt Timer
 */
function stopTimer() {
    if (App.timerInterval) {
        clearInterval(App.timerInterval);
        App.timerInterval = null;
    }
    App.timerActive = false;
    console.log('⏱️ Timer gestoppt');
}

/**
 * Reset Timer
 */
function resetTimer() {
    stopTimer();
    App.timerSeconds = 0;
    App.timerExpired = false;
}

// ================================================================
// COACH FUNCTIONS
// ================================================================

/**
 * Startet Review nur mit schwachen Karten
 */
function reviewWeak() {
    console.log('🎯 Review schwacher Karten...');
    
    // Filter cards with rating < 2
    const weakCards = App.cards.filter(card => {
        const cardId = card.q.substring(0, 40);
        const srsData = App.srsCache[cardId];
        
        // If no data, it's new (not weak)
        if (!srsData) return false;
        
        // Card is weak if more wrong+again than correct
        const wrong = (srsData.wrong_count || 0) + (srsData.again_count || 0);
        const correct = srsData.correct_count || 0;
        
        return wrong > correct;
    });
    
    if (weakCards.length === 0) {
        alert('Keine schwachen Karten gefunden! 🎉');
        return;
    }
    
    console.log(`🎯 ${weakCards.length} schwache Karten gefunden`);
    
    // Initialize review session
    App.cards = weakCards;
    App.currentIndex = 0;
    App.revealed = false;
    App.userAnswer = '';
    App.sessionStart = Date.now();
    App.stats = {
        correct: 0,
        wrong: 0,
        streak: 0,
        maxStreak: 0
    };
    
    renderCard();
}

/**
 * Startet Coach-Session
 */
async function startCoachWithDeck(deckId) {
    console.log(`🎓 Coach wird gestartet mit Deck: ${deckId}...`);
    showStatus('⏳ Lade Deck...', 'info');
    
    try {
        // Load deck
        const deck = await loadDeck(deckId);
        const cards = deck.cards;
        
        if (cards.length === 0) {
            throw new Error('Keine Phrasen in CSV gefunden');
        }
        
        // Interleaving: Shuffle cards (if enabled)
        const finalCards = App.settings.interleaving ? shuffleArray(cards) : cards;
        if (App.settings.interleaving) {
            console.log(`🔀 ${cards.length} Karten gemischt (Interleaving)`);
        } else {
            console.log(`📋 ${cards.length} Karten in Original-Reihenfolge`);
        }
        
        // Initialize session
        App.cards = finalCards;
        App.currentIndex = 0;
        App.revealed = false;
        App.userAnswer = '';
        App.sessionStart = Date.now();
        App.timerActive = false;
        App.timerExpired = false;
        App.stats = {
            correct: 0,
            wrong: 0,
            streak: 0,
            maxStreak: 0,
            perfect_typed: 0
        };
        
        showStatus(`✅ ${cards.length} Phrasen geladen`, 'success');
        
        // Load user (async, don't wait)
        loadUser().catch(err => {
            console.warn('⚠️ User Load Fehler:', err);
        });
        
        // Render first card
        renderCard();
        
        console.log('✅ Coach gestartet!');
    } catch (error) {
        console.error('❌ startCoach Fehler:', error);
        showStatus(`❌ Fehler: ${error.message}`, 'error');
    }
}

/**
 * Rendert aktuelle Karte
 */
function renderCard() {
    const idx = App.currentIndex;
    const cards = App.cards;
    
    // Check if session ended
    if (idx >= cards.length) {
        showSummary();
        return;
    }
    
    const card = cards[idx];
    const cardId = card.q.substring(0, 40);
    const srsData = App.srsCache[cardId];
    const emojis = getDCEmojis(card.a);
    
    const progress = Math.round((idx / cards.length) * 100);
    const stats = App.stats;
    
    // Build HTML
    const html = `
        <!-- Accent Toggle (für Core Decks mit Audio) - IMMER SICHTBAR! -->
        ${App.currentDeck?.meta?.id && (App.currentDeck.meta.id.includes('w1') || App.currentDeck.meta.id.includes('w2') || App.currentDeck.meta.id.includes('w3') || App.currentDeck.meta.id.includes('w4')) && App.currentDeck.meta.id.includes('core') ? `
            <div style="margin: 0 0 16px 0; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <div style="font-size: 13px; font-weight: 700; color: white;">
                        🎙️ Accent:
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="if(App.currentAccent !== 'us') toggleAccent()" 
                                class="accent-btn ${App.currentAccent === 'us' ? 'active' : ''}"
                                style="padding: 8px 16px; border: 2px solid ${App.currentAccent === 'us' ? 'white' : 'rgba(255,255,255,0.3)'}; background: ${App.currentAccent === 'us' ? 'white' : 'transparent'}; color: ${App.currentAccent === 'us' ? '#667eea' : 'white'}; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                            🇺🇸 American
                        </button>
                        <button onclick="if(App.currentAccent !== 'uk') toggleAccent()" 
                                class="accent-btn ${App.currentAccent === 'uk' ? 'active' : ''}"
                                style="padding: 8px 16px; border: 2px solid ${App.currentAccent === 'uk' ? 'white' : 'rgba(255,255,255,0.3)'}; background: ${App.currentAccent === 'uk' ? 'white' : 'transparent'}; color: ${App.currentAccent === 'uk' ? '#667eea' : 'white'}; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                            🇬🇧 British
                        </button>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <!-- Settings Bar (Collapsible) -->
        <div class="settings-bar">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; gap: 8px; align-items: center; cursor: pointer;" 
                     onclick="const c = document.getElementById('settingsContent'); const i = document.getElementById('settingsToggleIcon'); if(c && i) { const isOpen = c.style.display !== 'none'; c.style.display = isOpen ? 'none' : 'block'; i.textContent = isOpen ? '▼' : '▲'; }">
                    <div style="font-size: 13px; font-weight: 600; color: var(--primary);">
                        ⚙️ Einstellungen
                    </div>
                    <span id="settingsToggleIcon" style="font-size: 16px; color: var(--muted); user-select: none;">▼</span>
                </div>
                <button onclick="event.stopPropagation(); window.toggleHelp()" style="background: none; border: none; color: var(--accent); font-size: 18px; cursor: pointer; padding: 4px 8px; margin-right: 40px;" title="Hilfe anzeigen">
                    💡
                </button>
            </div>
            <div id="settingsContent" style="display: none;">
                <div class="settings-toggles">
                    <label>
                        <input type="checkbox" ${App.settings.typing ? 'checked' : ''} 
                            onchange="window.toggleSetting('typing', this.checked)">
                        <span>✍️ Tippen</span>
                    </label>
                    <label>
                        <input type="checkbox" ${App.settings.emoji ? 'checked' : ''} 
                            onchange="window.toggleSetting('emoji', this.checked)">
                        <span>🖼️ Emojis (Dual Coding)</span>
                    </label>
                    <label>
                        <input type="checkbox" ${App.settings.interleaving ? 'checked' : ''} 
                            onchange="window.toggleSetting('interleaving', this.checked)">
                        <span>🔀 Interleaving (Shuffle)</span>
                    </label>
                    <label ${!CONFIG.timer.enabled ? 'style="opacity: 0.5;" title="Ab Woche 2 verfügbar"' : ''}>
                        <input type="checkbox" 
                            ${App.settings.timer ? 'checked' : ''} 
                            ${!CONFIG.timer.enabled ? 'disabled' : ''}
                            onchange="window.toggleSetting('timer', this.checked)">
                        <span>⏱️ Timer (${App.settings.timer_duration}s) - Retrieval Practice${!CONFIG.timer.enabled ? ' 🔒' : ''}</span>
                    </label>
                </div>
                
                <!-- Timer Duration Slider (nur wenn Timer enabled & aktiviert) -->
                ${CONFIG.timer.enabled && App.settings.timer ? `
                    <div style="margin-top: 16px; padding: 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border);">
                        <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: var(--primary);">
                            ⏱️ Timer-Dauer: <strong>${App.settings.timer_duration}s</strong>
                        </div>
                        <input type="range" min="5" max="90" step="5" value="${App.settings.timer_duration}"
                            oninput="window.updateTimerDuration(this.value)"
                            style="width: 100%; cursor: pointer; accent-color: var(--primary);">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-top: 4px;">
                            <span>5s (Blitz)</span>
                            <span>30s (Normal)</span>
                            <span>90s (Entspannt)</span>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${App.showHelp ? `
                <div style="margin-top: 12px; padding: 12px; background: #FFF4E6; border-left: 3px solid var(--accent); border-radius: 6px; font-size: 12px; line-height: 1.6;">
                    <div style="font-weight: 700; margin-bottom: 6px; color: var(--accent);">📚 So funktioniert's:</div>
                    <div style="margin-bottom: 4px;"><strong>Dual Coding:</strong> Wähle 1-3 Emojis als visuelle Merkhilfe!</div>
                    <div style="margin-bottom: 4px;"><strong>Active Recall:</strong> Tippen aktiviert dein Gedächtnis stärker!</div>
                    <div style="margin-bottom: 4px;"><strong>Spaced Repetition:</strong> Falsche Phrasen kommen häufiger zurück!</div>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--accent); opacity: 0.8;">
                        💾 Dein Fortschritt wird automatisch gespeichert!
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Header with Stats -->
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                    ${App.currentDeck?.meta?.name || 'Coach'}
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div style="font-size: 13px; color: var(--muted);">
                        ${srsData ? '×' + srsData.correct_count + '✓ ×' + ((srsData.wrong_count || 0) + (srsData.again_count || 0)) + '✗' : 'Neu'}
                        &nbsp;|&nbsp;
                        ${idx + 1}/${cards.length}
                    </div>
                    <button onclick="exitCoach()" style="padding: 4px 8px; background: transparent; border: 1px solid var(--muted); color: var(--muted); border-radius: 4px; cursor: pointer; font-size: 18px; line-height: 1; transition: all 0.2s;" onmouseover="this.style.background='var(--muted)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='var(--muted)';" title="Zurück zum Hub">
                        ✕
                    </button>
                </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            
            <!-- Live Stats -->
            <div class="stats">
                <span>✅ ${stats.correct}</span>
                <span>❌ ${stats.wrong}</span>
                ${stats.streak > 0 ? `<span style="color: var(--accent);">🔥 ${stats.streak}</span>` : ''}
            </div>
        </div>
        
        <!-- Timer Display (kompakter) -->
        ${CONFIG.timer.enabled && App.settings.timer && !App.revealed ? `
            <div style="text-align: center; margin: 16px 0; padding: 16px; background: var(--surface); border: 2px solid var(--primary); border-radius: 12px;">
                <div id="timer-display" style="font-size: 42px; font-weight: 900; color: var(--primary);">
                    ${App.timerSeconds}
                </div>
                <div style="font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
                    Sekunden verbleibend
                </div>
            </div>
        ` : ''}
        
        <!-- Card -->
        <div class="card">
            <div style="font-size: 10px; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; letter-spacing: 0.1em; font-weight: 700;">
                🇩🇪 Deutsch → Englisch ${App.settings.typing ? 'tippen' : 'sprechen'}
            </div>
            
            <div class="phrase-de">${card.a}</div>
            
            <!-- Audio Player (nur für Core Decks) -->
            ${App.currentDeck?.meta?.id && (App.currentDeck.meta.id.includes('w1') || App.currentDeck.meta.id.includes('w2') || App.currentDeck.meta.id.includes('w3') || App.currentDeck.meta.id.includes('w4')) && App.currentDeck.meta.id.includes('core') ? `
                <div style="margin-top: 16px; padding: 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button onclick="toggleAudio()" class="audio-play-btn"
                                style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: white; border: none; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                                onmouseover="this.style.transform='scale(1.1)'" 
                                onmouseout="this.style.transform='scale(1)'">
                            🔊
                        </button>
                        <div style="flex: 1;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">
                                Audio: ${App.currentAccent === 'us' ? '🇺🇸 American' : '🇬🇧 British'}
                            </div>
                            <div style="display: flex; gap: 4px; align-items: center;">
                                ${CONFIG.audio.speedOptions.map(opt => `
                                    <button onclick="changeAudioSpeed(${opt.value})" 
                                            style="padding: 4px 12px; border: 1px solid ${App.audioSpeed === opt.value ? 'var(--primary)' : 'var(--border)'}; background: ${App.audioSpeed === opt.value ? 'var(--primary)' : 'transparent'}; color: ${App.audioSpeed === opt.value ? 'white' : 'var(--muted)'}; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s;">
                                        ${opt.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${card.wrong ? `
                <div style="margin-top: 12px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 12px 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #991b1b; margin-bottom: 4px; font-weight: 700; letter-spacing: 0.05em;">
                        ⚠️ NICHT:
                    </div>
                    <div style="font-size: 18px; font-weight: 700; color: #dc2626; font-family: var(--font-display);">
                        ${card.wrong}
                    </div>
                </div>
            ` : ''}
            
            ${App.settings.emoji && emojis.length > 0 ? `
                <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    ${emojis.map((emoji, index) => `
                        <div style="position: relative; display: inline-block;">
                            <span style="font-size: 36px;">${emoji}</span>
                            ${App.revealed ? `
                                <button onclick="window.removeDCEmoji('${card.a.replace(/'/g, "\\'")}', ${index})" 
                                    style="position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background: var(--red); color: white; border: 2px solid white; font-size: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1;" 
                                    title="Emoji entfernen">×</button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${App.settings.typing ? `
                <div style="margin-top: 20px;">
                    <input type="text" id="userInput" 
                        placeholder="Tippe die Übersetzung..." 
                        ${App.revealed ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}
                        value="${App.revealed && App.userAnswer ? App.userAnswer : ''}"
                        style="width: 100%; padding: 16px 18px; font-size: 16px; border: 2px solid var(--border); border-radius: 10px; font-family: var(--font-body);"
                        onkeydown="if(event.key==='Enter' && this.value.trim() && !this.disabled) window.revealAnswer()">
                    <div style="font-size: 12px; color: var(--muted); text-align: center; margin-top: 8px;">
                        ${App.revealed ? 'Deine Eingabe ↑' : 'Enter zum Aufdecken'}
                    </div>
                </div>
            ` : ''}
            
            ${App.revealed ? `
                ${App.userAnswer ? `
                    <div style="margin-top: 14px; padding: 10px 12px; background: var(--bg); border-radius: 8px;">
                        <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">Deine Antwort:</div>
                        <div style="font-family: monospace; font-size: 14px;">${App.userAnswer}</div>
                        ${!isExactMatch(App.userAnswer, getEnglishVariant(card)) && getSimilarity(App.userAnswer, getEnglishVariant(card)) > 0.7 ? `
                            <div style="margin-top: 6px; font-size: 11px; color: var(--accent);">
                                ⚡ ${Math.round(getSimilarity(App.userAnswer, getEnglishVariant(card)) * 100)}% ähnlich - Fast!
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${App.userAnswer && isExactMatch(App.userAnswer, getEnglishVariant(card)) ? `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 16px 0; font-weight: 700; font-size: 20px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); animation: fadeIn 0.3s ease-in;">
                        ${getRandomPraise()}
                    </div>
                ` : ''}
                
                <div class="phrase-en">${getEnglishVariant(card)}</div>
                
                ${card.wrong ? `
                    <div style="margin-top: 16px; background: linear-gradient(to right, #f0fdf4, #fef2f2); border-radius: 12px; padding: 16px; border: 2px solid var(--border);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; border: 2px solid #22c55e;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #16a34a; font-weight: 700; margin-bottom: 6px;">✅ RICHTIG</div>
                                <div style="font-size: 18px; font-weight: 700; color: #16a34a;">${getEnglishVariant(card)}</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; border: 2px solid #ef4444;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #dc2626; font-weight: 700; margin-bottom: 6px;">❌ FALSCH</div>
                                <div style="font-size: 18px; font-weight: 700; color: #dc2626;">${card.wrong}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${card.example ? `
                    <div style="font-size: 13px; color: var(--muted); font-style: italic; margin-top: 12px; padding-left: 12px; border-left: 3px solid var(--accent); line-height: 1.5;">
                        ${card.example}
                    </div>
                ` : ''}
                
                ${App.settings.emoji ? `
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
                        <div style="font-size: 12px; font-weight: 600; margin-bottom: 10px; color: var(--primary);">
                            🖼️ Bild-Anker wählen (${emojis.length}/${CONFIG.maxEmojis}) · Klick = An/Aus
                        </div>
                        ${emojis.length >= CONFIG.maxEmojis ? `
                            <div style="font-size: 11px; color: var(--accent); margin-bottom: 8px; font-style: italic;">
                                💡 Tipp: Klicke auf ein Emoji zum Entfernen!
                            </div>
                        ` : ''}
                        <div class="emoji-picker">
                            ${CONFIG.emojis.map(e => {
                                const count = emojis.filter(em => em === e).length;
                                const isSelected = count > 0;
                                return `<button onclick="window.selectEmoji('${card.a.replace(/'/g, "\\'")}','${e}')" 
                                    title="${isSelected ? `Emoji entfernen (${count}x)` : 'Emoji hinzufügen'}" 
                                    style="${isSelected ? 'background: var(--accent); border-color: var(--accent); transform: scale(1.1); position: relative;' : ''}" 
                                    ${!isSelected && emojis.length >= CONFIG.maxEmojis ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                                    ${e}${count > 1 ? `<span style="position: absolute; top: -4px; right: -4px; background: white; color: var(--accent); font-size: 10px; font-weight: 900; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--accent);">${count}</span>` : ''}
                                </button>`;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            ` : ''}
        </div>
        
        <!-- Action Buttons -->
        ${!App.revealed ? `
            <div style="margin-top: 16px;">
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 10px;" onclick="window.revealAnswer()">
                    👁️ Antwort zeigen (A)
                </button>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.previous()" title="Zur vorherigen Karte" ${idx === 0 ? 'disabled' : ''} 
                        style="flex: 1; padding: 12px; border: 2px solid var(--border); background: white; color: var(--muted); border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; ${idx === 0 ? 'opacity: 0.3; cursor: not-allowed;' : 'hover:border-color: var(--primary); hover:color: var(--primary);'}">
                        ← Zurück
                    </button>
                    <button onclick="window.skip()" 
                        style="flex: 1; padding: 12px; border: 2px solid var(--border); background: white; color: var(--muted); border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
                        Überspringen →
                    </button>
                </div>
            </div>
        ` : `
            <div style="margin-top: 20px;">
                ${!App.settings.typing ? `
                    ${CONFIG.timer.enabled && App.settings.timer ? `
                        <div style="font-size: 14px; font-weight: 600; text-align: center; margin-bottom: 12px; color: var(--text);">
                            Wusstest du es?
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="window.rate(0)" title="Nein, wusste ich nicht" style="flex: 1; padding: 16px; border-radius: 12px; border: 2px solid #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; cursor: pointer; font-size: 15px;">
                                ❌ Nein
                            </button>
                            <button onclick="window.rate(2)" title="Ja, wusste ich!" style="flex: 1; padding: 16px; border-radius: 12px; border: 2px solid #22c55e; background: #f0fdf4; color: #16a34a; font-weight: 700; cursor: pointer; font-size: 15px;">
                                👍 Ja
                            </button>
                        </div>
                    ` : `
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 10px; text-align: center; font-weight: 600;">
                            Hast du's gewusst?
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="window.rate(0)" title="Nicht gewusst" style="flex: 1; padding: 16px; border-radius: 12px; border: 2px solid #ef4444; background: #fef2f2; color: #dc2626; font-weight: 700; cursor: pointer; font-size: 15px;">
                                ❌ Falsch
                            </button>
                            <button onclick="window.rate(2)" title="Gewusst!" style="flex: 1; padding: 16px; border-radius: 12px; border: 2px solid #22c55e; background: #f0fdf4; color: #16a34a; font-weight: 700; cursor: pointer; font-size: 15px;">
                                👍 Richtig
                            </button>
                        </div>
                    `}
                ` : `
                    <div style="text-align: center; padding: 12px; color: var(--muted); font-size: 14px;">
                        ${App.settings.emoji ? '✨ Wähle Emojis, dann geht\'s automatisch weiter...' : '⏳ Wird automatisch bewertet...'}
                    </div>
                `}
                
                
                <!-- Navigation Buttons -->
                <div class="nav-buttons">
                    <button onclick="window.previous()" title="Zur vorherigen Karte" ${idx === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                        ← Zurück
                    </button>
                    <button onclick="window.skip()" title="Ohne Bewertung überspringen">
                        Überspringen →
                    </button>
                </div>
            </div>
        `}
        
        <!-- Keyboard Shortcuts Info -->
        <div style="font-size: 11px; color: var(--muted); text-align: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border);">
            ${!App.revealed ? '⌨️ A = Aufdecken · ← = Zurück · S = Überspringen · Esc = Schließen' : '⌨️ 1 = Falsch · 2 = OK · ← = Zurück · Esc = Schließen'}
        </div>
    `;
    
    // Update modal
    const contentEl = document.getElementById('modalContent');
    if (contentEl) {
        contentEl.innerHTML = html;
    }
    
    // Open modal
    openModal();
    
    // Auto-focus input
    if (App.settings.typing && !App.revealed) {
        setTimeout(() => {
            const input = document.getElementById('userInput');
            if (input) {
                input.focus();
                console.log('⌨️ Input fokussiert');
            }
        }, 150);
    }
    
    // Setup keyboard shortcuts
    setupKeys();
    
    // Start Timer if enabled
    if (CONFIG.timer.enabled && App.settings.timer && !App.revealed) {
        setTimeout(() => startTimer(), 100);
    }
    
    console.log(`📄 Karte ${idx + 1}/${cards.length} gerendert`);
}

/**
 * Deckt Antwort auf
 */
function revealAnswer() {
    // Stop timer
    stopTimer();
    
    // Get user input if typing enabled
    if (App.settings.typing) {
        const input = document.getElementById('userInput');
        if (input) {
            App.userAnswer = input.value.trim();
            console.log(`✍️ User-Antwort: "${App.userAnswer}"`);
            
            // Auto-rate IMMER wenn getippt (Tool weiß die Antwort!)
            if (App.userAnswer) {
                const card = App.cards[App.currentIndex];
                const isCorrect = isExactMatch(App.userAnswer, getEnglishVariant(card));
                
                // Show answer first
                App.revealed = true;
                renderCard();
                
                // Auto-advance after delay (Zeit für Emojis wenn aktiviert)
                const delay = App.settings.emoji ? 3000 : 1500;
                setTimeout(() => {
                    rate(isCorrect ? 2 : 0);
                }, delay);
                
                console.log('🤖 Auto-bewertet: ' + (isCorrect ? 'Richtig' : 'Falsch'));
                return;
            }
        }
    }
    
    App.revealed = true;
    renderCard();
    console.log('👁️ Antwort aufgedeckt');
}

/**
 * Wählt Emoji für Phrase (IMMER HINZUFÜGEN)
 * @param {string} phrase - Deutsche Phrase
 * @param {string} emoji - Selected emoji
 */
function selectEmoji(phrase, emoji) {
    // ALWAYS ADD (even if duplicate!)
    const success = addDCEmoji(phrase, emoji);
    if (success) {
        renderCard();
    }
}

/**
 * Entfernt Emoji an bestimmter Position
 * @param {string} phrase - Deutsche Phrase
 * @param {number} index - Index des zu entfernenden Emojis
 */
function removeDCEmoji(phrase, index) {
    const data = getDCData();
    const current = data[phrase] || [];
    
    if (index >= 0 && index < current.length) {
        const updated = [...current.slice(0, index), ...current.slice(index + 1)];
        data[phrase] = updated;
        saveDCData(data);
        console.log(`🗑️ Emoji an Position ${index} entfernt von "${phrase}" (${updated.length}/${CONFIG.maxEmojis})`);
        renderCard();
    }
}

/**
 * Bewertet Karte
 * @param {number} rating - Rating (0-3)
 */
function rate(rating) {
    // Stop timer
    resetTimer();
    
    // Stop audio if playing
    if (App.currentAudio) {
        App.currentAudio.pause();
        App.currentAudio = null;
    }
    
    if (!App.revealed) {
        console.warn('⚠️ Kann nicht bewerten - Antwort noch nicht aufgedeckt');
        return;
    }
    
    const card = App.cards[App.currentIndex];
    const cardId = card.q.substring(0, 40);
    
    // Record SRS
    recordSRS(cardId, rating);
    
    // Update stats
    if (rating >= 2) {
        App.stats.correct++;
        
        // Check if perfect typed
        if (App.userAnswer && isExactMatch(App.userAnswer, getEnglishVariant(card))) {
            App.stats.perfect_typed++;
            console.log(`✨ Perfekt getippt! Total: ${App.stats.perfect_typed}`);
        }
        
        App.stats.streak++;
        App.stats.maxStreak = Math.max(App.stats.maxStreak, App.stats.streak);
        console.log(`✅ Richtig! Streak: ${App.stats.streak}`);
    } else {
        App.stats.wrong++;
        App.stats.streak = 0;
        console.log(`❌ Falsch! Streak zurückgesetzt`);
    }
    
    // Move to next card
    App.currentIndex++;
    App.revealed = false;
    App.userAnswer = '';
    
    renderCard();
}

/**
 * Geht zur vorherigen Karte
 */
function previous() {
    resetTimer();
    
    // Stop audio if playing
    if (App.currentAudio) {
        App.currentAudio.pause();
        App.currentAudio = null;
    }
    
    if (App.currentIndex > 0) {
        App.currentIndex--;
        App.revealed = false;
        App.userAnswer = '';
        renderCard();
        console.log('⬅️ Vorherige Karte');
    }
}

/**
 * Überspringt aktuelle Karte
 */
function skip() {
    resetTimer();
    
    // Stop audio if playing
    if (App.currentAudio) {
        App.currentAudio.pause();
        App.currentAudio = null;
    }
    
    App.currentIndex++;
    App.revealed = false;
    App.userAnswer = '';
    renderCard();
    console.log('⏭️ Karte übersprungen');
}

/**
 * Togglet Setting
 * @param {string} key - Setting key
 * @param {boolean} value - New value
 */
function toggleSetting(key, value) {
    // Speichere Settings-Open-State
    const settingsContent = document.getElementById('settingsContent');
    const wasOpen = settingsContent && settingsContent.style.display !== 'none';
    
    saveSetting(key, value);
    renderCard(); // Re-render with new setting
    
    // Stelle Settings-Open-State wieder her (sofort!)
    if (wasOpen) {
        const content = document.getElementById('settingsContent');
        const icon = document.getElementById('settingsToggleIcon');
        if (content && icon) {
            content.style.display = 'block';
            icon.textContent = '▲';
        }
    }
}

/**
 * Updated Timer-Dauer
 * @param {number} value - Sekunden
 */
function updateTimerDuration(value) {
    App.settings.timer_duration = parseInt(value);
    saveSetting('timer_duration', value);
    console.log(`⏱️ Timer-Dauer: ${value}s`);
    renderCard(); // Update display
}

/**
 * Togglet Hilfe-Anzeige
 */
function toggleHelp() {
    App.showHelp = !App.showHelp;
    renderCard();
}

/**
 * Zeigt Session-Zusammenfassung
 */
function showSummary() {
    const duration = Math.round((Date.now() - App.sessionStart) / 1000);
    const stats = App.stats;
    const total = stats.correct + stats.wrong;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    
    const html = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
            
            <div style="font-size: 32px; font-weight: 900; color: var(--primary); margin-bottom: 10px;">
                Session abgeschlossen!
            </div>
            
            <div style="font-size: 16px; color: var(--muted); margin-bottom: 30px;">
                ${App.cards.length} Phrasen · ${Math.round(duration / 60)} Minuten
            </div>
            
            <!-- Stats Card -->
            <div style="background: var(--surface); border: 2px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 40px; font-weight: 900; color: var(--primary); margin-bottom: 4px;">
                            ${stats.correct}
                        </div>
                        <div style="font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em;">
                            Richtig
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 40px; font-weight: 900; color: var(--red); margin-bottom: 4px;">
                            ${stats.wrong}
                        </div>
                        <div style="font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em;">
                            Wiederholen
                        </div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="progress-bar" style="height: 10px; margin-bottom: 12px;">
                    <div class="progress-fill" style="width: ${accuracy}%; background: linear-gradient(90deg, var(--primary), var(--accent));"></div>
                </div>
                
                <div style="font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
                    ${accuracy}% Genauigkeit
                </div>
                
                ${stats.maxStreak > 1 ? `
                    <div style="font-size: 14px; color: var(--accent); margin-top: 12px; font-weight: 600;">
                        🔥 Längste Streak: ${stats.maxStreak}
                    </div>
                ` : ''}
            </div>
            
            <!-- Actions -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                <button class="btn btn-primary" onclick="window.startCoach()" style="font-size: 16px; padding: 14px 32px;">
                    🔄 Alle nochmal
                </button>
                ${stats.wrong > 0 ? `
                    <button onclick="window.reviewWeak()" style="font-size: 16px; padding: 14px 32px; background: var(--red); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">
                        🎯 Schwache üben (${stats.wrong})
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('modalContent').innerHTML = html;
    console.log('📊 Summary angezeigt');
}

// ================================================================
// KEYBOARD SHORTCUTS
// ================================================================

/**
 * Richtet Keyboard-Shortcuts ein
 */
function setupKeys() {
    document.onkeydown = function(e) {
        // Only handle if modal is open
        const overlay = document.getElementById('modalOverlay');
        if (!overlay || !overlay.classList.contains('open')) {
            return;
        }
        
        // Prevent default for handled keys
        const handledKeys = ['a', 'A', 's', 'S', '1', '2', 'Enter', 'Escape', 'ArrowLeft'];
        if (handledKeys.includes(e.key)) {
            // Don't prevent if typing in input
            if (e.target && e.target.tagName === 'INPUT') {
                return;
            }
            e.preventDefault();
        }
        
        // Before reveal
        if (!App.revealed) {
            if (e.key === 'a' || e.key === 'A') {
                revealAnswer();
            }
            if (e.key === 's' || e.key === 'S') {
                skip();
            }
            if (e.key === 'ArrowLeft') {
                previous();
            }
        } 
        // After reveal
        else {
            if (e.key === '1') {
                rate(0); // Falsch
            }
            if (e.key === '2' || e.key === 'Enter') {
                rate(2); // OK
            }
            if (e.key === 'ArrowLeft') {
                previous();
            }
        }
        
        // Always available
        if (e.key === 'Escape') {
            closeModal();
        }
    };
}

// ================================================================
// AUDIO FUNCTIONS
// ================================================================

/**
 * Toggle Accent (US/UK)
 */
function toggleAccent() {
    App.currentAccent = App.currentAccent === 'us' ? 'uk' : 'us';
    localStorage.setItem('be4w_accent', App.currentAccent);
    
    // Stop current audio if playing
    if (App.currentAudio) {
        App.currentAudio.pause();
        App.currentAudio = null;
    }
    
    // Re-render card to show correct English variant
    renderCard();
    
    console.log('🎙️ Accent switched to:', App.currentAccent.toUpperCase());
}

/**
 * Change audio speed
 */
function changeAudioSpeed(speed) {
    App.audioSpeed = speed;
    localStorage.setItem('be4w_audio_speed', speed);
    
    // Apply to current audio if playing
    if (App.currentAudio) {
        App.currentAudio.playbackRate = speed;
    }
    
    renderCard();
}

/**
 * Gibt die korrekte englische Phrase basierend auf aktuellem Accent zurück
 */
function getEnglishVariant(card) {
    if (!card) return '';
    return App.currentAccent === 'uk' && card.q_uk ? card.q_uk : card.q;
}

/**
 * Get audio URL for current card (LOCAL HOSTING)
 */
function getAudioUrl(cardIndex) {
    // Get current card from shuffled array
    const card = App.cards[cardIndex];
    if (!card) {
        console.warn('⚠️ No card at index', cardIndex);
        return null;
    }
    
    // Use originalIndex if available, otherwise fallback to cardIndex
    // (Fallback needed for cached cards without originalIndex)
    const originalIndex = card.originalIndex !== undefined ? card.originalIndex : cardIndex;
    
    // Determine week from current deck
    const deckId = App.currentDeck?.meta?.id || '';
    let week = '';
    
    if (deckId.includes('w1')) week = 'w1';
    else if (deckId.includes('w2')) week = 'w2';
    else if (deckId.includes('w3')) week = 'w3';
    else if (deckId.includes('w4')) week = 'w4';
    else return null; // No audio for non-week decks
    
    const index = originalIndex + 1; // 1-based for filenames (CSV row 0 = w1_001.mp3)
    const accent = App.currentAccent; // 'us' or 'uk'
    const filename = `${week}_${String(index).padStart(3, '0')}.mp3`;
    
    // Local path: audio/w1/us/w1_001.mp3
    const audioPath = `${CONFIG.audio.basePath}${week}/${accent}/${filename}`;
    
    console.log(`🎵 Audio URL: ${audioPath} (original: ${originalIndex}, current: ${cardIndex})`);
    
    return audioPath;
}

/**
 * Play audio for current card
 */
function playAudio() {
    const audioUrl = getAudioUrl(App.currentIndex);
    
    if (!audioUrl) {
        console.log('⚠️  No audio available for this deck');
        return;
    }
    
    // Stop current audio if playing
    if (App.currentAudio) {
        App.currentAudio.pause();
    }
    
    // Create new audio element
    App.currentAudio = new Audio(audioUrl);
    App.currentAudio.playbackRate = App.audioSpeed;
    
    // Event listeners
    App.currentAudio.addEventListener('loadstart', () => {
        console.log('🎵 Loading audio...');
        const btn = document.querySelector('.audio-play-btn');
        if (btn) btn.textContent = '⏳';
    });
    
    App.currentAudio.addEventListener('canplay', () => {
        console.log('✅ Audio ready');
        const btn = document.querySelector('.audio-play-btn');
        if (btn) btn.textContent = '🔊';
    });
    
    App.currentAudio.addEventListener('playing', () => {
        const btn = document.querySelector('.audio-play-btn');
        if (btn) btn.textContent = '⏸';
    });
    
    App.currentAudio.addEventListener('pause', () => {
        const btn = document.querySelector('.audio-play-btn');
        if (btn) btn.textContent = '🔊';
    });
    
    App.currentAudio.addEventListener('ended', () => {
        const btn = document.querySelector('.audio-play-btn');
        if (btn) btn.textContent = '🔊';
        App.currentAudio = null;
    });
    
    App.currentAudio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        const btn = document.querySelector('.audio-play-btn');
        if (btn) btn.textContent = '❌';
        App.currentAudio = null;
    });
    
    // Play
    App.currentAudio.play().catch(err => {
        console.error('Playback error:', err);
    });
}

/**
 * Toggle play/pause
 */
function toggleAudio() {
    if (!App.currentAudio) {
        playAudio();
    } else if (App.currentAudio.paused) {
        App.currentAudio.play();
    } else {
        App.currentAudio.pause();
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

/**
 * Initialisiert App
 */
/**
 * Zeigt Gesamt-Dashboard für ALLE Decks
 */
function showGlobalDashboard() {
    const container = document.getElementById('app');
    if (!container) return;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Sammle Stats für alle Decks
    const deckStats = App.availableDecks.map(deck => {
        const srs = getSRSForDeck(deck.id);
        const cards = Object.entries(srs);
        
        let due = 0, today = 0, week = 0, mastered = 0, total = cards.length;
        
        cards.forEach(([phrase, data]) => {
            if (data.correct_count >= 5) {
                mastered++;
            }
            
            if (data.next_review) {
                const next = new Date(data.next_review);
                next.setHours(0, 0, 0, 0);
                const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
                
                if (diff < 0) due++;
                else if (diff === 0) today++;
                else if (diff <= 7) week++;
            }
        });
        
        return {
            deck,
            stats: { due, today, week, mastered, total }
        };
    });
    
    const totalDue = deckStats.reduce((sum, d) => sum + d.stats.due + d.stats.today, 0);
    const totalMastered = deckStats.reduce((sum, d) => sum + d.stats.mastered, 0);
    const totalCards = deckStats.reduce((sum, d) => sum + d.stats.total, 0);
    
    const dueDecks = deckStats.filter(d => d.stats.due + d.stats.today > 0);
    const weekDecks = deckStats.filter(d => d.stats.week > 0);
    
    const html = `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>SPACED REPETITION COACH</h1>
                <div class="version">Alle Decks auf einen Blick</div>
            </div>
            <div class="dashboard-body">
                <!-- Summary Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 30px;">
                    <div style="padding: 20px; background: var(--bg); border-radius: 12px; text-align: center; border: 2px solid #DC3545;">
                        <div style="font-size: 36px; font-weight: 900; color: #DC3545;">${totalDue}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 600;">HEUTE FÄLLIG</div>
                    </div>
                    <div style="padding: 20px; background: var(--bg); border-radius: 12px; text-align: center; border: 2px solid #22c55e;">
                        <div style="font-size: 36px; font-weight: 900; color: #22c55e;">${totalMastered}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 600;">GEMEISTERT</div>
                    </div>
                    <div style="padding: 20px; background: var(--bg); border-radius: 12px; text-align: center; border: 2px solid #0066CC;">
                        <div style="font-size: 36px; font-weight: 900; color: #0066CC;">${totalCards}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 600;">GESAMT</div>
                    </div>
                </div>
        
        ${totalDue > 0 ? `
            <div style="margin: 30px 0; padding: 20px; background: #fef2f2; border-left: 4px solid #DC3545; border-radius: 8px;">
                <h3 style="color: #DC3545; margin: 0 0 16px 0;">HEUTE FÄLLIG (${totalDue} Karten)</h3>
                ${dueDecks.map(d => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: white; border-radius: 8px; cursor: pointer;" onclick="selectDeck('${d.deck.id}')">
                        <div>
                            <span style="font-weight: 600;">${d.deck.name}</span>
                            <span style="color: var(--muted); font-size: 13px; margin-left: 8px;">${d.stats.due + d.stats.today} Karten</span>
                        </div>
                        <button style="padding: 8px 16px; background: ${d.deck.color}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            Review starten →
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${weekDecks.length > 0 ? `
            <div style="margin: 30px 0; padding: 20px; background: #fffbeb; border-left: 4px solid #FF9500; border-radius: 8px;">
                <h3 style="color: #FF9500; margin: 0 0 16px 0;">DIESE WOCHE (${weekDecks.reduce((s, d) => s + d.stats.week, 0)} Karten)</h3>
                ${weekDecks.slice(0, 5).map(d => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #FEF3C7;">
                        <span style="font-weight: 600;">${d.deck.name}</span>
                        <span style="color: var(--muted);">${d.stats.week} Karten</span>
                    </div>
                `).join('')}
                ${weekDecks.length > 5 ? `<div style="text-align: center; padding: 8px; color: var(--muted); font-size: 13px;">...und ${weekDecks.length - 5} weitere</div>` : ''}
            </div>
        ` : ''}
        
        <!-- Fortschritt pro Deck -->
        <div style="margin: 30px 0;">
            <h3 style="margin-bottom: 16px;">FORTSCHRITT</h3>
            ${deckStats.filter(d => d.stats.total > 0).map(d => {
                const progress = d.stats.total > 0 ? Math.round((d.stats.mastered / d.stats.total) * 100) : 0;
                return `
                    <div style="margin: 16px 0; padding: 12px; background: var(--surface); border-radius: 8px; cursor: pointer;" onclick="showSRSDashboard('${d.deck.id}')">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: ${d.deck.color};">${d.deck.name}</span>
                            <span style="color: var(--muted); font-size: 13px;">${d.stats.mastered}/${d.stats.total} gemeistert</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${progress}%; height: 100%; background: ${d.deck.color}; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div style="margin-top: 40px; text-align: center; display: flex; gap: 12px; justify-content: center;">
            <button class="btn" style="background: var(--muted); color: white;" onclick="showLearningPlan()">
                Empfohlener 4-Wochen-Plan
            </button>
            <button class="btn btn-primary" onclick="showDeckSelection()">
                Alle Decks anzeigen
            </button>
        </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Zeigt empfohlenen Lernplan aus dem Buch
 */
function showLearningPlan() {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <h2 style="color: var(--primary); margin-bottom: 20px;">EMPFOHLENER 4-WOCHEN-PLAN</h2>
        
        <p style="color: var(--muted); margin-bottom: 24px; font-style: italic;">
            Wie im Buch beschrieben: Rhythmus schlägt Menge!
        </p>
        
        <div style="margin: 20px 0; padding: 16px; background: #e3f2fd; border-left: 4px solid #0066CC; border-radius: 8px;">
            <h3 style="color: #0066CC; margin: 0 0 12px 0;">📘 WOCHE 1: Grundlagen</h3>
            <p style="margin: 8px 0;">• Fokus auf <strong>W1 Core</strong></p>
            <p style="margin: 8px 0;">• Lerne neue Phrasen in <strong>deinem Tempo</strong></p>
            <p style="margin: 8px 0;">• Folge dem Spaced Repetition System für Reviews</p>
            <p style="margin: 8px 0; color: var(--muted); font-size: 14px;">
                💡 "Kleine Einstiegssätze, die ohne Anlauf funktionieren"
            </p>
        </div>
        
        <div style="margin: 20px 0; padding: 16px; background: #fff3e0; border-left: 4px solid #FF9500; border-radius: 8px;">
            <h3 style="color: #FF9500; margin: 0 0 12px 0;">📙 WOCHE 2: Fortschritt</h3>
            <p style="margin: 8px 0;">• <strong>W1 Reviews</strong> laufen automatisch</p>
            <p style="margin: 8px 0;">• Starte <strong>W2 Core</strong> parallel</p>
            <p style="margin: 8px 0;">• Erste Phrasen sitzen schon – spürbar!</p>
            <p style="margin: 8px 0; color: var(--muted); font-size: 14px;">
                💡 "Rhythmus, nicht Regeln"
            </p>
        </div>
        
        <div style="margin: 20px 0; padding: 16px; background: #f1f8e9; border-left: 4px solid #34C759; border-radius: 8px;">
            <h3 style="color: #34C759; margin: 0 0 12px 0;">📗 WOCHE 3: Feinschliff</h3>
            <p style="margin: 8px 0;">• W1+W2 Reviews im Flow</p>
            <p style="margin: 8px 0;">• Erweitere mit <strong>W3 Core</strong></p>
            <p style="margin: 8px 0;">• Reviews stapeln sich sanft</p>
            <p style="margin: 8px 0; color: var(--muted); font-size: 14px;">
                💡 "One-Pager fürs Sprechen"
            </p>
        </div>
        
        <div style="margin: 20px 0; padding: 16px; background: #f3e5f5; border-left: 4px solid #AF52DE; border-radius: 8px;">
            <h3 style="color: #AF52DE; margin: 0 0 12px 0;">📕 WOCHE 4: Anwendung</h3>
            <p style="margin: 8px 0;">• Alle Core-Reviews automatisch</p>
            <p style="margin: 8px 0;">• Starte <strong>W4 Core</strong></p>
            <p style="margin: 8px 0;">• Bonus/Niche Decks nach Interesse!</p>
            <p style="margin: 8px 0; color: var(--muted); font-size: 14px;">
                💡 "Im entscheidenden Moment verfügbar"
            </p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background: #fef2f2; border: 2px solid #DC3545; border-radius: 12px;">
            <h3 style="color: #DC3545; margin: 0 0 12px 0;">⚡ WICHTIG</h3>
            <p style="margin: 8px 0; font-weight: 600;">DU entscheidest das Tempo!</p>
            <p style="margin: 8px 0;">Der Coach passt sich automatisch an. Kein Druck, keine starren Vorgaben.</p>
            <p style="margin: 8px 0; font-style: italic; color: var(--muted);">
                "2-3 Phrasen täglich reichen völlig aus" – aus dem Buch
            </p>
        </div>
        
        <div style="margin: 24px 0; padding: 16px; background: var(--surface2); border-radius: 8px;">
            <h4 style="margin: 0 0 12px 0;">🎯 Nach 4 Wochen:</h4>
            <p style="margin: 8px 0;">✅ ~185 Core-Phrasen im Spaced Repetition System</p>
            <p style="margin: 8px 0;">✅ Automatische Reviews (nur 5-10min/Tag)</p>
            <p style="margin: 8px 0;">✅ Bonus/Niche Decks als Erweiterung</p>
            <p style="margin: 8px 0;">✅ Sätze sitzen – ohne Anlauf verfügbar!</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="btn btn-primary" onclick="closeModal(); showDeckSelection();">
                Los geht's! 🚀
            </button>
        </div>
    `;
    
    modal.classList.add('open');
    modal.style.display = 'flex';
}

/**
 * Zeigt Deck-Auswahl
 */
function showDeckSelection() {
    const container = document.getElementById('app');
    if (!container) return;
    
    const html = `
        <div style="margin-bottom: 20px;">
            <button onclick="showGlobalDashboard()" style="padding: 8px 16px; background: var(--muted); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                ← Übersicht
            </button>
        </div>
        
        <h1>📚 Business English Coach</h1>
        <div class="version">Version ${CONFIG.version} - MULTI-DECK!</div>
        <div style="margin: 30px 0;">
            ${App.availableDecks.map(deck => {
                const srs = getSRSForDeck(deck.id);
                const cards = Object.values(srs);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                const due = cards.filter(c => {
                    if (!c.next_review) return false;
                    const next = new Date(c.next_review);
                    next.setHours(0, 0, 0, 0);
                    return next <= now;
                }).length;
                
                const mastered = cards.filter(c => c.correct_count >= 5).length;
                
                return `
                <div style="padding: 20px; margin: 15px 0; background: var(--surface); border: 2px solid ${deck.color}; border-radius: 12px;">
                    <h3 style="color: ${deck.color}; margin: 0 0 8px 0;">📚 ${deck.name}</h3>
                    <p style="color: var(--muted); margin: 0 0 12px 0;">${deck.description || ''}</p>
                    
                    <div style="display: flex; gap: 16px; font-size: 13px; margin-bottom: 16px;">
                        ${due > 0 ? `<span style="color: #DC3545; font-weight: 600;">🔴 ${due} fällig</span>` : ''}
                        ${mastered > 0 ? `<span style="color: #22c55e;">⭐ ${mastered} gemeistert</span>` : ''}
                        ${cards.length > 0 ? `<span style="color: var(--muted);">📦 ${cards.length} gesamt</span>` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" style="flex: 1; background: ${deck.color};" onclick="selectDeck('${deck.id}')">
                            ${due > 0 ? `Review starten (${due})` : 'Lernen starten'}
                        </button>
                        <button class="btn" style="background: var(--muted); color: white; padding: 12px 20px;" onclick="showSRSDashboard('${deck.id}')">
                            📊 Fortschritt
                        </button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
    container.innerHTML = html;
}

/**
 * Wählt Deck und startet Coach
 */
async function selectDeck(deckId) {
    await startCoachWithDeck(deckId);
}

/**
 * Zeigt SRS-Dashboard für ein Deck
 */
function showSRSDashboard(deckId) {
    const deck = App.availableDecks.find(d => d.id === deckId);
    if (!deck) return;
    
    const srs = getSRSForDeck(deckId);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Kategorisiere Karten
    const cards = Object.entries(srs).map(([phrase, data]) => {
        const nextReview = data.next_review ? new Date(data.next_review) : null;
        let daysUntil = null;
        let category = 'new';
        
        if (nextReview) {
            nextReview.setHours(0, 0, 0, 0);
            daysUntil = Math.ceil((nextReview - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntil < 0) category = 'overdue';
            else if (daysUntil === 0) category = 'today';
            else if (daysUntil <= 7) category = 'week1';
            else if (daysUntil <= 14) category = 'week2';
            else category = 'mastered';
        }
        
        return {
            phrase,
            ...data,
            daysUntil,
            category
        };
    });
    
    const overdue = cards.filter(c => c.category === 'overdue');
    const today = cards.filter(c => c.category === 'today');
    const week1 = cards.filter(c => c.category === 'week1');
    const week2 = cards.filter(c => c.category === 'week2');
    const mastered = cards.filter(c => c.category === 'mastered');
    const newCards = cards.filter(c => c.category === 'new');
    
    const container = document.getElementById('app');
    if (!container) return;
    
    const renderCardList = (title, cardList, color) => {
        if (cardList.length === 0) return '';
        return `
            <div style="margin: 20px 0; padding: 16px; background: var(--surface); border-left: 4px solid ${color}; border-radius: 8px;">
                <h3 style="color: ${color}; margin: 0 0 12px 0;">${title} (${cardList.length})</h3>
                ${cardList.slice(0, 5).map(card => `
                    <div style="padding: 8px; margin: 8px 0; background: var(--bg); border-radius: 6px;">
                        <div style="font-weight: 600;">"${card.phrase}"</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">
                            ${card.daysUntil !== null 
                                ? (card.daysUntil < 0 
                                    ? `Fällig seit ${Math.abs(card.daysUntil)} Tag(en)` 
                                    : `Nächstes Review in ${card.daysUntil} Tag(en)`)
                                : 'Noch nicht geübt'
                            }
                            • Level ${card.correct_count || 0}
                        </div>
                    </div>
                `).join('')}
                ${cardList.length > 5 ? `<div style="text-align: center; padding: 8px; color: var(--muted); font-size: 13px;">...und ${cardList.length - 5} weitere</div>` : ''}
            </div>
        `;
    };
    
    const html = `
        <div style="margin-bottom: 20px;">
            <button onclick="showDeckSelection()" style="padding: 8px 16px; background: var(--muted); color: white; border: none; border-radius: 6px; cursor: pointer;">
                ← Zurück zu Decks
            </button>
        </div>
        
        <h1>📊 Spaced Repetition: ${deck.name}</h1>
        <div style="margin: 20px 0;">
            <div style="display: flex; gap: 10px; justify-content: space-around; padding: 20px; background: var(--surface); border-radius: 12px;">
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 900; color: #DC3545;">${overdue.length + today.length}</div>
                    <div style="font-size: 12px; color: var(--muted);">HEUTE</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 900; color: #0066CC;">${week1.length}</div>
                    <div style="font-size: 12px; color: var(--muted);">IN 1 WOCHE</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 900; color: #FF9500;">${week2.length}</div>
                    <div style="font-size: 12px; color: var(--muted);">IN 2 WOCHEN</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 900; color: #22c55e;">${mastered.length}</div>
                    <div style="font-size: 12px; color: var(--muted);">IN 4 WOCHEN</div>
                </div>
            </div>
        </div>
        
        ${renderCardList('🔴 ÜBERFÄLLIG', overdue, '#DC3545')}
        ${renderCardList('🟡 HEUTE FÄLLIG', today, '#FF9500')}
        ${renderCardList('🔵 WOCHE 1 (7 Tage)', week1, '#0066CC')}
        ${renderCardList('🟣 WOCHE 2 (14 Tage)', week2, '#AF52DE')}
        ${renderCardList('⭐ GEMEISTERT (28 Tage)', mastered, '#22c55e')}
        ${renderCardList('🆕 NEUE KARTEN', newCards, '#6C757D')}
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="btn btn-primary" onclick="selectDeck('${deckId}')" style="background: ${deck.color};">
                ${overdue.length + today.length > 0 ? `Review starten (${overdue.length + today.length} Karten)` : 'Lernen starten'}
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

function init() {
    console.log(`🎓 Business English Coach v${CONFIG.version}`);
    console.log('📅 Initialisierung...');
    
    try {
        // Load user code from Hub sync system
        const userCode = localStorage.getItem('be4w_user_code');
        if (userCode) {
            App.currentUser = userCode;
            console.log(`👤 User-Code aus Hub: ${userCode}`);
        } else {
            console.log('👤 Kein User-Code gefunden (Hub-Sync nicht aktiv)');
        }
        
        // Load settings
        loadSettings();
        
        // Load cached data
        App.dcData = getDCData();
        App.srsCache = getSRSCache();
        
        console.log(`💾 ${Object.keys(App.dcData).length} DC-Einträge geladen`);
        console.log(`💾 ${Object.keys(App.srsCache).length} SRS-Einträge geladen`);
        
        // Initialize Supabase (optional)
        if (CONFIG.supabase.enabled) {
            const supabaseOk = initSupabase();
            if (!supabaseOk) {
                console.warn('⚠️ Supabase nicht verfügbar - Offline-Modus');
            }
        } else {
            console.log('ℹ️ Supabase deaktiviert - Nur lokaler Modus');
        }
        
/**
 * Exit Coach und zurück zum Hub
 */
function exitCoach() {
    // Get source parameter from URL (which week started the coach)
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || 'week-0'; // Default to Week 1
    
    // Navigate back to hub with anchor
    window.location.href = `index.html#${source}`;
}

        // Export functions to window (for HTML onclick)
        window.startCoach = () => showDeckSelection();
        window.startCoachWithDeck = startCoachWithDeck;
        window.selectDeck = selectDeck;
        window.showDeckSelection = showDeckSelection;
        window.showGlobalDashboard = showGlobalDashboard;
        window.showSRSDashboard = showSRSDashboard;
        window.showLearningPlan = showLearningPlan;
        window.reviewWeak = reviewWeak;
        window.revealAnswer = revealAnswer;
        window.selectEmoji = selectEmoji;
        window.removeDCEmoji = removeDCEmoji;
        window.rate = rate;
        window.previous = previous;
        window.skip = skip;
        window.toggleSetting = toggleSetting;
        window.updateTimerDuration = updateTimerDuration;
        window.toggleHelp = toggleHelp;
        window.closeModal = closeModal;
        window.exitCoach = exitCoach;
        
        // Audio functions
        window.toggleAccent = toggleAccent;
        window.changeAudioSpeed = changeAudioSpeed;
        window.toggleAudio = toggleAudio;
        
        console.log('✅ Funktionen exportiert');
        
        // Update User-Code Badge
        const userCodeBadge = document.getElementById('coachUserCode');
        if (userCodeBadge && App.currentUser) {
            userCodeBadge.textContent = App.currentUser;
        }
        
        // Load decks and show selection
        loadDecks().then(() => {
            // Check for deck parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const deckParam = urlParams.get('deck');
            
            if (deckParam) {
                console.log(`📍 URL-Parameter gefunden: deck=${deckParam}`);
                // Versuche das Deck zu laden und zu starten
                const deck = App.availableDecks.find(d => d.id === deckParam);
                if (deck) {
                    selectDeck(deckParam);
                } else {
                    console.warn(`⚠️ Deck nicht gefunden: ${deckParam}`);
                    showGlobalDashboard();
                }
            } else {
                showGlobalDashboard();
            }
        }).catch(err => {
            console.error('Deck-Fehler:', err);
            showStatus('✅ Bereit! Klick "Coach starten"', 'success');
        });
        
        console.log(`✅ Coach v${CONFIG.version} geladen!`);
    } catch (error) {
        console.error('❌ Init Fehler:', error);
        showStatus('❌ Initialisierung fehlgeschlagen', 'error');
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
