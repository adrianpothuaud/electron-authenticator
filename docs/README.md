# Documentation Electron Authenticator

Ce dossier contient la documentation complète du projet Electron Authenticator, construite avec [VitePress](https://vitepress.dev/).

## 🚀 Développement local

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
cd docs
npm install
```

### Serveur de développement
```bash
npm run docs:dev
```
Le site sera accessible sur http://localhost:5173

### Build de production
```bash
npm run docs:build
```
Les fichiers seront générés dans `.vitepress/dist/`

### Prévisualisation du build
```bash
npm run docs:preview
```

## 📁 Structure

```
docs/
├── .vitepress/          # Configuration VitePress
│   └── config.js        # Configuration principale
├── guide/               # Guide utilisateur
│   ├── installation.md
│   ├── getting-started.md
│   ├── configuration.md
│   └── security.md
├── api/                 # Documentation API
│   └── index.md
├── announcements/       # Annonces et actualités
│   └── index.md
├── public/              # Assets statiques
├── index.md             # Page d'accueil
└── package.json         # Dépendances
```

## ✏️ Contribuer à la documentation

### Ajouter une nouvelle page

1. Créez un fichier `.md` dans le dossier approprié
2. Ajoutez la page à la sidebar dans `.vitepress/config.js`
3. Utilisez le front matter pour les métadonnées :

```yaml
---
title: Titre de la page
description: Description pour le SEO
---
```

### Conventions d'écriture

- **Titres** : Utilisez # pour h1, ## pour h2, etc.
- **Code** : Utilisez des blocs de code avec syntaxe highlighting
- **Alertes** : Utilisez les containers VitePress (tip, warning, danger)
- **Liens** : Préférez les liens relatifs pour la navigation interne

### Exemples de formatting

#### Blocs de code
```javascript
const code = generateTOTP(secret);
console.log(code);
```

#### Alertes
::: tip Conseil
Utilisez des mots de passe forts pour sécuriser votre compte.
:::

::: warning Attention
Cette fonctionnalité est expérimentale.
:::

::: danger Important
Ne partagez jamais vos clés secrètes 2FA.
:::

#### Tableau
| Plateforme | Support | Notes |
|------------|---------|-------|
| Windows    | ✅      | Windows 10+ |
| macOS      | ✅      | macOS 10.14+ |
| Linux      | ✅      | Ubuntu 18.04+ |

## 🔧 Configuration VitePress

La configuration se trouve dans `.vitepress/config.js` :

- **Navigation** : Menu principal et sidebar
- **Thème** : Couleurs et apparence
- **SEO** : Métadonnées et Open Graph
- **Fonctionnalités** : Recherche, PWA, etc.

## 📈 Métriques et Analytics

Pour ajouter Google Analytics ou Plausible :

```javascript
// Dans .vitepress/config.js
export default defineConfig({
  head: [
    ['script', { 
      async: true, 
      src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID' 
    }]
  ]
})
```

## 🚀 Déploiement

La documentation est automatiquement déployée sur GitHub Pages via GitHub Actions :

- **Déclencheur** : Push sur main/master ou changements dans `/docs`
- **URL** : https://your-username.github.io/electron-authenticator/
- **Workflow** : `.github/workflows/docs.yml`

### Configuration GitHub Pages

1. Allez dans Settings > Pages
2. Sélectionnez "GitHub Actions" comme source
3. Le workflow `docs.yml` se chargera du reste

## 🔍 Tests et validation

### Test des liens
```bash
npm install -g markdown-link-check
find . -name "*.md" -exec markdown-link-check {} \;
```

### Validation du build
```bash
npm run docs:build
npm run docs:preview
```

## 📝 TODO

- [ ] Ajouter plus d'exemples d'API
- [ ] Créer des tutoriels vidéo
- [ ] Traduire en anglais
- [ ] Ajouter un glossaire des termes 2FA
- [ ] Intégrer un système de commentaires

---

Pour toute question sur la documentation, créez une issue ou contactez l'équipe de développement.