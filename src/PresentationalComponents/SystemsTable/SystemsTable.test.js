import React from 'react';
import '@testing-library/jest-dom';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import SystemsTable from './SystemsTable';
import { render, waitFor } from '@testing-library/react';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { NO_SYSTEMS_REASONS } from '../../AppConstants';

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
    it('handles 400 errors by notifying and returning empty results', async () => {
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

    it('handles 400 errors without response message gracefully', async () => {
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
});
