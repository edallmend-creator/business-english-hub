# 🚀 QUICK START - AUDIO INTEGRATION

## ⚠️ PROBLEM: ACCENT TOGGLE NICHT SICHTBAR?

### LÖSUNG 1: CACHE LEEREN
```
1. STRG + SHIFT + R (Hard Refresh)
2. Oder: Browser Cache komplett leeren
3. Oder: Inkognito-Fenster verwenden
```

### LÖSUNG 2: CHECK RICHTIGER DECK
```
Der Accent Toggle zeigt NUR bei:
- W1 Core (NICHT W1 False Friends!)
- W2 Core
- W3 Core  
- W4 Core

Gehe zu: Coach → Deck Selection → W1 Core auswählen
```

### WO IST DER ACCENT TOGGLE?
```
GANZ OBEN (vor Settings):

┌──────────────────────────────────┐
│ 🎙️ Accent: [🇺🇸] [🇬🇧]         │ ← HIER!
└──────────────────────────────────┘

⚙️ Einstellungen ▼

Woche 1 Coach | Neu | 1/45
```

---

## 🎵 FILE ID MAPPING - SO GEHT'S:

### METHODE 1: Browser Tool (EINFACH!)

```bash
# 1. Starte Server
cd be4w-hub
python3 server-nocache.py

# 2. Öffne im Browser
http://localhost:9001/drive-file-id-collector.html

# 3. Folge den Schritten im Tool!
```

Das Tool:
1. Öffnet Drive-Ordner
2. Console-Code zum Kopieren
3. Sammelt alle File IDs
4. Generiert `audio-mapping.json`

### METHODE 2: Manuell (falls Tool nicht funktioniert)

Für jede Datei:
```
1. Drive → Rechtsklick → "Link abrufen"
2. Link: https://drive.google.com/file/d/FILE_ID_HIER/view
3. Kopiere nur FILE_ID_HIER
```

**BEISPIEL:**
```
Link: https://drive.google.com/file/d/11HnnIIArn63YVq2OXe72dUY70Hp-oE7t/view
FILE_ID: 11HnnIIArn63YVq2OXe72dUY70Hp-oE7t
```

---

## 📦 AKTUELLER STATUS:

```
✅ Accent Toggle implementiert (US/UK)
✅ Audio Player implementiert
✅ Speed Control (0.75x - 1.5x)
✅ CSVs mit englisch_uk Spalte
✅ Drive-Integration vorbereitet

⚠️  File ID Mapping fehlt noch
    → Alle Karten nutzen Test-Audio
    → Tool in drive-file-id-collector.html!
```

---

## 🧪 TESTING:

### Test 1: Accent Toggle sichtbar?
```bash
cd be4w-hub
python3 server-nocache.py
# Browser: http://localhost:9001
# Login: english2025
# Coach → W1 Core auswählen
# Hard Refresh: STRG+SHIFT+R

✅ Siehst du: 🎙️ Accent: [🇺🇸 American] [🇬🇧 British]?
```

### Test 2: Audio Player sichtbar?
```
Unter der deutschen Phrase solltest du sehen:
┌────────────────────────┐
│ [🔊] Audio Player      │
│ Speed: 0.75x 1.0x etc. │
└────────────────────────┘
```

### Test 3: Audio funktioniert?
```
1. Klicke 🔊 Button
2. Sollte Test-Audio abspielen
3. (Aktuell spielt immer gleiche Datei - das ist normal!)
```

---

## 📋 NEXT STEPS:

### PRIO 1: File ID Mapping
```
1. Öffne: http://localhost:9001/drive-file-id-collector.html
2. Folge Anweitung
3. Download audio-mapping.json
4. Schick mir die Datei
5. Ich integriere sie!
```

### PRIO 2: Wenn Accent Toggle nicht sichtbar
```
1. Screenshot schicken
2. Console öffnen (F12) → Errors?
3. Welcher Deck geöffnet?
```

---

## 🐛 TROUBLESHOOTING:

### "Ich sehe keinen Accent Toggle"
```
Checklist:
□ Hard Refresh gemacht? (STRG+SHIFT+R)
□ Im richtigen Deck? (W1/W2/W3/W4 CORE!)
□ Inkognito-Fenster probiert?
□ Console-Errors? (F12)
```

### "Ich sehe keinen Audio Player"
```
Gleiche Lösung wie oben!
Der Accent Toggle und Audio Player 
kommen zusammen.
```

### "Audio spielt nicht"
```
1. Console öffnen (F12)
2. Errors sichtbar?
3. Netzwerk-Tab → Audio lädt?
4. Drive-Link funktioniert in neuem Tab?
```

---

## 💡 KONTAKT:

Bei Problemen schick mir:
1. Screenshot vom Coach
2. Console Errors (F12 → Console Tab)
3. Welcher Browser?

**VIEL ERFOLG!** 🎉
