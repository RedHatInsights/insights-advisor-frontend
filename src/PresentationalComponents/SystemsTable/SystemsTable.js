/* eslint camelcase: 0 */
import * as AppActions from '../../AppActions';
import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, useStore } from 'react-redux';
import { paramParser, urlBuilder } from '../Common/Tables';

import Failed from '../Loading/Failed';
import Loading from '../Loading/Loading';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import debounce from '../../Utilities/Debounce';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { systemReducer } from '../../AppReducer';

const SystemsTable = ({ systemsFetchStatus, fetchSystems, systems, intl, filters, setFilters, selectedTags }) => {
    const inventory = useRef(null);
    const [InventoryTable, setInventory] = useState();
    const store = useStore();
    const results = systems.meta ? systems.meta.count : 0;
    const [searchText, setSearchText] = useState(filters.display_name || '');
    const debouncedSearchText = debounce(searchText, 800);
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
        const options = selectedTags.length && ({ tags: selectedTags.join() });
        fetchSystems({ ...filters, ...options });

    }, [fetchSystems, filters, selectedTags]);

    const filterConfigItems = [{
        label: intl.formatMessage(messages.name),
        filterValues: {
            key: 'text-filter',
            onChange: (event, value) => setSearchText(value),
            value: searchText
        }
    }];

    const activeFiltersConfig = {
        filters: searchText.length > 0 && [({ category: 'Description', chips: [{ name: searchText }] })] || [],
        onDelete: () => setSearchText('')
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
            key: sortIndex !== 2 ? sortIndices[sortIndex] : 'updated',
            direction: sortDirection
        };
    };

    useEffect(() => {
        (async () => {
            const { inventoryConnector, mergeWithEntities, INVENTORY_ACTION_TYPES
            } = await insights.loadInventory({
                react: React,
                reactRouterDom,
                pfReactTable
            });
            getRegistry().register({
                ...mergeWithEntities(
                    systemReducer(
                        [
                            { title: intl.formatMessage(messages.name), transforms: [pfReactTable.sortable], key: 'display_name' },
                            {
                                title: intl.formatMessage(messages.numberRuleHits), transforms: [pfReactTable.sortable, pfReactTable.cellWidth(15)],
                                key: 'hits'
                            },
                            { title: intl.formatMessage(messages.critical), key: 'critical_hits' },
                            { title: intl.formatMessage(messages.important), key: 'important_hits' },
                            { title: intl.formatMessage(messages.moderate), key: 'moderate_hits' },
                            { title: intl.formatMessage(messages.low), key: 'low_hits' },
                            { title: intl.formatMessage(messages.lastSeen), transforms: [pfReactTable.sortable], key: 'updated' }
                        ],
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
        const copyFilters = { ...filters };
        delete copyFilters.display_name;
        setFilters({
            ...copyFilters,
            ...(searchText.length ? { display_name: searchText } : {}),
            offset: 0
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    useEffect(() => {
        if (window.location.search) {
            const paramsObject = paramParser();
            delete paramsObject.tags;
            paramsObject.sort !== undefined && (paramsObject.sort = paramsObject.sort[0]);
            paramsObject.display_name !== undefined && (paramsObject.display_name = paramsObject.display_name[0]);
            paramsObject.offset === undefined ? paramsObject.offset = 0 : paramsObject.offset = Number(paramsObject.offset[0]);
            paramsObject.limit === undefined ? paramsObject.limit = 10 : paramsObject.limit = Number(paramsObject.limit[0]);
            setFilters({ ...filters, ...paramsObject });
        } else if (filters.limit === undefined || filters.offest === undefined) {
            setFilters({ ...filters, offset: 0, limit: 10 });
        }

        setFilterBuilding(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        urlBuilder(filters, selectedTags);
    }, [filters, selectedTags]);

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
    selectedTags: PropTypes.array
};

const mapStateToProps = ({ AdvisorStore }) => ({
    systems: AdvisorStore.systems,
    systemsFetchStatus: AdvisorStore.systemsFetchStatus,
    filters: AdvisorStore.filtersSystems,
    selectedTags: AdvisorStore.selectedTags
});

const mapDispatchToProps = dispatch => ({
    fetchSystems: (url) => dispatch(AppActions.fetchSystems(url)),
    addNotification: data => dispatch(addNotification(data)),
    setFilters: (filters) => dispatch(AppActions.setFiltersSystems(filters))
});

export default injectIntl(routerParams(connect(mapStateToProps, mapDispatchToProps)(SystemsTable)));
