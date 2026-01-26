import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Setup projects - one per browser
    {
      name: 'setup-chromium',
      testMatch: /auth\.setup\.chromium\.ts/
    },
    {
      name: 'setup-firefox',
      testMatch: /auth\.setup\.firefox\.ts/
    },
    {
      name: 'setup-webkit',
      testMatch: /auth\.setup\.webkit\.ts/
    },
    
    // Test projects - each with its own storageState
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.chromium.json'
      },
      dependencies: ['setup-chromium'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/user.firefox.json'
      },
      dependencies: ['setup-firefox'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/user.webkit.json'
      },
      dependencies: ['setup-webkit'],
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
