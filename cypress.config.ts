import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    env: {
      STRIPE_TEST_CARD: '4242424242424242',
      STRIPE_TEST_EXP: '12/30',
      STRIPE_TEST_CVC: '123',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
