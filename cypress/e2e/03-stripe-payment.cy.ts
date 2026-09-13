describe('Suite 03 — Stripe Payment', () => {

  it('03-A: session_id con formato invalido es rechazado sin llamar a Stripe', () => {
    cy.request({
      url: '/api/me/pro-status?session_id=HACKER_INPUT_123',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.isPro).to.equal(false);
    });
  });

  it('03-B: /api/stripe/checkout rechaza peticion sin autenticacion (401)', () => {
    cy.request({
      method: 'POST',
      url: '/api/stripe/checkout',
      body: { plan: 'monthly' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(401);
    });
  });

  it('03-C: /success pasa session_id hacia /api/me/pro-status', () => {
    cy.intercept('GET', '/api/me/pro-status*').as('proStatus');
    cy.loginAs('free');
    cy.visit('/success?session_id=cs_test_FAKESESSIONID123456789');
    cy.wait('@proStatus').then((int) => {
      expect(int.request.url).to.include('session_id=cs_test_FAKESESSIONID123456789');
    });
  });

});
