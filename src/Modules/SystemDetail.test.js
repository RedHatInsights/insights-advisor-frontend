import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemDetail from './SystemDetail';
import { useFeatureFlag, useHccEnvironmentContext } from '../Utilities/Hooks';
import { useKesselEnvironmentContext } from '../Utilities/useKesselEnvironmentContext';
import { useFlagsStatus } from '@unleash/proxy-client-react';

// Mock the SystemAdvisor component
jest.mock('../SmartComponents/SystemAdvisor/SystemAdvisor', () => {
  // eslint-disable-next-line react/prop-types
  return function MockSystemAdvisor({ IopRemediationModal, ...props }) {
    return (
      <div data-testid="system-advisor-mock" data-props={JSON.stringify(props)}>
        System Advisor Component
        {IopRemediationModal && <div>IopRemediationModal Present</div>}
      </div>
    );
  };
});

jest.mock('../Utilities/Hooks');
jest.mock('../Utilities/useKesselEnvironmentContext');
jest.mock('@unleash/proxy-client-react');

describe('SystemDetail', () => {
  const mockRbacContext = {
    isLoading: false,
    displayRecPathways: true,
    STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats',
  };

  const mockKesselContext = {
    isLoading: false,
    displayRecPathways: true,
    STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useHccEnvironmentContext.mockReturnValue(mockRbacContext);
    useKesselEnvironmentContext.mockReturnValue(mockKesselContext);
    useFlagsStatus.mockReturnValue({ flagsReady: true });
    useFeatureFlag.mockReturnValue(false);
  });

  describe('Feature Flag Loading', () => {
    it('should show spinner while feature flags are loading', () => {
      useFlagsStatus.mockReturnValue({ flagsReady: false });

      render(<SystemDetail />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(
        screen.queryByTestId('system-advisor-mock'),
      ).not.toBeInTheDocument();
    });
  });

  describe('RBAC v1 Mode (Kessel Disabled)', () => {
    beforeEach(() => {
      useFlagsStatus.mockReturnValue({ flagsReady: true });
      useFeatureFlag.mockReturnValue(false);
    });

    it('should render SystemAdvisor component', () => {
      render(<SystemDetail />);

      expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
      expect(screen.getByText('System Advisor Component')).toBeInTheDocument();
    });

    it('should use RBAC v1 context when Kessel flag is disabled', () => {
      render(<SystemDetail />);

      expect(useHccEnvironmentContext).toHaveBeenCalled();
      expect(useKesselEnvironmentContext).not.toHaveBeenCalled();
    });
  });

  it('should pass props to SystemAdvisor', () => {
    const testProps = {
      systemId: 'test-system-123',
      ruleId: 'test-rule-456',
    };

    render(<SystemDetail {...testProps} />);

    const mockElement = screen.getByTestId('system-advisor-mock');
    const passedProps = JSON.parse(mockElement.getAttribute('data-props'));

    expect(passedProps.systemId).toBe('test-system-123');
    expect(passedProps.ruleId).toBe('test-rule-456');
  });

  it('should pass IopRemediationModal to SystemAdvisor', () => {
    const MockModal = () => <div>Mock Modal</div>;

    render(<SystemDetail IopRemediationModal={MockModal} />);

    expect(screen.getByText('IopRemediationModal Present')).toBeInTheDocument();
  });

  it('should provide EnvironmentContext to children', () => {
    render(<SystemDetail />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
  });

  it('should use custom IntlProvider when customItnl is true', () => {
    const customMessages = {
      testMessage: 'Custom Test Message',
    };

    const intlProps = {
      locale: 'es',
      messages: customMessages,
    };

    render(<SystemDetail customItnl={true} intlProps={intlProps} />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
  });

  it('should use Redux Provider when store is provided', () => {
    const mockStore = {
      getState: jest.fn(() => ({})),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };

    render(<SystemDetail store={mockStore} />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
  });

  it('should work without IntlProvider when customItnl is false', () => {
    render(<SystemDetail customItnl={false} />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
  });

  it('should work without Redux Provider when store is not provided', () => {
    render(<SystemDetail />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
  });

  it('should combine all providers and props correctly', () => {
    const mockStore = {
      getState: jest.fn(() => ({})),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };

    const customMessages = {
      testMessage: 'Test',
    };

    const MockModal = () => <div>Modal</div>;

    const props = {
      customItnl: true,
      intlProps: {
        locale: 'en',
        messages: customMessages,
      },
      store: mockStore,
      IopRemediationModal: MockModal,
      systemId: 'system-123',
    };

    render(<SystemDetail {...props} />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
    expect(screen.getByText('IopRemediationModal Present')).toBeInTheDocument();
  });

  describe('Kessel Mode (Kessel Enabled)', () => {
    beforeEach(() => {
      useFlagsStatus.mockReturnValue({ flagsReady: true });
      useFeatureFlag.mockReturnValue(true);
    });

    it('should use Kessel context when Kessel flag is enabled', () => {
      render(<SystemDetail />);

      expect(useKesselEnvironmentContext).toHaveBeenCalled();
      expect(useHccEnvironmentContext).not.toHaveBeenCalled();
    });

    it('should render SystemAdvisor with Kessel context', () => {
      render(<SystemDetail />);

      expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
    });

    it('should pass IopRemediationModal in Kessel mode', () => {
      const MockModal = () => <div>Modal</div>;

      render(<SystemDetail IopRemediationModal={MockModal} />);

      expect(
        screen.getByText('IopRemediationModal Present'),
      ).toBeInTheDocument();
    });
  });

  describe('Kessel and RBAC v1 integration', () => {
    it('avoids calling RBAC v1 when Kessel is enabled', () => {
      useFlagsStatus.mockReturnValue({ flagsReady: true });
      useFeatureFlag.mockReturnValue(true);

      render(<SystemDetail />);

      expect(useHccEnvironmentContext).not.toHaveBeenCalled();
      expect(useKesselEnvironmentContext).toHaveBeenCalled();
    });

    it('switches between context providers when feature flag changes', () => {
      const { rerender } = render(<SystemDetail />);

      useFlagsStatus.mockReturnValue({ flagsReady: true });
      useFeatureFlag.mockReturnValue(false);
      rerender(<SystemDetail />);
      expect(useHccEnvironmentContext).toHaveBeenCalled();

      jest.clearAllMocks();

      useFeatureFlag.mockReturnValue(true);
      rerender(<SystemDetail />);
      expect(useKesselEnvironmentContext).toHaveBeenCalled();
      expect(useHccEnvironmentContext).not.toHaveBeenCalled();
    });
  });
});
