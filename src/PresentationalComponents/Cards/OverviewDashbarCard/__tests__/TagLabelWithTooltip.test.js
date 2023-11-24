import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { TagLabelWithTooltip } from '../components/DashbarCardTagOrIcon/TagLabelWithTooltip';

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

    // ensure that the tooltip text is displayed
    await user.hover(criticalTitle);
    await waitFor(() =>
      screen.getByText(/The total risk of this remediation is/)
    );
    screen.getByText(/critical/);
    screen.getByText(
      /based on the combination of likelihood and impact to remediate./
    );
  });

  it("Should render 'Important' label", async () => {
    render(<TagLabelWithTooltip typeOfTag={SEVERITY_MAP[IMPORTANT_TAG]} />);

    // ensure the label can be found in the page
    const importantTitle = screen.getByText(/Important/);

    // ensure that the tooltip text is displayed
    await user.hover(importantTitle);
    await waitFor(() =>
      screen.getByText(/The total risk of this remediation is/)
    );
    screen.getByText(/important/);
    screen.getByText(
      /based on the combination of likelihood and impact to remediate./
    );
  });

  it("Should not render 'Important' or 'Critical' labels", async () => {
    await render(
      <TagLabelWithTooltip
        typeOfTag={SEVERITY_MAP['non-existing-severity-tag']}
      />
    );

    // ensure the texts of both labels is NOT displayed
    expect(screen.queryByText(/Important/)).toBe(null);
    expect(screen.queryByText(/Critical/)).toBe(null);
  });
});
