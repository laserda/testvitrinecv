#!/usr/bin/env node
/**
 * Contrôle simple de secrets en clair (CA-1.1.3).
 * Simple plain-text secret scanner.
 *
 * Usage : node scripts/check-secrets.mjs [dossier]   (par défaut : dossier courant)
 * Code de sortie 0 = aucun secret détecté, 1 = secret(s) détecté(s).
 *
 * Les fichiers .env locaux (ignorés par Git) ne sont pas analysés ; .env.example l'est,
 * et ses variables sensibles doivent rester vides.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
]);
const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.woff',
  '.woff2',
  '.pdf',
]);

/** Motifs de secrets connus. */
const PATTERNS = [
  { name: 'Clé privée', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'Clé AWS', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  {
    name: 'Jeton GitHub',
    regex: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/,
  },
  { name: 'Clé Stripe', regex: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}\b/ },
  { name: 'Clé Google', regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Jeton Slack', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    name: 'Jeton JWT',
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  },
  { name: 'URL avec identifiants', regex: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s:/@]+@[^\s/]+/i },
  {
    name: 'Affectation de secret',
    regex:
      /\b(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?key|private[_-]?key|token|auth[_-]?token|client[_-]?secret|mot[_-]?de[_-]?passe)\b["']?\s*[:=]\s*["'`][^"'`\s]{6,}["'`]/i,
  },
];

/** Dans un fichier .env*, une variable au nom sensible ne doit pas avoir de valeur. */
const SENSITIVE_ENV_NAME =
  /(SECRET|PASSWORD|PASSWD|TOKEN|API_?KEY|PRIVATE_?KEY|ACCESS_?KEY|CREDENTIAL)/i;

function isEnvFile(name) {
  return name === '.env' || name.startsWith('.env.');
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) yield* walk(full);
    } else if (entry.isFile()) {
      if (isEnvFile(entry.name) && entry.name !== '.env.example') continue;
      if (BINARY_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      yield full;
    }
  }
}

export function scanContent(content, fileName) {
  const findings = [];
  content.split(/\r?\n/).forEach((line, index) => {
    for (const { name, regex } of PATTERNS) {
      if (regex.test(line)) findings.push({ line: index + 1, type: name });
    }
    if (isEnvFile(fileName)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (match && SENSITIVE_ENV_NAME.test(match[1]) && match[2].replace(/["'\s]/g, '') !== '') {
        findings.push({ line: index + 1, type: `Valeur renseignée pour ${match[1]}` });
      }
    }
  });
  return findings;
}

function main() {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  if (!statSync(root).isDirectory()) {
    console.error(`Dossier introuvable : ${root}`);
    process.exit(2);
  }
  let count = 0;
  let files = 0;
  for (const file of walk(root)) {
    files += 1;
    const findings = scanContent(readFileSync(file, 'utf8'), path.basename(file));
    for (const finding of findings) {
      count += 1;
      // On n'affiche jamais la valeur trouvée, seulement son emplacement.
      console.error(`${path.relative(root, file)}:${finding.line} — ${finding.type}`);
    }
  }
  if (count > 0) {
    console.error(
      `\n${count} secret(s) potentiel(s) détecté(s). Utilisez .env.example et des variables d'environnement.`,
    );
    process.exit(1);
  }
  console.log(`Aucun secret détecté (${files} fichiers analysés).`);
}

main();
