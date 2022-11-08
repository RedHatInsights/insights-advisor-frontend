import React from 'react';
import { BaseSystemAdvisor as SystemAdvisor } from './SystemAdvisor';
import { getStore } from '../../Store';
import { mount } from '@cypress/react';
import messages from '../../Messages';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import _ from 'lodash';
import fixtures from '../../../cypress/fixtures/systemRecommendations.json';
import { systemAdvisorColumns } from '../../../cypress/support/globals';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import { checkTableHeaders } from '@redhat-cloud-services/frontend-components-utilities';
import { dateStringByType } from '@redhat-cloud-services/frontend-components/DateFormat/helper';

const TABLE = '#system-advisor-report-table';
const TABLE_HEADERS = _.map(systemAdvisorColumns, (header) => header.title);
const SYSTEM_ID = '123';
const SYSTEM_INSIGHTS_ID = '456';

/*eslint-disable camelcase*/
describe('System Advisor', () => {
  beforeEach(() => {
    cy.intercept('/api/insights/v1/account_setting/', {
      statusCode: 200,
      body: {},
    });
    cy.intercept(`/api/insights/v1/system/${SYSTEM_ID}/reports/`, fixtures);
    mount(
      <IntlProvider messages={messages}>
        <Provider store={getStore()}>
          <MemoryRouter>
            <SystemAdvisor
              entity={{
                id: SYSTEM_ID,
                insights_id: SYSTEM_INSIGHTS_ID,
              }}
            />
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('renders table', () => {
    cy.get(TABLE).should('have.length', 1);
  });

  it('renders table headers', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  it('renders "First impacted" date correctly', () => {
    const date = dateStringByType('relative')(
      new Date(fixtures[0].impacted_date)
    );
    cy.get('td[data-label="First impacted"]').first().should('contain', date);
  });
});
