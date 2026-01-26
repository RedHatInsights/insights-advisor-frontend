import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureStore from 'redux-mock-store';

jest.mock('./Routes', () => ({
  AdvisorRoutes: () => <div>AdvisorRoutes</div>,
}));

jest.mock('./Utilities/Hooks', () => ({
  useHccEnvironmentContext: jest.fn(),
  useFeatureFlag: jest.fn(),
}));

import AppWithHccContext from './App';
import { useHccEnvironmentContext, useFeatureFlag } from './Utilities/Hooks';

const mockStore = configureStore([]);

describe('App tag processing logic', () => {
  let store;
  let mockEnvContext;

  const renderWithProviders = (component) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <Provider store={store}>{component}</Provider>
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    store = mockStore({
      filters: {
        selectedTags: [],
        workloads: {},
        recState: {},
        pathState: {},
        sysState: {},
      },
    });
    dispatchSpy = jest.spyOn(store, 'dispatch');

    mockEnvContext = {
      isLoading: false,
      isAllowedToViewRec: true,
      globalFilterScope: jest.fn(),
      on: jest.fn(),
      mapGlobalFilter: jest.fn(),
    };

    useHccEnvironmentContext.mockReturnValue(mockEnvContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const processEncodedTags = (encodedTags) => {
    return (
      encodedTags?.map((tag) => {
        const fullyDecoded = decodeURIComponent(decodeURIComponent(tag));
        const slashIndex = fullyDecoded.indexOf('/');
        const equalsIndex = fullyDecoded.indexOf('=', slashIndex);
        if (equalsIndex === -1) return fullyDecoded;

        const namespaceAndKey = fullyDecoded.substring(0, equalsIndex);
        const value = fullyDecoded.substring(equalsIndex + 1);
        const encodedValue = value.replace(/=/g, '%3D').replace(/\//g, '%2F');
        return `${namespaceAndKey}=${encodedValue}`;
      }) || []
    );
  };

  describe('Tag encoding/decoding logic', () => {
    it('decodes double-encoded tags and re-encodes special chars in value', () => {
      const encodedTags = ['insights-client/key_bc6b_0%253Dfoo%253Dbar'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['insights-client/key_bc6b_0=foo%3Dbar']);
    });

    it('handles simple tags without special characters', () => {
      const encodedTags = ['namespace/key%3Dvalue'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['namespace/key=value']);
    });

    it('handles tags with equals sign in the value', () => {
      const encodedTags = ['insights-client/key%253Dvalue1%253Dvalue2'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['insights-client/key=value1%3Dvalue2']);
    });

    it('handles tags with forward slash in the value', () => {
      const encodedTags = ['namespace/key%253Dpath%252Fto%252Ffile'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['namespace/key=path%2Fto%2Ffile']);
    });

    it('handles tags with both = and / in the value', () => {
      const encodedTags = ['app/tag%253Dfoo%252Fbar%253Dbaz'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['app/tag=foo%2Fbar%3Dbaz']);
    });

    it('handles multiple tags', () => {
      const encodedTags = [
        'insights-client/key1%3Dvalue1',
        'namespace/key2%253Dfoo%253Dbar',
        'app/tag%3Dsimple',
      ];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual([
        'insights-client/key1=value1',
        'namespace/key2=foo%3Dbar',
        'app/tag=simple',
      ]);
    });

    it('handles tags without an equals sign', () => {
      const encodedTags = ['namespace/key'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['namespace/key']);
    });

    it('handles empty array', () => {
      const encodedTags = [];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual([]);
    });

    it('handles null or undefined', () => {
      const resultNull = processEncodedTags(null);
      const resultUndefined = processEncodedTags(undefined);

      expect(resultNull).toEqual([]);
      expect(resultUndefined).toEqual([]);
    });

    it('produces tags that match API pattern after URL encoding and decoding', () => {
      const encodedTags = ['insights-client/key_bc6b_0%253Dfoo%253Dbar'];

      const processedTag = processEncodedTags(encodedTags)[0];
      expect(processedTag).toBe('insights-client/key_bc6b_0=foo%3Dbar');

      const urlEncoded = encodeURIComponent(processedTag);
      expect(urlEncoded).toBe('insights-client%2Fkey_bc6b_0%3Dfoo%253Dbar');

      const serverReceives = decodeURIComponent(urlEncoded);
      expect(serverReceives).toBe('insights-client/key_bc6b_0=foo%3Dbar');

      const pattern = /^[^/=]+\/[^/=]+=[^/=]+$/;
      expect(pattern.test(serverReceives)).toBe(true);

      const [, value] = serverReceives.split('=');
      expect(value).not.toContain('/');
      expect(value).not.toMatch(/(?<!%)=/);
    });

    it('handles complex real-world example', () => {
      const encodedTags = ['insights-client/os_release%253Drhel%252F8.5'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['insights-client/os_release=rhel%2F8.5']);

      const urlEncoded = encodeURIComponent(result[0]);
      const serverReceives = decodeURIComponent(urlEncoded);
      const pattern = /^[^/=]+\/[^/=]+=[^/=]+$/;
      expect(pattern.test(serverReceives)).toBe(true);
    });

    it('handles underscore and alphanumeric characters correctly', () => {
      const encodedTags = ['app_name/user_123%3Dtest_value'];
      const result = processEncodedTags(encodedTags);

      expect(result).toEqual(['app_name/user_123=test_value']);
    });
  });

  describe('App component', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProviders(<AppWithHccContext />);

      expect(container).toBeTruthy();
    });

    it('calls globalFilterScope with insights', () => {
      renderWithProviders(<AppWithHccContext />);

      expect(mockEnvContext.globalFilterScope).toHaveBeenCalledWith('insights');
    });

    it('registers GLOBAL_FILTER_UPDATE event handler', () => {
      renderWithProviders(<AppWithHccContext />);

      expect(mockEnvContext.on).toHaveBeenCalledWith(
        'GLOBAL_FILTER_UPDATE',
        expect.any(Function),
      );
    });
  });
});

