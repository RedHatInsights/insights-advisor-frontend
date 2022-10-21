import './_RulesTable.scss';

import * as AppConstants from '../../AppConstants';

import { DEBOUNCE_DELAY, FILTER_CATEGORIES as FC } from '../../AppConstants';
import { Link, useLocation } from 'react-router-dom';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import React, { useEffect, useState } from 'react';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/js/layouts/Stack/index';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  cellWidth,
  fitContent,
  sortable,
} from '@patternfly/react-table';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';
import {
  filterFetchBuilder,
  paramParser,
  pruneFilters,
  ruleResolutionRisk,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import AnsibeTowerIcon from '@patternfly/react-icons/dist/js/icons/ansibeTower-icon';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CategoryLabel from '../Labels/CategoryLabel';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { DeleteApi } from '../../Utilities/Api';
import DisableRule from '../Modals/DisableRule';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import {
  RuleDetails,
  RuleDetailsMessagesKeys,
  AdvisorProduct,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import RuleLabels from '../Labels/RuleLabels';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/';
import debounce from '../../Utilities/Debounce';
import downloadReport from '../Common/DownloadHelper';
import messages from '../../Messages';
import {
  formatMessages,
  mapContentToValues,
  strong,
} from '../../Utilities/intlHelper';
import { updateRecFilters } from '../../Services/Filters';
import { useGetRecsQuery } from '../../Services/Recs';
import { useIntl } from 'react-intl';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import PropTypes from 'prop-types';

import { emptyRows } from './helpers';

const RulesTable = ({ isTabActive }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const permsExport = usePermissions(
    'advisor',
    AppConstants.PERMS.export
  ).hasAccess;
  const permsDisableRec = usePermissions(
    'advisor',
    AppConstants.PERMS.disableRec
  ).hasAccess;
  const [cols] = useState([
    {
      title: intl.formatMessage(messages.name),
      transforms: [sortable, cellWidth(40)],
    },
    {
      title: intl.formatMessage(messages.modified),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.category),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.totalRisk),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.systems),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.remediation),
      transforms: [sortable, fitContent],
    },
  ]);

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const filters = useSelector(({ filters }) => filters.recState);

  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filterBuilding, setFilterBuilding] = useState(true);
  const [searchText, setSearchText] = useState(filters?.text || '');
  const [disableRuleOpen, setDisableRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
  const [viewSystemsModalRule, setViewSystemsModalRule] = useState({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const addNotification = (data) => dispatch(addNotificationAction(data));
  const setFilters = (filters) => dispatch(updateRecFilters(filters));

  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

  const {
    data: rules = [],
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useGetRecsQuery({ ...filterFetchBuilder(filters), ...options });

  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
  const results = rules?.meta?.count || 0;
  const sortIndices = {
    1: 'description',
    2: 'publish_date',
    3: 'category',
    4: 'total_risk',
    5: 'impacted_count',
    6: 'playbook_count',
  };

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(filters, selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTags, workloads, SID]);

  const onSort = (_event, index, direction) => {
    const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
    setSortBy({ index, direction });
    setFilters({ ...filters, sort: orderParam, offset: 0 });
  };

  const onSetPage = (pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    setFilters({ ...filters, offset: newOffset });
  };

  const toggleRulesDisabled = (rule_status) => {
    setFilters({
      ...filters,
      rule_status,
      offset: 0,
      ...(rule_status !== 'enabled' && { impacting: ['false'] }),
    });
  };

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...rows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setRows(collapseRows);
  };

  const hideReports = async (rowId) => {
    const rule = rows[rowId].rule;

    try {
      if (rule.rule_status === 'enabled') {
        setSelectedRule(rule);
        setDisableRuleOpen(true);
      } else {
        try {
          await DeleteApi(`${AppConstants.BASE_URL}/ack/${rule.rule_id}/`);
          addNotification({
            variant: 'success',
            timeout: true,
            dismissable: true,
            title: intl.formatMessage(messages.recSuccessfullyEnabled),
          });
          refetch();
        } catch (error) {
          addNotification({
            variant: 'danger',
            dismissable: true,
            title: intl.formatMessage(messages.error),
            description: `${error}`,
          });
        }
      }
    } catch (error) {
      addNotification({
        variant: 'danger',
        dismissable: true,
        title:
          rule.rule_status === 'enabled'
            ? intl.formatMessage(messages.rulesTableHideReportsErrorDisabled)
            : intl.formatMessage(messages.rulesTableHideReportsErrorEnabled),
        description: `${error}`,
      });
    }
  };

  const actionResolver = (rowData, { rowIndex }) => {
    const rule = rows[rowIndex].rule ? rows[rowIndex].rule : null;
    if (rowIndex % 2 !== 0 || !rule) {
      return null;
    }

    return rule && rule.rule_status === 'enabled'
      ? [
          {
            title: intl.formatMessage(messages.disableRule),
            onClick: (_event, rowId) => hideReports(rowId),
          },
        ]
      : [
          {
            title: intl.formatMessage(messages.enableRule),
            onClick: (_event, rowId) => hideReports(rowId),
          },
        ];
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.topic;
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, FC);
  };

  // Builds table filters from url params
  useEffect(() => {
    if (isTabActive && search && filterBuilding) {
      const paramsObject = paramParser();
      delete paramsObject.tags;

      paramsObject.text === undefined
        ? setSearchText('')
        : setSearchText(paramsObject.text);
      paramsObject.sort =
        paramsObject.sort === undefined ? '-total_risk' : paramsObject.sort[0];
      paramsObject.has_playbook !== undefined &&
        !Array.isArray(paramsObject.has_playbook) &&
        (paramsObject.has_playbook = [`${paramsObject.has_playbook}`]);
      paramsObject.incident !== undefined &&
        !Array.isArray(paramsObject.incident) &&
        (paramsObject.incident = [`${paramsObject.incident}`]);
      paramsObject.offset === undefined
        ? (paramsObject.offset = 0)
        : (paramsObject.offset = Number(paramsObject.offset[0]));
      paramsObject.limit === undefined
        ? (paramsObject.limit = 20)
        : (paramsObject.limit = Number(paramsObject.limit[0]));
      paramsObject.reboot !== undefined &&
        !Array.isArray(paramsObject.reboot) &&
        (paramsObject.reboot = [`${paramsObject.reboot}`]);
      paramsObject.impacting !== undefined &&
        !Array.isArray(paramsObject.impacting) &&
        (paramsObject.impacting = [`${paramsObject.impacting}`]);
      setFilters({ ...filters, ...paramsObject });
    }

    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sortIndex = Object.entries(sortIndices)?.find(
      (item) => item[1] === filters.sort || `-${item[1]}` === filters.sort
    );
    if (filters.sort !== undefined && sortIndex) {
      const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
      setSortBy({ index: Number(sortIndex[0]), direction: sortDirection });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort]);

  useEffect(() => {
    if (rules.data) {
      if (rules.data.length === 0) {
        setRows(emptyRows(filters, toggleRulesDisabled));
      } else {
        const rows = rules.data.flatMap((value, key) => [
          {
            isOpen: isAllExpanded,
            rule: value,
            cells: [
              {
                title: (
                  <span key={key}>
                    <Link key={key} to={`/recommendations/${value.rule_id}`}>
                      {' '}
                      {value.description}{' '}
                    </Link>
                    <RuleLabels rule={value} isCompact />
                  </span>
                ),
              },
              {
                title: (
                  <DateFormat
                    key={key}
                    date={value.publish_date}
                    variant="relative"
                  />
                ),
              },
              {
                title: (
                  <CategoryLabel
                    key={key}
                    labelList={[value.category]}
                    isCompact
                  />
                ),
              },
              {
                title: (
                  <div key={key}>
                    <Tooltip
                      key={key}
                      position={TooltipPosition.bottom}
                      content={intl.formatMessage(
                        messages.rulesDetailsTotalRiskBody,
                        {
                          risk:
                            AppConstants.TOTAL_RISK_LABEL_LOWER[
                              value.total_risk
                            ] || intl.formatMessage(messages.undefined),
                          strong: (str) => strong(str),
                        }
                      )}
                    >
                      <InsightsLabel value={value.total_risk} isCompact />
                    </Tooltip>
                  </div>
                ),
              },
              {
                title:
                  value.rule_status === 'rhdisabled' ? (
                    <Tooltip
                      content={intl.formatMessage(messages.byEnabling, {
                        systems: value.impacted_systems_count,
                      })}
                    >
                      <span>{intl.formatMessage(messages.nA)}</span>
                    </Tooltip>
                  ) : (
                    <div
                      key={key}
                    >{`${value.impacted_systems_count.toLocaleString()}`}</div>
                  ),
              },
              {
                title: (
                  <div className="ins-c-center-text " key={key}>
                    {value.playbook_count ? (
                      <span>
                        <AnsibeTowerIcon size="sm" />{' '}
                        {intl.formatMessage(messages.playbook)}
                      </span>
                    ) : (
                      intl.formatMessage(messages.manual)
                    )}
                  </div>
                ),
              },
            ],
          },
          {
            parent: key * 2,
            fullWidth: true,
            cells: [
              {
                title: (
                  <Main className="pf-m-light">
                    <Stack hasGutter>
                      {value.hosts_acked_count ? (
                        <StackItem>
                          <BellSlashIcon size="sm" />
                          &nbsp;
                          {value.hosts_acked_count &&
                          !value.impacted_systems_count
                            ? intl.formatMessage(
                                messages.ruleIsDisabledForAllSystems
                              )
                            : intl.formatMessage(
                                messages.ruleIsDisabledForSystemsBody,
                                { systems: value.hosts_acked_count }
                              )}
                          &nbsp;{' '}
                          <Button
                            isInline
                            variant="link"
                            ouiaId="viewSystem"
                            onClick={() => {
                              setViewSystemsModalRule(value);
                              setViewSystemsModalOpen(true);
                            }}
                          >
                            {intl.formatMessage(messages.viewSystems)}
                          </Button>
                        </StackItem>
                      ) : (
                        <React.Fragment></React.Fragment>
                      )}
                      <RuleDetails
                        messages={formatMessages(
                          intl,
                          RuleDetailsMessagesKeys,
                          mapContentToValues(intl, value)
                        )}
                        product={AdvisorProduct.rhel}
                        rule={value}
                        resolutionRisk={ruleResolutionRisk(value)}
                        resolutionRiskDesc={
                          AppConstants.RISK_OF_CHANGE_DESC[
                            ruleResolutionRisk(value)
                          ]
                        }
                        isDetailsPage={false}
                        showViewAffected
                        linkComponent={Link}
                        knowledgebaseUrl={
                          value.node_id
                            ? `https://access.redhat.com/node/${value.node_id}`
                            : ''
                        }
                      />
                    </Stack>
                  </Main>
                ),
              },
            ],
          },
        ]);
        setRows(rows);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);

  useEffect(() => {
    if (!filterBuilding && !isLoading) {
      const filter = { ...filters };
      const text = searchText.length ? { text: searchText } : {};
      delete filter.text;
      setFilters({ ...filter, ...text, offset: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    param === 'text' && setSearchText('');
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
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) => setSearchText(value),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: FC.total_risk.title,
      type: FC.total_risk.type,
      id: FC.total_risk.urlParam,
      value: `checkbox-${FC.total_risk.urlParam}`,
      filterValues: {
        key: `${FC.total_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FC.total_risk.values,
      },
    },
    {
      label: FC.res_risk.title,
      type: FC.res_risk.type,
      id: FC.res_risk.urlParam,
      value: `checkbox-${FC.res_risk.urlParam}`,
      filterValues: {
        key: `${FC.res_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.res_risk.urlParam, values),
        value: filters.res_risk,
        items: FC.res_risk.values,
      },
    },
    {
      label: FC.impact.title,
      type: FC.impact.type,
      id: FC.impact.urlParam,
      value: `checkbox-${FC.impact.urlParam}`,
      filterValues: {
        key: `${FC.impact.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.impact.urlParam, values),
        value: filters.impact,
        items: FC.impact.values,
      },
    },
    {
      label: FC.likelihood.title,
      type: FC.likelihood.type,
      id: FC.likelihood.urlParam,
      value: `checkbox-${FC.likelihood.urlParam}`,
      filterValues: {
        key: `${FC.likelihood.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.likelihood.urlParam, values),
        value: filters.likelihood,
        items: FC.likelihood.values,
      },
    },
    {
      label: FC.category.title,
      type: FC.category.type,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        key: `${FC.category.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
    {
      label: FC.incident.title,
      type: FC.incident.type,
      id: FC.incident.urlParam,
      value: `checkbox-${FC.incident.urlParam}`,
      filterValues: {
        key: `${FC.incident.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.incident.urlParam, values),
        value: filters.incident,
        items: FC.incident.values,
      },
    },
    {
      label: FC.has_playbook.title,
      type: FC.has_playbook.type,
      id: FC.has_playbook.urlParam,
      value: `checkbox-${FC.has_playbook.urlParam}`,
      filterValues: {
        key: `${FC.has_playbook.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.has_playbook.urlParam, values),
        value: filters.has_playbook,
        items: FC.has_playbook.values,
      },
    },
    {
      label: FC.reboot.title,
      type: FC.reboot.type,
      id: FC.reboot.urlParam,
      value: `checkbox-${FC.reboot.urlParam}`,
      filterValues: {
        key: `${FC.reboot.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.reboot.urlParam, values),
        value: filters.reboot,
        items: FC.reboot.values,
      },
    },
    {
      label: FC.rule_status.title,
      type: FC.rule_status.type,
      id: FC.rule_status.urlParam,
      value: `radio-${FC.rule_status.urlParam}`,
      filterValues: {
        key: `${FC.rule_status.urlParam}-filter`,
        onChange: (_event, value) => toggleRulesDisabled(value),
        value: `${filters.rule_status}`,
        items: FC.rule_status.values,
      },
    },
    {
      label: FC.impacting.title,
      type: FC.impacting.type,
      id: FC.impacting.urlParam,
      value: `checkbox-${FC.impacting.urlParam}`,
      filterValues: {
        key: `${FC.impacting.urlParam}-filter`,
        onChange: (e, values) => addFilterParam(FC.impacting.urlParam, values),
        value: filters.impacting,
        items: FC.impacting.values,
      },
    },
  ];

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    showDeleteButton: true,
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        setSearchText('');
        setFilters({
          ...(filters.topic && { topic: filters.topic }),
          impacting: ['true'],
          rule_status: 'enabled',
          limit: filters.limit,
          offset: filters.offset,
          pathway: filters.pathway,
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

  const afterViewSystemsFn = () => {
    refetch();
  };

  const onExpandAllClick = (_e, isOpen) => {
    const allRows = [...rows];
    setIsAllExpanded(isOpen);
    allRows.map((row, key) => {
      if (Object.prototype.hasOwnProperty.call(row, 'isOpen')) {
        allRows[key] = { ...row, isOpen };
      }
    });

    setRows(allRows);
  };

  return (
    <React.Fragment>
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(toggleModal) =>
            setViewSystemsModalOpen(toggleModal)
          }
          isModalOpen={viewSystemsModalOpen}
          afterFn={afterViewSystemsFn}
          rule={viewSystemsModalRule}
        />
      )}
      {disableRuleOpen && (
        <DisableRule
          handleModalToggle={setDisableRuleOpen}
          isModalOpen={disableRuleOpen}
          rule={selectedRule}
          afterFn={refetch}
        />
      )}
      <PrimaryToolbar
        expandAll={{ isAllExpanded, onClick: onExpandAllClick }}
        pagination={{
          itemCount: results,
          page: filters.offset / filters.limit + 1,
          perPage: Number(filters.limit),
          onSetPage(_event, page) {
            onSetPage(page);
          },
          onPerPageSelect(_event, perPage) {
            setFilters({ ...filters, limit: perPage, offset: 0 });
          },
          isCompact: true,
        }}
        exportConfig={{
          label: intl.formatMessage(messages.exportCsv),
          // eslint-disable-next-line no-dupe-keys
          label: intl.formatMessage(messages.exportJson),
          onSelect: (_e, fileType) =>
            downloadReport(
              'hits',
              fileType,
              filters,
              selectedTags,
              workloads,
              SID,
              dispatch
            ),
          isDisabled: !permsExport,
          tooltipText: permsExport
            ? intl.formatMessage(messages.exportData)
            : intl.formatMessage(messages.permsAction),
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {isFetching ? (
        <Loading />
      ) : isError ? (
        <Table>
          <ErrorState />
        </Table>
      ) : (
        <Table
          aria-label={'rule-table'}
          variant={TableVariant.compact}
          actionResolver={actionResolver}
          onCollapse={handleOnCollapse}
          sortBy={sortBy}
          onSort={onSort}
          cells={cols}
          rows={rows}
          areActionsDisabled={() => !permsDisableRec}
          isStickyHeader
        >
          <TableHeader />
          <TableBody />
        </Table>
      )}
      <Pagination
        ouiaId="page"
        itemCount={results}
        page={filters.offset / filters.limit + 1}
        perPage={Number(filters.limit)}
        onSetPage={(_e, page) => {
          onSetPage(page);
        }}
        onPerPageSelect={(_e, perPage) => {
          setFilters({ ...filters, limit: perPage, offset: 0 });
        }}
        widgetId={`pagination-options-menu-bottom`}
        variant={PaginationVariant.bottom}
      />
    </React.Fragment>
  );
};

RulesTable.propTypes = {
  isTabActive: PropTypes.bool,
};

export default RulesTable;
