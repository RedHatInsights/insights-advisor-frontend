import './_Inventory.scss';

import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import { TableVariant, sortable, wrappable } from '@patternfly/react-table';
import { pruneFilters, urlBuilder } from '../Common/Tables';
import { shallowEqual, useDispatch, useSelector, useStore } from 'react-redux';
import {
  getEntities,
  allCurrentSystemIds,
  iopResolutionsMapper,
  impactedDateColumn,
  lastSeenColumn,
} from './helpers';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import { Get } from '../../Utilities/Api';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import DownloadPlaybookButton from '../../Utilities/DownloadPlaybookButton';
import { SYSTEM_FILTER_CATEGORIES as SFC } from '../../AppConstants';
import messages from '../../Messages';
import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';
import { systemReducer } from '../../Store/AppReducer';
import { updateReducers } from '../../Store';
import { useIntl } from 'react-intl';
import downloadReport from '../Common/DownloadHelper';
import useBulkSelect from './Hooks/useBulkSelect';
import { Bullseye, Flex, FlexItem, Spinner, Tooltip } from '@patternfly/react-core';
import { EnvironmentContext } from '../../App';
import { AsyncComponent } from '@redhat-cloud-services/frontend-components';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { Link } from 'react-router-dom';

const ASYNC_COMPONENT_FALLBACK = <Bullseye><Spinner size="xl" /></Bullseye>;

const CHROMELESS_HIDE_FILTERS = {
  all: true, name: false, tags: true, operatingSystem: false, hostGroupFilter: true,
};
const STANDARD_HIDE_FILTERS = {
  all: true, name: false, tags: false, operatingSystem: false, hostGroupFilter: false,
};

