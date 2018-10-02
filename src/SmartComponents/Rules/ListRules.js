import React from 'react';
import { Main, Pagination } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';

import * as AppActions from '../../AppActions';

import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';
const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/RulesCard/RulesCard.js'));
import Loading from '../../PresentationalComponents/Loading/Loading';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class ListRules extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            summary: '',
            itemsPerPage: 10,
            page: 1,
            cards: [],
            things: []
        };
        this.limitCards = this.limitCards.bind(this);
        this.setPage = this.setPage.bind(this);
        this.setPerPage = this.setPerPage.bind(this);
    }

    // TODO: implement server supported pagination in this component, page_size 1000? wtf yo 😏
    componentDidMount() {
        this.props.fetchRules({ page_size: 1000 }); // eslint-disable-line camelcase
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
                        ruleID = { rules[key].rule_id }
                        category= { rules[key].category.name }
                        description= { rules[key].description }
                        summary= { rules[key].summary_html }
                        // TODO: random numbers gotta go once these attributes are present on api 😏
                        impact = { rules[key].rec_impact || getRandomInt(4) }
                        likelihood = { rules[key].rec_likelihood || getRandomInt(4) }
                        totalRisk = { rules[key].resolution_risk || getRandomInt(4) }
                        riskOfChange = { rules[key].risk_of_change || getRandomInt(4) }
                        ansible = { rules[key].ansible }
                        hitCount = { rules[key].hitCount || getRandomInt(100) }
                    />
                );
            }
            );
            this.setState({ cards });

        }
    }

    setPage(page) {
        this.setState({
            ...this.state,
            page
        });
    }

    setPerPage(amount) {
        this.setState({
            ...this.state,
            itemsPerPage: amount
        });
    }

    limitCards() {
        const { page, itemsPerPage } = this.state;
        const numberOfItems = this.state.cards.length;
        const lastPage = Math.ceil(numberOfItems / itemsPerPage);
        const lastIndex = page === lastPage ? numberOfItems : page * itemsPerPage;
        const firstIndex = page === 1 ? 0 : page * itemsPerPage - itemsPerPage;
        return this.state.cards.slice(firstIndex, lastIndex);
    }

    render() {
        const {
            rulesFetchStatus
        } = this.props;
        const cards = this.limitCards();
        return (
            <Main>
                { rulesFetchStatus === 'fulfilled' && (
                    <React.Fragment>
                        { cards }
                        <Pagination
                            numberOfItems={ this.state.cards.length }
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
    AdvisorStore: PropTypes.object
};

ListRules.propTypes = {
    fetchRules: PropTypes.func,
    rulesFetchStatus: PropTypes.string,
    rules: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    rules: state.AdvisorStore.rules,
    rulesFetchStatus: state.AdvisorStore.rulesFetchStatus,
    ...state,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchRules: (url) => dispatch(AppActions.fetchRules(url))
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ListRules));
