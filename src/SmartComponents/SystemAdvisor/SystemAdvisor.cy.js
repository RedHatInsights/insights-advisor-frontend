import _ from 'lodash';
import React from 'react';
import fixtures from '../../../cypress/fixtures/systemRecommendations.json';
import { BaseSystemAdvisor as SystemAdvisor } from './SystemAdvisor';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  checkTableHeaders,
  SORTING_ORDERS,
  TABLE,
  TOOLBAR,
} from '@redhat-cloud-services/frontend-components-utilities';
import { dateStringByType } from '@redhat-cloud-services/frontend-components/DateFormat/helper';
import { checkSorting } from '../../../cypress/utils/table';
import Wrapper from '../../Utilities/Wrapper';

const TABLE_HEADERS = [
  'Description',
  'Modified',
  'First impacted',
  'Total risk',
  'Remediation',
];
const ROOT = 'table[id=system-advisor-report-table]';
const SYSTEM_ID = '123';
const SYSTEM_INSIGHTS_ID = '456';

/*eslint-disable camelcase*/
describe('system rules table', () => {
  beforeEach(() => {
    cy.intercept('/api/insights/v1/account_setting/', {
      statusCode: 200,
      body: {},
    });
    cy.intercept(`/api/insights/v1/system/${SYSTEM_ID}/reports/`, fixtures);
    cy.intercept('https://access.redhat.com/hydra/rest/search/kcs**', {
      docs: [
        {
          publishedTitle: 'foobar',
          id: '123',
          view_uri: 'https://access.redhat.com/articles/123',
        },
      ],
    });
    cy.mount(
      <Wrapper>
        <SystemAdvisor
          entity={{
            id: SYSTEM_ID,
            insights_id: SYSTEM_INSIGHTS_ID,
          }}
        />
      </Wrapper>
    );
  });

  it('renders table', () => {
    cy.get(ROOT).should('have.length', 1);
    cy.get(TOOLBAR).should('have.length', 1);
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

  describe('sorting', () => {
    _.zip(
      [
        'rule.description',
        'rule.publish_date',
        'impacted_date',
        'rule.total_risk',
        'resolution.has_playbook',
      ],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      let sortingParameter = category;
      // modify sortingParameters for certain values
      if (category === 'rule.created_at') {
        sortingParameter = (it) =>
          it.rule.created_at || '1970-01-01T01:00:00.001Z';
      } else if (category === 'impacted_date') {
        sortingParameter = (it) =>
          it.impacted_date || '1970-01-01T01:00:00.001Z';
      } else if (category == 'resolution.has_playbook') {
        sortingParameter = (it) => it.resolution.has_playbook || false;
      }

      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          checkSorting(
            fixtures,
            sortingParameter,
            label,
            order,
            'Description',
            'rule.description'
          );
        });
      });
    });
  });
});
