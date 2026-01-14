/* eslint-disable rulesdir/disallow-fec-relative-imports */
// eslint-disable-next-line prettier/prettier
import _ from 'lodash';
import {
  CONDITIONAL_FILTER_TOGGLE,
  PT_CONDITIONAL_FILTER_LIST,
} from '@redhat-cloud-services/frontend-components-utilities';

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
    } else if (item.type === 'singleSelect') {
      cy.get('[class*=pf-v5-c-menu-toggle][aria-label="Options menu"]').click();
      cy.get('ul[class=pf-v5-c-menu__list]')
        .find('span')
        .contains(value)
        .parent()
        .parent()
        .click();
    } else {
      throw `${item.type} not recognized`;
    }
  }
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

function selectConditionalFilterOption(option) {
  cy.get(CONDITIONAL_FILTER_TOGGLE).click();
  cy.get(PT_CONDITIONAL_FILTER_LIST).contains(option).click();
}

function selectRandomEnabledRows({ rows, numberOfRowsToSelect }) {
  const enabledRows = Array.from(rows).filter((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.hasAttribute('disabled')) {
      return true;
    }
  });
  const rowCount = enabledRows.length;

  const randomIndices = [];
  while (randomIndices.length < numberOfRowsToSelect) {
    const randomIndex = Math.floor(Math.random() * rowCount);
    if (!randomIndices.includes(randomIndex)) {
      randomIndices.push(randomIndex);
    }
  }

  randomIndices.forEach((index) => {
    enabledRows[index].querySelector('input[type="checkbox"]').click();
  });
}

const itExportsDataToFile = (jsonData, filenamePrefix) => {
  it('exports data to JSON and CSV files', () => {
    cy.clock(Date.now());

    // the toggle of the export dropdown has aria-label of "Export"
    // the actual dropdown has ouiaId of "Export"

    cy.get('[aria-label=Export]').click();

    cy.get('[data-ouia-component-id=Export] .pf-v5-c-menu__item').should(
      'have.length',
      3
    );

    cy.get('[data-ouia-component-id=Export] .pf-v5-c-menu__item')
      .contains('Export to JSON')
      .click();

    cy.get('[aria-label=Export]').click();

    cy.get('[data-ouia-component-id=Export] .pf-v5-c-menu__item')
      .contains('Export to CSV')
      .click();

    const formattedDate =
      new Date().toISOString().replace(/[T:]/g, '-').split('.')[0] + '-utc';

    cy.readFile(`cypress/downloads/${filenamePrefix + formattedDate}.json`)
      .should('exist')
      .should('deep.equal', jsonData);

    // CSV data is not mocked so it's filled with JSON in the test, we just test
    // its existence, not its contents
    cy.readFile(
      `cypress/downloads/${filenamePrefix + formattedDate}.csv`
    ).should('exist');
  });
};

export {
  checkSorting,
  cypressApplyFilters,
  cumulativeCombinations,
  selectRandomEnabledRows,
  selectConditionalFilterOption,
  itExportsDataToFile,
};
