#!/bin/bash

# 🎵 AUDIO SETUP CHECKER
# Überprüft ob alle Audio-Dateien vorhanden sind

echo "🔍 Checking Audio Setup..."
echo ""

# Check if audio folder exists
if [ ! -d "audio" ]; then
    echo "❌ audio/ Ordner nicht gefunden!"
    echo "   Erstelle ihn mit: mkdir audio"
    echo "   Kopiere deine MP3s nach: audio/w1/us/, audio/w1/uk/, etc."
    exit 1
fi

echo "✅ audio/ Ordner gefunden"
echo ""

# Check structure
for week in w1 w2 w3 w4; do
    for accent in us uk; do
        path="audio/$week/$accent"
        
        if [ ! -d "$path" ]; then
            echo "❌ Ordner fehlt: $path"
        else
            count=$(ls -1 "$path"/*.mp3 2>/dev/null | wc -l)
            echo "✅ $path: $count MP3 Dateien"
        fi
    done
done

echo ""
echo "📊 Gesamtübersicht:"
total=$(find audio -name "*.mp3" 2>/dev/null | wc -l)
echo "   Insgesamt: $total MP3 Dateien"

expected=344  # 172 Karten × 2 Accents
if [ "$total" -eq "$expected" ]; then
    echo "   🎉 PERFEKT! Alle $expected Dateien vorhanden!"
elif [ "$total" -lt "$expected" ]; then
    missing=$((expected - total))
    echo "   ⚠️  Es fehlen $missing Dateien (erwartet: $expected)"
else
    extra=$((total - expected))
    echo "   ℹ️  $extra extra Dateien (erwartet: $expected)"
fi

echo ""
echo "🧪 Test-URLs (öffne im Browser wenn Server läuft):"
echo "   http://localhost:9001/audio/w1/us/w1_001.mp3"
echo "   http://localhost:9001/audio/w2/uk/w2_001.mp3"

echo ""
echo "✅ Check abgeschlossen!"
