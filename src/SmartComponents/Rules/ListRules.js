import React from 'react';
import { Section } from '@red-hat-insights/insights-frontend-components';

import asyncComponent from '../../PresentationalComponents/RulesCard/RulesCardLoader';
const RulesCard = asyncComponent(() => import('../../PresentationalComponents/RulesCard/RulesCard.js'));

import mockData from '../../../mockData/medium-risk.json';

class ListRules extends React.Component {

    render() {
        const response = JSON.parse(JSON.stringify(mockData));

        let RulesCards = [];
        for (let i = 0; i < response.rules.length; i++) {
            RulesCards.push(
                <RulesCard
                    key = { i }
                    category= { response.rules[i].category }
                    id= { response.rules[i].rule_id }
                    summary= { response.rules[i].summary_html }
                    impact = { response.rules[i].rec_impact }
                    likelihood = { response.rules[i].rec_likelihood }
                    totalRisk = { response.rules[i].resolution_risk }
                    riskOfChange = { 3 }
                    ansible = { response.rules[i].ansible }
                    hitCount = { response.rules[i].hitCount }
                />
            );
        }

        return (
            <Section type='content'>
                { RulesCards }
            </Section>
        );

    };
};

ListRules.displayName = 'list-rules';

export default ListRules;
