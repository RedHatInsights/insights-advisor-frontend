import React from "react";
import { Provider } from "react-redux";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { IntlProvider } from "@redhat-cloud-services/frontend-components-translations/index";
import messages from "../../../../locales/translations.json";
import OverviewDashbar from "../OverviewDashbar";
import { RECOMMENDATIONS_TAB, PATHWAYS_TAB } from "../../../AppConstants";
import { getStore } from "../../../Store";

/************************ */

// test('renders users when API call succeeds', async () => {
//   const fakePathways = [
//     { id: 1, name: 'Joe' },
//     { id: 2, name: 'Tony' },
//   ]
//   fetchMock.mockResolvedValue({ status: 200, json: jest.fn(() => fakeUsers) })

//   render(<App />)

//   expect(screen.getByRole('heading')).toHaveTextContent('List of Users')

//   expect(await screen.findByText('Joe')).toBeInTheDocument()
//   expect(await screen.findByText('Tony')).toBeInTheDocument()

//   expect(screen.queryByText('No users found')).not.toBeInTheDocument()
// })

// /************************ */

// test('renders error when API call fails', async () => {
//   fetchMock.mockReject(() => Promise.reject('API error'))

//   render(<App />)

//   expect(await screen.findByText('Something went wrong!')).toBeInTheDocument()
//   expect(await screen.findByText('No users found')).toBeInTheDocument()
// })

/*************************/
/*************************/
// todo: fix this test
// There is no actual API response, so the test fails
// We need to mock the API response
// This should be done after the API endpoint, for fetching the overview information, is implemented

// This is the status of the test:

// OverviewDashbar - isLoading: true
// OverviewDashbar - isFetching: true
// OverviewDashbar - isError: false

describe("OverviewDashbar", () => {
  it("Should render", async () => {
    const changeTab = jest.fn();
    render(
      <IntlProvider locale={navigator.language.slice(0, 2)} messages={messages}>
        <Provider store={getStore()}>
          <OverviewDashbar changeTab={changeTab} />
        </Provider>
      </IntlProvider>
    );

    // ensure that the correct text is displayed
    const pathways = screen.getByText(/Pathways/);

    expect(pathways).toBeInTheDocument();
    expect(screen.getByText(/Incidents/)).toBeInTheDocument();
    expect(screen.getByText(/Important Recommendations/)).toBeInTheDocument();
    expect(screen.getByText(/Critical Recommendations/)).toBeInTheDocument();

    // get the buttons
    const pathwaysBtn = screen.getByTestId(/Pathways/);
    const incidentsBtn = screen.getByTestId(/Incidents/);
    const importantRecommendationsBtn = screen.getByTestId(
      /Important Recommendations/
    );
    const criticalRecommendationsBtn = screen.getByTestId(
      /Critical Recommendations/
    );

    fireEvent.click(pathwaysBtn);
    expect(changeTab).toHaveBeenCalledWith(PATHWAYS_TAB);

    fireEvent.click(incidentsBtn);
    expect(changeTab).toHaveBeenCalledWith(RECOMMENDATIONS_TAB);

    fireEvent.click(importantRecommendationsBtn);
    expect(changeTab).toHaveBeenCalledWith(RECOMMENDATIONS_TAB);

    fireEvent.click(criticalRecommendationsBtn);
    expect(changeTab).toHaveBeenCalledWith(RECOMMENDATIONS_TAB);
  });
});
