import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './actions.scss';

import { Grid, GridItem } from '@patternfly/react-core';
import { PageHeader } from '@red-hat-insights/insights-frontend-components';
import { PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import { Section } from '@red-hat-insights/insights-frontend-components';
import SummaryChart from '../../PresentationalComponents/SummaryChart/SummaryChart.js';

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

                <Section type='content'>
                    <Grid gutter='md'>
                        <GridItem span={4}>Donut</GridItem>
                        <GridItem span={4}>
                            <div className="pf-c-card ">
                                <div className="pf-c-card__header ">Risk Summary</div>
                                <div className="pf-c-card__body "><SummaryChart /></div>
                            </div>
                        </GridItem>
                    </Grid>
                </Section>
            </React.Fragment>
        );
    }
}

export default withRouter(Actions);
