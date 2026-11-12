/**
 * Journalisation sans donnée personnelle : les emails et numéros de téléphone sont masqués
 * avant toute écriture.
 * Logging without personal data: emails and phone numbers are masked before output.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const EMAIL_MASK = '[email masqué]';
export const PHONE_MASK = '[téléphone masqué]';

const EMAIL_IN_TEXT = /[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[A-Za-z]{2,}/g;
/** Suite d'au moins 8 chiffres pouvant contenir espaces, points, tirets, parenthèses et un +. */
const PHONE_IN_TEXT = /[+(]*\d[\d\s().+-]{6,}\d/g;
/** Date ISO (AAAA-MM-JJ), à ne pas confondre avec un téléphone. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SENSITIVE_KEYS =
  /^(e-?mail|courriel|phone|tel|telephone|téléphone|mobile|password|mot_?de_?passe)$/i;

export function maskPersonalData(text: string): string {
  return text.replace(EMAIL_IN_TEXT, EMAIL_MASK).replace(PHONE_IN_TEXT, (match) => {
    if (ISO_DATE.test(match)) return match;
    const digits = match.replace(/\D/g, '');
    return digits.length >= 8 ? PHONE_MASK : match;
  });
}

/** Masque récursivement les données personnelles d'une valeur quelconque. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[profondeur max]';
  if (typeof value === 'string') return maskPersonalData(value);
  if (value instanceof Error) return { name: value.name, message: maskPersonalData(value.message) };
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEYS.test(key) ? '[masqué]' : redact(item, depth + 1),
      ]),
    );
  }
  return value;
}

type Sink = (level: LogLevel, message: string, context?: unknown) => void;

const consoleSink: Sink = (level, message, context) => {
  const args = context === undefined ? [message] : [message, context];
  // Seul point du code autorisé à écrire dans la console.
  // eslint-disable-next-line no-console
  console[level](...args);
};

export function createLogger(sink: Sink = consoleSink) {
  const log = (level: LogLevel, message: string, context?: unknown) => {
    sink(level, maskPersonalData(message), context === undefined ? undefined : redact(context));
  };
  return {
    debug: (message: string, context?: unknown) => {
      log('debug', message, context);
    },
    info: (message: string, context?: unknown) => {
      log('info', message, context);
    },
    warn: (message: string, context?: unknown) => {
      log('warn', message, context);
    },
    error: (message: string, context?: unknown) => {
      log('error', message, context);
    },
  };
}

export const logger = createLogger();
