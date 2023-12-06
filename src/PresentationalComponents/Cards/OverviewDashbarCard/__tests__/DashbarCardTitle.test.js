import React from 'react';
import {
  render,
  screen,
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
    expect(screen.getByText(/Pathways/)).toBeInTheDocument();

    // ensure the tooltip message is displayed
    const icon = screen.getByTestId(
      `question-tooltip-${tooltipMessages.recommendedPathways.defaultMessage}`
    );
    expect(icon).toBeInTheDocument();
    await user.hover(icon);
    await screen.findByText(tooltipMessages.recommendedPathways.defaultMessage);
    expect(
      screen.getByText(tooltipMessages.recommendedPathways.defaultMessage)
    ).toBeInTheDocument();

    // ensure that the tooltip message is hidden when the mouse leaves the title
    await user.unhover(icon);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(tooltipMessages.recommendedPathways.defaultMessage)
    );
    expect(
      screen.queryByText(tooltipMessages.recommendedPathways.defaultMessage)
    ).not.toBeInTheDocument();

    // but the icon still appears
    expect(icon).toBeInTheDocument();
  });

  it("Should render 'Incidents' title with tooltip", async () => {
    render(<DashbarCardTitle title={INCIDENTS} />);

    // ensure the correct text is displayed
    expect(screen.getByText(/Incidents/)).toBeInTheDocument();

    // ensure the tooltip message is displayed
    const icon = screen.getByTestId(
      `question-tooltip-${tooltipMessages.incidentTooltip.defaultMessage}`
    );
    expect(icon).toBeInTheDocument();
    await user.hover(icon);
    await screen.findByText(tooltipMessages.incidentTooltip.defaultMessage);

    // ensure that the tooltip message is hidden when the mouse leaves the title
    await user.unhover(icon);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    );
    expect(
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    ).not.toBeInTheDocument();

    // but the icon still appears
    expect(icon).toBeInTheDocument();
  });

  it("Should render 'Important Recommendations' title", () => {
    render(<DashbarCardTitle title={IMPORTANT_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    expect(screen.getByText(/Important Recommendations/)).toBeInTheDocument();
  });

  it("Should render 'Critical Recommendations' title", () => {
    render(<DashbarCardTitle title={CRITICAL_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    expect(screen.getByText(/Critical Recommendations/)).toBeInTheDocument();
  });

  it('Should not render', () => {
    render(<DashbarCardTitle title={'Wrong Card Title'} />);

    // ensure title texts are NOT displayed
    expect(screen.queryByText(/Pathways/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Incidents/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Important Recommendations/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Critical Recommendations/)
    ).not.toBeInTheDocument();
  });
});
