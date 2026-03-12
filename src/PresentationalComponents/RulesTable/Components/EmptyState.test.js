import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import translations from '../../../../locales/translations.json';

jest.mock('@patternfly/react-icons', () => ({
  CheckCircleIcon: (props) => (
    <svg data-testid="check-circle-icon" {...props} />
  ),
  CubesIcon: (props) => <svg data-testid="cubes-icon" {...props} />,
}));

jest.mock('@patternfly/react-tokens', () => ({
  t_global_icon_color_status_success_default: { value: 'green' },
}));

// Mock the helpers module to isolate EmptyState and avoid ESM import issues
jest.mock('../helpers', () => {
  const React = require('react');
  return {
    messageMapping: () => ({
      enabled: {
        title: 'No recommendations',
        body: React.createElement(
          'p',
          null,
          'None of your connected systems are affected by enabled recommendations.',
        ),
      },
      disabled: {
        title: 'No recommendations',
        body: React.createElement(
          'p',
          null,
          'No recommendations are disabled that match the applied filter settings.',
        ),
      },
      rhdisabled: {
        title: 'No recommendations',
        body: React.createElement(
          'p',
          null,
          'No recommendations are disabled proactively by Red Hat that match the applied filter settings.',
        ),
      },
      default: {
        title: 'No recommendations',
        body: React.createElement(
          'p',
          null,
          'None of your connected systems are affected by any known recommendations.',
        ),
      },
    }),
  };
});

import EmptyState from './EmptyState';

const renderWithIntl = (component) =>
  render(
    <IntlProvider locale="en" messages={translations}>
      {component}
    </IntlProvider>,
  );

describe('EmptyState', () => {
  const toggleRulesDisabled = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the "Include disabled recommendations" button when rule_status is "enabled"', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'enabled' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.getByText('Include disabled recommendations'),
    ).toBeInTheDocument();
  });

  it('calls toggleRulesDisabled with "disabled" when the button is clicked', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'enabled' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    await user.click(screen.getByText('Include disabled recommendations'));
    expect(toggleRulesDisabled).toHaveBeenCalledWith('disabled');
  });

  it('does not render the button when rule_status is "disabled"', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'disabled' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.queryByText('Include disabled recommendations'),
    ).not.toBeInTheDocument();
  });

  it('does not render the button when rule_status is "rhdisabled"', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'rhdisabled' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.queryByText('Include disabled recommendations'),
    ).not.toBeInTheDocument();
  });

  it('handles rule_status as an array', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: ['enabled'] }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.getByText('Include disabled recommendations'),
    ).toBeInTheDocument();
  });

  it('renders the correct empty state body for "disabled" status', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'disabled' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.getByText(
        'No recommendations are disabled that match the applied filter settings.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the correct empty state body for "rhdisabled" status', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'rhdisabled' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.getByText(
        'No recommendations are disabled proactively by Red Hat that match the applied filter settings.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the default empty state body for unknown status', () => {
    renderWithIntl(
      <EmptyState
        filters={{ rule_status: 'unknown' }}
        toggleRulesDisabled={toggleRulesDisabled}
      />,
    );

    expect(
      screen.getByText(
        'None of your connected systems are affected by any known recommendations.',
      ),
    ).toBeInTheDocument();
  });
});
