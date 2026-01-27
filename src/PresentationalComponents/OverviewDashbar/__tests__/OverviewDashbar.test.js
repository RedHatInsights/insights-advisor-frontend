import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations';

import OverviewDashbar from '../OverviewDashbar';
import {
  initMocks,
  mockStore,
} from '../../../Utilities/unitTestingUtilities.js';
import { Get } from '../../../Utilities/Api';
import { EnvironmentContext } from '../../../App';

import useOverviewData from '../Hooks/useOverviewData/useOverviewData';

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

jest.mock('../Hooks/useOverviewData/useOverviewData.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../Messages.js', () => ({
  __esModule: true,
  default: {
    pathways: { id: 'pathways', defaultMessage: 'Pathways' },
    recommendedPathways: {
      id: 'recommendedPathways',
      defaultMessage: 'Recommended pathways help',
    },
    incidents: { id: 'incidents', defaultMessage: 'Incidents' },
    incident: { id: 'incident', defaultMessage: 'Incident' },
    incidentTooltip: {
      id: 'incidentTooltip',
      defaultMessage: 'Incident tooltip',
    },
    ruleIsDisabledTooltip: {
      id: 'ruleIsDisabledTooltip',
      defaultMessage: 'Rule is disabled',
    },
    disabled: { id: 'disabled', defaultMessage: 'Disabled' },
    redhatDisabled: {
      id: 'redhatDisabled',
      defaultMessage: 'Red Hat Disabled',
    },
    noOverviewAvailable: {
      id: 'noOverviewAvailable',
      defaultMessage: 'No Overview Available',
    },
    overviewDashbarError: {
      id: 'overviewDashbarError',
      defaultMessage:
        'An unexpected error has occurred while trying to fetch the overview information. Please try again.',
    },
  },
}));

jest.mock('../../../AppConstants', () => ({
  RECOMMENDATIONS_TAB: 'recommendations-tab',
  PATHWAYS_TAB: 'pathways-tab',
  STATS_OVERVIEW_FETCH_URL: '/api/stats-overview',

  IMPORTANT_RECOMMENDATIONS: 'Important recommendations',
  CRITICAL_RECOMMENDATIONS: 'Critical recommendations',
  INCIDENT_TAG: 'incident',
  CRITICAL_TAG: 'critical',
  IMPORTANT_TAG: 'important',
  PATHWAYS: 'Pathways',
  INCIDENTS: 'Incidents',
  SEVERITY_MAP: {
    critical: { name: 'Critical' },
    important: { name: 'Important' },
  },
}));

jest.mock('../../Labels/RuleLabels.js', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../Common/Common.js', () => ({
  QuestionTooltip: () => null,
}));

jest.mock('../../Cards/OverviewDashbarCard/TagLabelWithTooltip.js', () => ({
  TagLabelWithTooltip: () => null,
}));

jest.mock('../../MessageState/MessageState.js', () => ({
  __esModule: true,
  // We need to return an element that displays the title for error testing
  default: ({ title, text }) => (
    <div data-testid="mock-message-state">
      {title}
      {text}
    </div>
  ),
}));

const mockSuccessfulData = {
  pathways: 1,
  incidents: 2,
  critical: 3,
  important: 4,
  loaded: true,
  isError: false,
};

describe('OverviewDashbar', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    useOverviewData.mockReturnValue({
      data: mockSuccessfulData,
    });
    Get.mockClear();
  });

  it('Should render and flow (functionality check)', async () => {
    const RECOMMENDATIONS_TAB = 'recommendations-tab';
    const PATHWAYS_TAB = 'pathways-tab';

    const changeTab = jest.fn();

    render(
      <IntlProvider>
        <EnvironmentContext.Provider
          value={{
            displayRecPathways: true,
            STATS_OVERVIEW_FETCH_URL: '/api/stats-overview',
          }}
        >
          <Provider store={store}>
            <OverviewDashbar changeTab={changeTab} />
          </Provider>
        </EnvironmentContext.Provider>
      </IntlProvider>,
    );

    await screen.findByText(/Pathways/);

    expect(screen.getByText(/Pathways/)).toBeInTheDocument();
    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.getByText(/Important recommendations/)).toBeInTheDocument();
    expect(screen.getByText(/Critical recommendations/)).toBeInTheDocument();

    await screen.findByText('1');

    const pathwaysBtn = screen.getByTestId('Pathways');
    const incidentsBtn = screen.getByTestId('Incidents');
    const criticalRecommendationsBtn = screen.getByTestId(
      'Critical recommendations',
    );
    const importantRecommendationsBtn = screen.getByTestId(
      'Important recommendations',
    );

    expect(pathwaysBtn).toBeInTheDocument();
    expect(incidentsBtn).toBeInTheDocument();
    expect(criticalRecommendationsBtn).toBeInTheDocument();
    expect(importantRecommendationsBtn).toBeInTheDocument();

    expect(pathwaysBtn).toHaveTextContent('1');
    expect(incidentsBtn).toHaveTextContent('2');
    expect(criticalRecommendationsBtn).toHaveTextContent('3');
    expect(importantRecommendationsBtn).toHaveTextContent('4');

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
      <IntlProvider>
        <EnvironmentContext.Provider value={{ displayRecPathways: false }}>
          <Provider store={store}>
            <OverviewDashbar changeTab={changeTab} />
          </Provider>
        </EnvironmentContext.Provider>
      </IntlProvider>,
    );

    await screen.findByText(/Incidents/);

    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.queryByText(/Pathways/)).not.toBeInTheDocument();
  });

  it('renders error when API response does not contain any data', async () => {
    const changeTab = jest.fn();

    useOverviewData.mockReturnValue({
      data: {
        pathways: 0,
        incidents: 0,
        critical: 0,
        important: 0,
        loaded: true,
        isError: true,
      },
    });

    render(
      <IntlProvider>
        <Provider store={store}>
          <OverviewDashbar changeTab={changeTab} />
        </Provider>
      </IntlProvider>,
    );

    await screen.findByText(/No Overview Available/);
    expect(screen.getByText(/No Overview Available/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error has occurred while trying to fetch the overview information. Please try again./,
      ),
    ).toBeInTheDocument();
  });

  it('renders error when API call fails', async () => {
    const changeTab = jest.fn();

    useOverviewData.mockReturnValue({
      data: {
        pathways: 0,
        incidents: 0,
        critical: 0,
        important: 0,
        loaded: true,
        isError: true,
      },
    });

    render(
      <IntlProvider>
        <Provider store={store}>
          <OverviewDashbar changeTab={changeTab} />
        </Provider>
      </IntlProvider>,
    );

    await screen.findByText(/No Overview Available/);
    expect(screen.getByText(/No Overview Available/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error has occurred while trying to fetch the overview information. Please try again./,
      ),
    ).toBeInTheDocument();
  });
});
