import React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { DashbarCardTitle } from '../components/DashbarCardTitle/DashbarCardTitle';

import tooltipMessages from '../../../../Messages';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
} from '../../../../AppConstants';

// this component returns the appropriate title component based on the title it receives
describe('DashbarCardTitle', () => {
  const user = userEvent.setup();

  it("Should render 'Pathways' title with tooltip", async () => {
    render(<DashbarCardTitle title={PATHWAYS} />);

    // ensure the correct text is displayed
    screen.getByText(/Pathways/);

    // ensure the tooltip message is displayed
    const icon = screen.getByTestId(
      `question-tooltip-${tooltipMessages.recommendedPathways.defaultMessage}`
    );
    await user.hover(icon);
    await waitFor(() =>
      screen.getByText(tooltipMessages.recommendedPathways.defaultMessage)
    );

    // ensure that the tooltip message is hidden when the mouse leaves the title
    await user.unhover(icon);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(tooltipMessages.recommendedPathways.defaultMessage)
    );
    expect(
      screen.queryByText(tooltipMessages.recommendedPathways.defaultMessage)
    ).toBe(null);

    // but the icon still appears
    screen.getByTestId(
      `question-tooltip-${tooltipMessages.recommendedPathways.defaultMessage}`
    );
  });

  it("Should render 'Incidents' title with tooltip", async () => {
    render(<DashbarCardTitle title={INCIDENTS} />);

    // ensure the correct text is displayed
    screen.getByText(/Incidents/);

    // ensure the tooltip message is displayed
    const icon = screen.getByTestId(
      `question-tooltip-${tooltipMessages.incidentTooltip.defaultMessage}`
    );
    await user.hover(icon);
    await waitFor(() =>
      screen.getByText(tooltipMessages.incidentTooltip.defaultMessage)
    );

    // ensure that the tooltip message is hidden when the mouse leaves the title
    await user.unhover(icon);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    );
    expect(
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    ).toBe(null);

    // but the icon still appears
    screen.getByTestId(
      `question-tooltip-${tooltipMessages.incidentTooltip.defaultMessage}`
    );
  });

  it("Should render 'Important Recommendations' title", () => {
    render(<DashbarCardTitle title={IMPORTANT_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    screen.getByText(/Important Recommendations/);
  });

  it("Should render 'Critical Recommendations' title", () => {
    render(<DashbarCardTitle title={CRITICAL_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    screen.getByText(/Critical Recommendations/);
  });

  it('Should not render', () => {
    render(<DashbarCardTitle title={'Wrong Card Title'} />);

    // ensure title texts are NOT displayed
    expect(screen.queryByText(/Pathways/)).toBe(null);
    expect(screen.queryByText(/Incidents/)).toBe(null);
    expect(screen.queryByText(/Important Recommendations/)).toBe(null);
    expect(screen.queryByText(/Critical Recommendations/)).toBe(null);
  });
});
