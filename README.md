# html-template-se

Ein GitHub-Template zur Beschleunigung von SE-Projekten.  
Beinhaltet eine Beispielausgabe, automatische Vorschau (Preview) mit Tests, CI/CD-Setup, GitHub Pages Deploy und optionale Bash-Tools zur Automatisierung.

---

## 🚀 Features

- 📁 Struktur: `src/`, `tests/`, `docs/`, `.github/`
- 🚀 Automatisches Deployment (GitHub Pages für main & testing)
- 🧪 Automatische HTML-Validierung im `testing`-Branch
- 🧩 CI/CD-Workflows via GitHub Actions
- 🖥️ Live-Vorschau aus dem `testing`-Branch (preview.yml)
- 🧰 Kompatibel mit Bash-Tool `newproject` für 1-Klick-Klon
- 🔐 Token-Setup und Pages-Aktivierung über `setup-token`

---

## 🧪 CI/CD-Workflow

| Branch      | Test           | Deploy            | Ziel-Link                                   |
|-------------|----------------|-------------------|---------------------------------------------|
| `develop`   | 🔄 Entwicklung | ❌                | –                                           |
| `testing`   | ✅ HTML-Check  | ✅ Vorschau live   | `https://<user>.github.io/<projekt>/`       |
| `main`      | ❌             | ✅ Produktion live | `https://<user>.github.io/<projekt>/`       |

> ⚠️ Nur getesteter Code aus `testing` wird in `main` übernommen!

---

## 🧪 Test-Infrastruktur

Beim Push in den `testing`-Branch wird automatisch geprüft:

- ✅ HTML-Syntax (via `htmlhint`)
- [optional] 🔗 Broken-Link-Check (kommt bald)
- [optional] 🎨 CSS-Lint / 🧠 JS-Lint
- [optional] 💡 Lighthouse-Audit (Performance, SEO, A11y)

---

## ⚙️ Automatischer Setup (empfohlen)

Nutze das Companion-Repo [se-tools](https://github.com/RusmirOmerovic/se-tools) für:

- 📦 Projekt starten mit `newproject`
- 🔐 Token setzen mit `setup-token`
- 📤 Push & Deployment mit `push`
- 🗑️ Projekt löschen mit `deleterepo`

---

## 🖼️ Live-Demo (Preview-Modus)

Sobald GitHub Pages für `preview` aktiviert ist:  
➡️ `https://<dein-user>.github.io/<projektname>/`

---

## 🧪 Beispiel-Workflow für Tests + Vorschau

```yaml
# .github/workflows/preview.yml

on:
  push:
    branches: [ testing ]

jobs:
  test-and-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g htmlhint
      - run: htmlhint index.html || exit 1
      - run: mkdir public && cp index.html public/
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
          publish_branch: preview

