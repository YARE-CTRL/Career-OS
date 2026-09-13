describe('Suite 05 — Copiloto IA', () => {

  beforeEach(() => {
    cy.mockProStatus(true);
    cy.loginAs('pro');
    // FIX: Sembrar el store ANTES de visitar /dashboard.
    // cy.window() solo existe después de un cy.visit(). Si llamamos seedStore
    // después de visit('/dashboard'), el useEffect de redirección ya corrió
    // con profile=null y redirigió a /onboarding antes de que el store se sembrara.
    // Solución: ir a '/' primero (mismo origen), sembrar, luego ir a /dashboard.
    // localStorage persiste entre visitas del mismo origen en Cypress.
    cy.visit('/');
    cy.seedStore(null); // pro: sin límite de generaciones
    cy.visit('/dashboard');
    cy.wait('@proStatus');
  });

  it('05-A: Botón de copiloto existe y está habilitado en el dashboard', () => {
    cy.contains(/✨ Obtener consejo personalizado/i)
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('05-B: Rate limit (429) muestra mensaje de error en la UI', () => {
    cy.intercept('POST', '/api/copilot/advice', {
      statusCode: 429,
      body: { error: 'Has alcanzado el límite de 3 consejos gratuitos al día. Desbloquea el Plan Pro para ilimitados.' },
    }).as('copilotRateLimit');
    cy.contains(/✨ Obtener consejo personalizado/i).click();
    cy.wait('@copilotRateLimit');
    cy.contains(/límite/i).should('be.visible');
  });

  it('05-C: Spinner visible durante la carga del consejo', () => {
    cy.intercept('POST', '/api/copilot/advice', (req) => {
      req.reply({ delay: 800, body: { advice: 'Tip de prueba.' } });
    }).as('copilotSlow');
    cy.contains(/✨ Obtener consejo personalizado/i).click();
    cy.contains(/generando/i).should('be.visible');
    cy.wait('@copilotSlow');
  });

  it('05-D: Muestra el consejo de IA mockeado', () => {
    cy.mockCopilot();
    cy.contains(/✨ Obtener consejo personalizado/i).click();
    cy.wait('@copilotAdvice');
    cy.contains('Enfócate en construir proyectos').should('be.visible');
  });

});
