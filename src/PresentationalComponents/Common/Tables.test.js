import { workloadArrayQueryBuilder } from './Tables';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/helpers',
  () => ({
    generateFilter: jest.fn(),
    downloadFile: jest.fn(),
  }),
);

jest.mock('../../AppConstants', () => ({
  SYSTEM_FILTER_CATEGORIES: {},
  SYSTEM_TYPES: { rhel: 1, ocp: 2 },
  FILTER_CATEGORIES: {},
  BASE_URL: '/api/advisor/v1',
}));

describe('workloadArrayQueryBuilder', () => {
  it('returns {} for an empty array', () => {
    expect(workloadArrayQueryBuilder([])).toEqual({});
  });

  it("returns { workload: ['sap'] } for a single-item array", () => {
    expect(workloadArrayQueryBuilder(['sap'])).toEqual({ workload: ['sap'] });
  });

  it('returns the full workload array for multiple values', () => {
    expect(workloadArrayQueryBuilder(['sap', 'ansible', 'mssql'])).toEqual({
      workload: ['sap', 'ansible', 'mssql'],
    });
  });

  it('returns {} when called with no argument (default parameter)', () => {
    expect(workloadArrayQueryBuilder()).toEqual({});
  });
});
