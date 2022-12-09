import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getStore } from '../../Store';
import PathwaysTable from './PathwaysTable';
import fixtures from '../../../cypress/fixtures/pathways.json';
import { pathwaysTableColumns } from '../../../cypress/support/globals';
import _ from 'lodash';

// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  TOOLBAR,
  checkTableHeaders,
} from '@redhat-cloud-services/frontend-components-utilities';

const ROOT = 'table[aria-label="pathways-table"]';
const TABLE_HEADERS = _.map(pathwaysTableColumns, (it) => it.title);

const mountComponent = () => {
  let activeTab = 1;
  const store = getStore();
  cy.mount(
    <MemoryRouter>
      <IntlProvider locale={navigator.language.slice(0, 2)}>
        <Provider store={store}>
          <PathwaysTable isTabActive={activeTab} />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};
describe('defaults', () => {
  beforeEach(() => {
    cy.intercept('*', {
      statusCode: 201,
      body: {
        ...fixtures,
      },
    }).as('call');
    mountComponent();
  });
  it('The Rules table renders', () => {
    cy.get(ROOT).should('have.length', 1);
  });
  it('renders toolbar', () => {
    cy.get(TOOLBAR).should('have.length', 1);
  });
  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });
});
