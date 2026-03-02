import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemDetail from './SystemDetail';

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

// Mock useHccEnvironmentContext hook
jest.mock('../Utilities/Hooks', () => ({
  useHccEnvironmentContext: jest.fn(() => ({
    displayRecPathways: true,
    STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats',
  })),
}));

describe('SystemDetail', () => {
  it('should render SystemAdvisor component', () => {
    render(<SystemDetail />);

    expect(screen.getByTestId('system-advisor-mock')).toBeInTheDocument();
    expect(screen.getByText('System Advisor Component')).toBeInTheDocument();
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
});
