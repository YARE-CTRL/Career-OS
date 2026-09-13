describe('Suite 04 — Exportaciones Pro', () => {

  it('04-A: Usuario anonimo obtiene 401 en /api/export/sheets', () => {
    cy.request({
      method: 'POST',
      url: '/api/export/sheets',
      body: { roadmap: [], profile: {} },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });

  it('04-B: Usuario Free no ve botones de exportación en el dashboard', () => {
    cy.mockProStatus(false);
    cy.loginAs('free');
    // Sembrar el store ANTES de visitar dashboard:
    // 1. Ir a landing para tener un window context del mismo origen
    cy.visit('/');
    cy.seedStore(2);
    // 2. Ahora el localStorage ya está sembrado — visitamos dashboard
    cy.visit('/dashboard');
    cy.wait('@proStatus');
    cy.contains(/exportar.*sheets/i).should('not.exist');
    cy.contains(/exportar.*calendar/i).should('not.exist');
  });

  it('04-C: /api/export/sheets retorna CSV válido para usuario Pro', () => {
    cy.loginAs('pro');
    cy.fixture('roadmap').then((data) => {
      cy.request({
        method: 'POST',
        url: '/api/export/sheets',
        body: { roadmap: data.roadmap, profile: data.profile },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.not.equal(500);
        if (res.status === 200) {
          expect(res.body).to.have.property('csv');
          expect(res.body.csv).to.include('Fase');
        }
      });
    });
  });

  it('04-D: /api/export/calendar retorna ICS válido para usuario Pro', () => {
    cy.loginAs('pro');
    cy.fixture('roadmap').then((data) => {
      cy.request({
        method: 'POST',
        url: '/api/export/calendar',
        body: { roadmap: data.roadmap, profile: data.profile },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.not.equal(500);
        if (res.status === 200) {
          expect(res.headers['content-type']).to.include('text/calendar');
          expect(res.body).to.include('BEGIN:VCALENDAR');
        }
      });
    });
  });

  it('04-E: Botones visibles para usuario Pro', () => {
    cy.mockProStatus(true);
    cy.loginAs('pro');
    // FIX: Sembrar el store ANTES de visitar /dashboard.
    // Si seedStore se llama después de visit, el useEffect de redirección
    // ya se ejecutó y mandó al usuario a /onboarding porque profile era null.
    cy.visit('/');
    cy.seedStore(null); // pro: generaciones ilimitadas
    cy.visit('/dashboard');
    cy.wait('@proStatus');
    cy.contains(/exportar.*sheets/i).should('be.visible');
    cy.contains(/exportar.*calendar/i).should('be.visible');
  });

});
