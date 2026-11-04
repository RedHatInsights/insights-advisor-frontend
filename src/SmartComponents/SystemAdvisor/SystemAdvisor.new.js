import './SystemAdvisor.scss';
import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import NotConnected from '@redhat-cloud-services/frontend-components/NotConnected';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import {
  TableStateProvider,
  StaticTableToolsTable,
  useFullTableState,
  useStateCallbacks,
} from 'bastilian-tabletools';

import columns from './Columns';
import filters from './Filters';
import SystemAdvisorReportDetails from './SystemAdvisorReportDetails';
import { EnvironmentContext } from '../../App';
import downloadReport from '../../PresentationalComponents/Common/DownloadHelper';
import messages from '../../Messages';
import { toExportParams } from '../../Utilities/tableSerializers';
import { useSystemReportsQuery } from '../../Services/apiClient';
import { isAbortError } from './helpers';
import {
  InventoryReportFetchFailed,
  NoMatchingRecommendations,
} from './EmptyStates';

/**
 * Inner component for SystemAdvisor using TableTools and AdvisorTable composition.
 */
const SystemAdvisorInner = ({
  entity,
  inventoryId,
  response,
  hostName,
  ...props
}) => {
  const systemId =
    inventoryId || entity?.id || response?.insights_attributes?.uuid;
  const intl = useIntl();
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const axios = useAxiosWithPlatformInterceptors();
  const envContext = useContext(EnvironmentContext);
  const abortControllerRef = useRef(new AbortController());

  const selectedTags = useSelector(({ filters: f }) => f?.selectedTags);
  const workloads = useSelector(({ filters: f }) => f?.workloads);

  const callbacksRef = useStateCallbacks();
  const fullTableState = useFullTableState();
  const selectedItemIds = useMemo(
    () => fullTableState?.tableState?.selected || [],
    [fullTableState?.tableState?.selected],
  );
  const [kbaDetailsData, setKbaDetailsData] = useState([]);
  const [kbaLoading, setKbaLoading] = useState(false);
  const [systemProfile, setSystemProfile] = useState({});
  const [isSystemProfileLoading, setSystemProfileLoading] = useState(true);

  const serialisedFilters = fullTableState?.serialisedTableState?.filters;

  // Fetch reports data via TanStack Query
  const {
    data: reportsResponse,
    isLoading: isReportsLoading,
    isFetching: isReportsFetching,
    isError: isReportsError,
  } = useSystemReportsQuery(systemId, undefined, {
    refetchOnWindowFocus: false,
  });

  const rawReports = useMemo(() => {
    if (!reportsResponse) {
      return [];
    }
    return Array.isArray(reportsResponse)
      ? reportsResponse
      : reportsResponse.data || [];
  }, [reportsResponse]);

  // Transform reports into table items with id and itemId
  const allItems = useMemo(() => {
    return rawReports.map((report) => {
      const id =
        report.rule?.rule_id || `${report.rule_id}-${report.impacted_date}`;
      return {
        ...report,
        id,
        itemId: id,
      };
    });
  }, [rawReports]);

  // Fetch host system profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!systemId) {
        return;
      }
      try {
        const profileData = await axios.get(
          `${envContext?.INVENTORY_BASE_URL || '/api/inventory/v1'}/hosts/${systemId}/system_profile`,
          {
            headers: { credentials: 'include' },
            signal: abortControllerRef.current.signal,
          },
        );
        setSystemProfile(
          profileData?.results?.[0]?.system_profile ||
            profileData?.data?.results?.[0]?.system_profile ||
            {},
        );
      } catch (err) {
        if (!isAbortError(err)) {
          setSystemProfile({});
        }
      } finally {
        setSystemProfileLoading(false);
      }
    };
    fetchProfile();
  }, [systemId, axios, envContext?.INVENTORY_BASE_URL]);

  // Fetch KBA details for expandable rows
  useEffect(() => {
    const fetchKba = async () => {
      if (!rawReports.length) {
        setKbaDetailsData([]);
        return;
      }

      const kbaIds = rawReports
        .map(({ rule }) => rule?.node_id)
        .filter(Boolean);
      if (!kbaIds.length) {
        return;
      }

      try {
        setKbaLoading(true);
        const kbaDetailsFetch = await axios.get(
          `https://access.redhat.com/hydra/rest/search/kcs?q=id:(${kbaIds.join(
            ` OR `,
          )})&fq=documentKind:(Solution%20or%20Article)&fl=view_uri,id,publishedTitle&redhat_client=$ADVISOR`,
          {
            params: { credentials: 'include' },
            signal: abortControllerRef.current.signal,
          },
        );
        const docs =
          kbaDetailsFetch?.response?.docs ||
          kbaDetailsFetch?.data?.response?.docs ||
          [];
        setKbaDetailsData(docs);
      } catch (err) {
        if (!isAbortError(err)) {
          setKbaDetailsData([]);
        }
      } finally {
        setKbaLoading(false);
      }
    };

    fetchKba();
  }, [rawReports, axios]);

  // Selected Ansible-eligible rules for remediation
  const selectedAnsibleRules = useMemo(() => {
    return allItems.filter(
      (item) =>
        selectedItemIds.includes(item.itemId) && item.resolution?.has_playbook,
    );
  }, [allItems, selectedItemIds]);

  const processRemediation = useCallback(
    (rules) => {
      const playbookRows = rules.filter((r) => r.resolution?.has_playbook);
      const issues = playbookRows.map((r) => ({
        id: `advisor:${r.rule?.rule_id || r.itemId}`,
        description: r.rule?.description,
      }));
      return issues.length ? { issues, systems: [systemId] } : false;
    },
    [systemId],
  );

  const onRemediationCreated = useCallback(
    (result) => {
      callbacksRef.current?.resetSelection?.();
      try {
        result.remediation && addNotification(result.getNotification());
      } catch (error) {
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${error}`,
        });
      }
    },
    [callbacksRef, addNotification, intl],
  );

  const RemediationAction = useCallback(() => {
    if (isSystemProfileLoading || systemProfile?.host_type === 'edge') {
      return null;
    }

    return (
      <RemediationButton
        key="remediation-button"
        fallback={<Spinner size="md" />}
        isDisabled={selectedAnsibleRules.length === 0}
        dataProvider={() => processRemediation(selectedAnsibleRules)}
        onRemediationCreated={onRemediationCreated}
        hasSelected={selectedAnsibleRules.length > 0}
      >
        Plan remediation
      </RemediationButton>
    );
  }, [
    isSystemProfileLoading,
    systemProfile?.host_type,
    selectedAnsibleRules,
    processRemediation,
    onRemediationCreated,
  ]);

  const onExport = useCallback(
    (_e, fileType) => {
      const format =
        typeof fileType === 'string'
          ? fileType
          : typeof _e === 'string'
            ? _e
            : 'csv';
      const exportFilters = toExportParams(serialisedFilters);
      downloadReport(
        'hits',
        format,
        exportFilters,
        selectedTags,
        workloads,
        dispatch,
        envContext?.BASE_URL,
        entity?.display_name,
        addNotification,
        axios,
      );
    },
    [
      serialisedFilters,
      selectedTags,
      workloads,
      dispatch,
      envContext?.BASE_URL,
      entity?.display_name,
      addNotification,
      axios,
    ],
  );

  const allItemsRef = useRef([]);
  allItemsRef.current = allItems;

  const detailsComponentProps = useMemo(
    () => ({
      kbaDetails: kbaDetailsData,
      kbaLoading,
    }),
    [kbaDetailsData, kbaLoading],
  );

  const exportConfig = useMemo(
    () =>
      envContext?.isExportEnabled
        ? {
            tooltipText: intl.formatMessage(messages.exportData),
            onSelect: onExport,
          }
        : undefined,
    [envContext?.isExportEnabled, intl, onExport],
  );

  const tableOptions = useMemo(
    () => ({
      pagination: true,
      perPage: 20,
      sortBy: {
        index: 3,
        direction: 'desc',
      },
      variant: 'compact',
      isStickyHeader: true,
      detailsComponent: SystemAdvisorReportDetails,
      detailsComponentProps,
      detailsProps: { fullWidth: true },
      canCollapseAll: true,
      onSelect: true,
      dedicatedAction: RemediationAction,
      EmptyState: NoMatchingRecommendations,
      exporter: envContext?.isExportEnabled
        ? async (_state, _fullState, format) => {
            onExport(null, format);
            return null; // Return null so TableTools downloadItems is skipped
          }
        : undefined,
    }),
    [
      detailsComponentProps,
      RemediationAction,
      envContext?.isExportEnabled,
      onExport,
    ],
  );

  const toolbarProps = useMemo(
    () => (exportConfig ? { exportConfig } : undefined),
    [exportConfig],
  );

  if (isReportsLoading) {
    return (
      <SkeletonTable columns={columns.map((c) => c.title)} variant="compact" />
    );
  }

  if (isReportsError) {
    return <InventoryReportFetchFailed entity={entity} />;
  }

  const isSafe = !isReportsLoading && !isReportsFetching;

  return (
    <StaticTableToolsTable
      items={allItems}
      columns={columns}
      filters={{ filterConfig: filters }}
      options={tableOptions}
      toolbarProps={toolbarProps}
      aria-label="system-advisor-table"
      ouiaId="system-advisor-table"
      variant="compact"
      isStickyHeader
      data-ouia-safe={isSafe}
      {...props}
    />
  );
};

SystemAdvisorInner.propTypes = {
  entity: PropTypes.shape({
    insights_id: PropTypes.string,
    id: PropTypes.string,
    display_name: PropTypes.string,
  }),
  inventoryId: PropTypes.string,
  response: PropTypes.shape({
    insights_attributes: PropTypes.shape({
      uuid: PropTypes.string,
    }),
  }),
  hostName: PropTypes.string,
};

/**
 * SystemAdvisorNew - Container wrapping SystemAdvisorInner in TableStateProvider
 */
const SystemAdvisorNew = ({ entity, ...props }) => {
  if (entity?.insights_id === null) {
    return <NotConnected />;
  }

  return (
    <TableStateProvider>
      <SystemAdvisorInner entity={entity} {...props} />
    </TableStateProvider>
  );
};

SystemAdvisorNew.propTypes = {
  entity: PropTypes.shape({
    insights_id: PropTypes.string,
    id: PropTypes.string,
  }),
};

export default SystemAdvisorNew;
