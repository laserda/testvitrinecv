/**
 * Protection XSS côté code.
 * XSS protection helpers.
 *
 * Règle du projet : React échappe déjà le texte rendu en JSX ; `dangerouslySetInnerHTML`
 * est interdit (règle ESLint). Ces utilitaires servent quand une chaîne doit être insérée
 * hors de React (attribut, titre, journal) ou quand une URL vient d'une source externe.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

/** Échappe les caractères spéciaux HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'`]/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** Supprime toute balise HTML et renvoie du texte brut. */
export function stripTags(value: string): string {
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '');
}

/** Assainit une saisie texte : retire les balises puis échappe le reste. */
export function sanitizeText(value: string): string {
  return escapeHtml(stripTags(value));
}

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** Indique si une URL peut être utilisée dans un lien (bloque `javascript:`, `data:`, etc.). */
export function isSafeUrl(value: string): boolean {
  // eslint-disable-next-line no-control-regex -- retrait des caractères invisibles d'évasion
  const cleaned = value.replace(/[\u0000-\u0020\u007F]/g, '');
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) return true;
  try {
    return SAFE_PROTOCOLS.has(new URL(cleaned).protocol);
  } catch {
    return false;
  }
}

/** Renvoie l'URL si elle est sûre, sinon `fallback` (par défaut `#`). */
export function safeUrl(value: string, fallback = '#'): string {
  return isSafeUrl(value) ? value.trim() : fallback;
}
