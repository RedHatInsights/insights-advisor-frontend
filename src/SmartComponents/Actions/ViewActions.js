/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Ansible,
    Battery,
    Breadcrumbs,
    Main,
    PageHeader,
    PageHeaderTitle,
    Pagination,
    routerParams,
    SortDirection,
    Table
} from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { connect } from 'react-redux';
import { Stack, StackItem } from '@patternfly/react-core';
import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { buildBreadcrumbs, onNavigate } from '../../Helpers/breadcrumbs.js';
import './_actions.scss';

class ViewActions extends Component {
    constructor (props) {
        super(props);
        this.state = {
            summary: '',
            cols: [
                'Rule',
                'Likelihood',
                'Impact',
                'Total Risk',
                'Systems',
                'Ansible'
            ],
            rows: [],
            sortBy: {},
            filters: {},
            itemsPerPage: 10,
            page: 1,
            things: []
        };
        this.onSortChange = this.onSortChange.bind(this);
        this.toggleCol = this.toggleCol.bind(this);

        this.setPage = this.setPage.bind(this);
        this.setPerPage = this.setPerPage.bind(this);
    }

    componentDidMount () {
        document.getElementById('root').classList.add('actions__view');
        const riskMap = {
            'critical-risk': 4,
            'high-risk': 3,
            'medium-risk': 2,
            'low-risk': 1
        };
        const options = { page_size: this.state.itemsPerPage };

        if (this.props.match.params.type.includes('-risk')) {
            const risk = riskMap[this.props.match.params.type];
            this.setState({ filters: { res_risk: risk }});
            options.res_risk = risk;
        } else {
            this.setState({ filters: { category: this.props.match.params.type }});
            options.category = this.props.match.params.type;
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
                            to={ `/actions/${this.props.match.params.type }/${
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
                            severity={ value.severity }
                        />,
                        <div key={ key }>{ value.impacted_systems }</div>,
                        <Ansible
                            key={ key }
                            unsupported={ value.ansible }
                        />
                    ]
                };
            });

            this.setState({ rows });
        }
    }

    toggleCol (_event, key, selected) {
        let { rows, page, itemsPerPage } = this.state;
        const firstIndex = page === 1 ? 0 : page * itemsPerPage - itemsPerPage;
        rows[firstIndex + key].selected = selected;
        this.setState({
            ...this.state,
            rows
        });
    }

    onSortChange (_event, key, direction) {
        const sortedRows = sortBy(this.state.rows, [ e => e.cells[key] ]);
        this.setState({
            ...this.state,
            rows: SortDirection.up === direction ? sortedRows : sortedRows.reverse(),
            sortBy: {
                index: key,
                direction
            }
        });
    }

    setPage (page) {
        this.setState(() => ({ page }));
        this.props.fetchRules({ page, page_size: this.state.itemsPerPage, ...this.state.filters }); // eslint-disable-line camelcase
    }

    setPerPage (itemsPerPage) {
        this.setState(() => ({ itemsPerPage }));
        this.props.fetchRules({ page_size: itemsPerPage, ...this.state.filters }); // eslint-disable-line camelcase
    }

    parseUrlTitle (title = '') {
        const parsedTitle = title.split('-');
        return parsedTitle.length > 1 ? `${parsedTitle[0]} ${parsedTitle[1]} Actions` : `${parsedTitle}`;
    }

    render () {
        const { rulesFetchStatus, rules, breadcrumbs } = this.props;

        return (
            <React.Fragment>
                <Breadcrumbs
                    current={ this.parseUrlTitle(this.props.match.params.type) }
                    items={ breadcrumbs[0] !== undefined ? breadcrumbs : buildBreadcrumbs(this.props.match, 1) }
                    onNavigate={ onNavigate }
                />
                <PageHeader>
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
                        <StackItem className='advisor-l-actions__filters'>
                            Filters
                        </StackItem>
                        { rulesFetchStatus === 'fulfilled' && (
                            <StackItem className='advisor-l-actions__table'>
                                <Table
                                    className='rules-table'
                                    onItemSelect={ this.toggleCol }
                                    hasCheckbox={ false }
                                    header={ this.state.cols }
                                    sortBy={ this.state.sortBy }
                                    rows={ this.state.rows }
                                    onSort={ this.onSortChange }
                                    footer={
                                        <Pagination
                                            numberOfItems={ rules.count }
                                            onPerPageSelect={ this.setPerPage }
                                            page={ this.state.page }
                                            onSetPage={ this.setPage }
                                            itemsPerPage={ this.state.itemsPerPage }
                                        />
                                    }
                                />
                            </StackItem>
                        ) }
                        { rulesFetchStatus === 'pending' && (<Loading/>) }
                    </Stack>
                </Main>
            </React.Fragment>
        );
    }
}

ViewActions.propTypes = {
    breadcrumbs: PropTypes.array,
    fetchRules: PropTypes.func,
    match: PropTypes.any,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRules: (url) => dispatch(AppActions.fetchRules(url))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewActions));
