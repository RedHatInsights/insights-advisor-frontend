import { BASE_URL } from '../../src/AppConstants';
import messages from '../../src/Messages';
import { createIntl, createIntlCache } from 'react-intl';

//declaring intl to provie it to the columns
const cache = createIntlCache();
const intl = createIntl(
  {
    onError: console.error,
    locale: navigator.language.slice(0, 2),
  },
  cache,
);
export const rulesTableColumns = [
  {
    title: 'Data expansion table header cell',
  },
  {
    title: intl.formatMessage(messages.name),
  },
  {
    title: intl.formatMessage(messages.modified),
  },
  {
    title: intl.formatMessage(messages.category),
  },
  {
    title: intl.formatMessage(messages.totalRisk),
  },
  {
    title: intl.formatMessage(messages.systems),
  },
  {
    title: intl.formatMessage(messages.remediation),
  },
];

export const CATEGORIES = {
  Security: ['security'],
  Availability: ['availability'],
  Performance: ['performance'],
  Stability: ['stability'],
};

export const pathwaysTableColumns = [
  {
    title: 'Name',
  },
  {
    title: 'Category',
  },
  {
    title: 'Systems',
  },
  {
    title: 'Reboot',
  },
  {
    title: 'Recommendation level',
  },
];

export const topicsTableColumns = [
  { title: intl.formatMessage(messages.name) },
  {
    title: intl.formatMessage(messages.featured),
  },
  {
    title: intl.formatMessage(messages.affectedSystems),
  },
];

export const createTestEnvironmentContext = () => {
  // These calls to cy.stub() will only execute when this function is called.
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

  return {
    isLoading: false,
    isExportEnabled: true,
    isDisableRecEnabled: true,
    isAllowedToViewRec: true,
    displayGroupsTagsColumns: true,
    displayRuleRatings: true,
    displayRecPathways: true,
    displayExecReportLink: true,
    displayDownloadPlaybookButton: false,
    changeRemediationButtonForIop: false,
    loadChromeless: false,
    updateDocumentTitle: updateDocumentTitleStub,
    getUser: getUserStub,
    on: onStub,
    hideGlobalFilter: hideGlobalFilterStub,
    mapGlobalFilter: mapGlobalFilterStub,
    globalFilterScope: globalFilterScopeStub,
    requestPdf: requestPdfStub,
    isProd: isProdStub,
    BASE_URI: document.baseURI,
    BASE_URL: '/api/insights/v1',
    UI_BASE: './insights',
    RULES_FETCH_URL: `${BASE_URL}/rule/`,
    STATS_SYSTEMS_FETCH_URL: `${BASE_URL}/stats/systems/`,
    STATS_REPORTS_FETCH_URL: `${BASE_URL}/stats/reports/`,
    STATS_OVERVIEW_FETCH_URL: `${BASE_URL}/stats/overview/`,
    SYSTEMS_FETCH_URL: `${BASE_URL}/system/`,
    EDGE_DEVICE_BASE_URL: '/api/edge/v1',
    INVENTORY_BASE_URL: '/api/inventory/v1',
    REMEDIATIONS_BASE_URL: '/api/remediations/v1',
  };
};
