import React, { Component } from 'react';
import asyncComponent from '../../Utilities/asyncComponent';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Gallery, GalleryItem, Title } from '@patternfly/react-core';
import { Main, PageHeader, PageHeaderTitle, routerParams } from '@red-hat-insights/insights-frontend-components';

import * as AppActions from '../../AppActions';
import Loading from '../../PresentationalComponents/Loading/Loading';
import '../../App.scss';

const SummaryChart = asyncComponent(() => import('../../PresentationalComponents/Charts/SummaryChart/SummaryChart'));
const OverviewDonut = asyncComponent(() => import('../../PresentationalComponents/Charts/OverviewDonut'));

class OverviewDashboard extends Component {
    state = {
        rulesTotalRisk: {},
        reportsTotalRisk: {},
        total: 0,
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

        if (this.props.statsSystems !== prevProps.statsSystems) {
            this.setState({ rulesTotalRisk: this.props.statsRules.total_risk, reportsTotalRisk: this.props.statsSystems.total_risk });
        }
    }

    render () {
        const {
            statsRulesFetchStatus, statsSystemsFetchStatus
        } = this.props;
        const { rulesTotalRisk, reportsTotalRisk, category } = this.state;
        return <>
            <PageHeader>
                <PageHeaderTitle title='Overview'/>
            </PageHeader>
            <Main className='pf-m-light'>
                <Gallery gutter="lg">
                    <GalleryItem>
                        <Title size='lg' headingLevel='h3'>Rule hits by severity</Title>
                        { statsRulesFetchStatus === 'fulfilled' && statsSystemsFetchStatus === 'fulfilled' ? (
                            <SummaryChart rulesTotalRisk={ rulesTotalRisk } reportsTotalRisk={ reportsTotalRisk }/>
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
