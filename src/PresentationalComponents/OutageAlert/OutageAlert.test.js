import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutageAlert from './OutageAlert';
import { useFeatureVariant } from '../../Utilities/Hooks';

jest.mock('../../Utilities/Hooks', () => ({
  ...jest.requireActual('../../Utilities/Hooks'),
  useFeatureVariant: jest.fn(),
}));

describe('OutageAlert', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when feature flag is disabled', () => {
    useFeatureVariant.mockReturnValue({
      isEnabled: false,
      body: undefined,
      variant: undefined,
      title: undefined,
    });

    const { container } = render(<OutageAlert />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders alert with default title when enabled without payload', () => {
    useFeatureVariant.mockReturnValue({
      isEnabled: true,
      body: undefined,
      variant: undefined,
      title: undefined,
    });

    render(<OutageAlert />);
    expect(
      screen.getByText(
        'The Advisor service is currently unavailable. Please check back later.',
      ),
    ).toBeInTheDocument();
  });

  it('renders alert with custom title from flag payload', () => {
    useFeatureVariant.mockReturnValue({
      isEnabled: true,
      body: 'Scheduled maintenance in progress.',
      variant: 'warning',
      title: 'Advisor is undergoing maintenance',
    });

    render(<OutageAlert />);
    expect(
      screen.getByText('Advisor is undergoing maintenance'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Scheduled maintenance in progress.'),
    ).toBeInTheDocument();
  });

  it('renders with danger variant by default', () => {
    useFeatureVariant.mockReturnValue({
      isEnabled: true,
      body: '',
      variant: undefined,
      title: undefined,
    });

    render(<OutageAlert />);
    const alertTitle = screen.getByText(
      'The Advisor service is currently unavailable. Please check back later.',
    );
    expect(alertTitle.closest('.pf-v6-c-alert')).toHaveClass('pf-m-danger');
  });

  it('renders with custom variant from flag payload', () => {
    useFeatureVariant.mockReturnValue({
      isEnabled: true,
      body: '',
      variant: 'warning',
      title: 'Partial outage',
    });

    render(<OutageAlert />);
    const alertTitle = screen.getByText('Partial outage');
    expect(alertTitle.closest('.pf-v6-c-alert')).toHaveClass('pf-m-warning');
  });

  it('calls useFeatureVariant with the correct flag name', () => {
    useFeatureVariant.mockReturnValue({ isEnabled: false });

    render(<OutageAlert />);
    expect(useFeatureVariant).toHaveBeenCalledWith('hbi.outage-banner');
  });
});
