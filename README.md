# 📚 Business English in 4 Wochen - Hub

Ein interaktiver Spaced Repetition Coach für Business English, basierend auf dem gleichnamigen Buch.

---

## ✨ Features

### 🎯 **Core Features**
- **4 Wochen Kern-Decks** mit jeweils 20-58 Business-Phrasen
- **Spaced Repetition System (SRS)** für optimales Langzeitgedächtnis
- **Audio-Integration** mit US & UK Akzent (ElevenLabs)
- **Interleaving-Modus** für effektiveres Lernen
- **Dual Coding** mit Emoji-Merkhilfen
- **Active Recall** durch Tipp-Eingabe
- **False Friends Coach** zur Vermeidung typischer Fehler
- **11 Niche-Decks** für spezifische Branchen

### 🎨 **Tools & Modi**
- **Softener-Trainer** (4 Techniken × 12 Situationen)
- **Global Dashboard** mit Lern-Statistiken
- **SRS-Dashboard** für Wiederholungsplanung
- **Learning Plan** mit personalisierten Empfehlungen
- **Timer-Modus** für Retrieval Practice
- **Offline-First** - funktioniert ohne Internet

---

## 🚀 Quick Start

### Lokal starten

```bash
cd be4w-hub
python3 server-nocache.py
```

Öffne Browser: `http://localhost:9001`

**Login-Passwort:** `english2025`

### Auf GitHub Pages deployen

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USERNAME/be4w-hub.git
git push -u origin main
```

Aktiviere GitHub Pages in den Repository-Settings:
- Settings → Pages → Source: `main` → Save

Deine App läuft dann auf:
`https://DEIN-USERNAME.github.io/be4w-hub/`

---

## 📁 Projektstruktur

```
be4w-hub/
├── index.html              # Hub-Hauptseite
├── coach.html              # Spaced Repetition Coach
├── css/
│   ├── variables.css       # Farben & Variablen
│   ├── nav.css             # Navigation
│   ├── weeks.css           # Wochen-Cards
│   ├── coach.css           # Coach-Styling
│   ├── modals.css          # Modals
│   └── gate.css            # Login-Gate
├── js/
│   ├── coach.js            # Coach-Logik (2500+ Zeilen)
│   ├── flashcards.js       # Tools (Softener, etc.)
│   ├── auth.js             # Login-System
│   ├── navigation.js       # Navigation
│   ├── srs.js              # SRS-Algorithmus
│   ├── sync.js             # Supabase-Sync
│   └── streak.js           # Streak-Tracking
├── data/
│   ├── decks.json          # Deck-Registry (25 Decks)
│   ├── phrases/            # CSV-Dateien
│   │   ├── week1-core.csv  # W1 Kern-Deck (45 Phrasen)
│   │   ├── week2-core.csv  # W2 Kern-Deck (58 Phrasen)
│   │   ├── week3-core.csv  # W3 Kern-Deck (49 Phrasen)
│   │   ├── week4-core.csv  # W4 Kern-Deck (20 Phrasen)
│   │   ├── false-friends.csv
│   │   ├── softener-cards.csv
│   │   └── niche-*.csv     # 11 Branchen-Decks
│   └── audio-config.json   # Audio-System Config
├── audio/                  # Lokale MP3s (344 Dateien)
│   ├── w1/us/*.mp3        # Woche 1 US-Akzent
│   ├── w1/uk/*.mp3        # Woche 1 UK-Akzent
│   └── ...
└── images/
    └── NoraJonas2.png      # Instructor Photo
```

---

## 🎓 Verwendung

### Hub-Navigation

**Wochen 1-4:** Jede Woche hat einen **Coach**-Button für das Kern-Deck

**Bonus-Sektion:** 11 Niche-Decks für spezifische Branchen:
- Finance & Controlling
- HR & Recruiting
- Tech & IT
- Sales & Business Development
- Email Communication
- Presentations
- Startups & Innovation
- Customer Service
- Legal & Compliance
- Healthcare
- Manufacturing & Logistics

### Coach-Features

**Settings (⚙️):**
- Typing aktivieren/deaktivieren
- Emojis für Dual Coding
- Timer (Retrieval Practice)
- Interleaving (Shuffle-Modus)
- Timer-Dauer anpassen

**Audio-Player:**
- 🇺🇸 American / 🇬🇧 British Accent Toggle
- Speed: 🐢 Langsam (0.75x) / ▶️ Normal (1.0x)
- Auto-Stop beim Kartenwechsel

**Bewertung:**
- ✅ **Richtig** - Karte kommt später wieder
- ❌ **Falsch** - Karte kommt bald wieder
- ⏭️ **Überspringen** - Neutral (keine SRS-Änderung)

