import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
} from '@patternfly/react-core/dist/esm/components/Toolbar';
import { SearchInput } from '@patternfly/react-core/dist/esm/components/SearchInput';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core/dist/esm/deprecated/components/Dropdown';
import { Link } from 'react-router-dom';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { EnvironmentContext } from '../../../App';
import { Get } from '../../../Utilities/Api';
import { DEBOUNCE_DELAY } from '../../../AppConstants';
import debounce from '../../../Utilities/Debounce';
import messages from '../../../Messages';
import DownloadPlaybookButton from '../../../Utilities/DownloadPlaybookButton';
import { workloadQueryBuilder } from '../../../PresentationalComponents/Common/Tables';
import { SkeletonTable } from '@patternfly/react-component-groups';

const SORT_FIELDS = ['display_name', 'last_seen'];

// eslint-disable-next-line no-unused-vars
const IopPathwaySystems = ({ pathway, selectedTags, workloads, axios }) => {
  const intl = useIntl();
  const envContext = useContext(EnvironmentContext);

  const [systems, setSystems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState({ index: 1, direction: 'desc' });
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkSelectOpen, setBulkSelectOpen] = useState(false);

  // Pathway rules and reports for remediation
  const [pathwayRulesList, setPathwayRulesList] = useState([]);
  const [pathwayReportList, setPathwayReportList] = useState({});
  const [hasPathwayDetails, setHasPathwayDetails] = useState(false);
  const [isRemediationDisabled, setIsRemediationDisabled] = useState(true);

  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);

  const getSortParam = useCallback(() => {
    const field = SORT_FIELDS[sortBy.index] || 'last_seen';
    return `${sortBy.direction === 'asc' ? '' : '-'}${field}`;
  }, [sortBy]);

  const fetchSystems = useCallback(async () => {
    if (!pathway?.slug) return;
    setIsLoading(true);
    try {
      const options = {
        limit: perPage,
        offset: (page - 1) * perPage,
        sort: getSortParam(),
        pathway: pathway.slug,
        ...(debouncedSearchText ? { display_name: debouncedSearchText } : {}),
        ...(selectedTags?.length ? { tags: selectedTags.join(',') } : {}),
        ...(workloads ? workloadQueryBuilder(workloads) : {}),
      };

      const response = await Get(envContext.SYSTEMS_FETCH_URL, {}, options);
      const data = response?.data;
      setSystems(data?.data || []);
      setTotal(data?.meta?.count || 0);
    } catch (error) {
      console.error('Failed to fetch pathway systems:', error);
      setSystems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    pathway?.slug,
    page,
    perPage,
    getSortParam,
    debouncedSearchText,
    selectedTags,
    workloads,
    envContext.SYSTEMS_FETCH_URL,
  ]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  // Fetch pathway rules and reports for remediation checks
  useEffect(() => {
    const fetchPathwayDetails = async () => {
      if (!pathway?.slug || hasPathwayDetails) return;
      try {
        const [rulesRes, reportsRes] = await Promise.all([
          Get(
            `${envContext.BASE_URL}/pathway/${encodeURI(pathway.slug)}/rules/`,
            {},
            {},
          ),
          Get(
            `${envContext.BASE_URL}/pathway/${encodeURI(pathway.slug)}/reports/`,
            {},
            {},
          ),
        ]);
        setPathwayRulesList(rulesRes?.data?.data || []);
        setPathwayReportList(reportsRes?.data?.rules || {});
        setHasPathwayDetails(true);
      } catch (error) {
        console.error('Failed to fetch pathway details:', error);
      }
    };
    fetchPathwayDetails();
  }, [pathway?.slug, envContext.BASE_URL, hasPathwayDetails]);

  // Check remediation button status when selection changes
  useEffect(() => {
    if (!selectedIds?.length) {
      setIsRemediationDisabled(true);
      return;
    }

    const ruleKeys = Object.keys(pathwayReportList);
    let playbookFound = false;

    for (const systemId of selectedIds) {
      if (playbookFound) break;
      for (const ruleKey of ruleKeys) {
        if (pathwayReportList[ruleKey]?.includes(systemId)) {
          const matchedRule = pathwayRulesList.find(
            (r) => r.rule_id === ruleKey,
          );
          if (matchedRule?.resolution_set?.[0]?.has_playbook) {
            playbookFound = true;
            break;
          }
        }
      }
    }

    setIsRemediationDisabled(!playbookFound);
  }, [selectedIds, pathwayReportList, pathwayRulesList]);

  const onSort = (_event, index, direction) => {
    setSortBy({ index, direction });
    setPage(1);
  };

  const onSetPage = (_event, newPage) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event, newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const onSearchChange = (_event, value) => {
    setSearchText(value);
    setPage(1);
  };

  const onSearchClear = () => {
    setSearchText('');
    setPage(1);
  };

  // Selection helpers
  const isSelected = (systemUuid) => selectedIds.includes(systemUuid);

  const onSelect = (systemUuid, isSelecting) => {
    setSelectedIds((prev) =>
      isSelecting
        ? [...prev, systemUuid]
        : prev.filter((id) => id !== systemUuid),
    );
  };

  const selectPage = () => {
    const pageIds = systems.map((s) => s.system_uuid);
    setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
  };

  const selectNone = () => {
    setSelectedIds([]);
  };

  const selectAll = async () => {
    if (!pathway?.slug) return;
    try {
      // Fetch all system IDs across all pages
      const batchSize = 100;
      const pages = Math.ceil(total / batchSize) || 1;
      const allResults = await Promise.all(
        [...Array(pages)].map((_, i) =>
          Get(
            envContext.SYSTEMS_FETCH_URL,
            {},
            {
              limit: batchSize,
              offset: i * batchSize,
              pathway: pathway.slug,
              ...(debouncedSearchText
                ? { display_name: debouncedSearchText }
                : {}),
              ...(selectedTags?.length ? { tags: selectedTags.join(',') } : {}),
              ...(workloads ? workloadQueryBuilder(workloads) : {}),
            },
          ),
        ),
      );
      const allIds = allResults.flatMap(
        (res) => res?.data?.data?.map((s) => s.system_uuid) || [],
      );
      setSelectedIds(allIds);
    } catch (error) {
      console.error('Failed to select all systems:', error);
    }
  };

  const numSelected = selectedIds.length;
  const allPageSelected =
    systems.length > 0 &&
    systems.every((s) => selectedIds.includes(s.system_uuid));

  const columns = [
    {
      title: intl.formatMessage(messages.name),
      sortable: true,
    },
    {
      title: intl.formatMessage(messages.lastSeen),
      sortable: true,
    },
  ];

  return (
    <React.Fragment>
      <Toolbar id="iop-pathway-systems-toolbar">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <Dropdown
                onSelect={() => setBulkSelectOpen(false)}
                toggle={
                  <DropdownToggle
                    splitButtonItems={[
                      <DropdownToggleCheckbox
                        id="bulk-select-checkbox"
                        key="bulk-select"
                        aria-label="Select all"
                        isChecked={
                          numSelected > 0
                            ? allPageSelected
                              ? true
                              : null
                            : false
                        }
                        onChange={(checked) => {
                          checked ? selectPage() : selectNone();
                        }}
                      >
                        {numSelected > 0 ? `${numSelected} selected` : ''}
                      </DropdownToggleCheckbox>,
                    ]}
                    onToggle={(_event, isOpen) => setBulkSelectOpen(isOpen)}
                  />
                }
                isOpen={bulkSelectOpen}
                dropdownItems={[
                  <DropdownItem key="select-none" onClick={selectNone}>
                    {intl.formatMessage(messages.selectNone)}
                  </DropdownItem>,
                  <DropdownItem key="select-page" onClick={selectPage}>
                    {intl.formatMessage(messages.selectPage, {
                      items: systems.length,
                    })}
                  </DropdownItem>,
                  <DropdownItem key="select-all" onClick={selectAll}>
                    {intl.formatMessage(messages.selectAll, {
                      items: total,
                    })}
                  </DropdownItem>,
                ]}
              />
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder={intl.formatMessage(messages.filterBy)}
                value={searchText}
                onChange={onSearchChange}
                onClear={onSearchClear}
              />
            </ToolbarItem>
          </ToolbarGroup>
          {envContext.displayDownloadPlaybookButton && (
            <ToolbarItem>
              <DownloadPlaybookButton
                isDisabled={isRemediationDisabled}
                rules={pathwayRulesList}
                systems={selectedIds}
              />
            </ToolbarItem>
          )}
          <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={total}
              page={page}
              perPage={perPage}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {isLoading ? (
        <SkeletonTable
          columns={columns.map((c) => c.title)}
          rows={perPage}
          variant="compact"
        />
      ) : (
        <Table
          aria-label="Pathway systems table"
          ouiaId="iop-pathway-systems-table"
          variant="compact"
          isStickyHeader
        >
          <Thead>
            <Tr>
              <Th screenReaderText="Select" />
              {columns.map((col, index) => (
                <Th
                  key={index}
                  sort={
                    col.sortable
                      ? {
                          sortBy: {
                            index: sortBy.index,
                            direction: sortBy.direction,
                          },
                          onSort,
                          columnIndex: index,
                        }
                      : undefined
                  }
                >
                  {col.title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {systems.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length + 1}>
                  {intl.formatMessage(messages.noSystemsFoundHeader)}
                </Td>
              </Tr>
            ) : (
              systems.map((system) => (
                <Tr key={system.system_uuid}>
                  <Td
                    select={{
                      rowIndex: system.system_uuid,
                      onSelect: (_event, isSelecting) =>
                        onSelect(system.system_uuid, isSelecting),
                      isSelected: isSelected(system.system_uuid),
                    }}
                  />
                  <Td dataLabel={columns[0].title}>
                    <Link to={`/new/hosts/${system.display_name}/#Overview`}>
                      {system.display_name}
                    </Link>
                  </Td>
                  <Td dataLabel={columns[1].title}>
                    {system.last_seen ? (
                      <DateFormat
                        date={system.last_seen}
                        extraTitle="Last seen: "
                      />
                    ) : (
                      'N/A'
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}

      <Toolbar id="iop-pathway-systems-toolbar-bottom">
        <ToolbarContent>
          <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={total}
              page={page}
              perPage={perPage}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              variant={PaginationVariant.bottom}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </React.Fragment>
  );
};

IopPathwaySystems.propTypes = {
  pathway: PropTypes.object,
  selectedTags: PropTypes.array,
  workloads: PropTypes.array,
  axios: PropTypes.object,
};

export default IopPathwaySystems;
