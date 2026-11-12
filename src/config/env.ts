/**
 * Configuration publique lue depuis les variables d'environnement Vite (préfixe VITE_).
 * Public configuration read from Vite environment variables.
 *
 * ATTENTION : toute variable VITE_* est intégrée au code envoyé au navigateur.
 * Ne jamais y mettre de secret (voir .env.example).
 */
import type { AppLocale } from '../lib/format';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['fr', 'en'];

export function resolveLocale(value: string | undefined): AppLocale {
  return SUPPORTED_LOCALES.find((locale) => locale === value) ?? 'fr';
}

export const env = {
  siteName: import.meta.env.VITE_SITE_NAME ?? 'Cv en Ligne',
  defaultLocale: resolveLocale(import.meta.env.VITE_DEFAULT_LOCALE),
} as const;
