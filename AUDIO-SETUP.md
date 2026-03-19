# 🎵 AUDIO SETUP - LOKALE INTEGRATION

## ✅ STATUS: FERTIG & BEREIT!

Der Coach ist bereits vollständig für **lokale Audio-Dateien** konfiguriert!

---

## 📂 AUDIO ORDNER STRUKTUR

Deine Audio-Dateien müssen in folgendem Format vorliegen:

```
be4w-hub/
└── audio/
    ├── w1/
    │   ├── us/
    │   │   ├── w1_001.mp3
    │   │   ├── w1_002.mp3
    │   │   ├── ...
    │   │   └── w1_045.mp3
    │   └── uk/
    │       ├── w1_001.mp3
    │       ├── w1_002.mp3
    │       ├── ...
    │       └── w1_045.mp3
    ├── w2/
    │   ├── us/
    │   │   ├── w2_001.mp3
    │   │   └── ... (58 Dateien)
    │   └── uk/
    │       └── ...
    ├── w3/
    │   ├── us/
    │   │   └── ... (49 Dateien)
    │   └── uk/
    │       └── ...
    └── w4/
        ├── us/
        │   └── ... (20 Dateien)
        └── uk/
            └── ...
```

**WICHTIG:**
- Dateinamen MÜSSEN dem Format folgen: `w{week}_{number}.mp3`
- Nummern MÜSSEN 3-stellig sein (001, 002, etc.)
- Ordnerstruktur MUSS exakt so sein!

---

## 🚀 INSTALLATION

### Option 1: Audio-Ordner bereits vorhanden

```bash
# Kopiere deinen fertigen audio-Ordner in den Hub
cp -r /pfad/zu/deinem/audio ~/Projekte/be4w-hub/

# Fertig! Starte Server
cd ~/Projekte/be4w-hub
python3 server-nocache.py
```

### Option 2: Audio-Dateien aus Google Drive

```bash
# 1. Download Drive-Ordner als ZIP
# 2. Entpacke in be4w-hub/
unzip audio.zip -d ~/Projekte/be4w-hub/

# 3. Stelle sicher die Struktur stimmt
ls ~/Projekte/be4w-hub/audio/w1/us/
# Sollte zeigen: w1_001.mp3, w1_002.mp3, ...

# 4. Starte Server
cd ~/Projekte/be4w-hub
python3 server-nocache.py
```

---

## 🧪 TESTING

### Test 1: Check Audio-Ordner
```bash
cd ~/Projekte/be4w-hub
ls -la audio/w1/us/ | head -10
# Sollte zeigen: w1_001.mp3, w1_002.mp3, etc.
```

### Test 2: Server starten & Audio testen
```bash
python3 server-nocache.py
# Browser: http://localhost:9001
# Login: english2025
# Coach → W1 Core
# Klicke 🔊 Button → Audio sollte abspielen!
```

---

## 🚀 DEPLOYMENT (GitHub Pages)

```bash
cd ~/Projekte/be4w-hub

# Add audio
git add audio/

# Commit
git commit -m "✨ Add local audio files"

# Push
git push origin main
```

**Fertig!** Audio funktioniert auf GitHub Pages! 🎉

---

**VIEL ERFOLG!** 🚀✨
