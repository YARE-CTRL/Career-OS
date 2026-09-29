/**
 * Suite 03 — Panel de Admin & Flujo de Activación Manual
 *
 * Estas pruebas golpean la API real sin mocks. Verifican que:
 * - Cualquier intento sin contraseña sea rechazado.
 * - Cualquier intento con contraseña incorrecta sea rechazado.
 * - Ataques de fuerza bruta con campos maliciosos sean rechazados.
 * - La API nunca devuelva información sensible en errores.
 * - La inyección de SQL/JSON no rompa el servidor.
 * - Sin userId sea rechazado.
 */
describe('Suite 03 — Admin Grant API: Seguridad y Validación', () => {

  const GRANT_URL = '/api/admin/grant';

  // ──────────────────────────────────────────────────────────────
  // BLOQUE 1: Autenticación
  // ──────────────────────────────────────────────────────────────

  it('03-A: Petición sin secret es rechazada con 400', () => {
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: { userId: 'some-user-id' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  it('03-B: Petición sin userId es rechazada con 400', () => {
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: { secret: 'cualquier_cosa' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  it('03-C: Secret incorrecto es rechazado con 401', () => {
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: { userId: 'test-user-123', secret: 'PASSWORD_INCORRECTA' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(401);
      // El error no debe filtrar pistas sobre la contraseña real
      expect(res.body.error).to.not.include(Cypress.env('ADMIN_SECRET') || '');
    });
  });

  it('03-D: Contraseña vacía es rechazada con 400 o 401', () => {
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: { userId: 'test-user-123', secret: '' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 401]);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // BLOQUE 2: Inyección y Ataques
  // ──────────────────────────────────────────────────────────────

  it('03-E: Inyección JSON en secret no causa 500 ni acceso', () => {
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: { userId: 'victim-user', secret: '{"$gt": ""}' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.not.equal(200);
      expect(res.status).to.not.equal(500);
    });
  });

  it('03-F: userId con caracteres especiales no causa 500', () => {
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: {
        userId: "'; DROP TABLE users; --",
        secret: 'WRONG_SECRET',
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.not.equal(500);
    });
  });

  it('03-G: Payload gigante (>10KB) no causa crash del servidor', () => {
    const bigString = 'A'.repeat(10_001);
    cy.request({
      method: 'POST',
      url: GRANT_URL,
      body: { userId: bigString, secret: bigString },
      failOnStatusCode: false,
    }).then((res) => {
      // Puede rechazar con 400, 401, o 413 (payload too large), pero NUNCA 500
      expect(res.status).to.not.equal(500);
    });
  });

  it('03-H: Método GET en el endpoint retorna 405', () => {
    cy.request({
      method: 'GET',
      url: GRANT_URL,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(405);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // BLOQUE 3: Flujo real - activar usuario con credenciales correctas
  // (Solo si ADMIN_SECRET está disponible como variable de entorno Cypress)
  // ──────────────────────────────────────────────────────────────

  it('03-I: Activar un userId válido con secret correcto retorna 200 y mensaje de éxito', () => {
    cy.env('ADMIN_SECRET').then((adminSecret) => {
      if (!adminSecret) {
        cy.log('⚠️  ADMIN_SECRET no configurado — saltando prueba de activación real');
        return;
      }
      cy.request({
        method: 'POST',
        url: GRANT_URL,
        body: {
          userId: 'cypress-test-user-do-not-use',
          secret: adminSecret,
          planId: 'monthly',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.message).to.include('cypress-test-user-do-not-use');
      });
    });
  });

  it('03-J: Intentar activar planId inexistente igual activa plan por defecto (monthly)', () => {
    cy.env('ADMIN_SECRET').then((adminSecret) => {
      if (!adminSecret) {
        cy.log('⚠️  ADMIN_SECRET no configurado — saltando');
        return;
      }
      cy.request({
        method: 'POST',
        url: GRANT_URL,
        body: {
          userId: 'cypress-test-user-do-not-use',
          secret: adminSecret,
          planId: 'PLAN_QUE_NO_EXISTE',
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message).to.include('monthly');
      });
    });
  });

});
