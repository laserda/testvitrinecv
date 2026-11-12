import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const script = path.resolve(import.meta.dirname, 'check-secrets.mjs');
const repoRoot = path.resolve(import.meta.dirname, '..');
const tempDirs: string[] = [];

function run(dir: string) {
  return spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
}

function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'secrets-'));
  tempDirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

// Les faux secrets sont construits dynamiquement pour ne jamais figurer en clair dans le dépôt.
const fakeAwsKey = ['AKIA', 'ABCDEFGHIJKLMNOP'].join('');
const fakeAssignment = ['const pass', 'word = "', 'Sup3rS3cret!', '";'].join('');
const fakePrivateKey = ['-----BEGIN ', 'PRIVATE KEY-----'].join('');

describe('scripts/check-secrets.mjs', () => {
  it('ne trouve aucun secret dans le dépôt (CA-1.1.3)', () => {
    const result = run(repoRoot);
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Aucun secret détecté');
  });

  it.each([
    ['config.ts', `export const key = '${fakeAwsKey}';`],
    ['src/api.ts', fakeAssignment],
    ['cle.pem', fakePrivateKey],
    ['.env.example', ['API_', 'SECRET=valeur-reelle'].join('')],
  ])('détecte un secret dans %s sans afficher sa valeur', (name, content) => {
    const result = run(fixture({ [name]: content }));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(name.split('/').pop());
    expect(result.stderr).not.toContain('Sup3rS3cret');
    expect(result.stderr).not.toContain(fakeAwsKey);
  });

  it('accepte un .env.example sans valeur sensible et ignore le .env local', () => {
    const dir = fixture({
      '.env.example': 'VITE_SITE_NAME="Cv en Ligne"\nAPI_TOKEN=\n',
      '.env': ['API_TOKEN=', 'valeur-locale-123'].join(''),
      'src/ok.ts': "const label = 'mot de passe';",
    });
    const result = run(dir);
    expect(result.status).toBe(0);
  });
});
