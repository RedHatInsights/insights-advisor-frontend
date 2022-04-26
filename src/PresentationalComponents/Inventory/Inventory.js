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
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
    sort: '-last_seen',
    name: '',
  });
  const entities = useSelector(({ entities }) => entities || {});
  const onSelectRows = (id, selected) =>
    dispatch({ type: 'SELECT_ENTITY', payload: { id, selected } });
  const addNotification = (data) => dispatch(notification(data));
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [bulkSelect, setBulkSelect] = useState();

  const remediationDataProvider = async () => {
    if (pathway) {
      const pathways = (
        await Get(
          `${BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
          {},
          {}
        )
      )?.data.data;
      const issues = pathways.map((rec) => ({
        id: `advisor:${rec.rule_id}`,
        description: rec.description,
      }));
      return { issues, systems: selected };
    } else {
      return {
        issues: [
          {
            id: `advisor:${rule.rule_id}`,
            description: rule.description,
          },
        ],
        systems: selected,
      };
    }
  };

  const onRemediationCreated = (result) => {
    onSelectRows(-1, false);
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

  const bulkSelectfn = () => {
    setBulkSelect(true);
    onSelectRows(0, true);
  };

  const calculateSelectedItems = () =>
    bulkSelect
      ? setBulkSelect(false)
      : setSelected(
          entities?.rows
            ?.filter((entity) => entity.selected === true)
            .map((entity) => entity.id)
        );

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

  useEffect(() => {
    entities?.rows?.length && calculateSelectedItems(entities.rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities?.rows]);

  return (
    <React.Fragment>
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={rule}
          afterFn={afterDisableFn}
          hosts={selected}
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

          return Promise.resolve({
            results: mergeArraysByDiffKeys(
              fetchedSystems.data,
              results.results
            ),
            total: fetchedSystems.meta.count,
          });
        }}
        dedicatedAction={
          <RemediationButton
            key="remediation-button"
            isDisabled={
              selected.length === 0 || (!pathway && rule?.playbook_count === 0)
            }
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
              props: { isDisabled: selected.length === 0 },
              onClick: () => handleModalToggle(true),
            },
          ],
        }}
        bulkSelect={{
          count: selected.length,
          items: [
            {
              title: intl.formatMessage(messages.selectNone),
              onClick: () => {
                onSelectRows(-1, false);
              },
            },
            {
              ...(entities?.rows?.length > filters.limit
                ? {
                    title: intl.formatMessage(messages.selectPage, {
                      items: filters.limit,
                    }),
                    onClick: () => {
                      onSelectRows(0, true);
                    },
                  }
                : {}),
            },
            {
              ...(entities?.rows?.length > 0
                ? {
                    title: intl.formatMessage(messages.selectAll, {
                      items: entities?.total || 0,
                    }),
                    onClick: async () => {
                      console.error(pathway);
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
                              `${RULES_FETCH_URL}${encodeURI(
                                rule.rule_id
                              )}/systems/`,
                              {},
                              { name: filters.name }
                            )
                          )?.data?.host_ids;

                      console.error(allSystems);
                      setSelected(allSystems);
                      bulkSelectfn();
                    },
                  }
                : {}),
            },
          ],
          checked:
            (selected.length === entities?.rows?.length ||
              selected.length === entities?.total) &&
            entities?.total > 0
              ? 1
              : selected.length === filters.limit
              ? null
              : 0,
          onSelect: () => {
            selected.length > 0 ? onSelectRows(-1, false) : bulkSelectfn();
            calculateSelectedItems();
          },
        }}
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
