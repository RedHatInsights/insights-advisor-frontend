import {
  workloadQueryBuilder,
  mapUpdateMethodFilterToAPISpec,
  buildTagFilter,
} from '../Tables';
import fixtures from './Tables.fixtures';

describe('Tables', () => {
  let workloadFilter = {};
  let workloads;

  it('should not render empty with no workloads', () => {
    workloadFilter = workloadQueryBuilder({});
    expect(workloadFilter).toEqual({});
  });

  it('should render workloads', () => {
    workloads = fixtures.allWorkloadsFiltersTrue;

    workloadFilter = workloadQueryBuilder(workloads);
    expect(workloadFilter).toEqual(fixtures.fullBuiltWorkloadQuery);
  });
});

const testFilterObject = {
  update_method: 'ostree,dnfyum',
  impacting: true,
};
describe('mapUpdateMethodFilterToAPISpec', () => {
  test('maps both conventional and immutable system filters', () => {
    const result = mapUpdateMethodFilterToAPISpec(testFilterObject);
    expect(result).toEqual({ impacting: true, update_method: 'ostree,dnfyum' });
  });

  test('sets impacting to false when update_method equals to none only', () => {
    const result = mapUpdateMethodFilterToAPISpec({
      ...testFilterObject,
      update_method: 'none',
    });
    expect(result).toEqual({ impacting: 'false' });
  });

  test('removes both update_method and impacting filter definitions when update_method is empty', () => {
    const result = mapUpdateMethodFilterToAPISpec({
      ...testFilterObject,
      update_method: '',
      someOtherTest: 'some-other-test-value',
    });
    expect(result).toEqual({ someOtherTest: 'some-other-test-value' });
  });

  test.each([
    ['none,ostree', 'ostree'],
    ['ostree,none', 'ostree'],
    ['none,dnfyum', 'dnfyum'],
    ['dnfyum,none', 'dnfyum'],
  ])(
    'removes impacting filter and none option when update method is %s',
    (updateMethodValue, expected) => {
      const resultWithOstree = mapUpdateMethodFilterToAPISpec({
        ...testFilterObject,
        update_method: updateMethodValue,
      });
      expect(resultWithOstree).toEqual({ update_method: expected });
    },
  );

  test.each([
    ['none,ostree,dnfyum'],
    ['ostree,none,dnfyum'],
    ['ostree,none,dnfyum'],
    ['ostree,dnfyum,none'],
    ['none,dnfyum,ostree'],
  ])(
    'removes both impacting filter and update_method when update method is %s',
    (updateMethodValue) => {
      const result = mapUpdateMethodFilterToAPISpec({
        ...testFilterObject,
        update_method: updateMethodValue,
        someOtherTest: 'some-other-test-value',
      });
      expect(result).toEqual({ someOtherTest: 'some-other-test-value' });
    },
  );

  test('should remove impacting filter when it is equal to empty string', () => {
    const result = mapUpdateMethodFilterToAPISpec({ impacting: '' });
    expect(result).toEqual({});
  });
});

describe('buildTagFilter', () => {
  test('returns empty object when tagFilters is undefined', () => {
    expect(buildTagFilter(undefined)).toEqual({});
  });

  test('returns empty object when tagFilters is null', () => {
    expect(buildTagFilter(null)).toEqual({});
  });

  test('returns empty tags array when tagFilters is an empty array', () => {
    expect(buildTagFilter([])).toEqual({ tags: [] });
  });

  test('builds tag filter from a single namespace with one tag', () => {
    const tagFilters = [
      {
        key: 'insights-client',
        values: [{ tagKey: 'group', value: 'prod' }],
      },
    ];

    expect(buildTagFilter(tagFilters)).toEqual({
      tags: ['insights-client/group=prod'],
    });
  });

  test('builds tag filter from a single namespace with multiple tags', () => {
    const tagFilters = [
      {
        key: 'insights-client',
        values: [
          { tagKey: 'group', value: 'prod' },
          { tagKey: 'env', value: 'us-east-1' },
        ],
      },
    ];

    expect(buildTagFilter(tagFilters)).toEqual({
      tags: ['insights-client/group=prod', 'insights-client/env=us-east-1'],
    });
  });

  test('builds tag filter from multiple namespaces', () => {
    const tagFilters = [
      {
        key: 'insights-client',
        values: [{ tagKey: 'group', value: 'prod' }],
      },
      {
        key: 'satellite',
        values: [{ tagKey: 'location', value: 'raleigh' }],
      },
    ];

    expect(buildTagFilter(tagFilters)).toEqual({
      tags: ['insights-client/group=prod', 'satellite/location=raleigh'],
    });
  });

  // Tag values with special characters must NOT be URI-encoded by
  // buildTagFilter, since the HTTP client handles encoding.
  test('does not URI-encode tag values with special characters', () => {
    const tagFilters = [
      {
        key: 'insights-client',
        values: [{ tagKey: 'group', value: 'prod & staging' }],
      },
    ];

    const result = buildTagFilter(tagFilters);

    // Current (correct): raw value preserved, no encoding
    expect(result).toEqual({
      tags: ['insights-client/group=prod & staging'],
    });

    // Verify it does NOT contain encoded values (the old bug)
    expect(result.tags[0]).not.toContain('%26');
    expect(result.tags[0]).not.toContain('%20');
  });

  test('does not URI-encode tag keys with special characters', () => {
    const tagFilters = [
      {
        key: 'my namespace',
        values: [{ tagKey: 'tag/key', value: 'value' }],
      },
    ];

    const result = buildTagFilter(tagFilters);

    expect(result).toEqual({
      tags: ['my namespace/tag/key=value'],
    });

    // Verify no encoding was applied
    expect(result.tags[0]).not.toContain('%2F');
    expect(result.tags[0]).not.toContain('%20');
  });

  test('does not URI-encode spaces in tag key names', () => {
    const tagFilters = [
      {
        key: 'insights-client',
        values: [{ tagKey: 'host group', value: 'prod' }],
      },
    ];

    const result = buildTagFilter(tagFilters);

    expect(result).toEqual({
      tags: ['insights-client/host group=prod'],
    });

    expect(result.tags[0]).not.toContain('%20');
  });

  test('does not URI-encode equals signs in tag values', () => {
    const tagFilters = [
      {
        key: 'ns',
        values: [{ tagKey: 'expr', value: 'a=b' }],
      },
    ];

    const result = buildTagFilter(tagFilters);

    expect(result).toEqual({
      tags: ['ns/expr=a=b'],
    });

    expect(result.tags[0]).not.toContain('%3D');
  });
});
