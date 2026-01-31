import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Setup projects - run sequentially to avoid parallel load and WebKit timeout
    {
      name: 'setup-chromium',
      testMatch: /auth\.setup\.chromium\.ts/
    },
    {
      name: 'setup-firefox',
      testMatch: /auth\.setup\.firefox\.ts/,
      dependencies: ['setup-chromium']
    },
    {
      name: 'setup-webkit',
      testMatch: /auth\.setup\.webkit\.ts/,
      dependencies: ['setup-firefox']
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
    // Local: build with mock (NEXT_PUBLIC_QUIZ_USE_MOCK) then start so Story 2.7 quiz tests pass without GEMINI_API_KEY.
    // CI: build is done in a previous step with env; only start here.
    command: process.env.CI ? 'npm run start' : 'npm run build:e2e && npm run start',
    url: 'http://localhost:3000',
    // false = always start server with webServer.env (NEXT_PUBLIC_QUIZ_USE_MOCK) so /api/quiz/post returns mock and tests need no Gemini. If true, a server already on baseURL would be reused and might not have the env.
    reuseExistingServer: false,
    timeout: process.env.CI ? 60_000 : 120_000,
    // API route /api/quiz/post checks this at runtime to return mock (no Gemini).
    env: { NEXT_PUBLIC_QUIZ_USE_MOCK: 'true' },
  },
});
