import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';
import '../../App.scss';

import { Card, CardHeader, CardBody, Grid, GridItem } from '@patternfly/react-core';
import { PageHeader, PageHeaderTitle, Donut, Main } from '@red-hat-insights/insights-frontend-components';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/SummaryChart/SummaryChart.js'));
const SummaryChartItem = asyncComponent(() => import('../../PresentationalComponents/SummaryChartItem/SummaryChartItem.js'));
const ConditionalLink = asyncComponent(() => import('../../PresentationalComponents/ConditionalLink/ConditionalLink.js'));

const sevNames = [ 'Low', 'Medium', 'High', 'Critical' ];
const typeNames = [ 'Availability', 'Security', 'Stability', 'Performance' ];
const typeLink = '/actions/';

class ActionsOverview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            severity: [],
            total: 0,
            category: []
        };
    }

    componentDidMount() {
        const response = {
            total: 9,
            severity: { info: 0, warn: 2, error: 3, critical: 4 },
            category: { availability: 7, security: 2, stability: 4, performance: 10 }
        };
        this.setState({ severity: [ response.severity.info, response.severity.warn, response.severity.error, response.severity.critical ] });
        this.setState({
            category: [ response.category.availability, response.category.security, response.category.stability, response.category.performance ] });
        this.setState({ total: response.total });
    }

    render() {

        let SummaryChartItems = [];
        for (let i = this.state.severity.length - 1; i >= 0; i--) {
            SummaryChartItems.push(
                <ConditionalLink
                    key={ i }
                    condition={ this.state.severity[i] }
                    wrap={ children =>
                        <Link to= { `/actions/${sevNames[i].toLowerCase()}` }>
                            { children }
                        </Link>
                    }>
                    <SummaryChartItem
                        name={ sevNames[i] }
                        numIssues={ this.state.severity[i] }
                        totalIssues={ this.state.total }/>
                </ConditionalLink>
            );
        }

        let donutValues = [];
        let renderDonut = [];

        // Returns NaN while wating for data to load
        if (this.state.category[1]) {
            for (let i = 0; i <= this.state.category.length - 1; i++) {
                donutValues.push([ typeNames[i], this.state.category[i] ]);
            }

            renderDonut.push(
                <Donut key='advisor-donut' values={ donutValues } link={ typeLink } totalLabel='issues' identifier='advisor-donut' withLegend/>
            );
        }

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Actions'/>
                </PageHeader>
                <Main>
                    <Grid gutter='md' xl={ 4 } sm={ 6 }>
                        <GridItem>
                            <Card>
                                <CardHeader>Category Summary</CardHeader>
                                <CardBody>
                                    { renderDonut }
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem>
                            <Card>
                                <CardHeader>Risk Summary</CardHeader>
                                <CardBody>
                                    <SummaryChart>
                                        { SummaryChartItems }
                                    </SummaryChart>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(ActionsOverview);
