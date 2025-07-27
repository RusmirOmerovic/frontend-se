# 🧰 se-tools – GitHub Bash-Toolset für SE-Projekte

Mit diesem Repository richtest du dein Terminal so ein, dass du in wenigen Sekunden 
neue GitHub-Projekte aufsetzen, pushen, mergen und verwalten kannst – inkl. automatischer GitHub Pages-Veröffentlichung.

---

## 🚀 Funktionen

✅ Neues Projekt aus Template anlegen (`newproject beispielProjekt`)  
✅ Automatischer Commit & Push (`push`)  
✅ Merge-Workflows: `develop ➝ testing ➝ main` (`mergetest`, `mergemain`)  
✅ GitHub Pages Deploy inklusive (für main & testing Branch)  
✅ Token-Verwaltung mit Ablaufprüfung (80 Tage)  
✅ Löschen von lokalen & GitHub-Repositories (`deleterepo`)  
✅ Schnellstart in unter 5 Minuten

---

## ⚙️ Setup in 3 Schritten

### 1. Tools klonen & aktivieren

```bash
git clone https://github.com/RusmirOmerovic/se-tools.git ~/Bash
chmod +x ~/Bash/*.sh
```

### 2. Terminal einrichten (einmalig)

Öffne deine `.zshrc` oder `.bashrc` (z.B. mit open .zshrc/.bashrc) und füge am Ende folgende Zeilen hinzu:

```bash
export PATH="$HOME/Bash:$PATH"

alias newproject="bash ~/Bash/newproject.sh"
alias push="bash ~/Bash/pushrepo.sh"
alias deleterepo="bash ~/Bash/delete_repo.sh"
alias mergetest="bash ~/Bash/merge-test.sh"
alias mergemain="bash ~/Bash/merge-main.sh"
```

Dann:
```bash
source ~/.zshrc  # oder ~/.bashrc
```

### 🔐 GitHub Token – automatisch verwaltet

Beim ersten Aufruf von `newproject` wirst du automatisch nach deinem GitHub Token gefragt.  
Das Token wird sicher in `~/.config/se-tools/gh_token.txt` gespeichert (Zugriff nur für dich – `chmod 600`).

➡️ Gültigkeit: 80 Tage – danach wirst du zur Eingabe eines neuen Tokens aufgefordert.
👉 Du findest dein Token in deinem GitHub-Account unter Settings → Developer Settings → Personal Access Tokens. 

---

## 📦 Projekt starten

```bash
newproject demo
cd demo
push
```

➡️ Deine Live-Vorschau findest du unter:  
`https://<dein-user>.github.io/<projektname>/`
Beispiel: https://rusmiromerovic.github.io/demo

---

## 📘 Mehr Details?

👉 [setup.md](setup.md)

---

## 🧑‍💻 Getestet mit

- macOS mit zsh
- Linux (Ubuntu)
- GitHub CLI & Pages
- Git Bash (Windows)

---

## 📄 Lizenz

MIT – frei nutzbar, anpassbar und erweiterbar.
