describe('Suite 01 — Auth Guard: Protección de rutas', () => {
  beforeEach(() => { cy.clearLocalStorage(); cy.clearCookies(); });
  it('01-A: Usuario anonimo en /dashboard es redirigido a / inmediatamente', () => {
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.url().should('not.include', '/dashboard');
    // cy.url() devuelve la URL absoluta completa (https://.../)
    // La regex debe coincidir con el origin más la raíz, no una ruta relativa.
    cy.url().should('match', /careeros-yare\.vercel\.app\/?$/);
    cy.get('#hero-cta-primary-unauth').should('exist');
  });

  it('01-B: /onboarding es accesible sin autenticacion', () => {
    cy.visit('/onboarding');
    cy.url().should('include', '/onboarding');
    cy.get('body').should('not.contain', 'Error');
  });
});
