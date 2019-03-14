/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Ansible, Battery, Main, Pagination, routerParams, TableToolbar } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { sortable, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Filters from '../../PresentationalComponents/Filters/Filters';
import RuleDetails from '../RuleDetails/RuleDetails';

class RulesTable extends Component {
    state = {
        summary: '',
        cols: [
            'Rule',
            { title: 'Likelihood', transforms: [ sortable ]},
            { title: 'Impact', transforms: [ sortable ]},
            { title: 'Total Risk', transforms: [ sortable ]},
            { title: 'Systems Exposed', transforms: [ sortable ]},
            { title: 'Ansible', transforms: [ sortable ]}
        ],
        rows: [],
        sortBy: {},
        sort: 'rule_id',
        urlFilters: {},
        impacting: false,
        pageSize: 10,
        page: 1
    };

    async componentDidMount () {
        const { page, pageSize } = this.state;
        const impacting = this.props.impacting || this.state.impacting;
        await insights.chrome.auth.getUser();
        const options = { page, page_size: pageSize, impacting, ...this.props.urlFilters || {}};

        this.props.fetchRules(options);
        this.setState({ impacting, urlFilters: this.props.urlFilters || {}});
    }

    componentDidUpdate (prevProps) {
        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.results;
            this.setState({ summary: this.props.rules.summary });

            let rows = rules.map((value, key) => {
                const parent = key * 2;
                const linkTo = `/actions/${value.category.name.toLowerCase()}/${value.rule_id}`;
                return [
                    {
                        isOpen: false,
                        rule: value,
                        cells: [
                            <>
                                <Link key={ key } to={ linkTo }>
                                    { value.description }
                                </Link>
                            </>,
                            <div className="pf-m-center" key={ key }>
                                <Battery
                                    label='Likelihood'
                                    labelHidden
                                    severity={ value.likelihood }
                                /></div>,
                            <div className="pf-m-center" key={ key }>
                                <Battery
                                    label='Impact'
                                    labelHidden
                                    severity={ value.impact.impact }
                                />
                            </div>,
                            <div className="pf-m-center" key={ key }>
                                <Battery
                                    label='Total Risk'
                                    labelHidden
                                    severity={ value.total_risk }
                                />
                            </div>,
                            <div key={ key }>{ value.impacted_systems_count }</div>,
                            <div className="pf-m-center" key={ key }>
                                <Ansible unsupported={ !value.playbook_count }/>
                            </div>
                        ]
                    },
                    {
                        parent,
                        cells: [ <div key={ `child-${key}` }>{ 'Loading...' }</div> ]
                    }
                ];
            });

            this.setState({ rows: rows.flat() });
        }
    }

    onSort = (_event, index, direction) => {
        const attrIndex = {
            2: 'likelihood',
            3: 'impact',
            4: 'total_risk',
            5: 'impacted_count',
            6: 'playbook_count'
        };
        const orderParam = `${direction === 'asc' ? '' : '-'}${attrIndex[index]}`;

        this.setState({
            sortBy: {
                index,
                direction
            },
            sort: orderParam,
            page: 1
        });
        this.props.fetchRules({
            ...this.props.filters,
            page: 1,
            page_size: this.state.pageSize,
            impacting: this.state.impacting,
            sort: orderParam
        });
    };

    setPage = (newPage, textInput) => {
        if (textInput) {
            this.setState(
                () => ({ page: newPage }),
                debounce(() => this.setPage(newPage), 800)
            );
        } else {
            this.setState({ page: newPage });
            this.props.fetchRules({
                ...this.props.filters,
                page: newPage,
                page_size: this.state.pageSize,
                impacting: this.state.impacting,
                sort: this.state.sort
            });
        }
    };

    setPerPage = (pageSize) => {
        const { impacting, sort, page } = this.state;
        this.setState({ pageSize });
        this.props.fetchRules({ ...this.props.filters, page, page_size: pageSize, impacting, sort });
    };

    parseUrlTitle = (title = '') => {
        const parsedTitle = title.split('-');
        return parsedTitle.length > 1 ? `${parsedTitle[0]} ${parsedTitle[1]} Actions` : `${parsedTitle}`;
    };

    toggleRulesWithHits = (showRulesWithHits) => {
        const { pageSize } = this.state;
        this.setState({ impacting: showRulesWithHits, page: 1 });
        this.props.fetchRules({
            ...this.props.filters,
            page: 1,
            page_size: pageSize,
            impacting: showRulesWithHits
        });
    };

    handleOnCollapse = (event, rowId, isOpen) => {
        const rows = [ ...this.state.rows ];
        rows[rowId] = { ...rows[rowId], isOpen };
        const content = isOpen ? <RuleDetails rule={ rows[rowId].rule }/> : 'Loading...';

        rows[rowId + 1] = {
            ...rows[rowId + 1], cells: [ <div key={ `child-${rowId}` }>
                { content }
            </div> ]
        };

        this.setState({
            rows
        });
    };

    render () {
        const { rulesFetchStatus, rules } = this.props;
        const { urlFilters, sort, pageSize, page, impacting, sortBy, cols, rows } = this.state;
        return <Main>
            <Stack gutter='md'>
                <StackItem>
                    <p>{ this.state.summary }</p>
                </StackItem>
                <StackItem>
                    <TableToolbar className='pf-u-justify-content-space-between' results={ rules.count }>
                        <Filters
                            fetchAction={ (filters) => this.props.fetchRules({ ...filters, pageSize, page, impacting, sort }) }
                            searchPlaceholder='Find a Rule'
                            externalFilters={ urlFilters }
                        >
                            <Checkbox
                                label="Show Rules With Hits"
                                isChecked={ impacting }
                                onChange={ this.toggleRulesWithHits }
                                aria-label="InsightsRulesHideHits"
                                id="InsightsRulesHideHits"
                            />
                        </Filters>
                    </TableToolbar>
                    { rulesFetchStatus === 'fulfilled' &&
                    <Table variant={ TableVariant.compact }
                        onCollapse={ this.handleOnCollapse } sortBy={ sortBy } onSort={ this.onSort } cells={ cols }
                        rows={ rows }>
                        <TableHeader/>
                        <TableBody/>
                    </Table> }
                    { rulesFetchStatus === 'pending' && (<Loading/>) }
                    { rulesFetchStatus === 'failed' && (<Failed message={ `There was an error fetching rules list.` }/>) }
                    <TableToolbar className='pf-c-pagination'>
                        <Pagination
                            numberOfItems={ rules.count || 0 }
                            onPerPageSelect={ this.setPerPage }
                            page={ page }
                            onSetPage={ this.setPage }
                            itemsPerPage={ pageSize }
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
    impacting: PropTypes.bool,
    urlFilters: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    filters: state.AdvisorStore.filters,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({ fetchRules: (url) => dispatch(AppActions.fetchRules(url)) });

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(RulesTable));
