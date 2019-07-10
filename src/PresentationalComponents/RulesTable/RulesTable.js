/* eslint camelcase: 0 */
import React, { useCallback, useEffect, useState } from 'react';
import { Battery, Main, TableToolbar } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { CheckIcon } from '@patternfly/react-icons';
import { flatten } from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Badge, Button, Checkbox, Dropdown, DropdownItem, DropdownPosition, KebabToggle, Pagination, Stack, StackItem } from '@patternfly/react-core';
import { cellWidth, sortable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Filters from '../../PresentationalComponents/Filters/Filters';
import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { ANSIBLE_ICON } from '../../AppSvgs';
import MessageState from '../MessageState/MessageState';
import RuleDetails from '../RuleDetails/RuleDetails';
import debounce from '../../Utilities/Debounce';

const RulesTable = (props) => {
    const { rules, filters, rulesFetchStatus, setFilters, fetchRules, addNotification } = props;
    const [summary, setSummary] = useState('');
    const [cols] = useState([
        { title: 'Rule', transforms: [sortable] },
        { title: 'Added', transforms: [sortable, cellWidth(15)] },
        { title: 'Total Risk', transforms: [sortable] },
        { title: 'Systems', transforms: [sortable] },
        { title: <span className='ansibleCol'>{ANSIBLE_ICON} Ansible</span>, transforms: [sortable] }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [sort, setSort] = useState('-publish_date');
    const [impacting, setImpacting] = useState(filters.impacting);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [isKebabOpen, setIsKebabOpen] = useState(false);
    const results = rules.meta ? rules.meta.count : 0;
    const debouncedOffset = debounce(offset, 800);

    const onSort = useCallback((_event, index, direction) => {
        const attrIndex = {
            1: 'description',
            2: 'publish_date',
            3: 'total_risk',
            4: 'impacted_count',
            5: 'playbook_count'
        };
        const orderParam = `${direction === 'asc' ? '' : '-'}${attrIndex[index]}`;

        setSortBy({ index, direction });
        setSort(orderParam);
        setOffset(0);

        fetchRules({
            ...filters,
            offset: 0,
            limit,
            impacting,
            sort: orderParam
        });
    }, [fetchRules, filters, impacting, limit]);

    const onSetPage = (_event, pageNumber) => {
        const newOffset = pageNumber * limit - limit;
        setOffset(newOffset);
    };

    const onPerPageSelect = (_event, limit) => {
        setLimit(limit);
        fetchRules({ ...filters, offset, limit, impacting, sort });
    };

    const toggleRulesWithHits = (impacting) => {
        setFilters({ ...filters, impacting });
        setImpacting(impacting);
        setOffset(0);
        fetchRules({
            ...filters,
            offset: 0,
            limit,
            impacting
        });
    };

    const handleOnCollapse = (event, rowId, isOpen) => {
        const collapseRows = [...rows];
        collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
        setRows(collapseRows);
    };

    const hideReports = async (rowId) => {
        const rule = rows[rowId].rule;
        try {
            if (rule.reports_shown) {
                await API.post(`${BASE_URL}/ack/`, { rule_id: rule.rule_id });

            } else {
                await API.delete(`${BASE_URL}/ack/${rule.rule_id}/`);
            }

            fetchRules({
                ...filters,
                offset: 0,
                limit,
                impacting
            });
        } catch (error) {
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: rule.reports_shown ? 'Disabling reports failed' : 'Enabling reports failed',
                description: `For rule: ${rule.description}`
            });
        }
    };

    const actionResolver = (rowData, { rowIndex }) => {
        const rule = rows[rowIndex].rule ? rows[rowIndex].rule : null;
        if (rowIndex % 2 !== 0 || !rule) {
            return null;
        }

        return rule && rule.reports_shown ?
            [{
                title: 'Disable Rule',
                onClick: (event, rowId) => hideReports(rowId)
            }]
            : [{
                title: 'Enable Rule',
                onClick: (event, rowId) => hideReports(rowId)
            }];
    };

    const fetchAction = useCallback((filters) => {
        setOffset(0);
        fetchRules({ ...filters, limit, offset: 0, impacting, sort });
    }, [fetchRules, impacting, limit, sort]);

    useEffect(() => {
        fetchRules({
            ...filters,
            offset,
            limit,
            impacting,
            sort
        });
    }, [debouncedOffset]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!rows.length) {
            onSort(null, 2, 'desc');
        }
    }, [onSort, rows]);

    useEffect(() => {
        if (rules.data) {
            setSummary(rules.data.summary);
            if (rules.data.length === 0) {
                setRows([{
                    cells: [{
                        title: (
                            <MessageState icon={ CheckIcon } title='No rule hits'
                                text={ `None of your connected systems are affected by
                                    ${ filters.reports_shown ? 'enabled rules.' : 'any known rules.'}` }>
                                {filters.reports_shown && <Button variant="link" style={ { paddingTop: 24 } } onClick={ () => {
                                    setFilters({ ...filters, reports_shown: undefined });
                                    fetchAction({ ...filters, reports_shown: undefined });
                                } }>
                                    Include disabled rules
                                </Button>}
                            </MessageState>),
                        props: { colSpan: 5 }
                    }]
                }]
                );
            } else {
                let rows = rules.data.map((value, key) => {
                    return [
                        {
                            isOpen: false,
                            rule: value,
                            cells: [
                                {
                                    title: value.reports_shown ?
                                        <Link key={ key } to={ `/rules/${value.rule_id}` }>
                                            {value.description}
                                        </Link>
                                        : <span key={ key }> <Badge isRead>Disabled</Badge> {value.description}</span>

                                },
                                {
                                    title: <div key={ key }>
                                        {moment(value.publish_date).fromNow()}
                                    </div>
                                },
                                {
                                    title: <div className="pf-m-center" key={ key } style={ { verticalAlign: 'top' } }>
                                        <Battery
                                            label='Total Risk'
                                            labelHidden
                                            severity={ value.total_risk }
                                        />
                                    </div>
                                },
                                {
                                    title: <div key={ key }> {value.reports_shown ?
                                        `${value.impacted_systems_count.toLocaleString()}`
                                        : 'N/A'}</div>
                                },
                                {
                                    title: <div className="pf-m-center " key={ key }>
                                        {value.playbook_count ? <CheckIcon className='ansibleCheck' /> : null}
                                    </div>
                                }
                            ]
                        },
                        {
                            parent: key * 2,
                            fullWidth: true,
                            cells: [{ title: <Main className='pf-m-light'> <RuleDetails rule={ value } /></Main> }]
                        }
                    ];
                });
                setRows(flatten(rows));
            }
        }
    }, [fetchAction, filters, rules, setFilters]);

    return <Main>
        <Stack gutter='md'>
            <StackItem>
                <p>{summary}</p>
            </StackItem>
            <StackItem>
                <TableToolbar style={ { justifyContent: 'space-between' } }>
                    <Filters
                        fetchAction={ fetchAction }
                        searchPlaceholder='Find a rule...'
                        results={ results }
                    >
                        <Dropdown
                            position={ DropdownPosition.left }
                            toggle={ <KebabToggle onToggle={ isOpen => { setIsKebabOpen(isOpen); } } /> }
                            onSelect={ () => { setIsKebabOpen(false); } }
                            isOpen={ isKebabOpen }
                            isPlain
                            dropdownItems={ [
                                <DropdownItem value='json' href={ `${BASE_URL}/export/hits.json/` } key="export json"
                                    aria-label='export data json'>
                                    Export as JSON
                                </DropdownItem>,
                                <DropdownItem value='csv' href={ `${BASE_URL}/export/hits.csv/` } key="export csv"
                                    aria-label='export data csv'>
                                    Export as CSV
                                </DropdownItem>
                            ] }
                        />
                        <Checkbox
                            label="Show Rules With Hits"
                            isChecked={ impacting }
                            onChange={ toggleRulesWithHits }
                            aria-label="InsightsRulesHideHits"
                            id="InsightsRulesHideHits"
                        />
                        <Pagination
                            itemCount={ results }
                            onPerPageSelect={ onPerPageSelect }
                            onSetPage={ onSetPage }
                            page={ (offset / limit + 1) }
                            perPage={ limit }
                        />
                    </Filters>
                </TableToolbar>
                {rulesFetchStatus === 'fulfilled' &&
                    <Table aria-label={ 'rule-table' }
                        actionResolver={ actionResolver } onCollapse={ handleOnCollapse } sortBy={ sortBy }
                        onSort={ onSort } cells={ cols } rows={ rows }>
                        <TableHeader />
                        <TableBody />
                    </Table>}
                {rulesFetchStatus === 'pending' && (<Loading />)}
                {rulesFetchStatus === 'failed' && (<Failed message={ `There was an error fetching rules list.` } />)}
                <TableToolbar className='pf-c-pagination'>
                    <Pagination
                        itemCount={ results }
                        onPerPageSelect={ onPerPageSelect }
                        onSetPage={ onSetPage }
                        page={ (offset / limit + 1) }
                        perPage={ limit }
                    />
                </TableToolbar>
            </StackItem>
        </Stack>
    </Main>;
};

RulesTable.propTypes = {
    fetchRules: PropTypes.func,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object,
    filters: PropTypes.object,
    addNotification: PropTypes.func,
    setFilters: PropTypes.func,
    history: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    filters: state.AdvisorStore.filters,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRules: (url) => dispatch(AppActions.fetchRules(url)),
    addNotification: data => dispatch(addNotification(data)),
    setFilters: (filters) => dispatch(AppActions.setFilters(filters))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(RulesTable));
