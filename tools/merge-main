#!/bin/bash
# merge-main.sh

set -e

if [[ $(git branch --show-current) != "testing" ]]; then
  echo "❗ Du befindest dich nicht im Branch 'testing'. Bitte wechsle mit:"
  echo "   git checkout testing"
  exit 1
fi

push

git checkout main

git merge testing --no-ff -m "🔀 Merge testing → main (Produktionsfreigabe)"

if [ -f .github/workflows/preview.yml ]; then
  git rm .github/workflows/preview.yml
  git commit -m "🧹 Entferne preview.yml im main-Branch"
fi

git push origin main

git checkout testing

echo "✅ Merge testing → main abgeschlossen und 'preview.yml' entfernt."

