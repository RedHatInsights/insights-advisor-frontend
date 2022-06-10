import './_Inventory.scss';

import {
  BASE_URL,
  RULES_FETCH_URL,
  SYSTEMS_FETCH_URL,
} from '../../AppConstants';
import React, { useEffect, useState } from 'react';
import { TableVariant, sortable, wrappable } from '@patternfly/react-table';
import {
  pruneFilters,
  urlBuilder,
  workloadQueryBuilder,
  buildTagFilter,
} from '../Common/Tables';
import { useDispatch, useSelector, useStore } from 'react-redux';

import DisableRule from '../../PresentationalComponents/Modals/DisableRule';
import { Get } from '../../Utilities/Api';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import Loading from '../Loading/Loading';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { SYSTEM_FILTER_CATEGORIES as SFC } from '../../AppConstants';
import { mergeArraysByDiffKeys } from '../Common/Tables';
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
  });
  const [total, setTotal] = useState(0);
  const entities = useSelector(({ entities }) => entities || {});
  const addNotification = (data) => dispatch(notification(data));
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [curPageIds, setCurPageIds] = useState([]);
  const [pathwayRulesList, setPathwayRulesList] = useState();
  const [pathwayReportList, setPathwayReportList] = useState();

  const [hasPathwayDetails, setHasPathwayDetails] = useState(false);
  const [isRemediationButtonDisabled, setIsRemediationButtonDisabled] =
    useState(true);

  const fetchAllSystems = async () => {
    const allSystems = pathway
      ? (
          await Get(
            `${SYSTEMS_FETCH_URL}`,
            {},
            {
              pathway: pathway.slug,
              limit: pathway.impacted_systems_count,
            }
          )
        )?.data?.data?.map((system) => system.system_uuid)
      : (
          await Get(
            `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/systems/`,
            {},
            { name: filters.name }
          )
        )?.data?.host_ids;
    return allSystems;
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
    itemIdsInTable: fetchAllSystems,
    itemIdsOnPage: grabPageIds,
    identitfier: 'system_uuid',
  });

  // Ensures rows are marked as selected
  useEffect(() => {
    dispatch({
      type: 'SELECT_ENTITIES',
      payload: {
        selected: selectedIds,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  useEffect(() => {
    pathwayCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds?.length]);

  const pathwayCheck = async () => {
    if (!hasPathwayDetails) {
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
    if (selectedIds?.length > 0) {
      checkRemediationButtonStatus();
    } else {
      setIsRemediationButtonDisabled(true);
    }
  };

  const checkRemediationButtonStatus = () => {
    let playbookFound = false;
    let ruleKeys = Object.keys(pathwayReportList);

    for (let i = 0; i < selectedIds.length; i++) {
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

  const createColumns = (defaultColumns) => {
    let lastSeenColumn = defaultColumns.filter(({ key }) => key === 'updated');
    let displayName = defaultColumns.filter(
      ({ key }) => key === 'display_name'
    );
    let systemProfile = defaultColumns.filter(
      ({ key }) => key === 'system_profile'
    );
    let tags = defaultColumns.filter(({ key }) => key === 'tags');

    displayName = {
      ...displayName[0],
      transforms: [sortable, wrappable],
      props: { isStatic: true },
    };

    lastSeenColumn = {
      ...lastSeenColumn[0],
      transforms: [sortable, wrappable],
      props: { width: 20 },
    };

    systemProfile = {
      ...systemProfile[0],
      transforms: [wrappable],
    };

    tags = {
      ...tags[0],
    };

    return [displayName, tags, systemProfile, lastSeenColumn];
  };

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
  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    setFilters(filter);
  };
  const addFilterParam = (param, values) => {
    values.length > 0
      ? setFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };
  const filterConfigItems = [
    {
      label: SFC.rhel_version.title.toLowerCase(),
      type: SFC.rhel_version.type,
      id: SFC.rhel_version.urlParam,
      value: `checkbox-${SFC.rhel_version.urlParam}`,
      filterValues: {
        key: `${SFC.rhel_version.urlParam}-filter`,
        onChange: (_e, values) => {
          addFilterParam(SFC.rhel_version.urlParam, values);
        },
        value: filters.rhel_version,
        items: SFC.rhel_version.values,
      },
    },
  ];

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
        hideFilters={{ all: true, name: false, tags: !showTags }}
        filterConfig={{ items: filterConfigItems }}
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
        getEntities={async (_items, config, showTags, defaultGetEntities) => {
          const {
            per_page,
            page,
            orderBy,
            orderDirection,
            advisorFilters,
            filters,
            workloads,
            SID,
          } = config;
          const sort = `${orderDirection === 'ASC' ? '' : '-'}${
            orderBy === 'updated' ? 'last_seen' : orderBy
          }`;
          let options = {
            ...advisorFilters,
            limit: per_page,
            offset: page * per_page - per_page,
            sort,
            ...(config.filters.hostnameOrId &&
              !pathway && {
                name: config?.filters?.hostnameOrId,
              }),
            ...(config.filters.hostnameOrId &&
              pathway && {
                display_name: config?.filters?.hostnameOrId,
              }),
            ...(Array.isArray(advisorFilters.rhel_version) && {
              rhel_version: advisorFilters.rhel_version?.join(','),
            }),
            ...(filters.tagFilters?.length &&
              buildTagFilter(filters.tagFilters)),
          };

          workloads &&
            (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

          handleRefresh(options);

          const fetchedSystems = pathway
            ? (
                await Get(
                  `${SYSTEMS_FETCH_URL}`,
                  {},
                  { ...options, pathway: pathway.slug }
                )
              )?.data
            : (
                await Get(
                  `${RULES_FETCH_URL}${encodeURI(
                    rule.rule_id
                  )}/systems_detail/`,
                  {},
                  options
                )
              )?.data;

          const results = await defaultGetEntities(
            fetchedSystems.data.map((system) => system.system_uuid),
            {
              page,
              per_page,
              hasItems: true,
              fields: { system_profile: ['operating_system'] },
            },
            showTags
          );
          setCurPageIds(
            fetchedSystems.data.map((system) => system.system_uuid)
          );
          setTotal(fetchedSystems.meta.count);
          return Promise.resolve({
            results: mergeArraysByDiffKeys(
              fetchedSystems.data,
              results.results
            ).map((item) => {
              return {
                ...item,
                selected: selectedIds?.includes(item.id),
              };
            }),
            total: fetchedSystems.meta.count,
          });
        }}
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
        fallback={Loading}
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
