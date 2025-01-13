import './SystemAdvisor.scss';
import {
  BASE_URL,
  FILTER_CATEGORIES as FC,
  INVENTORY_BASE_URL,
} from '../../AppConstants';
import { Spinner } from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { SortByDirection, TableVariant } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import { useDispatch, useSelector } from 'react-redux';

import { Get } from '../../Utilities/Api';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/';
import { capitalize } from '../../PresentationalComponents/Common/Tables';
import messages from '../../Messages';
import NotConnected from '@redhat-cloud-services/frontend-components/NotConnected';
import get from 'lodash/get';
import {
  getColumns,
  getFilters,
  useBuildRows,
  useProcessRemediation,
} from './SystemAdvisorAssets';
import downloadReport from '../../PresentationalComponents/Common/DownloadHelper';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import * as AppConstants from '../../AppConstants';
import { useParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { SkeletonTable } from '@patternfly/react-component-groups';

const BaseSystemAdvisor = ({ entity, inventoryId }) => {
  const intl = useIntl();
  const systemAdvisorRef = useRef({
    rowCount: 0,
  });
  const dispatch = useDispatch();
  const addNotification = (data) => dispatch(addNotificationAction(data));
  const { isProd } = useChrome();

  const { id: ruleIdParam } = useParams();

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
  const [systemProfile, setSystemsProfile] = useState({});
  const [isSystemProfileLoading, setSystemsProfileLoading] = useState(true);
  const selectedTags = useSelector(({ filters }) => filters?.selectedTags);
  const workloads = useSelector(({ filters }) => filters?.workloads);
  const SID = useSelector(({ filters }) => filters?.SID);
  const permsExport = usePermissions(
    'advisor',
    AppConstants.PERMS.export
  ).hasAccess;

  const getSelectedItems = (rows) => rows.filter((row) => row.selected);
  const selectedAnsibleRules = getSelectedItems(rows).filter(
    (r) => r.resolution?.has_playbook
  );
  const selectedItemsLength = getSelectedItems(rows).length;
  const selectableItemsLength = rows.filter(
    (r) => r.resolution?.has_playbook
  ).length;

  const cols = getColumns(intl);

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

  const actions =
    !isSystemProfileLoading && systemProfile?.host_type !== 'edge'
      ? [
          <RemediationButton
            key="remediation-button"
            fallback={<Spinner size="md" />}
            isDisabled={selectedAnsibleRules.length === 0}
            dataProvider={() => processRemediation(selectedAnsibleRules)}
            onRemediationCreated={(result) => onRemediationCreated(result)}
          >
            {intl.formatMessage(messages.remediate)}
          </RemediationButton>,
        ]
      : [];

  const activeRuleFirst = (activeReports) => {
    const reports = [...activeReports];
    const activeRuleIndex = ruleIdParam
      ? activeReports.findIndex((report) => report.rule.rule_id === ruleIdParam)
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

  const buildRows = useBuildRows(
    intl,
    systemAdvisorRef,
    entity,
    inventoryReportFetchStatus,
    isProd
  );
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
          )})&fq=documentKind:(Solution%20or%20Article)&fl=view_uri,id,publishedTitle&redhat_client=$ADVISOR`,
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
          true
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

  const processRemediation = useProcessRemediation(inventoryId);
  const filterConfigItems = getFilters(
    filters,
    searchValue,
    onInputChange,
    onFilterChange
  );

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const reportsFetch = await Get(
          `${BASE_URL}/system/${inventoryId}/reports/`,
          {
            credentials: 'include',
          }
        );

        const activeRuleFirstReportsData = activeRuleFirst(reportsFetch.data);
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

        const profileData = await Get(
          `${INVENTORY_BASE_URL}/hosts/${inventoryId}/system_profile`,
          {
            credentials: 'include',
          }
        );

        setSystemsProfile(profileData?.data?.results[0]?.system_profile || {});
        setSystemsProfileLoading(false);
      } catch (error) {
        setInventoryReportFetchStatus('failed');
        setSystemsProfileLoading(false);
      }
    };
    dataFetch();
  }, []);
  // eslint-disable-next-line react/prop-types
  let display_name = entity?.display_name;
  return inventoryReportFetchStatus === 'fulfilled' &&
    entity?.insights_id === null ? (
    <NotConnected
      titleText={intl.formatMessage(messages.notConnectedTitle)}
      bodyText={intl.formatMessage(messages.notConnectedBody)}
      buttonText={intl.formatMessage(messages.notConnectedButton)}
    />
  ) : (
    <div className="ins-c-inventory-insights__overrides">
      {inventoryReportFetchStatus === 'pending' ||
      entity?.insights_id === null ? (
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
          exportConfig={{
            label: intl.formatMessage(messages.exportCsv),
            // eslint-disable-next-line no-dupe-keys
            label: intl.formatMessage(messages.exportJson),
            onSelect: (_e, fileType) =>
              downloadReport(
                'hits',
                fileType,
                { ...filters, text: searchValue },
                selectedTags,
                workloads,
                SID,
                dispatch,
                display_name
              ),
            isDisabled: !permsExport,
            tooltipText: permsExport
              ? intl.formatMessage(messages.exportData)
              : intl.formatMessage(messages.permsAction),
          }}
        />
      )}
      {inventoryReportFetchStatus === 'pending' && (
        <SkeletonTable columns={cols.map((c) => c.title)} variant="compact" />
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
  inventoryId: PropTypes.string.isRequired,
};

const SystemAdvisor = ({ ...props }) => {
  const entity = useSelector(({ entityDetails }) => entityDetails.entity);

  return <BaseSystemAdvisor {...props} entity={entity} />;
};

export default SystemAdvisor;
export { BaseSystemAdvisor };
