import React from 'react';
import Details from './Details';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { Provider } from 'react-redux';
import { initStore } from '../../Store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountStatContext } from '../../ZeroStateWrapper';
//eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import { hasChip } from '@redhat-cloud-services/frontend-components-utilities';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import { DEFAULT_TEST_CY_ENVIRONMENT_CONTEXT } from '../../../cypress/support/globals';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import { itExportsDataToFile } from '../../../cypress/utils/table';

const mountComponent = (hasEdgeDevices, envContext) => {
  cy.mount(
    <EnvironmentContext.Provider value={envContext}>
      <MemoryRouter initialEntries={['/topics/123']}>
        <AccountStatContext.Provider value={{ hasEdgeDevices }}>
          <IntlProvider locale={navigator.language.slice(0, 2)}>
            <Provider store={initStore()}>
              <Routes>
                <Route path="topics/:id" element={<Details />}></Route>
              </Routes>
            </Provider>
          </IntlProvider>
        </AccountStatContext.Provider>
      </MemoryRouter>
    </EnvironmentContext.Provider>
  );
};

beforeEach(() => {
  cy.intercept('/api/insights/v1/topic/123/?&topicId=123', {
    name: 'Amazon Web Services (AWS)',
    slug: 'aws',
    description:
      'Increase stability of your RHEL workloads running on Amazon Web Services by applying these recommendations.',
    tag: 'aws',
    featured: true,
    enabled: true,
    impacted_systems_count: 0,
  }).as('topic_details_call');
  // This call is generated implicitly by using the RulesTable
  cy.intercept(
    '/api/insights/v1/rule/?&impacting=true&rule_status=enabled&sort=-total_risk&limit=20&offset=0',
    {
      data: [],
    }
  ).as('rules_table_call');
  cy.intercept(
    '/api/insights/v1/rule/?&topic=123&update_method=ostree%2Cdnfyum&impacting=true&rule_status=enabled&sort=-total_risk&limit=10&offset=0',
    {
      data: [],
    }
  ).as('rules_table_initial_call');
});

describe('Topic Details is loaded correctly for user with Edge systems', () => {
  beforeEach(() => {
    mountComponent(true, DEFAULT_TEST_CY_ENVIRONMENT_CONTEXT);
  });

  it('Correct deffault filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more Conventional systems (RPM-DNF)');
    hasChip('Systems impacted', '1 or more Immutable (OSTree)');
  });
});

describe('Topic Details is loaded correctly for user without Edge systems', () => {
  beforeEach(() => {
    mountComponent(false, DEFAULT_TEST_CY_ENVIRONMENT_CONTEXT);
  });

  it('Correct deffault filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
  });
});

describe('Export', () => {
  it(`Export kebab tooltip displays the correct content if disabled.`, () => {
    mountComponent(true, {
      isLoading: false,
      isExportEnabled: false,
      isDisableRecEnabled: true,
      isAllowedToViewRec: true,
      updateDocumentTitle: () => {},
      getUser: () => '',
      on: () => {},
      hideGlobalFilter: () => {},
      mapGlobalFilter: () => {},
      globalFilterScope: () => {},
      requestPdf: () => {},
      isProd: () => {},
    });
    cy.get('button[aria-label="Export"]').first().trigger('mouseenter');
    cy.contains(messages.permsAction.defaultMessage).should('be.visible');
  });
  it(`works and downloads report is enabled`, () => {
    mountComponent(false, DEFAULT_TEST_CY_ENVIRONMENT_CONTEXT);
    itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
  });
});
