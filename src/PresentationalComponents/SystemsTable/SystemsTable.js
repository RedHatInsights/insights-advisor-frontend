import './SystemsTable.scss';

import * as AppActions from '../../AppActions';
import * as ReactRedux from 'react-redux';
import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';

import { DEBOUNCE_DELAY, SYSTEM_FILTER_CATEGORIES as SFC } from '../../AppConstants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, useStore } from 'react-redux';
import { filterFetchBuilder, paramParser, pruneFilters, urlBuilder, workloadQueryBuilder } from '../Common/Tables';

import Failed from '../Loading/Failed';
import Loading from '../Loading/Loading';
import PropTypes from 'prop-types';
import SystemsPdf from '../Export/SystemsPdf';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import debounce from '../../Utilities/Debounce';
import downloadReport from '../Common/DownloadHelper';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import { reactCore } from '@redhat-cloud-services/frontend-components-utilities/files/inventoryDependencies';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { systemReducer } from '../../AppReducer';

const SystemsTable = ({ systemsFetchStatus, fetchSystems, systems, intl, filters, setFilters, selectedTags, workloads }) => {
    const inventory = useRef(null);
    const [InventoryTable, setInventory] = useState();
    const store = useStore();
    const results = systems.meta ? systems.meta.count : 0;
    const [searchText, setSearchText] = useState(filters.display_name || '');
    const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
    const [filterBuilding, setFilterBuilding] = useState(true);
    const sortIndices = {
        0: 'display_name',
        1: 'hits',
        2: 'critical_hits',
        3: 'important_hits',
        4: 'moderate_hits',
        5: 'low_hits',
        6: 'last_seen'
    };

    const onSort = ({ index, direction }) => {
        const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
        setFilters({ ...filters, sort: orderParam, offset: 0 });
    };

    const fetchSystemsFn = useCallback(() => {
        let options = selectedTags.length && ({ tags: selectedTags });
        workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });
        fetchSystems({ ...filterFetchBuilder(filters), ...options });
    }, [fetchSystems, filters, selectedTags, workloads]);

    const removeFilterParam = (param) => {
        const filter = { ...filters, offset: 0 };
        param === 'text' && setSearchText('');
        delete filter[param];
        param === 'hits' && filter.hits === undefined && (filter.hits = ['yes']);
        setFilters(filter);
    };

    const addFilterParam = (param, values) => {
        // remove 'yes' from the hits filter if the user chooses any other filters (its always the first item)
        param === 'hits' && values.length > 1 && values.includes('yes') && values.shift();
        values.length > 0 ? setFilters({ ...filters, offset: 0, ...{ [param]: values } }) : removeFilterParam(param);
    };

    const filterConfigItems = [{
        label: intl.formatMessage(messages.name),
        filterValues: {
            key: 'text-filter',
            onChange: (event, value) => setSearchText(value),
            value: searchText
        }
    }, {
        label: SFC.hits.title,
        type: SFC.hits.type,
        id: SFC.hits.urlParam,
        value: `checkbox-${SFC.hits.urlParam}`,
        filterValues: {
            key: `${SFC.hits.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(SFC.hits.urlParam, values),
            value: filters.hits,
            items: SFC.hits.values
        }
    }];

    const buildFilterChips = () => {
        const localFilters = { ...filters };
        localFilters.hits && localFilters.hits.includes('yes') && delete localFilters.hits;
        delete localFilters.sort;
        delete localFilters.offset;
        delete localFilters.limit;

        return pruneFilters(localFilters, SFC);
    };

    const activeFiltersConfig = {
        filters: buildFilterChips(),
        onDelete: (event, itemsToRemove, isAll) => {
            if (isAll) {
                setSearchText('');
                setFilters({ sort: filters.sort, limit: filters.limit, offset: filters.offset, hits: ['yes'] });
            } else {
                itemsToRemove.map(item => {
                    const newFilter = {
                        [item.urlParam]: Array.isArray(filters[item.urlParam]) ?
                            filters[item.urlParam].filter(value => String(value) !== String(item.chips[0].value))
                            : ''
                    };
                    newFilter[item.urlParam].length > 0 ? setFilters({ ...filters, ...newFilter }) : removeFilterParam(item.urlParam);
                });
            }
        }
    };

    const handleRefresh = (options) => {
        if (systemsFetchStatus === 'fulfilled') {
            const { offset, limit } = filters;
            const newOffset = (options.page * options.per_page) - options.per_page;
            if (newOffset !== offset || limit !== options.per_page) {
                setFilters({
                    ...filters,
                    limit: options.per_page,
                    offset: (options.page * options.per_page) - options.per_page
                });
            }
        }
    };

    const calculateSort = () => {
        const sortIndex = Number(Object.entries(sortIndices).find(item => item[1] === filters.sort || `-${item[1]}` === filters.sort)[0]);
        const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
        return {
            index: sortIndex,
            key: sortIndex !== 6 ? sortIndices[sortIndex] : 'updated',
            direction: sortDirection
        };
    };

    useEffect(() => {
        (async () => {
            const rows = [{
                title: intl.formatMessage(messages.name), transforms: [pfReactTable.sortable, pfReactTable.cellWidth(80)], key: 'display_name'
            },
            { title: intl.formatMessage(messages.numberRuleHits), transforms: [pfReactTable.sortable, pfReactTable.wrappable], key: 'hits' },
            { title: intl.formatMessage(messages.critical), transforms: [pfReactTable.sortable, pfReactTable.wrappable], key: 'critical_hits' },
            { title: intl.formatMessage(messages.important), transforms: [pfReactTable.sortable, pfReactTable.wrappable], key: 'important_hits' },
            { title: intl.formatMessage(messages.moderate), transforms: [pfReactTable.sortable, pfReactTable.wrappable], key: 'moderate_hits' },
            { title: intl.formatMessage(messages.low), transforms: [pfReactTable.sortable, pfReactTable.wrappable], key: 'low_hits' },
            { title: intl.formatMessage(messages.lastSeen), transforms: [pfReactTable.sortable, pfReactTable.wrappable], key: 'updated' }];
            const { inventoryConnector, mergeWithEntities, INVENTORY_ACTION_TYPES
            } = await insights.loadInventory({
                ReactRedux,
                react: React,
                reactRouterDom,
                pfReactTable,
                pfReact: reactCore
            });
            getRegistry().register({
                ...mergeWithEntities(
                    systemReducer(
                        [...rows],
                        INVENTORY_ACTION_TYPES
                    )
                )
            });

            const { InventoryTable } = inventoryConnector(store);
            setInventory(() => InventoryTable);
        })();
    }, [intl, store]);

    useEffect(() => {
        filters.display_name === undefined ? setSearchText('') : setSearchText(filters.display_name);
    }, [filters.display_name]);

    useEffect(() => {
        if (!filterBuilding && systemsFetchStatus !== 'pending') {
            const copyFilters = { ...filters };
            delete copyFilters.display_name;
            setFilters({
                ...copyFilters, ...(searchText.length ? { display_name: searchText } : {}), offset: 0
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    useEffect(() => {
        if (window.location.search) {
            const paramsObject = paramParser();
            delete paramsObject.tags;
            paramsObject.sort !== undefined && (paramsObject.sort = paramsObject.sort[0]);
            paramsObject.display_name !== undefined && (paramsObject.display_name = paramsObject.display_name[0]);
            paramsObject.hits === undefined && (paramsObject.hits = ['all']);
            paramsObject.offset === undefined ? paramsObject.offset = 0 : paramsObject.offset = Number(paramsObject.offset[0]);
            paramsObject.limit === undefined ? paramsObject.limit = 10 : paramsObject.limit = Number(paramsObject.limit[0]);
            setFilters({ ...filters, ...paramsObject });
        } else if (filters.limit === undefined || filters.offset === undefined || filters.hits === undefined) {
            setFilters({ ...filters, offset: 0, limit: 10, hits: ['all'] });
        }

        setFilterBuilding(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        urlBuilder(filters, selectedTags, workloads);
    }, [filters, selectedTags, workloads]);

    useEffect(() => {
        !filterBuilding && systemsFetchStatus !== 'pending' && selectedTags !== null && fetchSystemsFn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchSystemsFn, filterBuilding, filters, selectedTags]);

    return InventoryTable ?
        systemsFetchStatus !== 'failed' ?
            <InventoryTable
                ref={inventory}
                items={((systemsFetchStatus !== 'pending' && systems && systems.data) || []).map((system) => ({
                    ...system,
                    id: system.system_uuid
                }))}
                isFullView
                sortBy={calculateSort()}
                onSort={onSort}
                hasCheckbox={false}
                page={filters.offset / filters.limit + 1}
                total={results}
                isLoaded={systemsFetchStatus !== 'pending'}
                perPage={Number(filters.limit)}
                onRefresh={handleRefresh}
                filterConfig={{ items: filterConfigItems }}
                activeFiltersConfig={activeFiltersConfig}
                exportConfig={{
                    onSelect: (_e, fileType) => downloadReport('systems', fileType, urlBuilder(filters, selectedTags)),
                    extraItems: [<li key='download-pd' role="menuitem">
                        <SystemsPdf filters={{ ...filterFetchBuilder(filters) }} selectedTags={selectedTags}
                            systemsCount={systems && systems.meta && systems.meta.count} />
                    </li>]
                }}
            />
            : systemsFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.systemTableFetchError)} />)
        : <Loading />;
};

SystemsTable.propTypes = {
    fetchSystems: PropTypes.func,
    systemsFetchStatus: PropTypes.string,
    systems: PropTypes.object,
    addNotification: PropTypes.func,
    intl: PropTypes.any,
    filters: PropTypes.object,
    setFilters: PropTypes.func,
    selectedTags: PropTypes.array,
    workloads: PropTypes.object
};

const mapStateToProps = ({ AdvisorStore }) => ({
    systems: AdvisorStore.systems,
    systemsFetchStatus: AdvisorStore.systemsFetchStatus,
    filters: AdvisorStore.filtersSystems,
    selectedTags: AdvisorStore.selectedTags,
    workloads: AdvisorStore.workloads
});

const mapDispatchToProps = dispatch => ({
    fetchSystems: (url) => dispatch(AppActions.fetchSystems(url)),
    addNotification: data => dispatch(addNotification(data)),
    setFilters: (filters) => dispatch(AppActions.setFiltersSystems(filters))
});

export default injectIntl(routerParams(connect(mapStateToProps, mapDispatchToProps)(SystemsTable)));
