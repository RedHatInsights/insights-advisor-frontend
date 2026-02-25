import { dataFetch } from './Overview';
import messages from '../Messages';

describe('Overview Service', () => {
  const mockAxios = {
    get: jest.fn(),
  };

  const mockEnvContext = {
    STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats/',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('dataFetch', () => {
    it('fetches overview data successfully', async () => {
      const mockData = {
        total_risk: 100,
        recommendations: 50,
        critical: 10,
        important: 20,
        moderate: 15,
        low: 5,
      };

      mockAxios.get.mockResolvedValue(mockData);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(mockAxios.get).toHaveBeenCalledWith(
        mockEnvContext.STATS_OVERVIEW_FETCH_URL,
      );
      expect(result).toEqual({
        ...mockData,
        loaded: true,
        isError: false,
      });
    });

    it('marks data as loaded on success', async () => {
      const mockData = { total_risk: 50 };
      mockAxios.get.mockResolvedValue(mockData);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result.loaded).toBe(true);
      expect(result.isError).toBe(false);
    });

    it('handles empty data response', async () => {
      mockAxios.get.mockResolvedValue({});

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result).toEqual({
        loaded: true,
        isError: false,
      });
    });

    it('handles API errors', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
      expect(console.log).toHaveBeenCalledWith(
        error,
        messages.overviewDashbarError.defaultMessage,
      );
    });

    it('handles network errors', async () => {
      const error = new Error('Network error');
      mockAxios.get.mockRejectedValue(error);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result.loaded).toBe(false);
      expect(result.isError).toBe(true);
    });

    it('handles 404 errors', async () => {
      const error = new Error('Not found');
      error.response = { status: 404 };
      mockAxios.get.mockRejectedValue(error);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
    });

    it('handles 500 errors', async () => {
      const error = new Error('Server error');
      error.response = { status: 500, data: { message: 'Internal error' } };
      mockAxios.get.mockRejectedValue(error);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result).toEqual({
        loaded: false,
        isError: true,
      });
    });

    it('logs error when data fetch fails', async () => {
      const error = new Error('Fetch failed');
      mockAxios.get.mockRejectedValue(error);

      await dataFetch(mockEnvContext, mockAxios);

      expect(console.log).toHaveBeenCalledWith(
        error,
        messages.overviewDashbarError.defaultMessage,
      );
    });

    it('uses correct URL from environment context', async () => {
      const customEnvContext = {
        STATS_OVERVIEW_FETCH_URL: '/custom/api/stats/',
      };
      mockAxios.get.mockResolvedValue({ data: {} });

      await dataFetch(customEnvContext, mockAxios);

      expect(mockAxios.get).toHaveBeenCalledWith('/custom/api/stats/');
    });

    it('preserves all data fields from API response', async () => {
      const mockData = {
        total_risk: 100,
        recommendations: 50,
        critical: 10,
        important: 20,
        moderate: 15,
        low: 5,
        systems_hit: 75,
        pathways: 8,
      };

      mockAxios.get.mockResolvedValue(mockData);

      const result = await dataFetch(mockEnvContext, mockAxios);

      expect(result).toMatchObject(mockData);
      expect(result.loaded).toBe(true);
      expect(result.isError).toBe(false);
    });
  });
});
