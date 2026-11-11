// Testes de ponta a ponta do Brius. Rodam sobre dist/ (gerado por `npm run build`).
// Usa o Chrome instalado no sistema (channel: 'chrome'); em CI, troque por `npx playwright install chromium`.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, channel: process.env.PW_CHANNEL ?? 'chrome', trace: 'retain-on-failure' },
  webServer: { command: `node scripts/serve.mjs --port ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'computador', use: { viewport: { width: 1300, height: 1000 } }, testMatch: /(telas|calorias)\.spec\.js/ },
  ],
});
