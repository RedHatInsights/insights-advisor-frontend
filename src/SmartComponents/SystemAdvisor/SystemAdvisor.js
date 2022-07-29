import './SystemAdvisor.scss';

import { AnsibeTowerIcon } from '@patternfly/react-icons';
import {
  BASE_URL,
  FILTER_CATEGORIES as FC,
  IMPACT_LABEL,
  LIKELIHOOD_LABEL,
  RULE_CATEGORIES,
} from '../../AppConstants';
import {
  Card,
  CardBody,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { IntlProvider, useIntl } from 'react-intl';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  cellWidth,
  fitContent,
  sortable,
} from '@patternfly/react-table';
import { useDispatch, useSelector } from 'react-redux';

import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { Get } from '../../Utilities/Api';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { List } from 'react-content-loader';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { ReportDetails } from '@redhat-cloud-services/frontend-components-advisor-components';
import RuleLabels from '../../PresentationalComponents/Labels/RuleLabels';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/';
import { capitalize } from '../../PresentationalComponents/Common/Tables';
import messages from '../../Messages';
import { Provider } from 'react-redux';
import {
  HideResultsSatelliteManaged,
  NoMatchingRecommendations,
  NoRecommendations,
  InsightsNotEnabled,
  InventoryReportFetchFailed,
} from './EmptyStates';
import NotConnected from '@redhat-cloud-services/frontend-components/NotConnected';

