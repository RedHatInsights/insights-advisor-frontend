/* eslint camelcase: 0 */
import './_RulesTable.scss';

import * as AppActions from '../../AppActions';
import * as AppConstants from '../../AppConstants';

import { DEBOUNCE_DELAY, FILTER_CATEGORIES as FC } from '../../AppConstants';
import { Pagination, PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import React, { useCallback, useEffect, useState } from 'react';
import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack/index';
import { Table, TableBody, TableHeader, cellWidth, fitContent, sortable } from '@patternfly/react-table';
import { Tooltip, TooltipPosition } from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';
import { filterFetchBuilder, paramParser, pruneFilters, urlBuilder } from '../Common/Tables';

import API from '../../Utilities/Api';
import AnsibeTowerIcon from '@patternfly/react-icons/dist/js/icons/ansibeTower-icon';
import { BASE_URL } from '../../AppConstants';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { DateFormat } from '@redhat-cloud-services/frontend-components/components/DateFormat';
import DisableRule from '../Modals/DisableRule';
import Failed from '../../PresentationalComponents/Loading/Failed';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/components/esm/InsightsLabel';
import { Link } from 'react-router-dom';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { Main } from '@redhat-cloud-services/frontend-components/components/Main';
import MessageState from '../MessageState/MessageState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/components/PrimaryToolbar';
import PropTypes from 'prop-types';
import RuleDetails from '../RuleDetails/RuleDetails';
import RuleLabels from '../RuleLabels/RuleLabels';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { connect } from 'react-redux';
import debounce from '../../Utilities/Debounce';
import downloadReport from '../Common/DownloadHelper';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { strong } from '../../Utilities/intlHelper';

const RulesTable = ({ rules, filters, rulesFetchStatus, setFilters, fetchRules, addNotification, intl, selectedTags }) => {
    const [cols] = useState([
        { title: intl.formatMessage(messages.name), transforms: [sortable, cellWidth(30)] },
        { title: intl.formatMessage(messages.added), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.totalRisk), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.riskofchange), transforms: [sortable, cellWidth(15)] },
        { title: intl.formatMessage(messages.systems), transforms: [sortable, cellWidth(15)] },
        {
            title: <React.Fragment><AnsibeTowerIcon size='md' /> {intl.formatMessage(messages.ansible)}</React.Fragment>,
            transforms: [sortable, cellWidth(15), fitContent],
            dataLabel: intl.formatMessage(messages.ansible)
        }
    ]);
    const [rows, setRows] = useState([]);
    const [sortBy, setSortBy] = useState({});
    const [filterBuilding, setFilterBuilding] = useState(true);
    const [searchText, setSearchText] = useState(filters.text || '');
    const [disableRuleOpen, setDisableRuleOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState({});
    const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
    const [viewSystemsModalRule, setViewSystemsModalRule] = useState({});
    const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
    const results = rules.meta ? rules.meta.count : 0;
    const sortIndices = { 1: 'description', 2: 'publish_date', 3: 'total_risk', 4: 'impacted_count', 5: 'playbook_count' };

    const ruleResolutionRisk = (rule) => {
        const resolution = rule.resolution_set.find(resolution => resolution.system_type ===
            AppConstants.SYSTEM_TYPES.rhel ||
            AppConstants.SYSTEM_TYPES.ocp);
        return resolution ? resolution.resolution_risk.risk : undefined;
    };

    const fetchRulesFn = useCallback(() => {
        urlBuilder(filters, selectedTags);
        const options = selectedTags.length && ({ tags: selectedTags.join() });
        fetchRules({
            ...filterFetchBuilder(filters),
            ...options
        });
    }, [fetchRules, filters, selectedTags]);

    const onSort = (_event, index, direction) => {
        const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
        setSortBy({ index, direction });
        setFilters({ ...filters, sort: orderParam, offset: 0 });
    };

    const onSetPage = (pageNumber) => {
        const newOffset = pageNumber * filters.limit - filters.limit;
        setFilters({ ...filters, offset: newOffset });
    };

    const toggleRulesWithHits = (impacting) => {
        setFilters({ ...filters, impacting, offset: 0 });
    };

    const toggleRulesDisabled = (param) => {
        const reports_shown = param === 'undefined' ? undefined : param;
        setFilters({ ...filters, reports_shown, offset: 0, ...(reports_shown !== 'true' && { impacting: false }) });
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

    const buildFilterChips = () => {
        const localFilters = { ...filters };
        delete localFilters.impacting;
        delete localFilters.topic;
        delete localFilters.sort;
        delete localFilters.offset;
        delete localFilters.limit;

        return pruneFilters(localFilters, FC);
    };

    useEffect(() => { !filterBuilding && selectedTags !== null && fetchRulesFn(); }, [fetchRulesFn, filterBuilding, filters, selectedTags]);

    // Builds table filters from url params
    useEffect(() => {
        if (window.location.search && filterBuilding) {
            const paramsObject = paramParser();
            delete paramsObject.tags;
            paramsObject.text === undefined ? setSearchText('') : setSearchText(paramsObject.text);
            paramsObject.reports_shown = paramsObject.reports_shown === undefined || paramsObject.reports_shown[0] === 'undefined' ? undefined
                : paramsObject.reports_shown;
            paramsObject.sort = paramsObject.sort === undefined ? '-total_risk' : paramsObject.sort[0];
            paramsObject.has_playbook !== undefined && !Array.isArray(paramsObject.has_playbook) &&
                (paramsObject.has_playbook = [`${paramsObject.has_playbook}`]);
            paramsObject.incident !== undefined && !Array.isArray(paramsObject.incident) && (paramsObject.incident = [`${paramsObject.incident}`]);
            paramsObject.offset === undefined ? paramsObject.offset = 0 : paramsObject.offset = Number(paramsObject.offset[0]);
            paramsObject.limit === undefined ? paramsObject.limit = 10 : paramsObject.limit = Number(paramsObject.limit[0]);
            paramsObject.reboot !== undefined && !Array.isArray(paramsObject.reboot) && (paramsObject.reboot = [`${paramsObject.reboot}`]);

            setFilters({ ...filters, ...paramsObject });
        }

        setFilterBuilding(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (filters.sort !== undefined) {
            const sortIndex = Number(Object.entries(sortIndices).find(item => item[1] === filters.sort || `-${item[1]}` === filters.sort)[0]);
            const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
            setSortBy({ index: sortIndex, direction: sortDirection });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.sort]);

    useEffect(() => {
        if (rules.data) {
            if (rules.data.length === 0) {
                setRows([{
                    cells: [{
                        title: (
                            <MessageState icon={CheckCircleIcon} iconClass='ansibleCheck'
                                title={intl.formatMessage(messages.rulesTableNoRuleHitsTitle)} text={filters.reports_shown ?
                                    intl.formatMessage(messages.rulesTableNoRuleHitsEnabledRulesBody) :
                                    intl.formatMessage(messages.rulesTableNoRuleHitsAnyRulesBody)}>
                                {filters.reports_shown && <Button variant="link" style={{ paddingTop: 24 }}
                                    onClick={() => toggleRulesDisabled('undefined')}>
                                    {intl.formatMessage(messages.rulesTableNoRuleHitsAddDisabledButton)}
                                </Button>}
                            </MessageState>),
                        props: { colSpan: 6 }
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
                                <RuleLabels rule={value} />
                                <Link key={key} to={`/recommendations/${value.rule_id}`}> {value.description} </Link>
                            </span>
                    }, {
                        title: <DateFormat key={key} date={value.publish_date} variant='relative' />
                    }, {
                        title: <div className="pf-m-center" key={key}>
                            <Tooltip key={key} position={TooltipPosition.bottom} content={intl.formatMessage(messages.rulesDetailsTotalriskBody, {
                                risk: AppConstants.TOTAL_RISK_LABEL_LOWER[value.total_risk] || intl.formatMessage(messages.undefined),
                                strong: str => strong(str)
                            })}>
                                <InsightsLabel value={value.total_risk}/>
                            </Tooltip>
                        </div>
                    }, {
                        title: <div className="pf-m-center" key={key}>
                            <InsightsLabel
                                text={AppConstants.RISK_OF_CHANGE_LABEL[ruleResolutionRisk(value)]}
                                value={ruleResolutionRisk(value)} hideIcon/>
                            <div></div>
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
                            <Stack hasGutter>
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
                                <RuleDetails rule={value} resolutionRisk={ruleResolutionRisk(value)} />
                            </Stack>
                        </Main>
                    }]
                }
                ]));
                setRows(rows.asMutable());
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rules]);

    // Debounced function, sets text filter after specified time (800ms)
    useEffect(() => {
        if (!filterBuilding && rulesFetchStatus !== 'pending') {
            const filter = { ...filters };
            const text = searchText.length ? { text: searchText } : {};
            delete filter.text;
            setFilters({ ...filter, ...text, offset: 0 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchText]);

    const removeFilterParam = (param) => {
        const filter = { ...filters, offset: 0 };
        param === 'text' && setSearchText('');
        delete filter[param];
        setFilters(filter);
    };

    const addFilterParam = (param, values) => {
        values.length > 0 ? setFilters({ ...filters, offset: 0, ...{ [param]: values } }) : removeFilterParam(param);
    };

    const actions = [
        '', {
            label: intl.formatMessage(filters.impacting ? messages.rulesTableActionShow : messages.rulesTableActionHide),
            onClick: () => toggleRulesWithHits(!filters.impacting)
        }
    ];

    const filterConfigItems = [{
        label: intl.formatMessage(messages.name).toLowerCase(),
        filterValues: {
            key: 'text-filter',
            onChange: (event, value) => setSearchText(value),
            value: searchText,
            placeholder: intl.formatMessage(messages.search)
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
        label: FC.incident.title,
        type: FC.incident.type,
        id: FC.incident.urlParam,
        value: `checkbox-${FC.incident.urlParam}`,
        filterValues: {
            key: `${FC.incident.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.incident.urlParam, values),
            value: filters.incident,
            items: FC.incident.values
        }
    }, {
        label: FC.has_playbook.title,
        type: FC.has_playbook.type,
        id: FC.has_playbook.urlParam,
        value: `checkbox-${FC.has_playbook.urlParam}`,
        filterValues: {
            key: `${FC.has_playbook.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.has_playbook.urlParam, values),
            value: filters.has_playbook,
            items: FC.has_playbook.values
        }
    }, {
        label: FC.reboot.title,
        type: FC.reboot.type,
        id: FC.reboot.urlParam,
        value: `checkbox-${FC.reboot.urlParam}`,
        filterValues: {
            key: `${FC.reboot.urlParam}-filter`,
            onChange: (event, values) => addFilterParam(FC.reboot.urlParam, values),
            value: filters.reboot,
            items: FC.reboot.values
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
                setSearchText('');
                setFilters({
                    ...(filters.topic && { topic: filters.topic }),
                    impacting: true, reports_shown: 'true', limit: filters.limit, offset: filters.offset
                });
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
                page: filters.offset / filters.limit + 1,
                perPage: Number(filters.limit),
                onSetPage(event, page) { onSetPage(page); },
                onPerPageSelect(event, perPage) { setFilters({ ...filters, limit: perPage, offset: 0 }); },
                isCompact: false
            }}
            exportConfig={{
                label: intl.formatMessage(messages.exportCsv),
                // eslint-disable-next-line no-dupe-keys
                label: intl.formatMessage(messages.exportJson),
                onSelect: (_e, fileType) => downloadReport('hits', fileType, urlBuilder(filters, selectedTags)),
                isDisabled: !filters.impacting
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
        <Pagination
            itemCount={results}
            page={(filters.offset / filters.limit + 1)}
            perPage={Number(filters.limit)}
            onSetPage={(event, page) => { onSetPage(page); }}
            onPerPageSelect={(event, perPage) => { setFilters({ ...filters, limit: perPage, offset: 0 }); }}
            widgetId={`pagination-options-menu-bottom`}
            variant={PaginationVariant.bottom}
        />
    </React.Fragment>;
};

RulesTable.propTypes = {
    fetchRules: PropTypes.func,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object,
    filters: PropTypes.object,
    addNotification: PropTypes.func,
    setFilters: PropTypes.func,
    intl: PropTypes.any,
    selectedTags: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    filters: state.AdvisorStore.filters,
    selectedTags: state.AdvisorStore.selectedTags,
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
