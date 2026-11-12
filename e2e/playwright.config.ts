import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: /.*\.spec\.ts/,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use standard bundled Chromium in CI environments; default to system 'chrome' on local environments where Application Control policies restrict AppData binaries
        channel: process.env.CI ? undefined : (process.env.PLAYWRIGHT_CHANNEL || 'chrome'),
      },
    },
  ],
  webServer: [
    {
      command: 'npm --prefix server run dev',
      cwd: '..',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm --prefix client run dev',
      cwd: '..',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
