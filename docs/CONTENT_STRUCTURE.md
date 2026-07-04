# Business English Hub: Struktur und Pflege

Diese Datei erklärt die wichtigsten Produktbereiche, damit Inhalte später leicht erweitert oder geändert werden können.

## Hauptseiten

- `index.html`: Login-geschützter Kurs-Hub mit Hero, Kursübersicht, Wochenplan, FAQ, Feedback und Footer.
- `coach.html`: Eigene Coach-Seite für Spaced-Repetition-Training.
- `impressum.html`: Platzhalter für rechtlich zu prüfende Anbieterangaben.
- `datenschutz.html`: Platzhalter für rechtlich zu prüfende Datenschutzhinweise.

## Wichtige CSS-Dateien

- `css/hero.css`: Hero, Kursübersicht und frühere Methodik-Komponenten.
- `css/weeks.css`: Wochenmodule, FAQ, Feedback-Bereich, Downloads und Legal-Seiten.
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

## FAQ erweitern

Die FAQ steht in `index.html` im Abschnitt `<section class="faq-section" id="faq">`.

Neue Fragen werden als `<details>` ergänzt:

```html
<details>
  <summary>Neue Frage?</summary>
  <p>Kurze Antwort.</p>
</details>
```

## Feedback-Assistent

Der Bereich `Unterstütze den Verlag` steht in `index.html` im Abschnitt `<section class="support-section" id="support">`.

Die Klick-Logik liegt in `js/navigation.js` in `showFeedbackResult(type)`.

Aktuelle Typen:

- `good`: zeigt Amazon-Rezension prominent plus direktes Feedback.
- `medium`: öffnet Feedback-Mail.
- `help`: öffnet Support-Mail.

Wichtig: Der Amazon-Link ist aktuell ein Platzhalter (`https://www.amazon.de/`). Wenn die finale Produktseite bekannt ist, dort die konkrete Review-/Produkt-URL eintragen.

## Coach anpassen

Der Coach rendert die Lernkarte in `js/coach.js` in `renderCard()`.

Wichtige sichtbare Bereiche:

- `.coach-session-brand`: kleine Coach-Marke mit Ente.
- `.accent-panel`: US/UK-Umschalter.
- `.settings-bar`: einklappbare Optionen.
- `.card`: eigentliche Lernkarte.

Design-Anpassungen dazu liegen in `css/coach.css`.

## Rechtliches

`impressum.html` und `datenschutz.html` sind bewusst Platzhalter. Vor öffentlichem Hosting müssen sie final geprüft und vervollständigt werden.

Besonders prüfen:

- Anbieterangaben
- Kontaktangaben
- Hosting
- Supabase-Speicherung
- Google Fonts
- jsDelivr/CDN-Nutzung
- localStorage-Hinweise

## Vor GitHub-Veröffentlichung

- Supabase Row-Level Security prüfen.
- Amazon-Link final eintragen.
- Impressum und Datenschutz finalisieren.
- PDF-Download-Platzhalter ersetzen oder bewusst ausgeblendet lassen.
