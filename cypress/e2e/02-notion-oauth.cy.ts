describe('Suite 02 — Notion OAuth + OTC Security', () => {
  beforeEach(() => { cy.clearLocalStorage(); cy.clearCookies(); });
  it('02-A: CTA de login redirige a api.notion.com sin access_token en URL', () => {
    cy.visit('/');
    cy.request({ url: '/api/notion/login', followRedirect: false }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307]);
      const loc = res.headers.location;
      expect(loc).to.include('api.notion.com');
      expect(loc).to.not.include('access_token');
      expect(loc).to.include('state=');
      const cookies = Array.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'].join() : res.headers['set-cookie'];
      expect(cookies).to.include('notion_oauth_state');
    });
  });
});
