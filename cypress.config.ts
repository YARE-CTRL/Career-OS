import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://careeros-yare.vercel.app',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    // FIX Windows CDP: Deshabilitar restricciones de seguridad del browser
    // que en Windows bloquean la conexión entre Cypress y Chrome/Edge via CDP.
    chromeWebSecurity: false,
    env: {
      STRIPE_TEST_CARD: '4242424242424242',
      STRIPE_TEST_EXP: '12/30',
      STRIPE_TEST_CVC: '123',
    },
    setupNodeEvents(on, config) {
      // Flags para permitir la conexión CDP en Windows sin conflictos
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--remote-debugging-port=9222');
        }
        return launchOptions;
      });
      return config;
    },
  },
});
