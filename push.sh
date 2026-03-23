#!/bin/bash
# 🚀 BE4W Hub - Auto Git Push Script
# Automatically commits and force-pushes changes to GitHub
# Token wird gespeichert (sicher in .git/config)

set -e  # Exit on error

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================="
echo "🚀 BE4W Hub - Git Push Script"
echo "========================================="
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check if we're in a git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Nicht in einem Git Repository!${NC}"
    echo "Bitte laufe dieses Script im business-english-hub Ordner aus."
    exit 1
fi

# 2. Check git status
echo -e "${BLUE}📋 Git Status:${NC}"
git status --short
echo ""

# 3. Ask for commit message
echo -e "${YELLOW}💬 Commit Message:${NC}"
if [ -z "$1" ]; then
    read -p "Gib eine Commit-Nachricht ein: " COMMIT_MSG
else
    COMMIT_MSG="$1"
fi

if [ -z "$COMMIT_MSG" ]; then
    echo -e "${RED}❌ Keine Commit-Nachricht eingegeben!${NC}"
    exit 1
fi

# 4. Check for GitHub token in git config
echo ""
echo -e "${BLUE}🔐 Überprüfe GitHub-Token...${NC}"

# Try to get token from git config
TOKEN=$(git config --local github.token 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Kein GitHub Token gespeichert!${NC}"
    echo ""
    echo "Token einrichten:"
    echo "1. Gehe zu: https://github.com/settings/tokens"
    echo "2. Erstelle neuen Token (repo scope)"
    echo "3. Speichere ihn hier:"
    echo ""
    read -sp "GitHub Personal Access Token eingeben: " TOKEN
    echo ""
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ Token erforderlich!${NC}"
        exit 1
    fi
    
    # Ask to save token
    read -p "Token lokal speichern? (j/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        git config --local github.token "$TOKEN"
        echo -e "${GREEN}✅ Token gespeichert in .git/config${NC}"
        echo "   (Nur auf diesem Computer, nicht im Repo!)"
    fi
else
    echo -e "${GREEN}✅ Token gefunden${NC}"
fi

# 5. Configure git with token (temporary)
GIT_USER="edallmend-creator"
GIT_URL="https://${GIT_USER}:${TOKEN}@github.com/edallmend-creator/business-english-hub.git"

# 6. Add all changes
echo ""
echo -e "${BLUE}📦 Staging changes...${NC}"
git add -A
echo -e "${GREEN}✅ Alle Änderungen staged${NC}"

# 7. Commit
echo ""
echo -e "${BLUE}💾 Committing...${NC}"
git commit -m "$COMMIT_MSG" || {
    echo -e "${RED}❌ Commit fehlgeschlagen (vielleicht keine Änderungen?)${NC}"
    exit 1
}
echo -e "${GREEN}✅ Commit erstellt${NC}"

# 8. Force push
echo ""
echo -e "${YELLOW}⚠️  Force-Pushing zu GitHub...${NC}"
git push -f "$GIT_URL" main --quiet && {
    echo -e "${GREEN}✅ Force-Push erfolgreich!${NC}"
    echo ""
    echo -e "${BLUE}📊 Live auf:${NC}"
    echo "   https://hub.shortcutenglish.de/"
    echo ""
    echo -e "${GREEN}✅ Alles fertig!${NC}"
} || {
    echo -e "${RED}❌ Push fehlgeschlagen!${NC}"
    echo "Überprüfe:"
    echo "- GitHub-Token ist korrekt?"
    echo "- Netzwerk-Verbindung OK?"
    echo "- GitHub ist erreichbar?"
    exit 1
}

