import React from 'react';
import { Section, Pagination } from '@red-hat-insights/insights-frontend-components';

import rulesCardSkeleton from '../../PresentationalComponents/Skeletons/RulesCard/RulesCardSkeleton.js';
const RulesCard = rulesCardSkeleton(() => import('../../PresentationalComponents/RulesCard/RulesCard.js'));

import mockData from '../../../mockData/medium-risk.json';

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

    componentDidMount() {
        const response = JSON.parse(JSON.stringify(mockData));

        let cards = [];
        if (response.rules) {
            for (let i = 0; i < response.rules.length; i++) {
                cards.push(
                    <RulesCard
                        key = { i }
                        ruleID = { response.rules[i].rule_id }
                        category= { response.rules[i].category }
                        description= { response.rules[i].description }
                        summary= { response.rules[i].summary_html }
                        impact = { response.rules[i].rec_impact }
                        likelihood = { response.rules[i].rec_likelihood }
                        totalRisk = { response.rules[i].resolution_risk }
                        riskOfChange = { 3 }
                        ansible = { response.rules[i].ansible }
                        hitCount = { response.rules[i].hitCount }
                    />
                );

                this.setState({ cards });
            }
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
        const cards = this.limitCards();
        return (
            <Section type='content'>
                { cards }
                <Pagination
                    numberOfItems={ this.state.cards.length }
                    onPerPageSelect={ this.setPerPage }
                    page={ this.state.page }
                    onSetPage={ this.setPage }
                    itemsPerPage={ this.state.itemsPerPage }
                />
            </Section>
        );

    };
};

ListRules.displayName = 'list-rules';

export default ListRules;
