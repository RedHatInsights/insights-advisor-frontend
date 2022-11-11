import './SystemAdvisor.scss';
import { BASE_URL, FILTER_CATEGORIES as FC } from '../../AppConstants';
import { Card, CardBody } from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  fitContent,
  sortable,
} from '@patternfly/react-table';
import { useDispatch, useSelector } from 'react-redux';

import { Get } from '../../Utilities/Api';
import { List } from 'react-content-loader';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/';
import messages from '../../Messages';
import NotConnected from '@redhat-cloud-services/frontend-components/NotConnected';
import get from 'lodash/get';
import {
  activeRuleFirst,
  processRemediation,
  buildFilterChips,
  buildRows,
} from './helper';

const BaseSystemAdvisor = ({ entity }) => {
  const intl = useIntl();
  const systemAdvisorRef = useRef({
    rowCount: 0,
  });
  const dispatch = useDispatch();
  const addNotification = (data) => dispatch(addNotificationAction(data));

  const routerData = useSelector(({ routerData }) => routerData);

  const [inventoryReportFetchStatus, setInventoryReportFetchStatus] =
    useState('pending');
  const [rows, setRows] = useState([]);
  const [activeReports, setActiveReports] = useState([]);
  const [kbaDetailsData, setKbaDetailsData] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const getSelectedItems = (rows) => rows.filter((row) => row.selected);
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
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.firstImpacted),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.totalRisk),
      transforms: [sortable, fitContent],
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
      dataProvider={() => processRemediation(selectedAnsibleRules, entity)}
      onRemediationCreated={(result) => onRemediationCreated(result)}
    >
      {intl.formatMessage(messages.remediate)}
    </RemediationButton>,
  ];

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...rows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setRows(collapseRows);
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
        searchValue,
        false,
        false,
        location,
        systemAdvisorRef,
        entity,
        intl,
        inventoryReportFetchStatus
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
        searchValue,
        false,
        false,
        location,
        systemAdvisorRef,
        entity,
        intl,
        inventoryReportFetchStatus
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

  const onChipDelete = (_e, itemsToRemove, isAll) => {
    if (isAll) {
      setRows(
        buildRows(
          activeReports,
          kbaDetailsData,
          {},
          rows,
          '',
          false,
          false,
          location,
          systemAdvisorRef,
          entity,
          intl,
          inventoryReportFetchStatus
        )
      );
      setFilters({});
      setSearchValue('');
    } else {
      itemsToRemove.map((item) => {
        if (item.category === 'Description') {
          setRows(
            buildRows(
              activeReports,
              kbaDetailsData,
              filters,
              rows,
              '',
              false,
              false,
              location,
              systemAdvisorRef,
              entity,
              intl,
              inventoryReportFetchStatus
            )
          );
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
    filters: buildFilterChips(filters, searchValue),
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
        buildRows(
          reportsData,
          kbaDetailsFetch,
          filters,
          rows,
          searchValue,
          false,
          true,
          location,
          systemAdvisorRef,
          entity,
          intl,
          inventoryReportFetchStatus
        )
      );
    } catch (error) {
      console.error(error, 'KBA fetch failed.');
    }
  };

  const onSort = (_e, index, direction) => {
    const sortedReports = {
      2: 'rule.description',
      3: 'rule.publish_date',
      4: 'impacted_date',
      5: 'rule.total_risk',
      6: 'resolution.has_playbook',
    };
    const d = direction === SortByDirection.asc ? 1 : -1;

    const sort = () =>
      activeReports.concat().sort((firstItem, secondItem) => {
        let fst = get(firstItem, sortedReports[index]);
        let snd = get(secondItem, sortedReports[index]);

        if (index === 3 || index === 4) {
          fst = new Date(fst);
          snd = new Date(snd);
        }
        return fst > snd ? d : snd > fst ? -d : 0;
      });

    const sortedReportsDirectional = sort();

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
        searchValue,
        false,
        false,
        location,
        systemAdvisorRef,
        entity,
        intl,
        inventoryReportFetchStatus
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
      buildRows(
        activeReports,
        kbaDetailsData,
        newFilters,
        rows,
        searchValue,
        false,
        false,
        location,
        systemAdvisorRef,
        entity,
        intl,
        inventoryReportFetchStatus
      )
    );
    setFilters(newFilters);
  };

  const onInputChange = (value) => {
    const builtRows = buildRows(
      activeReports,
      kbaDetailsData,
      filters,
      rows,
      value,
      false,
      false,
      location,
      systemAdvisorRef,
      entity,
      intl,
      inventoryReportFetchStatus
    );
    setSearchValue(value);
    setRows(builtRows);
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
        const reportsFetch = await Get(
          `${BASE_URL}/system/${entity.id}/reports/`,
          {
            credentials: 'include',
          }
        );

        const activeRuleFirstReportsData = activeRuleFirst(
          reportsFetch.data,
          routerData
        );
        fetchKbaDetails(activeRuleFirstReportsData);

        setRows(
          buildRows(
            activeRuleFirstReportsData,
            kbaDetailsData,
            filters,
            rows,
            searchValue,
            true,
            false,
            location,
            systemAdvisorRef,
            entity,
            intl,
            inventoryReportFetchStatus
          )
        );
        setInventoryReportFetchStatus('fulfilled');
        setActiveReports(activeRuleFirstReportsData);
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
      {inventoryReportFetchStatus === 'fulfilled' && (
        <Fragment>
          <Table
            id={'system-advisor-report-table'}
            aria-label={'report-table'}
            onSelect={!(rows.length === 1 && rows[0].heightAuto) && onRowSelect}
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
      )}
    </div>
  );
};

BaseSystemAdvisor.propTypes = {
  entity: PropTypes.shape({
    insights_id: PropTypes.string,
    id: PropTypes.string,
  }),
};

const SystemAdvisor = ({ ...props }) => {
  const entity = useSelector(({ entityDetails }) => entityDetails.entity);

  return <BaseSystemAdvisor {...props} entity={entity} />;
};

export default SystemAdvisor;
export { BaseSystemAdvisor };
