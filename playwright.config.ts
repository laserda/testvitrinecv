import { defineConfig, devices } from '@playwright/test';

/**
 * Tests de bout en bout.
 * - Par défaut : lance le serveur de développement Vite (comme indiqué dans le README).
 * - Avec BASE_URL : teste un site déjà démarré (ex. conteneur Docker nginx).
 */
const externalBaseUrl = process.env.BASE_URL;
const port = 5173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: externalBaseUrl ?? `http://127.0.0.1:${String(port)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `npm run dev -- --host 127.0.0.1 --port ${String(port)} --strictPort`,
        url: `http://127.0.0.1:${String(port)}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
