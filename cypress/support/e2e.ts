// cypress/support/e2e.ts
import './commands';

// Ignorar errores de consola de Next.js en desarrollo (hydration warnings, etc.)
Cypress.on('uncaught:exception', (err) => {
  // No fallar por errores de hidratación de Next.js o de librerías de terceros
  if (
    err.message.includes('Hydration') ||
    err.message.includes('hydrat') ||
    err.message.includes('ResizeObserver') ||
    err.message.includes('Non-Error promise rejection')
  ) {
    return false;
  }
});
