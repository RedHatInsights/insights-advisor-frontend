import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import messages from '../../Messages';
import { EnvironmentContext } from '../../App';
import {
  RecommendationCell,
  ModifiedCell,
  FirstImpactedCell,
  TotalRiskCell,
  RemediationCell,
} from './Cells';

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const MockInsightsLink = ({ children, to }) => <a href={to}>{children}</a>;
  MockInsightsLink.propTypes = {
    children: PropTypes.node,
    to: PropTypes.string,
  };
  return {
    __esModule: true,
    default: MockInsightsLink,
  };
});

jest.mock('@redhat-cloud-services/frontend-components/InsightsLabel', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const MockInsightsLabel = ({ value }) => (
    <span data-testid="insights-label">{value}</span>
  );
  MockInsightsLabel.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };
  return {
    __esModule: true,
    default: MockInsightsLabel,
  };
});

jest.mock('../../PresentationalComponents/Labels/RuleLabels', () => {
  return function MockRuleLabels() {
    return <span data-testid="rule-labels" />;
  };
});

jest.mock('../../Utilities/dateHelpers', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const MockRelativeTime = ({ date }) => (
    <span data-testid="relative-date">{date}</span>
  );
  MockRelativeTime.propTypes = {
    date: PropTypes.string,
  };
  return {
    RelativeTimeWithTooltip: MockRelativeTime,
  };
});

const renderWithIntl = (component, envContext = {}) => {
  return render(
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={envContext}>
        {component}
      </EnvironmentContext.Provider>
    </IntlProvider>,
  );
};

describe('SystemAdvisor Cells', () => {
  describe('RecommendationCell', () => {
    it('returns null when rule is missing', () => {
      const { container } = renderWithIntl(<RecommendationCell />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders InsightsLink when loadChromeless is false', () => {
      renderWithIntl(
        <RecommendationCell
          rule={{ rule_id: 'test-rule', description: 'Test description' }}
        />,
        { loadChromeless: false },
      );
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/recommendations/test-rule',
      );
    });

    it('renders custom foreman URL when loadChromeless is true with generateRuleUrl', () => {
      const generateRuleUrl = (id) => `/custom/${id}`;
      renderWithIntl(
        <RecommendationCell
          rule={{ rule_id: 'rule-123', description: 'Foreman rule' }}
          generateRuleUrl={generateRuleUrl}
        />,
        { loadChromeless: true },
      );
      expect(screen.getByText('Foreman rule')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/custom/rule-123',
      );
    });

    it('renders fallback foreman URL when loadChromeless is true without generateRuleUrl', () => {
      renderWithIntl(
        <RecommendationCell
          rule={{ rule_id: 'rule-456', description: 'Foreman fallback' }}
        />,
        { loadChromeless: true },
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/foreman_rh_cloud/recommendations/rule-456',
      );
    });
  });

  describe('ModifiedCell', () => {
    it('returns null when rule or publish_date is missing', () => {
      const { container: c1 } = renderWithIntl(<ModifiedCell />);
      expect(c1).toBeEmptyDOMElement();

      const { container: c2 } = renderWithIntl(<ModifiedCell rule={{}} />);
      expect(c2).toBeEmptyDOMElement();
    });

    it('renders RelativeTimeWithTooltip when publish_date is present', () => {
      renderWithIntl(
        <ModifiedCell rule={{ publish_date: '2026-11-17T00:00:00Z' }} />,
      );
      expect(screen.getByTestId('relative-date')).toHaveTextContent(
        '2026-11-17T00:00:00Z',
      );
    });
  });

  describe('FirstImpactedCell', () => {
    it('returns null when impacted_date is missing', () => {
      const { container } = renderWithIntl(<FirstImpactedCell />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders RelativeTimeWithTooltip when impacted_date is present', () => {
      renderWithIntl(
        <FirstImpactedCell impacted_date="2026-10-01T00:00:00Z" />,
      );
      expect(screen.getByTestId('relative-date')).toHaveTextContent(
        '2026-10-01T00:00:00Z',
      );
    });
  });

  describe('TotalRiskCell', () => {
    it('returns null when rule is missing', () => {
      const { container } = renderWithIntl(<TotalRiskCell />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders total risk InsightsLabel with impact and likelihood tooltip', () => {
      renderWithIntl(
        <TotalRiskCell
          rule={{
            total_risk: 3,
            likelihood: 2,
            impact: { impact: 3 },
          }}
        />,
      );
      expect(screen.getByTestId('insights-label')).toHaveTextContent('3');
    });
  });

  describe('RemediationCell', () => {
    it('renders not available when resolution is null or undefined', () => {
      renderWithIntl(<RemediationCell resolution={null} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders playbook message when resolution has playbook', () => {
      renderWithIntl(<RemediationCell resolution={{ has_playbook: true }} />);
      expect(screen.getByText('Playbook')).toBeInTheDocument();
    });

    it('renders manual message when resolution has no playbook', () => {
      renderWithIntl(<RemediationCell resolution={{ has_playbook: false }} />);
      expect(screen.getByText('Manual')).toBeInTheDocument();
    });
  });
});
