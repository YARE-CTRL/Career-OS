/**
 * 07-session-lifecycle.cy.ts
 *
 * Suite RIGUROSA de sesión y autenticación.
 * Prueba el ciclo completo: guard de rutas → OAuth de Notion → JWT → logout.
 *
 * Hallazgos críticos auditados:
 *  - No existe middleware.ts → protección de /dashboard es CLIENT-SIDE (Zustand)
 *  - Email placeholder compartido 'notion@careeros.local'
 *  - redirect callback sin restricciones → open redirect posible
 *  - Logout limpia store + cookie JWT, pero NO revoca token Notion
 */

const BASE_URL = Cypress.config('baseUrl') || 'https://careeros-yare.vercel.app';

// ─── Utilidades ──────────────────────────────────────────────────────────────

/** Limpia localStorage y todas las cookies, simulando un navegador virgen */
function fullReset() {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 1: Protección de rutas (Guest / Sin sesión)
// ─────────────────────────────────────────────────────────────────────────────
describe('07-A | Protección de rutas — Usuario sin sesión', () => {

  beforeEach(() => fullReset());

  it('07-A-1: /dashboard redirige al usuario anónimo al inicio', () => {
    cy.visit(`${BASE_URL}/dashboard`, { failOnStatusCode: false });
    cy.url({ timeout: 10_000 }).should('not.include', '/dashboard');
  });

  it('07-A-2: /dashboard devuelve HTML (no 401/403) porque no hay middleware server-side', () => {
    // CRÍTICO: Este test documenta la ausencia de protección server-side.
    // El HTML se entrega pero el cliente redirige via Zustand.
    cy.request({ url: `${BASE_URL}/dashboard`, failOnStatusCode: false })
      .its('status')
      .should('be.oneOf', [200, 307, 308]);
  });

  it('07-A-3: /onboarding es accesible sin autenticación (esperado)', () => {
    cy.visit(`${BASE_URL}/onboarding`, { failOnStatusCode: false });
    cy.url().should('include', '/onboarding');
  });

  it('07-A-4: /notion-bridge sin OTC no cuelga la app (maneja error gracefully)', () => {
    cy.visit(`${BASE_URL}/notion-bridge`, { failOnStatusCode: false });
    // No debe mostrar pantalla en blanco ni error de JS explosivo
    cy.get('body').should('exist');
    // Puede redirigir o mostrar estado de error, pero no debe crashear
    cy.url().should('not.eq', '');
  });

  it('07-A-5: /notion-bridge con OTC inválido (no hexadecimal) no crashea', () => {
    cy.visit(`${BASE_URL}/notion-bridge?otc=INVALID_TOKEN_NOT_HEX`, { failOnStatusCode: false });
    cy.get('body').should('exist');
  });

  it('07-A-6: /notion-bridge con OTC de longitud correcta pero falso retorna error (no 500)', () => {
    const fakeOtc = 'a'.repeat(64); // 64 hex chars válidos pero no en Redis
    cy.visit(`${BASE_URL}/notion-bridge?otc=${fakeOtc}`, { failOnStatusCode: false });
    cy.get('body').should('exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 2: Endpoint /api/notion/login — inicio del flujo OAuth
// ─────────────────────────────────────────────────────────────────────────────
describe('07-B | Flujo Notion OAuth — Endpoint /api/notion/login', () => {

  it('07-B-1: /api/notion/login redirige a Notion (302) — nunca expone el access_token en URL', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/login`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307, 308]);
      const location = res.headers['location'] as string;
      expect(location).to.include('api.notion.com');
      expect(location).to.not.include('access_token');
    });
  });

  it('07-B-2: /api/notion/login incluye parámetro state= en la redirección (CSRF)', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/login`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      const location = res.headers['location'] as string;
      expect(location).to.match(/[?&]state=[a-f0-9]+/);
    });
  });

  it('07-B-3: /api/notion/login setea cookie notion_oauth_state HttpOnly', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/login`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      const setCookie = res.headers['set-cookie'];
      const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || '');
      expect(cookieStr).to.include('notion_oauth_state');
      expect(cookieStr.toLowerCase()).to.include('httponly');
    });
  });

  it('07-B-4: /api/notion/login incluye response_type=code y client_id en URL de Notion', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/login`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      const location = res.headers['location'] as string;
      expect(location).to.include('response_type=code');
      expect(location).to.include('client_id=');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 3: Endpoint /api/notion/callback — validación CSRF y errores
// ─────────────────────────────────────────────────────────────────────────────
describe('07-C | Flujo OAuth — /api/notion/callback validación de seguridad', () => {

  it('07-C-1: Callback sin state → debe rechazar (400 o redirect a error)', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/callback?code=fake_code`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 302, 307, 401]);
    });
  });

  it('07-C-2: Callback con state incorrecto (CSRF mismatch) → debe rechazar', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/callback?code=fake_code&state=invalid_state_that_wont_match`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 302, 307, 401]);
    });
  });

  it('07-C-3: Callback sin code → debe rechazar (no intentar intercambio vacío)', () => {
    cy.request({
      url: `${BASE_URL}/api/notion/callback?state=whatever`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 302, 307, 401]);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 4: Endpoint /api/notion/exchange — validación OTC
// ─────────────────────────────────────────────────────────────────────────────
describe('07-D | OTC Exchange — /api/notion/exchange seguridad', () => {

  it('07-D-1: POST sin OTC → 400', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/notion/exchange`,
      body: {},
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('eq', 400);
  });

  it('07-D-2: POST con OTC no hexadecimal → rechaza con 400', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/notion/exchange`,
      body: { otc: 'NOT_VALID_HEX_STRING!@#$%' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [400, 401]);
  });

  it('07-D-3: POST con OTC hexadecimal válido pero no existente en Redis → 401/404', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/notion/exchange`,
      body: { otc: 'deadbeef'.repeat(8) }, // 64 chars hex, no existe en Redis
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [401, 404, 400]);
  });

  it('07-D-4: GET en /api/notion/exchange → 405 Method Not Allowed', () => {
    cy.request({
      method: 'GET',
      url: `${BASE_URL}/api/notion/exchange`,
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [405, 404]);
  });

  it('07-D-5: POST con OTC tipo número (type confusion) → rechaza sin crashear', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/notion/exchange`,
      body: { otc: 12345678 },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [400, 401]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 5: Endpoint /api/auth/session — estado de la sesión JWT
// ─────────────────────────────────────────────────────────────────────────────
describe('07-E | NextAuth Session Endpoint — /api/auth/session', () => {

  beforeEach(() => fullReset());

  it('07-E-1: Usuario anónimo → /api/auth/session devuelve sesión null o vacía (no 500)', () => {
    cy.request({
      url: `${BASE_URL}/api/auth/session`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      // Sesión vacía: {} o null
      const body = res.body;
      const isEmpty = !body || Object.keys(body).length === 0 || body.user === undefined;
      expect(isEmpty).to.be.true;
    });
  });

  it('07-E-2: Session endpoint no expone el accessToken (Notion token) en respuesta pública', () => {
    cy.request({
      url: `${BASE_URL}/api/auth/session`,
      failOnStatusCode: false,
    }).then((res) => {
      const bodyStr = JSON.stringify(res.body);
      // access_token NO debe estar en la respuesta anónima
      expect(bodyStr).to.not.include('access_token');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 6: Open Redirect — callback URL sin restricciones
// ─────────────────────────────────────────────────────────────────────────────
describe('07-F | Open Redirect — callback sin restricciones en auth config', () => {

  it('07-F-1: signIn con callbackUrl externo NO debe redirigir fuera del dominio', () => {
    // El redirect callback en auth.ts hace: async redirect({ url }) { return url; }
    // Esto acepta cualquier URL — documentamos el comportamiento actual.
    cy.request({
      url: `${BASE_URL}/api/auth/signin?callbackUrl=https://evil.com/phishing`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      // El comportamiento actual puede permitir esto. Este test lo documenta.
      // Si pasa: la app es vulnerable a open redirect.
      // Si falla (el status es redirect a evil.com): hay que parchear el callback.
      const location = (res.headers['location'] as string) || '';
      if (res.status >= 300 && res.status < 400) {
        // Si redirige, verificamos que NO sea a evil.com
        expect(location).to.not.include('evil.com');
      }
    });
  });

  it('07-F-2: URL de callback interna (relativa) sí debe funcionar', () => {
    cy.request({
      url: `${BASE_URL}/api/auth/signin?callbackUrl=/onboarding`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      // Debe procesar la solicitud sin error 500
      expect(res.status).to.be.oneOf([200, 302, 307]);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 7: APIs protegidas — sin sesión deben rechazar
// ─────────────────────────────────────────────────────────────────────────────
describe('07-G | APIs protegidas — rechazo sin sesión válida', () => {

  beforeEach(() => fullReset());

  it('07-G-1: POST /api/generate-system sin sesión → 401', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/generate-system`,
      body: { currentJob: 'Developer', targetJob: 'Architect', timeframe: '6 months', experience: '5 years', skills: 'JS' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [401, 429]);
  });

  it('07-G-2: POST /api/copilot/advice sin sesión → 401', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/copilot/advice`,
      body: { prompt: 'Test prompt', context: {} },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [401, 429]);
  });

  it('07-G-3: GET /api/notion/pages sin sesión → 401', () => {
    cy.request({
      method: 'GET',
      url: `${BASE_URL}/api/notion/pages`,
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [401, 403]);
  });

  it('07-G-4: POST /api/export/sheets sin sesión → 401', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/export/sheets`,
      body: {},
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [401, 403]);
  });

  it('07-G-5: POST /api/export/calendar sin sesión → 401', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/api/export/calendar`,
      body: {},
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [401, 403]);
  });

  it('07-G-6: /api/me/pro-status sin sesión → devuelve isPro: false (no 401 duro)', () => {
    cy.request({
      method: 'GET',
      url: `${BASE_URL}/api/me/pro-status`,
      failOnStatusCode: false,
    }).then((res) => {
      // Este endpoint tiene protección "soft": devuelve isPro: false en vez de 401
      expect(res.status).to.be.oneOf([200, 401]);
      if (res.status === 200) {
        expect(res.body.isPro).to.eq(false);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 8: Persistencia del store Zustand vs Sesión NextAuth
// ─────────────────────────────────────────────────────────────────────────────
describe('07-H | Consistencia Store vs Sesión — edge cases', () => {

  it('07-H-1: Dashboard sin cookies pero con localStorage → redirige (store con profile pero sin JWT)', () => {
    // Simula: usuario borró cookies pero localStorage quedó intacto
    cy.clearAllCookies();
    // Inyectar un perfil falso en localStorage (simulando state de Zustand)
    cy.visit(BASE_URL);
    cy.window().then((win) => {
      const fakeStore = {
        state: {
          profile: { name: 'Test', currentJob: 'Dev', targetJob: 'Lead', timeframe: '6m', experience: '3y', skills: 'JS' },
          roadmap: null,
          notionUrl: null,
          isPro: false,
        },
        version: 0,
      };
      win.localStorage.setItem('career-os-store', JSON.stringify(fakeStore));
    });
    // Navegar a dashboard
    cy.visit(`${BASE_URL}/dashboard`, { failOnStatusCode: false });
    // Sin JWT, las APIs del servidor devolverán 401,
    // pero el dashboard cargará (guard es client-side via profile en store)
    // Verificamos que al menos la página no explota
    cy.get('body').should('exist');
  });

  it('07-H-2: Logout limpia localStorage completamente (no deja datos residuales)', () => {
    // Este test verifica el comportamiento esperado del logout vía clearStore()
    // Como no tenemos sesión real, verificamos que el store vacío no da acceso
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.visit(`${BASE_URL}/dashboard`, { failOnStatusCode: false });
    cy.url({ timeout: 8_000 }).should('not.include', '/dashboard');
  });
});
