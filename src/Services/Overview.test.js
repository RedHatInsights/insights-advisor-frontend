import { dataFetch } from './Overview';
import * as Api from '../Utilities/Api';
import messages from '../Messages';

jest.mock('../Utilities/Api', () => ({
  Get: jest.fn(),
}));

describe('Overview Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('dataFetch', () => {
    const mockEnvContext = {
      STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats',
    };

    it('should fetch and return overview data successfully', async () => {
      const mockResponseData = {
        pathways: 5,
        incidents: 12,
        critical: 8,
        important: 15,
        moderate: 20,
        low: 30,
      };

      Api.Get.mockResolvedValue({
        data: mockResponseData,
      });

      const result = await dataFetch(mockEnvContext);

      expect(Api.Get).toHaveBeenCalledWith('/api/insights/v1/stats');
      expect(result).toEqual({
        ...mockResponseData,
        loaded: true,
        isError: false,
      });
    });

    it('should handle successful response with empty data', async () => {
      const mockResponseData = {
        pathways: 0,
        incidents: 0,
        critical: 0,
        important: 0,
        moderate: 0,
        low: 0,
      };

      Api.Get.mockResolvedValue({
        data: mockResponseData,
      });

      const result = await dataFetch(mockEnvContext);

      expect(result).toEqual({
        ...mockResponseData,
        loaded: true,
        isError: false,
      });
    });

    it('should handle missing data in response', async () => {
      Api.Get.mockResolvedValue({
        // Missing data property
      });

      const result = await dataFetch(mockEnvContext);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
      expect(console.log).toHaveBeenCalledWith(
        expect.anything(),
        messages.overviewDashbarError.defaultMessage,
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      Api.Get.mockRejectedValue(mockError);

      const result = await dataFetch(mockEnvContext);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
      expect(console.log).toHaveBeenCalledWith(
        mockError,
        messages.overviewDashbarError.defaultMessage,
      );
    });

    it('should handle 404 errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
      };
      Api.Get.mockRejectedValue(mockError);

      const result = await dataFetch(mockEnvContext);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
    });

    it('should handle 500 server errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      };
      Api.Get.mockRejectedValue(mockError);

      const result = await dataFetch(mockEnvContext);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
    });

    it('should use correct URL from envContext', async () => {
      const customEnvContext = {
        STATS_OVERVIEW_FETCH_URL: '/custom/stats/url',
      };

      Api.Get.mockResolvedValue({
        data: { pathways: 1 },
      });

      await dataFetch(customEnvContext);

      expect(Api.Get).toHaveBeenCalledWith('/custom/stats/url');
    });
  });
});
