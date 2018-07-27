import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './actions.scss';

import { Grid, GridItem } from '@patternfly/react-core';
import { PageHeader } from '@red-hat-insights/insights-frontend-components';
import { PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import { Section } from '@red-hat-insights/insights-frontend-components';
import SummaryChart from '../../PresentationalComponents/SummaryChart/SummaryChart.js';
import SummaryChartItem from '../../PresentationalComponents/SummaryChartItem/SummaryChartItem.js';

const sevNames = [ 'Low', 'Medium', 'High', 'Critical' ];

class Actions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            severity: [],
            total: 0
        };
    }

    componentDidMount() {
        // 1=INFO 2=WARN 3=ERROR 4=CRITICAL
        const response = {"total":9,"severity":{"info":0,"warn":2,"error":3,"critical":4},"category":{"Availability":1,"Security":0,"Stability":1,"Performance":0}};
        this.setState({ severity: [ response.severity.info, response.severity.warn, response.severity.error, response.severity.critical ] })
        this.setState({ total: response.total })
    }

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
                                <div className="pf-c-card__body ">
                                    <SummaryChart>
                                        <SummaryChartItem name={ sevNames[3] } numIssues={ this.state.severity[3] } totalIssues={ this.state.total } />
                                        <SummaryChartItem name={ sevNames[2] } numIssues={ this.state.severity[2] } totalIssues={ this.state.total } />
                                        <SummaryChartItem name={ sevNames[1] } numIssues={ this.state.severity[1] } totalIssues={ this.state.total } />
                                        <SummaryChartItem name={ sevNames[0] } numIssues={ this.state.severity[0] } totalIssues={ this.state.total } />
                                    </SummaryChart>
                                </div>
                            </div>
                        </GridItem>
                    </Grid>
                </Section>
            </React.Fragment>
        );
    }
}

export default withRouter(Actions);