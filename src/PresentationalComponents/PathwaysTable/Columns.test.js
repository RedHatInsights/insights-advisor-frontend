import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import columns, {
  Name,
  Category,
  Systems,
  Reboot,
  RecommendationLevel,
} from './Columns';

jest.mock('./Cells', () => {
  const React = require('react');
  const PropTypes = require('prop-types');

  const MockName = ({ name }) => <div>{name}</div>;
  MockName.propTypes = {
    name: PropTypes.string,
  };

  const MockCategory = ({ categories }) => (
    <div>{categories?.map((c) => c.name).join(', ')}</div>
  );
  MockCategory.propTypes = {
    categories: PropTypes.array,
  };

  const MockSystems = ({ impacted_systems_count }) => (
    <div>{impacted_systems_count}</div>
  );
  MockSystems.propTypes = {
    impacted_systems_count: PropTypes.number,
  };

  const MockReboot = ({ reboot_required }) => (
    <div>{reboot_required ? 'Required' : 'Not required'}</div>
  );
  MockReboot.propTypes = {
    reboot_required: PropTypes.bool,
  };

  const MockRecommendationLevelCell = ({ recommendation_level }) => (
    <div>{recommendation_level}</div>
  );
  MockRecommendationLevelCell.propTypes = {
    recommendation_level: PropTypes.number,
  };

  return {
    Name: MockName,
    Category: MockCategory,
    Systems: MockSystems,
    Reboot: MockReboot,
    RecommendationLevelCell: MockRecommendationLevelCell,
  };
});

describe('Columns', () => {
  describe('Name column', () => {
    it('returns correct column configuration', () => {
      expect(Name.title).toBe('Name');
      expect(Name.sortable).toBe('name');
      expect(Name.props.width).toBe(45);
    });

    it('renders component correctly', () => {
      const { container } = render(
        <MemoryRouter>
          <Name.Component name="Test" slug="test" />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('Test');
    });
  });

  describe('Category column', () => {
    it('returns correct column configuration', () => {
      expect(Category.title).toBe('Category');
      expect(Category.sortable).toBeUndefined();
      expect(Category.props).toBeUndefined();
    });

    it('renders component correctly', () => {
      const categories = [{ id: 1, name: 'Security' }];
      const { container } = render(
        <MemoryRouter>
          <Category.Component categories={categories} />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('Security');
    });
  });

  describe('Systems column', () => {
    it('returns correct column configuration', () => {
      expect(Systems.title).toBe('Systems');
      expect(Systems.sortable).toBe('impacted_systems_count');
      expect(Systems.props.width).toBe(10);
    });

    it('renders component correctly', () => {
      const { container } = render(
        <MemoryRouter>
          <Systems.Component impacted_systems_count={42} slug="test" />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('42');
    });
  });

  describe('Reboot column', () => {
    it('returns correct column configuration', () => {
      expect(Reboot.title).toBe('Reboot');
      expect(Reboot.sortable).toBeUndefined();
      expect(Reboot.props).toBeUndefined();
    });

    it('renders component correctly', () => {
      const { container } = render(
        <MemoryRouter>
          <Reboot.Component reboot_required={true} />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('Required');
    });
  });

  describe('RecommendationLevel column', () => {
    it('returns correct column configuration', () => {
      expect(RecommendationLevel.title).toBe('Recommendation level');
      expect(RecommendationLevel.sortable).toBe('recommendation_level');
      expect(RecommendationLevel.props.width).toBe(20);
      expect(RecommendationLevel.props.info.tooltip).toContain(
        "Indicates a recommendation's urgency",
      );
      expect(
        RecommendationLevel.props.info.tooltipProps.isContentLeftAligned,
      ).toBe(true);
    });

    it('renders component correctly', () => {
      const { container } = render(
        <MemoryRouter>
          <RecommendationLevel.Component recommendation_level={4} />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('4');
    });
  });

  describe('default export (all columns)', () => {
    it('returns array of all column configurations', () => {
      expect(columns).toHaveLength(5);
      expect(columns[0].title).toBe('Name');
      expect(columns[1].title).toBe('Category');
      expect(columns[2].title).toBe('Systems');
      expect(columns[3].title).toBe('Reboot');
      expect(columns[4].title).toBe('Recommendation level');
    });

    it('all columns have Component property', () => {
      columns.forEach((column) => {
        expect(column.Component).toBeDefined();
      });
    });

    it('sortable columns are in correct positions', () => {
      expect(columns[0].sortable).toBe('name');
      expect(columns[1].sortable).toBeUndefined();
      expect(columns[2].sortable).toBe('impacted_systems_count');
      expect(columns[3].sortable).toBeUndefined();
      expect(columns[4].sortable).toBe('recommendation_level');
    });
  });
});
