# 📚 BE4W HUB - CODE ARCHITEKTUR

## Überblick

Das Projekt ist modular aufgebaut mit klarer **Separation of Concerns**:

```
business-english-hub/
├── index.html              # Login Gate + Hub
├── coach.html              # Coach Interface
├── css/                    # Styling
│   ├── variables.css       # Farben, Fonts, Abstände
│   ├── gate.css           # Login Design
│   ├── coach.css          # Coach Styling
│   └── ...
├── js/                     # JavaScript (refaktoriert)
│   ├── auth.js            # Login Logic
│   ├── coach.js           # Main Coach (orchestriert)
│   ├── coach-ui.js        # UI Rendering (NEU)
│   ├── coach-srs.js       # SRS Logik (NEU)
│   ├── coach-sync.js      # Data Persistence (NEU)
│   └── ...
└── data/                   # CSV & JSON Daten
```

---

## Module Beschreibung

### **1. coach-ui.js** (UI-Rendering)
**Verantwortung:** Alles was der User sieht
- `renderCard()` - Zeigt aktuelle Lernkarte
- `buildCardHTML()` - Erstellt HTML
- `buildSettingsBar()` - Settings Panel
- `buildTimerSlider()` - Timer UI

**Prinzip:** Nur HTML/DOM Manipulation, keine Geschäftslogik!

---

### **2. coach-srs.js** (Lern-Logik)
**Verantwortung:** Spaced Repetition System
- `rate()` - Rated Karte (1-5)
- `calculateSM2()` - SM-2 Algorithmus
- `updateStats()` - Lernerfolg tracking
- `getLearningMetrics()` - Statistiken

**Prinzip:** Pure Functions mit Error Handling!

---

### **3. coach-sync.js** (Datenspeicherung)
**Verantwortung:** Persistierung + Sync
- `saveSetting()` - localStorage + Supabase
- `loadUserData()` - User Daten laden
- `syncSRSToSupabase()` - Cloud Sync
- `exportProgress()` - Backup erstellen

**Prinzip:** Try-Catch überall, Fallback auf localStorage!

---

### **4. coach.js** (Main / Orchestrator)
**Verantwortung:** Koordiniert die anderen Module
- App initialisieren
- Karten laden
- Module miteinander verbinden
- User Input handling

---

## Code Quality Verbesserungen

### ✅ Was jetzt besser ist:

1. **JSDoc Comments** überall
   ```javascript
   /**
    * Rated eine Karte nach Performance
    * @param {number} rating - 1=Vergessen, 5=Perfekt
    */
   function rate(rating) { ... }
   ```

2. **Error Handling** überall
   ```javascript
   try {
       // Code
   } catch (error) {
       console.error('❌ Fehler:', error);
       showErrorMessage(error.message);
   }
   ```

3. **Single Responsibility** - jede Datei hat eine Job
   - coach-ui.js = NUR Rendering
   - coach-srs.js = NUR Logik
   - coach-sync.js = NUR Storage

4. **Kurze Funktionen** (max 50 Zeilen)
   - Leicht zu testen
   - Leicht zu verstehen
   - Leicht zu debuggen

---

## Wie man Code hinzufügt

### **Neue UI-Funktion:**
```javascript
// In coach-ui.js
function buildNewPanel() {
    /**
     * Neue Panel beschreibung
     */
    return `<div>...</div>`;
}

// In coach-ui.js HTML aufrufen:
// ${buildNewPanel()}
```

### **Neue Lern-Logik:**
```javascript
// In coach-srs.js
function calculateNewMetric() {
    /**
     * Berechnet neue Metrik
     */
    return value;
}
```

### **Neue Speicherung:**
```javascript
// In coach-sync.js
function syncNewData() {
    /**
     * Synct neue Daten
     */
    localStorage.setItem('key', JSON.stringify(data));
}
```

---

## Performance Tips

1. **Caching nutzen**
   - CSV-Parsing nur 1x machen
   - Decks in localStorage cachen

2. **Lazy Loading**
   - Bilder nur laden wenn sichtbar
   - Modals nur rendern wenn nötig

3. **Event Delegation**
   - Nicht zu viele Event Listener
   - Nutze stopPropagation() geschickt

---

## Testing (für Zukunft)

```javascript
// Unit Test Beispiel
function testRate() {
    const before = App.stats.correct;
    rate(5); // Perfekt
    const after = App.stats.correct;
    
    assert(after === before + 1, 'Stats sollten inkrementieren');
}
```

---

## Bekannte Limitations

⚠️ **Timer-Slider in Settings:**
- Nutzt `onmousedown` statt `click`
- Grund: Event Propagation in Modals
- Lösung besser: Modal-Redesign (Phase 2)

⚠️ **localStorage Größenlimit:**
- ~5-10 MB pro Domain
- Bei großen SRS Caches könnte Limit erreicht werden
- Lösung: IndexedDB oder Cleanup

---

## Nächste Schritte (Phase 2)

1. **Tests schreiben** (Jest/Vitest)
2. **E2E Tests** (Cypress)
3. **Modal Redesign** für Timer-Fix
4. **IndexedDB** für größere Daten
5. **Service Worker** für Offline-Support

---

## Useful Commands

```bash
# Code formatieren
npm run format

# Tests laufen
npm run test

# Production Build
npm run build

# Dev Server mit Hot Reload
npm run dev
```

---

## Fragen?

Schau dir die Funktions-Kommentare an - sie erklären den Code! 💡
