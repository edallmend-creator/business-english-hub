# 🛠️ DOCUMENTATION - Entwickler-Guide

Technische Dokumentation für Business English in 4 Wochen Hub.

---

## 📐 Architektur-Übersicht

### Komponenten

```
┌─────────────┐
│  index.html │  Hub-Hauptseite mit Wochen-Navigation
└──────┬──────┘
       │
       ├─→ coach.html  → Spaced Repetition Coach
       ├─→ js/coach.js → Coach-Logik (2500+ Zeilen)
       ├─→ css/*       → Styling
       └─→ data/*      → CSV & Config
```

### Datenfluss

```
CSV-Datei
   ↓
Papa.parse() → cards[]
   ↓
shuffle (optional) → finalCards[]
   ↓
renderCard() → HTML
   ↓
User-Rating → SRS-Update → localStorage
```

---

## 🗂️ Datei-Übersicht

### HTML-Dateien

**index.html**
- Hub-Hauptseite
- Wochen-Cards mit Tools
- Login-Gate
- Navigation

**coach.html**
- Standalone Coach-Seite
- Minimales HTML, alles in JS gerendert
- Modal für Dashboards

### JavaScript-Dateien

**js/coach.js** (2500+ Zeilen)
- Coach-Haupt-Logik
- SRS-Algorithmus
- Audio-System
- Dashboards
- Settings
- Export: 20+ window-Funktionen

**js/flashcards.js**
- Softener-Trainer
- Weitere Tools

**js/auth.js**
- Login-Gate
- Password-Verwaltung

**js/navigation.js**
- Hub-Navigation
- Week-Switching

**js/srs.js**
- SRS-Helper-Funktionen

**js/sync.js**
- Supabase-Sync

**js/streak.js**
- Streak-Tracking

### CSS-Dateien

**css/variables.css**
- CSS Custom Properties
- Farben, Fonts, Spacing

**css/nav.css**
- Navigation-Styling

**css/weeks.css**
- Wochen-Cards

**css/coach.css**
- Coach-Spezifisches Styling
- Card-Layout
- Progress-Bars

**css/modals.css**
- Modal-Overlays
- Dashboard-Modals

**css/gate.css**
- Login-Screen

### Daten-Dateien

**data/decks.json**
- Registry aller 25 Decks
- Metadata: ID, Name, Pfad, Farbe, Icon

