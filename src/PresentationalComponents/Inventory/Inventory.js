import './_Inventory.scss';

import React, { useEffect, useState, useCallback, useContext } from 'react';
import { TableVariant, sortable, wrappable } from '@patternfly/react-table';
import { pruneFilters, urlBuilder } from '../Common/Tables';
import { useDispatch, useSelector, useStore } from 'react-redux';
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
import { Flex, Spinner } from '@patternfly/react-core';
import { EnvironmentContext } from '../../App';
import { AsyncComponent } from '@redhat-cloud-services/frontend-components';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { Link } from 'react-router-dom';

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
  const entities = useSelector(({ entities }) => entities || {});
  const envContext = useContext(EnvironmentContext);

  const addNotification = (data) => dispatch(notification(data));
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [curPageIds, setCurPageIds] = useState([]);
  const [pathwayRulesList, setPathwayRulesList] = useState({});
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

  const fetchSystems = getEntities(
    handleRefresh,
    pathway,
    setCurPageIds,
    setTotal,
    selectedIds,
    setFullFilters,
    fullFilters,
    rule,
    envContext.RULES_FETCH_URL,
    envContext.SYSTEMS_FETCH_URL,
    axios,
  );

  // Ensures rows are marked as selected, runs the check on remediation Status
  useEffect(() => {
    dispatch({
      type: 'SELECT_ENTITIES',
      payload: {
        selected: selectedIds,
      },
    });
    checkRemediationButtonStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

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
      const associatedRuleDetails = (
        await Get(
          `${envContext.RULES_FETCH_URL}${encodeURI(rule.rule_id)}/`,
          {},
          { name: filters.name },
        )
      )?.data.playbook_count;
      setRulesPlaybookCount(associatedRuleDetails);
    }
  };

  const pathwayCheck = async () => {
    if (!hasPathwayDetails) {
      if (pathway) {
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
        setPathwayReportList(pathwayReport);
        setPathwayRulesList(pathwayRules);
      }
    }
  };

  const checkRemediationButtonStatus = () => {
    let playbookFound = false;
    let ruleKeys = Object.keys(pathwayReportList);
    if (selectedIds?.length <= 0 || selectedIds === undefined) {
      setIsRemediationButtonDisabled(true);
    } else if (pathway) {
      for (let i = 0; i < selectedIds?.length; i++) {
        let system = selectedIds[i];
        if (playbookFound) {
          break;
        }
        ruleKeys.forEach((rule) => {
          //Grab the rule assosciated with that system
          if (pathwayReportList[rule].includes(system)) {
            let assosciatedRule = pathwayReportList[rule];
            //find that associated rule in the pathwayRules endpoint, check for playbook
            let item = pathwayRulesList.find(
              (report) => (report.rule_id = assosciatedRule),
            );
            if (item.resolution_set[0].has_playbook) {
              playbookFound = true;
              return setIsRemediationButtonDisabled(false);
            }
          }
        });
      }
    } else {
      if (rulesPlaybookCount > 0 && selectedIds?.length > 0) {
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
          if (selectedIds.includes(system)) {
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
        systems: selectedIds,
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

  const activeFiltersConfig = {
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
  };
  const [resolutions, setResolutions] = useState([]);

  useEffect(() => {
    if (selectedIds?.length > 0) {
      const fetchAndSetData = async () => {
        const resolutionsData = await iopResolutionsMapper(
          entities,
          rule,
          selectedIds,
        );
        setResolutions(resolutionsData);
      };
      fetchAndSetData();
    }
  }, [selectedIds]);

  const getActionsConfig = () => {
    const actions = [
      <Flex key="inventory-actions">
        {IopRemediationModal ? (
          <IopRemediationModal.WrappedComponent
            selectedIds={selectedIds}
            iopData={resolutions}
            isDisabled={isRemediationButtonDisabled}
          />
        ) : (
          <RemediationButton
            key="remediation-button"
            fallback={<Spinner size="md" />}
            isDisabled={isRemediationButtonDisabled}
            dataProvider={remediationDataProvider}
            onRemediationCreated={(result) => onRemediationCreated(result)}
            hasSelected={selectedIds?.length > 0}
          >
            Plan remediation
          </RemediationButton>
        )}
        {envContext.displayDownloadPlaybookButton && (
          <DownloadPlaybookButton
            isDisabled={isRemediationButtonDisabled}
            rules={[rule]}
            systems={selectedIds}
          />
        )}
      </Flex>,
    ];
    envContext.isDisableRecEnabled &&
      !pathway &&
      actions.push({
        label: intl.formatMessage(messages.disableRuleForSystems),
        props: {
          isDisabled: (selectedIds || []).length === 0,
        },
        onClick: () => handleModalToggle(true),
      });
    return { actions };
  };

  return (
    <React.Fragment>
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={rule}
          afterFn={afterDisableFn}
          hosts={selectedIds}
        />
      )}
      {envContext.loadChromeless ? (
        <AsyncComponent
          scope="inventory"
          module="./IOPInventoryTable"
          store={store}
          id="tablesContainer"
          ouiaId="iop-inventory-table"
          hasCheckbox
          initialLoading
          autoRefresh
          hideFilters={{
            all: true,
            name: false,
            tags: true,
            operatingSystem: false,
            hostGroupFilter: true,
          }}
          activeFiltersConfig={activeFiltersConfig}
          columns={(defaultColumns) => createColumns(defaultColumns)}
          tableProps={{
            variant: TableVariant.compact,
            ...tableProps,
            ...bulkSelectTableProps,
            envContext: envContext,
          }}
          customFilters={{
            advisorFilters: filters,
          }}
          showTags={envContext.loadChromeless ? false : showTags}
          getEntities={fetchSystems}
          actionsConfig={getActionsConfig()}
          {...toolbarProps}
          onLoad={({
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
          }}
          exportConfig={
            permsExport && {
              label: intl.formatMessage(messages.exportCsv),
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
            }
          }
          axios={axios}
        />
      ) : (
        <InventoryTable
          id={'tablesContainer'}
          ouiaId={'inventory-table'}
          hasCheckbox
          initialLoading
          autoRefresh
          hideFilters={{
            all: true,
            name: false,
            tags: false,
            operatingSystem: false,
            hostGroupFilter: false,
          }}
          activeFiltersConfig={activeFiltersConfig}
          columns={(defaultColumns) => createColumns(defaultColumns)}
          tableProps={{
            variant: TableVariant.compact,
            ...tableProps,
            ...bulkSelectTableProps,
          }}
          customFilters={{
            advisorFilters: filters,
            selectedTags,
            workloads,
          }}
          showTags={envContext.loadChromeless ? false : showTags}
          getEntities={fetchSystems}
          actionsConfig={getActionsConfig()}
          {...toolbarProps}
          onLoad={({
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
          }}
          exportConfig={
            permsExport && {
              label: intl.formatMessage(messages.exportCsv),
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
            }
          }
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
