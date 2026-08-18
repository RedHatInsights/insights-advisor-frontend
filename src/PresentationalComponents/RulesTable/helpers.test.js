import { filterConfigItems } from './helpers';

// --- Module mocks (must precede imports that pull them transitively) ---

jest.mock('../../AppConstants', () => ({
  FILTER_CATEGORIES: {
    total_risk: { title: 'Total Risk', urlParam: 'total_risk', values: [] },
    res_risk: { title: 'Res Risk', urlParam: 'res_risk', values: [] },
    impact: { title: 'Impact', urlParam: 'impact', values: [] },
    likelihood: { title: 'Likelihood', urlParam: 'likelihood', values: [] },
    category: { title: 'Category', urlParam: 'category', values: [] },
    incident: { title: 'Incident', urlParam: 'incident', values: [] },
    has_playbook: {
      title: 'Has Playbook',
      urlParam: 'has_playbook',
      values: [],
    },
    reboot: { title: 'Reboot', urlParam: 'reboot', values: [] },
    rule_status: {
      title: 'Status',
      urlParam: 'rule_status',
      type: 'checkbox',
      values: [],
    },
    workload: {
      title: 'Workload',
      urlParam: 'workload',
      values: [
        { label: 'SAP', value: 'sap' },
        { label: 'Ansible Automation Platform', value: 'ansible' },
        { label: 'Microsoft SQL', value: 'mssql' },
        { label: 'Satellite', value: 'satellite' },
      ],
    },
  },
  BASE_URL: '/api/advisor/v1',
  TOTAL_RISK_LABEL_LOWER: {},
  RISK_OF_CHANGE_DESC: {},
  SYSTEM_FILTER_CATEGORIES: {},
  SYSTEM_TYPES: { rhel: 1, ocp: 2 },
  KESSEL_RELATIONS: {},
}));

jest.mock('../../Messages', () => ({ default: {} }));

jest.mock('../Common/Tables', () => ({
  paramParser: jest.fn(() => ({})),
  ruleResolutionRisk: jest.fn(() => 1),
  pruneFilters: jest.fn(() => []),
}));

jest.mock('../helper', () => ({
  getCsrfTokenHeader: jest.fn(() => ({})),
  normalizeFilterValue: jest.fn((v) => v),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components/ConditionalFilter',
  () => ({
    conditionalFilterType: {
      checkbox: 'checkbox',
      text: 'text',
      custom: 'custom',
    },
  }),
);

jest.mock('@redhat-cloud-services/frontend-components/InsightsLabel', () => ({
  InsightsLabel: () => null,
}));

jest.mock('@redhat-cloud-services/frontend-components/DateFormat', () => ({
  DateFormat: () => null,
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-advisor-components',
  () => ({
    RuleDetails: () => null,
    RuleDetailsMessagesKeys: [],
    AdvisorProduct: { rhel: 'rhel' },
  }),
);

jest.mock('../Labels/CategoryLabel', () => ({ default: () => null }));
jest.mock('../Labels/RuleLabels', () => ({ default: () => null }));

jest.mock('../../Utilities/intlHelper', () => ({
  formatMessages: jest.fn(() => ({})),
  mapContentToValues: jest.fn(() => ({})),
}));

jest.mock('../Filters/impactingFilter', () => ({
  getImpactingFilterChips: jest.fn(() => ({})),
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  default: () => null,
}));

jest.mock('react-router-dom', () => ({
  Link: () => null,
}));

jest.mock('./Components/EmptyState', () => ({ default: () => null }));

jest.mock('react-intl', () => ({
  FormattedMessage: () => null,
  defineMessages: (msgs) => msgs,
  createIntl: jest.fn(() => ({
    formatMessage: jest.fn((msg) => msg?.defaultMessage || msg?.id || ''),
  })),
  createIntlCache: jest.fn(() => ({})),
}));

jest.mock('@patternfly/react-icons/dist/esm/icons/bell-slash-icon', () => ({
  default: () => null,
}));

// --- Test helpers ---

const intl = { formatMessage: (msg) => msg?.defaultMessage || msg?.id || '' };
const filters = { rule_status: 'enabled' };
const setFilters = jest.fn();
const setSearchText = jest.fn();
const toggleRulesDisabled = jest.fn();

// --- Tests ---

describe('filterConfigItems – workload filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not include workload filter when isWorkloadFilterEnabled is omitted (default false)', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
    );
    expect(result.some((item) => item.id === 'workload')).toBe(false);
  });

  it('does not include workload filter when isWorkloadFilterEnabled is explicitly false', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
      false,
    );
    expect(result.some((item) => item.id === 'workload')).toBe(false);
  });

  it('includes a workload filter item when isWorkloadFilterEnabled is true', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
      true,
    );
    expect(result.some((item) => item.id === 'workload')).toBe(true);
  });

  it('workload item has type checkbox', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
      true,
    );
    const workloadItem = result.find((item) => item.id === 'workload');
    expect(workloadItem.type).toBe('checkbox');
  });

  it('workload item has value "checkbox-workload"', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
      true,
    );
    const workloadItem = result.find((item) => item.id === 'workload');
    expect(workloadItem.value).toBe('checkbox-workload');
  });

  it('workload item filterValues.items includes { label: "SAP", value: "sap" }', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
      true,
    );
    const workloadItem = result.find((item) => item.id === 'workload');
    expect(workloadItem.filterValues.items).toEqual(
      expect.arrayContaining([{ label: 'SAP', value: 'sap' }]),
    );
  });

  it('workload item filterValues.items matches the full FC.workload.values list', () => {
    const result = filterConfigItems(
      filters,
      setFilters,
      '',
      setSearchText,
      toggleRulesDisabled,
      intl,
      true,
    );
    const workloadItem = result.find((item) => item.id === 'workload');
    expect(workloadItem.filterValues.items).toEqual([
      { label: 'SAP', value: 'sap' },
      { label: 'Ansible Automation Platform', value: 'ansible' },
      { label: 'Microsoft SQL', value: 'mssql' },
      { label: 'Satellite', value: 'satellite' },
    ]);
  });
});
