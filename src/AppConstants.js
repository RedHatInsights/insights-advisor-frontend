import { createIntl, createIntlCache } from 'react-intl';

import { intlHelper } from '@redhat-cloud-services/frontend-components-translations/';
import messages from './Messages';
import { strong } from './Utilities/intlHelper';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import { SearchIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl(
  {
    locale,
  },
  cache,
);
const intlSettings = { locale };

export const BASE_URI = document.baseURI;
export const BASE_URL = '/api/insights/v1';
export const UI_BASE = './insights';
export const DEBOUNCE_DELAY = 600;
export const RULES_FETCH_URL = `${BASE_URL}/rule/`;
export const STATS_SYSTEMS_FETCH_URL = `${BASE_URL}/stats/systems/`;
export const STATS_REPORTS_FETCH_URL = `${BASE_URL}/stats/reports/`;
export const STATS_OVERVIEW_FETCH_URL = `${BASE_URL}/stats/overview/`;
export const SYSTEMS_FETCH_URL = `${BASE_URL}/system/`;
export const EDGE_DEVICE_BASE_URL = '/api/edge/v1';
export const INVENTORY_BASE_URL = '/api/inventory/v1';
export const REMEDIATIONS_BASE_URL = '/api/remediations/v1';
export const SYSTEM_TYPES = { rhel: 105, ocp: 325 };
export const RULE_CATEGORIES = {
  availability: 1,
  security: 2,
  stability: 3,
  performance: 4,
};
export const SEVERITY_MAP = {
  'critical-risk': 4,
  'high-risk': 3,
  'medium-risk': 2,
  'low-risk': 1,
};
export const SEVERITY = 'Severity';
export const TOTAL_RISK_CONSTANTS = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  IMPORTANT: 'Important',
  CRITICAL: 'Critical',
};
export const CATEGORY_CONSTANTS = {
  AVAILABILITY: 'Availability',
  PERFORMANCE: 'Performance',
  STABILITY: 'Stability',
  SECURITY: 'Security',
};
export const POUND_OF_RECS = '# of recommendations';
export const REC_NUM_AND_PERCENTAGE = (count, total) =>
  `${count} (${total}% of total)`;
export const CATEGORY = 'Category';
export const CATEGORY_HEADER =
  'Recently identified recommendations by category';
export const TOP_THREE_RULES_HEADER =
  'Top 3 recommendations in your infrastructure';
export const INSIGHTS_HEADER = 'Advisor';
export const EXEC_REPORT_HEADER = (systems, risks) =>
  `This report is an executive summary of recommendations that may impact your Red Hat Enterprise Linux servers. Red Hat Advisor service is analyzing ${systems} and has identified ${risks} that impact 1 or more of these systems.`;
export const EXEC_REPORT_HEADER_SYSTEMS = (systemsCount) => {
  const sys = systemsCount <= 1 ? 'system' : 'systems';
  return `${systemsCount} RHEL ${sys}`;
};
export const EXEC_REPORT_HEADER_RISKS = (risksCount) => {
  const risk = risksCount <= 1 ? 'Risk' : 'Risks';
  return `${risksCount} ${risk}`;
};
export const SEVERITY_HEADER = 'Identified recommendations by severity';
export const SYSTEMS_EXPOSED = 'Systems exposed';
export const TOTAL_RISK = 'Total risk';

export const NAME = 'Name';
export const RECOMMENDATIONS = 'Recommendations';
export const LAST_SEEN = 'Last seen';
export const SYSTEMS = 'Systems';
export const SYSCOUNT = 'This report identified ';
export const DUE_TO =
  ' - Due to browser limitations, showing the first 1000 systems';
export const FILTERS_APPLIED = 'Filters applied:';
export const TAGS_APPLIED = 'Tags applied:';
export const NO_TAGS = 'No tags';

