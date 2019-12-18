import * as AppActions from '../../AppActions';

import { Pagination, PaginationVariant } from '@patternfly/react-core';
import { PrimaryToolbar, TableToolbar } from '@redhat-cloud-services/frontend-components';
/* eslint camelcase: 0 */
import React, { useCallback, useEffect, useState } from 'react';
import { Table, TableBody, TableHeader, cellWidth, sortable } from '@patternfly/react-table';

import Failed from '../Loading/Failed';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading';
import MessageState from '../MessageState/MessageState';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import moment from 'moment';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const SystemsTable = ({ systemsFetchStatus, fetchSystems, systems, intl }) => {
    const [cols] = useState([
        { title: intl.formatMessage(messages.name), transforms: [sortable] },
        { title: intl.formatMessage(messages.numberRuleHits), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.lastSeen), transforms: [sortable] }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [sort, setSort] = useState('-last_seen');
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const results = systems.meta ? systems.meta.count : 0;
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = debounce(searchText, 800);

    const onSort = useCallback((_event, index, direction) => {
        const attrIndex = {
            0: 'display_name',
            1: 'hits',
            2: 'last_seen'
        };
        const orderParam = `${direction === 'asc' ? '' : '-'}${attrIndex[index]}`;
        setSortBy({ index, direction });
        setSort(orderParam);
        setOffset(0);
    }, [setSort, setSortBy, setOffset]);

    const onSetPage = (pageNumber) => {
        const newOffset = pageNumber * limit - limit;
        setOffset(newOffset);
    };

    const fetchAction = useCallback(() => {
        setOffset(0);
    }, []);

    useEffect(() => {
        fetchSystems(searchText.length && { display_name: searchText, sort });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    useEffect(() => {
        fetchSystems({
            offset,
            limit,
            sort
        });
    }, [fetchSystems, limit, offset, sort]);

    useEffect(() => {
        !rows.length && onSort(null, 2, 'desc');
    }, [onSort, rows.length]);

    useEffect(() => {
        if (systems.data) {
            if (!systems.meta.count) {
                setRows([{
                    cells: [{
                        title: (
                            <MessageState icon='none' title={intl.formatMessage(messages.systemTableNoHitsTitle)}
                                text={intl.formatMessage(messages.systemTableNoHitsEnabledRulesBody)}>
                            </MessageState>),
                        props: { colSpan: 5 }
                    }]
                }]);
            } else {
                const rows = systems.data.flatMap((value, key) => ([{
                    isOpen: false,
                    system: value,
                    cells: [
                        {
                            title: <Link key={key} to={`/rules/systems/${value.system_uuid}`}>
                                {value.display_name}
                            </Link>
                        }, {
                            title: <div key={key}> {value.hits}</div>
                        }, {
                            title: <div key={key}>
                                {moment(value.last_seen).fromNow()}
                            </div>
                        }
                    ]
                }
                ]));
                setRows(rows.asMutable());
            }
        }
    }, [fetchAction, intl, systems]);

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
                page: offset / limit + 1,
                perPage: limit,
                onSetPage(event, page) { onSetPage(page); },
                onPerPageSelect(event, perPage) { setLimit(perPage); },
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
                perPage={limit}
                page={(offset / limit + 1)}
                onSetPage={(event, page) => { onSetPage(page); }}
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
    intl: PropTypes.any
};

const mapStateToProps = (state, ownProps) => ({
    systems: state.AdvisorStore.systems,
    systemsFetchStatus: state.AdvisorStore.systemsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchSystems: (url) => dispatch(AppActions.fetchSystems(url)),
    addNotification: data => dispatch(addNotification(data))
});

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(SystemsTable)));
