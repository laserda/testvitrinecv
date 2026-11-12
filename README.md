# Cv en Ligne

Site vitrine statique de CV en ligne (React, Vite).

Site statique : pas de base de données, pas de serveur applicatif. Interface en français et en
anglais, fuseau horaire `Africa/Abidjan`, monnaie FCFA (XOF), dates au format JJ/MM/AAAA.

## Prérequis

- **Node.js LTS 24.22.3** (version figée dans `.nvmrc` et `engines` de `package.json`).
  Avec nvm : `nvm install && nvm use` (nvm-windows : `nvm install 24.22.3 && nvm use 24.22.3`).
- **npm 11** (fourni avec Node 24). Le fichier `package-lock.json` est commité : utiliser `npm ci`.
- **Git** (les hooks de pré-commit s'installent automatiquement, voir plus bas).
- **Docker** (facultatif) pour lancer le site comme en production.

## Installation en local

```bash
git clone https://github.com/laserda/testvitrinecv.git
cd testvitrinecv
cp .env.example .env   # facultatif : valeurs par défaut utilisables telles quelles
npm ci                 # installe les versions exactes du package-lock.json + hooks Git
```

## Serveur de développement

```bash
npm run dev
```

Ouvrir <http://localhost:5173>. La page d'accueil affiche un texte d'exemple en français ; le
sélecteur « Français / English » bascule l'interface en anglais.

## Scripts

| Commande                | Rôle                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm run dev`           | Serveur de développement Vite                                           |
| `npm run build`         | Vérification TypeScript puis build statique dans `dist/`                |
| `npm run preview`       | Sert le build `dist/` en local                                          |
| `npm test`              | Tests unitaires (Vitest) **puis** tests de bout en bout (Playwright)    |
| `npm run test:unit`     | Tests unitaires seuls                                                   |
| `npm run test:e2e`      | Tests de bout en bout seuls (démarre le serveur de dev automatiquement) |
| `npm run lint`          | ESLint (aucun avertissement toléré)                                     |
| `npm run format`        | Formate le code avec Prettier                                           |
| `npm run format:check`  | Vérifie le formatage sans modifier                                      |
| `npm run typecheck`     | Vérification TypeScript stricte (`tsc -b`)                              |
| `npm run check:secrets` | Recherche de secrets en clair dans le dépôt                             |

Avant le premier `npm run test:e2e`, installer le navigateur de Playwright :

```bash
npx playwright install --with-deps chromium
```

## Tests

- Unitaires (`src/**/*.test.ts`, `scripts/**/*.test.ts`) : validation des formulaires,
  échappement XSS, journalisation sans donnée personnelle, formats (date, fuseau, FCFA), i18n,
  contrôle de secrets.
- Bout en bout (`e2e/`) : ouverture de la page sans erreur, bascule FR/EN, accessibilité (axe),
  affichage téléphone, sélecteur de langue au clavier.
- Pour tester un site déjà démarré (ex. conteneur Docker) : `BASE_URL=http://localhost:8080 npm run test:e2e`.

## Vérification avant commit (husky + lint-staged + tsc)

Les hooks sont installés par `npm ci` (script `prepare` → `husky`, qui configure
`core.hooksPath=.husky/_`). Si besoin de les réinstaller : `npx husky`.

À chaque `git commit`, `.husky/pre-commit` exécute :

1. `lint-staged` : `prettier --check` et `eslint` sur les fichiers indexés ;
2. `npm run typecheck` : `tsc -b` sur tout le projet.

Une erreur de formatage, de lint ou de typage **refuse le commit** et affiche l'erreur. Corriger
(par exemple `npm run format`) puis recommencer le commit.

## Configuration

La configuration passe par des variables d'environnement documentées dans `.env.example`
(copier en `.env`, qui est ignoré par Git). Les variables `VITE_*` sont intégrées au code envoyé
au navigateur : **aucun secret** ne doit y figurer. `npm run check:secrets` le vérifie.

## Docker

```bash
docker compose -p demo-ticket-us-1-1-a up --build
```

Le site est servi par nginx (non root) sur <http://localhost:8080> (port modifiable avec
`WEB_PORT` dans `.env`). Arrêt et nettoyage :

```bash
docker compose -p demo-ticket-us-1-1-a down --rmi local
```

Fichiers : `Dockerfile` (build Vite puis nginx), `nginx.conf` (en-têtes de sécurité, CSP),
`docker-compose.yml`, `.dockerignore`.

Pour exécuter les outils sans Node installé sur la machine, par exemple (le volume anonyme
`/app/node_modules` évite d'écrire un `node_modules` Linux dans le dossier de l'hôte) :

```bash
docker run --rm -v "$PWD":/app -v /app/node_modules -w /app node:24.22.3-bookworm \
  sh -c "npm ci && npm run lint && npm run test:unit"
docker run --rm -v "$PWD":/app -v /app/node_modules -w /app \
  mcr.microsoft.com/playwright:v1.65.0-noble sh -c "npm ci && npm test"
```

L'image Playwright embarque sa propre version de Node : `npm ci` y affiche un simple
avertissement `EBADENGINE` (non bloquant), la version de référence restant 24.22.3.

## Conventions

Voir [CLAUDE.md](./CLAUDE.md) (nommage, langues, règles de commit, écrans fictifs).
