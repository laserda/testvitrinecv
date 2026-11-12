import { describe, expect, it } from 'vitest';
import {
  CURRENCY_CODE,
  TIME_ZONE,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseDate,
} from './format';

/** Remplace les espaces insécables (fines ou non) par des espaces simples. */
const plain = (text: string) => text.replace(/[\u00A0\u202F]/g, ' ');

describe('constantes régionales', () => {
  it('utilise le fuseau Africa/Abidjan et la monnaie XOF', () => {
    expect(TIME_ZONE).toBe('Africa/Abidjan');
    expect(CURRENCY_CODE).toBe('XOF');
  });
});

describe('formatDate', () => {
  it('formate en JJ/MM/AAAA', () => {
    expect(formatDate(new Date(Date.UTC(2026, 9, 14, 12)))).toBe('14/10/2026');
    expect(formatDate('2026-01-05T08:00:00Z')).toBe('05/01/2026');
  });
  it('applique le fuseau Africa/Abidjan (UTC+0) quel que soit le fuseau de la source', () => {
    // 14/10/2026 23:30 à New York (UTC-4) = 15/10/2026 03:30 à Abidjan.
    expect(formatDate('2026-10-14T23:30:00-04:00')).toBe('15/10/2026');
    expect(formatDateTime('2026-10-14T23:30:00-04:00')).toBe('15/10/2026 03:30');
  });
  it('refuse une date invalide', () => {
    expect(() => formatDate('pas une date')).toThrow(RangeError);
  });
});

describe('parseDate', () => {
  it('lit une date JJ/MM/AAAA valide', () => {
    expect(parseDate('14/10/2026')?.toISOString()).toBe('2026-10-14T00:00:00.000Z');
  });
  it.each(['31/02/2026', '2026-10-14', '14/10/26', ''])('refuse %s', (value) => {
    expect(parseDate(value)).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('affiche les montants en FCFA en français', () => {
    expect(plain(formatCurrency(15000))).toBe('15 000 FCFA');
    expect(plain(formatCurrency(1250000.6, 'fr'))).toBe('1 250 001 FCFA');
  });
  it('affiche les montants en FCFA en anglais', () => {
    expect(plain(formatCurrency(15000, 'en'))).toBe('15,000 FCFA');
  });
});
