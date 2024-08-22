import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test.each`
    title                        | count | filterFunc
    ${PATHWAYS}                  | ${1}  | ${jest.fn()}
    ${INCIDENTS}                 | ${2}  | ${jest.fn()}
    ${CRITICAL_RECOMMENDATIONS}  | ${3}  | ${jest.fn()}
    ${IMPORTANT_RECOMMENDATIONS} | ${4}  | ${jest.fn()}
  `('Should render Overview cards', async ({ title, count, filterFunc }) => {
    render(
      <OverviewDashbarCard
        isLoaded
        name={title}
        title={title}
        count={count}
        onClickFilterByName={filterFunc}
      />
    );
    await screen.findByText(title);

    // ensure that the correct text is displayed
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(count)).toBeInTheDocument();

    // ensure that the filtering button is displayed
    expect(screen.getByTestId(title)).toBeInTheDocument();
  });

  test.each`
    title                        | count | filterFunc
    ${PATHWAYS}                  | ${1}  | ${jest.fn()}
    ${INCIDENTS}                 | ${2}  | ${jest.fn()}
    ${CRITICAL_RECOMMENDATIONS}  | ${3}  | ${jest.fn()}
    ${IMPORTANT_RECOMMENDATIONS} | ${4}  | ${jest.fn()}
  `(
    'Should filter Overview cards by title',
    async ({ title, count, filterFunc }) => {
      render(
        <OverviewDashbarCard
          isLoaded
          name={title}
          title={title}
          count={count}
          onClickFilterByName={filterFunc}
        />
      );
      await screen.findByText(title);

      const filterByTitleBtn = screen.getByTestId(title);
      await user.click(filterByTitleBtn);
      expect(filterFunc).toHaveBeenCalledWith(title);
    }
  );
});
