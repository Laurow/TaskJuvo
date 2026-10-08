import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const serverCommand = process.env.PLAYWRIGHT_SERVER_COMMAND || 'npm run dev';
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/usr/bin/chromium';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: 'list',
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    browserName: 'chromium',
    launchOptions: { executablePath: chromiumPath },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: serverCommand,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
