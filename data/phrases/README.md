# 📚 Business English Phrasen-Bibliothek

Alle CSV-Dateien mit Phrasen für den BE4W Online-Kurs.

## 📖 Core-Decks (Pflicht für alle)

| Datei | Phrasen | Beschreibung |
|-------|---------|--------------|
| `week1-core.csv` | 45 | Woche 1: Grundlagen – Meeting-Phrasen |
| `week2-core.csv` | 58 | Woche 2: Fortschritt – Interleaving & Ton |
| `week3-core.csv` | 49 | Woche 3: Feinschliff – Shadowing & RIVC |
| `week4-core.csv` | 20 | Woche 4: Anwendung – Emails & Professional |
| `false-friends.csv` | 45 | False Friends – Stolperfallen |
| `grundwortschatz.csv` | 29 | Grundwortschatz + Erweitert |

**Total Core:** 246 Phrasen

---

## 🎯 Nischen-Decks (wählbar nach Branche)

| Datei | Phrasen | Branche |
|-------|---------|---------|
| `niche-finance.csv` | 25 | 💼 Finance & Controlling |
| `niche-hr.csv` | 24 | 👥 HR & People Management |
| `niche-tech.csv` | 25 | 💻 Tech & IT |
| `niche-sales.csv` | 30 | 📈 Sales & Marketing |
| `niche-legal.csv` | 24 | ⚖️ Legal & Compliance |
| `niche-healthcare.csv` | 24 | 🏥 Healthcare |
| `niche-startup.csv` | 27 | 🚀 Startup & Innovation |
| `niche-manufacturing.csv` | 25 | 🏭 Manufacturing |
| `niche-customer.csv` | 25 | 🎧 Customer Service |
| `niche-presentation.csv` | 27 | 🎤 Presentations |
| `niche-email.csv` | 30 | 📧 Email Communication |

**Total Nischen:** 286 Phrasen

---

## ✨ Bonus-Decks (Erweiterte Themen)

| Datei | Phrasen | Thema |
|-------|---------|-------|
| `bonus-politeness.csv` | 27 | Politeness & Softening |
| `bonus-communication.csv` | 56 | Kommunikation |
| `bonus-hidden.csv` | 24 | Hidden Meanings |
| `bonus-positive.csv` | 24 | Positive Phrasing |
| `bonus-us-business.csv` | 29 | US Business Culture |
| `bonus-motivation.csv` | 20 | Motivation & Leadership |
| `bonus-favorites.csv` | 50 | Lieblings-Phrasen |

**Total Bonus:** 230 Phrasen

---

## 📊 Gesamtstatistik

- **Core-Decks:** 246 Phrasen (Pflicht)
- **Nischen-Decks:** 286 Phrasen (individuell)
- **Bonus-Decks:** 230 Phrasen (optional)
- **TOTAL:** 762 Phrasen

---

## 📝 CSV-Format

Alle Dateien haben das gleiche Format:

```csv
englisch,deutsch,beispiel,notizen
"Before we move on...","Bevor wir weitermachen...","Before we move on, one quick point.",""
```

**Spalten:**
1. `englisch` – Englische Phrase
2. `deutsch` – Deutsche Übersetzung
3. `beispiel` – Beispielsatz im Kontext
4. `notizen` – Zusätzliche Hinweise (optional)

---

## 🔄 Verwendung auf der Website

Diese CSVs werden dynamisch geladen via `csv-loader.js`:

```javascript
// Beispiel
const phrases = await loadPhrases('week1-core.csv');
```

---

## 📥 Downloads für User

Die gleichen CSVs können auch als Download angeboten werden:
- Core-Decks → Pflicht-Downloads
- Nischen-Decks → Optionale Downloads nach Branche
