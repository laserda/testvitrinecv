/**
 * Formats régionaux du projet : fuseau Africa/Abidjan, monnaie FCFA (XOF),
 * dates au format JJ/MM/AAAA (ex. 14/10/2026) quelle que soit la langue.
 * Project regional formats: Africa/Abidjan time zone, FCFA (XOF) currency, DD/MM/YYYY dates.
 */

export const TIME_ZONE = 'Africa/Abidjan';
export const CURRENCY_CODE = 'XOF';
export const CURRENCY_LABEL = 'FCFA';

export type AppLocale = 'fr' | 'en';

const NBSP = '\u00A0';

function toDate(value: Date | string | number): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Date invalide / Invalid date');
  }
  return date;
}

function partsInTimeZone(value: Date | string | number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(toDate(value));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return {
    day: get('day'),
    month: get('month'),
    year: get('year'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** Date au format JJ/MM/AAAA dans le fuseau Africa/Abidjan. */
export function formatDate(value: Date | string | number): string {
  const { day, month, year } = partsInTimeZone(value);
  return `${day}/${month}/${year}`;
}

/** Date et heure au format JJ/MM/AAAA HH:mm dans le fuseau Africa/Abidjan. */
export function formatDateTime(value: Date | string | number): string {
  const { day, month, year, hour, minute } = partsInTimeZone(value);
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/** Lit une date saisie au format JJ/MM/AAAA ; renvoie `null` si elle est invalide. */
export function parseDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? date : null;
}

/** Montant en FCFA (XOF, sans décimales), séparateurs selon la langue. */
export function formatCurrency(amount: number, locale: AppLocale = 'fr'): string {
  const number = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${number}${NBSP}${CURRENCY_LABEL}`;
}
