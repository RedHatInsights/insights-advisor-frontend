import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { TagLabelWithTooltip } from '../TagLabelWithTooltip';
import {
  SEVERITY_MAP,
  CRITICAL_TAG,
  IMPORTANT_TAG,
} from '../../../../AppConstants';

// This component returns an "Important" or "Critical" label with an appropriate formatted tooltip message
// It receives a typeOfTag prop, which is a number, and uses it to get the appropriate label and corresponding tooltip message
describe('TagLabelWithTooltip', () => {
  const user = userEvent.setup();

  it("Should render 'Critical' label", async () => {
    render(<TagLabelWithTooltip typeOfTag={SEVERITY_MAP[CRITICAL_TAG]} />);

    // ensure the label can be found in the page
    const criticalTitle = screen.getByText(/Critical/);
    expect(criticalTitle).toBeInTheDocument();

    // ensure that the tooltip text is displayed
    await user.hover(criticalTitle);
    await screen.findByText(/The total risk of this remediation is/);
    expect(
      screen.getByText(/The total risk of this remediation is/)
    ).toBeInTheDocument();
    expect(screen.getByText(/critical/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /based on the combination of likelihood and impact to remediate./
      )
    ).toBeInTheDocument();
  });

  it("Should render 'Important' label", async () => {
    render(<TagLabelWithTooltip typeOfTag={SEVERITY_MAP[IMPORTANT_TAG]} />);

    // ensure the label can be found in the page
    const importantTitle = screen.getByText(/Important/);
    expect(importantTitle).toBeInTheDocument();

    // ensure that the tooltip text is displayed
    await user.hover(importantTitle);
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
  });

  it("Should not render 'Important' or 'Critical' labels", async () => {
    await render(
      <TagLabelWithTooltip
        typeOfTag={SEVERITY_MAP['non-existing-severity-tag']}
      />
    );

    // ensure the texts of both labels is NOT displayed
    expect(screen.queryByText(/Important/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Critical/)).not.toBeInTheDocument();
  });
});
