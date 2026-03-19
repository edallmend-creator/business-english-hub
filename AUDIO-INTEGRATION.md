# 🎧 AUDIO INTEGRATION - DOKUMENTATION

## ✅ WAS WURDE IMPLEMENTIERT

### 1. ACCENT TOGGLE (US/UK)
- **Location:** Oben im Coach, nach Settings
- **Funktion:** Wechselt zwischen American und British English
- **Persistenz:** Wird in localStorage gespeichert (`be4w_accent`)
- **Effekt:** 
  - Ändert angezeigte englische Schreibweise
  - Ändert Audio-Quelle (us/ oder uk/ Ordner)
  - Bleibt über Session hinweg erhalten

### 2. AUDIO PLAYER
- **Location:** Direkt unter der deutschen Phrase
- **Features:**
  - 🔊 Play/Pause Button (großer runder Button)
  - Speed Control (0.75x, 1.0x, 1.25x, 1.5x)
  - Visuelles Feedback (⏳ Loading, ⏸ Pause, ❌ Error)
  - Automatisches Stoppen beim Kartenwechsel

### 3. UK SCHREIBWEISE
- **CSVs erweitert:** Alle week*.csv haben jetzt `englisch_uk` Spalte
- **Automatische Konvertierung:**
  - summarize → summarise
  - finalize → finalise
  - organize → organise (falls vorhanden)
- **Fallback:** Wenn keine UK-Variante → nutzt US-Variante

### 4. AUDIO-QUELLE
- **Drive Folder:** `1l-gqIWNtN4EOVv0Bnf1NcfAdoR9W9gKx`
- **URL Pattern:** `https://drive.google.com/uc?export=download&id={FILE_ID}`
- **Struktur:**
  ```
  w1/us/w1_001.mp3, w1_002.mp3, ...
  w1/uk/w1_001.mp3, w1_002.mp3, ...
  w2/us/...
  w2/uk/...
  etc.
  ```

---

## 📂 DATEIEN GEÄNDERT

### `js/coach.js`
**Neue Funktionen:**
- `toggleAccent()` - Wechselt US/UK
- `changeAudioSpeed(speed)` - Ändert Playback-Rate
- `getAudioUrl(cardIndex)` - Generiert Audio-URL
- `playAudio()` - Spielt Audio ab
- `toggleAudio()` - Play/Pause
- `getEnglishVariant(card)` - Gibt korrekte Accent-Variante zurück

**Geänderte Funktionen:**
- `loadDeck()` - Lädt jetzt auch `englisch_uk` und `wrong`
- `renderCard()` - Zeigt Accent Toggle + Audio Player
- `revealAnswer()` - Nutzt `getEnglishVariant()`
- `rate()` - Stoppt Audio, nutzt `getEnglishVariant()`
- `previous()` - Stoppt Audio
- `skip()` - Stoppt Audio

**CONFIG erweitert:**
```javascript
audio: {
    enabled: true,
    driveFolderId: '1l-gqIWNtN4EOVv0Bnf1NcfAdoR9W9gKx',
    baseUrl: 'https://drive.google.com/uc?export=download&id=',
    testFileId: '11HnnIIArn63YVq2OXe72dUY70Hp-oE7t',
    defaultAccent: 'us',
    defaultSpeed: 1.0,
    speedOptions: [0.75, 1.0, 1.25, 1.5]
}
```

**App State erweitert:**
```javascript
currentAccent: localStorage.getItem('be4w_accent') || 'us',
audioSpeed: parseFloat(localStorage.getItem('be4w_audio_speed')) || 1.0,
currentAudio: null,
audioCache: {}
```

### `data/week*.csv`
**Alle CSVs erweitert:**
- Neue Spalte: `englisch_uk`
- W1: 2 UK-Varianten
- W2: 1 UK-Variante
- W3: 0 UK-Varianten
- W4: 0 UK-Varianten

### `data/audio-config.json` (neu)
Konfiguration für Audio-System (aktuell nicht verwendet, aber dokumentiert)

---

## 🎨 UI KOMPONENTEN

### Accent Toggle
```html
<!-- Zeigt nur bei Core Decks (w1-w4) -->
<div style="margin: 12px 0; ...">
    <button onclick="toggleAccent()" 
            class="accent-btn active">
        🇺🇸 American
    </button>
    <button onclick="toggleAccent()" 
            class="accent-btn">
        🇬🇧 British
    </button>
</div>
```

### Audio Player
```html
<!-- Zeigt nur bei Core Decks mit Audio -->
<div style="margin-top: 16px; ...">
    <button onclick="toggleAudio()" class="audio-play-btn">
        🔊
    </button>
    <div>
        Audio: 🇺🇸 American (oder 🇬🇧 British)
    </div>
    <div>
        Speed: [0.75x] [1.0x] [1.25x] [1.5x]
    </div>
</div>
```

---

## ⚠️ WICHTIG: FILE ID MAPPING

