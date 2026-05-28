import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import {
  RecommendationCell,
  ModifiedCell,
  CategoryCell,
  TotalRiskCell,
  SystemsCell,
  RemediationCell,
} from './Cells';

// Mock components
/* eslint-disable react/prop-types, react/display-name */
jest.mock('../Labels/CategoryLabel', () => ({
  __esModule: true,
  default: ({ labelList }) => (
    <div data-testid="category-label">{labelList[0].name}</div>
  ),
}));

jest.mock('../Labels/RuleLabels', () => ({
  __esModule: true,
  default: () => <div data-testid="rule-labels">Labels</div>,
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLabel', () => ({
  InsightsLabel: ({ value }) => (
    <span data-testid="insights-label">Risk: {value}</span>
  ),
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  __esModule: true,
  default: ({ to, children }) => <a href={to}>{children}</a>,
}));

jest.mock('@redhat-cloud-services/frontend-components/DateFormat', () => ({
  DateFormat: ({ date }) => <span>{date}</span>,
}));
/* eslint-enable react/prop-types, react/display-name */

describe('RulesTable Cells', () => {
  describe('RecommendationCell', () => {
    it('should render recommendation name as a link', () => {
      const props = {
        rule_id: 'test-rule-id',
        description: 'Test Recommendation',
      };

      render(
        <MemoryRouter>
          <RecommendationCell {...props} />
        </MemoryRouter>,
      );

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Test Recommendation');
      expect(link).toHaveAttribute('href', '/recommendations/test-rule-id');
    });

    it('should render RuleLabels component', () => {
      const props = {
        rule_id: 'test-rule-id',
        description: 'Test Recommendation',
      };

      render(
        <MemoryRouter>
          <RecommendationCell {...props} />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('rule-labels')).toBeInTheDocument();
    });
  });

  describe('ModifiedCell', () => {
    it('should render publish date', () => {
      render(<ModifiedCell publish_date="2024-01-01" />);
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    });
  });

  describe('CategoryCell', () => {
    it('should render category label', () => {
      const category = { id: 1, name: 'Availability' };
      render(<CategoryCell category={category} />);
      expect(screen.getByTestId('category-label')).toBeInTheDocument();
      expect(screen.getByText('Availability')).toBeInTheDocument();
    });
  });

  describe('TotalRiskCell', () => {
    it('should render total risk with tooltip', () => {
      render(<TotalRiskCell total_risk={3} />);
      expect(screen.getByTestId('insights-label')).toBeInTheDocument();
      expect(screen.getByText('Risk: 3')).toBeInTheDocument();
    });

    it('should handle different risk levels', () => {
      const { rerender } = render(<TotalRiskCell total_risk={1} />);
      expect(screen.getByText('Risk: 1')).toBeInTheDocument();

      rerender(<TotalRiskCell total_risk={4} />);
      expect(screen.getByText('Risk: 4')).toBeInTheDocument();
    });
  });

  describe('SystemsCell', () => {
    it('should render systems count as link when rule is enabled', () => {
      const props = {
        rule_status: 'enabled',
        rule_id: 'test-rule-id',
        impacted_systems_count: 42,
      };

      render(
        <MemoryRouter>
          <SystemsCell {...props} />
        </MemoryRouter>,
      );

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('42');
      expect(link).toHaveAttribute('href', '/recommendations/test-rule-id');
    });

    it('should render systems count as plain text when rule is disabled', () => {
      const props = {
        rule_status: 'disabled',
        rule_id: 'test-rule-id',
        impacted_systems_count: 42,
      };

      render(
        <MemoryRouter>
          <SystemsCell {...props} />
        </MemoryRouter>,
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should format large numbers with toLocaleString when enabled', () => {
      const props = {
        rule_status: 'enabled',
        rule_id: 'test-rule-id',
        impacted_systems_count: 1000,
      };

      render(
        <MemoryRouter>
          <SystemsCell {...props} />
        </MemoryRouter>,
      );

      // toLocaleString formats 1000 as "1,000" in en-US locale
      expect(screen.getByRole('link')).toHaveTextContent('1,000');
    });
  });

  describe('RemediationCell', () => {
    it('should render "Playbook" when playbook_count is greater than 0', () => {
      render(<RemediationCell playbook_count={1} />);
      expect(screen.getByText('Playbook')).toBeInTheDocument();
    });

    it('should render "Manual" when playbook_count is 0', () => {
      render(<RemediationCell playbook_count={0} />);
      expect(screen.getByText('Manual')).toBeInTheDocument();
    });

    it('should render "Playbook" when playbook_count is multiple', () => {
      render(<RemediationCell playbook_count={5} />);
      expect(screen.getByText('Playbook')).toBeInTheDocument();
    });
  });
});
