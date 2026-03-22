/**
 * COACH SRS & LOGIC MODULE
 * Verantwortung: Spaced Repetition System
 * - SRS Berechnung
 * - Karten-Rating
 * - Learning Analytics
 */

/**
 * Rated eine Karte nach dem Performance (1-5)
 * @param {number} rating - 1=Vergessen, 2=Schwer, 3=Okay, 4=Gut, 5=Perfekt
 */
function rate(rating) {
    try {
        if (!App || !App.cards || App.currentIndex >= App.cards.length) {
            console.error('❌ Keine aktive Karte zum Raten');
            return;
        }
        
        const card = App.cards[App.currentIndex];
        const cardId = card.q.substring(0, 40);
        
        // Update SRS Cache
        const now = Date.now();
        let srsData = App.srsCache[cardId] || {
            lastReviewed: now,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
        };
        
        // SM-2 Algorithmus
        srsData = calculateSM2(srsData, rating, now);
        App.srsCache[cardId] = srsData;
        
        // Update Stats
        updateStats(rating);
        
        // Speichern
        saveSRSData();
        
        // Nächste Karte
        App.currentIndex++;
        renderCard();
        
    } catch (error) {
        console.error('❌ Fehler beim Raten:', error);
        showErrorMessage('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
    }
}

/**
 * SM-2 Algorithmus für SRS
 * @param {Object} data - Aktuelle SRS Daten
 * @param {number} rating - User-Rating (1-5)
 * @param {number} timestamp - Aktueller Zeitstempel
 * @returns {Object} Neue SRS Daten
 */
function calculateSM2(data, rating, timestamp) {
    try {
        // SM-2 Formeln
        let EF = data.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
        EF = Math.max(1.3, EF); // Minimum 1.3
        
        let interval = 1;
        if (data.repetitions === 0) {
            interval = 1;
        } else if (data.repetitions === 1) {
            interval = 3;
        } else {
            interval = Math.round(data.interval * EF);
        }
        
        return {
            lastReviewed: timestamp,
            nextReview: timestamp + (interval * 24 * 60 * 60 * 1000),
            interval: interval,
            easeFactor: EF,
            repetitions: data.repetitions + 1,
            rating: rating
        };
        
    } catch (error) {
        console.error('❌ Fehler in SM-2 Berechnung:', error);
        return data;
    }
}

/**
 * Updated die Learning Stats
 * @param {number} rating - User Rating
 */
function updateStats(rating) {
    try {
        if (!App.stats) {
            App.stats = { correct: 0, incorrect: 0, streak: 0, maxStreak: 0 };
        }
        
        if (rating >= 3) {
            App.stats.correct++;
            App.stats.streak++;
            App.stats.maxStreak = Math.max(App.stats.maxStreak, App.stats.streak);
        } else {
            App.stats.incorrect++;
            App.stats.streak = 0;
        }
        
        saveStats();
        
    } catch (error) {
        console.error('❌ Fehler beim Update Stats:', error);
    }
}

/**
 * Speichert alle SRS Daten
 */
function saveSRSData() {
    try {
        if (!App.userCode) {
            console.warn('⚠️ Kein User Code - nur localStorage');
            localStorage.setItem(`srsCache_${App.currentDeck?.meta?.id}`, JSON.stringify(App.srsCache));
            return;
        }
        
        // Zu Supabase synchen
        syncSRSToSupabase();
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern SRS:', error);
        // Fallback zu localStorage
        localStorage.setItem(`srsCache_${App.currentDeck?.meta?.id}`, JSON.stringify(App.srsCache));
    }
}

/**
 * Prüft ob zwei Antworten gleich sind
 * @param {string} userAnswer - User-Eingabe
 * @param {string} correctAnswer - Korrekte Antwort
 * @returns {boolean}
 */
function isExactMatch(userAnswer, correctAnswer) {
    try {
        if (!userAnswer || !correctAnswer) {
            return false;
        }
        
        // Whitespace & Case normalisieren
        const user = userAnswer.trim().toLowerCase();
        const correct = correctAnswer.trim().toLowerCase();
        
        return user === correct;
        
    } catch (error) {
        console.error('❌ Fehler bei Match-Prüfung:', error);
        return false;
    }
}

/**
 * Gibt aktuelle Lernmetriken
 * @returns {Object} {totalCards, reviewed, dueToday, streak}
 */
function getLearningMetrics() {
    try {
        const total = App.cards?.length || 0;
        const reviewed = Object.keys(App.srsCache).length;
        const dueToday = Object.values(App.srsCache).filter(d => 
            d.nextReview && d.nextReview <= Date.now()
        ).length;
        const streak = App.stats?.streak || 0;
        
        return { totalCards: total, reviewed, dueToday, streak };
        
    } catch (error) {
        console.error('❌ Fehler bei Metrics:', error);
        return { totalCards: 0, reviewed: 0, dueToday: 0, streak: 0 };
    }
}

/**
 * Generiert zusammenfassung nach Session
 * @returns {Object} Summary Daten
 */
function generateSessionSummary() {
    try {
        const correct = App.stats?.correct || 0;
        const incorrect = App.stats?.incorrect || 0;
        const total = correct + incorrect;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        return {
            correct,
            incorrect,
            total,
            percentage,
            streak: App.stats?.streak || 0,
            time: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Fehler bei Summary:', error);
        return { correct: 0, incorrect: 0, total: 0, percentage: 0, streak: 0 };
    }
}
