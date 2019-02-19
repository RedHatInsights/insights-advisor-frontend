/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { Main, Pagination, routerParams } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';
import debounce from 'lodash/debounce';

import * as AppActions from '../../AppActions';
import { SYSTEM_TYPES } from '../../AppConstants';
import Filters from '../../PresentationalComponents/Filters/Filters';
import Loading from '../../PresentationalComponents/Loading/Loading';
import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';
import '@patternfly/patternfly/utilities/Display/display.scss';
import '@patternfly/patternfly/utilities/Flex/flex.scss';

const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/Cards/RulesCard.js'));

class ListRules extends Component {
    state = {
        summary: '',
        pageSize: 10,
        page: 1,
        cards: [],
        impacting: true
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.setBreadcrumbs([{ title: 'Rules', navigate: '/rules' }]);
        this.props.fetchRules({ page: this.state.page, page_size: this.state.pageSize, impacting: this.state.impacting });
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
                    totalRisk={ value.total_risk }
                    riskOfChange={ value.resolution_set.find(resolution => resolution.system_type === SYSTEM_TYPES.rhel).resolution_risk.risk }
                    ansible={ value.has_playbook }
                    hitCount={ value.impacted_systems_count }
                />
            );
            this.setState({ cards });
        }
    }

    toggleRulesWithHits = (showRulesWithHits) => {
        this.setState({ impacting: showRulesWithHits });
        this.props.fetchRules({
            ...this.props.filters,
            page_size: this.state.pageSize,
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
            this.props.fetchRules({ ...this.props.filters, page: newPage, page_size: this.state.pageSize, impacting: this.state.impacting });
        }
    };

    setPerPage = (pageSize) => {
        this.setState({ pageSize });
        this.props.fetchRules({ ...this.props.filters, page: 1, page_size: pageSize, impacting: this.state.impacting });
    };

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
                            <Checkbox
                                label="Show Rules With Hits"
                                isChecked={ impacting }
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