### Dashboards

**Global Dashboard:**
- Gesamtfortschritt über alle Decks
- Streak-Tracking
- Lernzeit & Statistiken

**SRS Dashboard:**
- Anstehende Wiederholungen
- Intervall-Übersicht
- Weak Cards zum Üben

---

## 🔧 Technische Details

### Audio-System

**Format:** MP3 (ElevenLabs TTS)
**Struktur:** `audio/{week}/{accent}/{week}_{index}.mp3`

**Beispiel:**
```
audio/w1/us/w1_001.mp3  → "Before we move on, one quick point."
audio/w1/uk/w1_001.mp3  → Gleicher Text, UK-Akzent
```

**Voices:**
- US: Rachel (`21m00Tcm4TlvDq8ikWAM`)
- UK: Charlotte (`XB0fDUnXU5powFXDhCwa`)

### CSV-Format

```csv
deutsch,englisch,englisch_uk,kategorie,beispiel,notizen,wrong
"Bevor wir weitermachen, ein kurzer Punkt.","Before we move on, one quick point.","Before we move on, one quick point.","transition","...","",""
```

**Spalten:**
- `deutsch` - Deutsche Phrase
- `englisch` - Englische Übersetzung (US)
- `englisch_uk` - UK-Variante (optional)
- `kategorie` - Thematische Zuordnung
- `beispiel` - Kontext-Beispiel
- `notizen` - Zusätzliche Hinweise
- `wrong` - Falscher Begriff (nur False Friends)

### SRS-Algorithmus

**Intervalle:** 1, 2, 7, 14, 28 Tage

**Bewertung:**
- Richtig → Intervall erhöhen
- Falsch → Intervall auf 1 Tag zurücksetzen

**Daten:** localStorage (`srs_{deckId}`)

### Supabase-Integration

**Optional:** Cloud-Sync für Multi-Device

**Config:**
```javascript
supabase: {
    enabled: true,
    url: 'https://YOUR-PROJECT.supabase.co',
    anonKey: 'YOUR-ANON-KEY'
}
```

---

## 🎨 Anpassung

### Farben ändern

Editiere `css/variables.css`:

```css
--primary: #3b82f6;    /* Hauptfarbe */
--accent: #fbbf24;     /* Akzentfarbe */
--success: #10b981;    /* Erfolg */
--error: #ef4444;      /* Fehler */
```

### Neue Decks hinzufügen

1. CSV in `data/phrases/` erstellen
2. Eintrag in `data/decks.json` hinzufügen
3. Button im Hub einfügen

**Beispiel Deck-Eintrag:**
```json
{
  "id": "my_deck",
  "name": "Mein Deck",
  "description": "Beschreibung",
  "csvPath": "data/phrases/my-deck.csv",
  "color": "#10b981",
  "icon": "📊",
  "category": "bonus"
}
```

### Audio hinzufügen

1. MP3s generieren (ElevenLabs/alternatives TTS)
2. In `audio/{week}/{accent}/` ablegen
3. Naming: `{week}_{index}.mp3` (z.B. `w1_001.mp3`)

---

## 📊 Statistiken & Tracking

**Gespeichert in localStorage:**
- SRS-Daten pro Deck
- Dual-Coding Emojis
- Streak-Daten
- User-Code
- Settings

**User-Code:** Generiert beim ersten Start (z.B. `clear-5512`)

---

## 🐛 Troubleshooting

### Audio spielt nicht

1. Check Browser Console (F12)
2. Verify Audio-Dateien existieren
3. Check Pfade in `audio-config.json`

### Cards in falscher Reihenfolge (Interleaving)

→ Normal! Interleaving mischt Cards für besseres Lernen

### Fortschritt geht verloren

→ localStorage leeren löscht Daten! Backup via Export-Funktion

### Coach zeigt leere Seite

→ Hard Refresh: `STRG + SHIFT + R`

---

## 📝 Lizenz

© 2026 Edgar Allmendinger  
Alle Rechte vorbehalten.

Basierend auf dem Buch:  
**"Business English in 4 Wochen"** von Edgar Allmendinger

---

## 🙏 Credits

**Autor & Entwickler:** Edgar Allmendinger  
**Audio:** ElevenLabs TTS  
**CSV-Parsing:** PapaParse  
**Backend (optional):** Supabase

---

## 📧 Kontakt

Bei Fragen oder Feedback:  
→ Via GitHub Issues  
→ oder direkt per Email

---

**Viel Erfolg beim Lernen! 🚀**
