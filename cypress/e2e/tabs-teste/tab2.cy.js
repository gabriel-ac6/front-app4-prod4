describe('Tab2 Page Tests', () => {
    beforeEach(() => {
      cy.visit('https://192.168.15.13:8100/tabs/tab2'); // Navegue até a página de tab2
    });
  
    it('should display the camera view when instructions are hidden', () => {
      // Verifique se as instruções estão ocultas e a câmera está visível
      cy.get('ion-card').should('contain', 'Tire sua foto');
      cy.get('video').should('be.visible');
      cy.get('img[src="../../assets/icon/user.png"]').should('be.visible');
    });
  
    it('should take a picture and show it', () => {
      // Simula a ação de tirar uma foto
      cy.get('button').contains('Tirar Foto').click();
      cy.get('img[src*="data:image/jpeg;base64"]').should('be.visible');
      cy.get('button').contains('Enviar Foto').should('be.visible');
      cy.get('button').contains('Cancelar').should('be.visible');
    });
  
    it('should cancel the photo and restart the camera', () => {
      cy.get('button').contains('Tirar Foto').click();
      cy.get('button').contains('Cancelar').click();
      cy.get('video').should('be.visible');
      cy.get('img[src="../../assets/icon/user.png"]').should('be.visible');
    });
  
    it('should toggle between showing and hiding instructions', () => {
      // Aceite os termos para poder finalizar
      cy.get('input[type="checkbox"]').check();
  
      // Verifique se as instruções são exibidas
      cy.get('button').contains('Voltar para as Instruções').click();
      cy.get('swiper-container').should('be.visible');
  
      // Finalize e verifique se as instruções estão ocultas
      cy.get('button').contains('Finalizar').click();
      cy.get('video').should('be.visible');
    });
  
    it('should show modal and capture photo', () => {
      cy.get('button').contains('Tirar Foto').click();
      cy.get('ion-button').contains('Captura de Foto').click();
      cy.get('ion-modal').should('be.visible');
      cy.get('button').contains('Tirar Foto').click();
      cy.get('img[src*="data:image/jpeg;base64"]').should('be.visible');
    });
  });
  