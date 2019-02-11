import React, { Component } from 'react';
import { Main, Pagination, routerParams } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';

import * as AppActions from '../../AppActions';
import { SYSTEM_TYPES } from '../../AppConstants';
import Loading from '../../PresentationalComponents/Loading/Loading';
import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';
import debounce from 'lodash/debounce';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';

const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/Cards/RulesCard.js'));

class ListRules extends Component {
    state = {
        showRulesWithHits: true,
        summary: '',
        itemsPerPage: 10,
        page: 1,
        cards: []
    };

    componentDidMount () {
        this.props.setBreadcrumbs([{ title: 'Rules', navigate: '/rules' }]);
        this.props.fetchRules({ page_size: this.state.itemsPerPage, impacting: this.state.showRulesWithHits }); // eslint-disable-line camelcase
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
        this.setState({ showRulesWithHits });
        this.props.fetchRules({ page_size: this.state.itemsPerPage, impacting: showRulesWithHits }); // eslint-disable-line camelcase
    };

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
                impacting: this.state.showRulesWithHits // eslint-disable-line camelcase
            });
        }
    };

    setPerPage = (itemsPerPage) => {
        this.setState(() => ({ itemsPerPage }));
        this.props.fetchRules({ page_size: itemsPerPage }); // eslint-disable-line camelcase
    };

    render () {
        const { rulesFetchStatus, rules } = this.props;
        return (
            <Main>
                <Stack gutter='md'>
                    <StackItem className='pf-u-display-flex pf-u-flex-direction-row-reverse'>
                        <Checkbox
                            label="Show Rules With Hits"
                            isChecked={ this.state.showRulesWithHits }
                            onChange={ this.toggleRulesWithHits }
                            aria-label="InsightsRulesHideHits"
                            id="InsightsRulesHideHits"
                        />
                    </StackItem>
                    <StackItem>
                        { rulesFetchStatus === 'fulfilled' &&
                            <>
                                { this.state.cards }
                                <Pagination
                                    numberOfItems={ rules.count }
                                    onPerPageSelect={ this.setPerPage }
                                    page={ this.state.page }
                                    onSetPage={ this.setPage }
                                    itemsPerPage={ this.state.itemsPerPage }
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
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object,
    setBreadcrumbs: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
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
