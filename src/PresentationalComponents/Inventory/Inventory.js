import './_Inventory.scss';

import { BASE_URL, RULES_FETCH_URL } from '../../AppConstants';
import React, { useEffect, useState, useCallback } from 'react';
import { TableVariant, sortable, wrappable } from '@patternfly/react-table';
import { pruneFilters, urlBuilder } from '../Common/Tables';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getEntities, allCurrentSystemIds } from './helpers';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import { Get } from '../../Utilities/Api';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { SYSTEM_FILTER_CATEGORIES as SFC } from '../../AppConstants';
import messages from '../../Messages';
import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';
import { systemReducer } from '../../Store/AppReducer';
import { updateReducers } from '../../Store';
import { useIntl } from 'react-intl';
import downloadReport from '../Common/DownloadHelper';
import useBulkSelect from './Hooks/useBulkSelect';

const Inventory = ({
  tableProps,
  rule,
  afterDisableFn,
  pathway,
  selectedTags,
  workloads,
  SID,
  permsExport,
  exportTable,
  showTags,
}) => {
  const store = useStore();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
    sort: '-last_seen',
    name: '',
    'filter[system_profile][host_type][nil]': true,
  });
  const [fullFilters, setFullFilters] = useState();
  const [total, setTotal] = useState(0);
  const entities = useSelector(({ entities }) => entities || {});

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

  const fetchSystems = getEntities(
    handleRefresh,
    pathway,
    setCurPageIds,
    setTotal,
    selectedIds,
    setFullFilters,
    fullFilters,
    rule
  );

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
          `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/`,
          {},
          { name: filters.name }
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
            `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
            {},
            {}
          )
        )?.data.data;

        let pathwayReport = (
          await Get(
            `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/reports/`,
            {},
            {}
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
              (report) => (report.rule_id = assosciatedRule)
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
          `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
          {},
          {}
        )
      )?.data.data;

      const systems = (
        await Get(
          `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/reports/`,
          {},
          {}
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
      let lastSeenColumn = defaultColumns.filter(
        ({ key }) => key === 'updated'
      );
      let displayName = defaultColumns.filter(
        ({ key }) => key === 'display_name'
      );
      let systemProfile = defaultColumns.filter(
        ({ key }) => key === 'system_profile'
      );
      let tags = defaultColumns.filter(({ key }) => key === 'tags');
      let groups = defaultColumns.filter(({ key }) => key === 'groups');

      //Link to the Systems in the Recommendation details table and Pathway details table
      displayName = {
        ...displayName[0],
        transforms: [sortable, wrappable],
        props: { isStatic: true },
        ...(rule
          ? {
              renderFunc: (name, id) => {
                return (
                  <Link
                    className="pf-u-font-size-lg"
                    to={`/recommendations/${rule.rule_id}/${id}?activeRule=true`}
                  >
                    {name}
                  </Link>
                );
              },
            }
          : {}),
      };

      lastSeenColumn = {
        ...lastSeenColumn[0],
        transforms: [sortable, wrappable],
      };

      systemProfile = {
        ...systemProfile[0],
        transforms: [sortable, wrappable],
      };

      tags = {
        ...tags[0],
      };

      groups = {
        ...groups[0],
        transforms: [wrappable],
        props: { ...groups[0].props, isStatic: true }, // remove this line after group sorting is enabled in the API
      };

      let columnList = [
        displayName,
        groups,
        tags,
        systemProfile,
        lastSeenColumn,
      ];

      // Add column for impacted_date which is relevant for the rec system details table, but not pathways system table
      if (!pathway) {
        const impacted_date = {
          key: 'impacted_date',
          title: 'First Impacted',
          sortKey: 'impacted_date',
          transforms: [sortable, wrappable],
          props: { width: 15 },
          renderFunc: lastSeenColumn.renderFunc,
        };
        columnList.push(impacted_date);
        lastSeenColumn.props.width = 15;
      }

      return columnList;
    },
    [pathway, rule]
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
                  (value) => String(value) !== String(item.chips[0].value)
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
      <InventoryTable
        id="tablesContainer"
        hasCheckbox
        initialLoading
        autoRefresh
        hideFilters={{
          all: true,
          name: false,
          tags: !showTags,
          operatingSystem: false,
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
          SID,
        }}
        showTags={showTags}
        getEntities={fetchSystems}
        dedicatedAction={
          <RemediationButton
            key="remediation-button"
            isDisabled={isRemediationButtonDisabled}
            dataProvider={remediationDataProvider}
            onRemediationCreated={(result) => onRemediationCreated(result)}
          >
            {intl.formatMessage(messages.remediate)}
          </RemediationButton>
        }
        actionsConfig={{
          actions: [
            '',
            {
              label: intl.formatMessage(messages.disableRuleForSystems),
              props: { isDisabled: (selectedIds || []).length === 0 },
              onClick: () => handleModalToggle(true),
            },
          ],
        }}
        {...toolbarProps}
        onLoad={({
          mergeWithEntities,
          INVENTORY_ACTION_TYPES,
          mergeWithDetail,
        }) => {
          store.replaceReducer(
            updateReducers({
              ...mergeWithEntities(systemReducer([], INVENTORY_ACTION_TYPES), {
                page: Number(filters.offset / filters.limit + 1 || 1),
                perPage: Number(filters.limit || 20),
              }),
              ...mergeWithDetail(),
            })
          );
        }}
        exportConfig={
          permsExport && {
            label: intl.formatMessage(messages.exportCsv),
            // eslint-disable-next-line no-dupe-keys
            label: intl.formatMessage(messages.exportJson),
            onSelect: (_e, fileType) =>
              downloadReport(
                exportTable,
                fileType,
                { rule_id: rule.rule_id, ...filters },
                selectedTags,
                workloads,
                SID,
                dispatch
              ),
            isDisabled: !permsExport || entities?.rows?.length === 0,
            tooltipText: permsExport
              ? intl.formatMessage(messages.exportData)
              : intl.formatMessage(messages.permsAction),
          }
        }
      />
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
  SID: PropTypes.any,
  permsExport: PropTypes.bool,
  exportTable: PropTypes.string,
  showTags: PropTypes.bool,
};

export default Inventory;
