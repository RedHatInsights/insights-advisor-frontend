import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { DashbarCardTagOrIcon } from '../components/DashbarCardTagOrIcon/DashbarCardTagOrIcon';
import tooltipMessages from '../../../../Messages';
import {
  PATHWAYS,
  INCIDENTS,
  IMPORTANT_RECOMMENDATIONS,
  CRITICAL_RECOMMENDATIONS,
} from '../../../../AppConstants';

// This component returns the appropriate Tag OR Icon component based on the title it receives
describe('DashbarCardTagOrIcon', () => {
  const user = userEvent.setup();

  it("Should render a 'Route' icon", () => {
    render(<DashbarCardTagOrIcon title={PATHWAYS} />);

    // ensure the 'Route' icon is displayed
    expect(screen.getByTestId('route-icon')).toBeInTheDocument();
  });

  it("Should render 'Incidents' label", async () => {
    render(<DashbarCardTagOrIcon title={INCIDENTS} />);

    // ensure the correct text is displayed
    const incidentLabel = screen.getByText(/Incident/);
    expect(incidentLabel).toBeInTheDocument();

    await user.hover(incidentLabel);
    await screen.findByText(tooltipMessages.incidentTooltip.defaultMessage);
    expect(
      screen.getByText(tooltipMessages.incidentTooltip.defaultMessage)
    ).toBeInTheDocument();

    // ensure the tooltip message is hidden
    await user.unhover(incidentLabel);
    expect(
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    ).not.toBeInTheDocument();

    // but the label still appears
    expect(screen.getByText(/Incident/)).toBeInTheDocument();
  });

  it("Should render 'Important Recommendations' label", async () => {
    render(<DashbarCardTagOrIcon title={IMPORTANT_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    const importantLabel = screen.getByText(/Important/);
    expect(importantLabel).toBeInTheDocument();

    await user.hover(importantLabel);
    await screen.findByText(/The total risk of this remediation is/);
    expect(
      screen.getByText(/The total risk of this remediation is/)
    ).toBeInTheDocument();
    expect(screen.getByText(/important/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).toBeInTheDocument();

    // ensure the tooltip message is hidden
    await user.unhover(importantLabel);

    expect(
      screen.queryByText(/The total risk of this remediation is/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).not.toBeInTheDocument();

    // but the label still appears
    expect(screen.getByText(/Important/)).toBeInTheDocument();
  });

  it("Should render 'Critical Recommendations' label", async () => {
    render(<DashbarCardTagOrIcon title={CRITICAL_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    const criticalLabel = screen.getByText(/Critical/);
    expect(criticalLabel).toBeInTheDocument();

    await user.hover(criticalLabel);
    await screen.findByText(/The total risk of this remediation is/);
    expect(
      screen.getByText(/The total risk of this remediation is/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).toBeInTheDocument();

    // ensure the tooltip message is hidden
    await user.unhover(criticalLabel);

    expect(
      screen.queryByText(/The total risk of this remediation is/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).not.toBeInTheDocument();

    // but the label still appears
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
  });

  it('Should not render', () => {
    render(<DashbarCardTagOrIcon title={'Wrong Card Title'} />);

    // ensure the 'Route' icon is not displayed
    expect(screen.queryByTestId('route-icon')).not.toBeInTheDocument();

    // ensure non of the labels is displayed
    expect(screen.queryByText(/Incidents/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Important/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Critical/)).not.toBeInTheDocument();
  });
});
