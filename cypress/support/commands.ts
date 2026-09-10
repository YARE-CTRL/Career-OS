// cypress/support/commands.ts
// Comandos personalizados para Career OS AI

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Simula sesión autenticada inyectando el estado de Zustand en localStorage.
       * Usa el mismo key que el store: 'career-os-storage'.
       * @param type 'free' | 'pro'
       */
      loginAs(type: 'free' | 'pro'): Chainable<void>;

      /**
       * Siembra el store de Zustand con profile + roadmap de fixture.
       */
      seedStore(): Chainable<void>;

      /**
       * Intercepta /api/me/pro-status y devuelve el valor deseado.
       */
      mockProStatus(isPro: boolean): Chainable<void>;

      /**
       * Intercepta /api/copilot/advice y devuelve consejo mock.
       */
      mockCopilot(): Chainable<void>;
    }
  }
}

// Inyectar estado en localStorage para que el store de Zustand lo hidrate
Cypress.Commands.add('loginAs', (type: 'free' | 'pro') => {
  cy.fixture(`session-${type}`).then((session) => {
    cy.fixture('roadmap').then((data) => {
      const storeState = {
        state: {
          profile: data.profile,
          roadmap: data.roadmap,
          notionUrl: 'https://notion.so/test-page-123',
          selectedPageId: 'test-page-id-123',
          remainingGenerations: type === 'pro' ? null : 2,
          // isPro NO se persiste en localStorage (fue eliminado por seguridad)
        },
        version: 0,
      };
      localStorage.setItem('career-os-storage', JSON.stringify(storeState));
    });
  });
});

Cypress.Commands.add('seedStore', () => {
  cy.fixture('roadmap').then((data) => {
    const storeState = {
      state: {
        profile: data.profile,
        roadmap: data.roadmap,
        notionUrl: 'https://notion.so/test-page-123',
        selectedPageId: 'test-page-id-123',
        remainingGenerations: 2,
      },
      version: 0,
    };
    localStorage.setItem('career-os-storage', JSON.stringify(storeState));
  });
});

Cypress.Commands.add('mockProStatus', (isPro: boolean) => {
  cy.intercept('GET', '/api/me/pro-status*', {
    statusCode: 200,
    body: { isPro },
  }).as('proStatus');
});

Cypress.Commands.add('mockCopilot', () => {
  cy.intercept('POST', '/api/copilot/advice', {
    statusCode: 200,
    body: {
      advice: 'Enfócate en construir proyectos reales con React. Un portfolio sólido vale más que cualquier certificación.',
    },
  }).as('copilotAdvice');
});
