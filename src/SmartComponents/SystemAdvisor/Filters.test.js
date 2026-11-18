import filters, {
  textFilter,
  totalRiskFilter,
  categoryFilter,
  playbookFilter,
} from './Filters';
import { RULE_CATEGORIES } from '../../AppConstants';

describe('SystemAdvisor Filters', () => {
  describe('default export', () => {
    it('contains all 4 configured filters', () => {
      expect(filters).toHaveLength(4);
      expect(filters).toEqual([
        textFilter,
        totalRiskFilter,
        categoryFilter,
        playbookFilter,
      ]);
    });
  });

  describe('textFilter', () => {
    it('has the correct filter metadata', () => {
      expect(textFilter.type).toBe('text');
      expect(textFilter.label).toBe('Description');
      expect(textFilter.filterAttribute).toBe('rule.description');
      expect(textFilter.id).toBe('text');
      expect(textFilter.urlParam).toBe('text');
      expect(textFilter.placeholder).toBe('Filter by description');
    });

    it('serializes string text filter value', () => {
      const result = textFilter.filterSerialiser(textFilter, 'kernel');
      expect(result).toBe('regex(.rule.description, "kernel", "i")');
    });

    it('serializes array text filter value and escapes special characters', () => {
      const result = textFilter.filterSerialiser(textFilter, ['foo.*+?bar']);
      expect(result).toBe(
        'regex(.rule.description, "foo\\\\.\\\\*\\\\+\\\\?bar", "i")',
      );
    });

    it('returns undefined when text value is empty or undefined', () => {
      expect(textFilter.filterSerialiser(textFilter, '')).toBeUndefined();
      expect(textFilter.filterSerialiser(textFilter, [])).toBeUndefined();
      expect(
        textFilter.filterSerialiser(textFilter, undefined),
      ).toBeUndefined();
    });
  });

  describe('totalRiskFilter', () => {
    it('has the correct filter metadata', () => {
      expect(totalRiskFilter.type).toBe('checkbox');
      expect(totalRiskFilter.filterAttribute).toBe('rule.total_risk');
      expect(totalRiskFilter.id).toBe('total_risk');
      expect(totalRiskFilter.urlParam).toBe('total_risk');
      expect(Array.isArray(totalRiskFilter.items)).toBe(true);
    });

    it('serializes numeric array values', () => {
      const result = totalRiskFilter.filterSerialiser(totalRiskFilter, [
        '1',
        '4',
      ]);
      expect(result).toBe('.rule.total_risk in [1,4]');
    });

    it('filters out invalid NaN values', () => {
      const result = totalRiskFilter.filterSerialiser(totalRiskFilter, [
        'invalid',
        '2',
      ]);
      expect(result).toBe('.rule.total_risk in [2]');
    });

    it('returns undefined when no valid numeric values are provided', () => {
      expect(
        totalRiskFilter.filterSerialiser(totalRiskFilter, []),
      ).toBeUndefined();
      expect(
        totalRiskFilter.filterSerialiser(totalRiskFilter, ['notanumber']),
      ).toBeUndefined();
      expect(
        totalRiskFilter.filterSerialiser(totalRiskFilter, null),
      ).toBeUndefined();
    });
  });

  describe('categoryFilter', () => {
    it('has the correct filter metadata', () => {
      expect(categoryFilter.type).toBe('checkbox');
      expect(categoryFilter.filterAttribute).toBe('rule.category.id');
      expect(categoryFilter.id).toBe('category');
      expect(categoryFilter.urlParam).toBe('category');
      expect(Array.isArray(categoryFilter.items)).toBe(true);
    });

    it('serializes direct numeric category IDs', () => {
      const result = categoryFilter.filterSerialiser(categoryFilter, [
        '1',
        '3',
      ]);
      expect(result).toBe('.rule.category.id in [1,3]');
    });

    it('serializes string category names via RULE_CATEGORIES mapping', () => {
      const result = categoryFilter.filterSerialiser(categoryFilter, [
        'security',
        'availability',
      ]);
      const expected = `.rule.category.id in [${RULE_CATEGORIES.security},${RULE_CATEGORIES.availability}]`;
      expect(result).toBe(expected);
    });

    it('filters out unknown categories', () => {
      const result = categoryFilter.filterSerialiser(categoryFilter, [
        'nonexistent',
        '1',
      ]);
      expect(result).toBe('.rule.category.id in [1]');
    });

    it('returns undefined when category values are empty or invalid', () => {
      expect(
        categoryFilter.filterSerialiser(categoryFilter, []),
      ).toBeUndefined();
      expect(
        categoryFilter.filterSerialiser(categoryFilter, ['unknown']),
      ).toBeUndefined();
      expect(
        categoryFilter.filterSerialiser(categoryFilter, null),
      ).toBeUndefined();
    });
  });

  describe('playbookFilter', () => {
    it('has the correct filter metadata', () => {
      expect(playbookFilter.type).toBe('checkbox');
      expect(playbookFilter.filterAttribute).toBe('resolution.has_playbook');
      expect(playbookFilter.id).toBe('has_playbook');
      expect(playbookFilter.urlParam).toBe('has_playbook');
      expect(Array.isArray(playbookFilter.items)).toBe(true);
    });

    it('serializes single true value', () => {
      const result = playbookFilter.filterSerialiser(playbookFilter, ['true']);
      expect(result).toBe('.resolution.has_playbook == true');
    });

    it('serializes single false value', () => {
      const result = playbookFilter.filterSerialiser(playbookFilter, ['false']);
      expect(result).toBe('.resolution.has_playbook == false');
    });

    it('returns undefined when array is empty or contains multiple values', () => {
      expect(
        playbookFilter.filterSerialiser(playbookFilter, []),
      ).toBeUndefined();
      expect(
        playbookFilter.filterSerialiser(playbookFilter, ['true', 'false']),
      ).toBeUndefined();
      expect(
        playbookFilter.filterSerialiser(playbookFilter, null),
      ).toBeUndefined();
    });
  });
});
