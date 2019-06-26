/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Battery, Main, TableToolbar } from '@redhat-cloud-services/frontend-components';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import PropTypes from 'prop-types';
import { debounce, flatten } from 'lodash';
import { connect } from 'react-redux';
import { Badge, Button, Checkbox, Dropdown, DropdownItem, DropdownPosition, KebabToggle, Pagination, Stack, StackItem } from '@patternfly/react-core';
import { cellWidth, sortable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import moment from 'moment';
import { CheckIcon } from '@patternfly/react-icons';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Filters from '../../PresentationalComponents/Filters/Filters';
import RuleDetails from '../RuleDetails/RuleDetails';
import API from '../../Utilities/Api';
import { BASE_URL } from '../../AppConstants';
import { ANSIBLE_ICON } from '../../AppSvgs';
import MessageState from '../MessageState/MessageState';

class RulesTable extends Component {
    state = {
        summary: '',
        cols: [
            { title: 'Rule', transforms: [ sortable ]},
            { title: 'Added', transforms: [ sortable, cellWidth(15) ]},
            { title: 'Total Risk', transforms: [ sortable ]},
            { title: 'Systems', transforms: [ sortable ]},
            { title: <span className='ansibleCol'>{ ANSIBLE_ICON } Ansible</span>, transforms: [ sortable ]}
        ],
        rows: [],
        sortBy: {},
        sort: '-publish_date',
        impacting: this.props.filters.impacting,
        limit: 10,
        offset: 0,
        reports_shown: this.props.filters.reports_shown,
        isKebabOpen: false
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.onSort(null, 2, 'desc');
    }

    componentDidUpdate (prevProps) {
        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.data;
            this.setState({ summary: this.props.rules.data.summary });

            if (rules.length === 0) {
                this.setState({
                    rows: [{
                        cells: [{
                            title: (
                                <MessageState icon={ CheckIcon } title='No rule hits'
                                    text={ `None of your connected systems are affected by
                                    ${this.props.filters.reports_shown ? 'enabled rules.' : 'any known rules.'}` }>
                                    { this.props.filters.reports_shown && <Button variant="link" style={ { paddingTop: 24 } } onClick={ () => {
                                        this.props.setFilters({ ...this.props.filters, reports_shown: undefined });
                                        this.fetchAction({ ...this.props.filters, reports_shown: undefined });
                                    }
                                    }>
                                        Include disabled rules
                                    </Button> }
                                </MessageState>),
                            props: { colSpan: 5 }
                        }]
                    }]
                });
            } else {
                let rows = rules.map((value, key) => {
                    const linkTo = `/overview/${value.category.name.toLowerCase()}/${value.rule_id}`;
                    return [
                        {
                            isOpen: false,
                            rule: value,
                            cells: [
                                {
                                    title: <React.Fragment>
                                        { value.reports_shown ?
                                            <Link key={ key } to={ linkTo }>
                                                { value.description }
                                            </Link>
                                            : <span key={ key }> <Badge isRead>Disabled</Badge> { value.description }</span>
                                        }
                                    </React.Fragment>
                                },
                                {
                                    title: <div key={ key }>
                                        { moment(value.publish_date).fromNow() }
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
                                    title: <div key={ key }> { value.reports_shown ?
                                        `${value.impacted_systems_count.toLocaleString()}`
                                        : 'N/A' }</div>
                                },
                                {
                                    title: <div className="pf-m-center " key={ key }>
                                        { value.playbook_count ? <CheckIcon className='ansibleCheck'/> : null }
                                    </div>
                                }
                            ]
                        },
                        {
                            parent: key * 2,
                            fullWidth: true,
                            cells: [{ title: <Main className='pf-m-light'> <RuleDetails rule={ value }/></Main> }]
                        }
                    ];
                });
                this.setState({ rows: flatten(rows) });
            }
        }
    }

    onSort = (_event, index, direction) => {
        const { impacting, limit } = this.state;
        const attrIndex = {
            1: 'description',
            2: 'publish_date',
            3: 'total_risk',
            4: 'impacted_count',
            5: 'playbook_count'
        };
        const orderParam = `${direction === 'asc' ? '' : '-'}${attrIndex[index]}`;

        this.setState({
            sortBy: {
                index,
                direction
            },
            sort: orderParam,
            offset: 0
        });
        this.props.fetchRules({
            ...this.props.filters,
            offset: 0,
            limit,
            impacting,
            sort: orderParam
        });
    };

    onSetPage = (_event, page) => {
        const { impacting, sort, limit } = this.state;
        const offset = typeof _event === 'object' ? page * limit - limit : _event * limit - limit;
        if (typeof _event === 'object') {
            this.setState(
                () => ({ offset }),
                debounce(() => this.onSetPage(page), 800)
            );
        } else {
            this.setState({ offset });
            this.props.fetchRules({
                ...this.props.filters,
                offset,
                limit,
                impacting,
                sort
            });
        }
    };

    onPerPageSelect = (_event, limit) => {
        const { impacting, sort, offset } = this.state;

        this.setState({ limit });
        this.props.fetchRules({ ...this.props.filters, offset, limit, impacting, sort });
    };

    parseUrlTitle = (title = '') => {
        const parsedTitle = title.split('-');
        return parsedTitle.length > 1 ? `${parsedTitle[0]} ${parsedTitle[1]} Actions` : `${parsedTitle}`;
    };

    toggleRulesWithHits = (impacting) => {
        const { limit } = this.state;
        this.props.setFilters({ ...this.props.filters, impacting });
        this.setState({ impacting, offset: 0 });
        this.props.fetchRules({
            ...this.props.filters,
            offset: 0,
            limit,
            impacting
        });
    };

    handleOnCollapse = (event, rowId, isOpen) => {
        const rows = [ ...this.state.rows ];
        rows[rowId] = { ...rows[rowId], isOpen };
        this.setState({ rows });
    };

    hideReports = async (rowId) => {
        const rule = this.state.rows[rowId].rule;
        try {
            if (rule.reports_shown) {
                await API.post(`${BASE_URL}/ack/`, { rule_id: rule.rule_id });

            } else {
                await API.delete(`${BASE_URL}/ack/${rule.rule_id}/`);
            }

            this.props.fetchRules({
                ...this.props.filters,
                offset: 0,
                limit: this.state.limit,
                impacting: this.state.impacting
            });
        } catch (error) {
            this.props.addNotification({
                variant: 'danger',
                dismissable: true,
                title: rule.reports_shown ? 'Disabling reports failed' : 'Enabling reports failed',
                description: `For rule: ${rule.description}`
            });
        }
    };

    actionResolver = (rowData, { rowIndex }) => {
        const rule = this.state.rows[rowIndex].rule ? this.state.rows[rowIndex].rule : null;
        if (rowIndex % 2 !== 0 || !rule) {
            return null;
        }

        return rule && rule.reports_shown ?
            [{
                title: 'Disable Rule',
                onClick: (event, rowId) => this.hideReports(rowId)
            }]
            : [{
                title: 'Enable Rule',
                onClick: (event, rowId) => this.hideReports(rowId)
            }];
    };

    fetchAction = (filters) => {
        const { sort, limit, impacting } = this.state;
        this.setState({
            offset: 0
        });
        this.props.fetchRules({ ...filters, limit, offset: 0, impacting, sort });
    };

    render () {
        const { rulesFetchStatus, rules } = this.props;
        const { offset, limit, impacting, sortBy, cols, rows, isKebabOpen } = this.state;
        const page = offset / limit + 1;
        const results = rules.meta ? rules.meta.count : 0;
        return <Main>
            <Stack gutter='md'>
                <StackItem>
                    <p>{ this.state.summary }</p>
                </StackItem>
                <StackItem>
                    <TableToolbar style={ { justifyContent: 'space-between' } }>
                        <Filters
                            fetchAction={ this.fetchAction }
                            searchPlaceholder='Find a rule...'
                            results={ results }
                        >
                            <Dropdown
                                position={ DropdownPosition.left }
                                toggle={ <KebabToggle onToggle={ isOpen => {this.setState({ isKebabOpen: isOpen });} }/> }
                                onSelect={ () => {this.setState({ isKebabOpen: false });} }
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
                                onChange={ this.toggleRulesWithHits }
                                aria-label="InsightsRulesHideHits"
                                id="InsightsRulesHideHits"
                            />
                            <Pagination
                                itemCount={ results }
                                onPerPageSelect={ this.onPerPageSelect }
                                onSetPage={ this.onSetPage }
                                page={ page }
                                perPage={ limit }
                            />
                        </Filters>
                    </TableToolbar>
                    { rulesFetchStatus === 'fulfilled' &&
                    <Table aria-label={ 'rule-table' }
                        actionResolver={ this.actionResolver } onCollapse={ this.handleOnCollapse } sortBy={ sortBy }
                        onSort={ this.onSort } cells={ cols } rows={ rows }>
                        <TableHeader/>
                        <TableBody/>
                    </Table> }
                    { rulesFetchStatus === 'pending' && (<Loading/>) }
                    { rulesFetchStatus === 'failed' && (<Failed message={ `There was an error fetching rules list.` }/>) }
                    <TableToolbar className='pf-c-pagination'>
                        <Pagination
                            itemCount={ results }
                            onPerPageSelect={ this.onPerPageSelect }
                            onSetPage={ this.onSetPage }
                            page={ page }
                            perPage={ limit }
                        />
                    </TableToolbar>
                </StackItem>
            </Stack>
        </Main>;
    }
}

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