**data/phrases/*.csv**
- CSV-Dateien mit Phrasen
- Format: deutsch,englisch,englisch_uk,...

**data/audio-config.json**
- Audio-System Konfiguration
- Pfade, Voices, Settings

---

## 🔄 Coach-Lifecycle

### 1. Initialisierung

```javascript
DOMContentLoaded
  → init()
    → loadSettings()
    → loadUser()
    → loadDecks()
    → showGlobalDashboard() ODER startCoachWithDeck(deckId)
```

### 2. Deck Laden

```javascript
loadDeck(deckId)
  → fetch CSV
  → Papa.parse()
  → map → cards[] mit originalIndex
  → filter leere Zeilen
  → return { meta, cards }
```

### 3. Session Start

```javascript
startCoachWithDeck(deckId)
  → loadDeck()
  → shuffle (wenn Interleaving)
  → App.cards = finalCards
  → renderCard()
```

### 4. Card Rendering

```javascript
renderCard()
  → Hole aktuelle Card: App.cards[App.currentIndex]
  → Build HTML:
    - Accent Toggle (für Core Decks)
    - Settings Bar
    - Timer (optional)
    - Deutsche Phrase
    - Audio Player
    - Input Field
    - Buttons
  → Inject in DOM
  → Focus Input
  → Start Timer (optional)
  → Load Audio
```

### 5. User-Interaktion

```javascript
revealAnswer()
  → Zeige englische Phrase
  → Check Typing (wenn enabled)
  → Zeige Bewertungs-Buttons

rate(rating)
  → Stop Timer/Audio
  → Update Stats
  → Update SRS
  → Save to localStorage
  → Next Card: App.currentIndex++
  → renderCard()
```

### 6. Session Ende

```javascript
if (App.currentIndex >= App.cards.length)
  → showSummary()
    → Stats anzeigen
    → Streak Update
    → Option: Nochmal / Dashboard / Exit
```

---

## 🎵 Audio-System

### Architektur

```
Card → originalIndex (CSV-Zeile)
  ↓
getAudioUrl(cardIndex)
  → card = App.cards[cardIndex]
  → originalIndex = card.originalIndex
  → filename = w{week}_{originalIndex+1}.mp3
  → path = audio/{week}/{accent}/{filename}
  ↓
playAudio()
  → new Audio(path)
  → set playbackRate
  → play()
```

### Wichtig: originalIndex

**Problem:** Wenn Interleaving aktiv, werden Cards gemischt!

**Lösung:** `originalIndex` wird beim CSV-Parse gesetzt (NACH filter!):

```javascript
results.data
  .filter(row => row.deutsch && row.englisch)  // ERST filtern
  .map((row, index) => ({
    originalIndex: index,  // DANN Index zuweisen
    ...
  }))
```

So zeigt `originalIndex` immer auf die richtige CSV-Zeile = richtige Audio-Datei!

### Audio-Dateien

**Naming:** `{week}_{index}.mp3`
- `w1_001.mp3` = Zeile 0 aus week1-core.csv
- `w1_002.mp3` = Zeile 1 aus week1-core.csv

**Pfade:**
```
audio/
  w1/
    us/w1_001.mp3 ... w1_045.mp3
    uk/w1_001.mp3 ... w1_045.mp3
  w2/us/... w2/uk/...
  w3/us/... w3/uk/...
  w4/us/... w4/uk/...
```

---

## 💾 Daten-Speicherung

### localStorage Schema

```javascript
// Settings
be4w_settings = {
  typing: true,
  emoji: true,
  timer: false,
  interleaving: true,
  timer_duration: 30
}

// SRS-Daten pro Deck
srs_{deckId} = {
  "{cardId}": {
    correct_count: 3,
    wrong_count: 1,
    last_review: "2026-03-15",
    next_review: "2026-03-22",
    interval: 7
  }
}

// Dual Coding Emojis
dc_{deckId} = {
  "{cardId}": ["💡", "🎯"]
}

// User Code
be4w_user_code = "clear-5512"

// Unlocked (Login)
be4w_v2_unlocked = "true"
```

### Supabase Schema (optional)

**Tabellen:**
- `user_progress` - SRS-Daten
- `dual_coding` - Emoji-Zuordnungen
- `settings` - User-Settings

**Sync:** Bei jeder SRS-Update → sync.js → Supabase

---

## 🎨 Styling-System

### CSS Variables

```css
/* Farben */
--primary: #3b82f6;
--accent: #fbbf24;
--success: #10b981;
--error: #ef4444;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* Typography */
--font-heading: 'Barlow Condensed', sans-serif;
--font-body: 'Barlow', sans-serif;
```

### Komponenten

**Button:**
```css
.btn-primary {
  background: var(--primary);
  padding: 12px 24px;
  border-radius: 8px;
  ...
}
```

**Card:**
```css
.week-card {
  background: var(--surface);
  border-radius: 16px;
  padding: var(--spacing-lg);
  ...
}
```

---

## 🔌 API & Funktionen

### Window-Exports (coach.js)

Alle diese Funktionen sind global verfügbar (für HTML onclick):

```javascript
// Core
window.startCoach()
window.startCoachWithDeck(deckId)
window.selectDeck(deckId)
window.exitCoach()

// Dashboards
window.showDeckSelection()
window.showGlobalDashboard()
window.showSRSDashboard()
window.showLearningPlan()

// Card Actions
window.revealAnswer()
window.rate(rating)
window.previous()
window.skip()

// Dual Coding
window.selectEmoji(emoji)
window.removeDCEmoji(emoji)

// Settings
window.toggleSetting(key)
window.updateTimerDuration(seconds)
window.toggleHelp()

// Audio
window.toggleAccent()
window.changeAudioSpeed(speed)
window.toggleAudio()

// Modals
window.closeModal()
```

### Interne Funktionen

```javascript
// CSV Loading
loadDeck(deckId)
loadDeckCSV(csvPath)
loadDeckRegistry()

// SRS
getSRSForDeck(deckId)
saveSRSForDeck(deckId, cardId, srsData)
calculateNextReview(correctCount)

// UI Rendering
renderCard()
showSummary()
showStatus(message, type)

// Audio
getAudioUrl(cardIndex)
playAudio()
stopAudio()

