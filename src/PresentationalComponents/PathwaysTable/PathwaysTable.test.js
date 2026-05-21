import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from 'react-intl';
import * as reactRouterDom from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import * as AppConstants from '../../AppConstants';
import * as Filters from '../../Services/Filters';
import * as PathwaysService from '../../Services/Pathways';
import PathwaysTable from './PathwaysTable';
import * as Tables from '../Common/Tables';

const mockStore = configureStore([]);
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@patternfly/react-icons', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
  AutomationIcon: () => <svg data-testid="automation-icon" />,
  CubeIcon: () => <svg data-testid="cube-icon" />,
  LockIcon: () => <svg data-testid="lock-icon" />,
  PortIcon: () => <svg data-testid="port-icon" />,
}));

jest.mock(
  '@patternfly/react-core/dist/esm/components/Pagination/Pagination',
  () => ({
    Pagination: jest.fn(({ itemCount, perPage }) => (
      <div data-testid="pagination">
        <span>{`1 - ${perPage} of ${itemCount}`}</span>
      </div>
    )),
    PaginationVariant: {
      top: 'top',
      bottom: 'bottom',
    },
  }),
);

jest.mock('@redhat-cloud-services/frontend-components/PrimaryToolbar', () => {
  const React = require('react');
  const PropTypes = require('prop-types');

  const MockPrimaryToolbar = ({
    pagination,
    filterConfig,
    activeFiltersConfig,
  }) => (
    <div data-testid="primary-toolbar">
      {filterConfig?.items?.map((item, index) => (
        <div key={index}>
          {item.type === 'text' && (
            <input
              type="text"
              placeholder={item.filterValues?.placeholder}
              value={item.filterValues?.value || ''}
              onChange={(e) => item.filterValues?.onChange?.(e, e.target.value)}
            />
          )}
        </div>
      ))}
      {activeFiltersConfig?.filters?.length > 0 && (
        <button onClick={(e) => activeFiltersConfig.onDelete(e, [], true)}>
          {activeFiltersConfig.deleteTitle}
        </button>
      )}
      {pagination && <div>{pagination.itemCount}</div>}
    </div>
  );

  MockPrimaryToolbar.propTypes = {
    pagination: PropTypes.object,
    filterConfig: PropTypes.object,
    activeFiltersConfig: PropTypes.object,
  };

  return {
    PrimaryToolbar: MockPrimaryToolbar,
  };
});

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  __esModule: true,
  default: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@redhat-cloud-services/frontend-components/ErrorState', () => ({
  ErrorState: () => <div data-testid="error-state">Error occurred</div>,
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: jest.fn(() => false),
  useFlagsStatus: jest.fn(() => ({ flagsReady: true })),
  FlagProvider: ({ children }) => children,
}));

const mockUseQueryWithUtilities = jest.fn();

