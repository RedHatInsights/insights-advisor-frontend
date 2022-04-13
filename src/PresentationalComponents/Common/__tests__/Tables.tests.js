import { workloadQueryBuilder } from '../Tables';
import fixtures from './Tables.fixtures';

describe('Tables', () => {
  let workloadFilter = {};
  let workloads;
  let SID;

  it('should not render empty with no workloads or SIDs', () => {
    workloadFilter = workloadQueryBuilder({}, []);
    expect(workloadFilter).toEqual({});
  });

  it('should render workloads or SIDs', () => {
    workloads = fixtures.allWorkloadsFiltersTrue;
    SID = ['AB1', 'XY1'];

    workloadFilter = workloadQueryBuilder(workloads, SID);
    expect(workloadFilter).toEqual(fixtures.fullBuiltWorkloadQuery);
  });
});
