# ELEVENLABS API FÜR SHADOWING

## 🎯 ZIEL
Audio-Dateien für alle W3 Phrasen generieren mit ElevenLabs API.

## 📋 SCHRITTE

### 1. API KEY HOLEN
```
1. Gehe zu: https://elevenlabs.io
2. Signup/Login
3. Settings → API Keys
4. Copy API Key
```

### 2. PYTHON SCRIPT ERSTELLEN
```python
import requests
import csv
import os

# Config
API_KEY = "dein_api_key_hier"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel (American)
# Oder: "pNInz6obpgDQGcFmaJgB"  # Adam (British)

CSV_FILE = "data/week3-core.csv"
OUTPUT_DIR = "audio/w3"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load phrases
with open(CSV_FILE, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    phrases = list(reader)

# Generate audio for each phrase
for i, row in enumerate(phrases, 1):
    english = row['englisch'] or row['english']
    
    print(f"[{i}/{len(phrases)}] Generating: {english}")
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    }
    
    data = {
        "text": english,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        filename = f"w3_{i:03d}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✓ Saved: {filename}")
    else:
        print(f"  ✗ Error: {response.status_code}")

print(f"\n✅ Done! Generated {len(phrases)} audio files")
```

### 3. SCRIPT AUSFÜHREN
```bash
pip install requests
python generate_audio.py
```

### 4. AUDIO IN HUB INTEGRIEREN

**A) Audio-Dateien hochladen:**
```
1. Alle MP3s in Google Drive hochladen
2. Ordner: /audio/w3/
3. Sharing: Public (view only)
```

**B) CSV erweitern:**
```csv
englisch,deutsch,beispiel,notizen,audio_url
"Let's circle back on this","Lass uns darauf zurückkommen",...,"https://drive.google.com/uc?id=..."
```

**C) Shadowing aktivieren:**
```javascript
// In index.html, Woche 3:
<button class="btn-primary" onclick="openExercise('shadowing','w3_phrases')">
  ▶ Starten
</button>
```

## 💰 KOSTEN

ElevenLabs Pricing:
- Free Tier: 10.000 characters/month
- Starter: $5/month → 30.000 characters/month
- Creator: $22/month → 100.000 characters/month

**Für W3 (ca. 45 Phrasen à 50 chars):**
- ~2.250 characters
- = Free Tier reicht! ✅

## 🎙️ VOICE OPTIONS

**American:**
- Rachel (female, young)
- Adam (male, deep)

**British:**
- George (male, British)
- Charlotte (female, British)

**Empfehlung:** Rachel (American, clear, professional)

## 🔧 ALTERNATIVEN

Wenn du NICHT ElevenLabs nutzen willst:

1. **Google Cloud Text-to-Speech**
   - Sehr natürlich
   - $4 per 1M characters
   - Viele Stimmen

2. **AWS Polly**
   - Gut für Business
   - $4 per 1M characters
   - Neural voices

3. **Microsoft Azure TTS**
   - Sehr natürlich
   - $15 per 1M characters
   - Viele Sprachen

**ABER:** ElevenLabs ist am besten für Englisch! 🎯