// Utilities
shuffleArray(array)
getDCEmojis(deutsch)
saveDCEmoji(deckId, cardId, emoji)
```

---

## 🧪 Testing

### Lokal testen

```bash
python3 server-nocache.py
# Browser: http://localhost:9001
```

### Test-Szenarien

**1. Basic Flow:**
- Login → W1 Coach → Card durchgehen → Summary

**2. Audio:**
- W1 Coach → Accent Toggle → Audio Player testen
- Speed ändern
- UK Accent testen

**3. Interleaving:**
- Settings → Interleaving AN
- Check: Audio passt zur Karte?

**4. SRS:**
- Card falsch bewerten
- Dashboard → Check Intervall
- Warten → Next Review Date check

**5. Dual Coding:**
- Emoji hinzufügen
- Check localStorage
- Nächste Card → Emoji erscheint?

**6. Exit:**
- Aus W2 Coach → Klick X
- Sollte zurück zu Woche 2

---

## 🔧 Debugging

### Browser Console

```javascript
// Check aktueller State
App

// Alle Cards
App.cards

// Aktuelle Card
App.cards[App.currentIndex]

// SRS-Daten
localStorage.getItem('srs_w1_core')

// Settings
localStorage.getItem('be4w_settings')
```

### Häufige Probleme

**Audio spielt falsche Datei:**
→ Check `card.originalIndex`
→ Check `getAudioUrl()` Output in Console

**Interleaving zeigt immer gleiche Reihenfolge:**
→ `shuffleArray()` nutzt `Math.random()` - kann zufällig gleich sein!

**Settings werden nicht gespeichert:**
→ Check `localStorage` permissions
→ Check Browser: localStorage enabled?

**Exit geht zur falschen Woche:**
→ Check URL Parameter: `?source=week-X`

---

## 📚 Bibliotheken

### PapaParse
**Version:** 5.4.1  
**Verwendung:** CSV-Parsing  
**CDN:** `https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js`

### Supabase (optional)
**Version:** Latest  
**Verwendung:** Cloud-Sync  
**CDN:** Via supabase.io

### Keine weiteren Dependencies!
- Kein jQuery
- Kein React
- Pure Vanilla JS

---

## 🚀 Deployment

### GitHub Pages

**Voraussetzungen:**
- Audio-Dateien im `audio/` Ordner (100 MB OK)
- Keine Secrets im Code

**Setup:**
```bash
git init
git add .
git commit -m "Initial"
git push origin main
```

**GitHub Settings:**
- Pages → Source: main
- Fertig! App läuft auf: `username.github.io/be4w-hub/`

### Eigener Server

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/be4w-hub;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /audio/ {
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

---

## 🔐 Sicherheit

### Login-System

**Typ:** Simple Password-Gate  
**Password:** `english2025` (hardcoded in auth.js)  
**Storage:** localStorage `be4w_v2_unlocked`

**⚠️ NICHT sicher für sensible Daten!**

Für Production:
- Backend-Authentifizierung
- JWT Tokens
- Supabase Auth

### Supabase

**Keys im Code:**
- `anonKey` ist public-safe (RLS-Protected)
- Keine Service-Keys im Frontend!

---

## 📝 Code-Konventionen

### Naming

```javascript
// Funktionen: camelCase
function loadDeck() {}

// Konstanten: UPPER_SNAKE_CASE
const STORAGE_KEY = "be4w_settings"

// Config-Objekte: PascalCase Property
CONFIG.audio.basePath

// DOM-Elemente: camelCase mit Suffix
const timerDisplay = document.getElementById('timer-display')
```

### Kommentare

```javascript
/**
 * Lädt ein Deck aus CSV
 * @param {string} deckId - Deck ID (z.B. 'w1_core')
 * @returns {Promise<Object>} Deck-Objekt mit {meta, cards}
 */
async function loadDeck(deckId) { ... }

// Inline-Kommentare für komplexe Logik
const index = originalIndex + 1; // 1-based für Dateinamen
```

---

## 🎯 Best Practices

### Performance

- Audio-Dateien lazy-loaden (nur wenn gebraucht)
- CSV-Caching in Memory (`App.currentDeck`)
- localStorage-Zugriff minimieren
- Kein DOM-Manipulation in Loops

### Accessibility

- Keyboard-Navigation (Enter, Tab)
- Focus-Management
- ARIA-Labels wo nötig
- Color-Contrast beachten

### Browser-Kompatibilität

**Tested:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required:**
- ES6 Support
- localStorage
- Audio API
- Fetch API

---

**Happy Coding! 🚀**
