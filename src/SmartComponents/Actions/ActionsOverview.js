import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardBody, CardHeader, Grid, GridItem } from '@patternfly/react-core';
import { Donut, Main, PageHeader, PageHeaderTitle, routerParams } from '@red-hat-insights/insights-frontend-components';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import '../../App.scss';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/SummaryChart/SummaryChart.js'));
const SummaryChartItem = asyncComponent(() => import('../../PresentationalComponents/SummaryChartItem/SummaryChartItem.js'));
const ConditionalLink = asyncComponent(() => import('../../PresentationalComponents/ConditionalLink/ConditionalLink.js'));

const sevNames = [ 'Low', 'Medium', 'High', 'Critical' ];
const typeNames = [ 'Availability', 'Security', 'Stability', 'Performance' ];
const typeLink = '/actions/';

class ActionsOverview extends Component {
    constructor (props) {
        super(props);
        this.state = {
            severity: [],
            total: 0,
            category: []
        };
    }

    componentDidMount () {
        this.props.fetchStats();
        this.props.setBreadcrumbs([{ title: 'Actions', navigate: '/actions' }]);
    }

    componentDidUpdate(prevProps) {
        if (this.props.stats !== prevProps.stats) {
            const rules = this.props.stats.rules;
            this.setState({ severity: [ rules.severity.Info, rules.severity.Warn, rules.severity.Error, rules.severity.Critical ]});
            this.setState({
                category: [ rules.category.Availability, rules.category.Security, rules.category.Stability, rules.category.Performance ]
            });
            this.setState({ total: rules.total });
        }
    }

    render () {
        const {
            statsFetchStatus
        } = this.props;
        const renderDonut = (donutValues) =>
            <Donut key='advisor-donut' values={ donutValues } link={ typeLink } totalLabel='issues' identifier='advisor-donut' withLegend/>;;
        let donutValues = [];
        let SummaryChartItems = [];

        this.state.severity.map((value, key) => {
            SummaryChartItems.push(
                <ConditionalLink
                    key={ key }
                    condition={ value }
                    wrap={ children =>
                        <Link to={ `/actions/${sevNames[key].toLowerCase()}-risk` }>
                            { children }
                        </Link>
                    }>
                    <SummaryChartItem
                        name={ sevNames[key] }
                        numIssues={ value }
                        totalIssues={ this.state.total }/>
                </ConditionalLink>
            );
        });

        this.state.category.map((value, key) => donutValues.push([ typeNames[key], value ]));

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Actions'/>
                </PageHeader>
                <Main>
                    { statsFetchStatus === 'fulfilled' && (
                        <Grid gutter='md' xl={ 4 } sm={ 6 }>
                            <GridItem>
                                <Card className='pf-t-light  pf-m-opaque-100'>
                                    <CardHeader>Category Summary</CardHeader>
                                    <CardBody>
                                        { renderDonut(donutValues) }
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem>
                                <Card className='pf-t-light  pf-m-opaque-100'>
                                    <CardHeader>Risk Summary</CardHeader>
                                    <CardBody>
                                        <SummaryChart>
                                            { SummaryChartItems }
                                        </SummaryChart>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    ) }
                    { statsFetchStatus === 'pending' && (<Loading />)
                    }
                </Main>
            </React.Fragment>
        );
    }
}

ActionsOverview.propTypes = {
    breadcrumbs: PropTypes.array,
    fetchStats: PropTypes.func,
    setBreadcrumbs: PropTypes.func,
    statsFetchStatus: PropTypes.string,
    stats: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    stats: state.AdvisorStore.stats,
    statsFetchStatus: state.AdvisorStore.statsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStats: (url) => dispatch(AppActions.fetchStats(url)),
    setBreadcrumbs: (obj) => dispatch(AppActions.setBreadcrumbs(obj))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(ActionsOverview));

