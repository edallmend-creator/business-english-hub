/**
 * COACH UI MODULE
 * Verantwortung: Alle UI-Rendering Funktionen
 * - Karten anzeigen/verstecken
 * - Modal-Inhalte rendern
 * - Settings-Panel
 */

/**
 * Rendert eine einzelne Lernkarte im Coach Modal
 * @param {Object} card - Die aktuelle Karte {q, a, wrong}
 * @param {number} index - Position in der Kartenstapel
 */
function renderCard() {
    try {
        if (!App || !App.cards || App.currentIndex >= App.cards.length) {
            showSummary();
            return;
        }
        
        const card = App.cards[App.currentIndex];
        const html = buildCardHTML(card);
        
        const modal = document.getElementById('modalContent');
        if (modal) {
            modal.innerHTML = html;
        }
        
        // Auto-Scroll zum Top
        const scrollContainer = document.querySelector('.modal');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Rendern der Karte:', error);
        showErrorMessage('Fehler beim Laden der Karte. Bitte aktualisieren Sie die Seite.');
    }
}

/**
 * Baut das HTML für eine Karte zusammen
 * @param {Object} card - Kartendaten
 * @returns {string} HTML-String
 */
function buildCardHTML(card) {
    // Diese Funktion war vorher ~200 Zeilen inline
    // Jetzt schöner strukturiert
    let html = '';
    
    try {
        // Header mit Progress
        html += buildCardHeader();
        
        // Accent Toggle (nur für Core-Decks)
        if (shouldShowAccentToggle()) {
            html += buildAccentToggle();
        }
        
        // Settings (TIMER IST NICHT HIER - ist in coach.html als timerSliderFooter!)
        html += buildSettingsBar();
        
        // Card Content
        html += buildCardContent(card);
        
        // Buttons
        html += buildCardButtons();
        
    } catch (error) {
        console.error('❌ Fehler beim Bauen des Card HTML:', error);
        html = '<div style="color: red; padding: 20px;">Fehler beim Laden der Karte</div>';
    }
    
    return html;
}

/**
 * Baut den Card Header mit Progress-Anzeige
 * @returns {string} HTML
 */
