import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { env } from './config/env';
import { TIME_ZONE, formatCurrency, formatDate, type AppLocale } from './lib/format';

/** Exemple fixe servant à illustrer les formats régionaux. */
const SAMPLE_DATE = new Date(Date.UTC(2026, 9, 14, 12));
const SAMPLE_AMOUNT = 15000;

export function App() {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';

  return (
    <>
      <header className="site-header">
        <p className="site-name">{env.siteName}</p>
        <LanguageSwitcher />
      </header>
      <main id="contenu" className="container">
        <h1>{t('home.title')}</h1>
        <p data-testid="intro">{t('home.intro')}</p>
        <section aria-labelledby="formats-title">
          <h2 id="formats-title">{t('home.formatsTitle')}</h2>
          <dl className="formats">
            <dt>{t('home.dateLabel')}</dt>
            <dd data-testid="sample-date">{formatDate(SAMPLE_DATE)}</dd>
            <dt>{t('home.amountLabel')}</dt>
            <dd data-testid="sample-amount">{formatCurrency(SAMPLE_AMOUNT, locale)}</dd>
            <dt>{t('home.timeZoneLabel')}</dt>
            <dd>{TIME_ZONE}</dd>
          </dl>
        </section>
      </main>
    </>
  );
}
