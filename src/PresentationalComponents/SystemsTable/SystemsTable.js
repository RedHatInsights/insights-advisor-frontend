/* eslint camelcase: 0 */
import React, { useCallback, useEffect, useState } from 'react';
import { TableToolbar, SimpleTableFilter } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { flatten } from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Pagination, PaginationVariant, Level, LevelItem, InputGroup } from '@patternfly/react-core';
import { cellWidth, sortable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import Loading from '../Loading/Loading';
import Failed from '../Loading/Failed';
import MessageState from '../MessageState/MessageState';
import debounce from '../../Utilities/Debounce';
import messages from '../../Messages';

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
    const [searchText, setSearchText] = useState(null);
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

    const onSetPage = (_event, pageNumber) => {
        const newOffset = pageNumber * limit - limit;
        setOffset(newOffset);
    };

    const onPerPageSelect = (_event, limit) => {
        setLimit(limit);
    };

    const fetchAction = useCallback(() => {
        setOffset(0);
    }, []);

    useEffect(() => {
        if (searchText !== null) {
            fetchSystems(searchText.length && { display_name: searchText, sort });
        }
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
        if (!rows.length) {
            onSort(null, 2, 'desc');
        }
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
                let rows = systems.data.map((value, key) => {
                    return [
                        {
                            isOpen: false,
                            system: value,
                            cells: [
                                {
                                    title: <Link key={key} to={`/systems/${value.system_uuid}`}>
                                        {value.display_name}
                                    </Link>
                                },
                                {
                                    title: <div key={key}> {value.hits}</div>
                                },
                                {
                                    title: <div key={key}>
                                        {moment(value.last_seen).fromNow()}
                                    </div>
                                }
                            ]
                        }
                    ];
                });
                setRows(flatten(rows));
            }
        }
    }, [fetchAction, intl, systems]);

    const renderPagination = (location) => <Pagination
        itemCount={results}
        perPage={limit}
        page={(offset / limit + 1)}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        widgetId={`pagination-options-menu-${location === 'bottom' ? 'bottom' : 'top'}`}
        variant={location === 'bottom' && PaginationVariant.bottom}
    />;

    return <>
        <TableToolbar style={{ justifyContent: 'space-between' }}>
            <Level gutter='md'>
                <LevelItem>
                    <InputGroup>
                        <SimpleTableFilter buttonTitle={null}
                            onFilterChange={setSearchText}
                            placeholder={intl.formatMessage(messages.search)} />
                    </InputGroup>
                </LevelItem>
            </Level>
        </TableToolbar>
        {systemsFetchStatus === 'fulfilled' &&
            <Table aria-label={'rule-table'} sortBy={sortBy} onSort={onSort} cells={cols} rows={rows}>
                <TableHeader />
                <TableBody />
            </Table>
        }
        {systemsFetchStatus === 'pending' && (<Loading />)}
        {systemsFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.systemTableFetchError)} />)}
        <TableToolbar>
            {renderPagination('bottom')}
        </TableToolbar>
    </>;
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
