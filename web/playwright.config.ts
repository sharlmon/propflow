import { defineConfig, devices } from '@playwright/test';

const testDatabase = process.env.TEST_DATABASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: testDatabase
    ? [
        {
          command: 'npm run dev -- --host 127.0.0.1',
          url: 'http://127.0.0.1:5173',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: 'go run ./cmd/api',
          cwd: '../api',
          url: 'http://127.0.0.1:8080/healthz',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            DATABASE_URL: testDatabase,
            APP_ORIGIN: 'http://127.0.0.1:5173',
            HTTP_ADDR: ':8080',
            GOCACHE: '/tmp/propflow-e2e-go-cache',
          },
        },
      ]
    : undefined,
  projects: [
    {
      name: 'chromium',
      testMatch: /golden-path\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      testMatch: /mobile-navigation\.spec\.ts/,
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } },
    },
  ],
});
