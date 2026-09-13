// cypress/support/commands.ts
// Comandos personalizados para Career OS AI

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Establece sesión NextAuth via login programático.
       * Debe llamarse ANTES de cy.visit(). El store se siembra con seedStore().
       */
      loginAs(type: 'free' | 'pro'): Chainable<void>;

      /**
       * Siembra el store de Zustand con profile + roadmap de fixture.
       * DEBE llamarse DESPUÉS de cy.visit() para que cy.window() apunte al AUT.
       * @param remainingGenerations — null para Pro, número para Free
       */
      seedStore(remainingGenerations?: number | null): Chainable<void>;

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

// ── cy.loginAs() ──────────────────────────────────────────────────────────────
// Establece la cookie de sesión NextAuth haciendo login programático.
// El store de Zustand NO se siembra aquí — hay que llamar cy.seedStore()
// DESPUÉS de cy.visit() para que el localStorage quede en el window del AUT.
Cypress.Commands.add('loginAs', (type: 'free' | 'pro') => {
  cy.fixture(`session-${type}`).then((session) => {
    cy.request('/api/auth/csrf').then((res) => {
      const csrfToken = res.body.csrfToken;
      cy.request({
        method: 'POST',
        url: '/api/auth/callback/notion-manual',
        form: true,
        body: {
          csrfToken,
          access_token: 'fake_cypress_token',
          id: session.user.id,
          name: session.user.name,
          json: 'true',
        },
      });
    });
  });
});

// ── cy.seedStore() ────────────────────────────────────────────────────────────
// FIX: Usa cy.window() para escribir en el localStorage del AUT (la app),
// no en el del runner de Cypress. Debe llamarse DESPUÉS de cy.visit().
Cypress.Commands.add('seedStore', (remainingGenerations: number | null = 2) => {
  cy.fixture('roadmap').then((data) => {
    cy.window().then((win) => {
      const storeState = {
        state: {
          profile: data.profile,
          roadmap: data.roadmap,
          notionUrl: 'https://notion.so/test-page-123',
          selectedPageId: 'test-page-id-123',
          remainingGenerations,
        },
        version: 0,
      };
      win.localStorage.setItem('career-os-storage', JSON.stringify(storeState));
    });
  });
});

// ── cy.mockProStatus() ────────────────────────────────────────────────────────
Cypress.Commands.add('mockProStatus', (isPro: boolean) => {
  cy.intercept('GET', '/api/me/pro-status*', {
    statusCode: 200,
    body: { isPro },
  }).as('proStatus');
});

// ── cy.mockCopilot() ──────────────────────────────────────────────────────────
Cypress.Commands.add('mockCopilot', () => {
  cy.intercept('POST', '/api/copilot/advice', {
    statusCode: 200,
    body: {
      advice: 'Enfócate en construir proyectos reales con React. Un portfolio sólido vale más que cualquier certificación.',
    },
  }).as('copilotAdvice');
});
