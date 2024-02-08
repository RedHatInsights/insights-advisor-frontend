import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('DashbarCardTitle', () => {
  it("Should render 'Pathways' title with tooltip", async () => {
    render(<DashbarCardTitle title={PATHWAYS} />);

    expect(screen.getByText(/Pathways/)).toBeInTheDocument();

    const icon = screen.getByTestId(
      `question-tooltip-${tooltipMessages.recommendedPathways.defaultMessage}`
    );
    expect(icon).toBeInTheDocument();

    await userEvent.hover(icon);

    await screen.findByText(tooltipMessages.recommendedPathways.defaultMessage);

    await userEvent.unhover(icon);

    await waitFor(() =>
      expect(
        screen.queryByText(tooltipMessages.recommendedPathways.defaultMessage)
      ).not.toBeInTheDocument()
    );

    expect(icon).toBeInTheDocument();
  });

  it("Should render 'Incidents' title with tooltip", async () => {
    render(<DashbarCardTitle title={INCIDENTS} />);

    expect(screen.getByText(/Incidents/)).toBeInTheDocument();

    const icon = screen.getByTestId(
      `question-tooltip-${tooltipMessages.incidentTooltip.defaultMessage}`
    );
    expect(icon).toBeInTheDocument();

    await userEvent.hover(icon);

    await screen.findByText(tooltipMessages.incidentTooltip.defaultMessage);

    await userEvent.unhover(icon);

    await waitFor(() =>
      expect(
        screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
      ).not.toBeInTheDocument()
    );

    expect(icon).toBeInTheDocument();
  });

  it("Should render 'Important Recommendations' title", () => {
    render(<DashbarCardTitle title={IMPORTANT_RECOMMENDATIONS} />);

    expect(screen.getByText(/Important recommendations/)).toBeInTheDocument();
  });

  it("Should render 'Critical Recommendations' title", () => {
    render(<DashbarCardTitle title={CRITICAL_RECOMMENDATIONS} />);

    expect(screen.getByText(/Critical recommendations/)).toBeInTheDocument();
  });

  it('Should not render', () => {
    render(<DashbarCardTitle title={'Wrong Card Title'} />);

    expect(screen.queryByText(/Pathways/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Incidents/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Important recommendations/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Critical recommendations/)
    ).not.toBeInTheDocument();
  });
});
