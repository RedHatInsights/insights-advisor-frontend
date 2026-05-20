import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import {
  Name,
  Category,
  Systems,
  Reboot,
  RecommendationLevelCell,
} from './Cells';

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  __esModule: true,
  default: ({ to, children }) => <a href={to}>{children}</a>,
}));

jest.mock('../Labels/CategoryLabel', () => ({
  __esModule: true,
  default: ({ labelList }) => (
    <div data-testid="category-label">
      {labelList?.map((cat) => cat.name).join(', ')}
    </div>
  ),
}));

jest.mock('../Labels/RecommendationLevel', () => ({
  __esModule: true,
  default: ({ recLvl }) => <span data-testid="rec-level">{recLvl}</span>,
}));

jest.mock('../Labels/RuleLabels', () => ({
  __esModule: true,
  default: ({ rule }) => <span data-testid="rule-labels">{rule.tags}</span>,
}));

describe('Cells', () => {
  describe('Name', () => {
    it('renders pathway name as link', () => {
      render(
        <MemoryRouter>
          <Name name="Test Pathway" slug="test-pathway" has_incident={false} />
        </MemoryRouter>,
      );

      const link = screen.getByText('Test Pathway');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        'href',
        '/recommendations/pathways/test-pathway',
      );
    });

    it('renders incident label when has_incident is true', () => {
      render(
        <MemoryRouter>
          <Name
            name="Incident Pathway"
            slug="incident-pathway"
            has_incident={true}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText('Incident Pathway')).toBeInTheDocument();
      expect(screen.getByTestId('rule-labels')).toHaveTextContent('incident');
    });

    it('does not render incident label when has_incident is false', () => {
      render(
        <MemoryRouter>
          <Name
            name="Normal Pathway"
            slug="normal-pathway"
            has_incident={false}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText('Normal Pathway')).toBeInTheDocument();
      expect(screen.queryByTestId('rule-labels')).not.toBeInTheDocument();
    });
  });

  describe('Category', () => {
    it('renders category labels', () => {
      const categories = [
        { id: 1, name: 'Security' },
        { id: 2, name: 'Performance' },
      ];

      render(
        <MemoryRouter>
          <Category categories={categories} />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('category-label')).toHaveTextContent(
        'Security, Performance',
      );
    });

    it('renders with empty categories array', () => {
      render(
        <MemoryRouter>
          <Category categories={[]} />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('category-label')).toBeInTheDocument();
    });
  });

  describe('Systems', () => {
    it('renders impacted systems count as link', () => {
      render(
        <MemoryRouter>
          <Systems impacted_systems_count={42} slug="test-pathway" />
        </MemoryRouter>,
      );

      const link = screen.getByText('42');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        'href',
        '/recommendations/pathways/test-pathway',
      );
    });

    it('formats large numbers with locale formatting', () => {
      render(
        <MemoryRouter>
          <Systems impacted_systems_count={1234567} slug="test-pathway" />
        </MemoryRouter>,
      );

      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('handles zero count', () => {
      render(
        <MemoryRouter>
          <Systems impacted_systems_count={0} slug="test-pathway" />
        </MemoryRouter>,
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Reboot', () => {
    it('renders "Required" when reboot_required is true', () => {
      const { container } = render(<Reboot reboot_required={true} />);

      expect(container).toHaveTextContent('Required');
    });

    it('renders "Not required" when reboot_required is false', () => {
      const { container } = render(<Reboot reboot_required={false} />);

      expect(container).toHaveTextContent('Not required');
    });
  });

  describe('RecommendationLevelCell', () => {
    it('renders recommendation level badge', () => {
      render(<RecommendationLevelCell recommendation_level={4} />);

      expect(screen.getByTestId('rec-level')).toHaveTextContent('4');
    });

    it('handles different recommendation levels', () => {
      const { rerender } = render(
        <RecommendationLevelCell recommendation_level={1} />,
      );
      expect(screen.getByTestId('rec-level')).toHaveTextContent('1');

      rerender(<RecommendationLevelCell recommendation_level={3} />);
      expect(screen.getByTestId('rec-level')).toHaveTextContent('3');
    });
  });
});
