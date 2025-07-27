#!/bin/bash

# Name: sync-repo
# Beschreibung: Synchronisiert main → testing → develop

echo "🔄 Synchronisiere Branches: main → testing → develop"

# Step 1: main aktualisieren
echo "📥 Hole neuesten Stand von main..."
git checkout main && git pull || { echo "❌ Fehler bei main"; exit 1; }

# Step 2: main → testing
echo "🔀 Merging main → testing..."
git checkout testing && git merge main && git push || { echo "❌ Fehler bei testing"; exit 1; }

# Step 3: testing → develop
echo "🔀 Merging testing → develop..."
git checkout develop && git merge testing && git push || { echo "❌ Fehler bei develop"; exit 1; }

echo "✅ Synchronisierung abgeschlossen!"

