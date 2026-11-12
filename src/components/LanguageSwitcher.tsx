import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../config/env';

/** Sélecteur de langue accessible : groupe de boutons à bascule (aria-pressed). */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={current === locale}
          onClick={() => {
            void i18n.changeLanguage(locale);
          }}
        >
          {t(`language.${locale}`)}
        </button>
      ))}
    </div>
  );
}
