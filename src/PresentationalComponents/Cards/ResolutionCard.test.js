import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { ResolutionCard } from './ResolutionCard';

const renderWithIntl = (component) => {
  return render(<IntlProvider locale="en">{component}</IntlProvider>);
};

describe('ResolutionCard', () => {
  const defaultProps = {
    name: 'Update kernel packages',
    reboot_required: true,
    resolution_risk: { risk: 3 }, // Moderate risk
    recommendation_level: 2, // Important
  };

  it('should render remediation name', () => {
    renderWithIntl(<ResolutionCard {...defaultProps} />);

    expect(screen.getByText('Update kernel packages')).toBeInTheDocument();
  });

  it('should display Resolution title', () => {
    renderWithIntl(<ResolutionCard {...defaultProps} />);

    expect(screen.getByText('Resolution')).toBeInTheDocument();
  });

  it('should display risk of change label for very low risk', () => {
    const props = {
      ...defaultProps,
      resolution_risk: { risk: 1 },
    };

    renderWithIntl(<ResolutionCard {...props} />);

    expect(screen.getByText('Risk of change')).toBeInTheDocument();
    expect(screen.getByText('Very Low')).toBeInTheDocument();
  });

  it('should display risk of change label for low risk', () => {
    const props = {
      ...defaultProps,
      resolution_risk: { risk: 2 },
    };

    renderWithIntl(<ResolutionCard {...props} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should display risk of change label for moderate risk', () => {
    const props = {
      ...defaultProps,
      resolution_risk: { risk: 3 },
    };

    renderWithIntl(<ResolutionCard {...props} />);

    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('should display risk of change label for high risk', () => {
    const props = {
      ...defaultProps,
      resolution_risk: { risk: 4 },
    };

    renderWithIntl(<ResolutionCard {...props} />);

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should display reboot required message when reboot is needed', () => {
    const props = {
      ...defaultProps,
      reboot_required: true,
    };

    renderWithIntl(<ResolutionCard {...props} />);

    expect(screen.getByText(/System reboot/i)).toBeInTheDocument();
  });

  it('should display reboot not required message when reboot is not needed', () => {
    const props = {
      ...defaultProps,
      reboot_required: false,
    };

    renderWithIntl(<ResolutionCard {...props} />);

    expect(screen.getByText(/System reboot/i)).toBeInTheDocument();
  });

  it('should display recommendation level', () => {
    renderWithIntl(<ResolutionCard {...defaultProps} />);

    expect(screen.getByText('Recommendation level')).toBeInTheDocument();
  });

  it('should render card with correct structure', () => {
    renderWithIntl(<ResolutionCard {...defaultProps} />);

    // Check that all major sections of the card are rendered
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.getByText('Remediation type')).toBeInTheDocument();
    expect(screen.getByText('Risk of change')).toBeInTheDocument();
    expect(screen.getByText('Recommendation level')).toBeInTheDocument();
  });

  it('should display static remediation description', () => {
    renderWithIntl(<ResolutionCard {...defaultProps} />);

    expect(screen.getByText(/additional steps needed/i)).toBeInTheDocument();
  });

  it('should render with minimal props', () => {
    const minimalProps = {
      name: 'Simple fix',
      reboot_required: false,
      resolution_risk: { risk: 1 },
      recommendation_level: 1,
    };

    renderWithIntl(<ResolutionCard {...minimalProps} />);

    expect(screen.getByText('Simple fix')).toBeInTheDocument();
    expect(screen.getByText('Very Low')).toBeInTheDocument();
  });
});