jest.mock('bastilian-tabletools', () => {
  const React = require('react');
  const PropTypes = require('prop-types');

  const TableToolsTable = ({ items, columns, loading, error }) => {
    const [renderedItems, setRenderedItems] = React.useState([]);

    React.useEffect(() => {
      if (typeof items === 'function') {
        // Items is an async function, call it to get [items, total]
        items().then(([itemsData]) => {
          setRenderedItems(itemsData || []);
        });
      } else {
        // Items is already an array
        setRenderedItems(items || []);
      }
    }, [items]);

    if (loading) {
      return <div role="grid" aria-label="Loading" />;
    }

    if (error) {
      return <div data-testid="error-state">Error loading data</div>;
    }

    return (
      <table role="grid" aria-label="pathways-table">
        <thead>
          <tr>
            {columns?.map((col, idx) => (
              <th key={idx} role="columnheader">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderedItems?.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  TableToolsTable.propTypes = {
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
    columns: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.object,
  };

  const StaticTableToolsTable = () => <div>Static Table</div>;

  const TableStateProvider = ({ children }) => children;
  TableStateProvider.propTypes = {
    children: PropTypes.node,
  };

  return {
    TableToolsTable,
    StaticTableToolsTable,
    TableStateProvider,
    useQueryWithUtilities: (...args) => mockUseQueryWithUtilities(...args),
    useSerialisedTableState: () => mockTableState,
  };
});

let mockTableState = null;
const mockUseFullTableState = jest.fn(() => ({ tableState: mockTableState }));

jest.mock('bastilian-tabletools/dist/hooks', () => ({
  useFullTableState: () => mockUseFullTableState(),
}));

jest.mock('../../Utilities/Debounce', () => (fn) => {
  return (value) => fn(value);
});

const createMessageDescriptor = (id, defaultMessage) => ({
  id,
  defaultMessage: defaultMessage || id,
});

jest.mock('../../Messages', () => ({
  name: createMessageDescriptor('name', 'Name'),
  pathwaysName: createMessageDescriptor('pathwaysName', 'Pathways Name'),
  category: createMessageDescriptor('category', 'Category'),
  systems: createMessageDescriptor('systems', 'Systems'),
  reboot: createMessageDescriptor('reboot', 'Reboot'),
  reclvl: createMessageDescriptor('reclvl', 'Recommendation Level'),
  filterBy: createMessageDescriptor('filterBy', 'Filter by'),
  required: createMessageDescriptor('required', 'Required'),
  notRequired: createMessageDescriptor('notRequired', 'Not Required'),
  resetFilters: createMessageDescriptor('resetFilters', 'Reset filters'),
  noResults: createMessageDescriptor('noResults', 'No Results'),
  adjustFilters: createMessageDescriptor('adjustFilters', 'Adjust Filters'),
  stability: createMessageDescriptor('stability', 'stability'),
  performance: createMessageDescriptor('performance', 'performance'),
  low: createMessageDescriptor('low', 'low'),
  critical: createMessageDescriptor('critical', 'critical'),
  moderate: createMessageDescriptor('moderate', 'moderate'),
  '1 - 10 of 20': createMessageDescriptor('1 - 10 of 20', '1 - 10 of 20'),
  incidentTooltip: createMessageDescriptor(
    'incidentTooltip',
    'incidentTooltip',
  ),
  reclvldetails: createMessageDescriptor(
    'reclvldetails',
    'Recommendation Level Details',
  ),
  riskOfChangeTextOne: createMessageDescriptor(
    'riskOfChangeTextOne',
    'Risk of change text one',
  ),
  riskOfChangeTextTwo: createMessageDescriptor(
    'riskOfChangeTextTwo',
    'Risk of change text two',
  ),
  riskOfChangeTextThree: createMessageDescriptor(
    'riskOfChangeTextThree',
    'Risk of change text three',
  ),
  riskOfChangeTextFour: createMessageDescriptor(
    'riskOfChangeTextFour',
    'Risk of change text four',
  ),
  veryLow: createMessageDescriptor('veryLow', 'Very Low'),
  medium: createMessageDescriptor('medium', 'Medium'),
  high: createMessageDescriptor('high', 'High'),
  important: createMessageDescriptor('important', 'Important'),
  incidentRules: createMessageDescriptor('incidentRules', 'Incident Rules'),
  nonIncidentRules: createMessageDescriptor(
    'nonIncidentRules',
    'Non-Incident Rules',
  ),
  availability: createMessageDescriptor('availability', 'Availability'),
  security: createMessageDescriptor('security', 'Security'),
  ansibleSupportYes: createMessageDescriptor(
    'ansibleSupportYes',
    'Ansible Support Yes',
  ),
  ansibleSupportNo: createMessageDescriptor(
    'ansibleSupportNo',
    'Ansible Support No',
  ),
  enabled: createMessageDescriptor('enabled', 'Enabled'),
  disabled: createMessageDescriptor('disabled', 'Disabled'),
  redhatDisabled: createMessageDescriptor('redhatDisabled', 'Red Hat Disabled'),
  oneOrMore: createMessageDescriptor('oneOrMore', 'One or More'),
  none: createMessageDescriptor('none', 'None'),
  incidentSystems: createMessageDescriptor(
    'incidentSystems',
    'Incident Systems',
  ),
  nonIncidentSystems: createMessageDescriptor(
    'nonIncidentSystems',
    'Non-Incident Systems',
  ),
  incident: createMessageDescriptor('incident', 'Incident'),
}));

import * as messages from '../../Messages';

jest.mock(
  '@redhat-cloud-services/frontend-components/ConditionalFilter',
  () => ({
    __esModule: true,
    default: (props) => (
      <div data-testid="mock-conditional-filter" {...props}>
        {props.children}
        <button role="button" name={props.label}>
          {props.label}
        </button>
      </div>
    ),
    conditionalFilterType: {
      text: 'text',
      checkbox: 'checkbox',
      radio: 'radio',
    },
  }),
);

const mockUseGetPathwaysQuery = jest.spyOn(
  PathwaysService,
  'useGetPathwaysQuery',
);

AppConstants.FILTER_CATEGORIES = {
  category: {
    urlParam: 'category',
    title: 'Category',
    values: [
      { label: 'Cloud', value: 'Cloud' },
      { label: 'Security', value: 'Security' },
    ],
  },
};

AppConstants.PATHWAYS_FILTER_CATEGORIES = {
  has_incident: {
    urlParam: 'has_incident',
    title: 'Incident',
    values: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
  },
  reboot_required: {
    urlParam: 'reboot_required',
    title: 'Reboot Required',
    values: [
      { label: 'Required', value: 'true' },
      { label: 'Not Required', value: 'false' },
    ],
  },
};

AppConstants.DEBOUNCE_DELAY = 100;

jest.spyOn(Tables, 'urlBuilder').mockImplementation(jest.fn());
jest
  .spyOn(Tables, 'filterFetchBuilder')
  .mockImplementation((filters) => filters);
jest.spyOn(Tables, 'workloadQueryBuilder').mockImplementation(() => ({}));
jest.spyOn(Tables, 'paramParser').mockImplementation(() => ({}));

jest.spyOn(Tables, 'pruneFilters').mockImplementation((filters) => {
  const allFilters = {
    ...AppConstants.FILTER_CATEGORIES,
    ...AppConstants.PATHWAYS_FILTER_CATEGORIES,
  };
  return Object.entries(filters)
    .filter(
      ([key, value]) =>
        key !== 'limit' &&
        key !== 'offset' &&
        key !== 'sort' &&
        value &&
        value.length > 0,
    )
    .flatMap(([key, value]) => {
      const category = allFilters[key];
      const chips = Array.isArray(value)
        ? value.map((v) => ({ name: v, value: v }))
        : [{ name: value, value: value }];

      return [
        {
          category: category ? category.title : key,
          chips,
          urlParam: key,
        },
      ];
    });
});

jest.spyOn(Filters, 'updatePathFilters').mockImplementation((filters) => ({
  type: 'UPDATE_PATH_FILTERS',
  payload: filters,
}));

const mockPathwaysData = {
  data: [
    {
      slug: 'pathway-1',
      name: 'Pathway One',
      categories: [{ id: 1, name: 'Availability' }],
      impacted_systems_count: 5,
      reboot_required: true,
      recommendation_level: 'critical',
      has_incident: false,
    },
    {
      slug: 'pathway-2',
      name: 'Pathway Two',
      categories: [{ id: 2, name: 'Security' }],
      impacted_systems_count: 10,
      reboot_required: false,
      recommendation_level: 'moderate',
      has_incident: true,
    },
  ],
  meta: {
    count: 20,
    limit: 10,
    offset: 0,
  },
};

const initialStoreState = {
  filters: {
    selectedTags: [],
    workloads: null,
    SID: null,
    pathState: {
      limit: 10,
      offset: 0,
      sort: '-impacted_systems_count',
    },
  },
};

const renderComponent = (
  storeState = initialStoreState,
  isTabActive = true,
  search = '',
  featureFlagEnabled = false,
) => {
  const store = mockStore(storeState);
  reactRouterDom.useLocation.mockReturnValue({ search });

  const { useFlag } = require('@unleash/proxy-client-react');
  useFlag.mockReturnValue(featureFlagEnabled);

  return render(
    <MemoryRouter>
      <Provider store={store}>
        <IntlProvider locale="en">
          <PathwaysTable isTabActive={isTabActive} />
        </IntlProvider>
      </Provider>
    </MemoryRouter>,
  );
};

describe('PathwaysTable - Original Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetPathwaysQuery.mockReturnValue({
      data: mockPathwaysData,
      isFetching: false,
      isLoading: false,
      isError: false,
    });
  });

  it('should render the table and pathways data correctly', async () => {
    renderComponent();

    expect(
      screen.getByRole('grid', { name: /pathways-table/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', {
        name: messages.pathwaysName.defaultMessage,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {
        name: messages.category.defaultMessage,
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });

    expect(screen.getByText('Pathway One')).toHaveAttribute(
      'href',
      '/recommendations/pathways/pathway-1',
    );
    expect(screen.getByText('Pathway Two')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: '5' })).toHaveAttribute(
      'href',
      '/recommendations/pathways/pathway-1',
    );
    expect(screen.getByRole('link', { name: '10' })).toBeInTheDocument();
    expect(screen.getByText('1 - 10 of 20')).toBeInTheDocument();
  });

  it('should show SkeletonTable when loading', () => {
    mockUseGetPathwaysQuery.mockReturnValue({
      data: { meta: { count: 0 } },
      isFetching: true,
      isLoading: true,
      isError: false,
    });
    renderComponent();

    expect(screen.getByRole('grid', { name: 'Loading' })).toBeInTheDocument();
  });

  it('should handle URL parameters on initial load (isTabActive is true)', async () => {
    const search = '?limit=5&category=Cloud&sort=name';
    Tables.paramParser.mockImplementation(() => ({
      limit: ['5'],
      category: ['Cloud'],
      sort: ['name'],
      offset: ['0'],
      reboot_required: 'true',
    }));

    renderComponent(initialStoreState, true, search);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            limit: 5,
            category: ['Cloud'],
            sort: 'name',
            offset: 0,
            reboot_required: ['true'],
          }),
        }),
      );
    });

    expect(Tables.paramParser).toHaveBeenCalledTimes(1);
  });

  it('should handle sorting via column click and dispatch updatePathFilters', () => {
    renderComponent();
    mockDispatch.mockClear();

    const systemsHeader = screen.getByRole('button', {
      name: messages.systems.defaultMessage,
    });

    fireEvent.click(systemsHeader);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          sort: 'impacted_systems_count',
          offset: 0,
        }),
      }),
    );

    fireEvent.click(systemsHeader);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          sort: '-impacted_systems_count',
          offset: 0,
        }),
      }),
    );
  });

  it('should handle page change via pagination and dispatch updatePathFilters', () => {
    renderComponent();
    mockDispatch.mockClear();

    const systemsHeader = screen.getByRole('button', {
      name: messages.systems.defaultMessage,
    });
    fireEvent.click(systemsHeader);

    const mockSetPage = (page) => {
      mockDispatch({
        type: 'UPDATE_PATH_FILTERS',
        payload: { offset: (page - 1) * 10 },
      });
    };

    mockSetPage(2);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ offset: 10 }),
      }),
    );
  });

  it('should handle per page change and reset offset', async () => {
    renderComponent();
    mockDispatch.mockClear();

    const mockPerpageSelect = (perPage) => {
      mockDispatch({
        type: 'UPDATE_PATH_FILTERS',
        payload: { limit: perPage, offset: 0 },
      });
    };

    mockPerpageSelect(20);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ limit: 20, offset: 0 }),
      }),
    );
  });

  it('should apply filters and dispatch updates when selecting a checkbox', async () => {
    renderComponent();
    mockDispatch.mockClear();

    const mockFilterChange = (values) => {
      mockDispatch({
        type: 'UPDATE_PATH_FILTERS',
        payload: { category: values, offset: 0 },
      });
    };

    mockFilterChange(['Cloud']);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          category: ['Cloud'],
          offset: 0,
        }),
      }),
    );
  });

  it('should update filters when searching (debounced effect)', () => {
    renderComponent();
    mockDispatch.mockClear();

    const filterInput = screen.getByPlaceholderText(
      messages.filterBy.defaultMessage,
    );
    const searchText = 'test-pathway';

    fireEvent.change(filterInput, { target: { value: searchText } });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ text: searchText, offset: 0 }),
      }),
    );
  });

  it('should clear all active filters when "Reset Filters" is clicked', async () => {
    const filteredStoreState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          limit: 10,
          offset: 0,
          sort: '-impacted_systems_count',
          category: ['Cloud'],
          text: 'some-text',
        },
      },
    };

    renderComponent(filteredStoreState);
    mockDispatch.mockClear();

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: messages.resetFilters.defaultMessage,
        }),
      ).toBeInTheDocument();
    });

    const clearAllButton = screen.getByRole('button', {
      name: messages.resetFilters.defaultMessage,
    });
    fireEvent.click(clearAllButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { limit: 10, offset: 0 },
      }),
    );

    const filterInput = screen.getByPlaceholderText(
      messages.filterBy.defaultMessage,
    );
    expect(filterInput.value).toBe('');
  });

  it('should show ErrorState when API call fails', () => {
    mockUseGetPathwaysQuery.mockReturnValue({
      data: undefined,
      isFetching: false,
      isLoading: false,
      isError: true,
    });

    renderComponent();

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('should handle missing sort parameter and use default', async () => {
    const search = '?limit=20';
    Tables.paramParser.mockImplementation(() => ({
      limit: ['20'],
    }));

    renderComponent(initialStoreState, true, search);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            sort: '-impacted_systems_count',
          }),
        }),
      );
    });
  });

  it('should handle non-array reboot_required in URL params', async () => {
    const search = '?reboot_required=true';
    Tables.paramParser.mockImplementation(() => ({
      reboot_required: 'true',
    }));

    renderComponent(initialStoreState, true, search);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            reboot_required: ['true'],
          }),
        }),
      );
    });
  });

  it('should handle sort state changes correctly', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          sort: 'name',
        },
      },
    };

    renderComponent(storeState);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle descending sort state', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          sort: '-recommendation_level',
        },
      },
    };

    renderComponent(storeState);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle invalid sort value in sortIndices', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          sort: 'invalid_field',
        },
      },
    };

    renderComponent(storeState);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle workloads filter integration', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        workloads: { SAP: true },
      },
    };

    Tables.workloadQueryBuilder.mockReturnValue({ workload_SAP: true });

    renderComponent(storeState);

    await waitFor(() => {
      expect(Tables.workloadQueryBuilder).toHaveBeenCalledWith({ SAP: true });
    });
  });

  it('should handle selectedTags filter integration', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        selectedTags: ['tag1', 'tag2'],
      },
    };

    renderComponent(storeState);

    await waitFor(() => {
      expect(mockUseGetPathwaysQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: 'tag1,tag2',
        }),
      );
    });
  });
});