### AKTUELLER STATUS
**Alle Audio-URLs nutzen aktuell die Test-File-ID:**
- File ID: `11HnnIIArn63YVq2OXe72dUY70Hp-oE7t`
- Das ist w1_001.mp3 (US)

### NÄCHSTE SCHRITTE
Um alle 344 Audio-Dateien zu nutzen, brauchen wir:

**OPTION A: Manuelle Liste**
CSV mit Mapping:
```csv
week,accent,index,file_id
w1,us,1,11HnnIIArn63YVq2OXe72dUY70Hp-oE7t
w1,us,2,FILE_ID_2
w1,uk,1,FILE_ID_UK_1
...
```

**OPTION B: Google Drive API**
Script das Drive API nutzt um alle File IDs zu extrahieren

**OPTION C: Hybrid**
- Cache File IDs beim ersten Laden
- Speichere in localStorage
- Lazy Loading

---

## 🧪 TESTING

### Test-Datei: `audio-test.html`
Standalone HTML zum Testen der Audio-Integration:
- Accent Toggle
- Speed Control
- Audio Playback
- Drive-Integration

**So testen:**
```bash
cd be4w-hub
python3 server-nocache.py
# Browser: http://localhost:9001/audio-test.html
```

### Im Coach testen:
```bash
cd be4w-hub
python3 server-nocache.py
# Browser: http://localhost:9001
# Login: english2025
# Starte W1 Core Coach
# Teste Accent Toggle + Audio Player
```

---

## 🐛 BEKANNTE ISSUES

### 1. File ID Mapping fehlt
**Problem:** Alle Karten nutzen gleiche Test-File-ID
**Lösung:** File ID Mapping implementieren (siehe oben)
**Workaround:** Test-Audio spielt immer

### 2. Audio lädt langsam
**Problem:** Google Drive kann langsam sein
**Lösung:** Pre-loading implementieren oder andere Hosting-Option
**Workaround:** Loading-Indikator zeigt Status

### 3. CORS Issues möglich
**Problem:** Browser könnte Drive-Audio blockieren
**Lösung:** Teste in verschiedenen Browsern
**Workaround:** Nutze `uc?export=download` URL-Format

---

## 📊 STATISTIK

### Code Changes
- **Zeilen hinzugefügt:** ~200
- **Funktionen hinzugefügt:** 6
- **Funktionen geändert:** 5
- **CSVs geändert:** 4
- **Neue Dateien:** 2 (audio-config.json, audio-test.html)

### Audio-Dateien
- **Total:** 344 MP3s (172 US + 172 UK)
- **Wochen:** 4 (W1-W4)
- **Phrasen:** 172 total
- **UK-Varianten:** Nur 3 unterschiedliche Schreibweisen

---

## 🚀 NÄCHSTE SCHRITTE

### PRIO 1: File ID Mapping
Ohne echtes Mapping spielt immer die gleiche Test-Datei.

**Optionen:**
1. Manuelle CSV-Liste erstellen
2. Google Drive API Script
3. Auto-Discovery beim Laden

### PRIO 2: Performance
- Pre-load Audio der nächsten Karte
- Cache Audio-Elemente
- Lazy Loading für File IDs

### PRIO 3: UX Verbesserungen
- Progress Bar während Playback
- Loop-Funktion (3x wiederholen)
- Keyboard Shortcuts (Space = Play/Pause)
- Auto-play nach Reveal (optional)

---

## 💡 USAGE EXAMPLES

### User Workflow
```
1. User öffnet W1 Core Coach
2. Sieht Accent Toggle: [🇺🇸 American] [🇬🇧 British]
3. Klickt auf British → Wechselt zu UK
4. Phrase zeigt: "Let me quickly summarise." (statt "summarize")
5. Klickt 🔊 Button → Audio spielt (British Accent)
6. Ändert Speed zu 0.75x → Audio wird langsamer
7. Klickt Weiter → Audio stoppt automatisch
8. Nächste Karte → Accent bleibt UK
```

### Developer Workflow
```javascript
// Audio für aktuelle Karte abspielen
playAudio();

// Accent wechseln
toggleAccent(); // US → UK oder UK → US

// Speed ändern
changeAudioSpeed(1.25); // 125% Speed

// Audio stoppen
if (App.currentAudio) {
    App.currentAudio.pause();
    App.currentAudio = null;
}

// Korrekte Phrase holen
const phrase = getEnglishVariant(card); // "summarise" wenn UK
```

---

## 📞 SUPPORT

Bei Fragen oder Problemen:
1. Check Console (F12) für Errors
2. Teste mit audio-test.html
3. Verify Drive-Links funktionieren
4. Check localStorage (be4w_accent, be4w_audio_speed)

---

**Version:** 1.0 - Audio Integration  
**Datum:** 2026-03-17  
**Status:** ✅ Feature Complete, ⚠️ File ID Mapping Pending
