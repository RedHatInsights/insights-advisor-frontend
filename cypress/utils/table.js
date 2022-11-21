import _ from 'lodash';

function checkSorting(
  data,
  sortingField,
  label,
  order,
  columnField,
  dataField
) {
  // get appropriate locators
  const header = `th[data-label="${label}"]`;

  // sort by column and verify URL
  if (order === 'ascending') {
    cy.get(header).find('button').click();
  } else {
    cy.get(header).find('button').click().click(); // TODO dblclick fails for unknown reason in RecsListTable when sorting by Clusters
  }

  let sortedValues = _.map(
    _.orderBy(data, [sortingField], [order === 'descending' ? 'desc' : 'asc']),
    dataField
  );

  cy.get(`td[data-label="${columnField}"]`)
    .then(($els) => {
      return _.map(Cypress.$.makeArray($els), 'innerText');
    })
    .should('deep.equal', sortedValues);
}

export { checkSorting };
