import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useGetRecsQuery } from '../../Services/Recs';
import { EnvironmentContext } from '../../App';
import {
  filterFetchBuilder,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import NewRulesTable from './NewRulesTable';
import messages from '../../Messages';
import { useSelector, useDispatch } from 'react-redux';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import downloadReport from '../Common/DownloadHelper';
import { updateRecFilters, filtersInitialState } from '../../Services/Filters';
import { urlFilterBuilder, getDefaultImpactingFilter } from './helpers';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { sortIndices } from './helpers';
import debounce from '../../Utilities/Debounce';
import { DEBOUNCE_DELAY } from '../../AppConstants';
import impactingFilter from '../Filters/impactingFilter';

/**
 * NewRulesTableContainer - Container component for NewRulesTable
 * Handles data fetching, Redux state management, and URL parameter synchronization
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.pathway] - Pathway filter value (e.g., for specific recommendation pathways)
 * @param {Object} [props.query] - Mock query object for testing (skips real API when provided)
 * @param {Array} [props.query.data] - Mock data array
 * @param {boolean} [props.query.isLoading] - Mock loading state
 * @param {boolean} [props.query.isError] - Mock error state
 * @param {boolean} [props.query.isFetching] - Mock fetching state
 * @param {Function} [props.query.refetch] - Mock refetch function
 * @param {boolean} [props.isTabActive=true] - Whether the tab containing this table is active
 * @returns {React.Component} NewRulesTable with data and configuration, or loading/error states
 */
const NewRulesTableContainer = ({ pathway, query, isTabActive = true }) => {
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);
  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const filters = useSelector(({ filters }) => filters.recState);

  const [filterBuilding, setFilterBuilding] = useState(true);
  const [searchText, setSearchText] = useState(filters?.text || '');
  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);

  const { hasEdgeDevices, edgeQuerySuccess } = useContext(AccountStatContext);

  const setFilters = (filters) => dispatch(updateRecFilters(filters));

  const impactingFilterDef = impactingFilter(
    setFilters,
    filters,
    hasEdgeDevices,
  );

  const options = {
    ...(selectedTags?.length ? { tags: selectedTags.join(',') } : {}),
    ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
    ...(pathway ? { pathway } : {}),
  };

  const realQuery = useGetRecsQuery(
    {
      ...filterFetchBuilder(filters),
      ...options,
      customBasePath: envContext?.BASE_URL,
    },
    {
      skip: !!query,
    },
  );

  const {
    data: apiResponse = [],
    isFetching,
    isLoading,
    isError,
    refetch,
  } = query || realQuery;

  const apiRules = apiResponse?.data || apiResponse || [];

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(filters, selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTags, workloads, SID]);

  useEffect(() => {
    if (isTabActive && filterBuilding && !hasEdgeDevices) {
      urlFilterBuilder(sortIndices, setSearchText, setFilters, filters);
    }
    if (isTabActive && filterBuilding && hasEdgeDevices) {
      urlFilterBuilder(sortIndices, setSearchText, setFilters, {
        ...filtersInitialState.recState,
        ...getDefaultImpactingFilter(hasEdgeDevices),
      });
    }
    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeQuerySuccess]);

  useEffect(() => {
    if (!filterBuilding && !isLoading) {
      const filter = { ...filters };
      const text = searchText.length ? { text: searchText } : {};
      delete filter.text;
      setFilters({ ...filter, ...text, offset: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  if (isFetching) {
    return (
      <SkeletonTable columns={7} rowsCount={20} ouiaId="loading-skeleton" />
    );
  }

  if (isError) {
    return (
      <ErrorState
        titleText={intl.formatMessage(messages.rulesTableErrorStateTitle)}
        bodyText={intl.formatMessage(messages.rulesTableErrorStateBody)}
      />
    );
  }

  const exportConfig = envContext?.isExportEnabled && {
    onSelect: (_e, fileType) =>
      downloadReport(
        'hits',
        fileType,
        filterFetchBuilder(filters),
        selectedTags,
        workloads,
        SID,
        dispatch,
        envContext.BASE_URL,
        addNotification,
      ),
  };

  return (
    <NewRulesTable
      rules={apiRules}
      exportConfig={exportConfig}
      isDisableRecEnabled={envContext?.isDisableRecEnabled}
      refetch={refetch}
      hasEdgeDevices={hasEdgeDevices}
      impactingFilterDef={impactingFilterDef}
    />
  );
};

NewRulesTableContainer.propTypes = {
  pathway: PropTypes.string,
  isTabActive: PropTypes.bool,
  query: PropTypes.shape({
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    isError: PropTypes.bool,
    isFetching: PropTypes.bool,
    refetch: PropTypes.func,
  }),
};

export default NewRulesTableContainer;
