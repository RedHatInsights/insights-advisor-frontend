/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Main, Pagination, routerParams } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';

import * as AppActions from '../../AppActions';
import { SYSTEM_TYPES } from '../../AppConstants';
import Filters from '../Filters/Filters';
import Loading from '../../PresentationalComponents/Loading/Loading';
import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';
import '@patternfly/patternfly/utilities/Display/display.scss';
import '@patternfly/patternfly/utilities/Flex/flex.scss';

const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/Cards/RulesCard.js'));

class ListRules extends Component {
    state = {
        summary: '',
        itemsPerPage: 10,
        page: 1,
        cards: []
    };

    componentDidMount () {
        this.props.setFilters({ page: 1, page_size: 10, impacting: true, text: undefined });
        this.props.setBreadcrumbs([{ title: 'Rules', navigate: '/rules' }]);
        this.props.fetchRules({ page: 1, page_size: 10, impacting: true });
    }

    componentDidUpdate (prevProps) {
        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.results;
            const cards = rules.map((value, key) =>
                <RulesCard
                    key={ key }
                    widget-id={ value }
                    ruleID={ value.rule_id }
                    category={ value.category.name }
                    description={ value.description }
                    summary={ value.summary }
                    impact={ value.impact.impact }
                    likelihood={ value.likelihood }
                    totalRisk={ value.severity }
                    riskOfChange={ value.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel).resolution_risk.risk }
                    ansible={ value.has_playbook }
                    hitCount={ value.impacted_systems_count }
                />
            );
            this.setState({ cards });
        }
    }

    toggleRulesWithHits = (showRulesWithHits) => {
        this.props.setFilters({ ...this.props.filters, impacting: showRulesWithHits });
        this.props.fetchRules({
            page_size: this.state.itemsPerPage,
            ...this.props.filters,
            impacting: showRulesWithHits
        });
    };

    setPage = (page) => {
        this.props.setFilters({ ...this.props.filters, page });
        this.props.fetchRules({ ...this.props.filters, page });
    };

    setPerPage = (itemsPerPage) => {
        this.props.setFilters({ ...this.props.filters, page_size: itemsPerPage });
        this.props.fetchRules({ ...this.props.filters, page_size: itemsPerPage });
    };

    render () {
        const { rulesFetchStatus, rules, filters } = this.props;
        return (
            <Main>
                <Stack gutter='md'>
                    <StackItem className='advisor-l-actions__filters'>
                        <Filters
                            externalFilters={ {
                                impacting: this.state.showRulesWithHits,
                                itemsPerPage: this.state.itemsPerPage,
                                page: this.state.page
                            } }
                            match={ this.props.match }
                            searchPlaceholder='Find a Rule'
                        >
                            <Checkbox
                                label="Show Rules With Hits"
                                isChecked={ filters.impacting }
                                onChange={ this.toggleRulesWithHits }
                                aria-label="InsightsRulesHideHits"
                                id="InsightsRulesHideHits"
                            />
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
                                page={ filters.page }
                                itemsPerPage={ filters.page_size }
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
    filters: PropTypes.object,
    setFilters: PropTypes.func
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
    setBreadcrumbs: (obj) => AppActions.setBreadcrumbs(obj),
    setFilters: (filters) => AppActions.setFilters(filters)
}, dispatch);

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListRules));
