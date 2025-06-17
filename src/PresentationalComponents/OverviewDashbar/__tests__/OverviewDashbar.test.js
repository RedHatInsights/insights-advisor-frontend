import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import OverviewDashbar from '../OverviewDashbar';
import {
  initMocks,
  mockStore,
} from '../../../Utilities/unitTestingUtilities.js';
import { Get } from '../../../Utilities/Api';
import {
  RECOMMENDATIONS_TAB,
  PATHWAYS_TAB,
  STATS_OVERVIEW_FETCH_URL,
} from '../../../AppConstants';
import { EnvironmentContext } from '../../../App';

initMocks();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));
const mockState = {};
let store = mockStore(mockState);

jest.mock('../../../Utilities/Api', () => ({
  ...jest.requireActual('../../../Utilities/Api'),
  Get: jest.fn(),
}));

describe('OverviewDashbar', () => {
  const user = userEvent.setup();

  it('Should render and flow (functionality check)', async () => {
    const changeTab = jest.fn();
    Get.mockResolvedValue({
      data: {
        pathways: 1,
        incidents: 2,
        critical: 3,
        important: 4,
        loaded: true,
      },
    });

    render(
      <EnvironmentContext.Provider value={{ displayRecPathways: true }}>
        <Provider store={store}>
          <OverviewDashbar changeTab={changeTab} />
        </Provider>
      </EnvironmentContext.Provider>,
    );

    await screen.findByText(/Pathways/);

    // ensure that the correct text is displayed
    expect(screen.getByText(/Pathways/)).toBeInTheDocument();
    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.getByText(/Important recommendations/)).toBeInTheDocument();
    expect(screen.getByText(/Critical recommendations/)).toBeInTheDocument();

    await screen.findByText(/1/);

    // ensure the correct API endpoint is being contacted
    expect(Get).toHaveBeenCalledWith(STATS_OVERVIEW_FETCH_URL);

    // get the counts, which act as filtering buttons
    const pathwaysBtn = screen.getByTestId(/Pathways/);
    const incidentsBtn = screen.getByTestId(/Incidents/);
    const criticalRecommendationsBtn = screen.getByTestId(
      /Critical recommendations/,
    );
    const importantRecommendationsBtn = screen.getByTestId(
      /Important recommendations/,
    );

    expect(pathwaysBtn).toBeInTheDocument();
    expect(incidentsBtn).toBeInTheDocument();
    expect(criticalRecommendationsBtn).toBeInTheDocument();
    expect(importantRecommendationsBtn).toBeInTheDocument();

    // ensure the count buttons contain the right values
    expect(pathwaysBtn).toHaveTextContent(1);
    expect(incidentsBtn).toHaveTextContent(2);
    expect(criticalRecommendationsBtn).toHaveTextContent(3);
    expect(importantRecommendationsBtn).toHaveTextContent(4);

    // check the correct filtering is being called
    await user.click(pathwaysBtn);
    expect(changeTab).toHaveBeenCalledWith(PATHWAYS_TAB);

    await user.click(incidentsBtn);
    expect(changeTab).toHaveBeenCalledWith(RECOMMENDATIONS_TAB);

    await user.click(criticalRecommendationsBtn);
    expect(changeTab).toHaveBeenCalledWith(RECOMMENDATIONS_TAB);

    await user.click(importantRecommendationsBtn);
    expect(changeTab).toHaveBeenCalledWith(RECOMMENDATIONS_TAB);
  });

  it('Should not display pathways card if displayRecPathways is false', async () => {
    const changeTab = jest.fn();
    render(
      <EnvironmentContext.Provider value={{ displayRecPathways: false }}>
        <Provider store={store}>
          <OverviewDashbar changeTab={changeTab} />
        </Provider>
      </EnvironmentContext.Provider>,
    );

    await screen.findByText(/Incidents/);
    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.queryByText(/Pathways/)).not.toBeInTheDocument();
  });

  it('renders error when API response does not contain any data', async () => {
    const changeTab = jest.fn();
    Get.mockResolvedValue({
      data: undefined,
    });

    render(
      <Provider store={store}>
        <OverviewDashbar changeTab={changeTab} />
      </Provider>,
    );

    // ensure an error is presented
    await screen.findByText(/No Overview Available/);
    expect(screen.getByText(/No Overview Available/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error has occurred while trying to fetch the overview information. Please try again./,
      ),
    ).toBeInTheDocument();

    // ensure the correct API endpoint is being contacted
    expect(Get).toHaveBeenCalledWith(STATS_OVERVIEW_FETCH_URL);
  });

  it('renders error when API call fails', async () => {
    const changeTab = jest.fn();
    Get.mockRejectedValue(new Error('API error'));
    render(
      <Provider store={store}>
        <OverviewDashbar changeTab={changeTab} />
      </Provider>,
    );

    // ensure an error is presented
    await screen.findByText(/No Overview Available/);
    expect(screen.getByText(/No Overview Available/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error has occurred while trying to fetch the overview information. Please try again./,
      ),
    ).toBeInTheDocument();

    // ensure the correct API endpoint is being contacted
    expect(Get).toHaveBeenCalledWith(STATS_OVERVIEW_FETCH_URL);
  });
});
