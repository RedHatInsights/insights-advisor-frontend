import React from 'react';
import Details from './Details';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { Provider } from 'react-redux';
import { initStore } from '../../Store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountStatContext } from '../../ZeroStateWrapper';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import fixtures from '../../../cypress/fixtures/recommendations.json';
import { itExportsDataToFile } from '../../../cypress/utils/table';
import { hasChip } from '@redhat-cloud-services/frontend-components-utilities';
/**
 * Mounts the Details component with a configurable environment context.
 *
 * @param {boolean} hasEdgeDevices - Whether the user has Edge devices.
 * @param {object} envContextOverrides - Optional overrides for the default EnvironmentContext values.
 *
 */
const mountComponent = (hasEdgeDevices, envContextOverrides = {}) => {
  const updateDocumentTitleStub = cy.stub().as('updateDocumentTitleStub');
  const getUserStub = cy
    .stub()
    .returns({ identity: { user: { username: 'testuser' } } })
    .as('getUserStub');
  const onStub = cy.stub().as('onStub');
  const hideGlobalFilterStub = cy.stub().as('hideGlobalFilterStub');
  const mapGlobalFilterStub = cy.stub().as('mapGlobalFilterStub');
  const globalFilterScopeStub = cy.stub().as('globalFilterScopeStub');
  const requestPdfStub = cy.stub().as('requestPdfStub');
  const isProdStub = cy.stub().returns(false).as('isProdStub');

  const defaultEnvContext = {
    isLoading: false,
    isExportEnabled: true,
    isDisableRecEnabled: true,
    isAllowedToViewRec: true,
    updateDocumentTitle: updateDocumentTitleStub,
    getUser: getUserStub,
    on: onStub,
    hideGlobalFilter: hideGlobalFilterStub,
    mapGlobalFilter: mapGlobalFilterStub,
    globalFilterScope: globalFilterScopeStub,
    requestPdf: requestPdfStub,
    isProd: isProdStub,
  };

  const finalEnvContext = { ...defaultEnvContext, ...envContextOverrides };

  cy.mount(
    <EnvironmentContext.Provider value={finalEnvContext}>
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
    </EnvironmentContext.Provider>,
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
  cy.intercept(
    '/api/insights/v1/rule/?&impacting=true&rule_status=enabled&sort=-total_risk&limit=20&offset=0',
    {
      data: [],
    },
  ).as('rules_table_call');
  cy.intercept(
    '/api/insights/v1/rule/?&topic=123&update_method=ostree%2Cdnfyum&impacting=true&rule_status=enabled&sort=-total_risk&limit=10&offset=0',
    {
      data: [],
    },
  ).as('rules_table_initial_call');
});

describe('Topic Details is loaded correctly for user with Edge systems', () => {
  beforeEach(() => {
    mountComponent(true);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more Conventional systems (RPM-DNF)');
    hasChip('Systems impacted', '1 or more Immutable (OSTree)');
  });
});

describe('Topic Details is loaded correctly for user without Edge systems', () => {
  beforeEach(() => {
    mountComponent(false);
  });

  it('Correct default filters for Recommendation table', () => {
    cy.wait(['@rules_table_initial_call']);
    hasChip('Status', 'Enabled');
    hasChip('Systems impacted', '1 or more');
  });
});

describe('Export', () => {
  it(`Export kebab tooltip displays the correct content if disabled.`, () => {
    mountComponent(true, {
      isExportEnabled: false,
    });
    cy.get('button[aria-label="Export"]').first().trigger('mouseenter');
    cy.contains(messages.permsAction.defaultMessage).should('be.visible');
  });

  it(`works and downloads report is enabled`, () => {
    mountComponent(false);
    itExportsDataToFile(fixtures.data, 'Insights-Advisor_hits--');
    // Ensure requestPdf is NOT called, as itExportsDataToFile likely simulates a direct download
    cy.get('@requestPdfStub').should('not.have.been.called');
  });
});
