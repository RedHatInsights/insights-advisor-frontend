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
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import NotConnected from '@redhat-cloud-services/frontend-components/NotConnected';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import {
  TableStateProvider,
  useFullTableState,
  useStateCallbacks,
} from 'bastilian-tabletools';

import AdvisorTable from '../../PresentationalComponents/AdvisorTable/AdvisorTable';
import columns from './Columns';
import filters from './Filters';
import SystemAdvisorReportDetails from './SystemAdvisorReportDetails';
import { EnvironmentContext } from '../../App';
import downloadReport from '../../PresentationalComponents/Common/DownloadHelper';
import messages from '../../Messages';
import { toExportParams } from '../../Utilities/tableSerializers';
import { useSystemReportsQuery } from '../../Services/apiClient';
import { isAbortError } from './helpers';
import { InventoryReportFetchFailed } from './EmptyStates';
import { RULE_CATEGORIES } from '../../AppConstants';

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
    isError: isReportsError,
  } = useSystemReportsQuery(inventoryId, undefined, {
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

  // Transform reports into table items with itemId
  const allItems = useMemo(() => {
    return rawReports.map((report) => ({
      ...report,
      itemId:
        report.rule?.rule_id || `${report.rule_id}-${report.impacted_date}`,
    }));
  }, [rawReports]);

  // Client-side filtering
  const filteredItems = useMemo(() => {
    const activeFilters = serialisedFilters || {};
    const textSearch = activeFilters.text?.trim()?.toLowerCase() || '';

    return allItems.filter((item) => {
      const rule = item.rule || {};

      // Text search by rule description
      if (textSearch && !rule.description?.toLowerCase().includes(textSearch)) {
        return false;
      }

      // Total risk filter
      if (
        activeFilters.total_risk?.length &&
        !activeFilters.total_risk.map(String).includes(String(rule.total_risk))
      ) {
        return false;
      }

      // Category filter
      if (activeFilters.category?.length) {
        const itemCategory =
          RULE_CATEGORIES[rule.category?.name?.toLowerCase()];
        if (
          !activeFilters.category
            .map(String)
            .includes(String(itemCategory || rule.category?.id))
        ) {
          return false;
        }
      }

      // Has playbook filter
      if (
        activeFilters.has_playbook !== undefined &&
        String(item.resolution?.has_playbook) !==
          String(activeFilters.has_playbook)
      ) {
        return false;
      }

      return true;
    });
  }, [allItems, serialisedFilters]);

  // Fetch host system profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await axios.get(
          `${envContext?.INVENTORY_BASE_URL || '/api/inventory/v1'}/hosts/${inventoryId}/system_profile`,
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
  }, [inventoryId, axios, envContext?.INVENTORY_BASE_URL]);

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
    return filteredItems.filter(
      (item) =>
        selectedItemIds.includes(item.itemId) && item.resolution?.has_playbook,
    );
  }, [filteredItems, selectedItemIds]);

  const processRemediation = useCallback(
    (rules) => {
      const playbookRows = rules.filter((r) => r.resolution?.has_playbook);
      const issues = playbookRows.map((r) => ({
        id: `advisor:${r.rule?.rule_id || r.itemId}`,
        description: r.rule?.description,
      }));
      return issues.length ? { issues, systems: [inventoryId] } : false;
    },
    [inventoryId],
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

  const itemIdsInTable = useCallback(
    async () => allItemsRef.current.map((item) => item.itemId),
    [],
  );

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

  const tableDefaults = useMemo(
    () => ({
      columns,
      filters: {
        filterConfig: filters,
      },
      options: {
        detailsComponent: SystemAdvisorReportDetails,
        detailsComponentProps,
        detailsProps: { fullWidth: true },
        canCollapseAll: true,
        onSelect: true,
        dedicatedAction: RemediationAction,
        itemIdsInTable,
        exporter: envContext?.isExportEnabled
          ? async (_state, _fullState, format) => {
              onExport(null, format);
              return null; // Return null so TableTools downloadItems is skipped
            }
          : undefined,
      },
    }),
    [
      detailsComponentProps,
      RemediationAction,
      itemIdsInTable,
      envContext?.isExportEnabled,
      onExport,
    ],
  );

  const toolbarProps = useMemo(
    () => (exportConfig ? { exportConfig } : undefined),
    [exportConfig],
  );

  if (isReportsError && !isReportsLoading) {
    return <InventoryReportFetchFailed entity={entity} />;
  }

  return (
    <AdvisorTable
      items={filteredItems}
      total={filteredItems.length}
      loading={isReportsLoading}
      defaults={tableDefaults}
      toolbarProps={toolbarProps}
      aria-label="system-advisor-table"
      ouiaId="system-advisor-table"
      data-ouia-safe={!isReportsLoading}
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
  inventoryId: PropTypes.string.isRequired,
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
