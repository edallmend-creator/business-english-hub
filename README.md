# Business English Hub

Digitaler Begleiter zu **Business English in 4 Wochen**. Der Hub ergänzt das Buch mit aktivem Phrasentraining, Coach-Sessions, Audio, CSV-Downloads und zwei PDF-Workbooks.

Live-Domain:

- `https://hub.shortcutenglish.de/start.html`

GitHub-Repository:

- `git@github.com:edallmend-creator/business-english-hub.git`

## Zweck des Projekts

Das Buch erklärt Methode und Lernlogik. Der Hub ist für Anwendung und Wiederholung gedacht:

- Phrasen aktiv abrufen statt nur lesen.
- Deutsch sehen, Englisch formulieren, Lösung prüfen.
- Audio nutzen und laut nachsprechen.
- Fortschritt über einen persönlichen Code wiederherstellen.
- CSVs für eigene Listen, Anki, Excel oder Notion verwenden.
- PDFs für Offline-Abruftraining, Abdecken, Markieren und Meeting-Vorbereitung nutzen.

## Wichtige Seiten

- `start.html`: öffentliche Einstiegsseite und Erklärung des Hubs.
- `index.html`: Kurs-Hub mit Wochenplan, Login-Gate, Downloads und Bonusbereich.
- `coach.html`: eigener Trainingscoach für Phrasen und Spaced Repetition.
- `downloads.html`: Materialbibliothek mit PDFs und CSVs.
- `faq.html`: häufige Fragen.
- `feedback.html`: neutrale Seite für Amazon-Rezension oder Feedback/Problem melden.
- `impressum.html`: Anbieterkennzeichnung.
- `datenschutz.html`: Datenschutzerklärung.

## Projektstruktur

```text
.
├── audio/                 # MP3-Dateien für US/UK-Audio im Coach
├── css/                   # Styling nach Bereichen
├── data/                  # CSV/JSON-Daten, PDFs und Deck-Dateien
├── docs/                  # Pflege-, Launch- und Supabase-Dokumentation
├── images/                # Bilder und Icons
├── js/                    # App-Logik, Coach, Sync, Feedback, Navigation
├── materials/pdf-src/     # LaTeX-Quellen und Generator für PDFs
├── start.html             # Einstieg
├── index.html             # Kurs-Hub
└── coach.html             # Coach
```

Mehr Details stehen in:

- `docs/CONTENT_STRUCTURE.md`
- `docs/SUPABASE_LAUNCH_CHECKLIST.md`
- `CODE_ARCHITECTURE.md`

## Lokal starten

Im Projektordner:

```bash
python3 server-nocache.py
```

Dann öffnen:

```text
http://localhost:9001/start.html
```

Falls `server-nocache.py` nicht verwendet werden soll:

```bash
python3 -m http.server 9001
```

## Login und Fortschritt

- Das Login-Gate wird in `js/auth.js` gesteuert.
- Das Hub-Passwort steht dort als `PASSWORD`.
- Nach dem ersten Login erzeugt `js/sync.js` automatisch einen persönlichen Fortschritts-Code, z. B. `swift-48291`.
- Der Code wird im Willkommensfenster angezeigt und bleibt oben rechts abrufbar.
- Alte Codes bleiben gültig, weil sie im Browser-localStorage gespeichert werden.

Gespeichert werden nur Lernfortschritt und Einstellungen, keine Namen oder E-Mail-Adressen.

## Supabase

Supabase wird für geräteübergreifenden Lernfortschritt genutzt.

Aktive Frontend-Datei:

- `js/sync.js`

Tabellen laut aktueller App:

- `user_progress`
- `card_reviews`
- `session_log`

Vor Livegang oder nach Supabase-Änderungen prüfen:

- `docs/SUPABASE_LAUNCH_CHECKLIST.md`
- `docs/SUPABASE_CODE_SYNC_RPC.sql`

Wichtig: Der öffentliche Supabase-Anon-Key im Frontend ist kein Secret. Direkter Tabellenzugriff soll durch RLS und entzogene Tabellenrechte blockiert bleiben. Der Hub synchronisiert über kontrollierte RPC-Funktionen, bei denen der Fortschritts-Code den Lernstand lädt und speichert.

## Inhalte pflegen

### Core-Phrasen

Die Core-Phrasen liegen unter:

