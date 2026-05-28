import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RulesTableNew from './RulesTable.new';
import * as useRecsQuery from '../../Services/Recs/useRecsQuery';

// Mock the useRecsQuery hook
jest.mock('../../Services/Recs/useRecsQuery', () => ({
  useRecsQuery: jest.fn(),
}));

// Create a stable reload mock
const mockReload = jest.fn();

/* eslint-disable react/prop-types, react/display-name, no-unused-vars */
// Mock bastilian-tabletools
jest.mock('bastilian-tabletools', () => {
  const React = require('react');
  return {
    TableToolsTable: ({ items, columns }) => (
      <div data-testid="table-tools-table">
        <table>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td>{item.category?.name}</td>
                <td>{item.total_risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    TableStateProvider: ({ children }) =>
      React.createElement('div', {}, children),
    useStateCallbacks: jest.fn(() => ({
      current: { reload: mockReload },
    })),
  };
});

// Mock RuleDetailsWrapper to avoid react-markdown issues
jest.mock('./RuleDetailsWrapper', () => ({
  __esModule: true,
  default: () => <div data-testid="rule-details-wrapper">Details</div>,
}));

// Mock DisableRule modal
jest.mock('../Modals/DisableRule', () => ({
  __esModule: true,
  default: ({ isModalOpen }) =>
    isModalOpen ? <div data-testid="disable-rule-modal">Modal</div> : null,
}));

// Mock useRulesTableActions
jest.mock('../../Utilities/hooks/useRulesTableActions', () => ({
  __esModule: true,
  default: () => ({
    actionResolver: jest.fn(),
  }),
}));

// Mock useAdvisorTableDefaults
jest.mock('../../Utilities/useAdvisorTableDefaults', () => ({
  __esModule: true,
  default: () => ({
    variant: 'compact',
  }),
}));
/* eslint-enable react/prop-types, react/display-name, no-unused-vars */

const mockRecsData = {
  data: [
    {
      rule_id: 'rule-1',
      description: 'Test Rule 1',
      category: { id: 1, name: 'Availability' },
      total_risk: 3,
      impacted_systems_count: 5,
      playbook_count: 1,
      publish_date: '2024-01-01',
      rule_status: 'enabled',
      has_incident: false,
    },
    {
      rule_id: 'rule-2',
      description: 'Test Rule 2',
      category: { id: 2, name: 'Security' },
      total_risk: 4,
      impacted_systems_count: 10,
      playbook_count: 0,
      publish_date: '2024-01-02',
      rule_status: 'enabled',
      has_incident: true,
    },
  ],
  meta: {
    count: 20,
  },
};

const mockStore = {
  getState: () => ({
    filters: {
      selectedTags: [],
      workloads: null,
    },
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

const renderComponent = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Provider store={mockStore}>
          <IntlProvider locale="en">
            <RulesTableNew isTabActive={true} {...props} />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('RulesTableNew', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecsQuery.useRecsQuery.mockReturnValue({
      items: mockRecsData.data,
      loading: false,
      error: null,
    });
  });

  it('should render the table with recommendations data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('table-tools-table')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Rule 1')).toBeInTheDocument();
    expect(screen.getByText('Test Rule 2')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    renderComponent();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Total risk')).toBeInTheDocument();
    expect(screen.getByText('Systems')).toBeInTheDocument();
    expect(screen.getByText('Remediation type')).toBeInTheDocument();
  });

  it('should call useRecsQuery with correct parameters when tab is active', () => {
    renderComponent({ isTabActive: true });

    expect(useRecsQuery.useRecsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        useTableState: true,
        enabled: true,
        additionalParams: {},
      }),
    );
  });

  it('should not fetch data when tab is inactive', () => {
    jest.clearAllMocks();
    renderComponent({ isTabActive: false });

    expect(useRecsQuery.useRecsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('should pass selectedTags to additionalParams', () => {
    const mockStoreWithTags = {
      ...mockStore,
      getState: () => ({
        filters: {
          selectedTags: ['tag1', 'tag2'],
          workloads: null,
        },
      }),
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Provider store={mockStoreWithTags}>
            <IntlProvider locale="en">
              <RulesTableNew isTabActive={true} />
            </IntlProvider>
          </Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useRecsQuery.useRecsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        additionalParams: expect.objectContaining({
          tags: 'tag1,tag2',
        }),
      }),
    );
  });

  it('should pass pathway filter to additionalParams', () => {
    renderComponent({ pathway: 'test-pathway' });

    expect(useRecsQuery.useRecsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        additionalParams: expect.objectContaining({
          pathway: 'test-pathway',
        }),
      }),
    );
  });

  it('should handle empty data gracefully', () => {
    useRecsQuery.useRecsQuery.mockReturnValue({
      items: [],
      loading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByTestId('table-tools-table')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    useRecsQuery.useRecsQuery.mockReturnValue({
      items: [],
      loading: true,
      error: null,
    });

    const { container } = renderComponent();

    expect(container).toBeTruthy();
  });
});
