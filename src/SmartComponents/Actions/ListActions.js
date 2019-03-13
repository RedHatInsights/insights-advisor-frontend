/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { PageHeader, PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import PropTypes from 'prop-types';
import { capitalize } from '@patternfly/react-core';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import { RULE_CATEGORIES, SEVERITY_MAP } from '../../AppConstants';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';

class ViewActions extends Component {
    state = {
        urlFilters: {},
        impacting: true
    };

    async componentDidMount () {
        if (this.props.match.params.type.includes('-risk')) {
            const totalRisk = SEVERITY_MAP[this.props.match.params.type];
            this.setState({ urlFilters: { total_risk: totalRisk }});
        } else {
            this.setState({ urlFilters: { category: RULE_CATEGORIES[this.props.match.params.type] }});
        }
    }

    parseUrlTitle = (title = '') => {
        const parsedTitle = title.split('-');
        return parsedTitle.length > 1 ? `${capitalize(parsedTitle[0])} ${capitalize(parsedTitle[1])} Actions` : `${capitalize(parsedTitle[0])}`;
    };

    render () {
        const { urlFilters, impacting } = this.state;

        return (
            <React.Fragment>
                <PageHeader>
                    <Breadcrumbs
                        current={ this.parseUrlTitle(this.props.match.params.type) }
                        match={ this.props.match }
                    />
                    <PageHeaderTitle
                        title={ this.parseUrlTitle(this.props.match.params.type) }
                    />
                </PageHeader>
                <RulesTable impacting={ impacting } urlFilters={ urlFilters }/>
            </React.Fragment>
        );
    }
}

ViewActions.propTypes = {
    match: PropTypes.any
};

export default ViewActions;
