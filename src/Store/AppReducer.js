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
        selected: state.selected || [],
        columns: cols.map((cell) => ({
          ...cell,
          ...state.columns.find(({ key }) => cell.key === key),
        })),
      };
    },

    [`${'SELECT_ENTITY'}`]: (state, action) => {
      let newSelectedState;
      let id = action.payload.id;
      if (state?.selected) {
        if (id === -1) {
          newSelectedState = [];
        } else if (Array.isArray(id)) {
          newSelectedState = id;
          state.rows.map((item) => {
            item.selected = true;
          });
          return {
            ...state,
            selected: newSelectedState,
          };
        } else if (!state?.selected.includes(id)) {
          newSelectedState = [...state.selected, id];
        } else if (state?.selected.includes(id)) {
          newSelectedState = [...state.selected.filter((item) => item !== id)];
        }
        return {
          ...state,
          selected: newSelectedState,
        };
      } else {
        return {
          state,
        };
      }
    },
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
