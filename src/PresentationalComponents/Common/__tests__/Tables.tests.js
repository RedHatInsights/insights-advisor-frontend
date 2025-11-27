import {
  workloadQueryBuilder,
  mapUpdateMethodFilterToAPISpec,
} from '../Tables';
import fixtures from './Tables.fixtures';

describe('Tables', () => {
  let workloadFilter = {};
  let workloads;
  let SID;

  it('should not render empty with no workloads or SIDs', () => {
    workloadFilter = workloadQueryBuilder({}, []);
    expect(workloadFilter).toEqual({});
  });

  it('should render workloads', () => {
    workloads = fixtures.allWorkloadsFiltersTrue;
    SID = ['AB1', 'XY1'];

    workloadFilter = workloadQueryBuilder(workloads, SID);
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