const Inventory = ({
  tableProps,
  rule,
  afterDisableFn,
  pathway,
  selectedTags,
  workloads,
  permsExport,
  exportTable,
  showTags,
  axios,
  IopRemediationModal,
}) => {

  const store = useStore();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
    sort: '-last_seen',
    name: '',
    'filter[system_profile]': true,
  });
  const [fullFilters, setFullFilters] = useState();
  const [total, setTotal] = useState(0);
  const entities = useSelector(({ entities }) => entities || {}, shallowEqual);
  const envContext = useContext(EnvironmentContext);


  const addNotification = (data) => dispatch(notification(data));
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [curPageIds, setCurPageIds] = useState([]);
  const [pathwayRulesList, setPathwayRulesList] = useState([]);
  const [pathwayReportList, setPathwayReportList] = useState({});
  const [isLoading, setIsLoading] = useState();

  const [hasPathwayDetails, setHasPathwayDetails] = useState(false);
  const [isRemediationButtonDisabled, setIsRemediationButtonDisabled] =
    useState(true);
  //This value comes in from the backend as 0, or 1. To be consistent it is set to -1
  const [rulesPlaybookCount, setRulesPlaybookCount] = useState(-1);

  const handleRefresh = (options) => {
    /* Rec table doesn't use the same sorting params as sys table, switching between the two results in the rec table blowing up cuz its trying to
    read the endpoint with incorrect sorting params, if we hold of on updating the sysable url params when using the this component in pathways, it
    solves this issue for the time being*/
    const { name, display_name } = options;
    const refreshedFilters = {
      ...options,
      ...(name && {
        name,
      }),
      ...(display_name && {
        display_name,
      }),
    };
    !pathway && urlBuilder(refreshedFilters, selectedTags);
  };
  const grabPageIds = () => {
    return curPageIds || [];
  };
  const {
    tableProps: bulkSelectTableProps,
    toolbarProps,
    selectedIds,
    selectNone,
  } = useBulkSelect({
    total,
    onSelect: () => {},
    itemIdsInTable: allCurrentSystemIds(fullFilters, total, rule, setIsLoading),
    itemIdsOnPage: grabPageIds,
    identitfier: 'system_uuid',
    isLoading,
  });
  const safeSelectedIds = useMemo(() => selectedIds || [], [selectedIds]);
  const selectedIdsRef = useRef(safeSelectedIds);
  selectedIdsRef.current = safeSelectedIds;


  const fetchSystems = useMemo(() => getEntities(
    handleRefresh,
    pathway,
    setCurPageIds,
    setTotal,
    selectedIdsRef,
    setFullFilters,
    fullFilters,
    rule,
    envContext.RULES_FETCH_URL,
    envContext.SYSTEMS_FETCH_URL,
    axios,
  ), [pathway, rule, envContext.RULES_FETCH_URL, envContext.SYSTEMS_FETCH_URL, axios]);

  // Ensures rows are marked as selected, runs the check on remediation Status
  useEffect(() => {

    dispatch({
      type: 'SELECT_ENTITIES',
      payload: {
        selected: safeSelectedIds,
      },
    });
    checkRemediationButtonStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSelectedIds]);

  useEffect(() => {
    if (pathway) {
      pathwayCheck();
    } else {
      rulesCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rulesCheck = async () => {
    if (rulesPlaybookCount < 0) {
      try {
        const associatedRuleDetails = (
          await Get(
            `${envContext.RULES_FETCH_URL}${encodeURI(rule.rule_id)}/`,
            {},
            { name: filters.name },
          )
        )?.data.playbook_count;
        setRulesPlaybookCount(associatedRuleDetails);
      } catch (error) {
        console.error('Failed to fetch rule details:', error);
      }
    }
  };

  const pathwayCheck = async () => {
    if (!hasPathwayDetails) {
      if (pathway) {
        try {
          let pathwayRules = (
            await Get(
              `${envContext.BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
              {},
              {},
            )
          )?.data.data;

          let pathwayReport = (
            await Get(
              `${envContext.BASE_URL}/pathway/${encodeURI(pathway.slug)}/reports/`,
              {},
              {},
            )
          )?.data.rules;
          setHasPathwayDetails(true);
          setPathwayReportList(pathwayReport || {});
          setPathwayRulesList(pathwayRules || []);
        } catch (error) {
          console.error('Failed to fetch pathway details:', error);
        }
      }
    }
  };

  const checkRemediationButtonStatus = () => {
    let playbookFound = false;
    if (safeSelectedIds.length === 0) {
      setIsRemediationButtonDisabled(true);
    } else if (pathway && Array.isArray(pathwayRulesList)) {
      for (const rule of pathwayRulesList) {
        if (playbookFound) break;
        const affectedSystems = pathwayReportList[rule.rule_id];
        if (
          affectedSystems?.some((s) => safeSelectedIds.includes(s)) &&
          rule.resolution_set?.some((r) => r.has_playbook)
        ) {
          playbookFound = true;
        }
      }
      setIsRemediationButtonDisabled(!playbookFound);
    } else {
      if (rulesPlaybookCount > 0 && safeSelectedIds.length > 0) {
        setIsRemediationButtonDisabled(false);
      }
    }
  };

  const remediationDataProvider = async () => {
    if (pathway) {
      const pathways = (
        await Get(
          `${envContext.BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
          {},
          {},
        )
      )?.data.data;

      const systems = (
        await Get(
          `${envContext.BASE_URL}/pathway/${encodeURI(pathway.slug)}/reports/`,
          {},
          {},
        )
      )?.data.rules;

      let issues = [];
      pathways.forEach((rec) => {
        let filteredSystems = [];

        systems[rec.rule_id].forEach((system) => {
          if (safeSelectedIds.includes(system)) {
            filteredSystems.push(system);
          }
        });

        if (filteredSystems.length) {
          issues.push({
            id: `advisor:${rec.rule_id}`,
            description: rec.description,
            systems: filteredSystems,
          });
        }
      });

      return { issues };
    } else {
      return {
        issues: [
          {
            id: `advisor:${rule.rule_id}`,
            description: rule.description,
          },
        ],
        systems: safeSelectedIds,
      };
    }
  };

  const onRemediationCreated = (result) => {
    selectNone();
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
  };

  const handleModalToggle = (disableRuleModalOpen) => {
    setDisableRuleModalOpen(disableRuleModalOpen);
  };

  const createColumns = useCallback(
    (defaultColumns) => {
      if (!defaultColumns) {
        return [lastSeenColumn];
      }

      let displayName = defaultColumns.filter(
        ({ key }) => key === 'display_name',
      );
      //Link to the Systems in the Recommendation details table and Pathway details table
      displayName = {
        ...displayName[0],
        transforms: [sortable, wrappable],
        props: { isStatic: true },
        ...(rule
          ? {
              renderFunc: (name, id) => {
                return envContext.loadChromeless ? (
                  <Link to={`/new/hosts/${name}/#Overview`}>{name}</Link>
                ) : (
                  <InsightsLink
                    to={`/recommendations/${rule.rule_id}/${id}?activeRule=true`}
                  >
                    {name}
                  </InsightsLink>
                );
              },
            }
          : {}),
      };
      let systemProfile = defaultColumns.filter(
        ({ key }) => key === 'system_profile',
      );
      systemProfile = {
        ...systemProfile[0],
        transforms: [wrappable],
      };
      let columnList = [displayName, systemProfile, lastSeenColumn];

      if (envContext.displayGroupsTagsColumns) {
        let tags = defaultColumns.filter(({ key }) => key === 'tags');
        let groups = defaultColumns.filter(({ key }) => key === 'groups');
        tags = { ...tags[0] };
        groups = { ...groups[0], transforms: [wrappable] };
        columnList.splice(1, 0, groups, tags);
      }

      // Add column for impacted_date which is relevant for the rec system details table, but not pathways system table
      if (!pathway) {
        columnList.push(impactedDateColumn);
        lastSeenColumn.props.width = 15;
      }

      return columnList;
    },
    [envContext.displayGroupsTagsColumns, pathway, rule],
  );

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    setFilters(filter);
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, SFC);
  };

  const activeFiltersConfig = useMemo(() => ({
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (_e, itemsToRemove, isAll) => {
      if (isAll) {
        setFilters({
          sort: filters.sort,
          limit: filters.limit,
          offset: filters.offset,
        });
      } else {
        itemsToRemove.map((item) => {
          const newFilter = {
            [item.urlParam]: Array.isArray(filters[item.urlParam])
              ? filters[item.urlParam].filter(
                  (value) => String(value) !== String(item.chips[0].value),
                )
              : '',
          };
          newFilter[item.urlParam].length > 0
            ? setFilters({ ...filters, ...newFilter })
            : removeFilterParam(item.urlParam);
        });
      }
    },
  }), [filters]);
  const [resolutions, setResolutions] = useState([]);

  useEffect(() => {

    if (safeSelectedIds.length > 0) {
      if (rule) {
        const fetchAndSetData = async () => {
          const resolutionsData = await iopResolutionsMapper(
            entities,
            rule,
            safeSelectedIds,
          );
          setResolutions(resolutionsData);
        };
        fetchAndSetData();
      } else if (pathway && Array.isArray(pathwayRulesList)) {
        const buildAndSetData = async () => {
          const data = [];
          for (const r of pathwayRulesList) {
            const affected = pathwayReportList[r.rule_id];
            if (!affected) continue;
            for (const id of safeSelectedIds) {
              if (!affected.includes(id)) continue;
              const row = entities?.rows?.find((e) => e.id === id);
              data.push({
                hostid: id,
                host_name: row ? row.display_name : id,
                resolutions: (r.resolution_set || []).map((res) => ({
                  description: res.resolution,
                  id: res.system_type?.toString() || 'fix',
                  needs_reboot: !!r.reboot_required,
                  resolution_risk: res.resolution_risk?.risk || 1,
                })),
                rulename: r.rule_id,
                description: r.description,
                rebootable: !!r.reboot_required,
              });
            }
          }
          setResolutions(data);
        };
        buildAndSetData();
      }
    } else {
      setResolutions([]);
    }
  }, [safeSelectedIds]);

  const actionsConfig = useMemo(() => {
    const noPlaybookTooltip =
      safeSelectedIds.length > 0 &&
      isRemediationButtonDisabled &&
      (pathway ? hasPathwayDetails : rulesPlaybookCount >= 0);
    const actions = [
      <Flex key="inventory-actions">
        {IopRemediationModal ? (
          <FlexItem>
            <Tooltip
              content="Remediation is not available for the selected systems."
              trigger={noPlaybookTooltip ? 'mouseenter focus' : 'manual'}
            >
              <div>
                <IopRemediationModal.WrappedComponent
                  selectedIds={safeSelectedIds}
                  iopData={resolutions}
                  isDisabled={isRemediationButtonDisabled}
                />
              </div>
            </Tooltip>
          </FlexItem>
        ) : !envContext.loadChromeless ? (
          <FlexItem>
            <Tooltip
              content="Remediation is not available for the selected systems."
              trigger={noPlaybookTooltip ? 'mouseenter focus' : 'manual'}
            >
              <div>
                <RemediationButton
                  key="remediation-button"
                  fallback={<Spinner size="md" />}
                  isDisabled={isRemediationButtonDisabled}
                  dataProvider={remediationDataProvider}
                  onRemediationCreated={(result) => onRemediationCreated(result)}
                  hasSelected={safeSelectedIds.length > 0}
                >
                  Plan remediation
                </RemediationButton>
              </div>
            </Tooltip>
          </FlexItem>
        ) : null}
        {envContext.displayDownloadPlaybookButton && (
          <FlexItem>
            <Tooltip
              content="No playbook available for the selected systems."
              trigger={noPlaybookTooltip ? 'mouseenter focus' : 'manual'}
            >
              <div>
                <DownloadPlaybookButton
                  isDisabled={isRemediationButtonDisabled}
                  rules={pathway ? pathwayRulesList : [rule]}
                  systems={safeSelectedIds}
                  ruleSystemsMap={pathway ? pathwayReportList : null}
                />
              </div>
            </Tooltip>
          </FlexItem>
        )}
      </Flex>,
    ];
    if (envContext.isDisableRecEnabled && !pathway) {
      actions.push({
        label: intl.formatMessage(messages.disableRuleForSystems),
        props: {
          isDisabled: safeSelectedIds.length === 0,
        },
        onClick: () => handleModalToggle(true),
      });
    }
    return { actions };
  }, [safeSelectedIds, isRemediationButtonDisabled, resolutions, pathway, pathwayRulesList, pathwayReportList, rule, hasPathwayDetails, rulesPlaybookCount]);

  const onLoadHandler = useCallback(({
    mergeWithEntities,
    INVENTORY_ACTION_TYPES,
    mergeWithDetail,
  }) => {
    store.replaceReducer(
      updateReducers({
        ...mergeWithEntities(
          systemReducer([], INVENTORY_ACTION_TYPES),
          {
            page: Number(filters.offset / filters.limit + 1 || 1),
            perPage: Number(filters.limit || 20),
          },
        ),
        ...mergeWithDetail(),
      }),
    );
  }, [filters.offset, filters.limit]);

  const chromelessTableProps = useMemo(() => ({
    variant: TableVariant.compact,
    ...tableProps,
    ...bulkSelectTableProps,
    envContext: envContext,
  }), [tableProps, bulkSelectTableProps, envContext]);

  const standardTableProps = useMemo(() => ({
    variant: TableVariant.compact,
    ...tableProps,
    ...bulkSelectTableProps,
  }), [tableProps, bulkSelectTableProps]);

  const chromelessCustomFilters = useMemo(() => ({
    advisorFilters: filters,
  }), [filters]);

  const standardCustomFilters = useMemo(() => ({
    advisorFilters: filters,
    selectedTags,
    workloads,
  }), [filters, selectedTags, workloads]);

  const chromelessExportConfig = useMemo(() => permsExport && {
    label: intl.formatMessage(messages.exportJson),
    onSelect: (_e, fileType) =>
      downloadReport(
        exportTable,
        fileType,
        { rule_id: rule.rule_id, ...filters },
        selectedTags,
        workloads,
        dispatch,
        envContext.BASE_URL,
      ),
    isDisabled: !permsExport || entities?.rows?.length === 0,
    tooltipText: permsExport
      ? intl.formatMessage(messages.exportData)
      : intl.formatMessage(messages.permsAction),
  }, [permsExport, filters, rule, selectedTags, workloads, entities?.rows?.length, envContext.BASE_URL]);

  const standardExportConfig = useMemo(() => permsExport && {
    label: intl.formatMessage(messages.exportJson),
    onSelect: (_e, fileType) =>
      downloadReport(
        exportTable,
        fileType,
        { rule_id: rule.rule_id, ...filters },
        selectedTags,
        workloads,
        dispatch,
        envContext.BASE_URL,
      ),
    isDisabled: !permsExport || entities?.rows?.length === 0,
    tooltipText: permsExport
      ? intl.formatMessage(messages.exportData)
      : intl.formatMessage(messages.permsAction),
  }, [permsExport, filters, rule, selectedTags, workloads, entities?.rows?.length, envContext.BASE_URL]);


  return (
    <React.Fragment>
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={rule}
          afterFn={afterDisableFn}
          hosts={safeSelectedIds}
        />
      )}
      {envContext.loadChromeless ? (
        <AsyncComponent
          fallback={ASYNC_COMPONENT_FALLBACK}
          scope="inventory"
          module="./IOPInventoryTable"
          store={store}
          id="tablesContainer"
          ouiaId="iop-inventory-table"
          hasCheckbox
          initialLoading
          autoRefresh
          hideFilters={CHROMELESS_HIDE_FILTERS}
          activeFiltersConfig={activeFiltersConfig}
          columns={createColumns}
          tableProps={chromelessTableProps}
          customFilters={chromelessCustomFilters}
          showTags={false}
          getEntities={fetchSystems}
          actionsConfig={actionsConfig}
          {...toolbarProps}
          onLoad={onLoadHandler}
          exportConfig={chromelessExportConfig}
          axios={axios}
        />
      ) : (
        <InventoryTable
          id={'tablesContainer'}
          ouiaId={'inventory-table'}
          hasCheckbox
          initialLoading
          autoRefresh
          hideFilters={STANDARD_HIDE_FILTERS}
          activeFiltersConfig={activeFiltersConfig}
          columns={createColumns}
          tableProps={standardTableProps}
          customFilters={standardCustomFilters}
          showTags={showTags}
          getEntities={fetchSystems}
          actionsConfig={actionsConfig}
          {...toolbarProps}
          onLoad={onLoadHandler}
          exportConfig={standardExportConfig}
        />
      )}
    </React.Fragment>
  );
};

Inventory.propTypes = {
  tableProps: PropTypes.any,
  rule: PropTypes.object,
  afterDisableFn: PropTypes.func,
  pathway: PropTypes.object,
  selectedTags: PropTypes.any,
  workloads: PropTypes.any,
  permsExport: PropTypes.bool,
  exportTable: PropTypes.string,
  showTags: PropTypes.bool,
  IopRemediationModal: PropTypes.element,
  axios: PropTypes.func,
};

export default Inventory;
