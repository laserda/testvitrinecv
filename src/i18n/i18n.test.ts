import { describe, expect, it } from 'vitest';
import { resolveLocale } from '../config/env';
import i18n, { resources } from './index';

function keys(object: object, prefix = ''): string[] {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keys(value as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('i18n', () => {
  it('possède les mêmes clés en français et en anglais', () => {
    expect(keys(resources.en.translation).sort()).toEqual(keys(resources.fr.translation).sort());
  });

  it('démarre en français et bascule en anglais', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('home.title')).toBe('Bienvenue sur Cv en Ligne');
    await i18n.changeLanguage('en');
    expect(i18n.t('home.title')).toBe('Welcome to Cv en Ligne');
    await i18n.changeLanguage('fr');
  });

  it('retombe sur le français pour une langue non prise en charge', () => {
    expect(resolveLocale('de')).toBe('fr');
    expect(resolveLocale(undefined)).toBe('fr');
    expect(resolveLocale('en')).toBe('en');
  });
});
