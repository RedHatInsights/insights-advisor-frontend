import { createSlice } from '@reduxjs/toolkit';

export const filtersInitialState = {
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
  workloads: {},
};

const filters = createSlice({
  name: 'filters',
  initialState: filtersInitialState,
  reducers: {
    updateRecFilters(state, action) {
      state.recState = action.payload;
    },
    updateSysFilters(state, action) {
      state.sysState = action.payload;
    },
    updatePathFilters(state, action) {
      state.pathState = action.payload;
    },
    updateTags(state, action) {
      state.selectedTags = action.payload;
    },
    updateWorkloads(state, action) {
      state.workloads = action.payload;
    },
  },
});

export const {
  updateRecFilters,
  updateSysFilters,
  updatePathFilters,
  updateTags,
  updateWorkloads,
} = filters.actions;

export default filters.reducer;
