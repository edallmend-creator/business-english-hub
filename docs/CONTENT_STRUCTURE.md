# Business English Hub: Struktur und Pflege

Diese Datei erklärt die wichtigsten Produktbereiche, damit Inhalte später leicht erweitert oder geändert werden können.

## Hauptseiten

- `start.html`: Startseite/Landing innerhalb des Webteils mit Einstieg in Kurs und Coach.
- `index.html`: Login-geschützter Kurs-Hub mit Hero, Kursübersicht, Wochenplan, Bonusbereich und Footer.
- `coach.html`: Eigene Coach-Seite für Spaced-Repetition-Training.
- `faq.html`: Eigene FAQ-Seite mit ausführlicheren Fragen und Antworten.
- `feedback.html`: Eigene Feedback-/Verlagsunterstützungsseite.
- `downloads.html`: Eigene Materialbibliothek mit CSV- und PDF-Downloads.
- `impressum.html`: Anbieterkennzeichnung mit Kontakt, Verantwortlichkeit, Urheberrecht und Haftungshinweisen.
- `datenschutz.html`: Datenschutzerklärung zu Hosting, localStorage, Synchronisierung, Supabase, Google Fonts, jsDelivr, Feedback und externen Links.

## Wichtige CSS-Dateien

- `css/hero.css`: Hero, Kursübersicht und frühere Methodik-Komponenten.
- `css/weeks.css`: Wochenmodule, Inhaltsseiten, FAQ, Feedback-Bereich, Downloads und Legal-Seiten.
- `css/coach.css`: Coach-Startseite, Lernkarte, US/UK-Umschalter und mobile Coach-Optimierung.
- `css/nav.css`: Navigation im Hub und Coach.
- `css/gate.css`: Login-Gate.

## Wochenplan erweitern

Die Wochenmodule stehen in `index.html` im Abschnitt `<section class="weeks-section" id="weeks">`.

Pro Woche gibt es drei Ebenen:

- `week-header`: Titel, Beschreibung und Buch-/Methodenhinweis.
- `week-module-strip`: Ziel, Methode und Ergebnis.
- `section-grid`: konkrete Trainingskarten mit Buttons.

Wenn eine neue Übung ergänzt wird, sollte sie als `.section-card` in der passenden Woche stehen. Der Button kann entweder eine Coach-Seite öffnen oder eine Funktion wie `openExercise(...)` starten.

## Bonus-Decks und Branchen-Phrasen

Die Nischen-/Branchen-Decks bestehen aus vollständigen Satzbausteinen. Das englische Feld enthält die Trainingsphrase, das deutsche Feld die Abruf-Aufgabe und `notizen` enthält den Fokusbegriff.

Die Download-Kopien unter `data/phrases/niche-*.csv` sollten mit den Coach-Dateien unter `data/niche-*.csv` synchron bleiben.

## FAQ erweitern

Die FAQ steht in `faq.html`.

Neue Fragen werden als `<details>` ergänzt:

```html
<details>
  <summary>Neue Frage?</summary>
  <p>Kurze Antwort.</p>
</details>
```

## Feedback und Rezensionen

Der Bereich steht in `feedback.html`.

Die Links werden zentral aus `js/site-config.js` gelesen und in `js/feedback.js` in die Seite eingesetzt.

Aktuelle Konfigurationsfelder pro Kampagne:

- `bookTitle`
- `amazonReviewUrl`
- `feedbackEmail`

Der Amazon-Rezensionslink ist zentral in `js/site-config.js` hinterlegt. Wichtig: keine Sterne-Vorauswahl und keine positive Bewertungslogik einbauen.

Die sichtbaren Optionen sind bewusst neutral und gleichwertig formuliert:

- `Rezension auf Amazon schreiben`
- `Feedback oder Problem melden`

Es gibt keine Stimmungsabfrage und keine Bewertungsverzweigung. Beide Optionen sind immer sichtbar.

## Navigation

Die Hauptnavigation in `index.html` enthält Wochenlinks sowie sekundäre Links auf `downloads.html`, `faq.html` und `feedback.html`.

Auf Inhaltsseiten wird eine einfache Navigation mit direkten Seitenlinks verwendet.

## Coach anpassen

Der Coach rendert die Lernkarte in `js/coach.js` in `renderCard()`.

Wichtige sichtbare Bereiche:

- `.coach-session-brand`: kleine Coach-Marke mit Ente.
- `.accent-panel`: US/UK-Umschalter.
- `.settings-bar`: einklappbare Optionen.
- `.card`: eigentliche Lernkarte.

Design-Anpassungen dazu liegen in `css/coach.css`.

## Rechtliches

`impressum.html` und `datenschutz.html` sind inhaltlich ausgearbeitet und nicht mehr als Platzhalter formuliert. Vor öffentlichem Hosting sollte dennoch eine rechtliche Finalprüfung erfolgen.

Besonders prüfen:

- Anbieterangaben
- Kontaktangaben
- Hosting
- Supabase-Speicherung
- Google Fonts
- jsDelivr/CDN-Nutzung
- localStorage-Hinweise
- Amazon-/Feedback-Linkziele

## PDF-Materialien

LaTeX-Quellen liegen unter `materials/pdf-src/`. Fertige PDFs liegen unter `data/pdfs/` und sind im Hub sowie auf `downloads.html` verlinkt. Das Core-Phrasen-Workbook nutzt bewusst Karten statt enger Tabellen: Deutsch lesen, Englisch abdecken, aktiv abrufen, Lösung prüfen. Branchen-Phrasen bleiben als CSV-Spezialmaterial, damit Nutzer nur relevante Bereiche laden und editieren können.

Aktuelle PDF-Dateien:

- `phrase-bank-overview.pdf`
- `bonus-workbook.pdf` als PDF-exklusives Arbeitsmaterial für Meeting-Vorbereitung, schwierige Gesprächsmomente, Quick-Fix-Karten und UK/US-Phrase-Varianten

## Vor GitHub-Veröffentlichung

- Supabase Row-Level Security und Tabellen anhand von `docs/SUPABASE_LAUNCH_CHECKLIST.md` prüfen.
- Amazon-Link und Feedback-Adresse final prüfen.
- Impressum und Datenschutz rechtlich final prüfen.
- PDF-Downloads nach Inhalt und Branding final gegenlesen.
