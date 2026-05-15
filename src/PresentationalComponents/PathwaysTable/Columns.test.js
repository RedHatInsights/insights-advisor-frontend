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
    <div>{String(reboot_required)}</div>
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

const createMessageDescriptor = (id, defaultMessage) => ({
  id,
  defaultMessage: defaultMessage || id,
});

jest.mock('../../Messages', () => ({
  pathwaysName: createMessageDescriptor('pathwaysName', 'Pathway Name'),
  category: createMessageDescriptor('category', 'Category'),
  systems: createMessageDescriptor('systems', 'Systems'),
  reboot: createMessageDescriptor('reboot', 'Reboot'),
  reclvl: createMessageDescriptor('reclvl', 'Recommendation Level'),
  reclvldetails: createMessageDescriptor(
    'reclvldetails',
    'Recommendation Level Details',
  ),
}));

const mockIntl = {
  formatMessage: (msg) => msg.defaultMessage,
};

describe('Columns', () => {
  describe('Name column', () => {
    it('returns correct column configuration', () => {
      const column = Name(mockIntl);

      expect(column.title).toBe('Pathway Name');
      expect(column.sortable).toBe('name');
      expect(column.props.width).toBe(45);
    });

    it('renders component with intl prop', () => {
      const column = Name(mockIntl);
      const { container } = render(
        <MemoryRouter>
          <column.Component name="Test" slug="test" />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('Test');
    });
  });

  describe('Category column', () => {
    it('returns correct column configuration', () => {
      const column = Category(mockIntl);

      expect(column.title).toBe('Category');
      expect(column.sortable).toBeUndefined();
      expect(column.props).toBeUndefined();
    });

    it('renders component correctly', () => {
      const column = Category(mockIntl);
      const categories = [{ id: 1, name: 'Security' }];
      const { container } = render(
        <MemoryRouter>
          <column.Component categories={categories} />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('Security');
    });
  });

  describe('Systems column', () => {
    it('returns correct column configuration', () => {
      const column = Systems(mockIntl);

      expect(column.title).toBe('Systems');
      expect(column.sortable).toBe('impacted_systems_count');
      expect(column.props.width).toBe(10);
    });

    it('renders component correctly', () => {
      const column = Systems(mockIntl);
      const { container } = render(
        <MemoryRouter>
          <column.Component impacted_systems_count={42} slug="test" />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('42');
    });
  });

  describe('Reboot column', () => {
    it('returns correct column configuration', () => {
      const column = Reboot(mockIntl);

      expect(column.title).toBe('Reboot');
      expect(column.sortable).toBeUndefined();
      expect(column.props).toBeUndefined();
    });

    it('renders component with intl prop', () => {
      const column = Reboot(mockIntl);
      const { container } = render(
        <MemoryRouter>
          <column.Component reboot_required={true} />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('true');
    });
  });

  describe('RecommendationLevel column', () => {
    it('returns correct column configuration', () => {
      const column = RecommendationLevel(mockIntl);

      expect(column.title).toBe('Recommendation Level');
      expect(column.sortable).toBe('recommendation_level');
      expect(column.props.width).toBe(20);
      expect(column.props.info.tooltip).toBe('Recommendation Level Details');
      expect(column.props.info.tooltipProps.isContentLeftAligned).toBe(true);
    });

    it('renders component correctly', () => {
      const column = RecommendationLevel(mockIntl);
      const { container } = render(
        <MemoryRouter>
          <column.Component recommendation_level={4} />
        </MemoryRouter>,
      );

      expect(container).toHaveTextContent('4');
    });
  });

  describe('default export (all columns)', () => {
    it('returns array of all column configurations', () => {
      const allColumns = columns(mockIntl);

      expect(allColumns).toHaveLength(5);
      expect(allColumns[0].title).toBe('Pathway Name');
      expect(allColumns[1].title).toBe('Category');
      expect(allColumns[2].title).toBe('Systems');
      expect(allColumns[3].title).toBe('Reboot');
      expect(allColumns[4].title).toBe('Recommendation Level');
    });

    it('all columns have Component property', () => {
      const allColumns = columns(mockIntl);

      allColumns.forEach((column) => {
        expect(column.Component).toBeDefined();
      });
    });

    it('sortable columns are in correct positions', () => {
      const allColumns = columns(mockIntl);

      expect(allColumns[0].sortable).toBe('name');
      expect(allColumns[1].sortable).toBeUndefined();
      expect(allColumns[2].sortable).toBe('impacted_systems_count');
      expect(allColumns[3].sortable).toBeUndefined();
      expect(allColumns[4].sortable).toBe('recommendation_level');
    });
  });
});
