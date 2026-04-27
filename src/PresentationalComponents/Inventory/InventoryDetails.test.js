import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import InventoryDetails from './InventoryDetails';
import configureStore from 'redux-mock-store';

const mockAxiosGet = jest.fn();
const mockAddNotification = jest.fn();
const mockUpdateDocumentTitle = jest.fn();

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => mockAxiosGet,
  }),
);

jest.mock('@redhat-cloud-services/frontend-components-notifications/', () => ({
  useAddNotification: () => mockAddNotification,
}));

jest.mock('@redhat-cloud-services/frontend-components/Inventory', () => ({
  DetailWrapper: jest.fn(({ children }) => (
    <div data-testid="detail-wrapper">{children}</div>
  )),
  InventoryDetailHead: jest.fn(() => (
    <div data-testid="inventory-detail-head">Inventory Detail Head</div>
  )),
}));

jest.mock('../../SmartComponents/SystemAdvisor', () => ({
  __esModule: true,
  default: () => <div data-testid="system-advisor">System Advisor</div>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ inventoryId: 'test-system-uuid' }),
}));

jest.mock('../Breadcrumbs/Breadcrumbs', () => ({
  __esModule: true,
  default: ({ current }) => <div data-testid="breadcrumbs">{current}</div>,
}));

const mockStore = configureStore([]);

describe('InventoryDetails - System Existence Check', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      entityDetails: {
        entity: {
          id: 'test-system-uuid',
          display_name: 'Test System',
        },
      },
    });
  });

  describe('when system exists in Advisor', () => {
    it('should render DetailWrapper when reports endpoint returns successfully', async () => {
      mockAxiosGet.get = jest.fn().mockResolvedValue({
        data: [
          {
            rule: { rule_id: 'test-rule' },
            details: {},
          },
        ],
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{
            store,
          }}
          contextValue={{
            updateDocumentTitle: mockUpdateDocumentTitle,
            BASE_URL: '/api/insights/v1',
          }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          '/api/insights/v1/system/test-system-uuid/reports/',
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('detail-wrapper')).toBeInTheDocument();
      });

      expect(screen.getByTestId('system-advisor')).toBeInTheDocument();
      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it('should set systemExists to true when reports endpoint succeeds', async () => {
      mockAxiosGet.get = jest.fn().mockResolvedValue({
        data: [],
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          '/api/insights/v1/system/test-system-uuid/reports/',
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('detail-wrapper')).toBeInTheDocument();
      });
    });
  });

  describe('when system does not exist in Advisor', () => {
    it('should show error message when reports endpoint returns 404', async () => {
      mockAxiosGet.get = jest.fn().mockRejectedValue({
        response: { status: 404 },
        message: 'Not found',
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          '/api/insights/v1/system/test-system-uuid/reports/',
        );
      });

      await waitFor(() => {
        expect(screen.getByText('System not available')).toBeInTheDocument();
      });

      expect(
        screen.getByText('This system no longer exists in your inventory.'),
      ).toBeInTheDocument();

      expect(screen.queryByTestId('detail-wrapper')).not.toBeInTheDocument();
      expect(screen.queryByTestId('system-advisor')).not.toBeInTheDocument();
    });

    it('should display notification when system does not exist', async () => {
      mockAxiosGet.get = jest.fn().mockRejectedValue({
        response: { status: 404 },
        message: 'Not found',
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'warning',
          title: 'System not available',
          description:
            'This system no longer exists in your inventory and cannot be displayed.',
        });
      });
    });

    it('should show breadcrumb with "System not found" when system does not exist', async () => {
      mockAxiosGet.get = jest.fn().mockRejectedValue({
        response: { status: 404 },
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('System not found')).toBeInTheDocument();
      });
    });
  });

  describe('when there is a non-404 error', () => {
    it('should still attempt to render DetailWrapper on 500 error', async () => {
      mockAxiosGet.get = jest.fn().mockRejectedValue({
        response: { status: 500 },
        message: 'Internal server error',
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          '/api/insights/v1/system/test-system-uuid/reports/',
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('detail-wrapper')).toBeInTheDocument();
      });

      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it('should still attempt to render DetailWrapper on network error', async () => {
      mockAxiosGet.get = jest.fn().mockRejectedValue({
        message: 'Network error',
      });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          '/api/insights/v1/system/test-system-uuid/reports/',
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('detail-wrapper')).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton while checking system existence', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockAxiosGet.get = jest.fn().mockReturnValue(promise);

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      expect(screen.queryByTestId('detail-wrapper')).not.toBeInTheDocument();
      expect(screen.queryByTestId('system-advisor')).not.toBeInTheDocument();

      resolvePromise({ data: [] });

      await waitFor(() => {
        expect(screen.getByTestId('detail-wrapper')).toBeInTheDocument();
      });
    });
  });

  describe('API endpoint correctness', () => {
    it('should call the correct /system/{uuid}/reports/ endpoint, not /system/?system_uuid=', async () => {
      mockAxiosGet.get = jest.fn().mockResolvedValue({ data: [] });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          '/api/insights/v1/system/test-system-uuid/reports/',
        );
      });

      expect(mockAxiosGet.get).not.toHaveBeenCalledWith(
        expect.stringContaining('system/?system_uuid='),
      );
    });

    it('should use the inventoryId from URL params', async () => {
      mockAxiosGet.get = jest.fn().mockResolvedValue({ data: [] });

      render(
        <ComponentWithContext
          Component={InventoryDetails}
          componentProps={{}}
          renderOptions={{ store }}
          contextValue={{ BASE_URL: '/api/insights/v1' }}
        />,
      );

      await waitFor(() => {
        expect(mockAxiosGet.get).toHaveBeenCalledWith(
          expect.stringContaining('test-system-uuid'),
        );
      });
    });
  });
});
