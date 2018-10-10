import React from 'react';
import { Main, Pagination } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';

const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/RulesCard/RulesCard.js'));

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
    }

    componentDidUpdate(prevProps) {
        const getRandomInt = (max)  => Math.floor(Math.random() * Math.floor(max)) + 1;

        if (this.props.rules !== prevProps.rules) {
            const rules = this.props.rules.results;
            let cards = [];
            rules.map((value, key) => {
                cards.push(
                    <RulesCard
                        key = { key }
                        widget-id= { value }
                        ruleID = { value.rule_id }
                        category= { value.category.name }
                        description= { value.description }
                        summary= { value.summary_html }
                        // TODO: random numbers gotta go once these attributes are present on api 😏
                        impact = { value.rec_impact || getRandomInt(4) }
                        likelihood = { value.rec_likelihood || getRandomInt(4) }
                        totalRisk = { value.resolution_risk || getRandomInt(4) }
                        riskOfChange = { value.risk_of_change || getRandomInt(4) }
                        ansible = { value.ansible }
                        hitCount = { value.hitCount || getRandomInt(100) }
                    />
                );
            });
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
            </Main>
        );

    };
}

ListRules.displayName = 'list-rules';

ListRules.propTypes = {
    fetchRules: PropTypes.func,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRules: (url) => dispatch(AppActions.fetchRules(url))
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListRules));
