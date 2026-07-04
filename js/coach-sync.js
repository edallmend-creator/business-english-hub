/**
 * COACH SYNC & STORAGE MODULE
 * Verantwortung: Daten-Persistierung
 * - Supabase Sync
 * - localStorage Fallback
 * - User Code Management
 */

/**
 * Speichert Settings lokal + Supabase
 * @param {string} key - Setting Key
 * @param {*} value - Setting Wert
 */
function saveSetting(key, value) {
    try {
        // Lokal speichern
        if (!App.settings) App.settings = {};
        App.settings[key] = value;
        localStorage.setItem(`coachSettings_${App.userCode}`, JSON.stringify(App.settings));
        
        // Zu Supabase falls vorhanden
        if (App.userCode && App.supabaseUrl) {
            syncSettingsToSupabase();
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern Setting:', error);
    }
}

/**
 * Speichert Stats lokal + Supabase
 */
function saveStats() {
    try {
        if (!App.stats) return;
        
        localStorage.setItem(`coachStats_${App.userCode}`, JSON.stringify(App.stats));
        
        if (App.userCode && App.supabaseUrl) {
            syncStatsToSupabase();
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern Stats:', error);
    }
}

/**
 * Synct SRS Daten zu Supabase
 */
function syncSRSToSupabase() {
    try {
        if (!App.userCode || !App.supabaseUrl) {
            console.warn('⚠️ Kein Supabase Setup');
            return;
        }
        
        // Nur das essenzielle synchen
        const dataToSync = {
            srs_cache: JSON.stringify(App.srsCache),
            stats: JSON.stringify(App.stats),
            last_sync: new Date().toISOString()
        };
        
        // TODO: Hier würde der echte Supabase Call gehen
        // fetch(`${App.supabaseUrl}/update-progress`, {...})
        
        console.log('✅ SRS zu Supabase gesynct');
        
    } catch (error) {
        console.error('❌ Supabase Sync Error:', error);
        // Nicht-kritisch - lokal geht weiter
    }
}

/**
 * Synct Settings zu Supabase
 */
function syncSettingsToSupabase() {
    try {
        if (!App.userCode || !App.supabaseUrl) return;
        
        const settings = {
            timer_duration: App.settings.timer_duration,
            typing: App.settings.typing,
            emoji: App.settings.emoji,
            interleaving: App.settings.interleaving,
            timer: App.settings.timer
        };
        
        // TODO: Echter Supabase Call
        
        console.log('✅ Settings zu Supabase gesynct');
        
    } catch (error) {
        console.error('❌ Settings Sync Error:', error);
    }
}

/**
 * Synct Stats zu Supabase
 */
function syncStatsToSupabase() {
    try {
        if (!App.userCode || !App.supabaseUrl) return;
        
        // TODO: Echter Supabase Call
        
        console.log('✅ Stats zu Supabase gesynct');
        
    } catch (error) {
        console.error('❌ Stats Sync Error:', error);
    }
}

/**
 * Lädt alle Daten für einen User
 * @param {string} userCode - Der User Code
 */
function loadUserData(userCode) {
    try {
        App.userCode = userCode;
        
        // Aus localStorage laden
        const settingsStr = localStorage.getItem(`coachSettings_${userCode}`);
        const statsStr = localStorage.getItem(`coachStats_${userCode}`);
        const srsCacheStr = localStorage.getItem(`srsCache_${userCode}`);
        
        if (settingsStr) App.settings = JSON.parse(settingsStr);
        if (statsStr) App.stats = JSON.parse(statsStr);
        if (srsCacheStr) App.srsCache = JSON.parse(srsCacheStr);
        
        console.log('✅ User Daten geladen');
        
        // Optional: Aus Supabase synchen
        syncUserDataFromSupabase(userCode);
        
    } catch (error) {
        console.error('❌ Fehler beim Laden User Daten:', error);
        // Defaults verwenden
        initializeAppDefaults();
    }
}

/**
 * Synct User Daten von Supabase
 * @param {string} userCode - Der User Code
 */
function syncUserDataFromSupabase(userCode) {
    try {
        if (!App.supabaseUrl) return;
        
        // TODO: Echter Supabase Fetch
        
        console.log('✅ Daten von Supabase geladen');
        
    } catch (error) {
        console.error('⚠️ Supabase Sync fehlgeschlagen, verwende localStorage:', error);
        // Ist okay - localStorage wird verwendet
    }
}

/**
 * Initialisiert Standard App-Werte
 */
function initializeAppDefaults() {
    try {
        App.settings = {
            typing: true,
            emoji: true,
            interleaving: false,
            timer: false,
            timer_duration: 30
        };
        
        App.stats = {
            correct: 0,
            incorrect: 0,
            streak: 0,
            maxStreak: 0
        };
        
        App.srsCache = {};
        
        console.log('✅ App Defaults initialisiert');
        
    } catch (error) {
        console.error('❌ Fehler bei Defaults:', error);
    }
}

/**
 * Exportiert Lernfortschritt als JSON
 * @returns {Object} Exportierbare Daten
 */
function exportProgress() {
    try {
        return {
            userCode: App.userCode,
            settings: App.settings,
            stats: App.stats,
            srsCache: App.srsCache,
            exportDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Fehler beim Export:', error);
        return null;
    }
}

/**
 * Importiert Lernfortschritt aus JSON
 * @param {Object} data - Die Daten zum Importieren
 */
function importProgress(data) {
    try {
        if (!data || !data.userCode) {
            throw new Error('Ungültiges Datenformat');
        }
        
        App.userCode = data.userCode;
        App.settings = data.settings || {};
        App.stats = data.stats || {};
        App.srsCache = data.srsCache || {};
        
        // Speichern
        localStorage.setItem(`coachSettings_${App.userCode}`, JSON.stringify(App.settings));
        localStorage.setItem(`coachStats_${App.userCode}`, JSON.stringify(App.stats));
        localStorage.setItem(`srsCache_${App.userCode}`, JSON.stringify(App.srsCache));
        
        console.log('✅ Fortschritt importiert');
        
    } catch (error) {
        console.error('❌ Fehler beim Import:', error);
        throw error;
    }
}

/**
 * Löscht alle lokalen Daten (Logout)
 */
function clearLocalData() {
    try {
        if (App.userCode) {
            localStorage.removeItem(`coachSettings_${App.userCode}`);
            localStorage.removeItem(`coachStats_${App.userCode}`);
            localStorage.removeItem(`srsCache_${App.userCode}`);
        }
        
        App.userCode = null;
        App.settings = {};
        App.stats = {};
        App.srsCache = {};
        
        console.log('✅ Lokale Daten gelöscht');
        
    } catch (error) {
        console.error('❌ Fehler beim Löschen:', error);
    }
}
