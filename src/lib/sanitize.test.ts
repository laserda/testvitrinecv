import { describe, expect, it } from 'vitest';
import { escapeHtml, isSafeUrl, safeUrl, sanitizeText, stripTags } from './sanitize';

describe('escapeHtml', () => {
  it('échappe les caractères dangereux', () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&\``)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;&#96;',
    );
  });
  it('laisse le texte ordinaire intact', () => {
    expect(escapeHtml('Développeuse à Abidjan')).toBe('Développeuse à Abidjan');
  });
});

describe('stripTags / sanitizeText', () => {
  it('retire les scripts et balises', () => {
    expect(stripTags('<script>alert(1)</script>Bonjour <b>Awa</b>')).toBe('Bonjour Awa');
  });
  it('neutralise les balises mal formées', () => {
    expect(sanitizeText('<<img src=x onerror=alert(1)//<')).not.toMatch(/[<>]/);
    expect(sanitizeText('"Tom" & Jerry')).toBe('&quot;Tom&quot; &amp; Jerry');
  });
});

describe('isSafeUrl / safeUrl', () => {
  it.each(['https://example.com', 'mailto:contact@example.com', 'tel:+2250102030405', '/cv'])(
    'accepte %s',
    (url) => {
      expect(isSafeUrl(url)).toBe(true);
    },
  );
  it.each([
    'javascript:alert(1)',
    ' JaVaScRiPt:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example',
    '/\\evil.example',
    'n importe quoi',
  ])('refuse %s', (url) => {
    expect(isSafeUrl(url)).toBe(false);
  });
  it('remplace une URL dangereuse par la valeur de repli', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
    expect(safeUrl(' https://example.com ')).toBe('https://example.com');
  });
});
