# 🎉 BUSINESS ENGLISH COACH - HUB INTEGRATION

## ✅ WAS IST NEU:

### **SPACED REPETITION COACH INTEGRIERT!**

```
be4w-hub/
├── index.html (Hub - Landing Page)
├── coach.html (Spaced Repetition Coach) ← NEU!
├── css/
│   └── variables.css (Shared Design!)
├── js/
│   ├── flashcards.js (Alte Tools)
│   └── coach.js (Coach Code) ← NEU!
└── data/
    ├── decks.json ← NEU!
    └── 25 CSV-Dateien ← NEU!
```

---

## 🚀 STARTEN:

```bash
cd be4w-hub
python3 server-nocache.py

# Browser:
http://localhost:9001
```

---

## 📊 NAVIGATION:

### **VON HUB ZUM COACH:**
```
index.html
├── Woche 1: "⭐ Spaced Repetition Coach"
├── Klick "▶ Coach öffnen"
└── → coach.html öffnet sich
```

### **VOM COACH ZURÜCK:**
```
coach.html
├── Top-Bar: "← Zurück zum Kurs"
└── → index.html (Hub)
```

---

## 🎯 FEATURES IM COACH:

```
✅ 25 Decks (W1-W4 + Bonus + Niche)
✅ Global-Dashboard (Übersicht aller Decks)
✅ Spaced Repetition (1,2,7,14,28 Tage)
✅ Fortschritts-Dashboard pro Deck
✅ 4-Wochen-Lernplan aus dem Buch
✅ Dual Coding (Emojis)
✅ Auto-Rate beim Tippen
✅ Timer (optional)
✅ Interleaving
✅ 20% Fehlertoleranz
```

---

## 🎨 DESIGN:

### **SHARED CSS:**
```css
/* variables.css - beide nutzen das! */
--primary: #0066CC
--accent: #FF9500
--bg: #F8F9FA
etc.
```

### **KONSISTENTE UI:**
```
✅ Gleiche Farben
✅ Gleiche Buttons
✅ Gleicher Look & Feel
✅ Nahtlose Integration
```

---

## 📁 DATEISTRUKTUR:

### **HUB (index.html):**
- Landing Page
- Wochen-Navigation
- Alle anderen Tools
- Link zum Coach

### **COACH (coach.html):**
- Eigenständige Seite
- Shared CSS vom Hub
- Coach-Code isoliert
- Zurück-Button zum Hub

---

## 💡 VORTEILE:

```
✅ ZWEI kleine Files statt EINER riesigen
✅ Coach eigenständig wartbar
✅ Hub unabhängig vom Coach
✅ Shared CSS = konsistentes Design
✅ Kann separat entwickelt werden
✅ Übersichtlich & sauber!
```

---

## 🔧 WARTUNG:

### **Coach updaten:**
```
Nur coach.html + js/coach.js anfassen
Hub bleibt unberührt!
```

### **Hub updaten:**
```
Nur index.html + js/flashcards.js anfassen
Coach bleibt unberührt!
```

### **Design ändern:**
```
css/variables.css ändern
→ Beide Updates automatisch!
```

---

## 🎯 PRODUCTION READY:

```
✅ Alle 25 Decks funktionieren
✅ SRS läuft perfekt
✅ Navigation funktioniert
✅ Design konsistent
✅ Code wartbar
✅ FERTIG ZUM DEPLOYEN!
```

---

## 📖 4-WOCHEN-PLAN:

Im Coach: Button "📖 Empfohlener 4-Wochen-Plan"
→ Zeigt Lernplan aus dem Buch
→ Woche 1-4 erklärt
→ User-Autonomie betont

---

**Happy Learning! 🚀**
