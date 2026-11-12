/**
 * Validation des entrées de formulaire (fonctions maison, sans dépendance).
 * Form input validation helpers (home-made, dependency-free).
 *
 * Chaque règle renvoie une clé de traduction (namespace `validation`) en cas
 * d'erreur, ou `null` si la valeur est valide.
 */

export type ValidationErrorKey =
  | 'validation.required'
  | 'validation.tooShort'
  | 'validation.tooLong'
  | 'validation.email'
  | 'validation.phone'
  | 'validation.pattern';

export interface FieldRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  phone?: boolean;
  pattern?: RegExp;
}

export type FormSchema<T extends string> = Record<T, FieldRules>;

export type FormErrors<T extends string> = Partial<Record<T, ValidationErrorKey>>;

/** Longueur maximale appliquée par défaut à tout champ texte. */
export const DEFAULT_MAX_LENGTH = 1000;

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
/** Téléphone : chiffres, espaces, points, tirets, préfixe + facultatif ; 8 à 15 chiffres. */
const PHONE_PATTERN = /^\+?[\d\s.-]+$/;
// eslint-disable-next-line no-control-regex -- suppression volontaire des caractères de contrôle
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Normalise une saisie : supprime les caractères de contrôle et les espaces de bord. */
export function normalizeInput(value: string): string {
  return value.replace(CONTROL_CHARS, '').normalize('NFC').trim();
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string): boolean {
  if (!PHONE_PATTERN.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function validateField(rawValue: string, rules: FieldRules): ValidationErrorKey | null {
  const value = normalizeInput(rawValue);
  if (value === '') {
    return rules.required ? 'validation.required' : null;
  }
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return 'validation.tooShort';
  }
  if (value.length > (rules.maxLength ?? DEFAULT_MAX_LENGTH)) {
    return 'validation.tooLong';
  }
  if (rules.email && !isValidEmail(value)) return 'validation.email';
  if (rules.phone && !isValidPhone(value)) return 'validation.phone';
  if (rules.pattern && !rules.pattern.test(value)) return 'validation.pattern';
  return null;
}

export function validateForm<T extends string>(
  values: Record<T, string>,
  schema: FormSchema<T>,
): { valid: boolean; errors: FormErrors<T>; data: Record<T, string> } {
  const errors: FormErrors<T> = {};
  const data = {} as Record<T, string>;
  for (const field of Object.keys(schema) as T[]) {
    const raw = values[field];
    data[field] = normalizeInput(raw);
    const error = validateField(raw, schema[field]);
    if (error) errors[field] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors, data };
}