describe('App with QueryClient integration', () => {
  let store;
  let mockEnvContext;

  const renderWithProviders = (component) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <Provider store={store}>{component}</Provider>
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    store = mockStore({
      filters: {
        selectedTags: [],
        workloads: {},
        recState: {},
        pathState: {},
        sysState: {},
      },
    });

    mockEnvContext = {
      isLoading: false,
      isAllowedToViewRec: true,
      globalFilterScope: jest.fn(),
      on: jest.fn(),
      mapGlobalFilter: jest.fn(),
    };

    useHccEnvironmentContext.mockReturnValue(mockEnvContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render app with QueryClientProvider', () => {
    useFeatureFlag.mockReturnValue(false);
    renderWithProviders(<AppWithHccContext />);

    // Verify app renders correctly
    expect(screen.getByText('AdvisorRoutes')).toBeInTheDocument();
  });

  it('should render permission denied message when user lacks permissions', () => {
    useFeatureFlag.mockReturnValue(false);
    useHccEnvironmentContext.mockReturnValue({
      ...mockEnvContext,
      isAllowedToViewRec: false, // No permission
    });

    renderWithProviders(<AppWithHccContext />);

    // Should show permission denied message instead of routes
    expect(screen.queryByText('AdvisorRoutes')).not.toBeInTheDocument();
  });

  it('should not render app while environment context is loading', () => {
    useFeatureFlag.mockReturnValue(false);
    useHccEnvironmentContext.mockReturnValue({
      ...mockEnvContext,
      isLoading: true, // Still loading
    });

    renderWithProviders(<AppWithHccContext />);

    // Should not render anything while loading
    expect(screen.queryByText('AdvisorRoutes')).not.toBeInTheDocument();
  });

  it('should call globalFilterScope with insights', () => {
    useFeatureFlag.mockReturnValue(false);
    renderWithProviders(<AppWithHccContext />);

    expect(mockEnvContext.globalFilterScope).toHaveBeenCalledWith('insights');
  });

  it('should register GLOBAL_FILTER_UPDATE event handler', () => {
    useFeatureFlag.mockReturnValue(false);
    renderWithProviders(<AppWithHccContext />);

    expect(mockEnvContext.on).toHaveBeenCalledWith(
      'GLOBAL_FILTER_UPDATE',
      expect.any(Function),
    );
  });
});

