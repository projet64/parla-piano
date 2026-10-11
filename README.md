# Parla piano

L'italien oral, à ton rythme. Appli web installable (PWA) : pillola du jour, scènes jouées à voix haute, écoute normale/lente, micro pour vérifier la prononciation, progression synchronisée.

## Lancer en local
```
npm install
npm start   # http://localhost:3000
```
Sans `DATABASE_URL`, la progression est gardée en mémoire.

## Déploiement Railway
- Service Node relié à ce dépôt (`npm start`).
- Ajouter une base PostgreSQL et la variable `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
- Optionnel : `APP_KEY` pour protéger l'API de progression.

## Ajouter une scène
Dans `public/data.js`, ajouter une entrée dans `SCENES` (même structure que `ristorante`) et retirer son nom de `SOON`. Penser à incrémenter `CACHE` dans `public/sw.js`.
