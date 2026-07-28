import { combineParamsWithTableState } from './combineParamsWithTableState';

describe('combineParamsWithTableState', () => {
  it('should combine table state params with additional params', () => {
    const tableStateParams = {
      offset: 0,
      limit: 20,
      sort: '-name',
    };
    const additionalParams = {
      tags: 'tag1,tag2',
      SAP: true,
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result).toEqual({
      offset: 0,
      limit: 20,
      sort: '-name',
      tags: 'tag1,tag2',
      SAP: true,
    });
  });

  it('should handle empty table state params', () => {
    const additionalParams = { tags: 'tag1' };
    const result = combineParamsWithTableState({}, additionalParams);

    expect(result).toEqual({ tags: 'tag1' });
  });

  it('should handle empty additional params', () => {
    const tableStateParams = { offset: 0, limit: 20 };
    const result = combineParamsWithTableState(tableStateParams, {});

    expect(result).toEqual({ offset: 0, limit: 20 });
  });

  it('should handle both params being empty', () => {
    const result = combineParamsWithTableState({}, {});
    expect(result).toEqual({});
  });

  it('should handle undefined params with defaults', () => {
    const result = combineParamsWithTableState();
    expect(result).toEqual({});
  });

  it('should merge filters from both sources', () => {
    const tableStateParams = {
      offset: 0,
      filters: { category: '1,2', text: 'search' },
    };
    const additionalParams = {
      filters: { tags: 'tag1,tag2' },
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result).toEqual({
      offset: 0,
      filters: {
        category: '1,2',
        text: 'search',
        tags: 'tag1,tag2',
      },
    });
  });

  it('should handle filters only in table state params', () => {
    const tableStateParams = {
      filters: { category: '1' },
    };
    const additionalParams = {
      tags: 'tag1',
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result).toEqual({
      filters: { category: '1' },
      tags: 'tag1',
    });
  });

  it('should handle filters only in additional params', () => {
    const tableStateParams = {
      offset: 0,
    };
    const additionalParams = {
      filters: { tags: 'tag1' },
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result).toEqual({
      offset: 0,
      filters: { tags: 'tag1' },
    });
  });

  it('should overwrite table state params with additional params when keys conflict', () => {
    const tableStateParams = {
      offset: 0,
      limit: 20,
    };
    const additionalParams = {
      limit: 50,
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result.limit).toBe(50);
  });

  it('should overwrite filter keys from additional params when they conflict', () => {
    const tableStateParams = {
      filters: { category: '1' },
    };
    const additionalParams = {
      filters: { category: '2,3' },
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result.filters.category).toBe('2,3');
  });

  it('should handle complex nested scenario', () => {
    const tableStateParams = {
      offset: 20,
      limit: 50,
      sort: '-impacted_systems_count',
      filters: {
        category: '1,2',
        has_incident: 'true',
        text: 'security',
      },
    };
    const additionalParams = {
      tags: 'prod,security',
      SAP: true,
      filters: {
        reboot_required: 'false',
      },
    };

    const result = combineParamsWithTableState(
      tableStateParams,
      additionalParams,
    );

    expect(result).toEqual({
      offset: 20,
      limit: 50,
      sort: '-impacted_systems_count',
      tags: 'prod,security',
      SAP: true,
      filters: {
        category: '1,2',
        has_incident: 'true',
        text: 'security',
        reboot_required: 'false',
      },
    });
  });
});
