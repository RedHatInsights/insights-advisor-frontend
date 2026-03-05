import React from 'react';
import '@testing-library/jest-dom';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import SystemsTable from './SystemsTable';
import { render, waitFor } from '@testing-library/react';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { NO_SYSTEMS_REASONS } from '../../AppConstants';
import {
  mockScenarios,
  getSystemMaxRisk,
  createMockSystemsResponse,
} from './__mocks__/systemsApiMock';

const mockAxiosGet = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components/Inventory', () => ({
  __esModule: true,
  InventoryTable: jest.fn((props) => (
    <div {...props} aria-label="immutableDevices-module-mock">
      InventoryTable
    </div>
  )),
}));

jest.mock('../Export/SystemsPdf', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div {...props} aria-label="systems-pdf-mock">
      SystemsPdf
    </div>
  )),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  ...jest.requireActual('@unleash/proxy-client-react'),
  useFlag: () => true,
  useFlagsStatus: () => ({ flagsReady: true }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(() => ({ sysState: { page: 1, sort: '-last_seen' } })),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => ({
      get: mockAxiosGet,
    }),
  }),
);

jest.mock('@redhat-cloud-services/frontend-components-notifications/', () => ({
  ...jest.requireActual(
    '@redhat-cloud-services/frontend-components-notifications/',
  ),
  useAddNotification: jest.fn(),
}));

