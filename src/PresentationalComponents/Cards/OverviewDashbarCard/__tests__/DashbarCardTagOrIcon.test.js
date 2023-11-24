import React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
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
    screen.getByTestId('route-icon');
  });

  it("Should render 'Incidents' label", async () => {
    render(<DashbarCardTagOrIcon title={INCIDENTS} />);

    // ensure the correct text is displayed
    const incidentLabel = screen.getByText(/Incident/);
    await user.hover(incidentLabel);
    await waitFor(() =>
      screen.getByText(tooltipMessages.incidentTooltip.defaultMessage)
    );

    // ensure the tooltip message is hidden
    await user.unhover(incidentLabel);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    );
    expect(
      screen.queryByText(tooltipMessages.incidentTooltip.defaultMessage)
    ).toBe(null);

    // but the label still appears
    screen.getByText(/Incident/);
  });

  it("Should render 'Important Recommendations' label", async () => {
    render(<DashbarCardTagOrIcon title={IMPORTANT_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    const importantLabel = screen.getByText(/Important/);
    await user.hover(importantLabel);
    await waitFor(() =>
      screen.getByText(/The total risk of this remediation is/)
    );
    screen.getByText(/important/);
    screen.getByText(
      /based on the combination of likelihood and impact to remediate./
    );

    // ensure the tooltip message is hidden
    await user.unhover(importantLabel);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(/The total risk of this remediation is/)
    );
    expect(screen.queryByText(/The total risk of this remediation is/)).toBe(
      null
    );
    expect(
      screen.queryByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).toBe(null);

    // but the label still appears
    screen.getByText(/Important/);
  });

  it("Should render 'Critical Recommendations' label", async () => {
    render(<DashbarCardTagOrIcon title={CRITICAL_RECOMMENDATIONS} />);

    // ensure the correct text is displayed
    const criticalLabel = screen.getByText(/Critical/);
    await user.hover(criticalLabel);
    await waitFor(() =>
      screen.getByText(/The total risk of this remediation is/)
    );
    screen.getByText(/Critical/);
    screen.getByText(
      /based on the combination of likelihood and impact to remediate./
    );

    // ensure the tooltip message is hidden
    await user.unhover(criticalLabel);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(/The total risk of this remediation is/)
    );
    expect(screen.queryByText(/The total risk of this remediation is/)).toBe(
      null
    );
    expect(
      screen.queryByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).toBe(null);

    // but the label still appears
    screen.getByText(/Critical/);
  });

  it('Should not render', () => {
    render(<DashbarCardTagOrIcon title={'Wrong Card Title'} />);

    // ensure the 'Route' icon is not displayed
    expect(screen.queryByTestId('route-icon')).toBe(null);

    // ensure non of the labels is displayed
    expect(screen.queryByText(/Incidents/)).toBe(null);
    expect(screen.queryByText(/Important/)).toBe(null);
    expect(screen.queryByText(/Critical/)).toBe(null);
  });
});
