import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name("phrase-bank-overview.tex")

FILES = [
    ("Woche 1 · Sicher starten", ROOT / "data/phrases/week1-core.csv"),
    ("Woche 2 · Professioneller klingen", ROOT / "data/phrases/week2-core.csv"),
    ("Woche 3 · Flexibel reagieren", ROOT / "data/phrases/week3-core.csv"),
    ("Woche 4 · Im Meeting anwenden", ROOT / "data/phrases/week4-core.csv"),
]

def tex(value):
    value = (value or "").strip()
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
        "…": r"\ldots{}",
        "—": "--",
        "–": "--",
        "’": "'",
        "“": "``",
        "”": "''",
    }
    for src, target in replacements.items():
        value = value.replace(src, target)
    return value

lines = [
    r"\documentclass[10pt]{article}",
    r"\input{common.tex}",
    r"\begin{document}",
    r"\coverblock{Woche 1--4 · Abruf-Workbook}{Core-Phrasen Workbook}{172 Business-English-Phrasen zum Abdecken, Abrufen und Wiederholen}",
    r"\callout{So trainierst du mit dem Kartenlayout: Lies zuerst nur die deutsche Aufgabe. Decke die englische Lösung mit einem Zettel, deiner Hand oder einem zweiten Blatt ab. Formuliere die englische Phrase laut aus dem Kopf. Erst danach prüfst du die Lösung und markierst schwierige Karten.}",
    r"\accentcard{Warum Kartenlayout?}{Dieses Workbook ist nicht zum passiven Durchlesen gedacht. Es folgt dem Coach-Prinzip: Deutsch sehen, Englisch abrufen, Lösung prüfen. Für eigene Listen, Anki, Excel oder Notion sind die CSV-Dateien besser geeignet.}",
]

for title, path in FILES:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    lines.append(rf"\safechapter{{{tex(title)} · {len(rows)} Phrasen}}")
    for row in rows:
        de = tex(row.get("deutsch", ""))
        en = tex(row.get("englisch", ""))
        lines.append(rf"\phraseitem{{{de}}}{{{en}}}")

lines.extend([
    r"\brandfooter",
    r"\end{document}",
])

OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
