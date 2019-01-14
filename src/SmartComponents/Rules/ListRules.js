import React from 'react';
import { Main, Pagination, routerParams } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';

const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/Cards/RulesCard.js'));

class ListRules extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            summary: '',
            itemsPerPage: 10,
            page: 1,
            cards: []
        };
        this.setPage = this.setPage.bind(this);
        this.setPerPage = this.setPerPage.bind(this);
    }

    componentDidMount() {
        this.props.fetchRules({ page_size: this.state.itemsPerPage  }); // eslint-disable-line camelcase
        this.props.setBreadcrumbs([{ title: 'Rules', navigate: '/rules' }]);
    }

    componentDidUpdate(prevProps) {
        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.results;
            const cards = rules.map((value, key) =>
                <RulesCard
                    key = { key }
                    widget-id= { value }
                    ruleID = { value.rule_id }
                    category= { value.category.name }
                    description= { value.description }
                    summary= { value.summary }
                    impact = { value.impact.impact }
                    likelihood = { value.likelihood }
                    totalRisk = { value.severity }
                    riskOfChange = { value.resolution_risk }
                    ansible = { value.has_playbook }
                    hitCount = { value.impacted_systems_count }
                />
            );
            this.setState({ cards });
        }
    }

    setPage(page) {
        this.setState(() => ({ page }));
        this.props.fetchRules({ page, page_size: this.state.itemsPerPage }); // eslint-disable-line camelcase
    }

    setPerPage(itemsPerPage) {
        this.setState(() => ({ itemsPerPage }));
        this.props.fetchRules({ page_size: itemsPerPage  }); // eslint-disable-line camelcase
    }

    render() {
        const {
            rulesFetchStatus,
            rules
        } = this.props;

        return (
            <Main>
                <React.Fragment>
                    { rulesFetchStatus === 'fulfilled' && (
                        <React.Fragment>
                            { this.state.cards }
                            <Pagination
                                numberOfItems={ rules.count }
                                onPerPageSelect={ this.setPerPage }
                                page={ this.state.page }
                                onSetPage={ this.setPage }
                                itemsPerPage={ this.state.itemsPerPage }
                            />
                        </React.Fragment>
                    ) }
                    { rulesFetchStatus === 'pending' && (<Loading />) }
                </React.Fragment>

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
