/* eslint-disable rulesdir/disallow-fec-relative-imports */
// eslint-disable-next-line prettier/prettier
import { CHIP, CHIP_GROUP, checkTableHeaders, checkEmptyState, removeAllChips } from '@redhat-cloud-services/frontend-components-utilities';
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
    // eslint-disable-next-line cypress/unsafe-to-chain-command
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

function cypressApplyFilters(filters, filtersConf) {
  for (const [key, value] of Object.entries(filters)) {
    const item = filtersConf[key];
    // open filter selector
    cy.get('div.ins-c-primary-toolbar__filter')
      .find(
        'button[class*="pf-v5-c-menu-toggle ins-c-conditional-filter__group"]'
      )
      .click();

    // select appropriate filter
    cy.get('ul[class=pf-v5-c-menu__list]').contains(item.selectorText).click();

    // fill appropriate filter
    if (item.type === 'input') {
      cy.get('input[data-ouia-component-id=ConditionalFilter]').type(value);
    } else if (item.type === 'checkbox') {
      cy.get('[class*=pf-v5-c-menu-toggle][aria-label="Options menu"]').click();
      value.forEach((it) => {
        cy.get('ul[class=pf-v5-c-menu__list]')
          .find('label')
          .contains(it)
          .parent()
          .find('input[type=checkbox]')
          .check();
      });
      // close dropdown again
      cy.get('[class*=pf-v5-c-menu-toggle][aria-label="Options menu"]').click();
    } else if (item.type == 'radio') {
      cy.get('[class*=pf-v5-c-menu-toggle][aria-label="Options menu"]').click();
      cy.get('ul[class=pf-v5-c-menu__list]')
        .find('label')
        .contains(value)
        .parent()
        .find('input[type=radio]')
        .check();
    } else {
      throw `${item.type} not recognized`;
    }
  }
}

function checkFiltering(
  filters,
  filtersConf,
  values,
  columnName,
  tableHeaders,
  emptyStateTitle,
  validateURL,
  hasDefaultFilters
) {
  if (hasDefaultFilters) {
    removeAllChips();
  }
  cypressApplyFilters(filters, filtersConf);

  if (values.length === 0) {
    checkEmptyState(emptyStateTitle);
    checkTableHeaders(tableHeaders);
  } else {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(`td[data-label="${columnName}"]`)
      .should('have.length', values.length)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', values);
  }

  // validate chips and url params
  cy.get(CHIP_GROUP)
    .should('have.length', Object.keys(filters).length)
    .then(() => {
      if (validateURL) {
        for (const [k, v] of Object.entries(filtersConf)) {
          if (k in filters) {
            const urlValue = v.urlValue(filters[k]);
            expect(window.location.search).to.contain(
              `${v.urlParam}=${urlValue}`
            );
          } else {
            expect(window.location.search).to.not.contain(`${v.urlParam}=`);
          }
        }
      }
    });

  // check chips
  for (const [k, v] of Object.entries(filters)) {
    let groupName = filtersConf[k].selectorText;
    const nExpectedItems = filtersConf[k].type === 'checkbox' ? v.length : 1;
    cy.get(CHIP_GROUP)
      .contains(groupName)
      .parents(CHIP_GROUP)
      .then((chipGroup) => {
        cy.wrap(chipGroup)
          .find(CHIP)
          .its('length')
          .should('be.eq', Math.min(3, nExpectedItems)); // limited to show 3
      });
  }
  cy.get('button').contains('Reset filters').should('exist');
}

function filter(conf, data, filters) {
  let filteredData = data;
  for (const [key, value] of Object.entries(filters)) {
    filteredData = _.filter(filteredData, (it) =>
      conf[key].filterFunc(it, value)
    );
    // if length is already 0, exit
    if (filteredData.length === 0) {
      break;
    }
  }

  return filteredData;
}

//function and filters config for testing filters
function* cumulativeCombinations(arr, current = []) {
  let i = 0;
  while (i < arr.length) {
    let next = current.concat(arr[i]);
    yield next;
    i++;
    const remaining = arr.slice(i);
    if (remaining.length) {
      yield* cumulativeCombinations(remaining, next);
    }
  }
}

export {
  checkSorting,
  cypressApplyFilters,
  checkFiltering,
  filter,
  cumulativeCombinations,
};