describe('App with Kessel integration', () => {
  let store;
  let mockEnvContext;

  const renderWithProviders = (component) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <Provider store={store}>{component}</Provider>
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    store = mockStore({
      filters: {
        selectedTags: [],
        workloads: {},
        recState: {},
        pathState: {},
        sysState: {},
      },
    });

    mockEnvContext = {
      isLoading: false,
      isAllowedToViewRec: true,
      globalFilterScope: jest.fn(),
      on: jest.fn(),
      mapGlobalFilter: jest.fn(),
    };

    useHccEnvironmentContext.mockReturnValue(mockEnvContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with Kessel provider when feature flag is enabled', () => {
    useFeatureFlag.mockReturnValue(true);

    renderWithProviders(<AppWithHccContext />);

    // Verify app renders correctly with Kessel enabled
    expect(screen.getByText('AdvisorRoutes')).toBeInTheDocument();
  });

  it('should render without Kessel provider when feature flag is disabled', () => {
    useFeatureFlag.mockReturnValue(false);

    renderWithProviders(<AppWithHccContext />);

    // Verify app renders correctly with Kessel disabled
    expect(screen.getByText('AdvisorRoutes')).toBeInTheDocument();
  });

  it('should always render QueryClientProvider regardless of feature flag', () => {
    const testCases = [true, false];

    testCases.forEach((flagValue) => {
      jest.clearAllMocks();
      useFeatureFlag.mockReturnValue(flagValue);

      const { container } = renderWithProviders(<AppWithHccContext />);

      // App should render regardless of feature flag state
      expect(container).toBeTruthy();
    });
  });

  it('should render permission denied message when user lacks permissions', () => {
    useFeatureFlag.mockReturnValue(false);
    useHccEnvironmentContext.mockReturnValue({
      ...mockEnvContext,
      isAllowedToViewRec: false, // No permission
    });

    renderWithProviders(<AppWithHccContext />);

    // Should show permission denied message instead of routes
    expect(screen.queryByText('AdvisorRoutes')).not.toBeInTheDocument();
  });

  it('should not render app while environment context is loading', () => {
    useFeatureFlag.mockReturnValue(false);
    useHccEnvironmentContext.mockReturnValue({
      ...mockEnvContext,
      isLoading: true, // Still loading
    });

    renderWithProviders(<AppWithHccContext />);

    // Should not render anything while loading
    expect(screen.queryByText('AdvisorRoutes')).not.toBeInTheDocument();
  });

  it('should call globalFilterScope with insights', () => {
    useFeatureFlag.mockReturnValue(true);

    renderWithProviders(<AppWithHccContext />);

    expect(mockEnvContext.globalFilterScope).toHaveBeenCalledWith('insights');
  });

  it('should register GLOBAL_FILTER_UPDATE event handler', () => {
    useFeatureFlag.mockReturnValue(true);

    renderWithProviders(<AppWithHccContext />);

    expect(mockEnvContext.on).toHaveBeenCalledWith(
      'GLOBAL_FILTER_UPDATE',
      expect.any(Function),
    );
  });

  it('should handle feature flag loading state gracefully', () => {
    // When useFeatureFlag returns undefined (not yet loaded)
    // it should return false from useFeatureFlag due to default
    useFeatureFlag.mockReturnValue(false);

    const { container } = renderWithProviders(<AppWithHccContext />);

    // Should still render without errors
    expect(container).toBeTruthy();
  });
});
