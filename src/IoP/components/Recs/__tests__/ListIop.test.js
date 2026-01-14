import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ListIop from '../ListIop';
import { EnvironmentContext } from '../../../../App';

// Mock the RulesTable component
jest.mock('../../../../PresentationalComponents/RulesTable/RulesTable', () =>
  jest.fn(() => <div data-testid="rules-table">Mocked RulesTable</div>),
);

// Mock the IopOverviewDashbar component
jest.mock('../../IopOverviewDashbar', () =>
  jest.fn(() => <div data-testid="iop-overview-dashbar">Mocked Overview</div>),
);

describe('ListIop', () => {
  const mockEnvContext = {
    updateDocumentTitle: jest.fn(),
    isLightspeedEnabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page header with title', () => {
    render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    expect(screen.getByText(/Recommendations/)).toBeInTheDocument();
  });

  it('should render overview dashbar', () => {
    render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    expect(screen.getByTestId('iop-overview-dashbar')).toBeInTheDocument();
  });

  it('should render rules table', () => {
    render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    expect(screen.getByTestId('rules-table')).toBeInTheDocument();
  });

  it('should update document title on mount', () => {
    render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    expect(mockEnvContext.updateDocumentTitle).toHaveBeenCalledWith(
      'Recommendations - Advisor',
    );
  });

  it('should render about popover with correct content', () => {
    const { container } = render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    // The popover trigger icon should be present
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render with Lightspeed disabled context', () => {
    const { container } = render(
      <EnvironmentContext.Provider
        value={{ ...mockEnvContext, isLightspeedEnabled: false }}
      >
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    // Component should render successfully
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Recommendations/)).toBeInTheDocument();
  });

  it('should render with Lightspeed enabled context', () => {
    const { container } = render(
      <EnvironmentContext.Provider
        value={{ ...mockEnvContext, isLightspeedEnabled: true }}
      >
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    // Component should render successfully
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Recommendations/)).toBeInTheDocument();
  });

  it('should have correct displayName', () => {
    expect(ListIop.displayName).toBe('recommendations-list');
  });

  it('should render with correct page structure', () => {
    const { container } = render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    const pageSection = container.querySelector(
      '.pf-v5-l-page__main-section.pf-v5-c-page__main-section',
    );
    expect(pageSection).toBeInTheDocument();
  });

  it('should render Stack component with correct items', () => {
    render(
      <EnvironmentContext.Provider value={mockEnvContext}>
        <ListIop />
      </EnvironmentContext.Provider>,
    );

    // Both overview and table should be present
    expect(screen.getByTestId('iop-overview-dashbar')).toBeInTheDocument();
    expect(screen.getByTestId('rules-table')).toBeInTheDocument();
  });
});
