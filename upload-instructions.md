
# Instructions d'upload FTP pour jjmecanique.ca

## ⚠️ IMPORTANT : Fichiers à uploader

Après la compilation, **uploadez UNIQUEMENT le contenu du dossier `dist/`**, PAS le dossier `dist/` lui-même.

### Étape 1 : Vérifier la compilation
- Le dossier `dist/` doit maintenant contenir :
  - `index.html`
  - `assets/` (avec fichiers CSS et JS compilés)
  - `.htaccess` (pour la configuration Apache)

### Étape 2 : Upload FTP
1. **Connectez-vous à votre FTP** (jjmecanique.ca)
2. **Naviguez vers le dossier racine** (généralement `public_html/` ou `www/`)
3. **Supprimez les anciens fichiers** sources si présents
4. **Uploadez TOUT le contenu du dossier `dist/`** :
   ```
   dist/index.html → public_html/index.html
   dist/assets/ → public_html/assets/
   dist/.htaccess → public_html/.htaccess
   ```

### Étape 3 : Vérification
- Visitez https://jjmecanique.ca/
- Le site doit maintenant s'afficher correctement
- Testez la navigation entre les pages

## 🚨 À NE PAS faire
- ❌ Ne pas uploader les fichiers sources (`src/`, `package.json`, etc.)
- ❌ Ne pas uploader le dossier `node_modules/`
- ❌ Ne pas uploader le dossier `dist/` entier, mais son CONTENU

## ✅ Structure finale sur le serveur
```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── [autres assets]
```

## Configuration hébergement
- **Type de site** : Site statique (HTML/CSS/JS)
- **Pas de PHP requis** pour ce projet React compilé
- **Le fichier `.htaccess`** gère le routage des pages React
