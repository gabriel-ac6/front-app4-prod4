describe('Ionic Tabs Component with Authentication', () => {
    beforeEach(() => {
        // Visita a página inicial antes de cada teste
        cy.visit('https://192.168.15.13:8100/tabs/tab1'); // substitua com a URL correta do seu app
    });

    it('should successfully log in with valid registry and token and show Logoff button', () => {
        // Mock da resposta da API para simular um login bem-sucedido
        cy.intercept('POST', '/api/auth/session', {
            statusCode: 200,
            body: { token: 'dummyToken' }, // Retorna um token de sessão fictício
        }).as('loginRequest');

        // Insere matrícula e token válidos
        cy.get('ion-input[placeholder="Exemplo(SP3086420)"] input').type('0123456789');
        cy.get('ion-input[placeholder="Exemplo(X89!0aoto00...)"] input').type('145820');

        // Clica no botão de validação
        cy.get('ion-button').contains('Entrar').click();

        // Espera a resposta da API de login
        cy.wait('@loginRequest');

        // Verifica se o token foi armazenado no sessionStorage
        cy.window().then((win) => {
            expect(win.sessionStorage.getItem('sessionToken')).to.equal('dummyToken');
        });

        // Verifica se o botão de Logoff aparece
        cy.get('ion-tab-button').contains('Logoff').should('be.visible');

        // Testa a funcionalidade do botão de Logoff
        cy.get('ion-tab-button').contains('Logoff').click();

        // Espera a chamada de logout e verifica se o token foi removido
        cy.window().then((win) => {
            expect(win.sessionStorage.getItem('sessionToken')).to.be.null;
        });

        // Verifica se foi redirecionado para a página de login
        cy.url().should('include', '/tabs/tab1');
    });

    it('should navigate to the camera page when "Tirar Foto" button is clicked after successful login', () => {
        // Mock da resposta da API para simular um login bem-sucedido
        cy.intercept('POST', '/api/auth/session', {
            statusCode: 200,
            body: { token: 'dummyToken' }, // Retorna um token de sessão fictício
        }).as('loginRequest');

        // Insere matrícula e token válidos
        cy.get('ion-input[placeholder="Exemplo(SP3086420)"] input').type('0123456789');
        cy.get('ion-input[placeholder="Exemplo(X89!0aoto00...)"] input').type('145820');

        // Clica no botão de validação
        cy.get('ion-button').contains('Entrar').click();

        // Espera a resposta da API de login
        cy.wait('@loginRequest');

        // Verifica se o token foi armazenado no sessionStorage
        cy.window().then((win) => {
            expect(win.sessionStorage.getItem('sessionToken')).to.equal('dummyToken');
        });

        // Verifica se o botão "Tirar Foto" está visível
        cy.get('ion-tab-button[tab="tab2"]').should('be.visible');
        cy.get('ion-tab-button[tab="tab2"]').contains('Tirar Foto');

        // Clica no botão e verifica a navegação
        cy.get('ion-tab-button[tab="tab2"]').click();
        cy.url().should('include', '/tabs/tab2');
    });

    it('should return a 400 error for invalid registry and token', () => {
        // Mock da resposta da API para simular um login mal-sucedido
        cy.intercept('POST', '/api/auth/session', {
            statusCode: 400,
            body: { message: 'Matrícula ou token inválidos.' },
        }).as('loginRequest');

        // Insere matrícula e token inválidos
        cy.get('ion-input[placeholder="Exemplo(SP3086420)"] input').type('wrongRegistry');
        cy.get('ion-input[placeholder="Exemplo(X89!0aoto00...)"] input').type('wrongToken');

        // Clica no botão de validação
        cy.get('ion-button').contains('Entrar').click();

        // Espera a resposta da API de login
        cy.wait('@loginRequest').then((interception) => {
            // Verifica se o status code da resposta é 400
            expect(interception.response.statusCode).to.eq(400);
        });
    });

    it('should return a 500 error for server errors', () => {
        // Mock da resposta da API para simular um erro de servidor
        cy.intercept('POST', '/api/auth/session', {
            statusCode: 500,
            body: { message: 'Erro no servidor' },
        }).as('serverError');

        // Insere matrícula e token inválidos
        cy.get('ion-input[placeholder="Exemplo(SP3086420)"] input').type('wrongRegistry');
        cy.get('ion-input[placeholder="Exemplo(X89!0aoto00...)"] input').type('wrongToken');

        // Clica no botão de validação
        cy.get('ion-button').contains('Entrar').click();

        // Espera a resposta da API de login
        cy.wait('@serverError').then((interception) => {
            // Verifica se o status code da resposta é 500
            expect(interception.response.statusCode).to.eq(500);
        });
    });

    it('should navigate through swiper slides correctly and check the final slide for photo', () => {
        // Mock da resposta da API para simular um login bem-sucedido
        cy.intercept('POST', '/api/auth/session', {
            statusCode: 200,
            body: { token: 'dummyToken' }, // Retorna um token de sessão fictício
        }).as('loginRequest');

        // Insere matrícula e token válidos
        cy.get('ion-input[placeholder="Exemplo(SP3086420)"] input').type('0123456789');
        cy.get('ion-input[placeholder="Exemplo(X89!0aoto00...)"] input').type('145820');

        // Clica no botão de validação
        cy.get('ion-button').contains('Entrar').click();

        // Espera a resposta da API de login
        cy.wait('@loginRequest');

        // Verifica se o token foi armazenado no sessionStorage
        cy.window().then((win) => {
            expect(win.sessionStorage.getItem('sessionToken')).to.equal('dummyToken');
        });

        cy.url().should('include', '/tabs/tab2'); // Verifica se está na página correta

        // Navega pelos slides
// Navega pelos slides
cy.get('swiper-container').within(() => {
    cy.get('#face').click(); // Navega para o próximo slide
    cy.wait(3000); // Espera 3 segundos para a animação do swiper

    cy.get('#wall').click(); // Navega para o próximo slide
    cy.wait(3000);

    cy.get('#lampada').click(); // Navega para o próximo slide
    cy.wait(3000);

    cy.get('#exclude').click(); // Navega para o próximo slide
    cy.wait(3000);

    // Verifica se está no último slide
    cy.get('swiper-slide').last().should('be.visible');

    // Marca o checkbox
    cy.get('input[type="checkbox"]').check(); // Marca o checkbox

    cy.get('#finalizar').click(); // Navega para o próximo slide


});
                // Clica no botão com id "capture"
                cy.get('#capture').click();

                // Clica no botão com id "send"
                cy.get('#send').click();
    });
});
