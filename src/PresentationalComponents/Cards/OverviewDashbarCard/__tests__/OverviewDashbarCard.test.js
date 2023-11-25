import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { OverviewDashbarCard } from '../OverviewDashbarCard';
import {
  PATHWAYS,
  INCIDENTS,
  CRITICAL_RECOMMENDATIONS,
  IMPORTANT_RECOMMENDATIONS,
} from '../../../../AppConstants';

// this component returns the appropriate Card component based on the title it receives
describe('OverviewDashbarCard', () => {
  const user = userEvent.setup();

  it('Should render Pathways Card', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={PATHWAYS}
        count={1}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(PATHWAYS));

    // ensure that the correct text is displayed
    expect(screen.getByText(PATHWAYS)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();

    // ensure that the filtering button is displayed
    expect(screen.getByTestId(PATHWAYS)).toBeInTheDocument();
  });

  it('Should filter by Pathways', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={PATHWAYS}
        count={1}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(PATHWAYS));

    const filterByTitleBtn = screen.getByTestId(PATHWAYS);
    await user.click(filterByTitleBtn);
    expect(onClickFilterByTitle).toHaveBeenCalledWith(PATHWAYS);
  });

  it('Should render Incidents Card', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={INCIDENTS}
        count={2}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(INCIDENTS));

    // ensure that the correct text is displayed
    expect(screen.getByText(INCIDENTS)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();

    // ensure that the filtering button is displayed
    expect(screen.getByTestId(INCIDENTS)).toBeInTheDocument();
  });

  it('Should filter by Incidents', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={INCIDENTS}
        count={2}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(INCIDENTS));

    const filterByTitleBtn = screen.getByTestId(INCIDENTS);
    await user.click(filterByTitleBtn);
    expect(onClickFilterByTitle).toHaveBeenCalledWith(INCIDENTS);
  });

  it('Should render Critical Recommendations Card', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={CRITICAL_RECOMMENDATIONS}
        count={3}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(CRITICAL_RECOMMENDATIONS));

    // ensure that the correct text is displayed
    expect(screen.getByText(CRITICAL_RECOMMENDATIONS)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();

    // ensure that the filtering button is displayed
    expect(screen.getByTestId(CRITICAL_RECOMMENDATIONS)).toBeInTheDocument();
  });

  it('Should filter by Critical Recommendations', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={CRITICAL_RECOMMENDATIONS}
        count={3}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(CRITICAL_RECOMMENDATIONS));

    const filterByTitleBtn = screen.getByTestId(CRITICAL_RECOMMENDATIONS);
    await user.click(filterByTitleBtn);
    expect(onClickFilterByTitle).toHaveBeenCalledWith(CRITICAL_RECOMMENDATIONS);
  });

  it('Should render Important Recommendations Card', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={IMPORTANT_RECOMMENDATIONS}
        count={4}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(IMPORTANT_RECOMMENDATIONS));

    // ensure that the correct text is displayed
    expect(screen.getByText(IMPORTANT_RECOMMENDATIONS)).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();

    // ensure that the filtering button is displayed
    expect(screen.getByTestId(IMPORTANT_RECOMMENDATIONS)).toBeInTheDocument();
  });

  it('Should filter by Important Recommendations', async () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={IMPORTANT_RECOMMENDATIONS}
        count={4}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );
    await waitFor(() => screen.getByText(IMPORTANT_RECOMMENDATIONS));

    const filterByTitleBtn = screen.getByTestId(IMPORTANT_RECOMMENDATIONS);
    await user.click(filterByTitleBtn);
    expect(onClickFilterByTitle).toHaveBeenCalledWith(
      IMPORTANT_RECOMMENDATIONS
    );
  });

  it('Should not render', () => {
    const onClickFilterByTitle = jest.fn();
    render(
      <OverviewDashbarCard
        title={'Wrong Card Title'}
        count={5}
        onClickFilterByTitle={onClickFilterByTitle}
      />
    );

    // ensure nothing is displayed
    expect(screen.queryByText(/Wrong Card Title/)).toBe(null);
    expect(screen.queryByText(/5/)).toBe(null);
    expect(screen.queryByTestId(/Wrong Card Title/)).toBe(null);

    // ensure filtering function is not called
    expect(onClickFilterByTitle).toHaveBeenCalledTimes(0);
  });
});
