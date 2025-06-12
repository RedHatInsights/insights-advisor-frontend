import React from 'react';
import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/react';
import DetailsTitle from './DetailsTitle';
import { useFeatureFlag } from '../../Utilities/Hooks';

jest.mock('../../Utilities/Hooks', () => ({
  ...jest.requireActual('../../Utilities/Hooks'),
  useFeatureFlag: jest.fn(() => false),
}));

describe('DetailsTitle', () => {
  it('Should display loading state first', () => {
    render(<DetailsTitle areCountsLoading />);
    expect(screen.getByLabelText('Table title skeleton')).toBeVisible();
  });

  it('Should display "Affected Systems" when edge parity is disabled', () => {
    render(<DetailsTitle areCountsLoading={false} />);
    expect(screen.getByText('Affected Systems')).toBeVisible();
  });

  it('Should display "Affected Systems" when edge parity is enabled but there is no edge device in an account level', () => {
    useFeatureFlag.mockReturnValue(true);
    render(<DetailsTitle areCountsLoading={false} hasEdgeDevices={false} />);
    expect(screen.getByText('Affected Systems')).toBeVisible();
  });

  it('Should display "10  Total Systems" when edge parity is enabled and there is an edge device in an account level', () => {
    useFeatureFlag.mockReturnValue(true);
    render(
      <DetailsTitle
        areCountsLoading={false}
        hasEdgeDevices={true}
        systemsCount={10}
      />,
    );
    expect(screen.getByText('10 Total Systems')).toBeVisible();
  });
});