// Recommendations OverviewDashbarCards titles
export const PATHWAYS = 'Pathways';
export const INCIDENTS = 'Incidents';
export const IMPORTANT_RECOMMENDATIONS = 'Important recommendations';
export const CRITICAL_RECOMMENDATIONS = 'Critical recommendations';

// Recommendations OverviewDashbarCards labels
export const INCIDENT_TAG = 'incident';
// Recommendations OverviewDashbarCards level of risk, are used with SEVERITY_MAP
export const IMPORTANT_TAG = 'high-risk';
export const CRITICAL_TAG = 'critical-risk';

// Recommendation Page Tabs
export const RECOMMENDATIONS_TAB = 0;
export const PATHWAYS_TAB = 1;

export const RISK_OF_CHANGE_DESC = {
  1: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextOne, {
      strong: (str) => strong(str),
    }),
    intlSettings,
  ),
  2: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextTwo, {
      strong: (str) => strong(str),
    }),
    intlSettings,
  ),
  3: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextThree, {
      strong: (str) => strong(str),
    }),
    intlSettings,
  ),
  4: intlHelper(
    intl.formatMessage(messages.riskOfChangeTextFour, {
      strong: (str) => strong(str),
    }),
    intlSettings,
  ),
};
export const IMPACT_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
  3: intlHelper(intl.formatMessage(messages.high), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const IMPACT_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.medium).toLowerCase(),
    intlSettings,
  ),
  3: intlHelper(intl.formatMessage(messages.high).toLowerCase(), intlSettings),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings,
  ),
};
export const LIKELIHOOD_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
  3: intlHelper(intl.formatMessage(messages.high), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const LIKELIHOOD_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.medium).toLowerCase(),
    intlSettings,
  ),
  3: intlHelper(intl.formatMessage(messages.high).toLowerCase(), intlSettings),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings,
  ),
};
export const RISK_OF_CHANGE_LABEL = {
  1: intlHelper(intl.formatMessage(messages.veryLow), intlSettings),
  2: intlHelper(intl.formatMessage(messages.low), intlSettings),
  3: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
  4: intlHelper(intl.formatMessage(messages.high), intlSettings),
};
export const TOTAL_RISK_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
  3: intlHelper(intl.formatMessage(messages.important), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const TOTAL_RISK_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.moderate).toLowerCase(),
    intlSettings,
  ),
  3: intlHelper(
    intl.formatMessage(messages.important).toLowerCase(),
    intlSettings,
  ),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings,
  ),
};

export const PATHWAYS_FILTER_CATEGORIES = {
  has_incident: {
    type: conditionalFilterType.checkbox,
    title: 'incidents',
    urlParam: 'has_incident',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.incidentRules),
          intlSettings,
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.nonIncidentRules),
          intlSettings,
        ),
        value: 'false',
      },
    ],
  },
  reboot_required: {
    type: conditionalFilterType.checkbox,
    title: 'reboot required',
    urlParam: 'reboot_required',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.required), intlSettings),
        text: intlHelper(intl.formatMessage(messages.required), intlSettings),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings,
        ),
        text: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings,
        ),
        value: 'false',
      },
    ],
  },
};

