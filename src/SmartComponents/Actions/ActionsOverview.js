import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';
import '../../App.scss';

import { Card, CardHeader, CardBody, Grid, GridItem } from '@patternfly/react-core';
import {
    Section
} from '@red-hat-insights/insights-frontend-components';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/SummaryChart/SummaryChart.js'));
const SummaryChartItem = asyncComponent(() => import('../../PresentationalComponents/SummaryChartItem/SummaryChartItem.js'));
const ConditionalLink = asyncComponent(() => import('../../PresentationalComponents/ConditionalLink/ConditionalLink.js'));

const sevNames = ['Low', 'Medium', 'High', 'Critical'];

//const ConditionalLink = ({ condition, wrap, children }) => condition ? wrap(children) : children;

class ActionsOverview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            severity: [],
            total: 0
        };
    }

    componentDidMount() {
        // 1=INFO 2=WARN 3=ERROR 4=CRITICAL
        const response = {
            total: 9,
            severity: { info: 0, warn: 2, error: 3, critical: 4 },
            category: { Availability: 1, Security: 0, Stability: 1, Performance: 0 }
        };
        this.setState({ severity: [response.severity.info, response.severity.warn, response.severity.error, response.severity.critical] });
        this.setState({ total: response.total });
    }

    render() {

        let SummaryChartItems = [];
        for (let i = this.state.severity.length - 1; i >= 0; i--) {
            SummaryChartItems.push(
                <ConditionalLink
                    key={i}
                    condition={ this.state.severity[i] }
                    wrap={children =>
                        <Link to= { `/actions/${sevNames[i].toLowerCase()}` }>
                            {children}
                        </Link>
                    }>
                    <SummaryChartItem
                        name={ sevNames[i] }
                        numIssues={ this.state.severity[i] }
                        totalIssues={ this.state.total }/>
                </ConditionalLink>
            );
        }

        return (
            <React.Fragment>
                <Section type='content'>
                    <Grid gutter='md'>
                        <GridItem span={4}>Donut</GridItem>
                        <GridItem span={4}>
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
                </Section>
            </React.Fragment>
        );
    }
}

export default withRouter(ActionsOverview);
