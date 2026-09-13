describe('Suite 06 — Generación de Roadmap', () => {

  beforeEach(() => {
    // Interceptamos llamadas externas para aislar la UI
    cy.intercept('GET', '/api/notion/pages', {
      statusCode: 200,
      body: {
        pages: [
          { id: 'test-page-1', title: 'Mi Resume Notion', lastEdited: new Date().toISOString() },
        ],
      },
    }).as('getPages');

    // Estado base: usuario autenticado como 'free'
    cy.loginAs('free');
  });

  it('06-A: Guard "Ya tienes un roadmap generado" previene sobreescritura accidental', () => {
    cy.visit('/');
    cy.seedStore(2); // Sembrar store con un roadmap existente
    cy.visit('/onboarding');
    
    // El guard debería activarse
    cy.contains(/Ya tienes un roadmap generado/i).should('be.visible');
    cy.contains(/Empezar de cero/i).should('be.visible');
  });

  it('06-B: Rate limit (429) bloquea la generación cuando el usuario Free se queda sin cuota', () => {
    cy.intercept('POST', '/api/generate-system', {
      statusCode: 429,
      body: { error: 'Has alcanzado el límite de 2 generaciones gratuitas.' },
    }).as('generateRateLimit');

    // No sembramos roadmap para entrar al onboarding limpio
    cy.visit('/onboarding');
    cy.wait('@getPages');

    // Paso 1: Perfil
    cy.contains('Mi Resume Notion').click(); // Seleccionar página
    cy.get('#step1-name').type('Juan Perez');
    cy.get('#step1-role').type('Frontend Developer');
    cy.get('#level-junior').click();
    cy.get('#step1-next').click();

    // Paso 2: Metas
    cy.get('#step2-goal').type('Conseguir mi primer trabajo en 6 meses.');
    cy.get('#step2-sector').select('Desarrollo Web');
    // Horas por defecto = 10, lo dejamos así
    cy.get('#step2-next').click();

    // Paso 3: Skills
    cy.get('input[placeholder*="Ej: React"]').type('React{enter}TypeScript{enter}');
    cy.get('input[placeholder*="Google UX"]').type('Curso Udemy Next.js{enter}');
    cy.get('input[placeholder*="E-commerce"]').type('Pokedex App{enter}');
    
    // Generar
    cy.get('#step3-generate').click();

    // Debería intentar generar, recibir 429 y mostrar toast/error
    cy.wait('@generateRateLimit');
    cy.contains(/límite/i).should('be.visible');
  });

  it('06-C: Flujo feliz (Happy Path) genera el roadmap y redirige al dashboard', () => {
    cy.fixture('roadmap').then((data) => {
      cy.intercept('POST', '/api/generate-system', {
        statusCode: 200,
        delay: 1000,
        body: { roadmap: data.roadmap },
      }).as('generateSuccess');
    });


    cy.visit('/onboarding');
    cy.wait('@getPages');

    // Paso 1
    cy.contains('Mi Resume Notion').click();
    cy.get('#step1-name').type('Maria Gomez');
    cy.get('#step1-role').type('Data Scientist');
    cy.get('#level-junior').click();
    cy.get('#step1-next').click();

    // Paso 2
    cy.get('#step2-goal').type('Dominar Python y Machine Learning.');
    cy.get('#step2-sector').select('Data Science / IA');
    cy.get('#step2-next').click();

    // Paso 3
    cy.get('input[placeholder*="Ej: React"]').type('Python{enter}Pandas{enter}');
    cy.get('#step3-generate').click();

    // Comienza procesamiento (Paso 4)
    cy.contains(/IA Procesando/i).should('be.visible');
    cy.wait('@generateSuccess');

    // Paso 5: Éxito (aparece botón manual para ir al dashboard)
    cy.contains(/SISTEMA LISTO/i).should('be.visible');
    cy.get('#go-to-dashboard').click();
    
    cy.url().should('include', '/dashboard');
    // Verificamos que se renderice algo del dashboard (accesible para Free)
    cy.contains(/Tu Sistema Central/i).should('exist');
  });

});