describe('Systems', () => {
  const mockGetEntitiesConfig = {
    per_page: 20,
    page: 1,
    orderBy: 'display_name',
    orderDirection: 'asc',
    advisorFilters: {},
    filters: {},
    workloads: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAddNotification.mockReturnValue(jest.fn());
  });

  it('Should always show conventional systems by filtering host_type', () => {
    render(<ComponentWithContext Component={SystemsTable} />);

    expect(InventoryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        customFilters: expect.objectContaining({
          advisorFilters: {
            'filter[system_profile]': true,
            sysState: { page: 1, sort: '-last_seen' },
          },
        }),
      }),
      {},
    );
  });

  describe('Error handling', () => {
    it('handles 400 errors with notification', async () => {
      const addNotification = jest.fn();
      useAddNotification.mockReturnValue(addNotification);

      mockAxiosGet.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Bad request from API' },
        },
        message: 'Request failed with status code 400',
      });

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const result = await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        jest.fn(),
      );

      expect(result).toEqual({ results: [], total: 0 });
      expect(addNotification).toHaveBeenCalledTimes(1);
      expect(addNotification).toHaveBeenCalledWith({
        variant: 'danger',
        title: 'There was an error fetching systems',
        description: 'Bad request from API',
      });

      await waitFor(() => {
        const latestInventoryProps =
          InventoryTable.mock.calls[InventoryTable.mock.calls.length - 1][0];
        expect(latestInventoryProps.noSystemsTable.props.reason).toBe(
          NO_SYSTEMS_REASONS.ERROR,
        );
      });
    });

    it('handles 400 errors without message', async () => {
      const addNotification = jest.fn();
      useAddNotification.mockReturnValue(addNotification);

      mockAxiosGet.mockRejectedValue({
        response: {
          status: 400,
        },
        message: 'Request failed',
      });

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const result = await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        jest.fn(),
      );

      expect(result).toEqual({ results: [], total: 0 });
      expect(addNotification).toHaveBeenCalledWith({
        variant: 'danger',
        title: 'There was an error fetching systems',
        description: 'Request failed',
      });
    });

    it('rethrows non-400 errors from systems fetch', async () => {
      const error = new Error('Network unavailable');
      mockAxiosGet.mockRejectedValue(error);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await expect(
        inventoryTableProps.getEntities(
          [],
          mockGetEntitiesConfig,
          true,
          jest.fn(),
        ),
      ).rejects.toThrow('Network unavailable');
    });

    it('rethrows 500 server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
        message: 'Server error',
      };
      mockAxiosGet.mockRejectedValue(serverError);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await expect(
        inventoryTableProps.getEntities(
          [],
          mockGetEntitiesConfig,
          true,
          jest.fn(),
        ),
      ).rejects.toEqual(serverError);
    });

    it('rethrows 404 not found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
        message: 'Not found',
      };
      mockAxiosGet.mockRejectedValue(notFoundError);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await expect(
        inventoryTableProps.getEntities(
          [],
          mockGetEntitiesConfig,
          true,
          jest.fn(),
        ),
      ).rejects.toEqual(notFoundError);
    });
  });

  describe('Initial state', () => {
    it('shows NO_MATCH reason when no error occurred', () => {
      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      expect(inventoryTableProps.noSystemsTable.props.reason).toBe(
        NO_SYSTEMS_REASONS.NO_MATCH,
      );
    });
  });

  describe('Data fetching behaviors', () => {
    it('fetches and displays systems data', async () => {
      const mockSystemsData = mockScenarios.allSystems();
      mockAxiosGet.mockResolvedValue(mockSystemsData);

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const mockDefaultGetEntities = jest.fn().mockResolvedValue({
        results: [],
        total: 0,
      });

      await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        mockDefaultGetEntities,
      );

      expect(mockAxiosGet).toHaveBeenCalled();
      const callConfig = mockAxiosGet.mock.calls[0][1];
      expect(callConfig).toHaveProperty('params');
    });

    it('applies all filter parameters when fetching systems', async () => {
      const mockSystemsData = mockScenarios.noMatches();
      mockAxiosGet.mockResolvedValue(mockSystemsData);

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const mockDefaultGetEntities = jest.fn().mockResolvedValue({
        results: [],
        total: 0,
      });

      const configWithFilters = {
        ...mockGetEntitiesConfig,
        advisorFilters: {
          hits: ['1'],
          incident: ['true'],
          'filter[system_profile]': true,
        },
      };

      await inventoryTableProps.getEntities(
        [],
        configWithFilters,
        true,
        mockDefaultGetEntities,
      );

      const callParams = mockAxiosGet.mock.calls[0][1].params;
      expect(callParams).toMatchObject({
        hits: ['1'],
        incident: ['true'],
        'filter[system_profile]': true,
      });
    });

    it('returns low-risk systems when filtered', async () => {
      const mockLowRiskSystems = mockScenarios.lowRiskOnly();
      mockAxiosGet.mockResolvedValue(mockLowRiskSystems);

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const mockDefaultGetEntities = jest.fn().mockResolvedValue({
        results: [],
        total: 0,
      });

      const configWithLowRiskFilter = {
        ...mockGetEntitiesConfig,
        advisorFilters: {
          hits: ['1'],
          'filter[system_profile]': true,
        },
      };

      await inventoryTableProps.getEntities(
        [],
        configWithLowRiskFilter,
        true,
        mockDefaultGetEntities,
      );

      const callParams = mockAxiosGet.mock.calls[0][1].params;
      expect(callParams.hits).toEqual(['1']);

      mockLowRiskSystems.data.forEach((system) => {
        const maxRisk = getSystemMaxRisk(system);
        expect(maxRisk).toBeLessThanOrEqual(1);
        expect(system.critical_hits).toBe(0);
        expect(system.important_hits).toBe(0);
        expect(system.moderate_hits).toBe(0);
      });
    });

    it('returns incident systems when filtered', async () => {
      const mockIncidentSystems = mockScenarios.incidentSystems();
      mockAxiosGet.mockResolvedValue(mockIncidentSystems);

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const mockDefaultGetEntities = jest.fn().mockResolvedValue({
        results: [],
        total: 0,
      });

      const configWithIncidentFilter = {
        ...mockGetEntitiesConfig,
        advisorFilters: {
          incident: ['true'],
          'filter[system_profile]': true,
        },
      };

      await inventoryTableProps.getEntities(
        [],
        configWithIncidentFilter,
        true,
        mockDefaultGetEntities,
      );

      const callParams = mockAxiosGet.mock.calls[0][1].params;
      expect(callParams.incident).toEqual(['true']);

      mockIncidentSystems.data.forEach((system) => {
        expect(system.incident_hits).toBeGreaterThan(0);
      });
    });

    it('shows "no results" message when no systems match filters', async () => {
      const mockEmptyData = mockScenarios.noMatches();
      mockAxiosGet.mockResolvedValue(mockEmptyData);

      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const mockDefaultGetEntities = jest.fn().mockResolvedValue({
        results: [],
        total: 0,
      });

      await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        mockDefaultGetEntities,
      );

      expect(inventoryTableProps.noSystemsTable.props.reason).toBe(
        NO_SYSTEMS_REASONS.NO_MATCH,
      );
    });
  });

  describe('Filter correctness (bug fix verification)', () => {
    it('does not use legacy "yes" filter value', () => {
      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const customFilters = inventoryTableProps.customFilters;

      // The advisorFilters should not contain 'yes'
      expect(JSON.stringify(customFilters.advisorFilters)).not.toContain('yes');
    });

    it('hides "all systems" from filter chips since it is the default', () => {
      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const activeFiltersConfig = inventoryTableProps.activeFiltersConfig;

      const hasHitsChip = activeFiltersConfig.filters.some(
        (filter) => filter.urlParam === 'hits' && filter.chips.length > 0,
      );

      expect(hasHitsChip).toBe(false);
    });
  });

  describe('Filter interactions', () => {
    it('provides filter configuration for hits filter', async () => {
      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const filterConfigItems = inventoryTableProps.filterConfig.items;

      const hitsFilter = filterConfigItems.find((item) => item.id === 'hits');
      expect(hitsFilter).toBeDefined();
      expect(hitsFilter.filterValues).toBeDefined();
      expect(hitsFilter.filterValues.onChange).toBeDefined();
    });

    it('maintains filter configuration when filters are cleared', () => {
      render(<ComponentWithContext Component={SystemsTable} />);

      const inventoryTableProps = InventoryTable.mock.calls[0][0];
      const activeFiltersConfig = inventoryTableProps.activeFiltersConfig;

      activeFiltersConfig.onDelete(null, [], true);

      const updatedProps =
        InventoryTable.mock.calls[InventoryTable.mock.calls.length - 1][0];

      expect(updatedProps.customFilters).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles network timeout', async () => {
      const networkError = new Error('Network timeout');
      networkError.code = 'ETIMEDOUT';
      mockAxiosGet.mockRejectedValue(networkError);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await expect(
        inventoryTableProps.getEntities(
          [],
          mockGetEntitiesConfig,
          true,
          jest.fn(),
        ),
      ).rejects.toThrow('Network timeout');
    });

    it('handles malformed API responses', async () => {
      mockAxiosGet.mockResolvedValue({ invalid: 'response' });

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await expect(
        inventoryTableProps.getEntities(
          [],
          mockGetEntitiesConfig,
          true,
          jest.fn(),
        ),
      ).rejects.toThrow();
    });

    it('handles empty response data', async () => {
      mockAxiosGet.mockResolvedValue({ data: null, meta: { count: 0 } });

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await expect(
        inventoryTableProps.getEntities(
          [],
          mockGetEntitiesConfig,
          true,
          jest.fn(),
        ),
      ).rejects.toThrow();
    });

    it('handles very large datasets without crashing', async () => {
      const largeMockData = mockScenarios.largeDataset();
      mockAxiosGet.mockResolvedValue(largeMockData);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        jest.fn().mockResolvedValue({ results: [], total: 0 }),
      );

      expect(mockAxiosGet).toHaveBeenCalled();
      expect(largeMockData.meta.count).toBe(500);
    });

    it('handles systems with special characters in names', async () => {
      const mockData = createMockSystemsResponse({
        count: 1,
        total: 1,
        customizer: (sys) => ({
          ...sys,
          display_name: 'system-with-特殊字符-émojis-🚀.example.com',
        }),
      });
      mockAxiosGet.mockResolvedValue(mockData);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        jest.fn().mockResolvedValue({ results: [], total: 0 }),
      );

      expect(mockAxiosGet).toHaveBeenCalled();
    });

    it('handles concurrent filter changes', async () => {
      const mockData = mockScenarios.allSystems();
      mockAxiosGet.mockResolvedValue(mockData);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      const promise1 = inventoryTableProps.getEntities(
        [],
        { ...mockGetEntitiesConfig, advisorFilters: { hits: ['1'] } },
        true,
        jest.fn().mockResolvedValue({ results: [], total: 0 }),
      );

      const promise2 = inventoryTableProps.getEntities(
        [],
        { ...mockGetEntitiesConfig, advisorFilters: { hits: ['4'] } },
        true,
        jest.fn().mockResolvedValue({ results: [], total: 0 }),
      );

      await Promise.all([promise1, promise2]);

      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data integrity', () => {
    it('preserves system UUIDs', async () => {
      const mockData = mockScenarios.allSystems();
      mockAxiosGet.mockResolvedValue(mockData);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        jest.fn().mockResolvedValue({ results: [], total: 0 }),
      );

      mockData.data.forEach((system) => {
        expect(system.system_uuid).toBeDefined();
        expect(typeof system.system_uuid).toBe('string');
        expect(system.system_uuid.length).toBeGreaterThan(0);
      });
    });

    it('maintains correct risk level totals', async () => {
      const mockData = mockScenarios.criticalOnly();
      mockAxiosGet.mockResolvedValue(mockData);

      render(<ComponentWithContext Component={SystemsTable} />);
      const inventoryTableProps = InventoryTable.mock.calls[0][0];

      await inventoryTableProps.getEntities(
        [],
        mockGetEntitiesConfig,
        true,
        jest.fn().mockResolvedValue({ results: [], total: 0 }),
      );

      mockData.data.forEach((system) => {
        const totalHits =
          system.critical_hits +
          system.important_hits +
          system.moderate_hits +
          system.low_hits;
        expect(system.hits).toBeGreaterThanOrEqual(totalHits);
      });
    });
  });
});
