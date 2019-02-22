/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Ansible,
    Battery,
    Main,
    PageHeader,
    PageHeaderTitle,
    Pagination,
    routerParams,
    TableToolbar
} from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { Stack, StackItem } from '@patternfly/react-core';
import { sortable, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { RULE_CATEGORIES, SEVERITY_MAP } from '../../AppConstants';
import Filters from '../../PresentationalComponents/Filters/Filters';

import './_actions.scss';

class ViewActions extends Component {
    state = {
        summary: '',
        cols: [
            'Rule',
            { title: 'Liklihood', transforms: [ sortable ]},
            { title: 'Impact', transforms: [ sortable ]},
            { title: 'Total Risk', transforms: [ sortable ]},
            'Systems Exposed',
            'Ansible'
        ],
        rows: [],
        sortBy: {},
        localFilters: {},
        impacting: true,
        pageSize: 10,
        page: 1
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        const options = { page: this.state.page, page_size: this.state.pageSize, impacting: this.state.impacting };

        if (this.props.match.params.type.includes('-risk')) {
            const totalRisk = SEVERITY_MAP[this.props.match.params.type];
            this.setState({ localFilters: { total_risk: totalRisk }});
            options.total_risk = totalRisk;
        } else {
            this.setState({ localFilters: { category: RULE_CATEGORIES[this.props.match.params.type] }});
            options.category = RULE_CATEGORIES[this.props.match.params.type];
        }

        this.props.fetchRules(options);
    }

    componentDidUpdate (prevProps) {
        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.results;
            this.setState({ summary: this.props.rules.summary });

            let rows = rules.map((value, key) => {
                return {
                    cells: [
                        <Link
                            key={ key }
                            to={ `/actions/${this.props.match.params.type}/${
                                value.rule_id
                            }` }
                        >
                            { value.description }
                        </Link>,
                        <Battery
                            key={ key }
                            label='Likelihood'
                            labelHidden
                            severity={ value.likelihood }
                        />,
                        <Battery
                            key={ key }
                            label='Impact'
                            labelHidden
                            severity={ value.impact.impact }
                        />,
                        <Battery
                            key={ key }
                            label='Total Risk'
                            labelHidden
                            severity={ value.total_risk }
                        />,
                        <div key={ key }>{ value.impacted_systems_count }</div>,
                        <Ansible
                            key={ key }
                            unsupported={ !value.has_playbook }
                        />
                    ]
                };
            });

            this.setState({ rows });
        }
    }

    onSort = (_event, index, direction) => {
        const attrIndex = {
            1: 'likelihood',
            2: 'impact',
            3: 'total_risk'
        };
        const orderParam = `${direction === 'asc' ? '' : '-'}${attrIndex[index]}`;

        this.setState({
            sortBy: {
                index,
                direction
            },
            localFilters: { ...this.state.localFilters, sort: orderParam }
        });
        this.props.fetchRules({
            ...this.props.filters,
            page: 1,
            page_size: this.state.pageSize,
            impacting: this.state.impacting,
            ...this.state.localFilters,
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
                ...this.state.localFilters
            });
        }
    };

    setPerPage = (pageSize) => {
        this.setState({ pageSize });
        this.props.fetchRules({ ...this.props.filters, page: 1, page_size: pageSize, impacting: this.state.impacting, ...this.state.localFilters });
    };

    parseUrlTitle = (title = '') => {
        const parsedTitle = title.split('-');
        return parsedTitle.length > 1 ? `${parsedTitle[0]} ${parsedTitle[1]} Actions` : `${parsedTitle}`;
    };

    render () {
        const { rulesFetchStatus, rules } = this.props;
        const { localFilters, pageSize, page, impacting, sortBy, cols, rows } = this.state;
        return (
            <React.Fragment>
                <PageHeader>
                    <Breadcrumbs
                        current={ this.parseUrlTitle(this.props.match.params.type) }
                        match={ this.props.match }
                    />
                    <PageHeaderTitle
                        className='actions__view--title'
                        title={ this.parseUrlTitle(this.props.match.params.type) }
                    />
                </PageHeader>
                <Main>
                    <Stack gutter='md'>
                        <StackItem>
                            <p>{ this.state.summary }</p>
                        </StackItem>
                        <StackItem>
                            <TableToolbar>
                                <Filters
                                    fetchAction={ (filters) => this.props.fetchRules({ ...filters, pageSize, page, impacting, ...localFilters }) }
                                    searchPlaceholder='Find a Rule'
                                    resultsCount={ rules.count }
                                    hideCategories={ localFilters.total_risk ? [ 'total_risk' ] : [ 'category' ] }
                                >
                                </Filters>
                            </TableToolbar>
                            { rulesFetchStatus === 'fulfilled' &&
                            <Table variant={ TableVariant.compact } sortBy={ sortBy } onSort={ this.onSort } cells={ cols } rows={ rows }>
                                <TableHeader/>
                                <TableBody/>
                            </Table> }
                            { rulesFetchStatus === 'pending' && (<Loading/>) }
                            { rulesFetchStatus === 'failed' && (<Failed message={ `There was an error fetching rules list.` }/>) }
                            <TableToolbar>
                                <Pagination
                                    numberOfItems={ rules.count }
                                    onPerPageSelect={ this.setPerPage }
                                    page={ page }
                                    onSetPage={ this.setPage }
                                    itemsPerPage={ pageSize }
                                />
                            </TableToolbar>
                        </StackItem>
                    </Stack>
                </Main>
            </React.Fragment>
        );
    }
}

ViewActions.propTypes = {
    fetchRules: PropTypes.func,
    match: PropTypes.any,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object,
    filters: PropTypes.object
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
)(ViewActions));
