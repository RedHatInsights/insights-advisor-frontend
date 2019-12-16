import * as AppActions from '../../AppActions';
import * as AppConstants from '../../AppConstants';

import { AnsibeTowerIcon, BellSlashIcon, CheckCircleIcon, CheckIcon } from '@patternfly/react-icons';
import { Badge, Button, Pagination, PaginationVariant, Stack, StackItem, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Battery, Main, PrimaryToolbar, TableToolbar } from '@redhat-cloud-services/frontend-components';
/* eslint camelcase: 0 */
import React, { useCallback, useEffect, useState } from 'react';
import { Table, TableBody, TableHeader, cellWidth, sortable } from '@patternfly/react-table';

import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import DisableRule from '../Modals/DisableRule';
import { FILTER_CATEGORIES as FC } from '../../AppConstants';
import Failed from '../../PresentationalComponents/Loading/Failed';
import { Link } from 'react-router-dom';
import Loading from '../../PresentationalComponents/Loading/Loading';
import MessageState from '../MessageState/MessageState';
import PropTypes from 'prop-types';
import RuleDetails from '../RuleDetails/RuleDetails';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import moment from 'moment';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';

const RulesTable = ({ rules, filters, rulesFetchStatus, setFilters, fetchRules, addNotification, history, intl }) => {
    const [cols] = useState([
        { title: intl.formatMessage(messages.description), transforms: [sortable] },
        { title: intl.formatMessage(messages.added), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.totalRisk), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.systems), transforms: [sortable] },
        {
            title: <><AnsibeTowerIcon size='md' /> {intl.formatMessage(messages.ansible)}</>,
            transforms: [sortable],
            dataLabel: intl.formatMessage(messages.ansible)
        }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [impacting, setImpacting] = useState(filters.impacting);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [filterBuilding, setFilterBuilding] = useState(true);
    const [queryString, setQueryString] = useState('');
    const [searchText, setSearchText] = useState('');
    const [disableRuleOpen, setDisableRuleOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState({});
    const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
    const [viewSystemsModalRule, setViewSystemsModalRule] = useState({});
    const debouncedSearchText = debounce(searchText, 800);
    const results = rules.meta ? rules.meta.count : 0;
    const sortIndices = { 1: 'description', 2: 'publish_date', 3: 'total_risk', 4: 'impacted_count', 5: 'playbook_count' };

    // transforms array of strings -> comma seperated strings, required by advisor api
    const filterFetchBuilder = (filters) => (Object.assign({},
        ...Object.entries(filters).map((filter) => (Array.isArray(filter[1]) ? { [filter[0]]: filter[1].join() }
            : { [filter[0]]: filter[1] })))
    );

    const fetchRulesFn = () => {
        fetchRules({
            ...filterFetchBuilder(filters),
            offset: 0,
            limit,
            impacting
        });
    };

    const onSort = (_event, index, direction) => {
        const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
        setSortBy({ index, direction });
        setFilters({ ...filters, sort: orderParam });
        setOffset(0);
    };

    const onSetPage = (pageNumber) => {
        const newOffset = pageNumber * limit - limit;
        setOffset(newOffset);
    };

    const toggleRulesWithHits = (impacting) => {
        setFilters({ ...filters, impacting });
        setImpacting(impacting);
        setOffset(0);
    };

    const toggleRulesDisabled = (param) => {
        let reports_shown = param === 'undefined' ? undefined : param;
        setFilters({ ...filters, reports_shown });
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
                setSelectedRule(rule);
                setDisableRuleOpen(true);
            } else {
                await API.delete(`${BASE_URL}/ack/${rule.rule_id}/`);
                fetchRulesFn();
            }
        } catch (error) {
            addNotification({
                variant: 'danger',
                dismissable: true,
                title: rule.reports_shown ? intl.formatMessage(messages.rulesTableHideReportsErrorDisabled)
                    : intl.formatMessage(messages.rulesTableHideReportsErrorEnabled),
                description: `${error}`
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
                title: intl.formatMessage(messages.disableRule),
                onClick: (event, rowId) => hideReports(rowId)
            }]
            : [{
                title: intl.formatMessage(messages.enableRule),
                onClick: (event, rowId) => hideReports(rowId)
            }];
    };

    const fetchAction = useCallback(() => {
        setOffset(0);
    }, []);

    const buildFilterChips = () => {
        const localFilters = { ...filters };
        delete localFilters.impacting;
        delete localFilters.reports_shown;
        delete localFilters.topic;
        delete localFilters.sort;
        const prunedFilters = Object.entries(localFilters);

        return prunedFilters.length > 0 ? prunedFilters.map(item => {
            if (FC[item[0]]) {
                const category = FC[item[0]];
                const chips = Array.isArray(item[1]) ? item[1].map(value =>
                    ({ name: category.values.find(values => values.value === String(value)).label, value }))
                    : [{ name: category.values.find(values => values.value === String(item[1])).label, value: item[1] }];
                return { category: category.title, chips, urlParam: category.urlParam };
            } else {
                return { category: 'Description', chips: [{ name: item[1], value: item[1] }], urlParam: item[0] };
            }
        })
            : [];
    };

    // Builds table filters from url params
    useEffect(() => {
        if (history.location.search) {
            const searchParams = new URLSearchParams(history.location.search);
            const paramsObject = Array.from(searchParams).reduce((acc, [key, value]) => ({
                ...acc, [key]: (value === 'true' || value === 'false') ? JSON.parse(value) : value.split(',')
            }), {});
            paramsObject.reports_shown = paramsObject.reports_shown === undefined || paramsObject.reports_shown[0] === 'undefined' ? undefined
                : paramsObject.reports_shown;
            paramsObject.sort = paramsObject.sort === undefined ? '-publish_date'
                : paramsObject.sort[0];

            setImpacting(paramsObject.impacting);
            setFilters({ ...paramsObject });
        }

        setFilterBuilding(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Builds and pushes url params from table filters
    useEffect(() => {
        const queryString = Object.keys(filters).map(key => `${key}=${Array.isArray(filters[key]) ? filters[key].join() : filters[key]}`).join('&');
        setQueryString(`?${queryString}`);
        history.replace({
            search: `?${queryString}`
        });
    }, [filters, history]);

    useEffect(() => {
        if (!filterBuilding) {
            fetchRules({
                ...filterFetchBuilder(filters),
                offset,
                limit
            });
        }
    }, [fetchRules, filterBuilding, filters, limit, offset]);

    useEffect(() => {
        if (filters.sort !== undefined) {
            const sortIndex = Number(Object.entries(sortIndices).find(item => item[1] === filters.sort || `-${item[1]}` === filters.sort)[0]);
            const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
            setSortBy({ index: sortIndex, direction: sortDirection });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, filters.sort]);

    useEffect(() => {
        if (rules.data) {
            if (rules.data.length === 0) {
                setRows([{
                    cells: [{
                        title: (
                            <MessageState icon={CheckIcon} iconClass='ansibleCheck' size='sm'
                                title={intl.formatMessage(messages.rulesTableNoRuleHitsTitle)} text={filters.reports_shown ?
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
                const rows = rules.data.flatMap((value, key) => ([{
                    isOpen: false,
                    rule: value,
                    cells: [{
                        title:
                            <span key={key}>
                                {!value.reports_shown && <Badge isRead>
                                    <BellSlashIcon size='md' />&nbsp;
                                    {intl.formatMessage(messages.disabled)}</Badge>}
                                <Link key={key} to={`/rules/${value.rule_id}`}> {value.description} </Link>
                            </span>
                    }, {
                        title: <div key={key}>
                            {moment(value.publish_date).fromNow()}
                        </div>
                    }, {
                        title: <div className="pf-m-center" key={key}>
                            <Tooltip position={TooltipPosition.bottom} content={intl.formatMessage(messages.rulesDetailsTotalriskBody, {
                                likelihood: AppConstants.LIKELIHOOD_LABEL[value.likelihood] || intl.formatMessage(messages.undefined),
                                impact: AppConstants.IMPACT_LABEL[value.impact.impact] || intl.formatMessage(messages.undefined),
                                strong(str) { return <strong>{str}</strong>; }
                            })}>
                                <Battery
                                    label={AppConstants.TOTAL_RISK_LABEL[value.total_risk] || intl.formatMessage(messages.undefined)}
                                    RHCLOUD-2752
                                    severity={value.total_risk}
                                />
                            </Tooltip>
                        </div>
                    }, {
                        title: <div key={key}> {value.reports_shown ?
                            `${value.impacted_systems_count.toLocaleString()}`
                            : intl.formatMessage(messages.nA)}</div>
                    }, {
                        title: <div className="pf-m-center " key={key}>
                            {value.playbook_count ? <CheckCircleIcon className='ansibleCheck' /> : intl.formatMessage(messages.no)}
                        </div>
                    }]
                }, {
                    parent: key * 2,
                    fullWidth: true,
                    cells: [{
                        title: <Main className='pf-m-light'>
                            <Stack gutter="md">
                                {value.hosts_acked_count ? <StackItem>
                                    <BellSlashIcon size='sm' />
                                    &nbsp;{value.hosts_acked_count && !value.impacted_systems_count ?
                                        intl.formatMessage(messages.ruleIsDisabledForAllSystems) :
                                        intl.formatMessage(messages.ruleIsDisabledForSystemsBody, { systems: value.hosts_acked_count })}
                                    &nbsp; <Button isInline variant='link'
                                        onClick={() => { setViewSystemsModalRule(value); setViewSystemsModalOpen(true); }}>
                                        {intl.formatMessage(messages.viewSystems)}
                                    </Button>
                                </StackItem>
                                    : <React.Fragment></React.Fragment>}
                                <RuleDetails rule={value} />
                            </Stack>
                        </Main>
                    }]
                }
                ]));
                setRows(rows.asMutable());
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAction, filters, rules, setFilters]);

    useEffect(() => {
        filters.text === undefined ? setSearchText('') : setSearchText(filters.text);
    }, [filters.text]);

    // Debounced function, sets text filter after specified time (800ms)
    useEffect(() => {
        if (!filterBuilding) {
            const filter = { ...filters };
            const text = searchText.length ? { text: searchText } : {};
            delete filter.text;
            setFilters({ ...filter, ...text });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    const removeFilterParam = (param) => {
        const filter = { ...filters };
        delete filter[param];
        setFilters(filter);
    };

    const addFilterParam = (param, values) => {
        values.length > 0 ? setFilters({ ...filters, ...{ [param]: values } }) : removeFilterParam(param);
    };

    const actions = [
        '', {
            label: intl.formatMessage(impacting ? messages.rulesTableActionShow : messages.rulesTableActionHide),
            onClick: () => toggleRulesWithHits(!impacting)
        }
    ];

    const filterConfigItems = [{
        label: intl.formatMessage(messages.description),
        filterValues: {
            key: 'text-filter',
            onChange: (event, value) => setSearchText(value),
            value: searchText
        }
    }, {
        label: FC.total_risk.title,
        type: FC.total_risk.type,
        id: FC.total_risk.urlParam,
        value: `checkbox-${FC.total_risk.urlParam}`,
        filterValues: {
            key: `${FC.total_risk.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.total_risk.urlParam, values),
            value: filters.total_risk,
            items: FC.total_risk.values
        }
    }, {
        label: FC.res_risk.title,
        type: FC.res_risk.type,
        id: FC.res_risk.urlParam,
        value: `checkbox-${FC.res_risk.urlParam}`,
        filterValues: {
            key: `${FC.res_risk.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.res_risk.urlParam, values),
            value: filters.res_risk,
            items: FC.res_risk.values
        }
    }, {
        label: FC.impact.title,
        type: FC.impact.type,
        id: FC.impact.urlParam,
        value: `checkbox-${FC.impact.urlParam}`,
        filterValues: {
            key: `${FC.impact.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.impact.urlParam, values),
            value: filters.impact,
            items: FC.impact.values
        }
    }, {
        label: FC.likelihood.title,
        type: FC.likelihood.type,
        id: FC.likelihood.urlParam,
        value: `checkbox-${FC.likelihood.urlParam}`,
        filterValues: {
            key: `${FC.likelihood.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.likelihood.urlParam, values),
            value: filters.likelihood,
            items: FC.likelihood.values
        }
    }, {
        label: FC.category.title,
        type: FC.category.type,
        id: FC.category.urlParam,
        value: `checkbox-${FC.category.urlParam}`,
        filterValues: {
            key: `${FC.category.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.category.urlParam, values),
            value: filters.category,
            items: FC.category.values
        }
    }, {
        label: FC.reports_shown.title,
        type: FC.reports_shown.type,
        id: FC.reports_shown.urlParam,
        value: `radio-${FC.reports_shown.urlParam}`,
        filterValues: {
            key: `${FC.reports_shown.urlParam}-filter`,
            onChange: (event, value) => toggleRulesDisabled(value),
            value: filters.reports_shown === undefined ? 'undefined' : `${filters.reports_shown}`,
            items: FC.reports_shown.values
        }
    }];

    const activeFiltersConfig = {
        filters: buildFilterChips(),
        onDelete: (event, itemsToRemove, isAll) => {
            if (isAll) {
                setFilters({ ...(filters.topic && { topic: filters.topic }), impacting: true, reports_shown: 'true' });
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

    const afterViewSystemsFn = () => {
        fetchRulesFn();
    };

    return <React.Fragment>
        {viewSystemsModalOpen && <ViewHostAcks
            handleModalToggle={(toggleModal) => setViewSystemsModalOpen(toggleModal)}
            isModalOpen={viewSystemsModalOpen}
            afterFn={afterViewSystemsFn}
            rule={viewSystemsModalRule}
        />}
        {disableRuleOpen && <DisableRule
            handleModalToggle={setDisableRuleOpen}
            isModalOpen={disableRuleOpen}
            rule={selectedRule}
            afterFn={fetchRulesFn}
        />}
        <PrimaryToolbar
            pagination={{
                itemCount: results,
                page: offset / limit + 1,
                perPage: limit,
                onSetPage(event, page) { onSetPage(page); },
                onPerPageSelect(event, perPage) { setLimit(perPage); },
                isCompact: false
            }}
            exportConfig={{
                onSelect: (event, exportType) => window.location = `${BASE_URL}/export/hits.${exportType === 'json' ? 'json' : 'csv'}/${queryString}`,
                isDisabled: !impacting
            }}
            actionsConfig={{ actions }}
            filterConfig={{ items: filterConfigItems }}
            activeFiltersConfig={activeFiltersConfig}
        />
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
