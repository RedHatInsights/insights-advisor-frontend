/* eslint camelcase: 0 */
import * as AppActions from '../../AppActions';

import { Pagination, PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader, cellWidth, sortable } from '@patternfly/react-table';
import { paramParser, urlBuilder } from '../Common/Tables';

import { DateFormat } from '@redhat-cloud-services/frontend-components/components/DateFormat';
import Failed from '../Loading/Failed';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading';
import MessageState from '../MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/components/PrimaryToolbar';
import PropTypes from 'prop-types';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/components/TableToolbar';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const SystemsTable = ({ systemsFetchStatus, fetchSystems, systems, intl, filters, setFilters, history, selectedTags }) => {
    const [cols] = useState([
        { title: intl.formatMessage(messages.name), transforms: [sortable] },
        { title: intl.formatMessage(messages.numberRuleHits), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.lastSeen), transforms: [sortable] }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const results = systems.meta ? systems.meta.count : 0;
    const [searchText, setSearchText] = useState(filters.display_name || '');
    const debouncedSearchText = debounce(searchText, 800);
    const [filterBuilding, setFilterBuilding] = useState(true);

    const sortIndices = {
        0: 'display_name',
        1: 'hits',
        2: 'last_seen'
    };

    const onSort = (_event, index, direction) => {
        const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
        setSortBy({ index, direction });
        setFilters({ ...filters, sort: orderParam, offset: 0 });
    };

    const onSetPage = (pageNumber) => {
        const newOffset = pageNumber * filters.limit - filters.limit;
        setFilters({ ...filters, offset: newOffset });
    };

    useEffect(() => {
        filters.display_name === undefined ? setSearchText('') : setSearchText(filters.display_name);
    }, [filters.display_name]);

    useEffect(() => {
        const filter = { ...filters };
        const text = searchText.length ? { display_name: searchText } : {};
        delete filter.display_name;
        setFilters({ ...filter, ...text });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    useEffect(() => {
        if (history.location.search) {
            const paramsObject = paramParser(history);
            paramsObject.sort !== undefined && (paramsObject.sort = paramsObject.sort[0]);
            paramsObject.display_name !== undefined && (paramsObject.display_name = paramsObject.display_name[0]);
            paramsObject.offset === undefined ? paramsObject.offset = 0 : paramsObject.offset = Number(paramsObject.offset[0]);
            paramsObject.limit === undefined ? paramsObject.limit = 10 : paramsObject.limit = Number(paramsObject.limit[0]);

            setFilters({ ...paramsObject });
        }

        setFilterBuilding(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        urlBuilder(filters, history);
    }, [filters, history]);

    useEffect(() => {
        if (filters.sort !== undefined) {
            const sortIndex = Number(Object.entries(sortIndices).find(item => item[1] === filters.sort || `-${item[1]}` === filters.sort)[0]);
            const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
            setSortBy({ index: sortIndex, direction: sortDirection });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.sort]);

    useEffect(() => {
        if (!filterBuilding) {
            const options = selectedTags.length && ({ tags: selectedTags.join() });

            filters.limit || filters.offest === undefined && setFilters({ ...filters, offset: 0, limit: 10 });

            fetchSystems({
                offset: filters.offset,
                limit: filters.limit,
                ...filters,
                ...options
            });
        }
    }, [fetchSystems, filters, filterBuilding, setFilters, selectedTags]);

    useEffect(() => {
        if (systems.data) {
            if (!systems.meta.count) {
                setRows([{
                    cells: [{
                        title: (<MessageState icon={SearchIcon}
                            title={intl.formatMessage(messages.noHitsTitle, { item: intl.formatMessage(messages.systems).toLowerCase() })}
                            text={intl.formatMessage(messages.noHitsBody, { item: intl.formatMessage(messages.systems).toLowerCase() })} />),
                        props: { colSpan: 5 }
                    }]
                }]);
            } else {
                const rows = systems.data.flatMap((value, key) => ([{
                    isOpen: false,
                    system: value,
                    cells: [
                        {
                            title: <Link key={key} to={`/recommendations/systems/${value.system_uuid}`}>
                                {value.display_name}
                            </Link>
                        }, {
                            title: <div key={key}> {value.hits}</div>
                        }, {

                            title: <DateFormat key={key} date={value.last_seen} variant='relative' />
                        }
                    ]
                }
                ]));
                setRows(rows.asMutable());
            }
        }
    }, [intl, systems]);

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

    return <React.Fragment>
        <PrimaryToolbar
            pagination={{
                itemCount: results,
                page: filters.offset / filters.limit + 1,
                perPage: Number(filters.limit),
                onSetPage(event, page) { onSetPage(page); },
                onPerPageSelect(event, perPage) { setFilters({ ...filters, limit: perPage, offset: 0 }); },
                isCompact: false
            }}
            filterConfig={{ items: filterConfigItems }}
            activeFiltersConfig={activeFiltersConfig}
        />
        {systemsFetchStatus === 'fulfilled' &&
            <Table aria-label={'rule-table'} sortBy={sortBy} onSort={onSort} cells={cols} rows={rows}>
                <TableHeader />
                <TableBody />
            </Table>
        }
        {systemsFetchStatus === 'pending' && (<Loading />)}
        {systemsFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.systemTableFetchError)} />)}
        <TableToolbar>
            <Pagination
                itemCount={results}
                perPage={Number(filters.limit)}
                page={(filters.offset / filters.limit + 1)}
                onSetPage={(event, page) => { onSetPage(page); }}
                onPerPageSelect={(event, perPage) => { setFilters({ ...filters, limit: perPage, offset: 0 }); }}
                widgetId={`pagination-options-menu-bottom`}
                variant={PaginationVariant.bottom}
            />
        </TableToolbar>
    </React.Fragment>;
};

SystemsTable.propTypes = {
    fetchSystems: PropTypes.func,
    systemsFetchStatus: PropTypes.string,
    systems: PropTypes.object,
    addNotification: PropTypes.func,
    history: PropTypes.object,
    intl: PropTypes.any,
    filters: PropTypes.object,
    setFilters: PropTypes.func,
    selectedTags: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
    systems: state.AdvisorStore.systems,
    systemsFetchStatus: state.AdvisorStore.systemsFetchStatus,
    filters: state.AdvisorStore.filtersSystems,
    selectedTags: state.AdvisorStore.selectedTags,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchSystems: (url) => dispatch(AppActions.fetchSystems(url)),
    addNotification: data => dispatch(addNotification(data)),
    setFilters: (filters) => dispatch(AppActions.setFiltersSystems(filters))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(SystemsTable)));
