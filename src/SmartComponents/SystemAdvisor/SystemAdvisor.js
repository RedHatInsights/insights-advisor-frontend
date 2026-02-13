import './SystemAdvisor.scss';
import { FILTER_CATEGORIES as FC } from '../../AppConstants';
import { Flex, Spinner } from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
} from '@patternfly/react-table';
import { useDispatch, useSelector } from 'react-redux';

import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import PropTypes from 'prop-types';
import RemediationButton from '@redhat-cloud-services/frontend-components-remediations/RemediationButton';
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
import { useParams } from 'react-router-dom';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { EnvironmentContext } from '../../App';
import { fetchResolutionsData } from './helpers';
import DownloadPlaybookButton from '../../Utilities/DownloadPlaybookButton';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';

const BaseSystemAdvisor = ({
  entity,
  inventoryId,
  IopRemediationModal,
  generateRuleUrl,
  ...props
}) => {
  const intl = useIntl();
  const systemAdvisorRef = useRef({
    rowCount: 0,
  });
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const { id: ruleIdParam } = useParams();
  const axios = useAxiosWithPlatformInterceptors();

  const [inventoryReportFetchStatus, setInventoryReportFetchStatus] =
    useState('pending');
  const [rows, setRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [areAllExpanded, setAreAllExpanded] = useState(false);
  const [activeReports, setActiveReports] = useState([]);
  const [kbaDetailsData, setKbaDetailsData] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [systemProfile, setSystemsProfile] = useState({});
  const [isSystemProfileLoading, setSystemsProfileLoading] = useState(true);
  const selectedTags = useSelector(({ filters }) => filters?.selectedTags);
  const workloads = useSelector(({ filters }) => filters?.workloads);
  const envContext = useContext(EnvironmentContext);

  const getSelectedItems = (rows) => rows.filter((row) => row.selected);
  const selectedAnsibleRules = useMemo(() => {
    const getSelectedItems = (rows) => rows.filter((row) => row.selected);
    return getSelectedItems(rows).filter((r) => r.resolution?.has_playbook);
  }, [rows]);
  const selectedItemsLength = getSelectedItems(rows).length;
  const selectableItemsLength = rows.filter(
    (r) => r.resolution?.has_playbook,
  ).length;

  const [resolutions, setResolutions] = useState([]);

  useEffect(() => {
    if (selectedAnsibleRules.length > 0) {
      const fetchAndSetData = async () => {
        const resolutionsData = await fetchResolutionsData(
          selectedAnsibleRules,
          props?.response?.insights_attributes?.uuid,
          props?.hostName,
        );
        setResolutions(resolutionsData);
      };
      fetchAndSetData();
    }
  }, [
    selectedAnsibleRules,
    props?.hostName,
    props?.response?.insights_attributes?.uuid,
  ]);

  const cols = getColumns(intl);

  const onExpandAll = () => {
    if (areAllExpanded) {
      // All rows are currently expanded, so collapse all rows
      setExpandedRows(new Set());
    } else {
      // Expand all rows
      const allRowIndices = new Set();
      rows.forEach((row, idx) => {
        if (row.parent === undefined) {
          allRowIndices.add(idx);
        }
      });
      setExpandedRows(allRowIndices);
    }
    setAreAllExpanded(!areAllExpanded);
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
          <Flex key="inventory-actions">
            {IopRemediationModal ? (
              <IopRemediationModal.WrappedComponent
                selectedIds={selectedAnsibleRules}
                iopData={resolutions}
                isDisabled={selectedAnsibleRules.length === 0}
              />
            ) : (
              <RemediationButton
                key="remediation-button"
                fallback={<Spinner size="md" />}
                isDisabled={selectedAnsibleRules.length === 0}
                dataProvider={() => processRemediation(selectedAnsibleRules)}
                onRemediationCreated={(result) => onRemediationCreated(result)}
                hasSelected={selectedAnsibleRules?.length > 0}
              >
                Plan remediation
              </RemediationButton>
            )}
            {envContext.displayDownloadPlaybookButton && (
              <DownloadPlaybookButton
                isDisabled={selectedAnsibleRules.length === 0}
                rules={selectedAnsibleRules.map((rule) => rule.rule)}
                systems={[inventoryId]}
              />
            )}
          </Flex>,
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

  const isRowExpanded = (rowIndex) => expandedRows.has(rowIndex);

  const setRowExpanded = (rowIndex, isExpanding) => {
    setExpandedRows((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (isExpanding) {
        newExpanded.add(rowIndex);
      } else {
        newExpanded.delete(rowIndex);
      }
      return newExpanded;
    });
  };

  const buildRows = useBuildRows(
    intl,
    systemAdvisorRef,
    entity,
    inventoryReportFetchStatus,
    envContext,
    generateRuleUrl,
  );
  const onRowSelect = (_e, isSelected, rowId) =>
    setRows(
      buildRows(
        activeReports,
        kbaDetailsData,
        filters,
        rows.map((row, index) =>
          index === rowId ? { ...row, selected: isSelected } : row,
        ),
        searchValue,
      ),
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
            : row,
        ),
        searchValue,
      ),
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
    toggleProps: {
      /** TODO: stop passing this ouiaId once PrimaryToolbar and BulkSelect
       * pass this ID via ouiaId instead of data-ouia-component-id to the
       * MenuToggle PF component.
       */
      ouiaId: 'BulkSelect',
    },
  };

  const buildFilterChips = (filters) => {
    const prunedFilters = Object.entries(filters);
    let chips =
      filters && prunedFilters.length > 0
        ? prunedFilters.map((item) => {
            const category = FC[item[0]];
            const chips = item[1].map((value) => ({
              name: category.values.find(
                (values) => values.value === String(value),
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
              (value) => String(value) !== String(item.chips[0].value),
            ),
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

  const getKbaDetailsIOP = (reportsData) => {
    const kbaIds = reportsData.map(({ rule }) => rule.node_id).filter((x) => x);
    return kbaIds.map((kbaId) => ({
      publishedTitle: '',
      view_uri: `https://access.redhat.com/node/${kbaId}`,
      id: kbaId,
    }));
  };

  const fetchKbaDetails = async (reportsData) => {
    const kbaIds = reportsData.map(({ rule }) => rule.node_id).filter((x) => x);
    try {
      const kbaDetailsFetch = (
        await axios.get(
          `https://access.redhat.com/hydra/rest/search/kcs?q=id:(${kbaIds.join(
            ` OR `,
          )})&fq=documentKind:(Solution%20or%20Article)&fl=view_uri,id,publishedTitle&redhat_client=$ADVISOR`,
          { params: { credentials: 'include' } },
        )
      ).response.docs;

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
        ),
      );
    } catch (error) {
      console.error(error, 'KBA fetch failed.');
    }
  };

  const onSort = (_e, index, direction) => {
    const sortedReports = {
      0: 'rule.description',
      1: 'rule.publish_date',
      2: 'impacted_date',
      3: 'rule.total_risk',
      4: 'resolution.has_playbook',
    };
    const d = direction === 'asc' ? 1 : -1;

    const sort = () =>
      activeReports.concat().sort((firstItem, secondItem) => {
        let fst = get(firstItem, sortedReports[index]);
        let snd = get(secondItem, sortedReports[index]);

        if (index === 1 || index === 2) {
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
      ),
    );
  };

  const getSortParams = (columnIndex) => ({
    sortBy: {
      index: sortBy.index,
      direction: sortBy.direction,
    },
    onSort,
    columnIndex,
  });

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
      buildRows(activeReports, kbaDetailsData, newFilters, rows, searchValue),
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
    );
    setSearchValue(value);
    setRows(builtRows);
  };

  const processRemediation = useProcessRemediation(inventoryId);
  const filterConfigItems = getFilters(
    filters,
    searchValue,
    onInputChange,
    onFilterChange,
  );

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const reportsFetch = await axios.get(
          `${envContext.BASE_URL}/system/${inventoryId}/reports/`,
          {
            headers: {
              credentials: 'include',
            },
          },
        );

        const activeRuleFirstReportsData = activeRuleFirst(reportsFetch);
        if (envContext.loadChromeless) {
          const kbaDetailsIOP = getKbaDetailsIOP(activeRuleFirstReportsData);
          setKbaDetailsData(kbaDetailsIOP);
          setRows(
            buildRows(
              activeRuleFirstReportsData,
              kbaDetailsIOP,
              filters,
              rows,
              searchValue,
              false,
            ),
          );
        } else {
          fetchKbaDetails(activeRuleFirstReportsData);
          setRows(
            buildRows(
              activeRuleFirstReportsData,
              {},
              filters,
              rows,
              searchValue,
              true,
            ),
          );
        }
        setInventoryReportFetchStatus('fulfilled');
        setActiveReports(activeRuleFirstReportsData);

        const profileData = await axios.get(
          `${envContext.INVENTORY_BASE_URL}/hosts/${inventoryId}/system_profile`,
          {
            headers: {
              credentials: 'include',
            },
          },
        );

        setSystemsProfile(profileData?.results[0]?.system_profile || {});
        setSystemsProfileLoading(false);
      } catch (error) {
        void error;
        setInventoryReportFetchStatus('failed');
        setSystemsProfileLoading(false);
      }
    };
    dataFetch();
  }, [axios]);
  // eslint-disable-next-line react/prop-types
  let display_name = entity?.display_name;
  return inventoryReportFetchStatus === 'fulfilled' &&
    entity?.insights_id === null ? (
    <NotConnected
      titleText={
        envContext.isLightspeedEnabled
          ? intl.formatMessage(messages.notConnectedTitle)
          : intl.formatMessage(messages.notConnectedTitleInsights)
      }
      bodyText={intl.formatMessage(messages.notConnectedBody)}
      buttonText={intl.formatMessage(messages.notConnectedButton)}
    />
  ) : (
    <div
      id="system-advisor-table"
      className="ins-c-inventory-insights__overrides"
    >
      {inventoryReportFetchStatus === 'pending' ||
      entity?.insights_id === null ? (
        <Fragment />
      ) : (
        <PrimaryToolbar
          ouiaId="system-advisor-table-toolbar"
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
          exportConfig={
            envContext.isExportEnabled && {
              label: intl.formatMessage(messages.exportCsv),
              label: intl.formatMessage(messages.exportJson),
              onSelect: (_e, fileType) =>
                downloadReport(
                  'hits',
                  fileType,
                  { ...filters, text: searchValue },
                  selectedTags,
                  workloads,
                  dispatch,
                  envContext.BASE_URL,
                  display_name,
                  addNotification,
                  axios,
                ),
              tooltipText: intl.formatMessage(messages.exportData),
            }
          }
        />
      )}
      {inventoryReportFetchStatus === 'pending' && (
        <SkeletonTable columns={cols.map((c) => c.title)} variant="compact" />
      )}
      {inventoryReportFetchStatus === 'fulfilled' && (
        <Fragment>
          <Table
            ouiaId={'system-advisor-table'}
            aria-label={'system-advisor-table'}
            variant="compact"
            isStickyHeader
          >
            <Thead>
              <Tr>
                <Th
                  expand={{
                    areAllExpanded: !areAllExpanded,
                    onToggle: onExpandAll,
                  }}
                />
                <Th /> {/* Empty header for selection column */}
                {cols.map((col, index) => (
                  <Th
                    key={index}
                    data-label={col.title}
                    sort={col.sortable ? getSortParams(index) : undefined}
                    width={col.width}
                    modifier={col.modifier}
                  >
                    {col.title}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, rowIndex) => {
                // Handle empty state row
                if (row.heightAuto) {
                  return (
                    <Tr key={rowIndex}>
                      <Td
                        data-label={row.cells[0].title}
                        colSpan={cols.length + 2}
                      >
                        {row.cells[0].title}
                      </Td>
                    </Tr>
                  );
                }

                // Handle child/expandable content rows
                if (row.parent !== undefined) {
                  const parentIndex = row.parent;
                  return (
                    <Tr key={rowIndex} isExpanded={isRowExpanded(parentIndex)}>
                      <Td colSpan={cols.length + 2}>
                        <ExpandableRowContent>
                          {row.cells[0].title}
                        </ExpandableRowContent>
                      </Td>
                    </Tr>
                  );
                }

                // Handle parent/main rows
                const isExpanded = isRowExpanded(rowIndex);
                const isSelectable = !row.disableSelection;

                return (
                  <Tr key={rowIndex}>
                    <Td
                      expand={
                        row.isOpen !== undefined
                          ? {
                              rowIndex,
                              isExpanded,
                              onToggle: (_event, _rowIndex, isExpanding) =>
                                setRowExpanded(rowIndex, isExpanding),
                            }
                          : undefined
                      }
                    />
                    <Td
                      select={{
                        rowIndex,
                        onSelect: (_event, isSelecting) =>
                          onRowSelect(_event, isSelecting, rowIndex),
                        isSelected: row.selected,
                        isDisabled: !isSelectable,
                      }}
                    />
                    {row.cells.map((cell, cellIndex) => (
                      <Td key={cellIndex} data-label={cols[cellIndex]?.title}>
                        {cell.title}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
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
  IopRemediationModal: PropTypes.element,
  generateRuleUrl: PropTypes.func,
  response: PropTypes.shape({
    insights_attributes: PropTypes.shape({
      uuid: PropTypes.string,
    }).isRequired,
  }).isRequired,
  hostName: PropTypes.string.isRequired,
};

const SystemAdvisor = ({ ...props }) => {
  const entity = useSelector(({ entityDetails }) => entityDetails.entity);

  return <BaseSystemAdvisor {...props} entity={entity} />;
};

export default SystemAdvisor;
export { BaseSystemAdvisor };
