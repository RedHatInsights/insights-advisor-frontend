/* eslint camelcase: 0 */
import React, { Component } from 'react';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Gallery, GalleryItem, Title } from '@patternfly/react-core';
import { Main, PageHeader, PageHeaderTitle, routerParams } from '@red-hat-insights/insights-frontend-components';
import { global_primary_color_100 } from '@patternfly/react-tokens';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import '../../App.scss';
import MessageState from '../../PresentationalComponents/MessageState/MessageState';
import { ChartSpikeIcon } from '@patternfly/react-icons';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const OverviewDonut = asyncComponent(() => import('../../PresentationalComponents/Charts/OverviewDonut'));

class OverviewDashboard extends Component {
    state = {
        total: -1,
        category: []
    };

    async componentDidMount () {
        await insights.chrome.auth.getUser();
        this.props.fetchStatsRules();
        this.props.fetchStatsSystems();
        this.props.setBreadcrumbs([{ title: 'Overview', navigate: '/overview' }]);
    }

    componentDidUpdate (prevProps) {
        if (this.props.statsRules !== prevProps.statsRules) {
            const rules = this.props.statsRules;
            this.setState({
                category: [ rules.category.Availability, rules.category.Stability, rules.category.Performance, rules.category.Security ]
            });
            this.setState({ total: rules.total });
        }
    }

    render () {
        const {
            statsRulesFetchStatus, statsSystemsFetchStatus, statsRules, statsSystems
        } = this.props;
        const { category, total } = this.state;
        return <>
            <PageHeader>
                <PageHeaderTitle title='Overview'/>
            </PageHeader>
            { total !== 0 ?
                <>
                    <Main className='pf-m-light'>
                        <Gallery gutter="lg">
                            <GalleryItem>
                                <Title size='lg' headingLevel='h3'>Rule hits by severity</Title>
                                { statsRulesFetchStatus === 'fulfilled' && statsSystemsFetchStatus === 'fulfilled' ? (
                                    <SummaryChart rulesTotalRisk={ statsRules.total_risk } reportsTotalRisk={ statsSystems.total_risk }/>
                                )
                                    : (<Loading/>)
                                }
                            </GalleryItem>
                            <GalleryItem>
                                <Title size='lg' headingLevel='h3'>Rule hits by category</Title>
                                { statsRulesFetchStatus === 'fulfilled' ? (
                                    <OverviewDonut category={ category } className='pf-u-mt-md'/>
                                )
                                    : (<Loading/>) }
                            </GalleryItem>
                        </Gallery>
                    </Main>
                    <Main>&nbsp;</Main>
                </>
                : <Main>
                    <MessageState
                        iconStyle={ { color: global_primary_color_100.value } }
                        icon={ ChartSpikeIcon }
                        title='Get started with Red Hat Insights'
                        text={ `With predictive analytics, avoid problems and unplanned
                         downtime in your Red Hat environment. Red Hat Insights is
                        included with your Red Hat Enterprise Linux subscription` }
                    >
                        <Button component="a" href="https://access.redhat.com/insights/getting-started/" target="_blank" variant="primary">
                            Try it free
                        </Button>
                    </MessageState>
                </Main> }
        </>;
    }
}

OverviewDashboard.propTypes = {
    match: PropTypes.object,
    breadcrumbs: PropTypes.array,
    setBreadcrumbs: PropTypes.func,
    statsRulesFetchStatus: PropTypes.string,
    statsRules: PropTypes.object,
    fetchStatsRules: PropTypes.func,
    statsSystemsFetchStatus: PropTypes.string,
    statsSystems: PropTypes.object,
    fetchStatsSystems: PropTypes.func

};

const mapStateToProps = (state, ownProps) => ({
    breadcrumbs: state.AdvisorStore.breadcrumbs,
    statsRules: state.AdvisorStore.statsRules,
    statsRulesFetchStatus: state.AdvisorStore.statsRulesFetchStatus,
    statsSystems: state.AdvisorStore.statsSystems,
    statsSystemsFetchStatus: state.AdvisorStore.statsSystemsFetchStatus,
    ...ownProps
});

const mapDispatchToProps = dispatch => ({
    fetchStatsRules: (url) => dispatch(AppActions.fetchStatsRules(url)),
    fetchStatsSystems: (url) => dispatch(AppActions.fetchStatsSystems(url)),
    setBreadcrumbs: (obj) => dispatch(AppActions.setBreadcrumbs(obj))
});

export default routerParams(connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewDashboard));
