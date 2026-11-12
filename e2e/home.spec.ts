import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

/** Dossier facultatif où enregistrer des captures d'écran (hors dépôt). */
const screenshotDir = process.env.SCREENSHOT_DIR;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('Page d’accueil / Home page', () => {
  test('s’ouvre sans erreur avec un texte en français puis en anglais', async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page).toHaveTitle('Cv en Ligne');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenue sur Cv en Ligne');
    await expect(page.getByTestId('intro')).toContainText("s'affiche en français");
    await expect(page.getByTestId('sample-date')).toHaveText('14/10/2026');
    await expect(page.getByTestId('sample-amount')).toHaveText(/^15\s000\sFCFA$/);

    const switcher = page.getByRole('group', { name: 'Langue' });
    await expect(switcher.getByRole('button', { name: 'Français' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    if (screenshotDir && testInfo.project.name === 'mobile') {
      await page.screenshot({
        path: path.join(screenshotDir, 'accueil-fr-mobile.png'),
        fullPage: true,
      });
    }

    await switcher.getByRole('button', { name: 'English' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Cv en Ligne');
    await expect(page.getByTestId('intro')).toContainText('displayed in English');
    await expect(page.getByTestId('sample-date')).toHaveText('14/10/2026');
    await expect(page.getByTestId('sample-amount')).toHaveText(/^15,000\sFCFA$/);
    await expect(
      page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'English' }),
    ).toHaveAttribute('aria-pressed', 'true');
    if (screenshotDir && testInfo.project.name === 'mobile') {
      await page.screenshot({
        path: path.join(screenshotDir, 'accueil-en-mobile.png'),
        fullPage: true,
      });
    }

    expect(errors).toEqual([]);
  });

  test('respecte les règles d’accessibilité (axe, WCAG A/AA) en FR et en EN', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

    const fr = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(fr.violations).toEqual([]);

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const en = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(en.violations).toEqual([]);
  });

  test('s’adapte au téléphone sans défilement horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      'width=device-width, initial-scale=1',
    );
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('le sélecteur de langue est utilisable au clavier', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'English' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'Français' }).focus();
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});