export const FILTER_CATEGORIES = {
  total_risk: {
    type: conditionalFilterType.checkbox,
    title: 'total risk',
    urlParam: 'total_risk',
    values: [
      { label: TOTAL_RISK_LABEL[4], value: '4' },
      { label: TOTAL_RISK_LABEL[3], value: '3' },
      { label: TOTAL_RISK_LABEL[2], value: '2' },
      { label: TOTAL_RISK_LABEL[1], value: '1' },
    ],
  },
  res_risk: {
    type: conditionalFilterType.checkbox,
    title: 'risk of change',
    urlParam: 'res_risk',
    values: [
      { label: RISK_OF_CHANGE_LABEL[4], value: '4' },
      { label: RISK_OF_CHANGE_LABEL[3], value: '3' },
      { label: RISK_OF_CHANGE_LABEL[2], value: '2' },
      { label: RISK_OF_CHANGE_LABEL[1], value: '1' },
    ],
  },
  impact: {
    type: conditionalFilterType.checkbox,
    title: 'impact',
    urlParam: 'impact',
    values: [
      { label: IMPACT_LABEL[4], value: '4' },
      { label: IMPACT_LABEL[3], value: '3' },
      { label: IMPACT_LABEL[2], value: '2' },
      { label: IMPACT_LABEL[1], value: '1' },
    ],
  },
  likelihood: {
    type: conditionalFilterType.checkbox,
    title: 'likelihood',
    urlParam: 'likelihood',
    values: [
      { label: LIKELIHOOD_LABEL[4], value: '4' },
      { label: LIKELIHOOD_LABEL[3], value: '3' },
      { label: LIKELIHOOD_LABEL[2], value: '2' },
      { label: LIKELIHOOD_LABEL[1], value: '1' },
    ],
  },
  category: {
    type: conditionalFilterType.checkbox,
    title: 'category',
    urlParam: 'category',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.availability),
          intlSettings,
        ),
        value: `${RULE_CATEGORIES.availability}`,
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.performance),
          intlSettings,
        ),
        value: `${RULE_CATEGORIES.performance}`,
      },
      {
        label: intlHelper(intl.formatMessage(messages.stability), intlSettings),
        value: `${RULE_CATEGORIES.stability}`,
      },
      {
        label: intlHelper(intl.formatMessage(messages.security), intlSettings),
        value: `${RULE_CATEGORIES.security}`,
      },
    ],
  },
  incident: {
    type: conditionalFilterType.checkbox,
    title: 'incidents',
    urlParam: 'incident',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.incidentRules),
          intlSettings,
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.nonIncidentRules),
          intlSettings,
        ),
        value: 'false',
      },
    ],
  },
  has_playbook: {
    type: conditionalFilterType.checkbox,
    title: 'remediation type',
    urlParam: 'has_playbook',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.ansibleSupportYes),
          intlSettings,
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.ansibleSupportNo),
          intlSettings,
        ),
        value: 'false',
      },
    ],
  },
  reboot: {
    type: conditionalFilterType.checkbox,
    title: 'reboot required',
    urlParam: 'reboot',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.required), intlSettings),
        text: intlHelper(intl.formatMessage(messages.required), intlSettings),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings,
        ),
        text: intlHelper(
          intl.formatMessage(messages.notRequired),
          intlSettings,
        ),
        value: 'false',
      },
    ],
  },
  rule_status: {
    type: conditionalFilterType.singleSelect,
    title: 'status',
    urlParam: 'rule_status',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.enabled), intlSettings),
        value: 'enabled',
      },
      {
        label: intlHelper(intl.formatMessage(messages.disabled), intlSettings),
        value: 'disabled',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.redhatDisabled),
          intlSettings,
        ),
        value: 'rhdisabled',
      },
    ],
  },
};

export const getImpactingFitlerItems = (hasEdgeDevices) =>
  hasEdgeDevices
    ? [
        {
          value: 'dnfyum',
          label: '1 or more Conventional systems (RPM-DNF)',
          text: '1 or more Conventional systems (RPM-DNF)',
        },
        {
          value: 'ostree',
          label: '1 or more Immutable (OSTree)',
          text: '1 or more Immutable (OSTree)',
        },
        {
          value: 'none',
          label: 'None',
          text: 'None',
        },
      ]
    : [
        {
          label: intlHelper(
            intl.formatMessage(messages.oneOrMore),
            intlSettings,
          ),
          text: intlHelper(
            intl.formatMessage(messages.oneOrMore),
            intlSettings,
          ),
          value: 'true',
        },
        {
          label: intlHelper(intl.formatMessage(messages.none), intlSettings),
          text: intlHelper(intl.formatMessage(messages.none), intlSettings),
          value: 'false',
        },
      ];