const BaseSystemAdvisor = () => {
  const intl = useIntl();
  const systemAdvisorRef = useRef({
    rowCount: 0,
  });
  const dispatch = useDispatch();
  const addNotification = (data) => dispatch(addNotificationAction(data));

  const entity = useSelector(({ entityDetails }) => entityDetails.entity);
  const systemProfile = useSelector(({ systemProfileStore }) =>
    systemProfileStore ? systemProfileStore.systemProfile : {}
  );
  const routerData = useSelector(({ routerData }) => routerData);

  const [inventoryReportFetchStatus, setInventoryReportFetchStatus] =
    useState('pending');
  const [rows, setRows] = useState([]);
  const [activeReports, setActiveReports] = useState([]);
  const [kbaDetailsData, setKbaDetailsData] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filters, setFilters] = useState({});
  const [accountSettings, setAccountSettings] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const satelliteManaged =
    (systemProfile && systemProfile.satellite_managed) || false; // system is managed by satellite
  const satelliteShowHosts = accountSettings.show_satellite_hosts || false; // setting to show satellite managed systems
  const hideResultsSatelliteManaged = !satelliteShowHosts && satelliteManaged;
  const getSelectedItems = (rows) => rows.filter((entity) => entity.selected);
  const selectedAnsibleRules = getSelectedItems(rows).filter(
    (r) => r.resolution?.has_playbook
  );
  const selectedItemsLength = getSelectedItems(rows).length;
  const selectableItemsLength = rows.filter(
    (r) => r.resolution?.has_playbook
  ).length;

  const cols = [
    {
      title: intl.formatMessage(messages.topicAddEditDescription),
      transforms: [sortable],
    },
    {
      title: intl.formatMessage(messages.modified),
      transforms: [sortable, cellWidth(15)],
    },
    {
      title: intl.formatMessage(messages.totalRisk),
      transforms: [sortable],
    },
    {
      title: intl.formatMessage(messages.remediation),
      transforms: [sortable, fitContent],
    },
  ];

  const onExpandAllClick = (_e, isOpen) => {
    setIsAllExpanded(isOpen);
    const allRows = [...rows];

    allRows.map((row) => {
      if (Object.prototype.hasOwnProperty.call(row, 'isOpen')) {
        row.isOpen = isOpen;
      }
    });

    setRows(allRows);
  };

  const onRemediationCreated = (result) => {
    onBulkSelect(false);
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

  const actions = [
    <RemediationButton
      key="remediation-button"
      isDisabled={selectedAnsibleRules.length === 0}
      dataProvider={() => processRemediation(selectedAnsibleRules)}
      onRemediationCreated={(result) => onRemediationCreated(result)}
    >
      {intl.formatMessage(messages.remediate)}
    </RemediationButton>,
  ];

  const activeRuleFirst = (activeReports) => {
    const reports = [...activeReports];
    const activeRuleIndex =
      routerData && typeof routerData.params !== 'undefined'
        ? activeReports.findIndex(
            (report) => report.rule.rule_id === routerData.params.id
          )
        : -1;
    const activeReport = reports.splice(activeRuleIndex, 1);

    return activeRuleIndex !== -1
      ? [activeReport[0], ...reports]
      : activeReports;
  };

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...rows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setRows(collapseRows);
  };

  const buildRows = (
    activeReports,
    kbaDetails,
    filters,
    rows,
    searchValue = '',
    kbaLoading = false
  ) => {
    const builtRows = activeReports.flatMap((value, key) => {
      const rule = value.rule;
      const resolution = value.resolution;
      const kbaDetail = Object.keys(kbaDetails).length
        ? kbaDetails.filter((article) => article.id === value.rule.node_id)[0]
        : {};

      const match = rows.find((row) => row?.rule?.rule_id === rule.rule_id);
      const selected = match?.selected;
      const isOpen = match?.isOpen || false;
      const reportRow = [
        {
          rule,
          resolution,
          //make arrow button disappear when there is no resolution
          isOpen: resolution ? isOpen : undefined,
          selected,
          disableSelection: resolution ? !resolution.has_playbook : true,
          cells: [
            {
              title: (
                <span>
                  {rule.description} <RuleLabels rule={rule} />
                </span>
              ),
            },
            {
              title: (
                <div key={key}>
                  <DateFormat
                    date={rule.publish_date}
                    type="relative"
                    tooltipProps={{ position: TooltipPosition.bottom }}
                  />
                </div>
              ),
            },
            {
              title: (
                <div key={key} style={{ verticalAlign: 'top' }}>
                  <Tooltip
                    key={key}
                    position={TooltipPosition.bottom}
                    content={
                      <span>
                        The <strong>likelihood</strong> that this will be a
                        problem is {LIKELIHOOD_LABEL[rule.likelihood]}. The{' '}
                        <strong>impact</strong> of the problem would be &nbsp;
                        {IMPACT_LABEL[rule.impact.impact]} if it occurred.
                      </span>
                    }
                  >
                    <InsightsLabel value={rule.total_risk} isCompact />
                  </Tooltip>
                </div>
              ),
            },
            {
              title: (
                <div className="ins-c-center-text" key={key}>
                  {resolution === null ? (
                    intl.formatMessage(messages.notAvailable)
                  ) : resolution?.has_playbook ? (
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
        resolution && {
          parent: key,
          fullWidth: true,
          cells: [
            {
              title: (
                <ReportDetails
                  key={`child-${key}`}
                  report={{
                    ...value,
                    resolution: value.resolution.resolution,
                  }}
                  kbaDetail={kbaDetail}
                  kbaLoading={kbaLoading}
                />
              ),
            },
          ],
        },
      ];
      const isValidSearchValue =
        searchValue.length === 0 ||
        rule.description.toLowerCase().includes(searchValue.toLowerCase());
      const isValidFilterValue =
        Object.keys(filters).length === 0 ||
        Object.keys(filters)
          .map((key) => {
            const filterValues = filters[key];
            const rowValue = {
              has_playbook: value.resolution?.has_playbook,
              publish_date: rule.publish_date,
              total_risk: rule.total_risk,
              category: RULE_CATEGORIES[rule.category.name.toLowerCase()],
            };
            return filterValues.find(
              (value) => String(value) === String(rowValue[key])
            );
          })
          .every((x) => x);

      return isValidSearchValue && isValidFilterValue
        ? reportRow.filter((row) => row !== null)
        : [];
    });
    //must recalculate parent for expandable table content whenever the array size changes
    builtRows.forEach((row, index) =>
      row.parent ? (row.parent = index - 1) : null
    );

    systemAdvisorRef.current.rowCount = activeReports.length;

    if (activeReports.length < 1 || builtRows.length < 1) {
      let EmptyState =
        (builtRows.length === 0 && NoMatchingRecommendations) ||
        (entity.insights_id && NoRecommendations) ||
        InsightsNotEnabled;

      return [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 5 },
              title: <EmptyState />,
            },
          ],
        },
      ];
    }

    if (inventoryReportFetchStatus === 'failed') {
      return [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 5 },
              title: <InventoryReportFetchFailed entity={entity} />,
            },
          ],
        },
      ];
    }

    return builtRows;
  };

  const onRowSelect = (_e, isSelected, rowId) =>
    setRows(
      buildRows(
        activeReports,
        kbaDetailsData,
        filters,
        rows.map((row, index) =>
          index === rowId ? { ...row, selected: isSelected } : row
        ),
        searchValue
      )
    );

  const onBulkSelect = (isSelected) => {
    setIsSelected(isSelected);
    setRows(
      buildRows(
        activeReports,
        kbaDetailsData,
        filters,
        rows.map((row, index) =>
          // We need to use mod 2 here to ignore children with no has_playbook param
          index % 2 === 0 && row.resolution.has_playbook
            ? { ...row, selected: isSelected }
            : row
        ),
        searchValue
      )
    );
  };
  const checkedStatus = () => {
    if (selectedItemsLength === systemAdvisorRef.current.rowCount) {
      return 1;
    } else if (
      selectedItemsLength > 0 ||
      selectableItemsLength !== systemAdvisorRef.current.rowCount
    ) {
      return null;
    } else {
      return 0;
    }
  };

  const bulkSelect = {
    items: [
      {
        title: 'Select none',
        onClick: () => onBulkSelect(false),
      },
      {
        title: 'Select all',
        onClick: () => onBulkSelect(true),
      },
    ],
    count: selectedItemsLength,
    checked: checkedStatus(),
    onSelect: () => onBulkSelect(!isSelected),
  };

  const buildFilterChips = (filters) => {
    const prunedFilters = Object.entries(filters);
    let chips =
      filters && prunedFilters.length > 0
        ? prunedFilters.map((item) => {
            const category = FC[item[0]];
            const chips = item[1].map((value) => ({
              name: category.values.find(
                (values) => values.value === String(value)
              ).label,
              value,
            }));
            return {
              category: capitalize(category.title),
              chips,
              urlParam: category.urlParam,
            };
          })
        : [];
    searchValue.length > 0 &&
      chips.push({
        category: 'Description',
        chips: [{ name: searchValue, value: searchValue }],
      });
    return chips;
  };

  const onChipDelete = (_e, itemsToRemove, isAll) => {
    if (isAll) {
      setRows(buildRows(activeReports, kbaDetailsData, {}, rows, ''));
      setFilters({});
      setSearchValue('');
    } else {
      itemsToRemove.map((item) => {
        if (item.category === 'Description') {
          setRows(buildRows(activeReports, kbaDetailsData, filters, rows, ''));
          setSearchValue('');
        } else {
          onFilterChange(
            item.urlParam,
            filters[item.urlParam].filter(
              (value) => String(value) !== String(item.chips[0].value)
            )
          );
        }
      });
    }
  };

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(filters),
    onDelete: onChipDelete,
  };

  const fetchKbaDetails = async (reportsData) => {
    const kbaIds = reportsData.map(({ rule }) => rule.node_id).filter((x) => x);
    try {
      const kbaDetailsFetch = (
        await Get(
          `https://access.redhat.com/hydra/rest/search/kcs?q=id:(${kbaIds.join(
            ` OR `
          )})&fl=view_uri,id,publishedTitle&rows=${
            kbaIds.length
          }&redhat_client=$ADVISOR`,
          {},
          { credentials: 'include' }
        )
      ).data.response.docs;

      setKbaDetailsData(kbaDetailsFetch);
      setRows(
        buildRows(reportsData, kbaDetailsFetch, filters, rows, searchValue)
      );
    } catch (error) {
      console.error(error, 'KBA fetch failed.');
    }
  };

  const onSort = (_e, index, direction) => {
    const sortedReports = {
      1: 'description',
      2: 'publish_date',
      3: 'total_risk',
      4: 'has_playbook',
    };
    const key = index === 5 ? 'resolution' : 'rule';
    const sort = (key) =>
      activeReports
        .concat()
        .sort((firstItem, secondItem) =>
          firstItem[key][sortedReports[index]] >
          secondItem[key][sortedReports[index]]
            ? 1
            : secondItem[key][sortedReports[index]] >
              firstItem[key][sortedReports[index]]
            ? -1
            : 0
        );
    const sortedReportsDirectional =
      direction === SortByDirection.asc ? sort(key) : sort(key).reverse();

    setActiveReports(sortedReportsDirectional);
    setSortBy({
      index,
      direction,
    });
    setRows(
      buildRows(
        sortedReportsDirectional,
        kbaDetailsData,
        filters,
        rows,
        searchValue
      )
    );
  };

  const onFilterChange = (param, values) => {
    const removeFilterParam = (param) => {
      const filter = { ...filters };
      delete filter[param];
      return filter;
    };

    const newFilters =
      values.length > 0
        ? { ...filters, ...{ [param]: values } }
        : removeFilterParam(param);
    setRows(
      buildRows(activeReports, kbaDetailsData, newFilters, rows, searchValue)
    );
    setFilters(newFilters);
  };

  const onInputChange = (value) => {
    const builtRows = buildRows(
      activeReports,
      kbaDetailsData,
      filters,
      rows,
      value
    );
    setSearchValue(value);
    setRows(builtRows);
  };

  const processRemediation = (selectedAnsibleRules) => {
    const playbookRows = selectedAnsibleRules.filter(
      (r) => r.resolution?.has_playbook
    );
    const issues = playbookRows.map((r) => ({
      id: `advisor:${r.rule.rule_id}`,
      description: r.rule.description,
    }));
    return issues.length ? { issues, systems: [entity.id] } : false;
  };

  const filterConfigItems = [
    {
      label: 'description',
      filterValues: {
        key: 'text-filter',
        onChange: (_e, value) => onInputChange(value),
        value: searchValue,
      },
    },
    {
      label: FC.total_risk.title,
      type: FC.total_risk.type,
      id: FC.total_risk.urlParam,
      value: `checkbox-${FC.total_risk.urlParam}`,
      filterValues: {
        key: `${FC.total_risk.urlParam}-filter`,
        onChange: (_e, values) =>
          onFilterChange(FC.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FC.total_risk.values,
      },
    },
    {
      label: FC.category.title,
      type: FC.category.type,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        key: `${FC.category.urlParam}-filter`,
        onChange: (_e, values) => onFilterChange(FC.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
    {
      label: FC.has_playbook.title,
      type: FC.has_playbook.type,
      id: FC.has_playbook.urlParam,
      value: `checkbox-${FC.has_playbook.urlParam}`,
      filterValues: {
        key: `${FC.has_playbook.urlParam}-filter`,
        onChange: (_e, values) =>
          onFilterChange(FC.has_playbook.urlParam, values),
        value: filters.has_playbook,
        items: FC.has_playbook.values,
      },
    },
  ];

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const [settingsFetch, reportsFetch] = await Promise.all([
          (
            await Get(`${BASE_URL}/account_setting/`, {
              credentials: 'include',
            })
          ).data,
          (
            await Get(`${BASE_URL}/system/${entity.id}/reports/`, {
              credentials: 'include',
            })
          ).data,
        ]);

        const activeRuleFirstReportsData = activeRuleFirst(reportsFetch);
        fetchKbaDetails(activeRuleFirstReportsData);

        setRows(
          buildRows(
            activeRuleFirstReportsData,
            {},
            filters,
            rows,
            searchValue,
            true
          )
        );
        setInventoryReportFetchStatus('fulfilled');
        setActiveReports(activeRuleFirstReportsData);
        setAccountSettings(settingsFetch);
      } catch (error) {
        setInventoryReportFetchStatus('failed');
      }
    };
    dataFetch();
  }, []);

  return inventoryReportFetchStatus === 'fulfilled' &&
    entity.insights_id === null ? (
    <NotConnected
      titleText={intl.formatMessage(messages.notConnectedTitle)}
      bodyText={intl.formatMessage(messages.notConnectedBody)}
      buttonText={intl.formatMessage(messages.notConnectedButton)}
    />
  ) : (
    <div className="ins-c-inventory-insights__overrides">
      {inventoryReportFetchStatus === 'pending' ||
      (inventoryReportFetchStatus === 'fulfilled' &&
        hideResultsSatelliteManaged) ||
      entity.insights_id === null ? (
        <Fragment />
      ) : (
        <PrimaryToolbar
          expandAll={{ isAllExpanded, onClick: onExpandAllClick }}
          actionsConfig={{ actions }}
          bulkSelect={bulkSelect}
          filterConfig={{ items: filterConfigItems }}
          pagination={
            <Fragment>
              {' '}
              {`${systemAdvisorRef.current.rowCount} ${
                (systemAdvisorRef.current.rowCount === 1 && 'Recommendation') ||
                'Recommendations'
              }`}{' '}
            </Fragment>
          }
          activeFiltersConfig={activeFiltersConfig}
        />
      )}
      {inventoryReportFetchStatus === 'pending' && (
        <Card>
          <CardBody>
            <List />
          </CardBody>
        </Card>
      )}
      {inventoryReportFetchStatus === 'fulfilled' &&
        (hideResultsSatelliteManaged ? (
          <HideResultsSatelliteManaged />
        ) : (
          <Fragment>
            <Table
              aria-label={'report-table'}
              onSelect={
                !(rows.length === 1 && rows[0].heightAuto) && onRowSelect
              }
              onCollapse={handleOnCollapse}
              rows={rows}
              cells={cols}
              sortBy={sortBy}
              canSelectAll={false}
              onSort={onSort}
              variant={TableVariant.compact}
              isStickyHeader
            >
              <TableHeader />
              <TableBody />
            </Table>
          </Fragment>
        ))}
    </div>
  );
};

const SystemAdvisor = ({ customItnl, intlProps, store, ...props }) => {
  const Wrapper = customItnl ? IntlProvider : Fragment;
  const ReduxProvider = store ? Provider : Fragment;
  return (
    <Wrapper
      {...(customItnl && {
        locale: navigator.language.slice(0, 2),
        messages,
        onError: console.log,
        ...intlProps,
      })}
    >
      <ReduxProvider store={store}>
        <BaseSystemAdvisor {...props} />
      </ReduxProvider>
    </Wrapper>
  );
};

export default SystemAdvisor;

SystemAdvisor.propTypes = {
  customItnl: PropTypes.bool,
  intlProps: PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.array,
    onError: PropTypes.func,
  }),
  store: PropTypes.object,
};
