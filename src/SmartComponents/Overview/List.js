/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import PropTypes from 'prop-types';
import { capitalize } from '@patternfly/react-core';

import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTable';

class OverviewList extends Component {
    parseUrlTitle = (title = '') => {
        const parsedTitle = title.split('-');
        return parsedTitle.length > 1 ? `${capitalize(parsedTitle[0])} ${capitalize(parsedTitle[1])} Actions` : `${capitalize(parsedTitle[0])}`;
    };

    render () {
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
                <RulesTable/>
            </React.Fragment>
        );
    }
}

OverviewList.propTypes = {
    match: PropTypes.any
};

export default OverviewList;