export const SYSTEM_FILTER_CATEGORIES = {
  hits: {
    type: conditionalFilterType.checkbox,
    title: 'Total Risk',
    urlParam: 'hits',
    values: [
      { label: 'All systems', text: 'All systems', value: 'all' },
      ...FILTER_CATEGORIES.total_risk.values,
    ],
  },
  incident: {
    type: conditionalFilterType.checkbox,
    title: 'Incidents',
    urlParam: 'incident',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.incidentSystems),
          intlSettings,
        ),
        value: 'true',
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.nonIncidentSystems),
          intlSettings,
        ),
        value: 'false',
      },
    ],
  },
  rhel_version: {
    type: conditionalFilterType.checkbox,
    title: 'Operating system',
    urlParam: 'rhel_version',
  },
};

export const exportNotifications = {
  pending: {
    title: `Preparing export. Once complete, your download will start automatically.`,
    variant: 'info',
  },
  success: {
    title: `Downloading export`,
    variant: 'success',
  },
  error: {
    title: 'Couldn’t download export',
    variant: 'danger',
    autoDismiss: false,
  },
};

export const NO_SYSTEMS_REASONS = {
  NO_MATCH: 'no_match',
  ERROR: 'error',
};

export const NO_SYSTEMS_MAP = {
  [NO_SYSTEMS_REASONS.NO_MATCH]: {
    icon: SearchIcon,
    titleText: 'No matching systems found',
    bodyText: 'To continue, edit your filter settings and search again.',
  },
  [NO_SYSTEMS_REASONS.ERROR]: {
    icon: ExclamationCircleIcon,
    titleText: 'Error encountered when fetching systems.',
    bodyText: 'To continue, try resetting the filters and search again.',
  },
};

export const PERMISSIONS = {
  export: 'advisor:exports:read',
  disableRec: 'advisor:disable-recommendations:write',
  viewRecs: 'advisor:recommendation-results:read',
};

export const KESSEL_RELATIONS = {
  export: 'advisor_exports_view',
  disableRec: 'advisor_disable_recommendations_edit',
  viewRecs: 'advisor_recommendation_results_view',
};

export const IOP_ENVIRONMENT_CONTEXT = {
  isLightspeedEnabled: false,
  isLoading: false,
  isExportEnabled: false,
  isDisableRecEnabled: false, // set later according to user permissions
  isAllowedToViewRec: false, // set later according to user permissions
  displayGroupsTagsColumns: false,
  displayRuleRatings: false,
  displayRecPathways: false,
  displayExecReportLink: false,
  displayDownloadPlaybookButton: true,
  changeRemediationButtonForIop: true,
  loadChromeless: true,
  updateDocumentTitle: (name) => (document.title = name),
  getUser: () => '',
  on: () => {},
  hideGlobalFilter: () => {},
  mapGlobalFilter: () => {},
  globalFilterScope: () => {},
  requestPdf: () => Promise.resolve(),
  isProd: !/stage.*\.redhat\.com$/.test(window.location.hostname),
  BASE_URI: document.baseURI,
  BASE_URL: '/insights_cloud/api/insights/v1',
  UI_BASE: './insights',
  RULES_FETCH_URL: `/insights_cloud/api/insights/v1/rule/`,
  STATS_SYSTEMS_FETCH_URL: `/insights_cloud/api/insights/v1/stats/systems/`,
  STATS_REPORTS_FETCH_URL: `/insights_cloud/api/insights/v1/stats/reports/`,
  STATS_OVERVIEW_FETCH_URL: `/insights_cloud/api/insights/v1/stats/overview/`,
  SYSTEMS_FETCH_URL: `/insights_cloud/api/insights/v1/system/`,
  EDGE_DEVICE_BASE_URL: '/insights_cloud/api/edge/v1',
  INVENTORY_BASE_URL: '/insights_cloud/api/inventory/v1',
  REMEDIATIONS_BASE_URL: '/insights_cloud/api/remediations/v1',
};
