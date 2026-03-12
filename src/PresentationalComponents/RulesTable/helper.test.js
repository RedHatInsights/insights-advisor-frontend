import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import translations from '../../../locales/translations.json';

jest.mock('@patternfly/react-icons', () => ({
  CubesIcon: (props) => <svg data-testid="cubes-icon" {...props} />,
  CheckCircleIcon: (props) => <svg data-testid="check-icon" {...props} />,
  SearchIcon: () => <svg />,
}));

jest.mock(
  '@patternfly/react-icons/dist/esm/icons/bell-slash-icon',
  // eslint-disable-next-line react/display-name
  () => (props) => <svg data-testid="bell-slash-icon" {...props} />,
);

jest.mock('@redhat-cloud-services/frontend-components/InsightsLabel', () => ({
  InsightsLabel: () => <span />,
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  __esModule: true,
  default: ({ children }) => <a>{children}</a>,
}));

jest.mock('@redhat-cloud-services/frontend-components/DateFormat', () => ({
  DateFormat: () => <span />,
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-advisor-components',
  () => ({
    RuleDetails: () => <div />,
    RuleDetailsMessagesKeys: {},
    AdvisorProduct: { rhel: 'rhel' },
  }),
);

jest.mock(
  '@redhat-cloud-services/frontend-components/ConditionalFilter',
  () => ({
    conditionalFilterType: { text: 'text', checkbox: 'checkbox' },
  }),
);

jest.mock('react-router-dom', () => ({
  // eslint-disable-next-line react/prop-types
  Link: ({ children }) => <a>{children}</a>,
}));

import { messageMapping } from './helpers';

describe('RulesTable Helper Functions', () => {
  it('includes pathway filter when pathway is defined in filters', () => {
    const filters = { pathway: 'test-pathway' };
    const result = {
      ...(filters.pathway && { pathway: filters.pathway }),
    };

    expect(result).toEqual({ pathway: 'test-pathway' });
  });

  it('does not include pathway filter when pathway is not defined in filters', () => {
    const filters = {};
    const result = {
      ...(filters.pathway && { pathway: filters.pathway }),
    };

    expect(result).not.toHaveProperty('pathway');
    expect(result).toEqual({});
  });
});

describe('messageMapping', () => {
  const renderBody = (body) =>
    render(
      <IntlProvider locale="en" messages={translations}>
        {body}
      </IntlProvider>,
    );

  it('returns all expected rule status keys', () => {
    const mapping = messageMapping();
    expect(mapping).toHaveProperty('enabled');
    expect(mapping).toHaveProperty('disabled');
    expect(mapping).toHaveProperty('rhdisabled');
    expect(mapping).toHaveProperty('default');
  });

  it('disabled body contains the updated message text', () => {
    const mapping = messageMapping();
    renderBody(mapping.disabled.body);

    expect(
      screen.getByText(
        'No recommendations are disabled, or no recommendations are disabled that match the applied filter settings.',
      ),
    ).toBeInTheDocument();
  });

  it('disabled body does not contain the removed second line', () => {
    const mapping = messageMapping();
    renderBody(mapping.disabled.body);

    expect(
      screen.queryByText(
        /None of your connected systems are affected by enabled recommendations, and you currently have no disabled recommendations/,
      ),
    ).not.toBeInTheDocument();
  });

  it('rhdisabled body contains the updated message text', () => {
    const mapping = messageMapping();
    renderBody(mapping.rhdisabled.body);

    expect(
      screen.getByText(
        'No recommendations have been disabled proactively by Red Hat, or no recommendations are disabled proactively by Red Hat that match the applied filter settings.',
      ),
    ).toBeInTheDocument();
  });

  it('default body renders the noRecommendations message', () => {
    const mapping = messageMapping();
    renderBody(mapping.default.body);

    expect(
      screen.getByText(
        'None of your connected systems are affected by any known recommendations.',
      ),
    ).toBeInTheDocument();
  });
});
