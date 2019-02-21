/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Main, Pagination, routerParams } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Checkbox, FormSelect, FormSelectOption, Stack, StackItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import debounce from 'lodash/debounce';

import * as AppActions from '../../AppActions';
import { SYSTEM_TYPES } from '../../AppConstants';
import Filters from '../../PresentationalComponents/Filters/Filters';
import Loading from '../../PresentationalComponents/Loading/Loading';
import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';
import './_rules.scss';

const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/Cards/RulesCard.js'));

class ListRules extends Component {
    state = {
        summary: '',
        pageSize: 10,
        page: 1,
        cards: [],
        impacting: true,
        totalRiskSort: ''
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.setBreadcrumbs([{ title: 'Rules', navigate: '/rules' }]);
        this.props.fetchRules({ page: this.state.page, page_size: this.state.pageSize, impacting: this.state.impacting });
    }

    componentDidUpdate (prevProps) {
        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.results;
            const cards = rules.map((value, key) => {
                const resolution_risk = value.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel);
                return <RulesCard
                    key={ key }
                    widget-id={ value }
                    ruleID={ value.rule_id }
                    category={ value.category.name }
                    description={ value.description }
                    summary={ value.summary }
                    impact={ value.impact.impact }
                    likelihood={ value.likelihood }
                    totalRisk={ value.total_risk }
                    riskOfChange={ resolution_risk ? resolution_risk.resolution_risk.risk : 0 }
                    ansible={ value.has_playbook }
                    hitCount={ value.impacted_systems_count }
                />;
            });
            this.setState({ cards });
        }
    }

    toggleRulesWithHits = (showRulesWithHits) => {
        this.setState({ impacting: showRulesWithHits });
        this.props.fetchRules({
            ...this.props.filters,
            page_size: this.state.pageSize,
            sort: this.state.totalRiskSort,
            impacting: showRulesWithHits
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
                sort: this.state.totalRiskSort
            });
        }
    };

    setPerPage = (pageSize) => {
        this.setState({ pageSize });
        this.props.fetchRules({
            ...this.props.filters,
            page: 1,
            page_size: pageSize,
            impacting: this.state.impacting,
            sort: this.state.totalRiskSort
        });
    };

    onTotalRiskSortChange = (totalRiskSort) => {
        this.setState({ totalRiskSort });
        this.props.fetchRules({
            ...this.props.filters,
            page: 1,
            page_size: this.state.pageSize,
            impacting: this.state.impacting,
            sort: totalRiskSort
        });
    }

    totalRiskSortOptions = [
        { value: '', label: 'Sort By Total Risk', disabled: true },
        { value: 'total_risk', label: 'Ascending', disabled: false },
        { value: '-total_risk', label: 'Descending', disabled: false }
    ]

    render () {
        const { rulesFetchStatus, rules } = this.props;
        const { pageSize, page, impacting } = this.state;
        return (
            <Main>
                <Stack gutter='md'>
                    <StackItem className='advisor-l-actions__filters'>
                        <Filters
                            fetchAction={ (filters) => this.props.fetchRules({ ...filters, pageSize, page, impacting }) }
                            searchPlaceholder='Find a Rule'
                            resultsCount={ rules.count }
                        >
                            <ToolbarGroup>
                                <ToolbarItem>
                                    <FormSelect
                                        value={ this.state.totalRiskSort }
                                        onChange={ this.onTotalRiskSortChange }
                                        aria-label='Total Risk Sort'
                                    >
                                        { this.totalRiskSortOptions.map((option, index) => (
                                            <FormSelectOption
                                                isDisabled={ option.disabled }
                                                key={ index }
                                                value={ option.value }
                                                label={ option.label }
                                            />
                                        )) }
                                    </FormSelect>
                                </ToolbarItem>
                            </ToolbarGroup>
                            <ToolbarGroup className='rulesHideHitsGroup'>
                                <ToolbarItem>
                                    <Checkbox
                                        label="Show Rules With Hits"
                                        isChecked={ impacting }
                                        onChange={ this.toggleRulesWithHits }
                                        aria-label="InsightsRulesHideHits"
                                        id="InsightsRulesHideHits"
                                    />
                                </ToolbarItem>
                            </ToolbarGroup>
                        </Filters>
                    </StackItem>
                    <StackItem>
                        { rulesFetchStatus === 'fulfilled' &&
                        <>
                            { this.state.cards }
                            <Pagination
                                numberOfItems={ rules.count }
                                onPerPageSelect={ this.setPerPage }
                                onSetPage={ this.setPage }
                                page={ page }
                                itemsPerPage={ pageSize }
                            />
                        </>
                        }
                        { rulesFetchStatus === 'pending' && (<Loading/>) }
                    </StackItem>
                </Stack>
            </Main>
        );
    };
}

ListRules.displayName = 'list-rules';

ListRules.propTypes = {
    breadcrumbs: PropTypes.array,
    fetchRules: PropTypes.func,
    match: PropTypes.object,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object,
    setBreadcrumbs: PropTypes.func,
    filters: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    filters: state.AdvisorStore.filters,
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => bindActionCreators({
    fetchRules: (url) => AppActions.fetchRules(url),
    setBreadcrumbs: (obj) => AppActions.setBreadcrumbs(obj)
}, dispatch);

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListRules));
