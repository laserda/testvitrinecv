# CLAUDE.md — Conventions du projet Cv en Ligne

Site vitrine statique de CV en ligne : React + Vite + TypeScript strict. Pas de base de données,
pas de serveur applicatif. Installation et commandes : voir `README.md`.

## Stack et versions

- Node LTS **24.22.3** (`.nvmrc`, `engines`), npm, `package-lock.json` commité, installation par
  `npm ci`.
- Dépendances en **versions exactes** (sans `^` ni `~`) ; `.npmrc` impose `save-exact=true`.
- Qualité : TypeScript strict (`tsc -b`), ESLint, Prettier, Vitest (unitaires), Playwright (bout
  en bout), husky + lint-staged + tsc avant chaque commit.
- N'ajouter une dépendance que si elle est indispensable.

## Organisation et nommage

- `src/components/` : composants React, un par fichier, `PascalCase.tsx`, export nommé.
- `src/lib/` : utilitaires purs, `camelCase.ts`, testés dans `camelCase.test.ts` à côté.
- `src/i18n/` : configuration i18next et `locales/fr.json`, `locales/en.json`.
- `src/config/` : lecture de la configuration publique (`VITE_*`).
- `e2e/` : tests Playwright `*.spec.ts`. `scripts/` : scripts outillage (`*.mjs`).
- Variables et fonctions en `camelCase`, types et composants en `PascalCase`, constantes en
  `UPPER_SNAKE_CASE`, clés de traduction en `camelCase` hiérarchique (`home.title`).

## Langues

- **Code** (identifiants) : anglais. **Commentaires et documentation** : français (anglais
  accepté en complément).
- **Interface** : français (langue par défaut) et anglais. Aucun texte visible en dur dans les
  composants : toujours `t('clé')`, avec la même clé dans `fr.json` et `en.json` (un test le
  vérifie).
- L'attribut `lang` du document suit la langue active.

## Formats régionaux

- Fuseau `Africa/Abidjan`, monnaie FCFA (XOF), dates `JJ/MM/AAAA` (ex. 14/10/2026), dans les deux
  langues.
- Toujours passer par `src/lib/format.ts` (`formatDate`, `formatDateTime`, `parseDate`,
  `formatCurrency`), jamais par `toLocaleString` direct.

## Sécurité

- Aucun secret dans le code ni dans Git : configuration via `.env` (non versionné) documentée
  dans `.env.example`. Les `VITE_*` sont publiques. Vérifier avec `npm run check:secrets`.
- XSS : `dangerouslySetInnerHTML`, `innerHTML` et `outerHTML` sont interdits (ESLint). Hors JSX,
  utiliser `src/lib/sanitize.ts` (`escapeHtml`, `sanitizeText`, `safeUrl`). CSP dans le build
  (balise meta) et dans `nginx.conf`.
- Formulaires : valider toute saisie avec `src/lib/validation.ts` (`validateField`,
  `validateForm`).
- Journalisation : uniquement via `src/lib/logger.ts` (emails et téléphones masqués) ;
  `console.*` est interdit ailleurs (ESLint).

## Accessibilité et mise en page

- Mobile d'abord, CSS sobre, sans couleurs, polices ni composants de marque (charte à venir,
  US-1.2).
- Un seul `h1` par page, titres hiérarchisés, libellés sur chaque champ, contraste AA, cibles
  tactiles d'au moins 44 px, navigation au clavier. Les tests e2e lancent axe (WCAG 2.1 AA).

## Git et commits

- Branches : `main` (production), `develop` (intégration), branches de travail
  `kship/<ticket>` ou `feature/<sujet>` ; fusion par pull request.
- Messages de commit **en français**, à l'impératif, courts et clairs, préfixés par un type :
  `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`, `style:`, `ci:`
  (ex. `feat: ajoute le sélecteur de langue`).
- Le hook pre-commit (Prettier, ESLint, `tsc`) ne doit jamais être contourné (`--no-verify`
  interdit). Pas de `push --force` sur les branches partagées.
- Avant une PR : `npm run lint`, `npm run typecheck`, `npm test`, `npm run check:secrets`.

## Écrans fictifs

Liste des écrans affichant encore des données ou contenus fictifs (à remplacer avant mise en
production). Ajouter une ligne par écran fictif créé, la retirer quand il devient réel.

_Aucun pour l'instant._
