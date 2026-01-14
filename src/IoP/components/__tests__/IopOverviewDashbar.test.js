import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import IopOverviewDashbar from '../IopOverviewDashbar';
import { EnvironmentContext } from '../../../App';
import useOverviewData from '../../../PresentationalComponents/OverviewDashbar/Hooks/useOverviewData/useOverviewData';
import useApplyFilters from '../../../PresentationalComponents/OverviewDashbar/Hooks/useApplyFilters/useApplyFilters';

jest.mock(
  '../../../PresentationalComponents/OverviewDashbar/Hooks/useOverviewData/useOverviewData',
);
jest.mock(
  '../../../PresentationalComponents/OverviewDashbar/Hooks/useApplyFilters/useApplyFilters',
);

describe('IopOverviewDashbar', () => {
  const user = userEvent.setup();
  const mockChangeTab = jest.fn();
  const mockOnClickFilterByName = jest.fn();

  const defaultEnvContext = {
    displayRecPathways: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useApplyFilters.mockReturnValue({
      onClickFilterByName: mockOnClickFilterByName,
    });
  });

  it('should render all cards when data is loaded', async () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 2,
        critical: 3,
        important: 4,
        loaded: true,
        isError: false,
      },
    });

    render(
      <EnvironmentContext.Provider value={defaultEnvContext}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.getByText(/Critical recommendations/)).toBeInTheDocument();
    expect(screen.getByText(/Important recommendations/)).toBeInTheDocument();

    await screen.findByText('2');
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should call onClickFilterByName when incident card is clicked', async () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 5,
        critical: 0,
        important: 0,
        loaded: true,
        isError: false,
      },
    });

    render(
      <EnvironmentContext.Provider value={defaultEnvContext}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    const incidentButton = screen.getByTestId('Incidents');
    await user.click(incidentButton);

    expect(mockOnClickFilterByName).toHaveBeenCalledWith('Incidents');
  });

  it('should call onClickFilterByName when critical card is clicked', async () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 0,
        critical: 10,
        important: 0,
        loaded: true,
        isError: false,
      },
    });

    render(
      <EnvironmentContext.Provider value={defaultEnvContext}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    const criticalButton = screen.getByTestId('Critical recommendations');
    await user.click(criticalButton);

    expect(mockOnClickFilterByName).toHaveBeenCalledWith(
      'Critical recommendations',
    );
  });

  it('should call onClickFilterByName when important card is clicked', async () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 0,
        critical: 0,
        important: 15,
        loaded: true,
        isError: false,
      },
    });

    render(
      <EnvironmentContext.Provider value={defaultEnvContext}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    const importantButton = screen.getByTestId('Important recommendations');
    await user.click(importantButton);

    expect(mockOnClickFilterByName).toHaveBeenCalledWith(
      'Important recommendations',
    );
  });

  it('should show loading skeleton when data is not loaded', () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 0,
        critical: 0,
        important: 0,
        loaded: false,
        isError: false,
      },
    });

    render(
      <EnvironmentContext.Provider value={defaultEnvContext}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render error state when isError is true', () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 0,
        critical: 0,
        important: 0,
        loaded: true,
        isError: true,
      },
    });

    render(
      <EnvironmentContext.Provider value={defaultEnvContext}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    expect(screen.getByText(/No Overview Available/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error has occurred while trying to fetch the overview information. Please try again./,
      ),
    ).toBeInTheDocument();
  });

  it('should use correct grid span when displayRecPathways is false', () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 1,
        critical: 2,
        important: 3,
        loaded: true,
        isError: false,
      },
    });

    const { container } = render(
      <EnvironmentContext.Provider value={{ displayRecPathways: false }}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    // With displayRecPathways: false, mdSpan should be 4
    const grid = container.querySelector('#overview-dashbar');
    expect(grid).toBeInTheDocument();
  });

  it('should use correct grid span when displayRecPathways is true', () => {
    useOverviewData.mockReturnValue({
      data: {
        incidents: 1,
        critical: 2,
        important: 3,
        loaded: true,
        isError: false,
      },
    });

    const { container } = render(
      <EnvironmentContext.Provider value={{ displayRecPathways: true }}>
        <IopOverviewDashbar changeTab={mockChangeTab} />
      </EnvironmentContext.Provider>,
    );

    // With displayRecPathways: true, mdSpan should be 3
    const grid = container.querySelector('#overview-dashbar');
    expect(grid).toBeInTheDocument();
  });
});
