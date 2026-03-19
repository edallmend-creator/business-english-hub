# BE4W HUB - TODO / REPARATUR-LISTE

## ✅ ERLEDIGT

- [x] Pixel-Ente aus Navigation entfernt
- [x] Coach in alle Wochen integriert
- [x] Defekte/duplizierte Tools entfernt
- [x] URL-Parameter Support (?deck=w1_core)
- [x] False Friends "undefined" gefixt (CSV + JS Mapping)
- [x] Coach-Banner entfernt (nicht mehr nötig)
- [x] Settings einklappbar gemacht (cleaner UI)
- [x] Bonus-Decks mit Coach-Branding versehen

---

## 🔧 NOCH ZU REPARIEREN

### **PRIO 1 - FUNKTIONALITÄT**

#### **1. Self-Explanation (Rubber Duck) testen**
- **Status:** Unbekannt
- **Location:** Woche 4
- **Test:** Button klicken → Sollte Begriffe zum Erklären zeigen
- **Falls defekt:** Reparieren oder entfernen

#### **2. Shadowing Placeholder**
- **Status:** Disabled mit "🔜 Bald verfügbar"
- **Location:** Woche 3
- **TODO:** Sobald Audio-Dateien vorhanden → aktivieren
- **Files needed:** Audio-Files für W3 Phrasen

---

### **PRIO 2 - DOWNLOADS**

#### **3. Download-Links ersetzen**
- **Status:** Alle zeigen "#" (Placeholder)
- **Location:** Alle Wochen + Bonus
- **TODO:** 
  - PDFs in Google Drive hochladen
  - Links ersetzen mit: `https://drive.google.com/uc?export=download&id=FILE_ID`
- **Betroffene Dateien:**
  - Vokabelliste Woche 1 – Phrasen (CSV)
  - Spaced-Repetition-Karten Woche 1 (PDF)
  - Vokabelliste Woche 2 (CSV)
  - UK vs. US Phrasen-Übersicht (PDF)
  - Vokabelliste Woche 3 (CSV)
  - Shadowing-Leitfaden (PDF)
  - Vokabelliste Woche 4 (CSV)
  - Pitch-Checkliste (PDF)

---

### **PRIO 3 - NICE-TO-HAVE**

#### **4. Coach Dashboard Optimierung**
- **Status:** Funktioniert, aber könnte schöner sein
- **Ideas:**
  - Bessere Visualisierung der SRS-Stats
  - Fortschritts-Grafiken
  - Streak-Visualisierung

#### **5. False Friends erweitern**
- **Status:** Nur 12 Einträge
- **TODO:** Mehr False Friends aus dem Buch hinzufügen
- **File:** data/false-friends.csv

#### **6. Bonus: Lerntyp-Quiz**
- **Status:** "Bald verfügbar"
- **TODO:** Quiz entwickeln oder entfernen

---

## 🎯 NÄCHSTE SCHRITTE

1. **Self-Explanation testen** → Falls kaputt: Fix oder raus
2. **Download-Links** → Google Drive URLs einfügen
3. **Shadowing** → Warten auf Audio-Dateien

---

## 📝 NOTIZEN

### **Was funktioniert:**
- ✅ Coach (alle 25 Decks)
- ✅ False Friends (komplett gefixt!)
- ✅ URL-Parameter Deck-Loading
- ✅ User-Code System
- ✅ Supabase Sync
- ✅ SRS mit Intervallen
- ✅ Dual Coding
- ✅ Auto-Rate
- ✅ Timer
- ✅ Interleaving
- ✅ Settings einklappbar
- ✅ Bonus-Decks mit Coach-Branding

### **Was entfernt wurde (defekt):**
- ❌ Interleaving (standalone - ist im Coach)
- ❌ Retrieval Practice (standalone - ist im Coach)
- ❌ Ton & Grammatik (undefined)
- ❌ Phrasen im Kontext (undefined)
- ❌ RIVC (kein Mehrwert)
- ❌ Thought Chunking (= RIVC)
- ❌ Elaborative Interrogation (defekt)
- ❌ Framing (defekt)
- ❌ NYC Pitch Simulation (defekt)

### **Was behalten wurde:**
- ✅ Coach (zentral!)
- ✅ False Friends (MC - unique & gefixt)
- ✅ Self-Explanation (Rubber Duck - noch zu testen)
- 🔜 Shadowing (disabled - Audios fehlen)
- 📥 Downloads (Links müssen ersetzt werden)
