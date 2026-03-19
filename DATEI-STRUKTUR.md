# BE4W - Benötigte Dateien für Downloads & Audios

## 📁 Ordnerstruktur erstellen

```
be4w/
├── downloads/          ← NEUER ORDNER
│   ├── vokabeln/
│   ├── pdfs/
│   └── audios/
├── images/
├── css/
├── js/
├── data/
└── index.html
```

---

## 📥 VOKABELLISTEN (CSV-Dateien)

**Ordner:** `downloads/vokabeln/`

### Woche 1
- `week1-phrasen.csv`
- `week1-flashcards.pdf` (Druckvorlage)

### Woche 2
- `week2-phrasen.csv`
- `week2-flashcards.pdf`

### Woche 3
- `week3-phrasen.csv`

### Woche 4
- `week4-phrasen.csv`

---

## 🎧 SHADOWING AUDIOS (MP3-Dateien)

**Ordner:** `downloads/audios/`

### Woche 3 - Shadowing
- `week3-shadowing-01.mp3`
- `week3-shadowing-02.mp3`
- `week3-shadowing-03.mp3`
- `week3-shadowing-04.mp3`
- `week3-shadowing-05.mp3`

(Je nach Anzahl der Phrasen - nummeriere sie einfach durch)

**Alternative Benennung:**
- `shadowing-w3-phrase-001.mp3`
- `shadowing-w3-phrase-002.mp3`
- etc.

---

## 📄 PDF-DOWNLOADS

**Ordner:** `downloads/pdfs/`

### Allgemein
- `shadowing-leitfaden.pdf` (Anleitung & Checkliste)
- `spaced-repetition-anleitung.pdf` (falls gewünscht)

---

## ✏️ Was du in index.html ändern musst

Ersetze alle `href="#"` durch die echten Pfade:

### Beispiel Woche 1 - Vokabelliste:
```html
<!-- VORHER: -->
<a class="btn-secondary" href="#" download>↓ Download</a>

<!-- NACHHER: -->
<a class="btn-secondary" href="downloads/vokabeln/week1-phrasen.csv" download>↓ Download</a>
```

### Beispiel Woche 1 - Flashcards PDF:
```html
<a class="btn-secondary" href="downloads/vokabeln/week1-flashcards.pdf" download>↓ Download</a>
```

### Beispiel Woche 3 - Shadowing Leitfaden:
```html
<a class="btn-secondary" href="downloads/pdfs/shadowing-leitfaden.pdf" download>↓ Download</a>
```

---

## 🎯 Für Shadowing-Audios im JavaScript

Die Audio-Dateien werden wahrscheinlich in `js/flashcards.js` geladen.

**Typischer Pfad:**
```javascript
const audioPath = `downloads/audios/week3-shadowing-${phraseNumber}.mp3`;
// oder
const audioPath = `downloads/audios/shadowing-w3-phrase-${phraseNumber.toString().padStart(3, '0')}.mp3`;
```

---

## ✅ CHECKLISTE

- [ ] Ordner `downloads/` erstellen
- [ ] Unterordner `vokabeln/`, `pdfs/`, `audios/` erstellen
- [ ] CSV-Dateien für Woche 1-4 hochladen
- [ ] PDF-Flashcards für Woche 1-2 hochladen
- [ ] Shadowing-Leitfaden PDF hochladen
- [ ] Shadowing-Audios für Woche 3 hochladen (MP3)
- [ ] Alle `href="#"` in index.html durch echte Pfade ersetzen
- [ ] Testen: Klicke alle Download-Buttons durch!

---

## 💡 TIPP: Google Drive Alternative

Falls du die Dateien auf Google Drive hosten willst:

1. Datei auf Google Drive hochladen
2. Rechtsklick → "Link abrufen" → "Jeder mit dem Link"
3. Kopiere die FILE_ID aus dem Link
4. Verwende diesen Pfad:

```html
<a class="btn-secondary" 
   href="https://drive.google.com/uc?export=download&id=DEINE_FILE_ID" 
   download>↓ Download</a>
```

**Beispiel:**
Google Drive Link: `https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing`
→ FILE_ID: `1ABC123xyz`
→ Download Link: `https://drive.google.com/uc?export=download&id=1ABC123xyz`
