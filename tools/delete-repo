#!/bin/bash

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Repository-Name (z. B. test1)
repoName=$1

if [ -z "$repoName" ]; then
    echo -e "${RED}❗️Bitte gib den Repository-Namen an (z. B. delete_repo.sh test1)${NC}"
    exit 1
fi

# Fragen zur lokalen Löschung
read -r -p "📁 Lokales Verzeichnis ~/Documents/code/bash/$repoName löschen? (j/n): " deleteLocal
if [[ "$deleteLocal" == [Jj] ]]; then
    rm -rf ~/Documents/code/bash/"$repoName"
    echo -e "${GREEN}✅ Lokal gelöscht: $repoName${NC}"
else
    echo -e "${NC}⏭ Lokal beibehalten"
fi

# Fragen zur GitHub-Löschung
read -r -p "🌐 GitHub Repo 'RusmirOmerovic/$repoName' löschen? (j/n): " deleteRemote
if [[ "$deleteRemote" == [Jj] ]]; then
    gh repo delete RusmirOmerovic/"$repoName"
    echo -e "${GREEN}✅ GitHub-Repository gelöscht: $repoName${NC}"
else
    echo -e "${NC}⏭ GitHub-Repo bleibt bestehen"
fi
