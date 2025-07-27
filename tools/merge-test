#!/bin/bash
# merge-test.sh

# Merge develop -> testing

set -e

if [[ $(git branch --show-current) != "develop" ]]; then
  echo "❗ Befindest du dich im Branch 'develop'? wenn nicht: 'git checkout develop' eingeben."
  exit 1
fi

# Push sicherstellen
push

# Wechseln
git checkout testing

git merge develop --no-ff -m "🔀 Merge develop into testing"

git push origin testing

git checkout develop

echo "✅ Merge develop → testing abgeschlossen."
