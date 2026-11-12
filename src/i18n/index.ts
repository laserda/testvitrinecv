import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { env } from '../config/env';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const resources = {
  fr: { translation: fr },
  en: { translation: en },
} as const;

/** Synchronise l'attribut `lang` et le titre du document avec la langue active. */
function syncDocument(language: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
  document.title = i18n.t('meta.title');
}

i18n.on('languageChanged', syncDocument);

void i18n.use(initReactI18next).init({
  resources,
  lng: env.defaultLocale,
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en'],
  // React échappe déjà les valeurs : pas de double échappement.
  interpolation: { escapeValue: false },
  returnNull: false,
  showSupportNotice: false,
});

export default i18n;
