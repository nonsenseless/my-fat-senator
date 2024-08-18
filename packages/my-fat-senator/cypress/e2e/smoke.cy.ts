describe("smoke tests", () => {

  it("should render the navbar", () => {
    cy.visit('/');
    cy.get('.navbar').should('be.visible');
  });

});