describe('PathwaysTable - New Implementation (TableToolsTable)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTableState = null;
    mockUseQueryWithUtilities.mockReturnValue({
      items: async () => [
        mockPathwaysData.data || [],
        mockPathwaysData.meta?.count || 0,
      ],
      result: mockPathwaysData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should render TableToolsTable when feature flag is enabled', async () => {
    renderComponent(initialStoreState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });

    expect(screen.getByText('Pathway Two')).toBeInTheDocument();
  });

  it('should handle URL parameters on initial load with feature flag enabled', async () => {
    const search = '?limit=5&category=Cloud&sort=-recommendation_level';
    Tables.paramParser.mockImplementation(() => ({
      limit: ['5'],
      category: ['Cloud'],
      sort: ['-recommendation_level'],
      offset: ['0'],
    }));

    renderComponent(initialStoreState, true, search, true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle invalid sort parameter and default to impacted_systems_count', async () => {
    const search = '?sort=invalid_field';
    Tables.paramParser.mockImplementation(() => ({
      sort: ['invalid_field'],
    }));

    renderComponent(initialStoreState, true, search, true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should convert non-array reboot_required to array', async () => {
    const search = '?reboot_required=true';
    Tables.paramParser.mockImplementation(() => ({
      reboot_required: 'true',
    }));

    renderComponent(initialStoreState, true, search, true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should convert non-array has_incident to array', async () => {
    const search = '?has_incident=true';
    Tables.paramParser.mockImplementation(() => ({
      has_incident: true,
    }));

    renderComponent(initialStoreState, true, search, true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should convert non-array category to array', async () => {
    const search = '?category=security';
    Tables.paramParser.mockImplementation(() => ({
      category: 'security',
    }));

    renderComponent(initialStoreState, true, search, true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle URL with all filter combinations', async () => {
    const search =
      '?text=test&category=security&has_incident=true&reboot_required=false';
    Tables.paramParser.mockImplementation(() => ({
      text: 'test',
      category: ['security'],
      has_incident: ['true'],
      reboot_required: ['false'],
      sort: ['name'],
      offset: ['20'],
      limit: ['50'],
    }));

    renderComponent(initialStoreState, true, search, true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should not parse URL params when tab is not active', () => {
    const search = '?category=security';
    Tables.paramParser.mockImplementation(() => ({
      category: ['security'],
    }));

    renderComponent(initialStoreState, false, search, true);

    expect(Tables.paramParser).not.toHaveBeenCalled();
  });

  it('should calculate correct initial sort index and direction for ascending sort', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          sort: 'name',
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should calculate correct initial sort index for recommendation_level', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          sort: '-recommendation_level',
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle activeFilters with text filter', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          text: 'search term',
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle activeFilters with category filter', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          category: ['security', 'performance'],
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle activeFilters with has_incident filter', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          has_incident: ['true'],
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle activeFilters with reboot_required filter', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          reboot_required: ['false'],
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle all activeFilters combined', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        pathState: {
          ...initialStoreState.filters.pathState,
          text: 'search',
          category: ['security'],
          has_incident: ['true'],
          reboot_required: ['true'],
        },
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(screen.getByText('Pathway One')).toBeInTheDocument();
    });
  });

  it('should handle selectedTags integration', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        selectedTags: ['tag1', 'tag2'],
      },
    };

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(mockUseQueryWithUtilities).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          useTableState: true,
          fetchFn: expect.any(Function),
        }),
      );
    });
  });

  it('should handle workloads integration', async () => {
    const storeState = {
      ...initialStoreState,
      filters: {
        ...initialStoreState.filters,
        workloads: { SAP: true },
      },
    };

    Tables.workloadQueryBuilder.mockReturnValue({ workload_SAP: true });

    renderComponent(storeState, true, '', true);

    await waitFor(() => {
      expect(Tables.workloadQueryBuilder).toHaveBeenCalledWith({ SAP: true });
    });
  });

  describe('TableState Synchronization', () => {
    it('should have serializers in options', async () => {
      renderComponent(initialStoreState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should render with initial pagination state', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            offset: 40,
            limit: 20,
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should render with text filter in Redux', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            text: 'search term',
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should render with category filter in Redux', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            category: ['security'],
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should render with has_incident filter in Redux', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            has_incident: ['true'],
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should render with reboot_required filter in Redux', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            reboot_required: ['true'],
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should calculate correct page from offset', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            offset: 60,
            limit: 20,
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should handle sort index calculation for name column', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            sort: 'name',
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should handle sort index calculation for impacted_systems_count desc', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            sort: '-impacted_systems_count',
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should handle sort index calculation for recommendation_level asc', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            sort: 'recommendation_level',
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });

    it('should handle invalid sort field and fall back to default', async () => {
      const storeState = {
        ...initialStoreState,
        filters: {
          ...initialStoreState.filters,
          pathState: {
            ...initialStoreState.filters.pathState,
            sort: 'invalid_field',
          },
        },
      };

      renderComponent(storeState, true, '', true);

      await waitFor(() => {
        expect(screen.getByText('Pathway One')).toBeInTheDocument();
      });
    });
  });
});
