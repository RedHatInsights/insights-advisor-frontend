/* eslint camelcase: 0 */
import React, { useCallback, useEffect, useState } from 'react';
import { Battery, Main, TableToolbar, PrimaryToolbar } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { AnsibeTowerIcon, CheckCircleIcon, CheckIcon } from '@patternfly/react-icons';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Badge, Button, Pagination, PaginationVariant } from '@patternfly/react-core';
import { cellWidth, sortable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { injectIntl } from 'react-intl';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import MessageState from '../MessageState/MessageState';
import RuleDetails from '../RuleDetails/RuleDetails';
import messages from '../../Messages';
import { FILTER_CATEGORIES as FC } from '../../AppConstants';
import debounce from '../../Utilities/Debounce';
import DisableRule from '../Modals/DisableRule';

const RulesTable = ({ rules, filters, rulesFetchStatus, setFilters, fetchRules, addNotification, history, intl }) => {
    const [cols] = useState([
        { title: intl.formatMessage(messages.description), transforms: [sortable] },
        { title: intl.formatMessage(messages.added), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.totalRisk), transforms: [sortable] },
        { title: intl.formatMessage(messages.systems), transforms: [sortable] },
        {
            title: <><AnsibeTowerIcon size='md' /> {intl.formatMessage(messages.ansible)}</>,
            transforms: [sortable],
            dataLabel: intl.formatMessage(messages.ansible)
        }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [sort, setSort] = useState('-publish_date');
    const [impacting, setImpacting] = useState(filters.impacting);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [filterBuilding, setFilterBuilding] = useState(true);
    const [queryString, setQueryString] = useState('');
    const [searchText, setSearchText] = useState('');
    const [disableRuleOpen, setDisableRuleOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState({});
    const debouncedSearchText = debounce(searchText, 800);
    const results = rules.meta ? rules.meta.count : 0;

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
            impacting,
            sort
        });
    };

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
        delete localFilters.text;
        delete localFilters.impacting;
        delete localFilters.reports_shown;
        delete localFilters.topic;
        const prunedFilters = Object.entries(localFilters);

        return prunedFilters.length > 0 ? prunedFilters.map(item => {
            const category = FC[item[0]];
            const chips = Array.isArray(item[1]) ? item[1].map(value =>
                ({ name: category.values.find(values => values.value === String(value)).label, value }))
                : [{ name: category.values.find(values => values.value === String(item[1])).label, value: item[1] }];
            return { category: category.title, chips, urlParam: category.urlParam };
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
                        title: value.reports_shown ?
                            <Link key={key} to={`/rules/${value.rule_id}`}>
                                {value.description}
                            </Link>
                            : <span key={key}> <Badge isRead>{intl.formatMessage(messages.disabled)}</Badge> {value.description}</span>
                    }, {
                        title: <div key={key}>
                            {moment(value.publish_date).fromNow()}
                        </div>
                    }, {
                        title: <div className="pf-m-center" key={key} style={{ verticalAlign: 'top' }}>
                            <Battery
                                label={intl.formatMessage(messages.totalRisk)}
                                labelHidden
                                severity={value.total_risk}
                            />
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
                    cells: [{ title: <Main className='pf-m-light'> <RuleDetails rule={value} /></Main> }]
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
                setFilters({ impacting: true, reports_shown: 'true' });
            } else {
                itemsToRemove.map(item => {
                    const newFilter = {
                        [item.urlParam]:
                            filters[item.urlParam].filter(value => Number(value) !== Number(item.chips[0].value))
                    };
                    newFilter[item.urlParam].length > 0 ? setFilters({ ...filters, ...newFilter }) : removeFilterParam(item.urlParam);
                });
            }
        }
    };

    return <React.Fragment>
        <DisableRule
            handleModalToggle={setDisableRuleOpen}
            isModalOpen={disableRuleOpen}
            rule={selectedRule}
            afterDisableFn={fetchRulesFn}
        />
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
                onSelect: (event, exportType) => window.location = `${BASE_URL}/export/hits.${exportType === 'json' ? 'json' : 'csv'}/${queryString}`
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
