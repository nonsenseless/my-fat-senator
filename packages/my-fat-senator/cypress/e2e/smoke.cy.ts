describe("smoke tests", () => {

  it("should render the navbar", () => {
    cy.visit('/');
    cy.get('.navbar').should('be.visible');
  });

  it("should load vote search as the landing page", () => {
    cy.visit('/');
    cy.location('pathname').should('eq', '/votes');
    cy.get('#VoteSearchForm').should('be.visible');
  });

  it("should submit vote search filters", () => {
    cy.visit('/votes');
    cy.get('input[name="q"]').type('cloture');
    cy.get('button[type="submit"]').contains('Submit').click();

    cy.location('pathname').should('eq', '/votes');
    cy.location('search').should('contain', 'q=cloture');
  });

});