- `data/phrases/week1-core.csv`
- `data/phrases/week2-core.csv`
- `data/phrases/week3-core.csv`
- `data/phrases/week4-core.csv`

Diese Dateien sind auch Quelle für das Core-Phrasen-PDF.

### Branchen-Phrasen

Die Branchen-Decks liegen doppelt vor:

- `data/niche-*.csv`: Coach-/App-Daten.
- `data/phrases/niche-*.csv`: Download-Kopien.

Bei Änderungen beide Varianten synchron halten.

Didaktische Regel: Branchen-Phrasen trainieren vollständige Satzbausteine, keine Einzelwörter. Die deutsche Abruf-Aufgabe sollte das englische Zielwort nicht durch Denglisch verraten.

### Feedback und Amazon-Link

Zentrale Konfiguration:

- `js/site-config.js`

Wichtig: Der Review-/Feedback-Flow bleibt neutral. Keine Sterne-Vorauswahl, kein Review-Gating und keine positive/negative Verzweigung.

## PDF-Materialien

Fertige PDFs:

- `data/pdfs/phrase-bank-overview.pdf`
- `data/pdfs/bonus-workbook.pdf`

Quellen:

- `materials/pdf-src/common.tex`
- `materials/pdf-src/bonus-workbook.tex`
- `materials/pdf-src/generate_phrase_bank.py`
- `materials/pdf-src/phrase-bank-overview.tex`

PDFs neu bauen:

```bash
cd materials/pdf-src
python3 generate_phrase_bank.py
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="../../data/pdfs" phrase-bank-overview.tex
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="../../data/pdfs" bonus-workbook.tex
```

Danach `.aux`/`.log`-Dateien in `data/pdfs/` nicht committen.

## Tests und Checks vor Commit

Schnelle Syntaxchecks:

```bash
node --check js/sync.js
node --check js/auth.js
node --check js/flashcards.js
node --check js/coach.js
node --check js/coach-sync.js
node --check js/navigation.js
node --check js/feedback.js
python3 -m json.tool data/qr-links.json >/dev/null
```

Lokalen Linkcheck ausführen:

```bash
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
import sys, urllib.parse
class LinkParser(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self, tag, attrs):
        for k,v in attrs:
            if k in ('href','src') and v: self.links.append(v)
root=Path('.')
missing=[]
for html in sorted(root.glob('*.html')):
    p=LinkParser(); p.feed(html.read_text(encoding='utf-8'))
    for link in p.links:
        if link.startswith(('http://','https://','mailto:','#','javascript:','data:')): continue
        target=urllib.parse.urlparse(link).path
        if target and not (root/target).exists(): missing.append((html.name, link))
if missing:
    for m in missing: print('MISSING', *m)
    sys.exit(1)
print('HTML local links resolve')
PY
```

PDFs lokal prüfen:

```bash
curl -I http://localhost:9001/data/pdfs/phrase-bank-overview.pdf
curl -I http://localhost:9001/data/pdfs/bonus-workbook.pdf
```

## Deployment

Deployment läuft über GitHub Pages und den `main`-Branch.

Custom Domain:

- `CNAME` enthält `hub.shortcutenglish.de`.

Typischer Ablauf:

```bash
git status
git add .
git commit -m "Kurze Beschreibung"
git push
```

GitHub Pages aktualisiert die Live-Seite danach automatisch. Änderungen sind meist nach wenigen Minuten sichtbar.

## Nach Änderungen live prüfen

- `https://hub.shortcutenglish.de/start.html`
- `https://hub.shortcutenglish.de/index.html`
- `https://hub.shortcutenglish.de/coach.html`
- `https://hub.shortcutenglish.de/downloads.html`
- PDF-Downloads in `downloads.html`
- Audio im Coach, mindestens je eine US- und UK-Datei
- Fortschritts-Code im Login-/Welcome-Flow

## Wichtige Vorsichtspunkte

- Keine Service-Role-Keys oder Secrets ins Frontend committen.
- Supabase-Anon-Key ist okay, Service-Role-Key niemals.
- Rechtliche Seiten vor öffentlicher Nutzung final prüfen lassen.
- `push.sh`, alte Restore-Anleitungen oder temporäre Build-Dateien nicht wieder einführen.
- Alte Nutzer behalten ihren localStorage-Code; Code-Formatänderungen nicht automatisch migrieren.