function buildCardHeader() {
    const idx = App.currentIndex;
    const total = App.cards.length;
    const progress = Math.round((idx / total) * 100);
    
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="font-size:13px;color:var(--muted);">
                Neu ${Math.max(0, App.cards.filter(c => !App.srsCache[c.q.substring(0,40)]).length)} · Wiederholen ${Math.max(0, App.stats.incorrect)} 
            </div>
            <button onclick="exitCoach()" style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div style="background:#f0f4f8;border-radius:8px;height:4px;margin-bottom:16px;overflow:hidden;">
            <div style="background:var(--primary);height:100%;width:${progress}%;transition:width 0.3s;"></div>
        </div>
    `;
}

/**
 * Prüft ob Accent Toggle angezeigt werden soll
 * @returns {boolean}
 */
function shouldShowAccentToggle() {
    return App.currentDeck && 
           App.currentDeck.meta && 
           (App.currentDeck.meta.id.includes('w1') || 
            App.currentDeck.meta.id.includes('w2') || 
            App.currentDeck.meta.id.includes('w3') || 
            App.currentDeck.meta.id.includes('w4')) &&
           App.currentDeck.meta.id.includes('core');
}

/**
 * Baut den Accent Toggle (US vs UK)
 * @returns {string} HTML
 */
function buildAccentToggle() {
    return `
        <div style="margin: 0 0 16px 0; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div style="font-size: 13px; font-weight: 700; color: white;">🎙️ Accent:</div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="if(App.currentAccent !== 'us') toggleAccent()" 
                            style="padding: 8px 16px; border: 2px solid ${App.currentAccent === 'us' ? 'white' : 'rgba(255,255,255,0.3)'}; background: ${App.currentAccent === 'us' ? 'white' : 'transparent'}; color: ${App.currentAccent === 'us' ? '#667eea' : 'white'}; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        🇺🇸 American
                    </button>
                    <button onclick="if(App.currentAccent !== 'uk') toggleAccent()" 
                            style="padding: 8px 16px; border: 2px solid ${App.currentAccent === 'uk' ? 'white' : 'rgba(255,255,255,0.3)'}; background: ${App.currentAccent === 'uk' ? 'white' : 'transparent'}; color: ${App.currentAccent === 'uk' ? '#667eea' : 'white'}; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        🇬🇧 British
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Baut das Settings Panel
 * @returns {string} HTML
 */
function buildSettingsBar() {
    return `
        <div class="settings-bar" onclick="event.stopPropagation();" style="pointer-events: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; gap: 8px; align-items: center; cursor: pointer;" 
                     onclick="event.stopPropagation(); toggleSettingsPanel()">
                    <div style="font-size: 13px; font-weight: 600; color: var(--primary);">
                        ⚙️ Einstellungen
                    </div>
                    <span id="settingsToggleIcon" style="font-size: 16px; color: var(--muted); user-select: none;">▼</span>
                </div>
                <button onclick="event.stopPropagation(); window.toggleHelp()" style="background: none; border: none; color: var(--accent); font-size: 18px; cursor: pointer; padding: 4px 8px;" title="Hilfe">
                    💡
                </button>
            </div>
            <div id="settingsContent" style="display: none; pointer-events: auto; max-height: 300px; overflow-y: auto;" onclick="event.stopPropagation();">
                <div class="settings-toggles">
                    ${buildSettingsCheckboxes()}
                </div>
            </div>
        </div>
    `;
}

/**
 * Baut die Settings Checkboxes
 * @returns {string} HTML
 */
function buildSettingsCheckboxes() {
    return `
        <label>
            <input type="checkbox" ${App.settings.typing ? 'checked' : ''} 
                onclick="event.stopPropagation();" onchange="window.toggleSetting('typing', this.checked)">
            <span>✍️ Tippen</span>
        </label>
        <label>
            <input type="checkbox" ${App.settings.emoji ? 'checked' : ''} 
                onclick="event.stopPropagation();" onchange="window.toggleSetting('emoji', this.checked)">
            <span>🖼️ Emojis (Dual Coding)</span>
        </label>
        <label>
            <input type="checkbox" ${App.settings.interleaving ? 'checked' : ''} 
                onclick="event.stopPropagation();" onchange="window.toggleSetting('interleaving', this.checked)">
            <span>🔀 Interleaving (Shuffle)</span>
        </label>
        <label ${!CONFIG.timer.enabled ? 'style="opacity: 0.5;" title="Ab Woche 2 verfügbar"' : ''}>
            <input type="checkbox" 
                ${App.settings.timer ? 'checked' : ''} 
                ${!CONFIG.timer.enabled ? 'disabled' : ''}
                onclick="event.stopPropagation();"
                onchange="window.toggleSetting('timer', this.checked)">
            <span>⏱️ Timer (${App.settings.timer_duration}s) - Retrieval Practice${!CONFIG.timer.enabled ? ' 🔒' : ''}</span>
        </label>
    `;
}

/**
 * Baut den Timer Slider
 * @returns {string} HTML
 */

/**
 * Baut den Card Content (Frage + Antwort)
 * @param {Object} card - Kartendaten
 * @returns {string} HTML
 */
function buildCardContent(card) {
    // Placeholder - wird aus coach.js extrahiert
    return '<div>Card Content</div>';
}

/**
 * Baut die Aktion-Buttons
 * @returns {string} HTML
 */
function buildCardButtons() {
    // Placeholder - wird aus coach.js extrahiert
    return '<div>Action Buttons</div>';
}

/**
 * Toggelt das Settings Panel
 */
function toggleSettingsPanel() {
    const c = document.getElementById('settingsContent');
    const i = document.getElementById('settingsToggleIcon');
    if (c && i) {
        const isOpen = c.style.display !== 'none';
        c.style.display = isOpen ? 'none' : 'block';
        i.textContent = isOpen ? '▼' : '▲';
    }
}

/**
 * Zeigt eine Fehlermeldung
 * @param {string} message - Die Fehlermeldung
 */

/**
 * Macht den Timer Slider scrollable (verhindert Parent-Scroll)
 */
function makeTimerSliderScrollSafe() {
    const timerDiv = document.getElementById('timerSliderContainer');
    if (!timerDiv) return;
    
    // Verhindere dass parent scrolled wenn Timer genutzt wird
    timerDiv.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { passive: false });
    
    timerDiv.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: false });
}

function showErrorMessage(message) {
    const modal = document.getElementById('modalContent');
    if (modal) {
        modal.innerHTML = `
            <div style="padding: 20px; background: #fee; border-left: 4px solid #f44; border-radius: 4px; color: #c00;">
                <strong>⚠️ Fehler:</strong> ${message}
            </div>
        `;
    }
}
