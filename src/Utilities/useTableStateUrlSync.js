import { useEffect, useRef } from 'react';
import { useSerialisedTableState } from 'bastilian-tabletools';
import { urlBuilder } from '../PresentationalComponents/Common/Tables';
import { deserializeUrlToTableState } from './urlToTableState';

export const getInitialTableState = (columns, filters, defaultState = {}) => {
  const urlState = deserializeUrlToTableState(columns, filters);
  return {
    ...defaultState,
    ...urlState,
  };
};

export const useSyncTableStateToUrl = (
  additionalParams = {},
  enabled = true,
) => {
  const serialisedState = useSerialisedTableState();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!enabled || !serialisedState) return;

    // Skip first render to let sortBy in options take effect
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const allParams = {
      ...serialisedState?.pagination,
      ...serialisedState?.filters,
      ...(serialisedState?.sort && { sort: serialisedState.sort }),
      ...additionalParams,
    };

    urlBuilder(allParams);
  }, [serialisedState, additionalParams, enabled]);
};
