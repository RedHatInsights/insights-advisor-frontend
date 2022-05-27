import Advisor from '../SmartComponents/SystemAdvisor';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';

export function systemReducer(cols, INVENTORY_ACTION_TYPES) {
  return applyReducerHash({
    [`${INVENTORY_ACTION_TYPES.LOAD_ENTITIES}_FULFILLED`]: (state) => {
      const { [state.columns.length - 1]: lastCol } = state.columns;
      cols[cols.length - 1] = {
        ...lastCol,
        ...cols[cols.length - 1],
      };
      return {
        ...state,
        columns: cols.map((cell) => ({
          ...cell,
          ...state.columns.find(({ key }) => cell.key === key),
        })),
      };
    },
    ['SELECT_ENTITIES']: (state, { payload: { selected } }) => ({
      ...state,
      rows: selectRows(state.rows, selected),
    }),
  });
}

export function entitiesDetailsReducer(ActionTypes) {
  return applyReducerHash(
    {
      [`${ActionTypes.LOAD_ENTITY}_FULFILLED`]: enableApplications,
    },
    {}
  );
}

function enableApplications(state) {
  return {
    ...state,
    loaded: true,
    activeApps: [{ title: 'Insights', name: 'insights', component: Advisor }],
  };
}

const selectRows = (rows, selected = []) =>
  (rows || []).map((row) => ({
    ...row,
    selected: selected.includes(row.id),
  }));
