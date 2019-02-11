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
    SortDirection,
    Table
} from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { debounce, sortBy } from 'lodash';
import { connect } from 'react-redux';
import { Stack, StackItem } from '@patternfly/react-core';
import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import Failed from '../../PresentationalComponents/Loading/Failed';
import Breadcrumbs, { buildBreadcrumbs } from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { RULE_CATEGORIES, SEVERITY_MAP } from '../../AppConstants';

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
                'Systems Exposed',
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
        const options = { page_size: this.state.itemsPerPage, impacting: true };

        if (this.props.match.params.type.includes('-risk')) {
            const totalRisk = SEVERITY_MAP[this.props.match.params.type];
            this.setState({ filters: { total_risk: totalRisk }});
            options.total_risk = totalRisk;
        } else {
            this.setState({ filters: { category: RULE_CATEGORIES[this.props.match.params.type] }});
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

    setPage = (page, textInput) => {
        if (textInput) {
            this.setState(
                () => ({ page }),
                debounce(() => this.setPage(page), 800)
            );
        } else {
            this.setState(() => ({ page }));
            this.props.fetchRules({
                page: this.state.page,
                page_size: this.state.itemsPerPage, // eslint-disable-line camelcase
                impacting: true // eslint-disable-line camelcase
            });
        }
    };

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
                <PageHeader>
                    <Breadcrumbs
                        current={ this.parseUrlTitle(this.props.match.params.type) }
                        items={ buildBreadcrumbs(this.props.match, { breadcrumbs }) }
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
                        { rulesFetchStatus === 'failed' && (<Failed message={ `There was an error fetching rules list.` }/>) }
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
