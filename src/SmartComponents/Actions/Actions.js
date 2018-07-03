import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './actions.scss';

import { PageHeader } from '@red-hat-insights/insights-frontend-components';
import { PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';

/**
 * A smart component that handles all the api calls and data needed by the dumb components.
 * Smart components are usually classes.
 *
 * https://reactjs.org/docs/components-and-props.html
 * https://medium.com/@thejasonfile/dumb-components-and-smart-components-e7b33a698d43
 */
class Actions extends Component {

    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Actions'/>
                </PageHeader>
            </React.Fragment>
        );
    }
}

export default withRouter(Actions);
