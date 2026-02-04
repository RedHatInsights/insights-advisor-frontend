import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

jest.mock('./Utilities/useKesselEnvironmentContext', () => ({
  useKesselEnvironmentContext: jest.fn(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  AccessCheck: {
    // eslint-disable-next-line react/prop-types
    Provider: ({ children }) => <div>{children}</div>,
  },
}));

import AppWithHccContext from './App';
import { useHccEnvironmentContext, useFeatureFlag } from './Utilities/Hooks';
import { useKesselEnvironmentContext } from './Utilities/useKesselEnvironmentContext';

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
    useKesselEnvironmentContext.mockReturnValue(mockEnvContext);
    useFeatureFlag.mockReturnValue(false); // Default to RBAC v1
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

  describe('Kessel feature flag', () => {
    it('uses RBAC v1 context when feature flag is disabled', () => {
      useFeatureFlag.mockReturnValue(false);

      renderWithProviders(<AppWithHccContext />);

      expect(useFeatureFlag).toHaveBeenCalledWith('advisor.kessel_enabled');
      expect(useHccEnvironmentContext).toHaveBeenCalled();
    });

    it('uses Kessel context when feature flag is enabled', () => {
      useFeatureFlag.mockReturnValue(true);

      renderWithProviders(<AppWithHccContext />);

      expect(useFeatureFlag).toHaveBeenCalledWith('advisor.kessel_enabled');
      expect(useKesselEnvironmentContext).toHaveBeenCalled();
    });

    it('renders correctly with RBAC v1 (feature flag OFF)', () => {
      useFeatureFlag.mockReturnValue(false);

      const { container } = renderWithProviders(<AppWithHccContext />);

      expect(container).toBeTruthy();
      expect(mockEnvContext.globalFilterScope).toHaveBeenCalledWith('insights');
    });

    it('renders correctly with Kessel (feature flag ON)', () => {
      useFeatureFlag.mockReturnValue(true);

      const { container } = renderWithProviders(<AppWithHccContext />);

      expect(container).toBeTruthy();
      expect(mockEnvContext.globalFilterScope).toHaveBeenCalledWith('insights');
    });

    it('shows lock screen when user lacks permissions (Kessel mode)', () => {
      useFeatureFlag.mockReturnValue(true);
      useKesselEnvironmentContext.mockReturnValue({
        ...mockEnvContext,
        isAllowedToViewRec: false,
      });

      renderWithProviders(<AppWithHccContext />);

      expect(
        screen.getByText(/You must be granted permissions to use Advisor/i),
      ).toBeInTheDocument();
    });

    it('shows lock screen when user lacks permissions (RBAC v1 mode)', () => {
      useFeatureFlag.mockReturnValue(false);
      useHccEnvironmentContext.mockReturnValue({
        ...mockEnvContext,
        isAllowedToViewRec: false,
      });

      renderWithProviders(<AppWithHccContext />);

      expect(
        screen.getByText(/You must be granted permissions to use Advisor/i),
      ).toBeInTheDocument();
    });
  });
});
