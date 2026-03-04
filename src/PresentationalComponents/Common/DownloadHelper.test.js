import downloadHelper from './DownloadHelper';
import { downloadFile } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { workloadQueryBuilder } from './Tables';
import { populateExportError } from '../helper';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/helpers',
  () => ({
    downloadFile: jest.fn(),
  }),
);

jest.mock('./Tables', () => ({
  workloadQueryBuilder: jest.fn(),
}));

jest.mock('../helper', () => ({
  populateExportError: jest.fn((error) => ({
    variant: 'danger',
    title: 'Export failed',
    description: error.message,
  })),
}));

describe('downloadHelper', () => {
  const mockAxios = {
    get: jest.fn(),
  };
  const mockAddNotification = jest.fn();
  const mockDispatch = jest.fn();
  const BASE_URL = '/api/insights/v1';

  beforeEach(() => {
    jest.clearAllMocks();
    Date.now = jest.fn(() => new Date('2024-01-15T10:30:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CSV Export', () => {
    it('exports CSV successfully with filters and tags', async () => {
      const mockData = 'column1,column2\nvalue1,value2';
      mockAxios.get.mockResolvedValue(mockData);

      const filters = { hits: ['all'], incident: ['yes'] };
      const selectedTags = [{ key: 'env', value: 'prod' }];
      const workloads = ['sap'];

      workloadQueryBuilder.mockReturnValue({ workloads: 'sap' });

      await downloadHelper(
        'systems',
        'csv',
        filters,
        selectedTags,
        workloads,
        mockDispatch,
        BASE_URL,
        'test-system',
        mockAddNotification,
        mockAxios,
      );

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/export/systems.csv`,
        {
          params: {
            ...filters,
            tags: selectedTags,
            workloads: 'sap',
            display_name: 'test-system',
          },
        },
      );

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'info' }),
      );

      expect(downloadFile).toHaveBeenCalledWith(
        mockData,
        expect.stringContaining('Advisor_systems--'),
        'csv',
      );
    });

    it('exports CSV without optional parameters', async () => {
      const mockData = 'column1,column2\nvalue1,value2';
      mockAxios.get.mockResolvedValue(mockData);

      await downloadHelper(
        'recommendations',
        'csv',
        {},
        undefined,
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/export/recommendations.csv`,
        {
          params: {},
        },
      );

      expect(downloadFile).toHaveBeenCalled();
    });
  });

  describe('JSON Export', () => {
    it('exports JSON successfully', async () => {
      const mockData = { data: [{ id: 1, name: 'test' }] };
      mockAxios.get.mockResolvedValue(mockData);

      await downloadHelper(
        'systems',
        'json',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/export/systems.json`,
        {
          params: {},
        },
      );

      expect(downloadFile).toHaveBeenCalledWith(
        JSON.stringify(mockData),
        expect.stringContaining('Advisor_systems--'),
        'json',
      );
    });

    it('stringifies JSON data correctly', async () => {
      const mockData = { systems: [{ id: 1 }], meta: { count: 1 } };
      mockAxios.get.mockResolvedValue(mockData);

      await downloadHelper(
        'systems',
        'json',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(downloadFile).toHaveBeenCalledWith(
        JSON.stringify(mockData),
        expect.any(String),
        'json',
      );
    });
  });

  describe('Error Handling', () => {
    it('handles export error and shows notification', async () => {
      const error = new Error('Export failed');
      error.response = { status: 500, data: { message: 'Server error' } };
      mockAxios.get.mockRejectedValue(error);

      await downloadHelper(
        'systems',
        'csv',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(populateExportError).toHaveBeenCalledWith(error);
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Export failed',
        }),
      );
    });

    it('handles network errors', async () => {
      const error = new Error('Network error');
      mockAxios.get.mockRejectedValue(error);

      await downloadHelper(
        'systems',
        'csv',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(populateExportError).toHaveBeenCalledWith(error);
    });
  });

  describe('Filename Generation', () => {
    it('generates filename with correct format', async () => {
      const mockData = 'test,data';
      mockAxios.get.mockResolvedValue(mockData);

      await downloadHelper(
        'systems',
        'csv',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(downloadFile).toHaveBeenCalledWith(
        mockData,
        expect.stringMatching(
          /^Advisor_systems--\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-utc$/,
        ),
        'csv',
      );
    });
  });

  describe('Workload Handling', () => {
    it('includes workload query when workloads provided', async () => {
      const mockData = 'test';
      mockAxios.get.mockResolvedValue(mockData);
      workloadQueryBuilder.mockReturnValue({ 'workloads[SAP]': true });

      await downloadHelper(
        'systems',
        'csv',
        {},
        [],
        ['SAP'],
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(workloadQueryBuilder).toHaveBeenCalledWith(['SAP']);
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            'workloads[SAP]': true,
          }),
        }),
      );
    });
  });

  describe('Success Notifications', () => {
    it('shows pending notification before export', async () => {
      const mockData = 'test';
      mockAxios.get.mockResolvedValue(mockData);

      await downloadHelper(
        'systems',
        'csv',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(mockAddNotification).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ variant: 'info' }),
      );
    });

    it('shows success notification after export', async () => {
      const mockData = 'test';
      mockAxios.get.mockResolvedValue(mockData);

      await downloadHelper(
        'systems',
        'csv',
        {},
        [],
        undefined,
        mockDispatch,
        BASE_URL,
        undefined,
        mockAddNotification,
        mockAxios,
      );

      expect(mockAddNotification).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });
});
