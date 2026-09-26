import filtersReducer, {
  filtersInitialState,
  updateRecFilters,
  updateSysFilters,
  updatePathFilters,
  updateTags,
  updateGroups,
  updateWorkloads,
} from './Filters';

describe('Filters Redux slice', () => {
  it('has correct initial state with selectedGroups', () => {
    expect(filtersInitialState).toEqual({
      recState: {
        impacting: ['true'],
        rule_status: 'enabled',
        sort: '-total_risk',
        limit: 20,
        offset: 0,
      },
      pathState: {
        sort: '-recommendation_level',
        limit: 20,
        offset: 0,
      },
      sysState: { sort: '-last_seen', limit: 20, offset: 0 },
      selectedTags: [],
      selectedGroups: [],
      workloads: {},
    });
  });

  it('updates selectedGroups on updateGroups action', () => {
    const initialState = { ...filtersInitialState };
    const nextState = filtersReducer(
      initialState,
      updateGroups(['workspace-prod', 'workspace-stage']),
    );

    expect(nextState.selectedGroups).toEqual([
      'workspace-prod',
      'workspace-stage',
    ]);
  });

  it('updates selectedTags on updateTags action', () => {
    const initialState = { ...filtersInitialState };
    const nextState = filtersReducer(initialState, updateTags(['env=prod']));

    expect(nextState.selectedTags).toEqual(['env=prod']);
  });

  it('updates workloads on updateWorkloads action', () => {
    const initialState = { ...filtersInitialState };
    const nextState = filtersReducer(
      initialState,
      updateWorkloads({ SAP: { isSelected: true } }),
    );

    expect(nextState.workloads).toEqual({ SAP: { isSelected: true } });
  });

  it('updates recState on updateRecFilters action', () => {
    const initialState = { ...filtersInitialState };
    const nextState = filtersReducer(
      initialState,
      updateRecFilters({ impacting: ['false'], sort: 'total_risk' }),
    );

    expect(nextState.recState).toEqual({
      impacting: ['false'],
      sort: 'total_risk',
    });
  });

  it('updates sysState on updateSysFilters action', () => {
    const initialState = { ...filtersInitialState };
    const nextState = filtersReducer(
      initialState,
      updateSysFilters({ sort: 'display_name' }),
    );

    expect(nextState.sysState).toEqual({ sort: 'display_name' });
  });

  it('updates pathState on updatePathFilters action', () => {
    const initialState = { ...filtersInitialState };
    const nextState = filtersReducer(
      initialState,
      updatePathFilters({ sort: 'name' }),
    );

    expect(nextState.pathState).toEqual({ sort: 'name' });
  });
});
