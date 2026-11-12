import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_LENGTH,
  isValidEmail,
  isValidPhone,
  normalizeInput,
  validateField,
  validateForm,
} from './validation';

describe('normalizeInput', () => {
  it('supprime les espaces de bord et les caractères de contrôle', () => {
    expect(normalizeInput('  Bonjour\u0000\u0007  ')).toBe('Bonjour');
  });
});

describe('isValidEmail', () => {
  it.each(['awa.kone@example.com', 'contact@exemple.ci'])('accepte %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });
  it.each(['sans-arobase', 'a@b', '<script>@x.com', 'a b@example.com'])('refuse %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('isValidPhone', () => {
  it.each(['+225 01 02 03 04 05', '0102030405', '+225.01.02.03.04.05'])('accepte %s', (phone) => {
    expect(isValidPhone(phone)).toBe(true);
  });
  it.each(['12345', 'abc', '+225 01 02 03 04 05 06 07 08', '01<02>03'])('refuse %s', (phone) => {
    expect(isValidPhone(phone)).toBe(false);
  });
});

describe('validateField', () => {
  it('signale un champ obligatoire vide', () => {
    expect(validateField('   ', { required: true })).toBe('validation.required');
    expect(validateField('', {})).toBeNull();
  });
  it('contrôle les longueurs', () => {
    expect(validateField('ab', { minLength: 3 })).toBe('validation.tooShort');
    expect(validateField('abcd', { maxLength: 3 })).toBe('validation.tooLong');
    expect(validateField('x'.repeat(DEFAULT_MAX_LENGTH + 1), {})).toBe('validation.tooLong');
  });
  it('contrôle email, téléphone et motif', () => {
    expect(validateField('faux', { email: true })).toBe('validation.email');
    expect(validateField('123', { phone: true })).toBe('validation.phone');
    expect(validateField('abc', { pattern: /^\d+$/ })).toBe('validation.pattern');
    expect(validateField('123', { pattern: /^\d+$/ })).toBeNull();
  });
});

describe('validateForm', () => {
  it('renvoie les erreurs par champ et les données normalisées', () => {
    const result = validateForm(
      { name: '  Awa ', email: 'invalide' },
      { name: { required: true }, email: { required: true, email: true } },
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({ email: 'validation.email' });
    expect(result.data.name).toBe('Awa');
  });
  it('valide un formulaire correct', () => {
    const result = validateForm({ email: 'awa@example.com' }, { email: { email: true } });
    expect(result).toMatchObject({ valid: true, errors: {} });
  });
});
