// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add(
  'ouiaId',
  { prevSubject: 'optional' },
  (subject, item, el = '') => {
    const attr = `${el}[data-ouia-component-id="${item}"]`;
    return subject ? cy.wrap(subject).find(attr) : cy.get(attr);
  },
);

Cypress.Commands.add(
  'ouiaType',
  { prevSubject: 'optional' },
  (subject, item, el = '') => {
    const attr = `${el}[data-ouia-component-type="${item}"]`;
    return subject ? cy.wrap(subject).find(attr) : cy.get(attr);
  },
);

Cypress.Commands.add('clickOnRowKebab', (name) => {
  cy.contains('tbody [data-ouia-component-type="PF6/TableRow"]', name)
    .find('.pf-v6-c-menu-toggle')
    .click();
});

Cypress.Commands.add('tableIsSortedBy', (columnTitle, direction = null) => {
  if (direction) {
    return cy
      .get('th')
      .contains(columnTitle)
      .closest('th')
      .should('have.class', 'pf-v6-c-table__sort')
      .and('have.class', 'pf-m-selected')
      .and('have.attr', 'aria-sort', direction);
  }

  return cy
    .get('th')
    .contains(columnTitle)
    .closest('th')
    .should('have.class', 'pf-v6-c-table__sort')
    .and('have.class', 'pf-m-selected');
});
