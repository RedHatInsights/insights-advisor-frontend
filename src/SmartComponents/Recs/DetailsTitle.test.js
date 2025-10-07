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

  it('Should display "10 Affected Systems"', () => {
    useFeatureFlag.mockReturnValue(true);
    render(<DetailsTitle areCountsLoading={false} systemsCount={10} />);
    expect(screen.getByText('10 Affected Systems')).toBeVisible();
  });
});
