/* eslint camelcase: 0 */
import React, { useCallback, useEffect, useState } from 'react';
import { Battery, Main, TableToolbar } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { AnsibeTowerIcon, CheckIcon, ExportIcon } from '@patternfly/react-icons';
import { flatten } from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Badge, Button, Checkbox, Dropdown, DropdownItem, DropdownPosition, KebabToggle,
    Pagination, PaginationVariant
} from '@patternfly/react-core';
import { cellWidth, sortable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Filters from '../../PresentationalComponents/Filters/Filters';
import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import MessageState from '../MessageState/MessageState';
import RuleDetails from '../RuleDetails/RuleDetails';
import messages from '../../Messages';

const RulesTable = ({ rules, filters, rulesFetchStatus, setFilters, fetchRules, addNotification, history, intl }) => {
    const [cols] = useState([
        { title: intl.formatMessage(messages.rulesTableColumnTitleRule), transforms: [sortable] },
        { title: intl.formatMessage(messages.rulesTableColumnTitleAdded), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.rulesTableColumnTitleTotalrisk), transforms: [sortable] },
        { title: intl.formatMessage(messages.systems), transforms: [sortable] },
        {
            title: <><AnsibeTowerIcon size='md' /> {intl.formatMessage(messages.rulesTableColumnTitleAnsible)}</>,
            transforms: [sortable],
            dataLabel: intl.formatMessage(messages.rulesTableColumnTitleAnsible)
        }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [sort, setSort] = useState('-publish_date');
    const [impacting, setImpacting] = useState(filters.impacting);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [isKebabOpen, setIsKebabOpen] = useState(false);
    const [filterBuilding, setFilterBuilding] = useState(true);

    const results = rules.meta ? rules.meta.count : 0;

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
    }, [setSort, setSortBy, setOffset]);

    const onSetPage = (_event, pageNumber) => {
        const newOffset = pageNumber * limit - limit;
        setOffset(newOffset);
    };

    const onPerPageSelect = (_event, limit) => {
        setLimit(limit);
    };

    const toggleRulesWithHits = (impacting) => {
        setFilters({ ...filters, impacting });
        setImpacting(impacting);
        setOffset(0);
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
                impacting,
                sort
            });
        } catch (error) {
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: rule.reports_shown ? intl.formatMessage(messages.rulesTableHideReportsErrorDisabled)
                    : intl.formatMessage(messages.rulesTableHideReportsErrorEnabled),
                description: intl.formatMessage(messages.rulesTableHideReportsErrorBody, { ruleName: rule.description })
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
                title: intl.formatMessage(messages.rulesTableActionDisableRule),
                onClick: (event, rowId) => hideReports(rowId)
            }]
            : [{
                title: intl.formatMessage(messages.rulesTableActionEnableRule),
                onClick: (event, rowId) => hideReports(rowId)
            }];
    };

    const fetchAction = useCallback(() => {
        setOffset(0);
    }, []);

    useEffect(() => {
        if (history.location.search) {
            const searchParams = new URLSearchParams(history.location.search);
            const paramsObject = Array.from(searchParams).reduce((acc, [key, value]) => ({
                ...acc, [key]: (value === 'true' || value === 'false') ? JSON.parse(value) : value
            }), {});
            let showAllRules = {};
            if (paramsObject.reports_shown === 'undefined') {
                showAllRules = { reports_shown: undefined };
            }

            setImpacting(paramsObject.impacting);
            setFilters({ ...paramsObject, ...showAllRules });
        }

        setFilterBuilding(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const queryString = Object.keys(filters).map(key => key + '=' + filters[key]).join('&');
        history.replace({
            search: `?${queryString}`
        });
    }, [filters, history]);

    useEffect(() => {
        if (!filterBuilding) {
            fetchRules({
                ...filters,
                offset,
                limit,
                sort
            });
        }

    }, [fetchRules, filterBuilding, filters, limit, offset, sort]);

    useEffect(() => {
        if (!rows.length) {
            onSort(null, 2, 'desc');
        }
    }, [onSort, rows.length]);

    useEffect(() => {
        if (rules.data) {
            if (rules.data.length === 0) {
                setRows([{
                    cells: [{
                        title: (
                            <MessageState icon={CheckIcon} title={intl.formatMessage(messages.rulesTableNoRuleHitsTitle)}
                                text={filters.reports_shown ?
                                    intl.formatMessage(messages.rulesTableNoRuleHitsEnabledRulesBody) :
                                    intl.formatMessage(messages.rulesTableNoRuleHitsAnyRulesBody)}>
                                {filters.reports_shown && <Button variant="link" style={{ paddingTop: 24 }} onClick={() => {
                                    setFilters({ ...filters, reports_shown: undefined });
                                    fetchAction();
                                }}>
                                    {intl.formatMessage(messages.rulesTableNoRuleHitsAddDisabledButton)}
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
                                        <Link key={key} to={`/rules/${value.rule_id}`}>
                                            {value.description}
                                        </Link>
                                        : <span key={key}> <Badge isRead>{intl.formatMessage(messages.disabled)}</Badge> {value.description}</span>

                                },
                                {
                                    title: <div key={key}>
                                        {moment(value.publish_date).fromNow()}
                                    </div>
                                },
                                {
                                    title: <div className="pf-m-center" key={key} style={{ verticalAlign: 'top' }}>
                                        <Battery
                                            label={intl.formatMessage(messages.rulesTableColumnTitleTotalrisk)}
                                            labelHidden
                                            severity={value.total_risk}
                                        />
                                    </div>
                                },
                                {
                                    title: <div key={key}> {value.reports_shown ?
                                        `${value.impacted_systems_count.toLocaleString()}`
                                        : intl.formatMessage(messages.notapplicable)}</div>
                                },
                                {
                                    title: <div className="pf-m-center " key={key}>
                                        {value.playbook_count ? <CheckIcon className='ansibleCheck' /> : null}
                                    </div>
                                }
                            ]
                        },
                        {
                            parent: key * 2,
                            fullWidth: true,
                            cells: [{ title: <Main className='pf-m-light'> <RuleDetails rule={value} /></Main> }]
                        }
                    ];
                });
                setRows(flatten(rows));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAction, filters, rules, setFilters]);

    const renderPagination = (location) => <Pagination
        itemCount={results}
        perPage={limit}
        page={(offset / limit + 1)}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        widgetId={`pagination-options-menu-${location === 'bottom' ? 'bottom' : 'top'}`}
        variant={location === 'bottom' ? PaginationVariant.bottom : null}
    />;

    return <>
        <TableToolbar style={{ justifyContent: 'space-between' }}>
            <Filters
                fetchAction={fetchAction}
                searchPlaceholder={intl.formatMessage(messages.rulesTableFilterInputText)}
                results={results}
            >
                <Dropdown
                    position={DropdownPosition.left}
                    toggle={<KebabToggle onToggle={isOpen => { setIsKebabOpen(isOpen); }} />}
                    onSelect={() => { setIsKebabOpen(false); }}
                    isOpen={isKebabOpen}
                    isPlain
                    dropdownItems={[
                        <DropdownItem value='json' href={`${BASE_URL}/export/hits.json/`} key="export json"
                            aria-label='export data json'>
                            <ExportIcon /> {intl.formatMessage(messages.rulesTableActionExportJson)}
                        </DropdownItem>,
                        <DropdownItem value='csv' href={`${BASE_URL}/export/hits.csv/`} key="export csv"
                            aria-label='export data csv'>
                            <ExportIcon /> {intl.formatMessage(messages.rulesTableActionExportCsv)}
                        </DropdownItem>
                    ]}
                />
                <Checkbox
                    label={intl.formatMessage(messages.rulesTableActionShowrulehits)}
                    isChecked={impacting}
                    onChange={toggleRulesWithHits}
                    aria-label="InsightsRulesHideHits"
                    id="InsightsRulesHideHits"
                />
                {renderPagination()}
            </Filters>
        </TableToolbar>
        {rulesFetchStatus === 'fulfilled' &&
            <Table aria-label={'rule-table'}
                actionResolver={actionResolver} onCollapse={handleOnCollapse} sortBy={sortBy}
                onSort={onSort} cells={cols} rows={rows}>
                <TableHeader />
                <TableBody />
            </Table>}
        {rulesFetchStatus === 'pending' && (<Loading />)}
        {rulesFetchStatus === 'failed' && (<Failed message={intl.formatMessage(messages.rulesTableFetchRulesError)} />)}
        <TableToolbar>
            {renderPagination('bottom')}
        </TableToolbar>
    </>;
};

RulesTable.propTypes = {
    fetchRules: PropTypes.func,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object,
    filters: PropTypes.object,
    addNotification: PropTypes.func,
    setFilters: PropTypes.func,
    history: PropTypes.object,
    intl: PropTypes.any
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

export default injectIntl(routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(RulesTable)));
