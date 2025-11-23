import {
  DEBOUNCE_DELAY,
  FILTER_CATEGORIES as FC,
  PATHWAYS_FILTER_CATEGORIES as PFC,
} from '../../AppConstants';
import { useLocation } from 'react-router-dom';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';

import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import React, { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import {
  filterFetchBuilder,
  paramParser,
  pruneFilters,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import CategoryLabel from '../Labels/CategoryLabel';
import MessageState from '../MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import RecommendationLevel from '../Labels/RecommendationLevel';
import RuleLabels from '../Labels/RuleLabels';
import { SearchIcon } from '@patternfly/react-icons';
import debounce from '../../Utilities/Debounce';
import messages from '../../Messages';
import { updatePathFilters } from '../../Services/Filters';
import { useGetPathwaysQuery } from '../../Services/Pathways';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import { SkeletonTable } from '@patternfly/react-component-groups';

const PathwaysTable = ({ isTabActive }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const filters = useSelector(({ filters }) => filters.pathState);
  const setFilters = (filters) => dispatch(updatePathFilters(filters));
  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
  const {
    data: pathways = [],
    isFetching,
    isLoading,
    isError,
  } = useGetPathwaysQuery({
    ...filterFetchBuilder(filters),
    ...options,
  });

  const sortIndices = {
    0: 'name',
    // 1: 'category',
    2: 'impacted_systems_count',
    // 3: 'reboot_required',
    4: 'recommendation_level',
  };
  const [sortBy, setSortBy] = useState({});
  const [filterBuilding, setFilterBuilding] = useState(true);
  const [searchText, setSearchText] = useState(filters?.text || '');
  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);

  const onSort = (_event, index, direction) => {
    const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
    setSortBy({ index, direction });
    setFilters({ ...filters, sort: orderParam, offset: 0 });
  };

  const onSetPage = (pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    setFilters({ ...filters, offset: newOffset });
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, { ...FC, ...PFC });
  };

  const buildRows = (pathways) => {
    if (!pathways || pathways.length === 0) {
      return (
        <Tr>
          <Td colSpan={5}>
            <MessageState
              icon={SearchIcon}
              title={intl.formatMessage(messages.noResults)}
              text={intl.formatMessage(messages.adjustFilters)}
            />
          </Td>
        </Tr>
      );
    }

    return pathways.map((pathway) => (
      <Tr key={pathway.slug}>
        <Td dataLabel={intl.formatMessage(messages.pathwaysName)}>
          <span>
            <Link to={`/recommendations/pathways/${pathway.slug}`}>
              {pathway.name}
            </Link>
            {pathway.has_incident && (
              <RuleLabels rule={{ tags: 'incident' }} intl={intl} isCompact />
            )}
          </span>
        </Td>
        <Td dataLabel={intl.formatMessage(messages.category)}>
          <CategoryLabel labelList={pathway.categories} isCompact />
        </Td>
        <Td dataLabel={intl.formatMessage(messages.systems)}>
          <Link to={`/recommendations/pathways/${pathway.slug}`}>
            {pathway.impacted_systems_count.toLocaleString()}
          </Link>
        </Td>
        <Td dataLabel={intl.formatMessage(messages.reboot)}>
          {intl.formatMessage(
            pathway.reboot_required ? messages.required : messages.notRequired,
          )}
        </Td>
        <Td dataLabel={intl.formatMessage(messages.reclvl)}>
          <RecommendationLevel recLvl={pathway.recommendation_level} />
        </Td>
      </Tr>
    ));
  };

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
      type: conditionalFilterType.text,
      filterValues: {
        onChange: (_event, value) => setSearchText(value),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: FC.category.title,
      type: conditionalFilterType.checkbox,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(FC.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
    {
      label: PFC.has_incident.title,
      type: conditionalFilterType.checkbox,
      id: PFC.has_incident.urlParam,
      value: `checkbox-${PFC.has_incident.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(PFC.has_incident.urlParam, values),
        value: filters.has_incident,
        items: PFC.has_incident.values,
      },
    },
    {
      label: PFC.reboot_required.title,
      type: conditionalFilterType.checkbox,
      id: PFC.reboot_required.urlParam,
      value: `checkbox-${PFC.reboot_required.urlParam}`,
      filterValues: {
        onChange: (_event, values) =>
          addFilterParam(PFC.reboot_required.urlParam, values),
        value: filters.reboot_required,
        items: PFC.reboot_required.values,
      },
    },
  ];

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        setSearchText('');
        setFilters({
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

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(filters, selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTags, workloads, SID]);

  useEffect(() => {
    if (isTabActive && search && filterBuilding) {
      const paramsObject = paramParser();
      delete paramsObject.tags;

      paramsObject.text === undefined
        ? setSearchText('')
        : setSearchText(paramsObject.text);
      paramsObject.sort =
        paramsObject.sort === undefined ||
        !Object.values(sortIndices).includes(paramsObject?.sort[0])
          ? '-impacted_systems_count'
          : paramsObject.sort[0];
      paramsObject.offset === undefined
        ? (paramsObject.offset = 0)
        : (paramsObject.offset = Number(paramsObject.offset[0]));
      paramsObject.limit === undefined
        ? (paramsObject.limit = 20)
        : (paramsObject.limit = Number(paramsObject.limit[0]));
      paramsObject.reboot_required !== undefined &&
        !Array.isArray(paramsObject.reboot_required) &&
        (paramsObject.reboot_required = [`${paramsObject.reboot_required}`]);

      setFilters({ ...filters, ...paramsObject });
    }

    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filters.sort !== undefined && sortIndices) {
      let sortInput = filters.sort;
      const sortIndex = Number(
        Object.entries(sortIndices).find(
          (item) => item[1] === sortInput || `-${item[1]}` === sortInput,
        )[0],
      );
      const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
      setSortBy({ index: sortIndex, direction: sortDirection });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort]);

  useEffect(() => {
    if (!filterBuilding && !isLoading) {
      const filter = { ...filters };
      const text = searchText.length ? { text: searchText } : {};
      delete filter.text;
      setFilters({ ...filter, ...text, offset: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  return (
    <React.Fragment>
      <PrimaryToolbar
        pagination={{
          itemCount: pathways?.meta?.count || 0,
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
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {isFetching ? (
        <SkeletonTable
          columns={[
            intl.formatMessage(messages.pathwaysName),
            intl.formatMessage(messages.category),
            intl.formatMessage(messages.systems),
            intl.formatMessage(messages.reboot),
            intl.formatMessage(messages.reclvl),
          ]}
          variant="compact"
        />
      ) : isError ? (
        <Table>
          <ErrorState />
        </Table>
      ) : (
        <Table
          aria-label="pathways-table"
          ouiaId="pathways-table"
          variant="compact"
          isStickyHeader
        >
          <Thead>
            <Tr>
              <Th
                sort={{
                  sortBy,
                  onSort,
                  columnIndex: 0,
                }}
                width={45}
              >
                {intl.formatMessage(messages.pathwaysName)}
              </Th>
              <Th>{intl.formatMessage(messages.category)}</Th>
              <Th
                sort={{
                  sortBy,
                  onSort,
                  columnIndex: 2,
                }}
                width={10}
              >
                {intl.formatMessage(messages.systems)}
              </Th>
              <Th>{intl.formatMessage(messages.reboot)}</Th>
              <Th
                sort={{
                  sortBy,
                  onSort,
                  columnIndex: 4,
                }}
                width={20}
                info={{
                  tooltip: intl.formatMessage(messages.reclvldetails),
                  tooltipProps: {
                    isContentLeftAligned: true,
                  },
                }}
              >
                {intl.formatMessage(messages.reclvl)}
              </Th>
            </Tr>
          </Thead>
          <Tbody>{buildRows(pathways?.data)}</Tbody>
        </Table>
      )}
      <TableToolbar isFooter>
        <Pagination
          ouiaId="page"
          itemCount={pathways?.meta?.count || 0}
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
      </TableToolbar>
    </React.Fragment>
  );
};

PathwaysTable.propTypes = {
  isTabActive: PropTypes.bool,
};

export default PathwaysTable;
